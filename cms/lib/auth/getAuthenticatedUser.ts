import { cache } from "react";

import { headers } from "next/headers";
import "server-only";

import { auth } from "@/lib/auth";
import selectUserFromAuthId from "@/lib/auth/selectUserFromAuthId";

const getAuthenticatedUserCached = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  return selectUserFromAuthId({
    authId: session.user.id,
    authProvider: "better-auth",
  });
});

export default async function getAuthenticatedUser() {
  return getAuthenticatedUserCached();
}
