import { Webhook } from "svix";
import env from "./env";

export async function getVerifiedWebhookPayload(req: Request) {
  return new Webhook(env().CLERK_CREATE_USER_WEBHOOK_SECRET).verify(
    await req.text(),
    {
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    },
  ) as Promise<{
    data: {
      id: string;
      primary_email_address_id: string;
      created_at: number;
      email_addresses: [
        {
          email_address: string;
          id: string;
          verification: {
            status: (string & {}) | "verified";
            strategy: "ticket";
          };
        },
      ];
      object: (string & {}) | "event";
      timestamp: number;
      type: (string & {}) | "user.created";
    };
  }>;
}
