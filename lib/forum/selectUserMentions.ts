import sql from "../db";

export default async function selectUserMentions({
  userId,
}: {
  userId: string;
}) {
  return sql<
    {
      id: string;
      messageId: string;
      createdAt: string;
      readAt: string | null;
    }[]
  >`
  SELECT
    id::text,
    message_id as "messageId",
    created_at as "createdAt",
    read_at as "readAt"
  FROM mentions WHERE user_id = ${userId}`;
}
