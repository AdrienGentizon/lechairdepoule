import sql from "../db";

export async function selectUsersFromId(includes: string[]) {
  return await sql<
    {
      id: string;
      pseudo: string | null;
      role: string | null;
      createdAt: string;
      bannedAt: string | null;
      deletedAt: string | null;
    }[]
  >`SELECT
      id::text,
      pseudo,
      role,
      created_at::text as "createdAt",
      banned_at::text as "bannedAt",
      deleted_at::text as "deletedAt"
    FROM public.users WHERE id IN ${sql(includes)}`;
}
