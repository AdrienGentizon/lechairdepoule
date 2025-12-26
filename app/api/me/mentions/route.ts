import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getUser from "@/lib/auth/getUser";
import replaceMessageBodyMentionWIthUserName from "@/lib/forum/replaceMessageBodyMentionWIthUserName";
import selectUnreadUserMentions from "@/lib/forum/selectUnreadUserMentions";
import updateUserMentions from "@/lib/forum/updateUserMentions";
import { logApiError, logApiOperation } from "@/lib/logger";
import { UserMention } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    logApiOperation(req);
    const me = await getUser(req);
    if (!me)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const mentions = await selectUnreadUserMentions({ userId: me.id });
    return NextResponse.json<UserMention[]>(
      mentions.map((mention) => {
        return {
          ...mention,
          excerpt: replaceMessageBodyMentionWIthUserName({
            mentionedUsers: [
              {
                id: me.id,
                pseudo: me.pseudo,
              },
            ],
            body: mention.excerpt,
          }),
        };
      }),
      {
        status: 200,
      }
    );
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

export async function POST(req: NextRequest) {
  try {
    logApiOperation(req);
    const me = await getUser(req);
    if (!me)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const parsedInputs = z
      .object({
        messageIds: z.array(z.string()),
      })
      .safeParse(await req.json());
    if (!parsedInputs.success)
      return NextResponse.json({ error: "invalid request" }, { status: 400 });

    const mutatedMentions = await updateUserMentions({
      userId: me.id,
      messageIds: parsedInputs.data.messageIds,
    });

    if (parsedInputs.data.messageIds.length !== mutatedMentions.length) {
      logApiError(req, "some mentions could not be updated");
    }

    return NextResponse.json<
      {
        id: string;
        userId: string;
        messageId: string;
        readAt: string | null;
      }[]
    >(mutatedMentions, {
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
