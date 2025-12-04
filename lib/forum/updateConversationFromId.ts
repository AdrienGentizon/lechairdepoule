import sql from "../db";
import { Conversation } from "../types";

type AllowedFields = Partial<Pick<Conversation, "title" | "description">>;

export default async function updateConversationFromId({
  conversationId,
  userId,
  payload,
}: {
  conversationId: string;
  userId: string;
  payload: Partial<Conversation>;
}) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string;
      }[]
    >`UPDATE public.conversations
      SET ${sql(payload, ...(["title", "description"] satisfies (keyof AllowedFields)[]))}
      WHERE
        id = ${conversationId}
        AND created_by = ${userId}
      RETURNING
        id::text,
        title,
        description;`
  ).at(0);
}
