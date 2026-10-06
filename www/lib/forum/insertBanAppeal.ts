import sql from "../db";
import { BanAppeal } from "../types";

export default async function insertBanAppeal({
  userId,
  body,
}: {
  userId: string;
  body: string;
}) {
  return (
    await sql<BanAppeal[]>`
    WITH pending_appeal AS (
      SELECT 1 FROM public.ban_appeals
      WHERE user_id = ${userId} AND reviewed_at IS NULL
    )
    INSERT INTO public.ban_appeals (user_id, body, created_at)
    SELECT ${userId}, ${body}, ${new Date().toISOString()}
    WHERE NOT EXISTS (SELECT 1 FROM pending_appeal)
    RETURNING
      id::text,
      user_id::text as "userId",
      body,
      created_at::text as "createdAt",
      reviewed_at::text as "reviewedAt",
      reviewed_by::text as "reviewedBy";`
  ).at(0);
}
