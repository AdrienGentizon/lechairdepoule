import EventPage from "@/components/pages/EventPage";

export default async function Event({
  params,
}: {
  params: Promise<{ organizationId: string; eventId: string }>;
}) {
  const { organizationId, eventId } = await params;

  return <EventPage organizationId={organizationId} eventId={eventId} />;
}
