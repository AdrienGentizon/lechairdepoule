import sql from "@/lib/db";

export default async function selectOrganizationEvents({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  return sql<
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
    SELECT
      e.id::text,
      e.type,
      e.title,
      e.description,
      e.image_key,
      e.image_url,
      e.image_width,
      e.image_height,
      e.start_date::text,
      to_char(e.start_time, 'HH24:MI') AS start_time,
      e.end_date::text,
      to_char(e.end_time, 'HH24:MI') AS end_time,
      e.timezone,
      e.price,
      e.venue,
      e.url,
      e.visibility,
      e.published_at::text,
      e.created_at::text,
      e.updated_at::text
    FROM events e JOIN organizations o ON e.organization_id = o.id
    WHERE
      o.id = ${organizationId}
      AND o.managed_by = ${userId}
      AND o.deleted_at IS NULL
      AND e.deleted_at IS NULL
    ORDER BY e.start_date DESC, e.start_time DESC NULLS LAST;`;
}
