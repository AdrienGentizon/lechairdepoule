import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import insertBanAppeal from "@/lib/forum/insertBanAppeal";
import { BanAppealFormSchema } from "@/lib/schemas";
import { BanAppeal } from "@/lib/types";

export async function POST(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    if (!user) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    if (!user.bannedAt) {
      trace.pushError("user not banned");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 403 });
    }

    const payload = await req.json();
    const parsedInputs = BanAppealFormSchema.safeParse(payload);

    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return NextResponse.json({ error: "requête invalide" }, { status: 400 });
    }

    const values = { userId: user.id, body: parsedInputs.data.body };
    const banAppeal = await insertBanAppeal(values);

    if (!banAppeal) {
      trace.push({ values });
      trace.pushError("appeal already pending");
      trace.log(400);
      return NextResponse.json(
        { error: "une demande est déjà en cours" },
        { status: 409 },
      );
    }

    trace.push({ banAppeal });
    trace.log();
    return NextResponse.json<BanAppeal>(banAppeal, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
