import sql from "../db";
import { Conversation } from "../types";

function getConversationFromRaw(
  raw: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    coverWidth: string | null;
    coverHeight: string | null;
    type: string | null;
    is_pinned: boolean;
    closed_to_contributions_at: string | null;
    created_by: string;
    created_at: string;
    reported_at: string | null;
  },
  createdBy: { id: string; pseudo: string; bannedAt: string | null },
  dates: {
    startsAt: string | null;
    endsAt: string | null;
    price: string | null;
  }
): Conversation {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    coverUrl: raw.coverUrl,
    coverWidth: raw.coverWidth ? parseInt(raw.coverWidth) : null,
    coverHeight: raw.coverHeight ? parseInt(raw.coverHeight) : null,
    type: raw.type,
    isPinned: raw.is_pinned,
    closedToContributionsAt: raw.closed_to_contributions_at,
    startsAt: dates.startsAt,
    endsAt: dates.endsAt,
    price: dates.price,
    createdAt: raw.created_at,
    createdBy,
    reportedAt: raw.reported_at,
    messages: [],
  };
}

export default async function insertConversation({
  title,
  description,
  cover,
  type,
  user,
  startsAt,
  endsAt,
  price,
  closedToContributionsAt,
}: {
  title: string;
  description: string;
  cover?: {
    url: string;
    width: number;
    height: number;
  };
  type: string;
  user: { id: string; pseudo: string; bannedAt: string | null };
  startsAt?: string | null;
  endsAt?: string | null;
  price?: string | null;
  closedToContributionsAt?: string | null;
}) {
  return sql.begin(async (sql) => {
    const insertedConversation = (
      await sql<
        {
          id: string;
          title: string;
          description: string | null;
          coverUrl: string | null;
          coverWidth: string | null;
          coverHeight: string | null;
          type: string | null;
          is_pinned: boolean;
          closed_to_contributions_at: string | null;
          created_by: string;
          created_at: string;
          reported_at: string | null;
        }[]
      >`
    INSERT INTO
      conversations (title, description, image_url, image_width, image_height, type, created_by, created_at, closed_to_contributions_at)
    VALUES
      (${title}, ${description}, ${cover?.url ?? null}, ${cover?.width ?? null}, ${cover?.height ?? null}, ${type}, ${user.id}, ${new Date()}, ${closedToContributionsAt ?? null})
    RETURNING
      id::text,
      title,
      description,
      image_url as "coverUrl",
      image_width as "coverWidth",
      image_height as "coverHeight",
      type,
      is_pinned,
      closed_to_contributions_at::text,
      created_by::text,
      created_at::text,
      reported_at::text;`
    ).at(0);

    if (!insertedConversation) {
      throw new Error("cannot insert conversation");
    }

    await sql`
      INSERT INTO conversation_dates (conversation_id, starts_at, ends_at, price)
      VALUES (${insertedConversation.id}, ${startsAt ?? null}, ${endsAt ?? null}, ${price ?? null})`;

    return getConversationFromRaw(
      insertedConversation,
      { id: user.id, pseudo: user.pseudo, bannedAt: user.bannedAt },
      {
        startsAt: startsAt ?? null,
        endsAt: endsAt ?? null,
        price: price ?? null,
      }
    );
  });
}
