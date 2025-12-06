import sql from "../db";
import { User } from "../types";
import { getMessageFromRaw } from "./getMessageFromRaw";

export default async function insertMessageIntoConversation({
  conversationId,
  body,
  user,
}: {
  conversationId: string;
  body: string;
  user: User;
}) {
  const rows = await sql<
    {
      id: string;
      body: string;
      created_at: string;
      updated_at: string | null;
      reported_at: string | null;
      conversation_id: string;
      user_id: string;
      reported_by: string | null;
    }[]
  >`
  INSERT INTO
	conversations (conversation_id, body, user_id, created_at)
  VALUES
    (${conversationId}, ${body}, ${user.id}, ${Date.now()})
  RETURNING
    id::text,
    body,
    created_at::text,
    updated_at::text,
    reported_at::text,
    conversation_id::text,
    user_id::text,
    reported_by::text;`;

  const newMessage = rows.at(0);

  if (!newMessage) {
    throw new Error("cannot insert message");
  }

  return getMessageFromRaw(newMessage, user);
}
