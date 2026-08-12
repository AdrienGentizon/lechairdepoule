import sql from "../db";
import { Conversation } from "../types";

export default async function selectConversationsByTypes(
  types: Conversation["type"][],
  from: string,
  to?: string
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
        timezone: string | null;
        price: string | null;
        venue: string | null;
        url: string | null;
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
      em.starts_at::text as "startsAt",
      em.ends_at::text as "endsAt",
      em.timezone,
      em.price::text as "price",
      em.venue::text as "venue",
      em.url AS "url",
      c.created_at::text as "createdAt",
      u.id::text as "userId",
      u.pseudo as "userPseudo"
    FROM
      public.conversations c
      JOIN public.users u ON c.created_by = u.id
      LEFT JOIN public.event_metadata em ON em.conversation_id = c.id
    WHERE
      c.deleted_at IS NULL
      AND c.type in ${sql(types)}
      -- started by the window's upper bound (covers events starting today)
      AND (${to ?? null}::timestamptz IS NULL OR em.starts_at <= ${to ?? null})
      -- not finished before the window's lower bound (covers ongoing and finishing-today events)
      AND COALESCE(em.ends_at, em.starts_at) >= ${from}
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
