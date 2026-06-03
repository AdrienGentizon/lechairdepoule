import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import selectBannedUsers from "@/lib/auth/selectBannedUsers";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt || user.role !== "admin") {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const bannedUsers = await selectBannedUsers();

    logger.flush();
    return NextResponse.json<User[]>(bannedUsers, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
