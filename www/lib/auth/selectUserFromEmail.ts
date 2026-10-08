import sql from "@/lib/db";

export default async function selectUserFromEmail(inputs: { email: string }) {
  return (
    await sql<
      {
        id: string;
        role: (string & {}) | "admin";
        authProvider: (string & {}) | "clerk" | "better-auth";
        createdAt: Date;
      }[]
    >`
  SELECT
    id::text,
    role,
    auth_provider as "authProvider",
    created_at as "createdAt"
  FROM users u
  WHERE
    u.email = ${inputs.email};`
  ).at(0);
}
