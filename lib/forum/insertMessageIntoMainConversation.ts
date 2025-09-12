import sql from "../db";
import { User } from "../types";

export default async function insertMessageIntoMainConversation({
  body,
  user,
}: {
  body: string;
  user: User;
}) {
  return (
    await sql<
      {
        id: string;
        body: string;
        createdAt: string;
        updatedAt: string | null;
        reportedAt: string | null;
        userId: string;
        conversationId: string | null;
      }[]
    >`
    INSERT INTO public.messages (body, user_id, created_at)
    VALUES (${body}, ${user.id}, ${new Date().toISOString()})
    RETURNING
    id::text,
    body,
    created_at::text as "createdAt",
    updated_at::text as "updatedAt",
    reported_at::text as "reportedAt",
    user_id::text as "userId",
    conversation_id::text as "conversationId"
    `
  ).at(0);
}
