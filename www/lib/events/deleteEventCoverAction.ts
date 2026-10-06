"use server";

import { del } from "@vercel/blob";

import { updateTag } from "next/cache";

import { getActionUser } from "@/lib/auth/getUser";
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

  const user = await getActionUser();
  if (!user || user.bannedAt) {
    logger.withError("unauthorized").flush();
    return { success: false, error: "non autorisé" };
  }

  const event = await selectEventFromId(eventId);
  if (!event) {
    logger.withError("not found").flush();
    return { success: false, error: "introuvable" };
  }

  let updatedEvent;
  try {
    updatedEvent = await deleteEventCoverFromId({ eventId, userId: user.id });
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }

  if (!updatedEvent) {
    logger.withError("cannot delete event cover").flush();
    return { success: false, error: "impossible de supprimer l'image" };
  }

  if (event.coverUrl) {
    await del(event.coverUrl);
  }

  updateTag("cachedEvents" satisfies CacheKey);

  logger.append({ eventId: updatedEvent.id });
  logger.flush();
  return { success: true, data: updatedEvent };
}
