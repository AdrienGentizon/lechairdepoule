import sql from "../db";

export default async function updateConversationFromId(
  {
    conversationId,
    userId,
    title,
    description,
    cover,
    startsAt,
    endsAt,
  }: {
    conversationId: string;
    userId: string;
    title: string;
    description: string;
    cover?: {
      url: string;
      width: number;
      height: number;
    };
    startsAt?: string | null;
    endsAt?: string | null;
  },
  options?: { forceDropCover?: boolean }
) {
  const forceDropCover = options?.forceDropCover === true;
  const updateDates = startsAt !== undefined || endsAt !== undefined;

  return sql.begin(async (sql) => {
    const result = await sql<
      {
        id: string;
        title: string;
        description: string;
        type: string | null;
        coverUrl: string | null;
        coverWidth: number | null;
        coverHeight: number | null;
        previousCoverUrl: string | null;
      }[]
    >`WITH previous AS (SELECT image_url FROM public.conversations WHERE id = ${conversationId} AND created_by = ${userId})
    UPDATE public.conversations
      SET
        title = ${title},
        description = ${description},
        image_url = CASE WHEN ${forceDropCover}::boolean THEN NULL ELSE COALESCE(${cover?.url ?? null}, image_url) END,
        image_width = CASE WHEN ${forceDropCover}::boolean THEN NULL ELSE COALESCE(${cover?.width ?? null}, image_width) END,
        image_height = CASE WHEN ${forceDropCover}::boolean THEN NULL ELSE COALESCE(${cover?.height ?? null}, image_height) END
      WHERE
        id = ${conversationId}
        AND created_by = ${userId}
      RETURNING
        id::text,
        title,
        description,
        type,
        image_url as "coverUrl",
        image_width::integer as "coverWidth",
        image_height::integer as "coverHeight",
        (SELECT image_url FROM previous) AS "previousCoverUrl";`;

    const updated = result.at(0);
    if (!updated) return undefined;

    if (updateDates) {
      await sql`
        INSERT INTO conversation_dates (conversation_id, starts_at, ends_at)
        VALUES (${conversationId}, ${startsAt ?? null}, ${endsAt ?? null})
        ON CONFLICT (conversation_id) DO UPDATE
          SET
            starts_at = CASE WHEN ${startsAt !== undefined}::boolean THEN EXCLUDED.starts_at ELSE conversation_dates.starts_at END,
            ends_at = CASE WHEN ${endsAt !== undefined}::boolean THEN EXCLUDED.ends_at ELSE conversation_dates.ends_at END`;
    }

    return { ...updated, startsAt: startsAt ?? null, endsAt: endsAt ?? null };
  });
}
