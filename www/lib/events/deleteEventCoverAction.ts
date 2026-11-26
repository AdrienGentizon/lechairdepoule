"use server";

import { updateTag } from "next/cache";

import { deleteObject } from "@cdp/lib/s3";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import { CacheKey, Event } from "@/lib/types";

import deleteEventCoverFromId from "./deleteEventCoverFromId";

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

    const updatedEvent = await deleteEventCoverFromId({
      eventId,
      userId: user.id,
    });

    if (!updatedEvent) {
      trace.pushError("cannot delete event cover");
      trace.log(500);
      return { success: false, error: "impossible de supprimer l'image" };
    }

    if (updatedEvent.previousCoverKey) {
      await deleteObject({ key: updatedEvent.previousCoverKey });
    }

    updateTag("cachedEvents" satisfies CacheKey);

    trace.push({ eventId: updatedEvent.id });
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
