"use server";

import { updateTag } from "next/cache";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import deleteImage from "@/lib/deleteImage";
import { CacheKey, Event } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

import updateEventCoverOrCleanup from "./updateEventCoverOrCleanup";

export default async function updateEventCoverAction(
  eventId: string,
  formData: FormData,
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

    const imageFileWithMetadata = await getImageFileWithMetadata(formData);
    if (!imageFileWithMetadata.success) {
      trace.push({ formData });
      trace.pushError("invalid payload");
      trace.log(400);
      return { success: false, error: "image non valide." };
    }

    const uploadedImage = await uploadImage(imageFileWithMetadata.data);
    if (!uploadedImage.success) {
      trace.push({ uploadError: uploadedImage.error });
      trace.pushError("upload failed");
      trace.log(500);
      return { success: false, error: "l'image n'a pas pu être chargée" };
    }

    const updateResult = await updateEventCoverOrCleanup(
      {
        userId: user.id,
        eventId,
        cover: uploadedImage.data,
      },
      trace,
    );
    if (!updateResult.success) {
      trace.pushError(updateResult.error);
      trace.log(500);
      return { success: false, error: "erreur serveur" };
    }
    const updatedEvent = updateResult.data;

    if (!updatedEvent) {
      trace.push({ eventId, uploadedImage: uploadedImage.data });
      trace.pushError("cannot update event cover");
      trace.log(500);
      return {
        success: false,
        error: "l'image n'a pas pu être sauvegardée",
      };
    }

    if (updatedEvent.previousCoverUrl) {
      await deleteImage(updatedEvent.previousCoverUrl, trace);
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
