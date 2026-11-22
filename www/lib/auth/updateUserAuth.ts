import sql from "../db";

export default async function updateUserAuth({
  id,
  auth,
}: {
  id: string;
  auth: { provider: "better-auth"; userId: string };
}) {
  return (
    await sql<
      {
        id: string;
        email: string;
        pseudo: string | null;
        role: string | null;
        createdAt: string;
        bannedAt: string | null;
        deletedAt: string | null;
        tosAcceptedAt: string | null;
      }[]
    >`UPDATE public.users
      SET
        auth_provider=${auth.provider},
        auth_id=${auth.userId}
      WHERE id=${id}
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
