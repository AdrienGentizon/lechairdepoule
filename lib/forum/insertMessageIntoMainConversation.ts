import sql from "../db";
import { supabaseServerSide } from "../supabaseServerSide";
import { Message, User } from "../types";
import { getMessageFromRaw } from "./getMessageFromRaw";

const USE_SUPABASE_API = true;

export default async function insertMessageIntoMainConversation({
  body,
  user,
}: {
  body: string;
  user: User;
}) {
  if (USE_SUPABASE_API) {
    const { data, error } = await supabaseServerSide
      .from("messages")
      .insert({ body, user_id: user.id, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return getMessageFromRaw(data, user);
  }
  const insertedMessage = (
    await sql<
      {
        id: string;
        body: string;
        createdAt: string;
        updatedAt: string | null;
        reportedAt: string | null;
        userId: string;
        conversationId: string | null;
      }[]
    >`
    INSERT INTO public.messages (body, user_id, created_at)
    VALUES (${body}, ${user.id}, ${new Date().toISOString()})
    RETURNING
    id::text,
    body,
    created_at::text as "createdAt",
    updated_at::text as "updatedAt",
    reported_at::text as "reportedAt",
    user_id::text as "userId",
    conversation_id::text as "conversationId"
    `
  ).at(0);

  if (!insertedMessage) return;
  const { userId, ...message } = insertedMessage;
  return {
    ...message,
    user: {
      id: userId,
      pseudo: user.pseudo,
    },
  };
}
