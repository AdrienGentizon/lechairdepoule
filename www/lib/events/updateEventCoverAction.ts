"use server";

import { updateTag } from "next/cache";

import assertUploadedImage from "@cdp/lib/image/assertUploadedImage";
import { deleteObject, toUserObjectKeyPrefix } from "@cdp/lib/s3";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import { CoverInputSchema } from "@/lib/schemas";
import { CacheKey, Event } from "@/lib/types";

import updateEventCoverOrCleanup from "./updateEventCoverOrCleanup";

export default async function updateEventCoverAction(
  eventId: string,
  cover: { objectKey: string; width: number; height: number },
): Promise<
  | {
      success: true;
      data: Pick<Event, "id" | "coverUrl" | "coverWidth" | "coverHeight">;
    }
  | { success: false; error: string }
> {
  const trace = new Trace("updateEventCoverAction");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return { success: false, error: "non autorisé" };
    }

    const parsedCover = CoverInputSchema.safeParse(cover);
    if (!parsedCover.success) {
      trace.push({ cover });
      trace.pushError(parsedCover.error);
      trace.log(400);
      return { success: false, error: "image non valide." };
    }

    trace.push({ objectKey: parsedCover.data.objectKey });
    await assertUploadedImage({
      objectKey: parsedCover.data.objectKey,
      keyPrefix: toUserObjectKeyPrefix(user.id),
    });

    const updateResult = await updateEventCoverOrCleanup({
      userId: user.id,
      eventId,
      cover: parsedCover.data,
    });
    if (!updateResult.success) {
      trace.pushError(updateResult.error);
      trace.log(500);
      return { success: false, error: "erreur serveur" };
    }
    const updatedEvent = updateResult.data;

    if (!updatedEvent) {
      trace.push({ eventId });
      trace.pushError("cannot update event cover");
      trace.log(500);
      return {
        success: false,
        error: "l'image n'a pas pu être sauvegardée",
      };
    }

    if (updatedEvent.previousCoverKey) {
      await deleteObject({ key: updatedEvent.previousCoverKey });
    }

    updateTag("cachedEvents" satisfies CacheKey);

    trace.push({ updatedEvent });
    trace.log();
    return {
      success: true,
      data: {
        id: updatedEvent.id,
        coverUrl: updatedEvent.coverUrl,
        coverWidth: updatedEvent.coverWidth,
        coverHeight: updatedEvent.coverHeight,
      },
    };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return { success: false, error: "erreur serveur" };
  }
}
