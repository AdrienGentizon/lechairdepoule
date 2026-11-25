import sql from "@/lib/db";
import { EventInput } from "@/lib/validation";

export default async function insertEvent(
  inputs: Omit<EventInput, "cover"> & {
    organizationId: string;
    createdBy: string;
    imageKey: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
  },
) {
  return (
    await sql<
      {
        id: string;
        type: "EVENT" | "RELEASE";
        title: string;
        description: string | null;
        imageKey: string | null;
        imageUrl: string | null;
        imageWidth: number | null;
        imageHeight: number | null;
        startDate: string;
        startTime: string | null;
        endDate: string | null;
        endTime: string | null;
        timezone: string;
        price: string | null;
        venue: string | null;
        url: string | null;
        visibility: string;
        publishedAt: string | null;
        createdAt: string;
        updatedAt: string;
      }[]
    >`
    INSERT INTO
      events (type, title, description, image_key, image_width, image_height, start_date, start_time, end_date, end_time, starts_at, ends_at, timezone, price, venue, url, organization_id, venue_id, created_by, created_at, updated_at)
    SELECT
      ${inputs.type},
      ${inputs.title},
      ${inputs.description},
      ${inputs.imageKey},
      ${inputs.imageWidth}::int,
      ${inputs.imageHeight}::int,
      ${inputs.startDate}::date,
      ${inputs.startTime}::time,
      ${inputs.endDate}::date,
      ${inputs.endTime}::time,
      (${inputs.startDate}::date + COALESCE(${inputs.startTime}::time, '00:00')) AT TIME ZONE ${inputs.timezone},
      (${inputs.endDate}::date + COALESCE(${inputs.endTime}::time, '00:00')) AT TIME ZONE ${inputs.timezone},
      ${inputs.timezone},
      ${inputs.price},
      ${inputs.venue},
      ${inputs.url},
      o.id,
      CASE WHEN o.type = 'VENUE' THEN o.id END,
      ${inputs.createdBy}::int,
      NOW(),
      NOW()
    FROM organizations o
    WHERE
      o.id = ${inputs.organizationId}
      AND o.managed_by = ${inputs.createdBy}
      AND o.deleted_at IS NULL
    RETURNING
      id::text,
      type,
      title,
      description,
      image_key,
      image_url,
      image_width,
      image_height,
      start_date::text,
      to_char(start_time, 'HH24:MI') AS start_time,
      end_date::text,
      to_char(end_time, 'HH24:MI') AS end_time,
      timezone,
      price,
      venue,
      url,
      visibility,
      published_at::text,
      created_at::text,
      updated_at::text;`
  ).at(0);
}
