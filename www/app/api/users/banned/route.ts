import { NextRequest, NextResponse } from "next/server";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import selectBannedUsers from "@/lib/auth/selectBannedUsers";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { BannedUser } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getAuthenticatedUser();
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt || user.role !== "admin") {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const bannedUsers = await selectBannedUsers();

    logger.flush();
    return NextResponse.json<BannedUser[]>(bannedUsers, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
