import sql from "../db";

export default async function insertMentions({
  messageId,
  userIds,
}: {
  messageId: string;
  userIds: string[];
}) {
  if (userIds.length === 0) return [];

  return sql<{ userId: string }[]>`
  INSERT INTO notifications ${sql(
    userIds.map((userId) => {
      return {
        user_id: userId,
        message_id: messageId,
        type: "mention",
        created_at: new Date().toISOString(),
      };
    })
  )}
  RETURNING
    id::text;`;
}
