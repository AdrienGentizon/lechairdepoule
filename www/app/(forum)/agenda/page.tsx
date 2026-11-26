import type { Metadata } from "next";
import Image from "next/image";

import CreateEventButton from "@/components/CreateEventButton/CreateEventButton";
import EventItem from "@/components/EventsList/EventItem";
import EventsList from "@/components/EventsList/EventsList";
import TextParser from "@/components/TextParser";
import { LOCALE, getEventTime } from "@/lib/date";
import getCachedEvents from "@/lib/events/getChachedEvents";

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "L'agenda des événements proposés par les habitués du Chair de poule.",
  alternates: { canonical: "/agenda" },
};

export default async function AgendaPage() {
  const events = await getCachedEvents();

  return (
    <>
      <h1 className="sr-only">Agenda hors les murs</h1>
      <EventsList
        emptyMessage={{
          heading: "Programme à venir",
          body: "Les prochaines animations seront annoncées bientôt.",
        }}
      >
        {events.map((event) => {
          return (
            <EventItem
              key={event.id}
              variant="HORS_LES_MURS"
              summary={{
                title: event.title,
                description: event.venue,
              }}
              event={event}
              image={
                event.coverUrl &&
                event.coverWidth &&
                event.coverHeight && (
                  <Image
                    src={event.coverUrl}
                    width={event.coverWidth}
                    height={event.coverHeight}
                    alt=""
                    aria-hidden
                    className="mx-auto w-full object-cover"
                    sizes="(max-width: 640px) 100dvw, 600px"
                  />
                )
              }
              details={
                event.description && <TextParser text={event.description} />
              }
              aria={{
                title: [
                  event.title,
                  event.venue,
                  new Date(event.startDate).toLocaleDateString(LOCALE, {
                    timeZone: "UTC",
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }),
                  event.startTime && getEventTime(event.startTime),
                  event.price,
                ]
                  .filter(Boolean)
                  .join(", "),
              }}
            />
          );
        })}
      </EventsList>
      <div className="flex flex-col border-b border-t border-white">
        <CreateEventButton />
      </div>
    </>
  );
}
