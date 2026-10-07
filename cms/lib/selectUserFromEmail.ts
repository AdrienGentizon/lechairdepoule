import sql from "./db";

export default async function selectUserFromEmail(inputs: { email: string }) {
  return (
    await sql<{ id: string; role: (string & {}) | "admin"; createdAt: Date }[]>`
  SELECT
    id::text,
    role,
    created_at as "createdAt"
  FROM users u
  WHERE
    u.email = ${inputs.email};`
  ).at(0);
}
