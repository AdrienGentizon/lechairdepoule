import { Suspense } from "react";

import DeprecatedEventsList from "@/components/DeprecatedEventsList/DeprecatedEventsList";

import getEvents from "../../queries/getEvents";

export const revalidate = 24 * 60 * 60;

export default async function Home() {
  const events = await getEvents();
  return (
    <Suspense>
      <h1 className="sr-only">Agenda des animations</h1>
      <DeprecatedEventsList events={events} />
    </Suspense>
  );
}
