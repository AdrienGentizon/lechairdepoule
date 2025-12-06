import { verifyWebhook } from "@clerk/backend/webhooks";

import { NextRequest, NextResponse } from "next/server";

import insertUser from "@/lib/auth/insertUser";
import { logApiError, logApiOperation } from "@/lib/logger";

export async function POST(req: NextRequest) {
  logApiOperation(`[Webhook]`, req);

  try {
    const webhookEvent = await verifyWebhook(req);

    if (webhookEvent.type === "user.created") {
      console.log(webhookEvent.data);
      const email = webhookEvent.data.email_addresses.find(({ id }) => {
        id === webhookEvent.data.primary_email_address_id;
      });
      if (!email)
        return NextResponse.json(
          { error: "primary email not found", date: new Date().toUTCString() },
          { status: 500 }
        );

      const user = await insertUser({
        email: email.email_address,
        auth: {
          provider: "clerk",
          userId: webhookEvent.data.id,
        },
      });
      console.log(user);
    }

    return NextResponse.json(null, { status: 503 });
  } catch (error) {
    logApiError("[Webhook", req, error);
    return NextResponse.json(
      { error: (error as Error)?.message ?? "unkonwn error" },
      { status: 500 }
    );
  }
}
