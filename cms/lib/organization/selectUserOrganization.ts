import sql from "@/lib/db";

export default async function selectUserOrganization({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  return (
    await sql<{ id: string }[]>`
    SELECT
      o.id::text
    FROM organizations o
    WHERE
      o.id = ${organizationId}
      AND o.managed_by = ${userId}
      AND o.deleted_at IS NULL;`
  ).at(0);
}
