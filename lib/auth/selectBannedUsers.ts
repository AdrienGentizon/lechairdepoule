import sql from "../db";

export default async function selectBannedUsers() {
  return await sql<
    {
      id: string;
      pseudo: string | null;
      role: string | null;
      createdAt: string;
      bannedAt: string | null;
      deletedAt: string | null;
      tosAcceptedAt: string | null;
    }[]
  >`SELECT
      id::text,
      pseudo,
      role,
      created_at::text as "createdAt",
      banned_at::text as "bannedAt",
      deleted_at::text as "deletedAt",
      tos_accepted_at::text as "tosAcceptedAt"
    FROM public.users
    WHERE banned_at IS NOT NULL
    ORDER BY banned_at DESC`;
}
