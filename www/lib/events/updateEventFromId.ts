import { toPublicUrl } from "@cdp/lib/s3";

import sql from "../db";
import { Event, isEventType } from "../types";

export default async function updateEventFromId({
  eventId,
  userId,
  type,
  title,
  description,
  startDate,
  startTime,
  endDate,
  endTime,
  timezone,
  price,
  venue,
  url,
}: {
  eventId: string;
  userId: string;
  type: Event["type"];
  title: string;
  description: string;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
  price: string | null;
  venue: string | null;
  url: string | null;
}) {
  const updatedEvent = (
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
      }[]
    >`
    UPDATE public.events
    SET
      type = ${type},
      title = ${title},
      description = ${description},
      start_date = ${startDate}::date,
      start_time = ${startTime}::time,
      end_date = ${endDate}::date,
      end_time = ${endTime}::time,
      timezone = ${timezone},
      price = ${price},
      venue = ${venue},
      url = ${url},
      updated_at = ${new Date()}
    WHERE
      id = ${eventId}
      AND created_by = ${userId}
      AND deleted_at IS NULL
    RETURNING
      id::text,
      type,
      title,
      description,
      image_key AS "coverKey",
      image_width AS "coverWidth",
      image_height AS "coverHeight",
      start_date::text AS "startDate",
      to_char(start_time, 'HH24:MI') AS "startTime",
      end_date::text AS "endDate",
      to_char(end_time, 'HH24:MI') AS "endTime",
      timezone,
      price,
      venue,
      url,
      created_at::text AS "createdAt",
      updated_at::text AS "updatedAt";`
  ).at(0);

  if (!updatedEvent) return undefined;

  const { coverKey, ...event } = updatedEvent;

  return {
    ...event,
    type: isEventType(event.type) ? event.type : "EVENT",
    coverUrl: coverKey ? toPublicUrl(coverKey) : null,
    coverWidth: event.coverWidth ? parseInt(event.coverWidth) : null,
    coverHeight: event.coverHeight ? parseInt(event.coverHeight) : null,
  };
}
