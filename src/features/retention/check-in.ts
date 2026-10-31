import { Platform } from "react-native";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatCheckInDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calendarDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const next = new Date(year, month - 1, day + 1);
  return {
    start: `${year}${pad(month)}${pad(day)}`,
    end: `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`,
  };
}

export function buildCheckInIcs(dueDate: string) {
  const { start, end } = calendarDay(dueDate);
  const stamp = `${new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0]}Z`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MapleRoute//Guide check-in//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:mapleroute-check-in-${start}@mapleroute`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    "SUMMARY:Check in on your MapleRoute guide",
    "DESCRIPTION:Review your Express Entry progress and check any steps that changed.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadCheckInIcs(dueDate: string) {
  if (Platform.OS !== "web" || typeof document === "undefined") return false;

  const blob = new Blob([buildCheckInIcs(dueDate)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mapleroute-check-in-${dueDate}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
