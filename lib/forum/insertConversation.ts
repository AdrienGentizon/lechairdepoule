import sql from "../db";
import { Conversation, User } from "../types";

function getConversationFromRaw(
  raw: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    coverWidth: string | null;
    coverHeight: string | null;
    type: string | null;
    created_by: string;
    created_at: string;
  },
  createdBy: { id: string; pseudo: string; bannedAt: string | null },
  dates: { startsAt: string | null; endsAt: string | null }
): Conversation {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    coverUrl: raw.coverUrl,
    coverWidth: raw.coverWidth ? parseInt(raw.coverWidth) : null,
    coverHeight: raw.coverHeight ? parseInt(raw.coverHeight) : null,
    type: raw.type,
    startsAt: dates.startsAt,
    endsAt: dates.endsAt,
    createdAt: raw.created_at,
    createdBy,
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
}: {
  title: string;
  description: string;
  cover?: {
    url: string;
    width: number;
    height: number;
  };
  type: string;
  user: User;
  startsAt?: string | null;
  endsAt?: string | null;
}) {
  const hasDates = type === "EVENT" || type === "RELEASE";

  return sql.begin(async (sql) => {
    const rows = await sql<
      {
        id: string;
        title: string;
        description: string | null;
        coverUrl: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        type: string | null;
        created_by: string;
        created_at: string;
      }[]
    >`
    INSERT INTO
      conversations (title, description, image_url, image_width, image_height, type, created_by, created_at)
    VALUES
      (${title}, ${description}, ${cover?.url ?? null}, ${cover?.width ?? null}, ${cover?.height ?? null}, ${type}, ${user.id}, ${new Date()})
    RETURNING
      id::text,
      title,
      description,
      image_url as "coverUrl",
      image_width as "coverWidth",
      image_height as "coverHeight",
      type,
      created_by::text,
      created_at::text;`;

    const newConversation = rows.at(0);

    if (!newConversation) {
      throw new Error("cannot insert conversation");
    }

    if (hasDates) {
      await sql`
        INSERT INTO conversation_dates (conversation_id, starts_at, ends_at)
        VALUES (${newConversation.id}, ${startsAt ?? null}, ${endsAt ?? null})`;
    }

    return getConversationFromRaw(
      newConversation,
      { id: user.id, pseudo: user.pseudo, bannedAt: user.bannedAt },
      { startsAt: hasDates ? (startsAt ?? null) : null, endsAt: hasDates ? (endsAt ?? null) : null }
    );
  });
}
