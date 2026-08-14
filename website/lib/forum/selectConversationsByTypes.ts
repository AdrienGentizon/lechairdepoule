import sql from "../db";
import { Conversation, isConversationType } from "../types";

export default async function selectConversationsByTypes(
  types: Conversation["type"][]
) {
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
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        userId: string;
        userPseudo: string | null;
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
      c.created_at::text as "createdAt",
      c.updated_at::text as "updatedAt",
      c.deleted_at::text as "deletedAt",
      u.id::text as "userId",
      u.pseudo as "userPseudo"
    FROM
      public.conversations c
      JOIN public.users u ON c.created_by = u.id
    WHERE
      c.deleted_at IS NULL
      AND c.type in ${sql(types)}
      AND c.reported_at is NULL
      AND u.banned_at is NULL
    ORDER BY
      c.created_at DESC;`
  ).map(
    ({
      type,
      userId,
      userPseudo,
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
      },
    })
  );
}
