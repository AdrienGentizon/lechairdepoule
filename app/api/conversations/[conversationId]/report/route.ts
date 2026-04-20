import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import updateConversationAsReported from "@/lib/forum/updateConversationAsReported";
import { getRequestLogger } from "@/lib/getRequestLogger";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const logger = getRequestLogger(req);
  try {
    const reportedBy = await getUser(req);
    logger.append({ reportedBy: getLoggableUser(reportedBy) });

    if (!reportedBy || reportedBy.bannedAt || reportedBy.role !== "admin") {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const values = { reportedBy, conversationId };
    const reportedConversation = await updateConversationAsReported(values);

    if (!reportedConversation) {
      logger.append({ values });
      throw new Error(
        `user (${reportedBy.id}) cannot report conversation (${conversationId})`
      );
    }

    await pusher.trigger(
      `conversations`,
      `conversation:report`,
      reportedConversation
    );

    logger.append({ reportedConversation });
    logger.flush();
    return NextResponse.json(reportedConversation, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
