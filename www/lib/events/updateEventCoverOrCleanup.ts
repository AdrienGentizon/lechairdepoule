import { deleteObject } from "@cdp/lib/s3";

import updateEventCoverFromId from "./updateEventCoverFromId";

export default async function updateEventCoverOrCleanup(
  params: Parameters<typeof updateEventCoverFromId>[0],
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
      await deleteObject({ key: params.cover.objectKey });
    }
    return { success: true, data: updatedEvent };
  } catch (error) {
    await deleteObject({ key: params.cover.objectKey });
    return {
      success: false,
      error: `${(error as Error)?.message ?? error}`,
    };
  }
}
