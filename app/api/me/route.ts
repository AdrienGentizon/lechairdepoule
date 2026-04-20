import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import updateUser from "@/lib/auth/updateUser";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const { email: _, ...publicUser } = user;
    logger.flush();
    return NextResponse.json<User>(publicUser, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }
    const payload = await req.json();
    const parsedInputs = z
      .object({
        pseudo: z
          .string()
          .min(3, { message: "Pseudo trop court (3 char min)" }),
        cgu: z.boolean({ message: "Vous devez accepter les CGU" }),
      })
      .safeParse(payload);

    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json({ error: "requête invalide" }, { status: 400 });
    }

    const values = {
      userId: user.id,
      pseudo: parsedInputs.data.pseudo,
      cgu: parsedInputs.data.cgu,
    };
    const updatedUser = await updateUser(values);

    if (!updatedUser) {
      logger.append({ values });
      logger.withError("cannot update user").flush();
      return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
    }

    logger.append({ updatedUser: { id: updatedUser.id, role: updatedUser.role, bannedAt: updatedUser.bannedAt } });
    logger.flush();
    return NextResponse.json<User>(updatedUser, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
