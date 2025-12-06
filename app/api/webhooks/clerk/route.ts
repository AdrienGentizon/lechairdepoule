import { verifyWebhook } from "@clerk/backend/webhooks";

import { NextRequest, NextResponse } from "next/server";

import insertUser from "@/lib/auth/insertUser";
import { logApiError, logApiOperation } from "@/lib/logger";

export async function POST(req: NextRequest) {
  logApiOperation(`webhook:clerk`, req);

  try {
    const webhookEvent = await verifyWebhook(req);

    if (webhookEvent.type !== "user.created")
      throw new Error(`${webhookEvent.type} not implemented yet`);

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
    if (!user) throw new Error("cannot insert user");
    logApiOperation(
      "insertUser",
      req,
      `${obfuscateEmail(user?.email)} ${user?.createdAt}`
    );

    return NextResponse.json(
      { email: obfuscateEmail(user.email), createdAt: user.createdAt },
      { status: 200 }
    );
  } catch (error) {
    logApiError("`webhook:clerk", req, error);
    return NextResponse.json(
      { error: (error as Error)?.message ?? "unkonwn error" },
      { status: 500 }
    );
  }
}
