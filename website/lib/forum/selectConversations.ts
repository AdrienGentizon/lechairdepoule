import sql from "../db";
import { isConversationType } from "../types";

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
        type: string;
        isPinned: boolean;
        reportedAt: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        userId: string;
        userPseudo: string | null;
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
      c.is_pinned as "isPinned",
      c.reported_at::text as "reportedAt",
      c.created_at::text as "createdAt",
      c.updated_at::text as "updatedAt",
      c.deleted_at::text as "deletedAt",
      u.id::text as "userId",
      u.pseudo as "userPseudo",
      u.banned_at::text as "userBannedAt"
    FROM
      public.conversations c
      JOIN public.users u ON c.created_by = u.id
    WHERE
      c.deleted_at IS NULL
    ORDER BY
      c.created_at DESC;`
  ).map(
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
  );
}
