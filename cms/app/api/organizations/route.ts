import { NextRequest, NextResponse } from "next/server";

import CustomError from "@cdp/lib/CustomError";
import getLoggableUser from "@cdp/lib/getLoggableUser";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import insertOrganization from "@/lib/organization/insertOrganization";
import { Organization } from "@/lib/types";
import { OrganizationInputSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const payload = await req.json();
    const parsedInputs = OrganizationInputSchema.safeParse(payload);
    if (!parsedInputs.success) {
      trace.push([{ payload }, parsedInputs.error.message]);
      throw new CustomError("bad_request", {}, 400);
    }

    const insertedOrganization = await insertOrganization({
      managedBy: user.id,
      ...parsedInputs.data,
    });
    if (!insertedOrganization) throw new CustomError("unknown_error");

    trace.push({ insertedOrganization });
    trace.log();
    return NextResponse.json<Organization>(insertedOrganization, {
      status: 200,
    });
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
