import { NextRequest, NextResponse } from "next/server";

import CustomError from "@cdp/lib/CustomError";
import getLoggableUser from "@cdp/lib/getLoggableUser";
import assertUploadedImage from "@cdp/lib/image/assertUploadedImage";
import {
  deleteObject,
  toOrganizationObjectKeyPrefix,
  toPublicUrl,
} from "@cdp/lib/s3";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import insertEvent from "@/lib/event/insertEvent";
import selectOrganizationEvents from "@/lib/event/selectOrganizationEvents";
import selectUserOrganization from "@/lib/organization/selectUserOrganization";
import { Event } from "@/lib/types";
import { EventInputSchema } from "@/lib/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const events = await selectOrganizationEvents({
      organizationId,
      userId: user.id,
    });

    trace.log();
    return NextResponse.json<Event[]>(
      events.map(({ imageKey, ...event }) => ({
        ...event,
        imageUrl: imageKey ? toPublicUrl(imageKey) : event.imageUrl,
      })),
      { status: 200 },
    );
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}

export async function POST(
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
    const parsedInputs = EventInputSchema.safeParse(payload);
    if (!parsedInputs.success) {
      trace.push([{ payload }, parsedInputs.error.message]);
      throw new CustomError("bad_request", {}, 400);
    }

    const organization = await selectUserOrganization({
      organizationId,
      userId: user.id,
    });
    if (!organization) {
      trace.push({ organizationId });
      throw new CustomError("not_found", {}, 404);
    }

    const { cover, ...inputs } = parsedInputs.data;

    if (cover) {
      trace.push({ objectKey: cover.objectKey });
      await assertUploadedImage({
        objectKey: cover.objectKey,
        keyPrefix: toOrganizationObjectKeyPrefix(organization.id),
      });
    }

    const insertedEvent = await insertEvent({
      organizationId: organization.id,
      createdBy: user.id,
      type: inputs.type,
      title: inputs.title,
      description: inputs.description,
      startDate: inputs.startDate,
      startTime: inputs.startTime,
      endDate: inputs.endDate,
      endTime: inputs.endTime,
      timezone: inputs.timezone,
      price: inputs.price,
      venue: inputs.venue,
      url: inputs.url,
      imageKey: cover?.objectKey ?? null,
      imageWidth: cover?.width ?? null,
      imageHeight: cover?.height ?? null,
    });
    if (!insertedEvent) {
      if (cover) await deleteObject({ key: cover.objectKey });
      throw new CustomError("unknown_error");
    }

    const { imageKey, ...event } = insertedEvent;

    trace.push({ insertedEvent });
    trace.log();
    return NextResponse.json<Event>(
      {
        ...event,
        imageUrl: imageKey ? toPublicUrl(imageKey) : event.imageUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
