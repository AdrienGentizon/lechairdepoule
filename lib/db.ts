import env from "@/lib/env";
import postgres from "postgres";

const sql = postgres(
  `postgresql://${env().POSTGRES_USER}:${env().POSTGRES_PASSWORD}@${env().POSTGRES_HOST}/${env().POSTGRES_DATABASE}?sslmode=require`,
  { ssl: "require" },
);

export default sql;
