import sql from "../db";

export default async function updateConversationCoverFromId({
  conversationId,
  userId,
  cover,
}: {
  conversationId: string;
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
          FROM public.conversations
          WHERE id = ${conversationId} AND created_by = ${userId}`
      ).at(0)?.imageUrl ?? null;

    const updatedConversation = (
      await sql<
        {
          id: string;
          title: string;
          description: string;
          type: string | null;
          isPinned: boolean;
          closedToContributionsAt: string | null;
          coverUrl: string | null;
          coverWidth: number | null;
          coverHeight: number | null;
          reportedAt: string | null;
          createdAt: string;
        }[]
      >`
        UPDATE public.conversations
        SET
          image_url = ${cover.url},
          image_width = ${cover.width},
          image_height = ${cover.height}
        WHERE id = ${conversationId} AND created_by = ${userId}
        RETURNING
          id::text,
          title,
          description,
          type,
          image_url AS "coverUrl",
          image_width::integer AS "coverWidth",
          image_height::integer AS "coverHeight",
          is_pinned AS "isPinned",
          closed_to_contributions_at::text AS "closedToContributionsAt",
          reported_at::text AS "reportedAt",
          created_at::text AS "createdAt"          `
    ).at(0);

    if (!updatedConversation) return undefined;

    const dates = (
      await sql<{ startsAt: string | null; endsAt: string | null }[]>`
        SELECT starts_at::text AS "startsAt", ends_at::text AS "endsAt"
        FROM conversation_dates
        WHERE conversation_id = ${conversationId}`
    ).at(0);

    return {
      ...updatedConversation,
      previousCoverUrl,
      startsAt: dates?.startsAt ?? null,
      endsAt: dates?.endsAt ?? null,
    };
  });
}
