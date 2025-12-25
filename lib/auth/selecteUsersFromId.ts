import sql from "../db";

export async function selectUsersFromId(includes: string[]) {
  return await sql<
    {
      id: string;
      email: string;
      pseudo: string | null;
      role: string | null;
      createdAt: string;
      bannedAt: string | null;
      deletedAt: string | null;
      lastConnection: string | null;
    }[]
  >`SELECT 
      id::text,
      email,
      pseudo,
      role,
      created_at::text as "createdAt",
      banned_at::text as "bannedAt",
      deleted_at::text as "deletedAt"
    FROM public.users WHERE id IN ${sql(includes)}`;
}
