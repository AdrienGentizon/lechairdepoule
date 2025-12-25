import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import updateUserAsBanned from "@/lib/forum/updateUserAsBanned";
import { logApiError, logApiOperation } from "@/lib/logger";
import pusher from "@/lib/pusher";
import { User } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    logApiOperation(req);
    const bannedBy = await getUser(req);

    if (!bannedBy || bannedBy.bannedAt || bannedBy.id === userId)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    const bannedUser = await updateUserAsBanned({
      bannedBy: { ...bannedBy, pseudo: getUserPseudo(bannedBy) },
      userId,
    });

    if (!bannedUser)
      throw new Error(`user (${bannedBy.id}) cannot ban user (${userId})`);

    await pusher.trigger(`users`, `user:ban`, bannedUser);

    return NextResponse.json<User>(bannedUser, {
      status: 200,
    });
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
