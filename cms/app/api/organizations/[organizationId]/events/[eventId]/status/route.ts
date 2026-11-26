import { NextRequest, NextResponse } from "next/server";

import CustomError from "@cdp/lib/CustomError";
import getLoggableUser from "@cdp/lib/getLoggableUser";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import updateEventStatus from "@/lib/event/updateEventStatus";
import revalidateWww from "@/lib/revalidateWww";
import { EventStatusInputSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string; eventId: string }> },
) {
  const { organizationId, eventId } = await params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const payload = await req.json();
    const parsedInputs = EventStatusInputSchema.safeParse(payload);
    if (!parsedInputs.success) {
      trace.push([{ payload }, parsedInputs.error.message]);
      throw new CustomError("bad_request", {}, 400);
    }

    const updatedEvent = await updateEventStatus({
      eventId,
      organizationId,
      userId: user.id,
      status: parsedInputs.data.status,
    });
    if (!updatedEvent) {
      trace.push({ organizationId, eventId });
      throw new CustomError("not_found", {}, 404);
    }

    const revalidation = await revalidateWww();
    if (!revalidation.success) trace.pushError("www revalidation failed");

    trace.push({ updatedEvent });
    trace.log();
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
