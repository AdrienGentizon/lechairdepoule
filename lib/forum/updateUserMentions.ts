import sql from "../db";

export default async function updateUserMentions({
  userId,
  messageIds,
}: {
  userId: string;
  messageIds: string[];
}) {
  return sql<
    { id: string; userId: string; messageId: string; readAt: string | null }[]
  >`
    UPDATE mentions
      SET read_at = NOW()
      WHERE
  	user_id = ${userId}
  	AND message_id IN ${sql(messageIds)}
      RETURNING
  	id::text,
  	user_id::text as "userId",
  	message_id::text as "messageId",
  	read_at as "readAt";`;
}
