import { Result } from "@cdp/lib/types";

import env from "@/lib/env";

export default async function revalidateWww(): Promise<Result<null>> {
  try {
    const response = await fetch(`${env().WWW_URL}/api/webhooks/cms`, {
      method: "POST",
      headers: { "x-webhook-secret": env().CMS_WEBHOOK_SECRET },
    });
    if (!response.ok) return { success: false, error: "server_error" };
    return { success: true, data: null };
  } catch {
    return { success: false, error: "server_error" };
  }
}
