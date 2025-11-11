import sql from "../db";
import { unstable_cache } from "next/cache";
import { CacheKey } from "../types";

export async function selectUsers() {
  return await sql<
    {
      id: string;
      email: string;
      pseudo: string | null;
      role: string | null;
      createdAt: string;
      bannedAt: string | null;
      deletedAt: string | null;
      lastConnection: string | null;
    }[]
  >`SELECT 
      id::text,
        email,
        pseudo,
        role,
        created_at::text as "createdAt",
        banned_at::text as "bannedAt",
        deleted_at::text as "deletedAt",
        last_connection::text as "lastConnection"
      FROM public.users;`;
}

const selectUsersCached = unstable_cache(async () => {
  return selectUsers();
}, ["users" satisfies CacheKey]);

export default selectUsersCached;
