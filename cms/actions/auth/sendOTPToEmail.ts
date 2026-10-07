"use server";

import z from "zod";

import { auth } from "@/lib/auth";
import selectUserFromEmail from "@/lib/selectUserFromEmail";
import { obfuscateEmail } from "@/lib/string";
import Trace from "@/lib/trace";
import { Result } from "@/lib/types";

export default async function sendOTPToEmail(inputs: {
  email: string;
}): Promise<Result<{ success: boolean }>> {
  const trace = new Trace(`sendOTPToEmail`);
  try {
    const parsedInputs = z
      .object({ email: z.email().max(254) })
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

    const data = await auth.api.sendVerificationOTP({
      body: {
        email: parsedInputs.data.email,
        type: "sign-in",
      },
    });

    if (!data.success) throw new Error(`cannot send otp`);

    trace.log();
    return { success: true, data };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);

    return { success: false, error: `server_error` };
  }
}
