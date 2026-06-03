import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import replaceMessageBodyMentionWIthUserName from "@/lib/forum/replaceMessageBodyMentionWIthUserName";
import selectUnreadUsernotifications from "@/lib/forum/selectUnreadUsernotifications";
import updateUserMentions from "@/lib/forum/updateUserMentions";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { UserNotifications } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const me = await getUser(req);
    logger.append(getLoggableUser(me));

    if (!me) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const notifications = await selectUnreadUsernotifications({
      userId: me.id,
    });

    logger.flush();
    return NextResponse.json<UserNotifications>(
      {
        mentions: notifications
          .filter((n) => n.type === "mention")
          .map((mention) => ({
            ...mention,
            excerpt: replaceMessageBodyMentionWIthUserName({
              mentionedUsers: [{ id: me.id, pseudo: me.pseudo }],
              body: mention.excerpt,
            }),
          })),
        replies: notifications.filter((n) => n.type === "reply"),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const me = await getUser(req);
    logger.append(getLoggableUser(me));

    if (!me) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
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
      return NextResponse.json({ error: "requête invalide" }, { status: 400 });
    }

    const updated = await updateUserMentions({
      userId: me.id,
      messageIds: parsedInputs.data.messageIds,
    });

    logger.flush();
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
