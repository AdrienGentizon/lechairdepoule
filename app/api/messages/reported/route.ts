import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import { canListReportedMessages } from "@/lib/auth/permissions";
import selectReportedMessages from "@/lib/forum/selectReportedMessages";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { Message } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append({ user: getLoggableUser(user) });

    if (!user || !canListReportedMessages(user)) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const messages = await selectReportedMessages();

    logger.flush();
    return NextResponse.json<Message[]>(messages, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
