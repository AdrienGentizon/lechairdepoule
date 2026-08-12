import sql from "../db";

export default async function selectEvents({
  from,
  to,
}: {
  from: string;
  to?: string;
}) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string | null;
        coverUrl: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        startsAt: string;
        endsAt: string | null;
        timezone: string;
        price: string | null;
        venue: string | null;
        url: string | null;
        createdAt: string;
        updatedAt: string;
        userId: string;
        userPseudo: string | null;
        userBannedAt: string | null;
      }[]
    >`
    SELECT
      e.id::text,
      e.title,
      e.description,
      e.image_url as "coverUrl",
      e.image_width as "coverWidth",
      e.image_height as "coverHeight",
      e.starts_at::text as "startsAt",
      e.ends_at::text as "endsAt",
      e.timezone,
      e.price,
      e.venue,
      e.url,
      e.created_at::text as "createdAt",
      e.updated_at::text as "updatedAt",
      u.id::text as "userId",
      u.pseudo as "userPseudo",
      u.banned_at::text as "userBannedAt"
    FROM
      public.events e
      JOIN public.users u ON e.created_by = u.id
    WHERE
      e.deleted_at IS NULL
      AND (
        ${to ?? null}::timestamptz IS NULL
        OR (e.starts_at AT TIME ZONE e.timezone)::date <= (${to ?? null}::timestamptz AT TIME ZONE 'UTC')::date
      )
      AND (COALESCE(e.ends_at, e.starts_at) AT TIME ZONE e.timezone)::date >= (${from}::timestamptz AT TIME ZONE 'UTC')::date
    ORDER BY
      e.starts_at ASC;`
  ).map(
    ({
      userId,
      userPseudo,
      userBannedAt,
      coverUrl,
      coverWidth,
      coverHeight,
      ...event
    }) => ({
      ...event,
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
