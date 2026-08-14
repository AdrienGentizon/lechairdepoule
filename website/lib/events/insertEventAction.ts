"use server";

import { updateTag } from "next/cache";

import { getActionUser } from "@/lib/auth/getUser";
import { getLogger } from "@/lib/logger";
import { EventFormSchema } from "@/lib/schemas";
import { CacheKey, Event } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

import insertEvent from "./insertEvent";

export default async function insertEventAction(
  formData: FormData
): Promise<{ success: true; data: Event } | { success: false; error: string }> {
  const logger = getLogger("insertEventAction", "Action");

  const user = await getActionUser();
  if (!user || user.bannedAt) {
    logger.withError("unauthorized").flush();
    return { success: false, error: "non autorisé" };
  }

  const payload = Object.fromEntries(formData.entries());
  const parsedInputs = EventFormSchema.safeParse(payload);
  if (!parsedInputs.success) {
    logger.append({ payload });
    logger.withError(parsedInputs.error).flush();
    return { success: false, error: "événement non valide ne sera pas créé" };
  }

  const imageFileWithMetadata = await getImageFileWithMetadata(formData);
  let cover: { url: string; width: number; height: number } | undefined =
    undefined;

  if (imageFileWithMetadata.success) {
    const uploadResult = await uploadImage(imageFileWithMetadata.data);
    if (uploadResult.success) {
      cover = uploadResult.data;
    } else {
      logger.append({ uploadError: uploadResult.error });
    }
  }

  let insertedEvent;
  try {
    insertedEvent = await insertEvent({
      type: parsedInputs.data.type,
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      user: { id: user.id, pseudo: user.pseudo ?? "", bannedAt: user.bannedAt },
      cover,
      startsAt: parsedInputs.data.startsAt,
      endsAt: parsedInputs.data.endsAt,
      timezone: parsedInputs.data.timezone,
      price: parsedInputs.data.price,
      venue: parsedInputs.data.venue,
      url: parsedInputs.data.url,
    });
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }

  updateTag("cachedEvents" satisfies CacheKey);

  logger.append({ insertedEvent });
  logger.flush();
  return { success: true, data: insertedEvent };
}
