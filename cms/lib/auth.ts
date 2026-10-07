import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { PostgresJSDialect } from "kysely-postgres-js";

import sql from "./db";

export const auth = betterAuth({
  user: { modelName: "auth_users" },
  session: { modelName: "auth_sessions" },
  account: { modelName: "auth_accounts" },
  verification: { modelName: "auth_verifications" },
  database: {
    dialect: new PostgresJSDialect({ postgres: sql }),
    type: "postgres",
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          if (process.env.NODE_ENV === "development") {
            return console.log(`[Auth] emailOTP signin ${email}:${otp}`);
          }
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
    }),
    nextCookies(),
  ],
});
