import type { ReactNode } from "react";

import PeinePerdue from "@/components/png/PeinePerdue";
import { LOCALE, getEventTime } from "@/lib/date";
import { Event } from "@/lib/types";
import { cn } from "@/lib/utils";

import EventUrl from "../ConversationsList/EventUrl";
import EventItemActions from "./EventItemActions";
import ImportToCalendarButton from "./ImportToCalendarButton";

function Datestamp({
  startsAt,
  timezone,
}: {
  startsAt: string;
  timezone: string;
}) {
  return (
    <time
      aria-hidden
      dateTime={startsAt}
      className="flex h-full min-h-16 flex-col items-center justify-center uppercase leading-none"
    >
      <span className="text-xs font-light leading-none">
        {new Date(startsAt).toLocaleDateString(LOCALE, {
          timeZone: timezone,
          weekday: "short",
        })}
      </span>
      <span className="text-4xl font-black leading-none">
        {new Date(startsAt).toLocaleDateString(LOCALE, {
          timeZone: timezone,
          day: "2-digit",
        })}
      </span>
      <span className="text-sm font-black leading-none">
        {new Date(startsAt).toLocaleDateString(LOCALE, {
          timeZone: timezone,
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
        ["CDP", "PP"].includes(variant) && "text-purple-300"
      )}
    >
      {description}
    </span>
  );
}

function TimetableAndEntryFee({
  startsAt,
  timezone,
  price,
}: {
  startsAt: string;
  timezone: string;
  price: string | null;
}) {
  return (
    <span className="flex items-center leading-none text-purple-300">
      <time dateTime={startsAt}>{getEventTime(startsAt, timezone)}</time>

      {price && <>&nbsp;&middot;&nbsp;</>}
      {price && <span className="leading-none">{price}</span>}
    </span>
  );
}

export default function EventItem({
  summary,
  image,
  details,
  event,
  aria,
  variant,
}: {
  summary: { title: string; description?: string | null };
  image: ReactNode;
  details: ReactNode;
  event: Event;
  aria: {
    title: string;
  };
  variant: "CDP" | "PP" | "HORS_LES_MURS";
}) {
  const showTimetableAndEntryFee = !["CDP", "PP"].includes(variant ?? "");

  return (
    <li className="border-foreground relative isolate border-b py-2 first:border-t">
      <details
        name="events"
        className="relative isolate cursor-pointer scroll-mt-6"
      >
        <summary className="grid grid-cols-[5rem_1fr] gap-2 pr-4">
          <span className="sr-only">{aria.title}</span>
          <Datestamp startsAt={event.startsAt} timezone={event.timezone} />
          <div
            aria-hidden
            className="flex flex-col justify-center gap-1.5 leading-none"
          >
            <SummaryTitle title={summary.title} />

            <div className="flex flex-col gap-0.5">
              <SummaryDescription
                description={summary.description}
                variant={variant}
              />
              {showTimetableAndEntryFee && (
                <TimetableAndEntryFee
                  startsAt={event.startsAt}
                  timezone={event.timezone}
                  price={event.price}
                />
              )}
            </div>
          </div>
          {variant === "PP" && (
            <PeinePerdue className="absolute right-4 top-1/2 z-10 size-16 origin-center -translate-y-1/2 rotate-12" />
          )}
        </summary>
        <ImportToCalendarButton
          ics={{
            title: summary.title,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
          }}
        />
        <div className="flex flex-col gap-4 p-4">
          {image}
          {details && (
            <div className="font-courier whitespace-pre-wrap font-light leading-tight">
              {details}
            </div>
          )}
          <EventUrl event={event} />
        </div>
      </details>
      {["HORS_LES_MURS"].includes(variant) && (
        <EventItemActions event={event} />
      )}
    </li>
  );
}
