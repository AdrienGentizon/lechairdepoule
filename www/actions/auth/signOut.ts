"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export default async function signOut() {
  try {
    const response = await auth.api.signOut({
      headers: await headers(),
    });
    if (!response.success) throw new Error(`cannot sign out`);
  } catch (error) {
    console.error(`[auth/signOut]`, error);
  }
}
