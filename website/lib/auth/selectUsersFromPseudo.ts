import sql from "../db";

export default async function selectUsersFromPseudo({
  pseudos,
}: {
  pseudos: string[];
}) {
  return sql<
    { id: string; pseudo: string | null }[]
  >`SELECT id::text, pseudo FROM users WHERE pseudo IN ${sql(pseudos)};`;
}
