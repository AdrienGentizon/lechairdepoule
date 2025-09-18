import sql from "../db";

export default async function selectConversations() {
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
      public.conversations c,
      public.users u
    WHERE
      c.created_by = u.id
    ORDER BY
      c.created_at DESC;`
  ).map(
    ({ userId, userPseudo, userBannedAt: _userBannedAt, ...conversation }) => {
      return {
        ...conversation,
        createdBy: {
          id: userId,
          pseudo: userPseudo,
        },
      };
    },
  );
}
