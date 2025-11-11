"use server";

import { z } from "zod";
import crypto from "crypto";
import sql from "../db";
import selectUserFromEmail from "./selectUserFromEmail";
import insertUser from "./insertUser";
import resend from "../resend";
import OTPEmail from "@/components/OTPEmail/OTPEmail";

function generateSixDigits(): string {
  const buf = crypto.randomBytes(3);
  const num = (buf.readUIntBE(0, 3) % 900000) + 100000;
  return num.toString();
}

export async function signInWithEmail(formData: FormData): Promise<
  | {
      success: false;
      errors: { email?: string; pseudo?: string; server?: string };
    }
  | {
      success: true;
      data: { email: string };
    }
> {
  console.log(`[Operation]`, "signInWithEmail");
  try {
    const parsedInputs = z
      .object({
        email: z.string().email(),
      })
      .safeParse(Object.fromEntries(formData.entries()));

    if (!parsedInputs.success) {
      return {
        success: false,
        errors: {
          email: parsedInputs.error.formErrors.fieldErrors.email?.at(0),
        },
      };
    }

    let user = await selectUserFromEmail(parsedInputs.data.email);
    if (!user) {
      user = await insertUser({
        email: parsedInputs.data.email,
      });
      console.log(
        `[Operation]`,
        "signInWithEmail",
        "user inserted",
        user?.email,
      );
      if (!user) {
        throw new Error("Cannot insert user");
      }
    }

    const randomCode = generateSixDigits();
    const hash = crypto.createHash("sha256");
    hash.update(randomCode);

    try {
      await sql`DELETE FROM connection_tokens WHERE user_id = ${user.id}`;
    } catch (e) {
      console.error(
        `[Error]`,
        `loginWithEmail`,
        `Error while deleting old tokens: ${(e as Error)?.message ?? "unknown error"}`,
      );
      throw new Error("Unauthorized");
    }

    try {
      const hashedCode = hash.digest("hex");
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await sql`INSERT INTO connection_tokens(value, expires_at, user_id) VALUES (${hashedCode}, ${expiresAt.toUTCString()}, ${
        user.id
      })`;
      console.log(
        `[Operation]`,
        "signInWithEmail",
        "connection token created for",
        user.email,
      );
    } catch (e) {
      console.error(
        `[Error]`,
        `loginWithEmail`,
        `Error while inserting new token: ${(e as Error)?.message ?? "unknown error"}`,
      );
      throw new Error("Unauthorized");
    }

    console.log(
      `[Operation]`,
      `signInWithEmail`,
      `${parsedInputs.data.email} ${randomCode}`,
    );

    if (process.env.NODE_ENV === "production") {
      const { error } = await resend.emails.send({
        from: "Le Chair de Poule <noreply@lechairdepoule.fr>",
        to: parsedInputs.data.email,
        subject: "[Le Chair de poule] Confirmation de votre email",
        react: OTPEmail({
          subject: "Code de verification",
          message: `Vous devez entrer ce code de confirmation ${randomCode}`,
        }),
      });
      if (error) throw new Error(`${error.name} ${error.message}`);
    }

    return {
      success: true,
      data: { email: user.email },
    };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? error;
    console.error(`[Error]`, `signInWithEmail`, errorMessage);

    return {
      success: false,
      errors: {
        server: errorMessage,
      },
    };
  }
}
