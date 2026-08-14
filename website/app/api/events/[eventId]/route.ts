import { del } from "@vercel/blob";

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import deleteEventFromId from "@/lib/events/deleteEventFromId";
import updateEventFromId from "@/lib/events/updateEventFromId";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { EventFormSchema } from "@/lib/schemas";
import { CacheKey, Event } from "@/lib/types";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> }
) {
  const params = await ctx.params;
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const event = await deleteEventFromId({
      userId: user.id,
      eventId: params.eventId,
    });

    if (!event) {
      logger.withError("not found").flush();
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }

    if (event.coverUrl) {
      await del(event.coverUrl);
    }

    revalidateTag("cachedEvents" satisfies CacheKey, "max");
    logger.flush();
    return NextResponse.json<{ eventId: string }>(
      { eventId: event.id },
      { status: 200 }
    );
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> }
) {
  const params = await ctx.params;
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const payload = Object.fromEntries((await req.formData()).entries());

    const parsedInputs = EventFormSchema.safeParse(payload);

    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json(
        {
          error: "modification non valide l'événement ne sera pas mofifié",
        },
        { status: 400 }
      );
    }

    const values = {
      userId: user.id,
      eventId: params.eventId,
      type: parsedInputs.data.type,
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      startsAt: parsedInputs.data.startsAt,
      endsAt: parsedInputs.data.endsAt,
      timezone: parsedInputs.data.timezone,
      price: parsedInputs.data.price,
      venue: parsedInputs.data.venue ?? null,
      url: parsedInputs.data.url ?? null,
    };
    const updatedEvent = await updateEventFromId(values);

    if (!updatedEvent) {
      logger.append({ values });
      logger.withError("cannot update event").flush();
      return NextResponse.json(
        { error: "impossible de modifier l'événement" },
        { status: 500 }
      );
    }
    revalidateTag("cachedEvents" satisfies CacheKey, "max");

    logger.append({ updatedEvent });
    logger.flush();
    return NextResponse.json<Omit<Event, "createdBy">>(updatedEvent, {
      status: 200,
    });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
