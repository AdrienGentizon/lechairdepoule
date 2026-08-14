import sql from "../db";
import { Event, isEventType } from "../types";

function getEventFromRaw(
  raw: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    coverWidth: string | null;
    coverHeight: string | null;
    starts_at: string;
    ends_at: string | null;
    timezone: string;
    price: string | null;
    venue: string | null;
    url: string | null;
    created_at: string;
    updated_at: string;
  },
  createdBy: { id: string; pseudo: string; bannedAt: string | null }
): Event {
  return {
    id: raw.id,
    type: isEventType(raw.type) ? raw.type : "EVENT",
    title: raw.title,
    description: raw.description,
    coverUrl: raw.coverUrl,
    coverWidth: raw.coverWidth ? parseInt(raw.coverWidth) : null,
    coverHeight: raw.coverHeight ? parseInt(raw.coverHeight) : null,
    startsAt: raw.starts_at,
    endsAt: raw.ends_at,
    timezone: raw.timezone,
    price: raw.price,
    venue: raw.venue,
    url: raw.url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    createdBy,
  };
}

export default async function insertEvent({
  type,
  title,
  description,
  cover,
  user,
  startsAt,
  endsAt,
  timezone,
  price,
  venue,
  url,
}: {
  type: string;
  title: string;
  description: string;
  cover?: {
    url: string;
    width: number;
    height: number;
  };
  user: { id: string; pseudo: string; bannedAt: string | null };
  startsAt: string;
  endsAt?: string | null;
  timezone: string;
  price?: string | null;
  venue?: string | null;
  url?: string | null;
}) {
  const now = new Date();

  const insertedEvent = (
    await sql<
      {
        id: string;
        type: string;
        title: string;
        description: string | null;
        coverUrl: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        starts_at: string;
        ends_at: string | null;
        timezone: string;
        price: string | null;
        venue: string | null;
        url: string | null;
        created_at: string;
        updated_at: string;
      }[]
    >`
    INSERT INTO
      events (type, title, description, image_url, image_width, image_height, starts_at, ends_at, timezone, price, venue, url, created_by, created_at, updated_at)
    VALUES
      (${type}, ${title}, ${description}, ${cover?.url ?? null}, ${cover?.width ?? null}, ${cover?.height ?? null}, ${startsAt}, ${endsAt ?? null}, ${timezone}, ${price ?? null}, ${venue ?? null}, ${url ?? null}, ${user.id}, ${now}, ${now})
    RETURNING
      id::text,
      type,
      title,
      description,
      image_url as "coverUrl",
      image_width as "coverWidth",
      image_height as "coverHeight",
      starts_at::text,
      ends_at::text,
      timezone,
      price,
      venue,
      url,
      created_at::text,
      updated_at::text;`
  ).at(0);

  if (!insertedEvent) {
    throw new Error("cannot insert event");
  }

  return getEventFromRaw(insertedEvent, {
    id: user.id,
    pseudo: user.pseudo,
    bannedAt: user.bannedAt,
  });
}
