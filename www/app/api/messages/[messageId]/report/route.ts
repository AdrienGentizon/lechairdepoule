import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import updateMessageAsReported from "@/lib/forum/updateMessageAsReported";
import pusher from "@/lib/pusher";
import { Message } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const { messageId } = await params;
  const trace = new Trace(req);
  try {
    const reportedBy = await getAuthenticatedUser();
    trace.push({ reportedBy: getLoggableUser(reportedBy) });

    if (!reportedBy || reportedBy.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const values = { reportedBy, messageId };
    const reportedMessage = await updateMessageAsReported(values);

    if (!reportedMessage) {
      trace.push({ values });
      throw new Error(
        `user (${reportedBy.id}) cannot report message (${messageId})`,
      );
    }

    await pusher.trigger(
      `conversations-${reportedMessage.conversationId}`,
      `conversation:message:report`,
      reportedMessage,
    );

    trace.push({ reportedMessage });
    trace.log();
    return NextResponse.json<Message>(reportedMessage, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
