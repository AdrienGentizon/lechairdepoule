import { supabaseServerSide } from "../supabaseServerSide";
import { Conversation, User } from "../types";

function getConversationFromRaw(
  raw: {
    id: string;
    title: string;
    description: string;
    created_by: string;
    created_at: string;
  },
  createdBy: { id: string; pseudo: string; bannedAt: string | null },
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
  const { data, error } = await supabaseServerSide
    .from("conversations")
    .insert({
      title,
      description,
      created_by: user.id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return getConversationFromRaw(data, {
    id: user.id,
    pseudo: user.pseudo,
    bannedAt: user.bannedAt,
  });
}
