"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import { EventFormSchema } from "@/lib/schemas";
import { CacheKey, Event } from "@/lib/types";

import { getLogger } from "../logger";
import updateEventFromId from "./updateEventFromId";

export default async function updateEventAction(
  eventId: string,
  values: z.infer<typeof EventFormSchema>,
): Promise<
  | { success: true; data: Omit<Event, "createdBy"> }
  | { success: false; error: string }
> {
  const logger = getLogger("updateEventAction", "Action");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return { success: false, error: "non autorisé" };
    }

    const parsedInputs = EventFormSchema.safeParse(values);
    if (!parsedInputs.success) {
      logger.append({ values });
      logger.withError(parsedInputs.error).flush();
      return {
        success: false,
        error: "modification non valide l'événement ne sera pas mofifié",
      };
    }

    const updatedEvent = await updateEventFromId({
      userId: user.id,
      eventId,
      type: parsedInputs.data.type,
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      startsAt: parsedInputs.data.startsAt,
      endsAt: parsedInputs.data.endsAt,
      timezone: parsedInputs.data.timezone,
      price: parsedInputs.data.price,
      venue: parsedInputs.data.venue ?? null,
      url: parsedInputs.data.url ?? null,
    });

    if (!updatedEvent) {
      logger.append({ eventId, values });
      logger.withError("cannot update event").flush();
      return { success: false, error: "impossible de modifier l'événement" };
    }

    updateTag("cachedEvents" satisfies CacheKey);

    logger.append({ updatedEvent });
    logger.flush();
    return { success: true, data: updatedEvent };
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }
}
