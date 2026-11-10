import { ChevronLeft, ChevronRight } from "lucide-react";

export type AvailabilityWindow = {
  start_time: string;
  end_time: string;
};

type AvailabilityCalendarProps = {
  month: Date;
  selectedDate: string;
  minimumDate: string;
  availabilityByDate: ReadonlyMap<string, readonly AvailabilityWindow[]>;
  blockedDates?: ReadonlySet<string>;
  allowUnavailableSelection?: boolean;
  onSelectDate: (date: string) => void;
  onMonthChange: (month: Date) => void;
};

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AvailabilityCalendar({
  month,
  selectedDate,
  minimumDate,
  availabilityByDate,
  blockedDates = new Set<string>(),
  allowUnavailableSelection = false,
  onSelectDate,
  onMonthChange,
}: AvailabilityCalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth ? dateKey(new Date(year, monthIndex, day)) : null;
  });
  const minimumMonth = minimumDate.slice(0, 7);
  const currentMonth = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month);

  return (
    <div className="availability-calendar">
      <div className="calendar-month-heading">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
          disabled={currentMonth <= minimumMonth}
        >
          <ChevronLeft size={18} />
        </button>
        <h3>{monthLabel}</h3>
        <button type="button" aria-label="Next month" onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="calendar-grid" aria-label={monthLabel}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
          <span className="calendar-weekday" key={weekday}>{weekday}</span>
        ))}
        {calendarDays.map((date, index) => {
          if (!date) return <span className="calendar-day calendar-day-empty" aria-hidden="true" key={`empty-${index}`} />;
          const windows = availabilityByDate.get(date) ?? [];
          const isBlocked = blockedDates.has(date);
          const isUnavailable = windows.length === 0;
          const disabled = date < minimumDate || (!allowUnavailableSelection && isUnavailable);
          return (
            <button
              type="button"
              className={`calendar-day${selectedDate === date ? " is-selected" : ""}${isUnavailable ? " is-unavailable" : " has-availability"}${isBlocked ? " is-blocked" : ""}`}
              aria-label={`${date}${isBlocked ? ", blocked" : isUnavailable ? ", unavailable" : `, ${windows.length} available time ${windows.length === 1 ? "window" : "windows"}`}`}
              aria-pressed={selectedDate === date}
              key={date}
              disabled={disabled}
              onClick={() => onSelectDate(date)}
            >
              <span>{Number(date.slice(-2))}</span>
              {isBlocked ? <small>Blocked</small> : windows.length > 0 ? <i aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      <div className="calendar-legend">
        <span><i className="calendar-legend-dot" /> Available</span>
        {allowUnavailableSelection && <span><i className="calendar-legend-blocked" /> Blocked / unavailable</span>}
      </div>
    </div>
  );
}
