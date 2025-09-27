import { revalidateTag } from "next/cache";
import sql from "../db";
import { CacheKey, User } from "../types";

export default async function updateUserAsBanned({
  userId,
  bannedBy,
}: {
  userId: string;
  bannedBy: User;
}) {
  revalidateTag("users" satisfies CacheKey);

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
    >`
    UPDATE public.users
    SET
      banned_by = ${bannedBy.id},
      banned_at = ${new Date().toISOString()}
    WHERE id = ${userId}
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
