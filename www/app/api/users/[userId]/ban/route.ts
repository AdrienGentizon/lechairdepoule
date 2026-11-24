import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import updateUserAsBanned from "@/lib/forum/updateUserAsBanned";
import pusher from "@/lib/pusher";
import { User } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const trace = new Trace(req);
  try {
    const bannedBy = await getAuthenticatedUser();
    trace.push({ bannedBy: getLoggableUser(bannedBy) });

    if (
      !bannedBy ||
      bannedBy.bannedAt ||
      bannedBy.id === userId ||
      bannedBy.role !== "admin"
    ) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const values = { bannedBy, userId };
    const bannedUser = await updateUserAsBanned(values);

    if (!bannedUser) {
      trace.push({ values });
      throw new Error(`user (${bannedBy.id}) cannot ban user (${userId})`);
    }

    trace.push({
      bannedUser,
    });
    await pusher.trigger(`users`, `user:ban`, bannedUser);

    trace.log();
    return NextResponse.json<User>(bannedUser, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
