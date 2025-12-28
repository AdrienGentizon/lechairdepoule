import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import selectSimilarUsersByPseudo from "@/lib/auth/selectSimilarUsersByPseudo";
import selectUsersByPseudo from "@/lib/auth/selectUsersByPseudo";
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

    const search = req.nextUrl.searchParams.get("search")?.toString();
    const exactMatch =
      req.nextUrl.searchParams.get("exactMatch")?.toString() === "true";
    if (!search)
      return NextResponse.json(
        {
          error: "search parameter is required",
        },
        { status: 400 }
      );

    return NextResponse.json<(User & { similarity: number })[]>(
      exactMatch
        ? (await selectUsersByPseudo(search)).map((user) => {
            return { ...user, pseudo: getUserPseudo(user), similarity: 1 };
          })
        : (await selectSimilarUsersByPseudo(search)).map((user) => {
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
