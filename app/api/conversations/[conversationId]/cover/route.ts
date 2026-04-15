import { del } from "@vercel/blob";

import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import { canUpdateConversation } from "@/lib/auth/permissions";
import selectConversationFromId from "@/lib/forum/selectConversationFromId";
import updateConversationFromId from "@/lib/forum/updateConversationFromId";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { Conversation } from "@/lib/types";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || !canUpdateConversation(user)) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const conversation = await selectConversationFromId(params.conversationId);

    if (!conversation) {
      logger.withError("not found").flush();
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const updated = await updateConversationFromId(
      {
        conversationId: params.conversationId,
        userId: user.id,
        title: conversation.title,
        description: conversation.description ?? "",
      },
      { forceDropCover: true }
    );

    if (!updated) {
      logger.withError("cannot delete conversation cover").flush();
      return NextResponse.json(
        { error: "cannot delete conversation cover" },
        { status: 500 }
      );
    }

    if (updated.previousCoverUrl) {
      await del(updated.previousCoverUrl);
    }

    logger.append({ conversationId: updated.id });
    logger.flush();
    return NextResponse.json<Omit<Conversation, "messages" | "createdAt" | "createdBy">>(updated, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
