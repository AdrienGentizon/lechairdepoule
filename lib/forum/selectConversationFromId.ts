import sql from "../db";

export default async function selectConversationFromId(conversationId: string) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string | null;
        type: string | null;
        startsAt: string | null;
        endsAt: string | null;
        coverUrl: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        createdAt: string;
        reportedAt: string | null;
        userId: string;
        userPseudo: string | null;
        userBannedAt: string | null;
      }[]
    >`SELECT
        c.id::text,
        c.title,
        c.description,
        c.type,
        cd.starts_at::text AS "startsAt",
        cd.ends_at::text AS "endsAt",
        c.image_url AS "coverUrl",
        c.image_width as "coverWidth",
        c.image_height as "coverHeight",
        c.created_at::text AS "createdAt",
        c.reported_at::text AS "reportedAt",
        u.id::text AS "userId",
        u.pseudo AS "userPseudo",
        u.banned_at::text AS "userBannedAt"
      FROM
        public.conversations c
        JOIN public.users u ON c.created_by = u.id
        LEFT JOIN public.conversation_dates cd ON cd.conversation_id = c.id
      WHERE
        c.id = ${conversationId}
        AND c.deleted_at IS NULL;`
  )
    .map(
      ({
        userId,
        userPseudo,
        userBannedAt,
        coverUrl,
        coverWidth,
        coverHeight,
        ...conversation
      }) => ({
        ...conversation,
        coverUrl,
        coverWidth: coverWidth ? parseInt(coverWidth) : null,
        coverHeight: coverHeight ? parseInt(coverHeight) : null,
        createdBy: { id: userId, pseudo: userPseudo ?? "", bannedAt: userBannedAt },
      })
    )
    .at(0);
}
