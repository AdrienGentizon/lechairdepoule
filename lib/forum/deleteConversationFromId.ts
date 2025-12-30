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
    >`UPDATE public.conversations
      SET deleted_at = ${Date.now()}
      WHERE
        id = ${conversationId}
        AND created_by = ${userId}
      RETURNING
        id::text;`
  ).at(0);
}
