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
import { Event } from "@cdp/lib/types";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import deleteEvent from "@/lib/event/deleteEvent";
import selectOrganizationEvent from "@/lib/event/selectOrganizationEvent";
import updateEvent from "@/lib/event/updateEvent";
import revalidateWww from "@/lib/revalidateWww";
import { EventUpdateInputSchema } from "@/lib/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string; eventId: string }> },
) {
  const { organizationId, eventId } = await params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const selectedEvent = await selectOrganizationEvent({
      eventId,
      organizationId,
      userId: user.id,
    });
    if (!selectedEvent) {
      trace.push({ organizationId, eventId });
      throw new CustomError("not_found", {}, 404);
    }

    const { imageKey, ...event } = selectedEvent;

    trace.log();
    return NextResponse.json<Event>(
      {
        ...event,
        imageUrl: imageKey ? toPublicUrl(imageKey) : null,
      },
      { status: 200 },
    );
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}

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
    const parsedInputs = EventUpdateInputSchema.safeParse(payload);
    if (!parsedInputs.success) {
      trace.push([{ payload }, parsedInputs.error.message]);
      throw new CustomError("bad_request", {}, 400);
    }

    const currentEvent = await selectOrganizationEvent({
      eventId,
      organizationId,
      userId: user.id,
    });
    if (!currentEvent) {
      trace.push({ organizationId, eventId });
      throw new CustomError("not_found", {}, 404);
    }

    const { cover, ...inputs } = parsedInputs.data;

    if (cover.action === "REPLACE") {
      trace.push({ objectKey: cover.objectKey });
      await assertUploadedImage({
        objectKey: cover.objectKey,
        keyPrefix: toOrganizationObjectKeyPrefix(organizationId),
      });
    }

    const image =
      cover.action === "KEEP"
        ? {
            imageKey: currentEvent.imageKey,
            imageWidth: currentEvent.imageWidth,
            imageHeight: currentEvent.imageHeight,
          }
        : cover.action === "REPLACE"
          ? {
              imageKey: cover.objectKey,
              imageWidth: cover.width,
              imageHeight: cover.height,
            }
          : {
              imageKey: null,
              imageWidth: null,
              imageHeight: null,
            };

    const updatedEvent = await updateEvent({
      eventId,
      organizationId,
      userId: user.id,
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
      ...image,
    });
    if (!updatedEvent) {
      if (cover.action === "REPLACE")
        await deleteObject({ key: cover.objectKey });
      throw new CustomError("unknown_error");
    }

    if (currentEvent.imageKey && currentEvent.imageKey !== image.imageKey) {
      await deleteObject({ key: currentEvent.imageKey });
    }

    const revalidation = await revalidateWww();
    if (!revalidation.success) trace.pushError("www revalidation failed");

    const { imageKey, ...event } = updatedEvent;

    trace.push({ updatedEvent });
    trace.log();
    return NextResponse.json<Event>(
      {
        ...event,
        imageUrl: imageKey ? toPublicUrl(imageKey) : null,
      },
      { status: 200 },
    );
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string; eventId: string }> },
) {
  const { organizationId, eventId } = await params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) throw new CustomError("unauthorized", {}, 401);
    trace.push(getLoggableUser(user));

    const deletedEvent = await deleteEvent({
      eventId,
      organizationId,
      userId: user.id,
    });
    if (!deletedEvent) {
      trace.push({ organizationId, eventId });
      throw new CustomError("not_found", {}, 404);
    }

    if (deletedEvent.imageKey) {
      await deleteObject({ key: deletedEvent.imageKey });
    }

    const revalidation = await revalidateWww();
    if (!revalidation.success) trace.pushError("www revalidation failed");

    trace.push({ deletedEvent });
    trace.log();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return CustomError.toResponse(error, trace);
  }
}
