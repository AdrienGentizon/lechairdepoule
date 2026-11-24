import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import selectSimilarUsersByPseudo from "@/lib/auth/selectSimilarUsersByPseudo";
import selectUsersByPseudo from "@/lib/auth/selectUsersByPseudo";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const search = req.nextUrl.searchParams.get("search")?.toString();
    const exactMatch =
      req.nextUrl.searchParams.get("exactMatch")?.toString() === "true";
    if (!search) {
      trace.pushError("search parameter is required");
      trace.log(400);
      return NextResponse.json(
        { error: "paramètre de recherche requis" },
        { status: 400 },
      );
    }

    trace.log();
    return NextResponse.json<(User & { similarity: number })[]>(
      exactMatch
        ? (await selectUsersByPseudo(search)).map((user) => ({
            ...user,
            similarity: 1,
          }))
        : await selectSimilarUsersByPseudo(search),
      { status: 200 },
    );
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
