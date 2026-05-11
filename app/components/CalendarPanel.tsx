import { FormEvent } from "react";
import { addDays, formatDate } from "../utils/date";

interface CalendarPanelProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function CalendarPanel({
  selectedDate,
  onDateSelect,
}: CalendarPanelProps) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const leadingEmptyCells = firstDay === 0 ? 6 : firstDay - 1;
  const lastDate = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lastDate }, (_, index) => new Date(year, month, index + 1));
  const calendarCells = [
    ...Array.from({ length: leadingEmptyCells }, () => null),
    ...days,
  ];

  function handleMonthJump(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const jumpYear = Number(formData.get("jumpYear"));
    const jumpMonth = Number(formData.get("jumpMonth"));

    if (!Number.isInteger(jumpYear) || !Number.isInteger(jumpMonth) || jumpYear < 1900 || jumpMonth < 1 || jumpMonth > 12) {
      return;
    }

    onDateSelect(new Date(jumpYear, jumpMonth - 1, 1));
  }

  return (
    <section className="panel">
      <form className="calendar-jump" onSubmit={handleMonthJump}>
        <input aria-label="年" defaultValue={year} inputMode="numeric" name="jumpYear" type="number" />
        <span>年</span>
        <input aria-label="月" defaultValue={month + 1} inputMode="numeric" max={12} min={1} name="jumpMonth" type="number" />
        <span>月</span>
        <button type="submit">JUMP</button>
      </form>
      <div className="calendar-head">
        <button className="icon-btn" onClick={() => onDateSelect(new Date(year, month - 1, 1))}>
          ◀
        </button>
        <span>
          {year}年{month + 1}月
        </span>
        <button className="icon-btn" onClick={() => onDateSelect(new Date(year, month + 1, 1))}>
          ▶
        </button>
      </div>
      <div className="panel-body">
        <table className="mini-calendar">
          <thead>
            <tr>
              {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(calendarCells.length / 7) }, (_, row) => (
              <tr key={row}>
                {Array.from({ length: 7 }, (_, column) => {
                  const date = calendarCells[row * 7 + column];
                  return (
                    <td key={`${row}-${column}`} className={date && date.toDateString() === selectedDate.toDateString() ? "selected" : ""}>
                      {date ? <button onClick={() => onDateSelect(date)}>{date.getDate()}</button> : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}