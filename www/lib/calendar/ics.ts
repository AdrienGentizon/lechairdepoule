import { createHash } from "crypto";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;

function toIcsDate(dateStr: string): string {
  return (
    new Date(dateStr).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  );
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
  endDate: string | null;
  startsAt: string | null;
  endsAt: string | null;
}) {
  if (!inputs.startsAt) {
    return [
      `DTSTART;VALUE=DATE:${toIcsAllDayDate(inputs.startDate)}`,
      `DTEND;VALUE=DATE:${toIcsAllDayDate(getNextDay(inputs.endDate ?? inputs.startDate))}`,
    ];
  }

  const end =
    inputs.endsAt ??
    new Date(
      new Date(inputs.startsAt).getTime() + ONE_HOUR_IN_MS,
    ).toISOString();

  return [`DTSTART:${toIcsDate(inputs.startsAt)}`, `DTEND:${toIcsDate(end)}`];
}

export function buildIcsCalendar(inputs: {
  title: string;
  startDate: string;
  endDate: string | null;
  startsAt: string | null;
  endsAt: string | null;
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
