"use server";

import { del } from "@vercel/blob";

import { updateTag } from "next/cache";

import { getActionUser } from "@/lib/auth/getUser";
import { getLogger } from "@/lib/logger";
import { CacheKey } from "@/lib/types";

import deleteEventFromId from "./deleteEventFromId";

export default async function deleteEventAction(
  eventId: string
): Promise<
  | { success: true; data: { eventId: string } }
  | { success: false; error: string }
> {
  const logger = getLogger("deleteEventAction", "Action");

  const user = await getActionUser();
  if (!user || user.bannedAt) {
    logger.withError("unauthorized").flush();
    return { success: false, error: "non autorisé" };
  }

  let event;
  try {
    event = await deleteEventFromId({ userId: user.id, eventId });
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }

  if (!event) {
    logger.withError("not found").flush();
    return { success: false, error: "introuvable" };
  }

  if (event.coverUrl) {
    await del(event.coverUrl);
  }

  updateTag("cachedEvents" satisfies CacheKey);

  logger.append({ eventId: event.id });
  logger.flush();
  return { success: true, data: { eventId: event.id } };
}
