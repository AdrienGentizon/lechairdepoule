import sql from "../db";

export default async function deleteEventFromId({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  return (
    await sql<
      {
        id: string;
        coverKey: string | null;
      }[]
    >`UPDATE public.events
      SET deleted_at = ${new Date()}
      WHERE
        id = ${eventId}
        AND created_by = ${userId}
      RETURNING
        id::text,
        image_key AS "coverKey";`
  ).at(0);
}
