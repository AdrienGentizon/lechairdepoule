import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import updateMessageAsReported from "@/lib/forum/updateMessageAsReported";
import { logApiError, logApiOperation } from "@/lib/logger";
import pusher from "@/lib/pusher";
import { Message } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  try {
    logApiOperation(req);
    const reportedBy = await getUser(req);

    if (!reportedBy || reportedBy.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    const reportedMessage = await updateMessageAsReported({
      reportedBy: { ...reportedBy, pseudo: getUserPseudo(reportedBy) },
      messageId,
    });

    if (!reportedMessage)
      throw new Error(
        `user (${reportedBy.id}) cannot report message (${messageId})`
      );

    await pusher.trigger(
      `conversations-${reportedMessage.conversationId}`,
      `conversation:message:report`,
      reportedMessage
    );

    return NextResponse.json<Message>(reportedMessage, {
      status: 200,
    });
  } catch (error) {
    logApiError(req, error);
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}
