import sql from "../db";

export default async function updateUserPseudo({
  userId,
  pseudo,
}: {
  userId: string;
  pseudo: string;
}) {
  return (
    await sql<{ id: string; pseudo: string }[]>`UPDATE public.users
      SET pseudo = ${pseudo}
      WHERE id = ${userId}
      RETURNING id::text, pseudo`
  ).at(0);
}
