import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import insertBanAppeal from "@/lib/forum/insertBanAppeal";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { BanAppealFormSchema } from "@/lib/schemas";
import { BanAppeal } from "@/lib/types";

export async function POST(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    if (!user.bannedAt) {
      logger.withError("user not banned").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 403 });
    }

    const payload = await req.json();
    const parsedInputs = BanAppealFormSchema.safeParse(payload);

    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json({ error: "requête invalide" }, { status: 400 });
    }

    const values = { userId: user.id, body: parsedInputs.data.body };
    const banAppeal = await insertBanAppeal(values);

    if (!banAppeal) {
      logger.append({ values });
      logger.withError("appeal already pending").flush();
      return NextResponse.json(
        { error: "une demande est déjà en cours" },
        { status: 409 }
      );
    }

    logger.append({ banAppeal });
    logger.flush();
    return NextResponse.json<BanAppeal>(banAppeal, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
