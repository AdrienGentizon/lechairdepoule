import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";

import env from "./env";
import { getLogger } from "./logger";
import { obfuscateEmail } from "./string";

export const auth = betterAuth({
  trustedOrigins: [env().BETTER_AUTH_URL],
  database: new Pool({
    host: env().PG_HOST,
    port: env().PG_PORT,
    database: env().PG_DATABASE,
    user: env().PG_USER,
    password: env().PG_PASSWORD,
    ssl: env().PG_HOST === "localhost" ? false : true,
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const logger = getLogger("sendVerificationOTP");
        if (type === "sign-in") {
          logger.append({
            email: obfuscateEmail(email),
            otp,
          });
          logger.flush();
          return;
        }
        logger.withError(`${type} not implemented yet`).flush();
      },
    }),
  ],
});
