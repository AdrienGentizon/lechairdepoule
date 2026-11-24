import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import selectReportedMessages from "@/lib/forum/selectReportedMessages";
import { Message } from "@/lib/types";

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push({ user: getLoggableUser(user) });

    if (!user || user.bannedAt || user.role !== "admin") {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const messages = await selectReportedMessages();

    trace.log();
    return NextResponse.json<Message[]>(messages, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
