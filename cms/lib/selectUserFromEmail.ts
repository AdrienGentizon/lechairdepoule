import sql from "./db";

export default async function selectUserFromEmail(inputs: { email: string }) {
  return (
    await sql<
      {
        id: string;
        role: (string & {}) | "admin";
        authId: string;
        authProvider: (string & {}) | "clerk" | "better-auth";
        createdAt: Date;
      }[]
    >`
  SELECT
    id::text,
    role,
    auth_id as "authId",
    auth_provider as "authProvider",
    created_at as "createdAt"
  FROM users u
  WHERE
    u.email = ${inputs.email};`
  ).at(0);
}
