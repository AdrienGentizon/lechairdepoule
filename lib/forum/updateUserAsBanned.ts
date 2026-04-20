import { revalidateTag } from "next/cache";

import sql from "../db";
import { CacheKey } from "../types";

export default async function updateUserAsBanned({
  userId,
  bannedBy,
}: {
  userId: string;
  bannedBy: { id: string };
}) {
  revalidateTag("users" satisfies CacheKey, {});

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
      }[]
    >`
    UPDATE public.users
    SET
      banned_by = ${bannedBy.id},
      banned_at = ${new Date().toISOString()}
    WHERE id = ${userId}
      AND banned_at IS NULL
    RETURNING
      id::text,
      pseudo,
      role,
      created_at::text as "createdAt",
      banned_at::text as "bannedAt",
      deleted_at::text as "deletedAt",
      tos_accepted_at::text as "tosAcceptedAt";`
  ).at(0);
}
