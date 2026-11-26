import { LOCALE, getEventTime } from "@cdp/lib/date";

import cn from "../lib/cn";

function Datestamp({ startDate }: { startDate: string }) {
  return (
    <time
      aria-hidden
      dateTime={startDate}
      className="flex h-full min-h-16 flex-col items-center justify-center uppercase leading-none"
    >
      <span className="text-xs font-light leading-none">
        {new Date(startDate).toLocaleDateString(LOCALE, {
          timeZone: "UTC",
          weekday: "short",
        })}
      </span>
      <span className="text-4xl font-black leading-none">
        {new Date(startDate).toLocaleDateString(LOCALE, {
          timeZone: "UTC",
          day: "2-digit",
        })}
      </span>
      <span className="text-sm font-black leading-none">
        {new Date(startDate).toLocaleDateString(LOCALE, {
          timeZone: "UTC",
          month: "short",
        })}
      </span>
    </time>
  );
}

function SummaryTitle({ title }: { title: string }) {
  return (
    <span className="text-balance text-xl font-semibold uppercase leading-none">
      {title}
    </span>
  );
}

function SummaryDescription({
  description,
  variant,
}: {
  description?: string | null;
  variant: "CDP" | "PP" | "HORS_LES_MURS";
}) {
  if (!description) return null;
  return (
    <span
      className={cn(
        "font-light leading-none",
        ["CDP", "PP"].includes(variant) && "text-purple-300",
      )}
    >
      {description}
    </span>
  );
}

function TimetableAndEntryFee({
  startTime,
  price,
}: {
  startTime: string | null;
  price: string | null;
}) {
  if (!startTime && !price) return null;
  return (
    <span className="flex items-center leading-none text-purple-300">
      {startTime && <time dateTime={startTime}>{getEventTime(startTime)}</time>}

      {startTime && price && <>&nbsp;&middot;&nbsp;</>}
      {price && <span className="leading-none">{price}</span>}
    </span>
  );
}

export default function EventSummary({
  startDate,
  startTime,
  price,
  title,
  description,
  aria,
  variant = "HORS_LES_MURS",
}: {
  startDate: string;
  startTime: string | null;
  price: string | null;
  title: string;
  description?: string | null;
  aria: { title: string };
  variant?: "CDP" | "PP" | "HORS_LES_MURS";
}) {
  const showTimetableAndEntryFee = !["CDP", "PP"].includes(variant);

  return (
    <>
      <span className="sr-only">{aria.title}</span>
      <Datestamp startDate={startDate} />
      <div
        aria-hidden
        className="flex flex-col justify-center gap-1.5 leading-none"
      >
        <SummaryTitle title={title} />
        <div className="flex flex-col gap-0.5">
          <SummaryDescription description={description} variant={variant} />
          {showTimetableAndEntryFee && (
            <TimetableAndEntryFee startTime={startTime} price={price} />
          )}
        </div>
      </div>
    </>
  );
}
