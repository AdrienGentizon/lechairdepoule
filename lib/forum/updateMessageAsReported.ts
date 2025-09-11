import sql from "../db";
import { User } from "../types";

export default async function updateMessageAsReported({
  messageId,
  reportedBy,
}: {
  messageId: string;
  reportedBy: User;
}) {
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
    UPDATE public.messages
    SET
      reported_by = ${reportedBy.id},
      reported_at = ${new Date().toISOString()}
    WHERE id = ${messageId}
    RETURNING
      id::text,
      body,
      created_at::text as "createdAt",
      updated_at::text as "updatedAt",
      reported_at::text as "reportedAt",
      reported_by::text as "reportedBy",
      user_id::text as "userId",
      conversation_id::text as "conversationId";`
  )
    .map((message) => {
      if (message.reportedAt) {
        return {
          ...message,
          body: "---redacted---",
        };
      }
      return message;
    })
    .at(0);
}
