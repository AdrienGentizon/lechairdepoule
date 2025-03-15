import EventsList from "@/components/EventsList/EventsList";
import getEvents from "../../queries/getEvents";

export default async function Home() {
  const events = await getEvents();
  return <EventsList events={events} />;
}
