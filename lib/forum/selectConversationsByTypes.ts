import sql from "../db";
import { Conversation } from "../types";

export default async function selectConversationsByTypes(
  types: Conversation["type"][],
  from: Date
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
        type: string | null;
        startsAt: string;
        endsAt: string | null;
        price: string | null;
        createdAt: string;
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
      cd.starts_at::text as "startsAt",
      cd.ends_at::text as "endsAt",
      cd.price::text as "price",
      c.created_at::text as "createdAt",
      u.id::text as "userId",
      u.pseudo as "userPseudo"
    FROM
      public.conversations c
      JOIN public.users u ON c.created_by = u.id
      LEFT JOIN public.conversation_dates cd ON cd.conversation_id = c.id
    WHERE
      c.deleted_at IS NULL
      AND c.type in ${sql(types)}
      AND cd.starts_at >= ${from}
      AND c.reported_at is NULL
      AND u.banned_at is NULL
    ORDER BY
      c.created_at DESC;`
  ).map(
    ({
      userId,
      userPseudo,
      coverUrl,
      coverWidth,
      coverHeight,
      ...conversation
    }) => ({
      ...conversation,
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
