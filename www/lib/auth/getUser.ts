"use server";

import { cache } from "react";

import { headers } from "next/headers";
import { NextRequest } from "next/server";

import { auth } from "../auth";
import { getRequestLogger } from "../getRequestLogger";
import { getLogger } from "../logger";
import insertUser from "./insertUser";
import selectClerkUserFromEmail from "./selectClerkUserFromEmail";
import { selectUserFromAuthId } from "./selectUserFromId";
import updateUserAuth from "./updateUserAuth";

async function selectOrCreateUser(
  session: { userId: string; email: string },
  logger: ReturnType<typeof getLogger>,
) {
  const authValues = {
    provider: "better-auth" as const,
    userId: session.userId,
  };

  const user = await selectUserFromAuthId(authValues);
  if (user) return user;

  const clerkUser = await selectClerkUserFromEmail({ email: session.email });
  if (clerkUser) {
    logger.append({ message: "migrating clerk user", id: clerkUser.id });
    return updateUserAuth({ id: clerkUser.id, auth: authValues });
  }

  logger.append({ message: "inserting user", authId: session.userId });
  return insertUser({ email: session.email, auth: authValues });
}

async function getUserFromHeaders(
  requestHeaders: Headers,
  logger: ReturnType<typeof getLogger>,
) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return;

  const user = await selectOrCreateUser(
    { userId: session.user.id, email: session.user.email },
    logger,
  );
  if (!user) throw new Error(`cannot get user: ${session.user.id}`);

  return user;
}

const getUserCached = cache(async (req: NextRequest) => {
  const logger = getRequestLogger(req);
  try {
    return await getUserFromHeaders(req.headers, logger);
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
    return await getUserFromHeaders(requestHeaders, logger);
  } catch (error) {
    logger.withError(error).flush();
    return;
  }
});

export async function getActionUser() {
  return getActionUserCached();
}
