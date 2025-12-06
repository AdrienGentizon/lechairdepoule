import { createClerkClient } from "@clerk/backend";

import env from "./env";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: env().NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

export { clerk as default };
