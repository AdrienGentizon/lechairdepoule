import { UserReport } from "@cdp/lib/types";

import sql from "@/lib/db";

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
    INSERT INTO
      user_reports (user_id, type, body, page_url, user_agent, created_at)
    VALUES
      (${userId}, ${type}, ${body}, ${pageUrl}, ${userAgent}, NOW())
    RETURNING
      id::text,
      user_id::text,
      type,
      body,
      page_url,
      user_agent,
      created_at::text,
      reviewed_at::text;`
  ).at(0);
}
