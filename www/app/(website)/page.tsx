import { Suspense } from "react";

import type { Metadata } from "next";

import ContentfulEventItem from "@/components/EventsList/ContentfulEventItem";
import EventsList from "@/components/EventsList/EventsList";

import getContentfulEvents from "../../queries/getContentfulEvents";

export const revalidate = 86400; // 24 * 60 * 60;

export const metadata: Metadata = {
  description:
    "Concerts, soirées et animations à venir au Chair de poule et au Peine Perdue.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const events = await getContentfulEvents();
  return (
    <Suspense>
      <h1 className="sr-only">Agenda des animations</h1>
      <EventsList
        emptyMessage={{
          heading: "Rien de prévu en ce moment...",
          body: "Les prochaines animations seront annoncées bientôt.",
        }}
      >
        {events.map((event) => {
          return <ContentfulEventItem key={event.id} event={event} />;
        })}
      </EventsList>
    </Suspense>
  );
}
