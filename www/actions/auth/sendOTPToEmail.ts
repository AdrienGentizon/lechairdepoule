"use server";

import z from "zod";

import { toObfuscatedUser } from "@cdp/lib/trace";
import { Result } from "@cdp/lib/types";
import OTPEmail from "@cdp/ui/emails/OTPEmail";

import { OTP_EXPIRES_IN_SECONDS, auth } from "@/lib/auth";
import sendEmail from "@/lib/mailing/sendEmail";
import { obfuscateEmail } from "@/lib/string";
import Trace from "@/lib/trace";

export default async function sendOTPToEmail(inputs: {
  email: string;
}): Promise<Result<null>> {
  const trace = new Trace(`sendOTPToEmail`);
  try {
    const parsedInputs = z
      .object({ email: z.email().max(254).toLowerCase() })
      .safeParse(inputs);

    if (!parsedInputs.success) {
      trace.push([toObfuscatedUser(inputs), parsedInputs.error.message]);
      trace.log(400);
      return { success: false, error: "bad_request" };
    }

    trace.push(obfuscateEmail(parsedInputs.data.email));
    const otp = await auth.api.createVerificationOTP({
      body: {
        email: parsedInputs.data.email,
        type: "sign-in",
      },
    });

    if (
      process.env.MAILING_SERVICE_STATUS === "disabled" &&
      process.env.NODE_ENV === "development"
    ) {
      trace.push(["mailing disabled", `[${otp}]`]);
      trace.log();
      return { success: true, data: null };
    }

    const { error } = await sendEmail({
      to: parsedInputs.data.email,
      subject: `Code de validation ${otp}`,
      react: OTPEmail({
        appName: "forum",
        otp,
        expiresInMinutes: OTP_EXPIRES_IN_SECONDS / 60,
      }),
    });

    if (error) {
      trace.push(`${error.name} ${error.message}`);
      trace.log(500);
      return { success: false, error: "email_not_sent" };
    }

    trace.log();
    return { success: true, data: null };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);

    return { success: false, error: `server_error` };
  }
}
