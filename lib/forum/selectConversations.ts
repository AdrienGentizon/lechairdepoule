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
        type: string | null;
        startsAt: string | null;
        endsAt: string | null;
        reportedAt: string | null;
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
      c.type,
      cd.starts_at::text as "startsAt",
      cd.ends_at::text as "endsAt",
      c.reported_at::text as "reportedAt",
      c.created_at::text as "createdAt",
      u.id::text as "userId",
      u.pseudo as "userPseudo",
      u.email as "userEmail",
      u.banned_at::text as "userBannedAt"
    FROM
      public.conversations c
      JOIN public.users u ON c.created_by = u.id
      LEFT JOIN public.conversation_dates cd ON cd.conversation_id = c.id
    WHERE
      c.deleted_at IS NULL
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
