import deleteImage from "@/lib/deleteImage";
import { getLogger } from "@/lib/logger";

import updateEventCoverFromId from "./updateEventCoverFromId";

export default async function updateEventCoverOrCleanup(
  params: Parameters<typeof updateEventCoverFromId>[0],
  logger: ReturnType<typeof getLogger>,
): Promise<
  | {
      success: true;
      data: Awaited<ReturnType<typeof updateEventCoverFromId>>;
    }
  | { success: false; error: string }
> {
  try {
    const updatedEvent = await updateEventCoverFromId(params);
    if (!updatedEvent) {
      await deleteImage(params.cover.url, logger);
    }
    return { success: true, data: updatedEvent };
  } catch (error) {
    await deleteImage(params.cover.url, logger);
    return {
      success: false,
      error: `${(error as Error)?.message ?? error}`,
    };
  }
}
