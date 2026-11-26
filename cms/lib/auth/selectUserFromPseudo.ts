import sql from "../db";

export default async function selectUserFromPseudo({
  pseudo,
}: {
  pseudo: string;
}) {
  return (
    await sql<{ id: string }[]>`SELECT id::text
      FROM public.users
      WHERE LOWER(pseudo) = ${pseudo.toLowerCase()}`
  ).at(0);
}
