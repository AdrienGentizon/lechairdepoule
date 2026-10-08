"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

import { auth } from "@/lib/auth";
import selectUserFromEmail from "@/lib/selectUserFromEmail";
import { obfuscateEmail } from "@/lib/string";
import Trace from "@/lib/trace";
import { ErrorKeys, Result } from "@/lib/types";

const AUTH_ERROR_KEYS: Record<string, ErrorKeys> = {
  INVALID_OTP: "invalid_otp",
  OTP_EXPIRED: "expired_otp",
  TOO_MANY_ATTEMPTS: "expired_otp",
};

function toAuthErrorKey(error: unknown) {
  if (!isAPIError(error)) return undefined;

  return AUTH_ERROR_KEYS[error.body?.code ?? ""];
}

export default async function signInWithOTP(inputs: {
  email: string;
  otp: string;
}): Promise<Result<void>> {
  const trace = new Trace(`signInWithOTP`);
  try {
    const parsedInputs = z
      .object({
        email: z.email().max(254).toLowerCase(),
        otp: z.string().max(6),
      })
      .safeParse(inputs);

    if (!parsedInputs.success) {
      trace.push([JSON.stringify(inputs), parsedInputs.error.message]);
      return { success: false, error: "bad_request" };
    }

    trace.push(obfuscateEmail(parsedInputs.data.email));
    const user = await selectUserFromEmail({ email: parsedInputs.data.email });
    trace.push(JSON.stringify({ user: user ?? "not_found" }));

    if (user?.role !== "admin") {
      trace.log(401);
      return { success: false, error: "unauthorized" };
    }

    await auth.api.signInEmailOTP({
      body: {
        email: parsedInputs.data.email,
        otp: parsedInputs.data.otp,
      },
      headers: await headers(),
    });
    trace.log();
  } catch (error) {
    trace.pushError(error);

    const otpErrorKey = toAuthErrorKey(error);
    if (otpErrorKey) {
      trace.log(400);
      return { success: false, error: otpErrorKey };
    }

    trace.log(500);

    return { success: false, error: `server_error` };
  }

  redirect("/");
}
