"use server";

import { updateTag } from "next/cache";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import deleteImage from "@/lib/deleteImage";
import { CacheKey } from "@/lib/types";

import deleteEventFromId from "./deleteEventFromId";

export default async function deleteEventAction(
  eventId: string,
): Promise<
  | { success: true; data: { eventId: string } }
  | { success: false; error: string }
> {
  const trace = new Trace("deleteEventAction");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return { success: false, error: "non autorisé" };
    }

    const event = await deleteEventFromId({ userId: user.id, eventId });

    if (!event) {
      trace.pushError("not found");
      trace.log(404);
      return { success: false, error: "introuvable" };
    }

    if (event.coverUrl) {
      await deleteImage(event.coverUrl, trace);
    }

    updateTag("cachedEvents" satisfies CacheKey);

    trace.push({ eventId: event.id });
    trace.log();
    return { success: true, data: { eventId: event.id } };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return { success: false, error: "erreur serveur" };
  }
}
