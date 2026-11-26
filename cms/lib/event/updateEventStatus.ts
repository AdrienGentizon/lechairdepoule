import sql from "@/lib/db";
import { EventStatusInput } from "@/lib/validation";

export default async function updateEventStatus({
  eventId,
  organizationId,
  userId,
  status,
}: EventStatusInput & {
  eventId: string;
  organizationId: string;
  userId: string;
}) {
  return (
    await sql<{ id: string; deletedAt: string | null }[]>`
    UPDATE events e
    SET
      deleted_at = CASE WHEN ${status}::text = 'UNPUBLISHED' THEN COALESCE(e.deleted_at, NOW()) END,
      updated_at = NOW()
    FROM organizations o
    WHERE
      e.id = ${eventId}
      AND e.organization_id = o.id
      AND o.id = ${organizationId}
      AND o.managed_by = ${userId}
      AND o.deleted_at IS NULL
    RETURNING
      e.id::text,
      e.deleted_at::text;`
  ).at(0);
}
