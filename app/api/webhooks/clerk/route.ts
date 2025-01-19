import { getVerifiedWebhookPayload } from "@/lib/clerk";
import sql from "@/lib/db";
import { logApiError, logApiOperation } from "@/lib/logger";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  logApiOperation(`WEBHOOKS`, req);
  try {
    const { data } = await getVerifiedWebhookPayload(req);
    const email = data.email_addresses.at(0)?.email_address;

    if (!email)
      return NextResponse.json({ error: "email required" }, { status: 400 });

    const rows = await sql<{ id: string }[]>`
    WITH
      invited_emails AS (
        SELECT
          email
        FROM
          PUBLIC.invited_emails
        WHERE
          email = ${email}
      )
    INSERT INTO
      PUBLIC."users" (email, auth_provider_name, auth_provider_id)
    SELECT
      invited_emails.email, 'clerk', ${data.id}
    FROM
      invited_emails
    RETURNING
      id::text;`;
    if (rows.length === 0) {
      (await clerkClient()).users.deleteUser(data.id);
      return NextResponse.json(
        { error: "cannot insert user" },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: "user inserted" }, { status: 200 });
  } catch (error) {
    logApiError(`WEBHOOKS`, req, error);
    return NextResponse.json({ error: "cannot insert user" }, { status: 500 });
  }
}
