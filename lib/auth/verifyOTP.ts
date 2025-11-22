"use server";

import { cookies } from "next/headers";
import sql from "../db";
import selectUserFromEmail from "./selectUserFromEmail";
import crypto from "crypto";
import { createToken } from "./jwt";
import { User } from "../types";
import getUserPseudo from "./getUserPseudo";

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
        user: User;
      };
    }
> {
  console.log(`[Operation]`, "verifyOTP");
  const user = await selectUserFromEmail(email);
  if (!user) {
    console.error(`[Error]`, "verifyOTP", "email not found");

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
        expires_at: Date;
      }[]
    >`SELECT id, value::text, expires_at
      FROM connection_tokens
      WHERE user_id = ${user.id}
      AND expires_at > CURRENT_TIMESTAMP LIMIT 1`
  ).at(0);

  if (!token) {
    console.error(
      `[Error]`,
      "verifyOTP",
      "no connection token for",
      `user(${user.id})::${user.email}`,
    );

    return {
      success: false,
      error: `Numéro de vérification non valide`,
    };
  }

  const hash = crypto.createHash("sha256");
  hash.update(otp);
  const hashedCode = hash.digest("hex");

  if (hashedCode !== token.value) {
    console.error(
      `[Error]`,
      "verifyOTP",
      "invalid otp for",
      `user(${user.id})::${user.email}`,
    );

    return {
      success: false,
      error: `Numéro de vérification non valide`,
    };
  }

  await sql`UPDATE users SET last_connection = CURRENT_TIMESTAMP WHERE id = ${user.id}`;
  await sql`DELETE FROM connection_tokens WHERE id = ${token.id}`;

  const jwt = await createToken(user.id, user.email);
  (await cookies()).set("token", jwt, {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return {
    success: true,
    data: { user: { ...user, pseudo: getUserPseudo(user) } },
  };
}
