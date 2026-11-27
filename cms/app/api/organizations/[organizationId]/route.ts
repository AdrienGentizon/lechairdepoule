import { NextRequest, NextResponse } from "next/server";

import CustomError from "@cdp/lib/CustomError";
import getLoggableUser from "@cdp/lib/getLoggableUser";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import updateOrganization from "@/lib/organization/updateOrganization";
import { Organization } from "@/lib/types";
import { OrganizationInputSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params;
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

    const updatedOrganization = await updateOrganization({
      organizationId,
      userId: user.id,
      ...parsedInputs.data,
    });
    if (!updatedOrganization) {
      trace.push({ organizationId });
      throw new CustomError("not_found", {}, 404);
    }

    trace.push({ updatedOrganization });
    trace.log();
    return NextResponse.json<Organization>(updatedOrganization, {
      status: 200,
    });
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
