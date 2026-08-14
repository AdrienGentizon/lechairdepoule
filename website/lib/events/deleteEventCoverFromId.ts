import sql from "../db";

export default async function deleteEventCoverFromId({
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
        coverUrl: string | null;
        coverWidth: number | null;
        coverHeight: number | null;
      }[]
    >`
        UPDATE public.events
        SET
          image_url = NULL,
          image_width = NULL,
          image_height = NULL,
          updated_at = ${new Date()}
        WHERE
          id = ${eventId}
          AND created_by = ${userId}
        RETURNING
          id::text,
          image_url AS "coverUrl",
          image_width::integer AS "coverWidth",
          image_height::integer AS "coverHeight";`
  ).at(0);
}
