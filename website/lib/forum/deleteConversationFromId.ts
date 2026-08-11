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
      SET deleted_at = ${new Date()}
      WHERE
        id = ${conversationId}
        AND created_by = ${userId}
        AND reported_at IS NULL
      RETURNING
        id::text;`
  ).at(0);
}
