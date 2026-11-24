import { del } from "@vercel/blob";

import { getLogger } from "./logger";

export default async function deleteImage(
  url: string,
  logger?: ReturnType<typeof getLogger>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await del(url);
    return { success: true };
  } catch (error) {
    const message = `${(error as Error)?.message ?? error}`;
    logger?.append({ deleteImageError: message, url });
    return { success: false, error: message };
  }
}
