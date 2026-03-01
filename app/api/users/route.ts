import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import selectSimilarUsersByPseudo from "@/lib/auth/selectSimilarUsersByPseudo";
import selectUsersByPseudo from "@/lib/auth/selectUsersByPseudo";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const search = req.nextUrl.searchParams.get("search")?.toString();
    const exactMatch =
      req.nextUrl.searchParams.get("exactMatch")?.toString() === "true";
    if (!search) {
      logger.withError("search parameter is required").flush();
      return NextResponse.json(
        { error: "search parameter is required" },
        { status: 400 }
      );
    }

    logger.flush();
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
    logger.withError(error).flush();
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
