import { Event } from "@/queries/getEvents";
import EventItem from "./EventItem/EventItem";
import { Accordion } from "../ui/accordion";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  return (
    <Accordion type="single" collapsible className="overflow-y-scroll bg-black">
      {events.map((event) => {
        return <EventItem key={`item-${event.sys.id}`} event={event} />;
      })}
    </Accordion>
  );
}
