import sql from "../db";

export default async function upsertThreadNotifications({
  parentMessageId,
  newMessageId,
  senderId,
}: {
  parentMessageId: string;
  newMessageId: string;
  senderId: string;
}) {
  await sql`
  WITH participants AS (
    SELECT DISTINCT user_id
    FROM messages
    WHERE id = ${parentMessageId} OR parent_message_id = ${parentMessageId}
  )
  INSERT INTO notifications (user_id, message_id, type, created_at)
  SELECT user_id, ${newMessageId}, 'reply', NOW()
  FROM participants
  WHERE user_id != ${senderId}
  ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = NULL`;
}
