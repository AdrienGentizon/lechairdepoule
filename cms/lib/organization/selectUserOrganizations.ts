import sql from "@/lib/db";

export default async function selectUserOrganizations({
  userId,
}: {
  userId: string;
}) {
  return sql<
    {
      id: string;
      type: "VENUE" | "BAND" | "ARTIST" | "BOOKER" | null;
      name: string;
      description: string | null;
      imageUrl: string | null;
      imageWidth: number | null;
      imageHeight: number | null;
      country: string;
      zipcode: string;
      city: string;
      street: string | null;
      createdAt: string;
      updatedAt: string;
    }[]
  >`
    SELECT
      o.id::text,
      o.type,
      o.name,
      o.description,
      o.image_url,
      o.image_width,
      o.image_height,
      o.country,
      o.zipcode,
      o.city,
      o.street,
      o.created_at::text,
      o.updated_at::text
    FROM organizations o JOIN users u ON o.managed_by = u.id
    WHERE
      u.id = ${userId}
      AND u.deleted_at IS NULL
      AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC;`;
}
