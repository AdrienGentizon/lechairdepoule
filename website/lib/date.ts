const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;
const ONE_WEEK_IN_MS = 7 * ONE_DAY_IN_MS;

export const LOCALE = "fr-FR";
export const TZ = "Europe/Paris";

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

function getMidnight(target?: Date | null) {
  const date = new Date(target ?? new Date());
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getDateSpan(date?: Date | null) {
  const midnight = getMidnight(date);
  return {
    from: midnight,
    to: new Date(midnight.getTime() + (ONE_DAY_IN_MS - 1)),
  };
}

export function getWeekSpan(date?: Date | null) {
  const anchorDate = getDateSpan(date).from;
  const europeanDayIndex = [1, 2, 3, 4, 5, 6, 0].indexOf(anchorDate.getDay());
  const monday = new Date(
    anchorDate.getTime() - europeanDayIndex * ONE_DAY_IN_MS
  );
  const sunday = new Date(monday.getTime() + ONE_WEEK_IN_MS - 1);
  return {
    monday,
    sunday,
  };
}

export function getMonthSpan(date?: Date | null) {
  const firstMonthDay = date ? new Date(date) : new Date();
  firstMonthDay.setDate(1);

  const firstDayOfNextMonth = new Date(firstMonthDay);
  firstDayOfNextMonth.setMonth(firstMonthDay.getMonth() + 1);

  return {
    firstDay: getDateSpan(firstMonthDay).from,
    lastDay: new Date(getDateSpan(firstDayOfNextMonth).from.getTime() - 1),
  };
}

export function getEventTime(dateStr: string) {
  const date = new Date(dateStr);
  const hours = parseInt(
    date.toLocaleString(LOCALE, { timeZone: TZ, hour: "numeric" })
  );
  const minutes = parseInt(
    date.toLocaleString(LOCALE, { timeZone: TZ, minute: "numeric" })
  );
  if (hours === 0 && minutes === 0) return "minuit";
  return minutes === 0
    ? `${hours.toString().padStart(2, "0")}H`
    : `${hours.toString().padStart(2, "0")}H${minutes.toString().padStart(2, "0")}`;
}
