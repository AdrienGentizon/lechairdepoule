"use server";

import { cache } from "react";

import { NextRequest } from "next/server";

import clerk from "../clerk";
import { getRequestLogger } from "../getRequestLogger";
import insertUser from "./insertUser";
import { selectUserFromAuthId } from "./selectUserFromId";

async function insertNotFoundButAuthenticatedUser(
  userIdFromAuthProvider: string
): Promise<
  | { success: true; data: Awaited<ReturnType<typeof insertUser>> }
  | { success: false; error: string }
> {
  const clerkUser = await clerk.users.getUser(userIdFromAuthProvider);
  const email = clerkUser.emailAddresses.find(
    ({ id }) => id === clerkUser.primaryEmailAddressId
  )?.emailAddress;
  if (!email) {
    return {
      success: false,
      error: `no primary email for clerk user: ${userIdFromAuthProvider}`,
    };
  }

  const insertedUser = await insertUser({
    email,
    auth: { provider: "clerk", userId: userIdFromAuthProvider },
  });
  if (!insertedUser) {
    return {
      success: false,
      error: `cannot insert user: ${userIdFromAuthProvider}`,
    };
  }

  return {
    success: true,
    data: insertedUser,
  };
}

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
    if (user) return user;

    const newUser = await insertNotFoundButAuthenticatedUser(token.userId);

    if (!newUser.success) {
      throw new Error(newUser.error);
    }
    return newUser.data;
  } catch (error) {
    logger.withError(error).flush();
    return;
  }
});

export default async function getUser(req: NextRequest) {
  return getUserCached(req);
}
