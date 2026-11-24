import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import updateUser from "@/lib/auth/updateUser";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    if (!user) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const { email: _, ...publicUser } = user;
    trace.log();
    return NextResponse.json<User>(publicUser, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }
    const payload = await req.json();
    const parsedInputs = z
      .object({
        pseudo: z
          .string()
          .trim()
          .min(3, { message: "Pseudo trop court (3 char min)" }),
        cgu: z.literal(true, { message: "Vous devez accepter les CGU" }),
      })
      .safeParse(payload);

    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return NextResponse.json({ error: "requête invalide" }, { status: 400 });
    }

    const values = {
      userId: user.id,
      pseudo: parsedInputs.data.pseudo,
      cgu: parsedInputs.data.cgu,
    };
    const updatedUser = await updateUser(values);

    if (!updatedUser) {
      trace.push({ values });
      trace.pushError("cannot update user");
      trace.log(500);
      return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
    }

    trace.push({
      updatedUser: {
        id: updatedUser.id,
        role: updatedUser.role,
        bannedAt: updatedUser.bannedAt,
      },
    });
    trace.log();
    return NextResponse.json<User>(updatedUser, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
