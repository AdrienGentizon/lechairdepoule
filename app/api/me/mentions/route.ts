import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/auth/getUser";
import selectUserMentions from "@/lib/forum/selectUserMentions";
import { logApiError, logApiOperation } from "@/lib/logger";
import { UserMention } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    logApiOperation(req);
    const me = await getUser(req);
    if (!me)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    return NextResponse.json<UserMention[]>(
      await selectUserMentions({ userId: me.id }),
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
