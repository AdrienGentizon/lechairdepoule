import { verifyWebhook } from "@clerk/backend/webhooks";

import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import insertUser from "@/lib/auth/insertUser";
import { getRequestLogger } from "@/lib/getRequestLogger";
import obfuscateEmail from "@/lib/obfuscateEmail";

export async function POST(req: NextRequest) {
  const logger = getRequestLogger(req);

  try {
    const webhookEvent = await verifyWebhook(req);
    logger.append(webhookEvent.type);
    if (webhookEvent.type !== "user.created")
      throw new Error(`${webhookEvent.type} not implemented yet`);

    const email = webhookEvent.data.email_addresses.find(({ id }) => {
      return id === webhookEvent.data.primary_email_address_id;
    });
    if (!email) throw new Error("primary email not found");

    const user = await insertUser({
      email: email.email_address,
      auth: {
        provider: "clerk",
        userId: webhookEvent.data.id,
      },
    });
    if (!user) throw new Error("cannot insert user");

    logger.append(getLoggableUser(user, { email: true, createdAt: true }));
    logger.flush();

    return NextResponse.json(
      { email: obfuscateEmail(user.email), createdAt: user.createdAt },
      { status: 200 }
    );
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json(
      { error: (error as Error)?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
