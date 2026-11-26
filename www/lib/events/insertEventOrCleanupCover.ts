import { deleteObject } from "@cdp/lib/s3";

import { Event } from "@/lib/types";

import insertEvent from "./insertEvent";

export default async function insertEventOrCleanupCover(
  event: Parameters<typeof insertEvent>[0],
): Promise<{ success: true; data: Event } | { success: false; error: string }> {
  try {
    return { success: true, data: await insertEvent(event) };
  } catch (error) {
    if (event.cover) {
      await deleteObject({ key: event.cover.objectKey });
    }
    return {
      success: false,
      error: `${(error as Error)?.message ?? error}`,
    };
  }
}
