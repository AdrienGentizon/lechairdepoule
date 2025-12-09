import { Suspense } from "react";

import EventsList from "@/components/EventsList/EventsList";

import getEvents from "../../queries/getEvents";

export default async function Home() {
  const events = await getEvents();
  return (
    <Suspense>
      <EventsList events={events} />
    </Suspense>
  );
}
