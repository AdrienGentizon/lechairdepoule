import sql from "../db";

export default async function selectBannedUsers() {
  return (
    await sql<
      {
        id: string;
        pseudo: string | null;
        role: string | null;
        createdAt: string;
        bannedAt: string | null;
        deletedAt: string | null;
        tosAcceptedAt: string | null;
        appealId: string | null;
        appealBody: string | null;
        appealCreatedAt: string | null;
      }[]
    >`SELECT
      u.id::text,
      u.pseudo,
      u.role,
      u.created_at::text as "createdAt",
      u.banned_at::text as "bannedAt",
      u.deleted_at::text as "deletedAt",
      u.tos_accepted_at::text as "tosAcceptedAt",
      a.id::text as "appealId",
      a.body as "appealBody",
      a.created_at::text as "appealCreatedAt"
    FROM public.users u
    LEFT JOIN public.ban_appeals a
      ON a.user_id = u.id AND a.reviewed_at IS NULL
    WHERE u.banned_at IS NOT NULL
    ORDER BY u.banned_at DESC`
  ).map(({ appealId, appealBody, appealCreatedAt, ...user }) => ({
    ...user,
    appeal: appealId
      ? { id: appealId, body: appealBody!, createdAt: appealCreatedAt! }
      : null,
  }));
}
