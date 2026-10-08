"use server";

import { isAPIError } from "better-auth/api";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

import { auth } from "@/lib/auth";
import selectUserFromEmail from "@/lib/auth/selectUserFromEmail";
import sql from "@/lib/db";
import { obfuscateEmail } from "@/lib/string";
import Trace from "@/lib/trace";
import { CacheKey, Result } from "@/lib/types";

const AUTH_ERROR_KEYS: Record<string, string> = {
  INVALID_OTP: "invalid otp",
  OTP_EXPIRED: "expired otp",
  TOO_MANY_ATTEMPTS: "expired otp",
};

function toAuthErrorKey(error: unknown) {
  if (!isAPIError(error)) return undefined;

  return AUTH_ERROR_KEYS[error.body?.code ?? ""];
}

export default async function signInWithOTP(inputs: {
  email: string;
  otp: string;
}): Promise<Result<{ userId: string }>> {
  const trace = new Trace(`signInWithOTP`);
  try {
    const parsedInputs = z
      .object({
        email: z.email().max(254).toLowerCase(),
        otp: z.string(),
      })
      .safeParse(inputs);

    if (!parsedInputs.success) {
      trace.push([JSON.stringify(inputs), parsedInputs.error.message]);
      return { success: false, error: "bad_request" };
    }

    trace.push(obfuscateEmail(parsedInputs.data.email));
    const existingUser = await selectUserFromEmail({
      email: parsedInputs.data.email,
    });
    trace.push(JSON.stringify({ user: existingUser ?? "not_found" }));
    const session = await auth.api.signInEmailOTP({
      body: {
        email: parsedInputs.data.email,
        otp: parsedInputs.data.otp,
      },
      headers: await headers(),
    });

    if (existingUser?.authProvider === "better-auth") {
      trace.log();
      return { success: true, data: { userId: existingUser.id } };
    }

    const newUser = (
      await sql<{ id: string }[]>`
      INSERT INTO users
        (email, auth_provider, auth_id, created_at)
      VALUES
        (${parsedInputs.data.email}, 'better-auth', ${session.user.id}, NOW())
      ON CONFLICT (email) DO UPDATE SET
        auth_provider = EXCLUDED.auth_provider,
        auth_id = EXCLUDED.auth_id
      RETURNING
        id::text;`
    ).at(0);
    if (!newUser) return { success: false, error: "cannot insert new user" };

    revalidateTag("users" satisfies CacheKey, {});
    trace.log();
    return { success: true, data: { userId: newUser.id } };
  } catch (error) {
    trace.pushError(error);

    const otpErrorKey = toAuthErrorKey(error);
    if (otpErrorKey) {
      trace.log(400);
      return { success: false, error: otpErrorKey };
    }

    trace.log(500);

    return { success: false, error: `server error` };
  }
}
