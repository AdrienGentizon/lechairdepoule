"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import selectUserFromId from "./selectUserFromId";

const getUserCached = cache(async () => {
  const { id } = await verifyToken((await cookies()).get("token")?.value);
  if (!id) {
    return;
  }
  return selectUserFromId(id);
});

export default async function getUser() {
  return getUserCached();
}
