import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import replaceMessageBodyMentionWIthUserName from "@/lib/forum/replaceMessageBodyMentionWIthUserName";
import selectUnreadUserMentions from "@/lib/forum/selectUnreadUserMentions";
import updateUserMentions from "@/lib/forum/updateUserMentions";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { UserMention } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const me = await getUser(req);
    logger.append(getLoggableUser(me));

    if (!me) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const mentions = await selectUnreadUserMentions({ userId: me.id });

    logger.flush();
    return NextResponse.json<UserMention[]>(
      mentions.map((mention) => ({
        ...mention,
        excerpt: replaceMessageBodyMentionWIthUserName({
          mentionedUsers: [{ id: me.id, pseudo: me.pseudo }],
          body: mention.excerpt,
        }),
      })),
      { status: 200 }
    );
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const me = await getUser(req);
    logger.append(getLoggableUser(me));

    if (!me) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const parsedInputs = z
      .object({
        messageIds: z.array(z.string()),
      })
      .safeParse(payload);
    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }

    const updatedMentions = await updateUserMentions({
      userId: me.id,
      messageIds: parsedInputs.data.messageIds,
    });

    if (parsedInputs.data.messageIds.length !== updatedMentions.length)
      logger.append("some mentions could not be updated");

    logger.append({ updatedMentions });
    logger.flush();
    return NextResponse.json<
      { id: string; userId: string; messageId: string; readAt: string | null }[]
    >(updatedMentions, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
