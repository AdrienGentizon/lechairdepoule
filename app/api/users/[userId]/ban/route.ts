import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import updateUserAsBanned from "@/lib/forum/updateUserAsBanned";
import { getRequestLogger } from "@/lib/getRequestLogger";
import pusher from "@/lib/pusher";
import { User } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const logger = getRequestLogger(req);
  try {
    const bannedBy = await getUser(req);
    logger.append({ bannedBy: getLoggableUser(bannedBy) });

    if (
      !bannedBy ||
      bannedBy.bannedAt ||
      bannedBy.id === userId ||
      bannedBy.role !== "admin"
    ) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const values = { bannedBy, userId };
    const bannedUser = await updateUserAsBanned(values);

    if (!bannedUser) {
      logger.append({ values });
      throw new Error(`user (${bannedBy.id}) cannot ban user (${userId})`);
    }

    logger.append({
      bannedUser,
    });
    await pusher.trigger(`users`, `user:ban`, bannedUser);

    logger.flush();
    return NextResponse.json<User>(bannedUser, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
