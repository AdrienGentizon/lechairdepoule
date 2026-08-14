import { del } from "@vercel/blob";

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import deleteEventCoverFromId from "@/lib/events/deleteEventCoverFromId";
import selectEventFromId from "@/lib/events/selectEventFromId";
import updateEventCoverFromId from "@/lib/events/updateEventCoverFromId";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { CacheKey, Event } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

export async function POST(
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

    const formData = await req.formData();

    const imageFileWithMetadata = await getImageFileWithMetadata(formData);

    if (!imageFileWithMetadata.success) {
      logger.append({ formData });
      logger.withError("invalid payload").flush();
      return NextResponse.json({ error: "image non valide." }, { status: 400 });
    }

    const uploadedImage = await uploadImage(imageFileWithMetadata.data);
    if (!uploadedImage.success) {
      logger.append({ uploadError: uploadedImage.error });
      logger.withError("upload failed").flush();
      return NextResponse.json(
        { error: "l'image n'a pas pu être chargée" },
        { status: 500 }
      );
    }

    const values = {
      userId: user.id,
      eventId: params.eventId,
      cover: uploadedImage.data,
    };
    const updatedEvent = await updateEventCoverFromId(values);

    if (!updatedEvent) {
      logger.append({ values });
      logger.withError("cannot update event cover").flush();
      return NextResponse.json(
        { error: "l'image n'a pas pu être sauvegardée" },
        { status: 500 }
      );
    }

    if (updatedEvent.previousCoverUrl) {
      await del(updatedEvent.previousCoverUrl);
    }

    revalidateTag("cachedEvents" satisfies CacheKey, "max");
    logger.append({ updatedEvent });
    logger.flush();
    return NextResponse.json<
      Pick<Event, "id" | "coverUrl" | "coverWidth" | "coverHeight">
    >(
      {
        id: updatedEvent.id,
        coverUrl: updatedEvent.coverUrl,
        coverWidth: updatedEvent.coverWidth,
        coverHeight: updatedEvent.coverHeight,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

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

    const event = await selectEventFromId(params.eventId);

    if (!event) {
      logger.withError("not found").flush();
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }

    const updatedEvent = await deleteEventCoverFromId({
      eventId: params.eventId,
      userId: user.id,
    });

    if (!updatedEvent) {
      logger.withError("cannot delete event cover").flush();
      return NextResponse.json(
        { error: "impossible de supprimer l'image" },
        { status: 500 }
      );
    }

    if (event.coverUrl) {
      await del(event.coverUrl);
    }

    revalidateTag("cachedEvents" satisfies CacheKey, "max");
    logger.append({ eventId: updatedEvent.id });
    logger.flush();
    return NextResponse.json<
      Pick<Event, "id" | "coverUrl" | "coverWidth" | "coverHeight">
    >(updatedEvent, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
