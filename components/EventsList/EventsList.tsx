"use client";

import { Event } from "@/queries/getEvents";

import EventItem from "./EventItem/EventItem";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  return (
    <ul className="grid auto-rows-max grid-cols-1 overflow-y-scroll bg-black">
      {events.map((event) => {
        return <EventItem key={`item-${event.sys.id}`} event={event} />;
      })}
    </ul>
  );
}
