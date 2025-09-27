import sql from "../db";
import { User } from "../types";
import { reportedMessageBodyReplacement } from "../wordings";

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
        conversationId: string | null;
        userId: string;
        userPseudo: string;
        userBannedAt: string | null;
      }[]
    >`
    WITH user_messages as (
    SELECT
      m.id as message_id,
      u.id as user_id,
      u.pseudo as user_pseudo,
      u.banned_at as user_banned_at
    FROM
      public.messages m,
      public.users u
    WHERE
      m.id = ${messageId}
      AND m.user_id = u.id
      AND m.user_id != ${reportedBy.id}
      )
    UPDATE public.messages m
    SET
      reported_by = ${reportedBy.id},
      reported_at = ${new Date().toISOString()}
    FROM user_messages
    WHERE m.id = user_messages.message_id
    RETURNING
      m.id::text,
      m.body,
      m.created_at::text as "createdAt",
      m.updated_at::text as "updatedAt",
      m.reported_at::text as "reportedAt",
      m.user_id::text as "userId",
      m.conversation_id::text as "conversationId",
      user_messages.user_pseudo as "userPseudo",
      user_messages.user_banned_at as "userBannedAt";`
  )
    .map(({ userPseudo, userId, userBannedAt, ...message }) => {
      if (message.reportedAt) {
        return {
          ...message,
          body: reportedMessageBodyReplacement,
          user: { id: userId, pseudo: userPseudo, bannedAt: userBannedAt },
        };
      }
      return {
        ...message,
        user: { id: userId, pseudo: userPseudo, bannedAt: userBannedAt },
      };
    })
    .at(0);
}
