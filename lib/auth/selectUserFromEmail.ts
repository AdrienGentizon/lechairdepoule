import sql from "../db";

export default async function selectUserFromEmail(email: string) {
  return (
    await sql<
      {
        id: string;
        email: string;
        pseudo: string;
        createdAt: string;
        bannedAt: string | null;
        deletedAt: string | null;
        lastConnection: string | null;
      }[]
    >`SELECT
        id::text,
        email,
        pseudo,
        created_at::text as "createdAt",
        banned_at::text as "bannedAt",
        deleted_at::text as "deletedAt",
        last_connection::text as "lastConnection"
      FROM public.users WHERE email=${email}`
  ).at(0);
}
