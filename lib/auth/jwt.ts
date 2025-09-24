"use server";

import * as jose from "jose";
import env from "../env";

export async function verifyToken(jwt?: string): Promise<{
  id: string | null;
  email: string | null;
}> {
  if (!jwt) {
    return {
      id: null,
      email: null,
    };
  }
  const secret = new TextEncoder().encode(env().JWT_SIGN_KEY);
  const { payload, protectedHeader } = await jose.jwtVerify(jwt, secret);

  if (protectedHeader && payload && payload.id && payload.email) {
    return {
      id: payload.id as string,
      email: payload.email as string,
    };
  }
  return {
    id: null,
    email: null,
  };
}

export async function createToken(id: string, email: string) {
  const secret = new TextEncoder().encode(env().JWT_SIGN_KEY);
  const alg = "HS256";

  const jwt = await new jose.SignJWT({ id, email })
    .setProtectedHeader({ alg })
    .setIssuedAt(new Date().getTime())
    .setExpirationTime(new Date().getTime() + 4 * 7 * 24 * 60 * 60 * 1000)
    .sign(secret);

  return jwt;
}
