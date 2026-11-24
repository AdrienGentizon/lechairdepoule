import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export default async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
}
