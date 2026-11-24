"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import { EventFormSchema } from "@/lib/schemas";
import { CacheKey, Event } from "@/lib/types";

import updateEventFromId from "./updateEventFromId";

export default async function updateEventAction(
  eventId: string,
  values: z.infer<typeof EventFormSchema>,
): Promise<
  | { success: true; data: Omit<Event, "createdBy"> }
  | { success: false; error: string }
> {
  const trace = new Trace("updateEventAction");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return { success: false, error: "non autorisé" };
    }

    const parsedInputs = EventFormSchema.safeParse(values);
    if (!parsedInputs.success) {
      trace.push({ values });
      trace.pushError(parsedInputs.error);
      trace.log(400);
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
      trace.push({ eventId, values });
      trace.pushError("cannot update event");
      trace.log(500);
      return { success: false, error: "impossible de modifier l'événement" };
    }

    updateTag("cachedEvents" satisfies CacheKey);

    trace.push({ updatedEvent });
    trace.log();
    return { success: true, data: updatedEvent };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return { success: false, error: "erreur serveur" };
  }
}
