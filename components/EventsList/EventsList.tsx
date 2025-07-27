"use client";

import { Event } from "@/queries/getEvents";
import EventItem from "./EventItem/EventItem";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  if (events.length === 0)
    return (
      <section
        aria-labelledby="empty-events-title"
        className="flex h-full w-full flex-col justify-center px-32 font-mono leading-7"
      >
        <h2 id="empty-event-title" className="text-center text-2xl font-bold">
          Pause estivale...
        </h2>
        <div className="flex flex-col gap-4 py-4">
          <p>La programmation reprendra avec force et éclat à la rentrée.</p>
          <p>Ou bien avant qui sait ?</p>
        </div>
      </section>
    );
  return (
    <ul className="flex w-full flex-col gap-0 bg-black">
      {events.map((event) => {
        return <EventItem key={`item-${event.sys.id}`} event={event} />;
      })}
    </ul>
  );
}
