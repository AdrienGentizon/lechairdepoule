import { Suspense } from "react";

import ContentfulEventItem from "@/components/EventsList/ContentfulEventItem";
import EventsList from "@/components/EventsList/EventsList";

import getEvents from "../../queries/getEvents";

export const revalidate = 86400; // 24 * 60 * 60;

export default async function Home() {
  const events = await getEvents();
  return (
    <Suspense>
      <h1 className="sr-only">Agenda des animations</h1>
      <EventsList
        emptyMessage={{
          heading: "Programme à venir",
          body: "Les prochaines animations seront annoncées bientôt.",
        }}
      >
        {events.map((event) => {
          return <ContentfulEventItem key={event.sys.id} event={event} />;
        })}
      </EventsList>
    </Suspense>
  );
}
