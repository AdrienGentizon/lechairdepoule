"use server";

import { isAPIError as isBetterAuthError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

import { obfuscateEmail } from "@cdp/lib/string";
import Trace, { toObfuscatedUser } from "@cdp/lib/trace";
import { AuthErrorKeys, Result } from "@cdp/lib/types";

import { auth } from "@/lib/auth";
import sql from "@/lib/db";
import selectUserFromEmail from "@/lib/selectUserFromEmail";

async function updateBetterAuthUser(inputs: {
  email: string;
  authId: string;
}): Promise<Result<{ id: string }>> {
  try {
    const updatedUser = (
      await sql<{ id: string }[]>`
      UPDATE users SET
        auth_provider = 'better-auth',
        auth_id = ${inputs.authId}
      WHERE
        email = ${inputs.email}
      RETURNING
        id::text;`
    ).at(0);

    if (!updatedUser) {
      return { success: false, error: "upsert_user_failed" };
    }

    return { success: true, data: updatedUser };
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

    if (existingUser?.role !== "admin") {
      trace.log(401);
      return { success: false, error: "unauthorized" };
    }

    const session = await auth.api.signInEmailOTP({
      body: {
        email: parsedInputs.data.email,
        otp: parsedInputs.data.otp,
      },
      headers: await headers(),
    });

    const isLinkedToBetterAuth =
      existingUser.authProvider === "better-auth" &&
      existingUser.authId === session.user.id;

    if (!isLinkedToBetterAuth) {
      const updatedUser = await updateBetterAuthUser({
        email: parsedInputs.data.email,
        authId: session.user.id,
      });

      if (!updatedUser.success) {
        await sql`DELETE FROM auth_sessions WHERE token = ${session.token};`;
        trace.push([updatedUser.error, "session revoked"]);
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
