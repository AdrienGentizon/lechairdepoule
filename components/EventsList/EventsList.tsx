"use client";

import { Event } from "@/queries/getEvents";
import EventItem from "./EventItem/EventItem";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  const router = useRouter();
  const selectedEventId = useSearchParams().get("id")?.toString();
  return (
    <ul className="flex w-full flex-col gap-0 bg-black">
      {events.map((event) => {
        return (
          <EventItem
            key={`item-${event.sys.id}`}
            event={event}
            selected={selectedEventId === event.sys.id}
            onSelect={(eventId) => {
              if (eventId !== selectedEventId)
                return router.push(`/?id=${event.sys.id}`);
              return router.push(`/`);
            }}
          />
        );
      })}
    </ul>
  );
}
