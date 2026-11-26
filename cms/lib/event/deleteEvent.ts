import sql from "@/lib/db";

export default async function deleteEvent({
  eventId,
  organizationId,
  userId,
}: {
  eventId: string;
  organizationId: string;
  userId: string;
}) {
  return (
    await sql<{ id: string; imageKey: string | null }[]>`
    WITH previous AS (
      SELECT e.id, e.image_key
      FROM events e JOIN organizations o ON e.organization_id = o.id
      WHERE
        e.id = ${eventId}
        AND o.id = ${organizationId}
        AND o.managed_by = ${userId}
        AND o.deleted_at IS NULL
        AND e.deleted_at IS NULL
    )
    UPDATE events e
    SET
      image_key = NULL,
      image_width = NULL,
      image_height = NULL,
      deleted_at = NOW(),
      updated_at = NOW()
    FROM previous p
    WHERE e.id = p.id
    RETURNING
      e.id::text,
      p.image_key;`
  ).at(0);
}
