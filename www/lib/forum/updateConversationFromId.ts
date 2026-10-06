import sql from "../db";
import { isConversationType } from "../types";

export default async function updateConversationFromId({
  conversationId,
  userId,
  title,
  description,
}: {
  conversationId: string;
  userId: string;
  title: string;
  description: string;
}) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string;
        type: string;
        isPinned: boolean;
        coverUrl: string | null;
        coverWidth: number | null;
        coverHeight: number | null;
        updatedAt: string;
        deletedAt: string | null;
        reportedAt: string | null;
      }[]
    >`
        UPDATE public.conversations
        SET
          title = ${title},
          description = ${description},
          updated_at = ${new Date()}
        WHERE
          id = ${conversationId}
          AND created_by = ${userId}
          AND reported_at IS NULL
          AND deleted_at IS NULL
        RETURNING
          id::text,
          title,
          description,
          type,
          image_url AS "coverUrl",
          image_width::integer AS "coverWidth",
          image_height::integer AS "coverHeight",
          is_pinned AS "isPinned",
          updated_at::text AS "updatedAt",
          deleted_at::text AS "deletedAt",
          reported_at::text AS "reportedAt"`
  )
    .map(({ type, ...conversation }) => ({
      ...conversation,
      type: isConversationType(type) ? type : "TOPIC",
    }))
    .at(0);
}
