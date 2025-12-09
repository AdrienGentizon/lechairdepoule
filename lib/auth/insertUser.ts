import { revalidateTag } from "next/cache";

import sql from "../db";
import { CacheKey } from "../types";

export default async function insertUser({
  email,
  auth,
}: {
  email: string;
  auth: { provider: "clerk"; userId: string };
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
    >`INSERT INTO public.users (email, auth_provider, auth_id, created_at)
        VALUES(${email}, ${auth.provider}, ${auth.userId}, ${new Date().toUTCString()})
      RETURNING
        id::text,
        email,
        pseudo,
        role,
        created_at::text as "createdAt",
        banned_at::text as "bannedAt",
        deleted_at::text as "deletedAt";`
  ).at(0);
}
