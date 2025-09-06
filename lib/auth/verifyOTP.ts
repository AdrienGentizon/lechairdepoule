"use server";

import { cookies } from "next/headers";
import sql from "../db";
import getUserFromEmail from "./getUserFromEmail";
import crypto from "crypto";
import { createToken } from "./jwt";

export async function verifyOTP({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<
  | { success: false; error: string }
  | {
      success: true;
      data: {
        user: {
          id: string;
          email: string;
          pseudo: string;
        };
      };
    }
> {
  const user = await getUserFromEmail(email);
  if (!user) {
    return {
      success: false,
      error: `Email introuvable`,
    };
  }
  const token = (
    await sql<
      {
        id: number;
        value: string;
        expires: Date;
      }[]
    >`SELECT id, value::text, expires
  FROM connection_tokens
  WHERE user_id = ${user.id}
  AND expires > CURRENT_TIMESTAMP LIMIT 1`
  ).at(0);

  if (!token) {
    return {
      success: false,
      error: `Numéro de vérification non valide`,
    };
  }

  const hash = crypto.createHash("sha256");
  hash.update(otp);
  const hashedCode = hash.digest("hex");

  if (hashedCode !== token.value) {
    return {
      success: false,
      error: `Numéro de vérification non valide`,
    };
  }

  await sql`DELETE FROM connection_tokens WHERE id = ${token.id}`;
  await sql`UPDATE users SET last_connection = CURRENT_TIMESTAMP WHERE id = ${user.id}`;

  const jwt = await createToken(user.id, user.email);
  (await cookies()).set("token", jwt, {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return {
    success: true,
    data: { user },
  };
}
