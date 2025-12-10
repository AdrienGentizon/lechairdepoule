import getUserPseudo from "../auth/getUserPseudo";
import sql from "../db";

export default async function selectConversations() {
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
    >`
    SELECT
      c.id::text,
      c.title,
      c.description,
      c.image_url as "coverUrl",
      c.image_width as "coverWidth",
      c.image_height as "coverHeight",
      c.created_at::text as "createdAt",
      u.id::text as "userId",
      u.pseudo as "userPseudo",
      u.email as "userEmail",
      u.banned_at::text as "userBannedAt"
    FROM
      public.conversations c,
      public.users u
    WHERE
      c.created_by = u.id
    ORDER BY
      c.created_at DESC;`
  ).map(
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
  );
}
