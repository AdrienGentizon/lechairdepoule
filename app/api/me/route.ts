import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import updateUserPseudo from "@/lib/auth/updateUserPseudo";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  const opertationName = `${req.method} ${req.url}`;
  try {
    console.log(`[Operation]`, opertationName);
    const user = await getUser(req);

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    return NextResponse.json<User>(
      {
        ...user,
        pseudo: getUserPseudo(user),
      },
      { status: 200 }
    );
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

export async function PATCH(req: NextRequest) {
  const opertationName = `${req.method} ${req.url}`;
  try {
    console.log(`[Operation]`, opertationName);
    const user = await getUser(req);
    console.log({ user });

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    const parsedInputs = z
      .object({
        pseudo: z
          .string()
          .min(3, { message: "Pseudo trop court (3 char min)" }),
      })
      .safeParse(await req.json());

    if (!parsedInputs.success) {
      return NextResponse.json(
        {
          error: "bad request",
        },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserPseudo({
      userId: user.id,
      pseudo: parsedInputs.data.pseudo,
    });

    if (!updatedUser)
      return NextResponse.json(
        {
          error: "server error",
        },
        { status: 500 }
      );

    return NextResponse.json<User>(updatedUser, { status: 200 });
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
