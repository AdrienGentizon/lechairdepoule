import sql from "./db";

export default async function selectUserFromAuthId(inputs: {
  authId: string;
  authProvider: (string & {}) | "clerk" | "better-auth";
}) {
  return (
    await sql<{ id: string; role: (string & {}) | "admin"; createdAt: Date }[]>`
  SELECT
    id::text,
    role,
    created_at as "createdAt"
  FROM users u
  WHERE
    u.auth_id = ${inputs.authId}
    AND u.auth_rpvoder = ${inputs.authProvider};`
  ).at(0);
}
