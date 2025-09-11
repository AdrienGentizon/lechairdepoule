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
        userId: string;
        conversationId: string | null;
        userPseudo: string;
      }[]
    >`
    WITH user_messages as (
    SELECT
      m.id as message_id,
      u.id as user_id,
      u.pseudo as user_pseudo
    FROM
      public.messages m,
      public.users u
    WHERE
      m.id = ${messageId}
      AND m.user_id = u.id
      )
    UPDATE public.messages m
    SET
      reported_by = ${reportedBy.id},
      reported_at = ${new Date().toISOString()}
    FROM user_messages
    WHERE id = user_messages.message_id
    RETURNING
      m.id::text,
      m.body,
      m.created_at::text as "createdAt",
      m.updated_at::text as "updatedAt",
      m.reported_at::text as "reportedAt",
      m.user_id::text as "userId",
      m.conversation_id::text as "conversationId",
      user_messages.user_pseudo as "userPseudo";`
  )
    .map(({ userPseudo, ...message }) => {
      if (message.reportedAt) {
        return {
          ...message,
          body: "---redacted---",
          user: { pseudo: userPseudo },
        };
      }
      return { ...message, user: { pseudo: userPseudo } };
    })
    .at(0);
}
