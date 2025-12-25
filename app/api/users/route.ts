import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import selectUsers from "@/lib/auth/selectUsers";
import { logApiError, logApiOperation } from "@/lib/logger";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    logApiOperation(req);
    const user = await getUser(req);

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    return NextResponse.json<User[]>(
      (await selectUsers()).map((user) => {
        return { ...user, pseudo: getUserPseudo(user) };
      }),
      { status: 200 }
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
