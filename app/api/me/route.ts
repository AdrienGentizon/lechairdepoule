import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import updateUser from "@/lib/auth/updateUser";
import { logApiError, logApiOperation } from "@/lib/logger";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    logApiOperation(req);
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
    logApiError(req, error);
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    logApiOperation(req);
    const user = await getUser(req);

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
        cgu: z.boolean({ message: "Vous devez accepter les CGU" }),
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

    const updatedUser = await updateUser({
      userId: user.id,
      pseudo: parsedInputs.data.pseudo,
      cgu: parsedInputs.data.cgu,
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
    logApiError(req, error);
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}
