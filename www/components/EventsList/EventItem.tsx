import type { ReactNode } from "react";

import Details from "@cdp/ui/Details";
import EventSummary from "@cdp/ui/EventSummary";

import PeinePerdue from "@/components/png/PeinePerdue";
import { Event } from "@/lib/types";

import EventUrl from "../ConversationsList/EventUrl";
import ImportToCalendarButton from "./ImportToCalendarButton";

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
  return (
    <li className="border-foreground relative isolate border-b py-2 first:border-t">
      <Details id={event.id} name="events">
        <Details.Summary className="grid grid-cols-[5rem_1fr] gap-2 pr-4">
          <EventSummary
            startDate={event.startDate}
            startTime={event.startTime}
            price={event.price}
            title={summary.title}
            description={summary.description}
            aria={aria}
            variant={variant}
          />
          {variant === "PP" && (
            <PeinePerdue className="absolute right-4 top-1/2 z-10 size-16 origin-center -translate-y-1/2 rotate-12" />
          )}
        </Details.Summary>
        <ImportToCalendarButton
          ics={{
            title: summary.title,
            startDate: event.startDate,
            startTime: event.startTime,
            endDate: event.endDate,
            endTime: event.endTime,
            timezone: event.timezone,
          }}
        />
        <Details.Content>
          {image}
          {details && (
            <div className="font-courier whitespace-pre-wrap font-light leading-tight">
              {details}
            </div>
          )}
          <EventUrl event={event} />
        </Details.Content>
      </Details>
    </li>
  );
}
