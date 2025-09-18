import { supabaseServerSide } from "../supabaseServerSide";
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
  const { data, error } = await supabaseServerSide
    .from("messages")
    .insert({
      conversation_id: conversationId,
      body,
      user_id: user.id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return getMessageFromRaw(data, user);
}
