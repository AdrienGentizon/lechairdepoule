import sql from "../db";
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
  user: { id: string; pseudo: string; bannedAt: string | null };
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
  WITH target_conversation AS (
    SELECT id FROM public.conversations WHERE id = ${conversationId} AND reported_at IS NULL
  )
  INSERT INTO
	messages (conversation_id, parent_message_id, body, user_id, created_at)
  SELECT
    target_conversation.id, ${parentMessageId ?? null}, ${body}, ${user.id}, ${Date.now()}
  FROM target_conversation
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
