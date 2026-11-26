import sql from "../db";

export default async function deleteEventCoverFromId({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  return sql.begin(async (sql) => {
    const previousCoverKey =
      (
        await sql<{ imageKey: string | null }[]>`
          SELECT image_key
          FROM public.events
          WHERE id = ${eventId} AND created_by = ${userId}`
      ).at(0)?.imageKey ?? null;

    const updatedEvent = (
      await sql<
        {
          id: string;
          coverWidth: number | null;
          coverHeight: number | null;
        }[]
      >`
        UPDATE public.events
        SET
          image_key = NULL,
          image_width = NULL,
          image_height = NULL,
          updated_at = ${new Date()}
        WHERE
          id = ${eventId}
          AND created_by = ${userId}
        RETURNING
          id::text,
          image_width::integer AS "coverWidth",
          image_height::integer AS "coverHeight";`
    ).at(0);

    if (!updatedEvent) return undefined;

    return {
      ...updatedEvent,
      coverUrl: null,
      previousCoverKey,
    };
  });
}
