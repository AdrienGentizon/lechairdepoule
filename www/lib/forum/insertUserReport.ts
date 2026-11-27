import { UserReport } from "@cdp/lib/types";

import sql from "../db";

export default async function insertUserReport({
  userId,
  type,
  body,
  pageUrl,
  userAgent,
}: {
  userId: string;
  type: UserReport["type"];
  body: string;
  pageUrl: string | null;
  userAgent: string | null;
}) {
  return (
    await sql<UserReport[]>`
    INSERT INTO public.user_reports (user_id, type, body, page_url, user_agent, created_at)
    VALUES (${userId}, ${type}, ${body}, ${pageUrl}, ${userAgent}, ${new Date().toISOString()})
    RETURNING
      id::text,
      user_id::text as "userId",
      type,
      body,
      page_url as "pageUrl",
      user_agent as "userAgent",
      created_at::text as "createdAt",
      reviewed_at::text as "reviewedAt";`
  ).at(0);
}
