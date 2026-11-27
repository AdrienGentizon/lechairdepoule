import { NextRequest, NextResponse } from "next/server";

import CustomError from "@cdp/lib/CustomError";
import getLoggableUser from "@cdp/lib/getLoggableUser";
import Trace from "@cdp/lib/trace";
import { UserReport } from "@cdp/lib/types";
import { UserReportInputSchema } from "@cdp/lib/validation";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import insertUserReport from "@/lib/userReport/insertUserReport";

export async function POST(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const payload = await req.json();
    const parsedInputs = UserReportInputSchema.safeParse(payload);
    if (!parsedInputs.success) {
      trace.push([{ payload }, parsedInputs.error.message]);
      throw new CustomError("bad_request", {}, 400);
    }

    const userReport = await insertUserReport({
      userId: user.id,
      type: parsedInputs.data.type,
      body: parsedInputs.data.body,
      pageUrl: parsedInputs.data.pageUrl ?? null,
      userAgent: req.headers.get("user-agent"),
    });
    if (!userReport) throw new CustomError("unknown_error");

    trace.push({ userReport });
    trace.log();
    return NextResponse.json<UserReport>(userReport, { status: 200 });
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
