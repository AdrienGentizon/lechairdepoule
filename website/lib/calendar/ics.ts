import { createHash } from "crypto";

function toIcsDate(dateStr: string): string {
  return (
    new Date(dateStr).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  );
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function buildIcsCalendar({
  title,
  startsAt,
  endsAt,
}: {
  title: string;
  startsAt: string;
  endsAt: string | null;
}): string {
  const start = toIcsDate(startsAt);
  const end = endsAt
    ? toIcsDate(endsAt)
    : toIcsDate(
        new Date(new Date(startsAt).getTime() + 60 * 60 * 1000).toISOString()
      );
  const exportedAt = toIcsDate(new Date().toISOString());
  const uid = createHash("sha256").update(`${title}|${startsAt}`).digest("hex");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Chair de Poule//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@lechairdepoule.fr`,
    `DTSTAMP:${exportedAt}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(title)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
