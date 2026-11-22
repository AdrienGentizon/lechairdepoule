import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { PostgresJSDialect } from "kysely-postgres-js";

import sql from "./db";
import resend from "./resend";

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
        if (type !== "sign-in") return;

        if (process.env.NODE_ENV === "development") {
          return console.log(`[Auth] emailOTP signin ${email}:${otp}`);
        }

        const { error } = await resend.emails.send({
          from: "Le Chair de Poule <noreply@lechairdepoule.fr>",
          to: email,
          subject: "Votre code de connexion",
          text: `Votre code de connexion au Chair de Poule : ${otp}`,
        });
        if (error) throw new Error(`${error.name} ${error.message}`);
      },
    }),
    nextCookies(),
  ],
});
