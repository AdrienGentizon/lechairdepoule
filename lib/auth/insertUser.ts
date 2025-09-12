import sql from "../db";

export default async function insertUser({
  email,
  pseudo,
}: {
  email: string;
  pseudo: string;
}) {
  return (
    await sql<
      {
        id: string;
        email: string;
        pseudo: string;
        role: string | null;
        createdAt: string;
        bannedAt: string | null;
        deletedAt: string | null;
        lastConnection: string | null;
      }[]
    >`INSERT INTO public.users (email, pseudo, created_at)
        VALUES(${email}, ${pseudo}, ${new Date().toUTCString()})
      RETURNING
        id::text,
        email,
        pseudo,
        role,
        created_at::text as "createdAt",
        banned_at::text as "bannedAt",
        deleted_at::text as "deletedAt",
        last_connection::text as "lastConnection";`
  ).at(0);
}
