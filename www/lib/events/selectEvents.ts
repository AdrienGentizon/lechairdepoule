import { toPublicUrl } from "@cdp/lib/s3";

import sql from "../db";
import { isEventType } from "../types";

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
        type: string;
        title: string;
        description: string | null;
        coverKey: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        startDate: string;
        startTime: string | null;
        endDate: string | null;
        endTime: string | null;
        timezone: string;
        price: string | null;
        venue: string | null;
        url: string | null;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        userId: string;
        userPseudo: string | null;
        userBannedAt: string | null;
      }[]
    >`
    SELECT
      e.id::text,
      e.type,
      e.title,
      e.description,
      e.image_key as "coverKey",
      e.image_width as "coverWidth",
      e.image_height as "coverHeight",
      e.start_date::text as "startDate",
      to_char(e.start_time, 'HH24:MI') as "startTime",
      e.end_date::text as "endDate",
      to_char(e.end_time, 'HH24:MI') as "endTime",
      e.timezone,
      e.price,
      e.venue,
      e.url,
      e.created_at::text as "createdAt",
      e.updated_at::text as "updatedAt",
      e.organization_id::text as "organizationId",
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
        OR e.start_date <= (${to ?? null}::timestamptz AT TIME ZONE 'UTC')::date
      )
      AND COALESCE(e.end_date, e.start_date) >= (${from}::timestamptz AT TIME ZONE 'UTC')::date
    ORDER BY
      e.start_date ASC,
      e.start_time ASC NULLS FIRST;`
  ).map(
    ({
      type,
      userId,
      userPseudo,
      userBannedAt,
      coverKey,
      coverWidth,
      coverHeight,
      ...event
    }) => ({
      ...event,
      type: isEventType(type) ? type : "EVENT",
      coverUrl: coverKey ? toPublicUrl(coverKey) : null,
      coverWidth: coverWidth ? parseInt(coverWidth) : null,
      coverHeight: coverHeight ? parseInt(coverHeight) : null,
      createdBy: {
        id: userId,
        pseudo: userPseudo ?? "",
        bannedAt: userBannedAt,
      },
    }),
  );
}
