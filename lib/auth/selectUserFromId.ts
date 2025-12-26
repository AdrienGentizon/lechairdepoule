import sql from "../db";

export default async function selectUserFromId(id: string) {
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
    >`SELECT
        id::text,
        email,
        pseudo,
        role,
        created_at::text as "createdAt",
        banned_at::text as "bannedAt",
        deleted_at::text as "deletedAt",
        tos_accepted_at::text as "tosAcceptedAt"
      FROM public.users WHERE id=${id}`
  ).at(0);
}

export async function selectUserFromAuthId({
  provider,
  userId,
}: {
  provider: "clerk";
  userId: string;
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
    >`SELECT
        id::text,
        email,
        pseudo,
        role,
        created_at::text as "createdAt",
        banned_at::text as "bannedAt",
        deleted_at::text as "deletedAt",
        tos_accepted_at::text as "tosAcceptedAt"
      FROM public.users
      WHERE
        auth_provider=${provider}
        AND auth_id=${userId}`
  ).at(0);
}
