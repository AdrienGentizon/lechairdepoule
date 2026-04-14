import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import { canReportMessage } from "@/lib/auth/permissions";
import updateMessageAsReported from "@/lib/forum/updateMessageAsReported";
import { getRequestLogger } from "@/lib/getRequestLogger";
import pusher from "@/lib/pusher";
import { Message } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  const logger = getRequestLogger(req);
  try {
    const reportedBy = await getUser(req);
    logger.append({ reportedBy: getLoggableUser(reportedBy) });

    if (!reportedBy || !canReportMessage(reportedBy)) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const values = {
      reportedBy: { ...reportedBy, pseudo: getUserPseudo(reportedBy) },
      messageId,
    };
    const reportedMessage = await updateMessageAsReported(values);

    if (!reportedMessage) {
      logger.append({ values });
      throw new Error(
        `user (${reportedBy.id}) cannot report message (${messageId})`
      );
    }

    await pusher.trigger(
      `conversations-${reportedMessage.conversationId}`,
      `conversation:message:report`,
      reportedMessage
    );

    logger.append({ reportedMessage });
    logger.flush();
    return NextResponse.json<Message>(reportedMessage, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
