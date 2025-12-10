import getUserPseudo from "../auth/getUserPseudo";
import sql from "../db";

export default async function selectConversationFromId(conversationId: string) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string | null;
        coverUrl: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        createdAt: string;
        userId: string;
        userPseudo: string | null;
        userEmail: string;
        userBannedAt: string | null;
      }[]
    >`SELECT
        c.id::text,
        c.title,
        c.description,
        c.image_url AS "coverUrl",
        c.image_width as "coverWidth",
        c.image_height as "coverHeight",
        c.created_at::text AS "createdAt",
        u.id::text AS "userId",
        u.pseudo AS "userPseudo",
        u.email AS "userEmail",
        u.banned_at::text AS "userBannedAt"
      FROM
        public.conversations c,
        public.users u
      WHERE
        c.id = ${conversationId}
        AND c.created_by = u.id;`
  )
    .map(
      ({
        userId,
        userPseudo,
        userEmail,
        userBannedAt,
        coverUrl,
        coverWidth,
        coverHeight,
        ...conversation
      }) => {
        return {
          ...conversation,
          coverUrl: coverUrl,
          coverWidth: coverWidth ? parseInt(coverWidth) : null,
          coverHeight: coverHeight ? parseInt(coverHeight) : null,
          createdBy: {
            id: userId,
            pseudo: getUserPseudo({ pseudo: userPseudo, email: userEmail }),
            bannedAt: userBannedAt,
          },
        };
      }
    )
    .at(0);
}
