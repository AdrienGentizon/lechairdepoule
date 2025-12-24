import sql from "../db";
import { User } from "../types";
import { getMessageFromRaw } from "./getMessageFromRaw";

export default async function insertMessageIntoConversation({
  conversationId,
  parentMessageId,
  body,
  user,
}: {
  conversationId: string;
  parentMessageId: string | null;
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
      parent_message_id: string | null;
      user_id: string;
      reported_by: string | null;
    }[]
  >`
  INSERT INTO
	messages (conversation_id, parent_message_id, body, user_id, created_at)
  VALUES
    (${conversationId}, ${parentMessageId ?? null}, ${body}, ${user.id}, ${Date.now()})
  RETURNING
    id::text,
    body,
    created_at::text,
    updated_at::text,
    reported_at::text,
    conversation_id::text,
    parent_message_id::text,
    user_id::text,
    reported_by::text;`;

  const newMessage = rows.at(0);

  if (!newMessage) {
    throw new Error("cannot insert message");
  }

  return getMessageFromRaw(newMessage, user);
}
