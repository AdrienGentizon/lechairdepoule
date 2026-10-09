"use server";

import z from "zod";

import { toObfuscatedUser } from "@cdp/lib/trace";

import { auth } from "@/lib/auth";
import { obfuscateEmail } from "@/lib/string";
import Trace from "@/lib/trace";
import { Result } from "@/lib/types";

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
    await auth.api.sendVerificationOTP({
      body: {
        email: parsedInputs.data.email,
        type: "sign-in",
      },
    });

    trace.log();
    return { success: true, data: null };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);

    return { success: false, error: `server_error` };
  }
}
