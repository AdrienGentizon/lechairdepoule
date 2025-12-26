import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/auth/getUser";
import replaceMessageBodyMentionWIthUserName from "@/lib/forum/replaceMessageBodyMentionWIthUserName";
import selectUserMentions from "@/lib/forum/selectUserMentions";
import { logApiError, logApiOperation } from "@/lib/logger";
import { UserMention } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    logApiOperation(req);
    const me = await getUser(req);
    if (!me)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const mentions = await selectUserMentions({ userId: me.id });
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
