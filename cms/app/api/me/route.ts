import { NextRequest, NextResponse } from "next/server";

import CustomError from "@cdp/lib/CustomError";
import getLoggableUser from "@cdp/lib/getLoggableUser";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import selectUserOrganizations from "@/lib/organization/selectUserOrganizations";
import { Me } from "@/lib/types";

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const { email: _, ...publicUser } = user;
    const organizations = await selectUserOrganizations({ userId: user.id });

    trace.log();
    return NextResponse.json<Me>(
      { ...publicUser, organizations },
      { status: 200 },
    );
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
