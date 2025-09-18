import sql from "../db";

export default async function selectConversationFromId(conversationId: string) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string;
        createdAt: string;
        userId: string;
        userPseudo: string;
        userBannedAt: string | null;
      }[]
    >`
    SELECT
      c.id::text,
      c.title,
      c.description,
      c.created_at::text as "createdAt",
      u.id as "userId",
      u.pseudo as "userPseudo",
      u.banned_at::text as "userBannedAt"
    FROM
      public.conversations c LEFT JOIN public.messages m ON c.id = m.conversation_id,
      public.users u
    WHERE
      c.id = ${conversationId};`
  )
    .map(
      ({
        userId,
        userPseudo,
        userBannedAt: _userBannedAt,
        ...conversation
      }) => {
        return {
          ...conversation,
          createdBy: {
            id: userId,
            pseudo: userPseudo,
          },
        };
      },
    )
    .at(0);
}
