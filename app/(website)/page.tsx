import EventsList from "@/components/EventsList/EventsList";
import getEvents from "../../queries/getEvents";
import { Suspense } from "react";

export const revalidate = 60 * 60 * 6;

export default async function Home() {
  const events = await getEvents();
  return (
    <Suspense>
      <EventsList events={events} />
    </Suspense>
  );
}
