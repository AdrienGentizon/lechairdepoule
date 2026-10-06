import sql from "../db";

export default async function updateEventCoverFromId({
  eventId,
  userId,
  cover,
}: {
  eventId: string;
  userId: string;
  cover: {
    url: string;
    width: number;
    height: number;
  };
}) {
  return sql.begin(async (sql) => {
    const previousCoverUrl =
      (
        await sql<{ imageUrl: string | null }[]>`
          SELECT image_url AS "imageUrl"
          FROM public.events
          WHERE id = ${eventId} AND created_by = ${userId}`
      ).at(0)?.imageUrl ?? null;

    const updatedEvent = (
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
          image_url = ${cover.url},
          image_width = ${cover.width},
          image_height = ${cover.height},
          updated_at = ${new Date()}
        WHERE
          id = ${eventId}
          AND created_by = ${userId}
          AND deleted_at IS NULL
        RETURNING
          id::text,
          image_url AS "coverUrl",
          image_width::integer AS "coverWidth",
          image_height::integer AS "coverHeight";`
    ).at(0);

    if (!updatedEvent) return undefined;

    return {
      ...updatedEvent,
      previousCoverUrl,
    };
  });
}
