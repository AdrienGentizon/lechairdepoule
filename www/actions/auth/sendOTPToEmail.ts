"use server";

import z from "zod";

import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";
import obfuscateEmail from "@/lib/obfuscateEmail";

export default async function sendOTPToEmail(inputs: {
  email: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const logger = getLogger("sendOTPToEmail", "Action");
  try {
    const parsedInputs = z
      .object({ email: z.email().max(254) })
      .safeParse(inputs);

    if (!parsedInputs.success) {
      logger.withError(parsedInputs.error).flush();
      return { success: false, error: "email invalide" };
    }

    logger.append(obfuscateEmail(parsedInputs.data.email));

    const data = await auth.api.sendVerificationOTP({
      body: {
        email: parsedInputs.data.email,
        type: "sign-in",
      },
    });

    if (!data.success) throw new Error(`cannot send otp`);

    logger.flush();
    return { success: true };
  } catch (error) {
    logger.withError(error).flush();
    return { success: false, error: "erreur serveur" };
  }
}
