import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import replaceMessageBodyMentionWIthUserName from "@/lib/forum/replaceMessageBodyMentionWIthUserName";
import selectUnreadUsernotifications from "@/lib/forum/selectUnreadUsernotifications";
import updateUserMentions from "@/lib/forum/updateUserMentions";
import { UserNotifications } from "@/lib/types";

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const me = await getAuthenticatedUser();
    trace.push(getLoggableUser(me));

    if (!me) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const notifications = await selectUnreadUsernotifications({
      userId: me.id,
    });

    trace.log();
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
      { status: 200 },
    );
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const me = await getAuthenticatedUser();
    trace.push(getLoggableUser(me));

    if (!me) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const payload = await req.json();
    const parsedInputs = z
      .object({
        messageIds: z.array(z.string()),
      })
      .safeParse(payload);

    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return NextResponse.json({ error: "requête invalide" }, { status: 400 });
    }

    const updated = await updateUserMentions({
      userId: me.id,
      messageIds: parsedInputs.data.messageIds,
    });

    trace.log();
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
