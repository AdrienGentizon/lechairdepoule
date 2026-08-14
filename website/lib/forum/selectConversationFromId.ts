import sql from "../db";
import { isConversationType } from "../types";

export default async function selectConversationFromId(conversationId: string) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string | null;
        type: string;
        coverUrl: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        isPinned: boolean;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
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
        c.image_url AS "coverUrl",
        c.image_width as "coverWidth",
        c.image_height as "coverHeight",
        c.is_pinned AS "isPinned",
        c.created_at::text AS "createdAt",
        c.updated_at::text AS "updatedAt",
        c.deleted_at::text AS "deletedAt",
        c.reported_at::text AS "reportedAt",
        u.id::text AS "userId",
        u.pseudo AS "userPseudo",
        u.banned_at::text AS "userBannedAt"
      FROM
        public.conversations c
        JOIN public.users u ON c.created_by = u.id
      WHERE
        c.id = ${conversationId}
        AND c.deleted_at IS NULL;`
  )
    .map(
      ({
        type,
        userId,
        userPseudo,
        userBannedAt,
        coverUrl,
        coverWidth,
        coverHeight,
        ...conversation
      }) => ({
        ...conversation,
        type: isConversationType(type) ? type : "TOPIC",
        coverUrl,
        coverWidth: coverWidth ? parseInt(coverWidth) : null,
        coverHeight: coverHeight ? parseInt(coverHeight) : null,
        createdBy: {
          id: userId,
          pseudo: userPseudo ?? "",
          bannedAt: userBannedAt,
        },
      })
    )
    .at(0);
}
