import { del } from "@vercel/blob";

import Trace from "@cdp/lib/trace";

export default async function deleteImage(
  url: string,
  trace?: Trace,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await del(url);
    return { success: true };
  } catch (error) {
    const message = `${(error as Error)?.message ?? error}`;
    trace?.push({ deleteImageError: message, url });
    return { success: false, error: message };
  }
}
