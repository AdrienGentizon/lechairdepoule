"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

import { auth } from "@/lib/auth";
import { Result } from "@/lib/types";

export default async function signInWithOTP(inputs: {
  email: string;
  otp: string;
}): Promise<Result<{ createdAt: Date }>> {
  try {
    const parsedInputs = z
      .object({
        email: z.email().max(254),
        otp: z.string().max(6),
      })
      .safeParse(inputs);

    if (!parsedInputs.success) throw new Error(`invalid request`);

    await auth.api.signInEmailOTP({
      body: {
        email: parsedInputs.data.email,
        otp: parsedInputs.data.otp,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: `cannot sign in` };
  }

  redirect("/");
}
