import sql from "../db";

export default async function deleteConversationFromId({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  return (
    await sql<
      {
        id: string;
      }[]
    >`DELETE FROM public.conversations
      WHERE
        id = ${conversationId}
        AND created_by = ${userId}
      RETURNING
        id::text;`
  ).at(0);
}
