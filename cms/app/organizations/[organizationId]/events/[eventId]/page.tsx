import EventPage from "@/components/pages/EventPage";

export default async function Event({
  params,
}: PageProps<"/organizations/[organizationId]/events/[eventId]">) {
  const { organizationId, eventId } = await params;

  return <EventPage organizationId={organizationId} eventId={eventId} />;
}
