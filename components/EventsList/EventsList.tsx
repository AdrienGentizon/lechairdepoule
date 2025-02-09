"use client";

import { Event } from "@/app/queries/getEvents";
import { useState } from "react";
import EventItem from "./EventItem/EventItem";
import { Accordion } from "../ui/accordion";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(
    undefined,
  );

  const updateSlectedEvent = (event: Event) => {
    setSelectedEvent((prev) => {
      return prev?.sys.id == event.sys.id ? undefined : event;
    });
  };

  return (
    <Accordion type="single" collapsible>
      {events.map((event) => {
        return (
          <EventItem
            key={`item-${event.sys.id}`}
            event={event}
            onSelect={updateSlectedEvent}
            showDetails={selectedEvent?.sys.id === event.sys.id}
          />
        );
      })}
    </Accordion>
  );
}
