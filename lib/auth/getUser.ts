"use server";

import { cache } from "react";

import { NextRequest } from "next/server";

import clerk from "../clerk";
import { getRequestLogger } from "../getRequestLogger";
import { selectUserFromAuthId } from "./selectUserFromId";

const getUserCached = cache(async (req: NextRequest) => {
  const logger = getRequestLogger(req);
  try {
    const { isAuthenticated, toAuth, message } =
      await clerk.authenticateRequest(req, {
        authorizedParties: [
          "http://localhost:3000",
          "https://dev.lechairdepoule.fr",
          "https://lechairdepoule.fr",
          "https://www.lechairdepoule.fr",
        ],
      });
    if (message) logger.append(message);
    if (!isAuthenticated) {
      logger.withError("user not authenticated").flush();
      return;
    }
    const token = toAuth();
    if (!token?.userId) {
      logger.withError("user token undefined").flush();
      return;
    }

    const user = await selectUserFromAuthId({
      provider: "clerk",
      userId: token.userId,
    });
    if (!user) {
      logger.withError(`user not found: ${token.userId}`).flush();
    }
    return user;
  } catch (error) {
    logger.withError(error).flush();
    return;
  }
});

export default async function getUser(req: NextRequest) {
  return getUserCached(req);
}
