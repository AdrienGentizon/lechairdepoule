import sql from "../db";

export default async function selectReportedMessages() {
  return (
    await sql<
      {
        id: string;
        body: string;
        createdAt: string;
        updatedAt: string | null;
        reportedAt: string;
        conversationId: string | null;
        parentMessageId: string | null;
        userId: string;
        userPseudo: string | null;
        userBannedAt: string | null;
      }[]
    >`
    SELECT
      m.id::text,
      m.body,
      m.created_at::text as "createdAt",
      m.updated_at::text as "updatedAt",
      m.reported_at::text as "reportedAt",
      m.user_id::text as "userId",
      m.conversation_id::text as "conversationId",
      m.parent_message_id::text as "parentMessageId",
      u.pseudo as "userPseudo",
      u.banned_at::text as "userBannedAt"
    FROM
      public.messages m,
      public.users u
    WHERE
      m.reported_at IS NOT NULL
      AND m.user_id = u.id
    ORDER BY
      m.reported_at DESC;`
  ).map(({ userBannedAt, userPseudo, userId, ...message }) => ({
    ...message,
    user: { id: userId, pseudo: userPseudo ?? "", bannedAt: userBannedAt },
  }));
}
