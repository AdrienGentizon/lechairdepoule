import { Suspense } from "react";

import EventsList from "@/components/EventsList/EventsList";

import getEvents from "../../queries/getEvents";

export const revalidate = 86400; // 24 * 60 * 60;

export default async function Home() {
  const events = await getEvents();
  return (
    <Suspense>
      <h1 className="sr-only">Agenda des animations</h1>
      <EventsList events={events} />
    </Suspense>
  );
}
