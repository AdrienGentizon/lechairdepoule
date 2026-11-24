"use server";

import { updateTag } from "next/cache";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import deleteImage from "@/lib/deleteImage";
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
  const trace = new Trace("deleteEventCoverAction");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return { success: false, error: "non autorisé" };
    }

    const event = await selectEventFromId(eventId);
    if (!event) {
      trace.pushError("not found");
      trace.log(404);
      return { success: false, error: "introuvable" };
    }

    const updatedEvent = await deleteEventCoverFromId({
      eventId,
      userId: user.id,
    });

    if (!updatedEvent) {
      trace.pushError("cannot delete event cover");
      trace.log(500);
      return { success: false, error: "impossible de supprimer l'image" };
    }

    if (event.coverUrl) {
      await deleteImage(event.coverUrl, trace);
    }

    updateTag("cachedEvents" satisfies CacheKey);

    trace.push({ eventId: updatedEvent.id });
    trace.log();
    return { success: true, data: updatedEvent };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return { success: false, error: "erreur serveur" };
  }
}
