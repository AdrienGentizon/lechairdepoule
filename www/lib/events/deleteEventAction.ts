"use server";

import { updateTag } from "next/cache";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import deleteImage from "@/lib/deleteImage";
import { getLogger } from "@/lib/logger";
import { CacheKey } from "@/lib/types";

import deleteEventFromId from "./deleteEventFromId";

export default async function deleteEventAction(
  eventId: string,
): Promise<
  | { success: true; data: { eventId: string } }
  | { success: false; error: string }
> {
  const logger = getLogger("deleteEventAction", "Action");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return { success: false, error: "non autorisé" };
    }

    const event = await deleteEventFromId({ userId: user.id, eventId });

    if (!event) {
      logger.withError("not found").flush();
      return { success: false, error: "introuvable" };
    }

    if (event.coverUrl) {
      await deleteImage(event.coverUrl, logger);
    }

    updateTag("cachedEvents" satisfies CacheKey);

    logger.append({ eventId: event.id });
    logger.flush();
    return { success: true, data: { eventId: event.id } };
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }
}
