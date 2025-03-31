"use client";

import { Event } from "@/queries/getEvents";
import EventItem from "./EventItem/EventItem";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  return (
    <ul className="flex w-full flex-col gap-0 bg-black">
      {events.map((event) => {
        return <EventItem key={`item-${event.sys.id}`} event={event} />;
      })}
    </ul>
  );
}
