import { cn } from "@/lib/utils";
import { Event } from "@/queries/getEvents";

import ScrollIntoView from "../PublicEventsList/ScrollIntoView";
import ContentfulEventItem from "./ContentfulEventItem";

type Props = {
  events: Event[];
};

function EmptyMessage({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mx-auto max-w-sm bg-black p-4 pt-32 text-center text-white">
      <h2 className="text-lg font-bold leading-8">{heading}</h2>
      <p className="font-light">{body}</p>
    </div>
  );
}

export default function EventsList({ events }: Props) {
  if (events.length === 0) {
    return (
      <EmptyMessage
        heading="Programme à venir"
        body="Les prochaines animations seront annoncées bientôt."
      />
    );
  }

  return (
    <ul
      className={cn(
        "grid auto-rows-max grid-cols-1 overflow-y-scroll bg-black pb-4 pt-6",
        "mask_[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
      )}
    >
      {events.map((event) => {
        return <ContentfulEventItem key={event.sys.id} event={event} />;
      })}
      <ScrollIntoView />
    </ul>
  );
}
