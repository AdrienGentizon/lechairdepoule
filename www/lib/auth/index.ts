import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { PostgresJSDialect } from "kysely-postgres-js";

import OTPEmail from "@/components/Email/OTPEmail";
import sql from "@/lib/db";
import sendEmail from "@/lib/mailing/sendEmail";
import { obfuscateEmail } from "@/lib/string";
import Trace from "@/lib/trace";

const OTP_EXPIRES_IN_SECONDS = 5 * 60;
const SESSION_EXPIRES_IN_SECONDS = 28 * 24 * 60 * 60;

async function sendSignInOTP({ email, otp }: { email: string; otp: string }) {
  const trace = new Trace(`sendSignInOTP`);
  trace.push(obfuscateEmail(email));
  if (process.env.NODE_ENV === "development") trace.push(`[${otp}]`);

  const { error } = await sendEmail({
    to: email,
    subject: `Code de validation ${otp}`,
    react: OTPEmail({
      otp,
      expiresInMinutes: OTP_EXPIRES_IN_SECONDS / 60,
    }),
  });
  if (error && error.name !== "disabled") {
    trace.push(error.message);
    trace.log(500);
    throw new Error(`${error.name} ${error.message}`);
  }

  trace.log();
}

export const auth = betterAuth({
  user: { modelName: "auth_users" },
  session: {
    modelName: "auth_sessions",
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
  },
  account: { modelName: "auth_accounts" },
  verification: { modelName: "auth_verifications" },
  database: {
    dialect: new PostgresJSDialect({ postgres: sql }),
    type: "postgres",
  },
  plugins: [
    emailOTP({
      expiresIn: OTP_EXPIRES_IN_SECONDS,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") {
          throw new Error(`unsupported otp type: ${type}`);
        }
        await sendSignInOTP({ email, otp });
      },
    }),
    nextCookies(),
  ],
});
