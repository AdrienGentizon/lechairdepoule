"use server";

import { cache } from "react";

import { headers } from "next/headers";
import { NextRequest } from "next/server";

import clerk from "../clerk";
import { getRequestLogger } from "../getRequestLogger";
import { getLogger } from "../logger";
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

async function authenticateUserId(
  request: Request,
  logger: ReturnType<typeof getLogger>
) {
  const { isAuthenticated, toAuth, message } = await clerk.authenticateRequest(
    request,
    {
      authorizedParties: [
        "http://localhost:3000",
        "https://dev.lechairdepoule.fr",
        "https://lechairdepoule.fr",
        "https://www.lechairdepoule.fr",
      ],
    }
  );
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
  return token.userId;
}

const getUserCached = cache(async (req: NextRequest) => {
  const logger = getRequestLogger(req);
  try {
    const userId = await authenticateUserId(req, logger);
    if (!userId) return;

    const user = await selectUserFromAuthId({ provider: "clerk", userId });
    if (user) return user;

    const newUser = await insertNotFoundButAuthenticatedUser(userId);

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

const getActionUserCached = cache(async () => {
  const requestHeaders = await headers();
  const logger = getLogger(`ACTION ${requestHeaders.get("host")}`, "Request");
  try {
    const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
    const request = new Request(`${proto}://${requestHeaders.get("host")}`, {
      headers: requestHeaders,
    });

    const userId = await authenticateUserId(request, logger);
    if (!userId) return;

    return selectUserFromAuthId({ provider: "clerk", userId });
  } catch (error) {
    logger.withError(error).flush();
    return;
  }
});

export async function getActionUser() {
  return getActionUserCached();
}
