"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";

export default async function signOut() {
  const logger = getLogger("signOut", "Action");
  try {
    const response = await auth.api.signOut({
      headers: await headers(),
    });
    if (!response.success) throw new Error(`cannot sign out`);

    logger.flush();
  } catch (error) {
    logger.withError(error).flush();
  }
}
