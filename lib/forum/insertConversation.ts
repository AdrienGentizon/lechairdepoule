import sql from "../db";
import { Conversation, User } from "../types";

function getConversationFromRaw(
  raw: {
    id: string;
    title: string;
    description: string | null;
    created_by: string;
    created_at: string;
  },
  createdBy: { id: string; pseudo: string; bannedAt: string | null }
): Conversation {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    createdAt: raw.created_at,
    createdBy,
    messages: [],
  };
}

export default async function insertConversation({
  title,
  description,
  user,
}: {
  title: string;
  description: string;
  user: User;
}) {
  const rows = await sql<
    {
      id: string;
      title: string;
      description: string | null;
      created_by: string;
      created_at: string;
    }[]
  >`
  INSERT INTO
	conversations (title, description, created_by, created_at)
  VALUES
    (${title}, ${description}, ${user.id}, ${Date.now()})
  RETURNING
    id::text,
    title,
    description,
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
