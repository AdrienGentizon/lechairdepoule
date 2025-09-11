import getUser from "@/lib/auth/getUser";
import updateUserAsBanned from "@/lib/forum/updateUserAsBanned";
import { User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const opertationName = `${req.method} ${req.url}`;
  const { userId } = await params;
  try {
    console.log(`[Operation]`, opertationName);
    const bannedBy = await getUser();

    if (!bannedBy || bannedBy.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );

    const bannedUser = await updateUserAsBanned({
      bannedBy,
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
      (error as Error)?.message ?? error,
    );
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 },
    );
  }
}
