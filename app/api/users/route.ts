import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import selectUsers from "@/lib/auth/selectUsers";
import { User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const opertationName = `${req.method} ${req.url}`;
  try {
    console.log(`[Operation]`, opertationName);
    const user = await getUser();

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );

    return NextResponse.json<User[]>(
      (await selectUsers()).map((user) => {
        return { ...user, pseudo: getUserPseudo(user) };
      }),
      { status: 200 },
    );
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
