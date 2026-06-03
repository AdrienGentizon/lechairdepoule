import sql from "../db";

export default async function updateConversationFromId({
  conversationId,
  userId,
  title,
  description,
  startsAt,
  endsAt,
  price,
  venue,
  url,
  closedToContributionsAt,
}: {
  conversationId: string;
  userId: string;
  title: string;
  description: string;
  startsAt: string | null;
  endsAt: string | null;
  price: string | null;
  venue: string | null;
  url: string | null;
  closedToContributionsAt: string | null;
}) {
  return sql.begin(async (sql) => {
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
        }[]
      >`
        UPDATE public.conversations
        SET
          title = ${title},
          description = ${description},
          closed_to_contributions_at = ${closedToContributionsAt}
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
          reported_at::text AS "reportedAt"`
    ).at(0);

    if (!updatedConversation) return undefined;

    const metadata = (
      await sql<
        {
          startsAt: string | null;
          endsAt: string | null;
          price: string | null;
          venue: string | null;
          url: string | null;
        }[]
      >`
        INSERT INTO event_metadata (conversation_id, starts_at, ends_at, price, venue, url)
        VALUES (${conversationId}, ${startsAt}, ${endsAt}, ${price}, ${venue}, ${url})
        ON CONFLICT (conversation_id) DO UPDATE
          SET starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at, price = EXCLUDED.price, venue = EXCLUDED.venue, url = EXCLUDED.url
        RETURNING starts_at::text AS "startsAt", ends_at::text AS "endsAt", price AS "price", venue AS "venue", url AS "url"`
    ).at(0);

    return {
      ...updatedConversation,
      startsAt: metadata?.startsAt ?? null,
      endsAt: metadata?.endsAt ?? null,
      price: metadata?.price ?? null,
      venue: metadata?.venue ?? null,
      url: metadata?.url ?? null,
    };
  });
}
