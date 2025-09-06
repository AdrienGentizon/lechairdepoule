import getUser from "@/lib/auth/getUser";
import { User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const opertationName = `${req.method} ${req.url}`;
  try {
    console.log(`[Operation]`, opertationName);
    const user = await getUser();

    if (!user)
      return NextResponse.json(
        {
          error: "not found",
        },
        { status: 404 },
      );
    return NextResponse.json<User>(user, { status: 200 });
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
