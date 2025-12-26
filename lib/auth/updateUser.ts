import sql from "../db";

export default async function updateUser({
  userId,
  pseudo,
  cgu,
}: {
  userId: string;
  pseudo: string;
  cgu: boolean;
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
        tosAcceptedAt: string | null;
      }[]
    >`
    UPDATE public.users
    SET
      pseudo = ${pseudo},
      tos_accepted_at = ${cgu ? Date.now() : null}
    WHERE id = ${userId}
    RETURNING
      id::text,
      email,
      pseudo,
      role,
      created_at::text as "createdAt",
      banned_at::text as "bannedAt",
      deleted_at::text as "deletedAt",
      tos_accepted_at::text as "tosAcceptedAt";`
  ).at(0);
}
