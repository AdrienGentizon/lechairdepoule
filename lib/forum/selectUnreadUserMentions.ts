import sql from "../db";

type Row = {
  id: string;
  messageId: string;
  createdAt: string;
  readAt: string | null;
  conversationId: string | null;
  conversationTitle: string | null;
  excerpt: string;
};

export default async function selectUnreadUserMentions({
  userId,
}: {
  userId: string;
}) {
  return (
    await sql<Row[]>`
  SELECT
    mentions.id::text,
    mentions.message_id::text as "messageId",
    mentions.created_at as "createdAt",
    mentions.read_at as "readAt",
    messages.conversation_id::text as "conversationId",
    SUBSTRING(messages.body, 1, 30) as "excerpt",
    conversations.title as "conversationTitle"
  FROM messages
  JOIN mentions ON mentions.message_id = messages.id
  JOIN conversations ON conversations.id = messages.conversation_id
  WHERE mentions.user_id = ${userId} AND read_at IS NULL`
  ).reduce((acc: Row[], curr) => {
    return [
      ...acc.filter(({ messageId }) => messageId !== curr.messageId),
      curr,
    ];
  }, []);
}
