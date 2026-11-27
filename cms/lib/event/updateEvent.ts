import sql from "@/lib/db";
import { EventInput } from "@/lib/validation";

export default async function updateEvent(
  inputs: Omit<EventInput, "type" | "cover"> & {
    eventId: string;
    organizationId: string;
    userId: string;
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
        deletedAt: string | null;
      }[]
    >`
    UPDATE events e
    SET
      title = ${inputs.title},
      description = ${inputs.description},
      start_date = ${inputs.startDate}::date,
      start_time = ${inputs.startTime}::time,
      end_date = ${inputs.endDate}::date,
      end_time = ${inputs.endTime}::time,
      timezone = ${inputs.timezone},
      price = ${inputs.price},
      venue = ${inputs.venue},
      url = ${inputs.url},
      image_key = ${inputs.imageKey},
      image_width = ${inputs.imageWidth}::int,
      image_height = ${inputs.imageHeight}::int,
      updated_at = NOW()
    FROM organizations o
    WHERE
      e.id = ${inputs.eventId}
      AND e.organization_id = o.id
      AND o.id = ${inputs.organizationId}
      AND o.managed_by = ${inputs.userId}
      AND o.deleted_at IS NULL
    RETURNING
      e.id::text,
      e.type,
      e.title,
      e.description,
      e.image_key,
      e.image_width,
      e.image_height,
      e.start_date::text,
      to_char(e.start_time, 'HH24:MI') AS start_time,
      e.end_date::text,
      to_char(e.end_time, 'HH24:MI') AS end_time,      e.timezone,
      e.price,
      e.venue,
      e.url,
      e.visibility,
      e.published_at::text,
      e.created_at::text,
      e.updated_at::text,
      e.deleted_at::text;`
  ).at(0);
}
