import { cn } from "@/lib/utils";
import { Event } from "@/queries/getEvents";

import EventItem from "./EventItem/EventItem";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  return (
    <ul
      className={cn(
        "grid auto-rows-max grid-cols-1 overflow-y-scroll bg-black pb-4 pt-6",
        "mask-[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
      )}
    >
      {events.map((event) => {
        return <EventItem key={`item-${event.sys.id}`} event={event} />;
      })}
    </ul>
  );
}
