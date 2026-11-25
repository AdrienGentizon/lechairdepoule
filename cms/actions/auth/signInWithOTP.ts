"use server";

import { isAPIError as isBetterAuthError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

import { obfuscateEmail } from "@cdp/lib/string";
import Trace, { toObfuscatedUser } from "@cdp/lib/trace";
import { AuthErrorKeys, Result } from "@cdp/lib/types";

import { auth } from "@/lib/auth";
import selectUserFromEmail from "@/lib/auth/selectUserFromEmail";
import sql from "@/lib/db";

async function upsertBetterAuthUser(inputs: {
  email: string;
  authId: string;
}): Promise<Result<{ id: string }>> {
  try {
    const upsertedUser = (
      await sql<{ id: string }[]>`
      INSERT INTO users
        (email, auth_provider, auth_id, created_at)
      VALUES
        (${inputs.email}, 'better-auth', ${inputs.authId}, NOW())
      ON CONFLICT (email) DO UPDATE SET
        auth_provider = EXCLUDED.auth_provider,
        auth_id = EXCLUDED.auth_id
      RETURNING
        id::text;`
    ).at(0);

    if (!upsertedUser) {
      return { success: false, error: "upsert_user_failed" };
    }

    return { success: true, data: upsertedUser };
  } catch {
    return { success: false, error: "upsert_user_failed" };
  }
}

export default async function signInWithOTP(inputs: {
  email: string;
  otp: string;
}): Promise<Result<null>> {
  const trace = new Trace(`signInWithOTP`);
  try {
    const parsedInputs = z
      .object({
        email: z.email().max(254).toLowerCase(),
        otp: z.string(),
      })
      .safeParse(inputs);

    if (!parsedInputs.success) {
      trace.push([toObfuscatedUser(inputs), parsedInputs.error.message]);
      trace.log(400);
      return { success: false, error: "bad_request" };
    }

    trace.push(obfuscateEmail(parsedInputs.data.email));
    const existingUser = await selectUserFromEmail({
      email: parsedInputs.data.email,
    });
    trace.push(
      JSON.stringify({
        user: existingUser ? toObfuscatedUser(existingUser) : "not_found",
      }),
    );

    const session = await auth.api.signInEmailOTP({
      body: {
        email: parsedInputs.data.email,
        otp: parsedInputs.data.otp,
      },
      headers: await headers(),
    });

    const isLinkedToBetterAuth =
      existingUser?.authProvider === "better-auth" &&
      existingUser.authId === session.user.id;

    if (!isLinkedToBetterAuth) {
      const upsertedUser = await upsertBetterAuthUser({
        email: parsedInputs.data.email,
        authId: session.user.id,
      });

      if (!upsertedUser.success) {
        await sql`DELETE FROM auth_sessions WHERE token = ${session.token};`;
        trace.push([upsertedUser.error, "session revoked"]);
        trace.log(500);
        return { success: false, error: "upsert_user_failed" };
      }
    }

    trace.log();
  } catch (error) {
    trace.pushError(error);

    if (isBetterAuthError(error)) {
      const qualifiedErrors: AuthErrorKeys[] = [
        "INVALID_OTP",
        "OTP_EXPIRED",
        "TOO_MANY_ATTEMPTS",
      ];
      const errorKey =
        qualifiedErrors.find((errorKey) => error?.body?.code === errorKey) ??
        "UNKNOWN_AUTH_ERROR";
      trace.log(error.statusCode);
      return { success: false, error: errorKey };
    }

    trace.log(500);

    return { success: false, error: `server_error` };
  }

  redirect("/");
}
