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
        userId: string;
        conversationId: string | null;
        userPseudo: string;
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
      u.banned_at::text as "userBannedAt"
    FROM
      public.messages m,
      public.users u
    WHERE
      conversation_id IS NULL
      AND m.user_id = u.id
    ORDER BY
      m.created_at DESC
    OFFSET ${offset}
    LIMIT ${limit};`
  ).map(({ userBannedAt, userPseudo, ...message }) => {
    if (message.reportedAt || userBannedAt) {
      return {
        ...message,
        body: "---redacted---",
        user: {
          pseudo: userPseudo,
        },
      };
    }
    return {
      ...message,
      user: {
        pseudo: userPseudo,
      },
    };
  });
}
