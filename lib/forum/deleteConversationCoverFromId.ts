import sql from "../db";

export default async function deleteConversationCoverFromId({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  return sql.begin(async (sql) => {
    const deletedConversation = (
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
          image_url = NULL,
          image_width = NULL,
          image_height = NULL
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
          created_at::text AS "createdAt"
          `
    ).at(0);

    if (!deletedConversation) return undefined;

    const dates = (
      await sql<
        {
          startsAt: string | null;
          endsAt: string | null;
          priceInCents: number | null;
        }[]
      >`
        SELECT starts_at::text AS "startsAt", ends_at::text AS "endsAt", price_cents AS "priceInCents"
        FROM conversation_dates
        WHERE conversation_id = ${conversationId}`
    ).at(0);

    return {
      ...deletedConversation,
      startsAt: dates?.startsAt ?? null,
      endsAt: dates?.endsAt ?? null,
      priceInCents: dates?.priceInCents ?? null,
    };
  });
}
