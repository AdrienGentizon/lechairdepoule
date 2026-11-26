const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;
const ONE_WEEK_IN_MS = 7 * ONE_DAY_IN_MS;

export const LOCALE = "fr-FR";
export const DANGEROUS_FALLBACK_TZ = "Europe/Paris";

function getTimeSince(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return { value: 0, range: "instant" };
  if (minutes < 60) return { value: minutes, range: "minute(s)" };
  if (hours < 24) return { value: hours, range: "heure(s)" };
  if (days < 7) return { value: days, range: "jour(s)" };
  if (weeks < 4) return { value: weeks, range: "semaine(s)" };
  return { value: months, range: "mois" };
}

export function getSinceAsString(date: Date) {
  const since = getTimeSince(date);

  if (since.range === "instant" || since.value === 0) {
    return `à l'instant`;
  }
  return `il y a ${since.value} ${since.range}`;
}

function getMidnightUTC(target?: Date | null) {
  const date = new Date(target ?? new Date());
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function getDateSpanUTC(date?: Date | null) {
  const midnight = getMidnightUTC(date);
  return {
    from: midnight,
    to: new Date(midnight.getTime() + (ONE_DAY_IN_MS - 1)),
  };
}

export function getWeekSpanUTC(date?: Date | null) {
  const anchorDate = getDateSpanUTC(date).from;
  const europeanDayIndex = [1, 2, 3, 4, 5, 6, 0].indexOf(
    anchorDate.getUTCDay(),
  );
  const monday = new Date(
    anchorDate.getTime() - europeanDayIndex * ONE_DAY_IN_MS,
  );
  const sunday = new Date(monday.getTime() + ONE_WEEK_IN_MS - 1);
  return {
    monday,
    sunday,
  };
}

export function getMonthSpanUTC(date?: Date | null) {
  const firstMonthDay = date ? new Date(date) : new Date();
  firstMonthDay.setUTCDate(1);

  const firstDayOfNextMonth = new Date(firstMonthDay);
  firstDayOfNextMonth.setUTCMonth(firstMonthDay.getUTCMonth() + 1);

  return {
    firstDay: getDateSpanUTC(firstMonthDay).from,
    lastDay: new Date(getDateSpanUTC(firstDayOfNextMonth).from.getTime() - 1),
  };
}

export function getEventTime(time: string) {
  const [hours, minutes] = time.split(":");
  if (hours === "00" && minutes === "00") return "minuit";
  return minutes === "00" ? `${hours}H` : `${hours}H${minutes}`;
}

export function getDateAndTimeInTimezone(dateStr: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(dateStr));
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${getPart("year")}-${getPart("month")}-${getPart("day")}`,
    time: `${getPart("hour")}:${getPart("minute")}`,
  };
}

export function getValidDate(dateStr: string) {
  if (isNaN(new Date(dateStr).getTime())) return;

  return new Date(dateStr);
}
