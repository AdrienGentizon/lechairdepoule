import sql from "../db";

type Row = {
  id: string;
  messageId: string;
  createdAt: string;
  readAt: string | null;
  type: "mention" | "reply";
  conversationId: string | null;
  conversationTitle: string | null;
  excerpt: string;
};

export default async function selectUnreadUsernotifications({
  userId,
}: {
  userId: string;
}) {
  return (
    await sql<Row[]>`
  SELECT
    notifications.id::text,
    notifications.message_id::text as "messageId",
    notifications.created_at as "createdAt",
    notifications.read_at as "readAt",
    notifications.type,
    messages.conversation_id::text as "conversationId",
    SUBSTRING(messages.body, 1, 30) as "excerpt",
    conversations.title as "conversationTitle"
  FROM messages
  JOIN notifications ON notifications.message_id = messages.id
  JOIN conversations ON conversations.id = messages.conversation_id
  WHERE notifications.user_id = ${userId} AND read_at IS NULL`
  ).reduce((acc: Row[], curr) => {
    return [
      ...acc.filter(({ messageId }) => messageId !== curr.messageId),
      curr,
    ];
  }, []);
}
