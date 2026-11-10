create table if not exists public.childcare_availability_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.childcare_availability_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  override_date date not null,
  start_time time,
  end_time time,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  check (
    (is_available and start_time is not null and end_time is not null and start_time < end_time)
    or (not is_available and ((start_time is null and end_time is null) or start_time < end_time))
  )
);

create table if not exists public.childcare_availability_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  minimum_duration_minutes integer not null default 60 check (minimum_duration_minutes between 30 and 720),
  travel_buffer_minutes integer not null default 0 check (travel_buffer_minutes between 0 and 240),
  updated_at timestamptz not null default now()
);

create index if not exists childcare_availability_rules_user_weekday_idx
  on public.childcare_availability_rules (user_id, weekday);
create index if not exists childcare_availability_overrides_user_date_idx
  on public.childcare_availability_overrides (user_id, override_date);

alter table public.childcare_availability_rules enable row level security;
alter table public.childcare_availability_overrides enable row level security;
alter table public.childcare_availability_settings enable row level security;

create policy "Owners manage weekly availability"
  on public.childcare_availability_rules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners manage date overrides"
  on public.childcare_availability_overrides for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners manage availability settings"
  on public.childcare_availability_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.get_childcare_availability(
  p_start_date date,
  p_end_date date
)
returns table (
  availability_date date,
  start_time time,
  end_time time,
  minimum_duration_minutes integer,
  travel_buffer_minutes integer
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if p_start_date is null or p_end_date is null
    or p_end_date < p_start_date
    or p_end_date - p_start_date > 90 then
    raise exception 'Availability range must be between 1 and 91 days.'
      using errcode = '22023';
  end if;

  return query
  with days as (
    select generated_date::date as availability_date
    from generate_series(p_start_date, p_end_date, interval '1 day') as generated_dates(generated_date)
  ),
  selected_windows as (
    select
      override.override_date as availability_date,
      tsrange(
        override.override_date + override.start_time,
        override.override_date + override.end_time,
        '[)'
      ) as time_range
    from public.childcare_availability_overrides as override
    join days on days.availability_date = override.override_date
    where override.is_available

    union all

    select
      days.availability_date,
      tsrange(
        days.availability_date + rule.start_time,
        days.availability_date + rule.end_time,
        '[)'
      )
    from days
    join public.childcare_availability_rules as rule
      on rule.weekday = extract(dow from days.availability_date)::smallint
    where not exists (
      select 1
      from public.childcare_availability_overrides as override
      where override.override_date = days.availability_date
        and override.is_available
    )
  ),
  available_ranges as (
    select availability_date, range_agg(time_range) as time_ranges
    from selected_windows
    group by availability_date
  ),
  blocked_ranges as (
    select
      override.override_date as availability_date,
      range_agg(
        case
          when override.start_time is null then tsrange(
            override.override_date::timestamp,
            override.override_date::timestamp + interval '1 day',
            '[)'
          )
          else tsrange(
            override.override_date + override.start_time,
            override.override_date + override.end_time,
            '[)'
          )
        end
      ) as time_ranges
    from public.childcare_availability_overrides as override
    join days on days.availability_date = override.override_date
    where not override.is_available
    group by override.override_date
  ),
  effective_windows as (
    select
      available_ranges.availability_date,
      window.time_range
    from available_ranges
    left join blocked_ranges using (availability_date)
    cross join lateral unnest(
      available_ranges.time_ranges - coalesce(blocked_ranges.time_ranges, '{}'::tsmultirange)
    ) as window(time_range)
  ),
  preferences as (
    select
      coalesce((
        select setting.minimum_duration_minutes
        from public.childcare_availability_settings as setting
        order by setting.updated_at desc
        limit 1
      ), 60) as minimum_duration_minutes,
      coalesce((
        select setting.travel_buffer_minutes
        from public.childcare_availability_settings as setting
        order by setting.updated_at desc
        limit 1
      ), 0) as travel_buffer_minutes
  )
  select
    effective_windows.availability_date,
    lower(effective_windows.time_range)::time,
    upper(effective_windows.time_range)::time,
    preferences.minimum_duration_minutes,
    preferences.travel_buffer_minutes
  from effective_windows
  cross join preferences
  where extract(epoch from (upper(effective_windows.time_range) - lower(effective_windows.time_range))) / 60
    >= preferences.minimum_duration_minutes + preferences.travel_buffer_minutes
  order by effective_windows.availability_date, lower(effective_windows.time_range);
end;
$$;

revoke all on function public.get_childcare_availability(date, date) from public;
grant execute on function public.get_childcare_availability(date, date) to anon, authenticated;
