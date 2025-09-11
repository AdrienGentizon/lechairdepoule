import sql from "../db";

export default async function selectMainConversationMessages(
  offset = 0,
  limit = 100,
) {
  return (
    await sql<
      {
        id: string;
        body: string;
        createdAt: string;
        updatedAt: string | null;
        reportedAt: string | null;
        reportedBy: string | null;
        userId: string;
        conversationId: string | null;
      }[]
    >`
    SELECT
      id::text,
      body,
      created_at::text as "createdAt",
      updated_at::text as "updatedAt",
      reported_at::text as "reportedAt",
      reported_by::text as "reportedBy",
      user_id::text as "userId",
      conversation_id::text as "conversationId"
    FROM public.messages
    WHERE conversation_id IS NULL
    ORDER BY created_at DESC
    OFFSET ${offset}
    LIMIT ${limit};`
  ).map((message) => {
    if (message.reportedAt) {
      return {
        ...message,
        body: "---redacted---",
      };
    }
    return message;
  });
}
