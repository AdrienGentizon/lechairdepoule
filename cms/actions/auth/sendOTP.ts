"use server";

import z from "zod";

import { auth } from "@/lib/auth";
import { Result } from "@/lib/types";

export default async function sendOTP(inputs: {
  email: string;
}): Promise<Result<{ success: boolean }>> {
  try {
    const parsedInputs = z
      .object({ email: z.email().max(254) })
      .safeParse(inputs);

    if (!parsedInputs.success) throw new Error(`invalid request`);

    const data = await auth.api.sendVerificationOTP({
      body: {
        email: parsedInputs.data.email,
        type: "sign-in",
      },
    });

    if (!data.success)
      throw new Error(`cannot send otp to ${parsedInputs.data.email}`);

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: `cannot send otp` };
  }
}
