import deleteImage from "@/lib/deleteImage";
import { getLogger } from "@/lib/logger";
import { Event } from "@/lib/types";

import insertEvent from "./insertEvent";

export default async function insertEventOrCleanupCover(
  event: Parameters<typeof insertEvent>[0],
  logger: ReturnType<typeof getLogger>,
): Promise<{ success: true; data: Event } | { success: false; error: string }> {
  try {
    return { success: true, data: await insertEvent(event) };
  } catch (error) {
    if (event.cover) {
      await deleteImage(event.cover.url, logger);
    }
    return {
      success: false,
      error: `${(error as Error)?.message ?? error}`,
    };
  }
}
