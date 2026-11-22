import sql from "../db";

export default async function selectClerkUserFromEmail({
  email,
}: {
  email: string;
}) {
  return (
    await sql<{ id: string }[]>`SELECT id::text
      FROM public.users
      WHERE
        auth_provider='clerk'
        AND email=${email}
      ORDER BY created_at ASC
      LIMIT 1`
  ).at(0);
}
