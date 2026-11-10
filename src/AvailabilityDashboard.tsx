import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, Clock3, Plus, Trash2 } from "lucide-react";
import AvailabilityCalendar, { dateKey } from "./AvailabilityCalendar";
import type { AvailabilityWindow } from "./AvailabilityCalendar";
import { supabase } from "./lib/supabase";

type WeeklyRule = AvailabilityWindow & {
  id: string;
  weekday: number;
};

type DateOverride = {
  id: string;
  override_date: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
};

type AvailabilitySettings = {
  minimum_duration_minutes: number;
  travel_buffer_minutes: number;
};

type OverrideMode = "available" | "blocked_hours" | "blocked_day";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const defaultSettings = { minimum_duration_minutes: 60, travel_buffer_minutes: 0 };
const todayPhoenix = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix" }).format(new Date());

function timeValue(value: string) {
  return value.slice(0, 5);
}

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function formatTime(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${String(mins).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

function getRemainingWindows(
  date: string,
  rules: WeeklyRule[],
  overrides: DateOverride[],
): AvailabilityWindow[] {
  const dayOverrides = overrides.filter((override) => override.override_date === date);
  if (dayOverrides.some((override) => !override.is_available && !override.start_time)) return [];

  const addedWindows = dayOverrides.filter(
    (override): override is DateOverride & { start_time: string; end_time: string } =>
      override.is_available && Boolean(override.start_time && override.end_time),
  );
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const windows = addedWindows.length
    ? addedWindows
    : rules.filter((rule) => rule.weekday === weekday);
  const blocks = dayOverrides.flatMap((override) => {
    if (override.is_available || !override.start_time || !override.end_time) return [];
    return [{
      start: minutes(timeValue(override.start_time)),
      end: minutes(timeValue(override.end_time)),
    }];
  });

  return windows.flatMap((window) => {
    let remaining = [{ start: minutes(timeValue(window.start_time)), end: minutes(timeValue(window.end_time)) }];
    for (const block of blocks) {
      remaining = remaining.flatMap((range) => {
        if (block.end <= range.start || block.start >= range.end) return [range];
        const pieces = [];
        if (block.start > range.start) pieces.push({ start: range.start, end: block.start });
        if (block.end < range.end) pieces.push({ start: block.end, end: range.end });
        return pieces;
      });
    }
    return remaining.map(({ start, end }) => ({
      start_time: `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`,
      end_time: `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`,
    }));
  });
}

export default function AvailabilityDashboard() {
  const [rules, setRules] = useState<WeeklyRule[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [settings, setSettings] = useState<AvailabilitySettings>(defaultSettings);
  const [weekday, setWeekday] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [overrideDate, setOverrideDate] = useState(todayPhoenix);
  const [overrideMode, setOverrideMode] = useState<OverrideMode>("available");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayPhoenix);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAvailability() {
    if (!supabase) return;
    setLoading(true);
    setMessage("");
    const [rulesResult, overridesResult, settingsResult] = await Promise.all([
      supabase.from("childcare_availability_rules").select("id,weekday,start_time,end_time").order("weekday").order("start_time"),
      supabase.from("childcare_availability_overrides").select("id,override_date,start_time,end_time,is_available").gte("override_date", todayPhoenix()).order("override_date").order("start_time"),
      supabase.from("childcare_availability_settings").select("minimum_duration_minutes,travel_buffer_minutes").maybeSingle(),
    ]);
    const error = rulesResult.error ?? overridesResult.error ?? settingsResult.error;
    if (error) {
      setMessage("Availability could not be loaded. Apply the availability migration and confirm your admin access.");
    } else {
      setRules((rulesResult.data ?? []) as WeeklyRule[]);
      setOverrides((overridesResult.data ?? []) as DateOverride[]);
      if (settingsResult.data) setSettings(settingsResult.data as AvailabilitySettings);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadAvailability();
  }, []);

  const availabilityByDate = new Map<string, AvailabilityWindow[]>();
  const blockedDates = new Set<string>();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
    const dayOverrides = overrides.filter((override) => override.override_date === key);
    if (dayOverrides.some((override) => !override.is_available && !override.start_time)) blockedDates.add(key);
    availabilityByDate.set(key, getRemainingWindows(key, rules, overrides));
  }
  const selectedWindows = availabilityByDate.get(selectedDate) ?? [];
  const selectedChanges = overrides.filter((override) => override.override_date === selectedDate);

  function focusDate(date: string) {
    const [year, monthIndex] = date.split("-").map(Number);
    setSelectedDate(date);
    setMonth(new Date(year, monthIndex - 1, 1));
  }

  async function addWeeklyWindow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || startTime >= endTime) {
      setMessage("Choose an end time after the start time.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("childcare_availability_rules").insert({
      weekday: Number(weekday),
      start_time: startTime,
      end_time: endTime,
    });
    setSaving(false);
    if (error) setMessage("That weekly window could not be saved. Check your database setup.");
    else {
      await loadAvailability();
      setMessage("Weekly availability saved.");
    }
  }

  async function saveOverride(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasTime = overrideMode !== "blocked_day";
    if (!supabase || !overrideDate || overrideDate < todayPhoenix() || (hasTime && startTime >= endTime)) {
      setMessage("Choose a date and a valid time range.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("childcare_availability_overrides").insert({
      override_date: overrideDate,
      start_time: hasTime ? startTime : null,
      end_time: hasTime ? endTime : null,
      is_available: overrideMode === "available",
    });
    setSaving(false);
    if (error) setMessage("The date change could not be saved. Check your database setup.");
    else {
      focusDate(overrideDate);
      await loadAvailability();
      setMessage(overrideMode === "available" ? "Date-specific hours saved." : overrideMode === "blocked_day" ? "Day blocked." : "Hours blocked.");
    }
  }

  async function updateRule(rule: WeeklyRule, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    const nextStart = String(form.get("start_time") ?? "");
    const nextEnd = String(form.get("end_time") ?? "");
    if (!nextStart || !nextEnd || nextStart >= nextEnd) {
      setMessage("Choose an end time after the start time.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("childcare_availability_rules").update({
      start_time: nextStart,
      end_time: nextEnd,
    }).eq("id", rule.id);
    setSaving(false);
    if (error) setMessage("The weekly window could not be updated.");
    else {
      await loadAvailability();
      setMessage("Weekly window updated.");
    }
  }

  async function updateOverride(override: DateOverride, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    const date = String(form.get("override_date") ?? "");
    const modeValue = String(form.get("mode") ?? "");
    if (modeValue !== "available" && modeValue !== "blocked_hours" && modeValue !== "blocked_day") {
      setMessage("Choose a valid date change.");
      return;
    }
    const mode = modeValue as OverrideMode;
    const hasTime = mode !== "blocked_day";
    const nextStart = hasTime ? String(form.get("start_time") ?? "") : "";
    const nextEnd = hasTime ? String(form.get("end_time") ?? "") : "";
    if (!date || date < todayPhoenix() || (hasTime && (!nextStart || !nextEnd || nextStart >= nextEnd))) {
      setMessage("Choose a date and a valid time range.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("childcare_availability_overrides").update({
      override_date: date,
      start_time: hasTime ? nextStart : null,
      end_time: hasTime ? nextEnd : null,
      is_available: mode === "available",
    }).eq("id", override.id);
    setSaving(false);
    if (error) setMessage("The date window could not be updated.");
    else {
      focusDate(date);
      await loadAvailability();
      setMessage("Date change updated.");
    }
  }

  async function removeRow(table: "childcare_availability_rules" | "childcare_availability_overrides", id: string) {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setSaving(false);
    if (error) setMessage("That availability entry could not be removed.");
    else {
      await loadAvailability();
      setMessage("Availability entry removed.");
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setSaving(false);
      setMessage("Your admin session could not be verified. Please sign in again.");
      return;
    }
    const { error } = await supabase.from("childcare_availability_settings").upsert({
      user_id: userData.user.id,
      minimum_duration_minutes: settings.minimum_duration_minutes,
      travel_buffer_minutes: settings.travel_buffer_minutes,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setMessage(error ? "Scheduling settings could not be saved." : "Scheduling settings saved.");
  }

  return (
    <section className="availability-dashboard" aria-label="Availability management">
      <div className="availability-title">
        <div><span className="eyebrow"><span className="eyebrow-dot" /> Your schedule</span><h3>Availability</h3></div>
        <button type="button" className="availability-refresh" onClick={() => void loadAvailability()} disabled={loading}>
          <CalendarDays size={15} /> Refresh
        </button>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}

      <section className="availability-calendar-panel" aria-label="Monthly availability calendar">
        <AvailabilityCalendar
          month={month}
          selectedDate={selectedDate}
          minimumDate={todayPhoenix()}
          availabilityByDate={availabilityByDate}
          blockedDates={blockedDates}
          allowUnavailableSelection
          onSelectDate={(date) => {
            setSelectedDate(date);
            setOverrideDate(date);
          }}
          onMonthChange={setMonth}
        />
        <div className="selected-day-summary">
          <h4>{selectedDate ? new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(new Date(`${selectedDate}T12:00:00`)) : "Choose a date"}</h4>
          {loading ? <p>Loading your schedule…</p> : selectedWindows.length === 0
            ? <p>No available hours. Add hours below or set a date-specific window.</p>
            : <ul>{selectedWindows.map((window, index) => <li key={`${window.start_time}-${index}`}>{formatTime(window.start_time)} – {formatTime(window.end_time)}</li>)}</ul>}
          {selectedChanges.some((change) => !change.is_available) && <p className="blocked-hours-note">Blocked hours are removed from the available windows above.</p>}
        </div>
      </section>

      <div className="availability-columns">
        <section className="availability-panel">
          <h4>Weekly hours</h4>
          <p className="availability-help">Set your regular hours by weekday. Date-specific available hours replace these for that date.</p>
          <form className="availability-add-form" onSubmit={addWeeklyWindow}>
            <label className="form-field"><span>Day</span><select value={weekday} onChange={(event) => setWeekday(event.target.value)}>{weekdays.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
            <label className="form-field"><span>From</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required /></label>
            <label className="form-field"><span>Until</span><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required /></label>
            <button type="submit" className="button button-dark" disabled={saving}><Plus size={15} /> Add hours</button>
          </form>
          {loading ? <p className="availability-empty">Loading your schedule…</p> : rules.length === 0
            ? <p className="availability-empty">No weekly hours saved yet.</p>
            : <div className="availability-list">{rules.map((rule) => (
              <form className="availability-row" key={rule.id} onSubmit={(event) => void updateRule(rule, event)}>
                <strong>{weekdays[rule.weekday]}</strong>
                <input aria-label="Start time" type="time" name="start_time" defaultValue={timeValue(rule.start_time)} required />
                <span>to</span>
                <input aria-label="End time" type="time" name="end_time" defaultValue={timeValue(rule.end_time)} required />
                <button type="submit" aria-label={`Save ${weekdays[rule.weekday]} hours`} disabled={saving}>Save</button>
                <button type="button" aria-label={`Remove ${weekdays[rule.weekday]} hours`} onClick={() => void removeRow("childcare_availability_rules", rule.id)} disabled={saving}><Trash2 size={14} /></button>
              </form>
            ))}</div>}
        </section>

        <section className="availability-panel">
          <h4>Change a specific date</h4>
          <form className="availability-override-form" onSubmit={saveOverride}>
            <label className="form-field"><span>Date</span><input type="date" min={todayPhoenix()} value={overrideDate} onChange={(event) => setOverrideDate(event.target.value)} required /></label>
            <label className="form-field"><span>Change</span><select value={overrideMode} onChange={(event) => setOverrideMode(event.target.value as OverrideMode)}><option value="available">Set available hours</option><option value="blocked_hours">Block certain hours</option><option value="blocked_day">Block entire day</option></select></label>
            {overrideMode !== "blocked_day" && <div className="availability-time-pair">
              <label className="form-field"><span>From</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required /></label>
              <label className="form-field"><span>Until</span><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required /></label>
            </div>}
            <button type="submit" className="button button-dark" disabled={saving}><Plus size={15} /> Save date change</button>
          </form>
          <p className="availability-help">Time blocks subtract from your schedule. Setting available hours replaces the regular weekday hours.</p>
          {overrides.length === 0 ? <p className="availability-empty">No upcoming date changes.</p> : <div className="availability-list">{overrides.map((override) => (
            <form className="availability-row override-row" key={override.id} onSubmit={(event) => void updateOverride(override, event)}>
              <label className="sr-only" htmlFor={`override-date-${override.id}`}>Date</label>
              <input id={`override-date-${override.id}`} type="date" name="override_date" min={todayPhoenix()} defaultValue={override.override_date} required />
              <input type="hidden" name="mode" value={override.is_available ? "available" : override.start_time ? "blocked_hours" : "blocked_day"} />
              <span className={override.is_available ? "" : "blocked-label"}>{override.is_available ? "Available" : override.start_time ? "Blocked" : "Blocked all day"}</span>
              {(!override.is_available && !override.start_time) ? null : <>
                <input aria-label="Start time" type="time" name="start_time" defaultValue={timeValue(override.start_time ?? "09:00")} required />
                <span>to</span>
                <input aria-label="End time" type="time" name="end_time" defaultValue={timeValue(override.end_time ?? "17:00")} required />
              </>}
              <button type="submit" aria-label={`Save date change for ${override.override_date}`} disabled={saving}>Save</button>
              <button type="button" aria-label={`Remove change for ${override.override_date}`} onClick={() => void removeRow("childcare_availability_overrides", override.id)} disabled={saving}><Trash2 size={14} /></button>
            </form>
          ))}</div>}
        </section>
      </div>

      <form className="availability-settings" onSubmit={saveSettings}>
        <div><span className="availability-settings-icon"><Clock3 size={17} /></span><div><h4>Booking preferences</h4><p>Applied when showing bookable start times.</p></div></div>
        <label className="form-field"><span>Minimum appointment</span><select value={settings.minimum_duration_minutes} onChange={(event) => setSettings({ ...settings, minimum_duration_minutes: Number(event.target.value) })}><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={90}>1.5 hours</option><option value={120}>2 hours</option><option value={180}>3 hours</option></select></label>
        <label className="form-field"><span>Travel buffer</span><select value={settings.travel_buffer_minutes} onChange={(event) => setSettings({ ...settings, travel_buffer_minutes: Number(event.target.value) })}><option value={0}>No buffer</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>1 hour</option></select></label>
        <button type="submit" className="button button-dark" disabled={saving}>Save preferences</button>
      </form>
    </section>
  );
}
