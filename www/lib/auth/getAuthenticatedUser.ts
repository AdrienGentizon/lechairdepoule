import { cache } from "react";

import { headers } from "next/headers";
import "server-only";

import { auth } from "@/lib/auth";
import { selectUserFromAuthId } from "@/lib/auth/selectUserFromId";

const getAuthenticatedUserCached = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  return selectUserFromAuthId({
    provider: "better-auth",
    userId: session.user.id,
  });
});

export default async function getAuthenticatedUser() {
  return getAuthenticatedUserCached();
}
