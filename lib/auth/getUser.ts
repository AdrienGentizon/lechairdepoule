"use server";

import { cache } from "react";

import { NextRequest } from "next/server";

import clerk from "../clerk";
import { logApiError } from "../logger";
import { selectUserFromAuthId } from "./selectUserFromId";

const getUserCached = cache(async (req: NextRequest) => {
  try {
    const { isAuthenticated, toAuth } = await clerk.authenticateRequest(req, {
      authorizedParties: [
        "http://localhost:3000",
        "https://dev.lechairdepoule.fr",
        "https://lechairdepoule.fr",
      ],
    });
    if (!isAuthenticated) {
      logApiError(req, `user not authenticated`);
      return;
    }
    const token = toAuth();
    if (!token?.userId) {
      logApiError(req, `user token undefined`);
      return;
    }

    const user = await selectUserFromAuthId({
      provider: "clerk",
      userId: token.userId,
    });
    if (!user) {
      logApiError(req, `user not found: ${token.userId}`);
    }
    return user;
  } catch (error) {
    logApiError(req, error);
    return;
  }
});

export default async function getUser(req: NextRequest) {
  return getUserCached(req);
}
