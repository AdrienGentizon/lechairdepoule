"use server";

import { updateTag } from "next/cache";

import assertUploadedImage from "@cdp/lib/image/assertUploadedImage";
import { toUserObjectKeyPrefix } from "@cdp/lib/s3";
import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import { CoverInputSchema, EventFormSchema } from "@/lib/schemas";
import { CacheKey, Event } from "@/lib/types";

import insertEventOrCleanupCover from "./insertEventOrCleanupCover";

export default async function insertEventAction(
  formData: FormData,
): Promise<{ success: true; data: Event } | { success: false; error: string }> {
  const trace = new Trace("insertEventAction");
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return { success: false, error: "non autorisé" };
    }

    const payload = Object.fromEntries(formData.entries());
    const parsedInputs = EventFormSchema.safeParse(payload);
    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return { success: false, error: "événement non valide ne sera pas créé" };
    }

    const parsedCover = CoverInputSchema.safeParse({
      objectKey: payload.coverObjectKey,
      width: payload.coverWidth,
      height: payload.coverHeight,
    });
    const cover = parsedCover.success ? parsedCover.data : undefined;

    if (cover) {
      trace.push({ objectKey: cover.objectKey });
      await assertUploadedImage({
        objectKey: cover.objectKey,
        keyPrefix: toUserObjectKeyPrefix(user.id),
      });
    }

    const insertResult = await insertEventOrCleanupCover({
      type: parsedInputs.data.type,
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      user: {
        id: user.id,
        pseudo: user.pseudo ?? "",
        bannedAt: user.bannedAt,
      },
      cover,
      startDate: parsedInputs.data.startDate,
      startTime: parsedInputs.data.startTime,
      endDate: parsedInputs.data.endDate,
      endTime: parsedInputs.data.endTime,
      timezone: parsedInputs.data.timezone,
      price: parsedInputs.data.price,
      venue: parsedInputs.data.venue,
      url: parsedInputs.data.url,
    });
    if (!insertResult.success) {
      trace.pushError(insertResult.error);
      trace.log(500);
      return { success: false, error: "erreur serveur" };
    }
    const insertedEvent = insertResult.data;

    updateTag("cachedEvents" satisfies CacheKey);

    trace.push({ insertedEvent });
    trace.log();
    return { success: true, data: insertedEvent };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return { success: false, error: "erreur serveur" };
  }
}
