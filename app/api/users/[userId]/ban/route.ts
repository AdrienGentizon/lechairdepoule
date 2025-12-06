import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import updateUserAsBanned from "@/lib/forum/updateUserAsBanned";
import { BroadCastKey, User } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const opertationName = `${req.method} ${req.url}`;
  const { userId } = await params;
  try {
    console.log(`[Operation]`, opertationName);
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

    return NextResponse.json<User>(bannedUser, {
      status: 200,
    });
  } catch (error) {
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error
    );
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}
