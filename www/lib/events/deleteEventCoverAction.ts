"use server";

import { updateTag } from "next/cache";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import deleteImage from "@/lib/deleteImage";
import { getLogger } from "@/lib/logger";
import { CacheKey, Event } from "@/lib/types";

import deleteEventCoverFromId from "./deleteEventCoverFromId";
import selectEventFromId from "./selectEventFromId";

export default async function deleteEventCoverAction(eventId: string): Promise<
  | {
      success: true;
      data: Pick<Event, "id" | "coverUrl" | "coverWidth" | "coverHeight">;
    }
  | { success: false; error: string }
> {
  const logger = getLogger("deleteEventCoverAction", "Action");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return { success: false, error: "non autorisé" };
    }

    const event = await selectEventFromId(eventId);
    if (!event) {
      logger.withError("not found").flush();
      return { success: false, error: "introuvable" };
    }

    const updatedEvent = await deleteEventCoverFromId({
      eventId,
      userId: user.id,
    });

    if (!updatedEvent) {
      logger.withError("cannot delete event cover").flush();
      return { success: false, error: "impossible de supprimer l'image" };
    }

    if (event.coverUrl) {
      await deleteImage(event.coverUrl, logger);
    }

    updateTag("cachedEvents" satisfies CacheKey);

    logger.append({ eventId: updatedEvent.id });
    logger.flush();
    return { success: true, data: updatedEvent };
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }
}
