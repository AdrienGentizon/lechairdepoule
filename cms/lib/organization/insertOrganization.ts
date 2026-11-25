import sql from "@/lib/db";
import { OrganizationInput } from "@/lib/validation";

export default async function insertOrganization(
  inputs: OrganizationInput & {
    managedBy: string;
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
    INSERT INTO
      organizations (managed_by, type, name, description, country, zipcode, city, street, created_at, updated_at)
    VALUES
      (
        ${inputs.managedBy},
        ${inputs.type},
        ${inputs.name},
        ${inputs.description},
        ${inputs.country},
        ${inputs.zipcode},
        ${inputs.city},
        ${inputs.street},
        NOW(),
        NOW()
      )
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
