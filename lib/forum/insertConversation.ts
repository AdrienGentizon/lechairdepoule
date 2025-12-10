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
    created_by: string;
    created_at: string;
  },
  createdBy: { id: string; pseudo: string; bannedAt: string | null }
): Conversation {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    coverUrl: raw.coverUrl,
    coverWidth: raw.coverWidth ? parseInt(raw.coverWidth) : null,
    coverHeight: raw.coverHeight ? parseInt(raw.coverHeight) : null,
    createdAt: raw.created_at,
    createdBy,
    messages: [],
  };
}

export default async function insertConversation({
  title,
  description,
  cover,
  user,
}: {
  title: string;
  description: string;
  cover?: {
    url: string;
    width: number;
    height: number;
  };
  user: User;
}) {
  const rows = await sql<
    {
      id: string;
      title: string;
      description: string | null;
      coverUrl: string | null;
      coverWidth: string | null;
      coverHeight: string | null;
      created_by: string;
      created_at: string;
    }[]
  >`
  INSERT INTO
	conversations (title, description, image_url, image_width, image_height, created_by, created_at)
  VALUES
    (${title}, ${description}, ${cover?.url ?? null}, ${cover?.width ?? null}, ${cover?.height ?? null}, ${user.id}, ${Date.now()})
  RETURNING
    id::text,
    title,
    description,
    image_url as "coverUrl",
    image_width as "coverWidth",
    image_height as "coverHeight",
    created_by::text,
    created_at::text;`;

  const newConversation = rows.at(0);

  if (!newConversation) {
    throw new Error("cannot insert conversation");
  }

  return getConversationFromRaw(newConversation, {
    id: user.id,
    pseudo: user.pseudo,
    bannedAt: user.bannedAt,
  });
}
