import sql from "../db";

export default async function selectSimilarUsersByPseudo(search: string) {
  return await sql<
    {
      id: string;
      email: string;
      pseudo: string | null;
      role: string | null;
      createdAt: string;
      bannedAt: string | null;
      deletedAt: string | null;
      tosAcceptedAt: string | null;
      similarity: number;
    }[]
  >`SELECT
      id::text,
      email,
      pseudo,
      role,
      created_at::text as "createdAt",
      banned_at::text as "bannedAt",
      deleted_at::text as "deletedAt",
      tos_accepted_at::text as "tosAcceptedAt",
      SIMILARITY(pseudo, ${search}) as "similarity"
    FROM public.users
    WHERE pseudo % ${search};`;
}
