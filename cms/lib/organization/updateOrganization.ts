import sql from "@/lib/db";
import { OrganizationInput } from "@/lib/validation";

export default async function updateOrganization(
  inputs: OrganizationInput & {
    organizationId: string;
    userId: string;
  },
) {
  return (
    await sql<
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
    UPDATE organizations
    SET
      type = ${inputs.type},
      name = ${inputs.name},
      description = ${inputs.description},
      country = ${inputs.country},
      zipcode = ${inputs.zipcode},
      city = ${inputs.city},
      street = ${inputs.street},
      updated_at = NOW()
    WHERE
      id = ${inputs.organizationId}
      AND managed_by = ${inputs.userId}
      AND deleted_at IS NULL
    RETURNING
      id::text,
      type,
      name,
      description,
      image_url,
      image_width,
      image_height,
      country,
      zipcode,
      city,
      street,
      created_at::text,
      updated_at::text;`
  ).at(0);
}
