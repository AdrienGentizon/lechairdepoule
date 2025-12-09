"use server";

import { cache } from "react";

import { NextRequest } from "next/server";

import clerk from "../clerk";
import { selectUserFromAuthId } from "./selectUserFromId";

const getUserCached = cache(async (req: NextRequest) => {
  try {
    const { isAuthenticated, toAuth } = await clerk.authenticateRequest(req, {
      authorizedParties: [
        "https://lechairdepoule.fr/",
        "https://www.lechairdepoule.fr/",
        "https://dev.lechairdepoule.fr/",
        "http://localhost:3000",
      ],
    });
    const token = toAuth();
    if (!isAuthenticated || !token?.userId) return;

    return selectUserFromAuthId({
      provider: "clerk",
      userId: token.userId,
    });
  } catch (error) {
    console.error(
      `[Error] getUserCached: ${(error as Error)?.message ?? error}`
    );
    return;
  }
});

export default async function getUser(req: NextRequest) {
  return getUserCached(req);
}
