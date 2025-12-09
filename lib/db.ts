import postgres from "postgres";

import env from "@/lib/env";

const sql = postgres(
  `postgresql://${env().POSTGRES_USER}:${env().POSTGRES_PASSWORD}@${env().POSTGRES_HOST}/${env().POSTGRES_DATABASE}?sslmode=require&channel_binding=require`,
  { ssl: "require" }
);

export default sql;
