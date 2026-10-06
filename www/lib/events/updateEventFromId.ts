import sql from "../db";
import { Event, isEventType } from "../types";

export default async function updateEventFromId({
  eventId,
  userId,
  type,
  title,
  description,
  startsAt,
  endsAt,
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
  startsAt: string;
  endsAt: string | null;
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
      }[]
    >`
    UPDATE public.events
    SET
      type = ${type},
      title = ${title},
      description = ${description},
      starts_at = ${startsAt},
      ends_at = ${endsAt},
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
      image_url AS "coverUrl",
      image_width AS "coverWidth",
      image_height AS "coverHeight",
      starts_at::text AS "startsAt",
      ends_at::text AS "endsAt",
      timezone,
      price,
      venue,
      url,
      created_at::text AS "createdAt",
      updated_at::text AS "updatedAt";`
  ).at(0);

  if (!updatedEvent) return undefined;

  return {
    ...updatedEvent,
    type: isEventType(updatedEvent.type) ? updatedEvent.type : "EVENT",
    coverWidth: updatedEvent.coverWidth
      ? parseInt(updatedEvent.coverWidth)
      : null,
    coverHeight: updatedEvent.coverHeight
      ? parseInt(updatedEvent.coverHeight)
      : null,
  };
}
