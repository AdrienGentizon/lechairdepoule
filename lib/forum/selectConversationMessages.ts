import getUserPseudo from "../auth/getUserPseudo";
import sql from "../db";
import { reportedMessageBodyReplacement } from "../wordings";

export default async function selectConversationMessages(
  conversationId: string,
  offset = 0,
  limit = 100
) {
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
        userPseudo: string | null;
        userEmail: string;
        userBannedAt: string | null;
      }[]
    >`
    SELECT
      m.id::text,
      m.body,
      m.created_at::text as "createdAt",
      m.updated_at::text as "updatedAt",
      m.reported_at::text as "reportedAt",
      m.reported_by::text as "reportedBy",
      m.user_id::text as "userId",
      m.conversation_id::text as "conversationId",
      u.pseudo as "userPseudo",
      u.email as "userEmail",
      u.banned_at::text as "userBannedAt"
    FROM
      public.messages m,
      public.users u
    WHERE
      conversation_id = ${conversationId}
      AND m.user_id = u.id
    ORDER BY
      m.created_at DESC
    OFFSET ${offset}
    LIMIT ${limit};`
  ).map(({ userBannedAt, userPseudo, userEmail, userId, ...message }) => {
    if (message.reportedAt || userBannedAt) {
      return {
        ...message,
        body: reportedMessageBodyReplacement,
        user: {
          id: userId,
          pseudo: getUserPseudo({ pseudo: userPseudo, email: userEmail }),
          bannedAt: userBannedAt,
        },
      };
    }
    return {
      ...message,
      user: {
        id: userId,
        pseudo: getUserPseudo({ pseudo: userPseudo, email: userEmail }),
        bannedAt: userBannedAt,
      },
    };
  });
}
