import { toPublicUrl } from "@cdp/lib/s3";

import sql from "../db";

export default async function updateEventCoverFromId({
  eventId,
  userId,
  cover,
}: {
  eventId: string;
  userId: string;
  cover: {
    objectKey: string;
    width: number;
    height: number;
  };
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
          coverKey: string | null;
          coverWidth: number | null;
          coverHeight: number | null;
        }[]
      >`
        UPDATE public.events
        SET
          image_key = ${cover.objectKey},
          image_width = ${cover.width},
          image_height = ${cover.height},
          updated_at = ${new Date()}
        WHERE
          id = ${eventId}
          AND created_by = ${userId}
          AND deleted_at IS NULL
        RETURNING
          id::text,
          image_key AS "coverKey",
          image_width::integer AS "coverWidth",
          image_height::integer AS "coverHeight";`
    ).at(0);

    if (!updatedEvent) return undefined;

    const { coverKey, ...event } = updatedEvent;

    return {
      ...event,
      coverUrl: coverKey ? toPublicUrl(coverKey) : null,
      previousCoverKey,
    };
  });
}
