import { createHash } from "crypto";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;

function toIcsDate(dateStr: string): string {
  return (
    new Date(dateStr).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  );
}

function toIcsLocalDateTime(localDateTime: Date): string {
  return localDateTime.toISOString().replace(/[-:]/g, "").split(".")[0];
}

function toIcsAllDayDate(date: string): string {
  return date.replace(/-/g, "");
}

function getNextDay(date: string): string {
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + ONE_DAY_IN_MS)
    .toISOString()
    .slice(0, 10);
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function getIcsTimeRange(inputs: {
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
}) {
  if (!inputs.startTime) {
    return [
      `DTSTART;VALUE=DATE:${toIcsAllDayDate(inputs.startDate)}`,
      `DTEND;VALUE=DATE:${toIcsAllDayDate(getNextDay(inputs.endDate ?? inputs.startDate))}`,
    ];
  }

  const localStart = new Date(`${inputs.startDate}T${inputs.startTime}:00Z`);
  const localEnd =
    inputs.endDate && inputs.endTime
      ? new Date(`${inputs.endDate}T${inputs.endTime}:00Z`)
      : new Date(localStart.getTime() + ONE_HOUR_IN_MS);

  return [
    `DTSTART;TZID=${inputs.timezone}:${toIcsLocalDateTime(localStart)}`,
    `DTEND;TZID=${inputs.timezone}:${toIcsLocalDateTime(localEnd)}`,
  ];
}

export function buildIcsCalendar(inputs: {
  title: string;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
}): string {
  const exportedAt = toIcsDate(new Date().toISOString());
  const uid = createHash("sha256")
    .update(`${inputs.title}|${inputs.startDate}`)
    .digest("hex");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Chair de Poule//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@lechairdepoule.fr`,
    `DTSTAMP:${exportedAt}`,
    ...getIcsTimeRange(inputs),
    `SUMMARY:${escapeIcsText(inputs.title)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
