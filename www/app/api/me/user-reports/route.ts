import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import insertUserReport from "@/lib/forum/insertUserReport";
import { UserReportFormSchema } from "@/lib/schemas";
import { UserReport } from "@/lib/types";

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

    if (user.bannedAt) {
      trace.pushError("user banned");
      trace.log(403);
      return NextResponse.json({ error: "non autorisé" }, { status: 403 });
    }

    const payload = await req.json();
    const parsedInputs = UserReportFormSchema.safeParse(payload);

    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return NextResponse.json({ error: "requête invalide" }, { status: 400 });
    }

    const values = {
      userId: user.id,
      type: parsedInputs.data.type,
      body: parsedInputs.data.body,
      pageUrl: parsedInputs.data.pageUrl ?? null,
      userAgent: req.headers.get("user-agent"),
    };
    const userReport = await insertUserReport(values);

    trace.push({ userReport });
    trace.log();
    return NextResponse.json<UserReport | undefined>(userReport, {
      status: 200,
    });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
