"use server";

import { del } from "@vercel/blob";

import { updateTag } from "next/cache";

import { getActionUser } from "@/lib/auth/getUser";
import { getLogger } from "@/lib/logger";
import { CacheKey, Event } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

import updateEventCoverFromId from "./updateEventCoverFromId";

export default async function updateEventCoverAction(
  eventId: string,
  formData: FormData
): Promise<
  | {
      success: true;
      data: Pick<Event, "id" | "coverUrl" | "coverWidth" | "coverHeight">;
    }
  | { success: false; error: string }
> {
  const logger = getLogger("updateEventCoverAction", "Action");

  const user = await getActionUser();
  if (!user || user.bannedAt) {
    logger.withError("unauthorized").flush();
    return { success: false, error: "non autorisé" };
  }

  const imageFileWithMetadata = await getImageFileWithMetadata(formData);
  if (!imageFileWithMetadata.success) {
    logger.append({ formData });
    logger.withError("invalid payload").flush();
    return { success: false, error: "image non valide." };
  }

  const uploadedImage = await uploadImage(imageFileWithMetadata.data);
  if (!uploadedImage.success) {
    logger.append({ uploadError: uploadedImage.error });
    logger.withError("upload failed").flush();
    return { success: false, error: "l'image n'a pas pu être chargée" };
  }

  let updatedEvent;
  try {
    updatedEvent = await updateEventCoverFromId({
      userId: user.id,
      eventId,
      cover: uploadedImage.data,
    });
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }

  if (!updatedEvent) {
    logger.append({ eventId, uploadedImage: uploadedImage.data });
    logger.withError("cannot update event cover").flush();
    return {
      success: false,
      error: "l'image n'a pas pu être sauvegardée",
    };
  }

  if (updatedEvent.previousCoverUrl) {
    await del(updatedEvent.previousCoverUrl);
  }

  updateTag("cachedEvents" satisfies CacheKey);

  logger.append({ updatedEvent });
  logger.flush();
  return {
    success: true,
    data: {
      id: updatedEvent.id,
      coverUrl: updatedEvent.coverUrl,
      coverWidth: updatedEvent.coverWidth,
      coverHeight: updatedEvent.coverHeight,
    },
  };
}
