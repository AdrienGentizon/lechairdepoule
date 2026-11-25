import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { PostgresJSDialect } from "kysely-postgres-js";

import sql from "../db";

export const OTP_EXPIRES_IN_SECONDS = 5 * 60;
const SESSION_EXPIRES_IN_SECONDS = 28 * 24 * 60 * 60;

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
      async sendVerificationOTP() {
        throw new Error(
          `not implemented, use actions/auth/sendOTPToEmail instead`,
        );
      },
    }),
    nextCookies(),
  ],
});
