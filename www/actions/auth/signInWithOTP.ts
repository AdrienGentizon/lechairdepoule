"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import z from "zod";

import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";
import obfuscateEmail from "@/lib/obfuscateEmail";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP: "code invalide",
  OTP_EXPIRED: "code expiré",
  TOO_MANY_ATTEMPTS: "code expiré, trop de tentatives",
};

function toAuthErrorMessage(error: unknown) {
  if (!isAPIError(error)) return undefined;

  return AUTH_ERROR_MESSAGES[error.body?.code ?? ""];
}

export default async function signInWithOTP(inputs: {
  email: string;
  otp: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const logger = getLogger("signInWithOTP", "Action");
  try {
    const parsedInputs = z
      .object({
        email: z.email().max(254),
        otp: z.string().max(6),
      })
      .safeParse(inputs);

    if (!parsedInputs.success) {
      logger.withError(parsedInputs.error).flush();
      return { success: false, error: "requête invalide" };
    }

    logger.append(obfuscateEmail(parsedInputs.data.email));

    await auth.api.signInEmailOTP({
      body: {
        email: parsedInputs.data.email,
        otp: parsedInputs.data.otp,
      },
      headers: await headers(),
    });

    logger.flush();
    return { success: true };
  } catch (error) {
    logger.withError(error).flush();
    return {
      success: false,
      error: toAuthErrorMessage(error) ?? "erreur serveur",
    };
  }
}
