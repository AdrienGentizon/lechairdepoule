import { NextRequest, NextResponse } from "next/server";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import selectReportedMessages from "@/lib/forum/selectReportedMessages";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { Message } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getAuthenticatedUser();
    logger.append({ user: getLoggableUser(user) });

    if (!user || user.bannedAt || user.role !== "admin") {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const messages = await selectReportedMessages();

    logger.flush();
    return NextResponse.json<Message[]>(messages, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
