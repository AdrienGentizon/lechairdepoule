import postgres from "postgres";

import env from "@/lib/env";

const sql = postgres(
  `postgresql://${env().PGUSER}:${env().PGPASSWORD}@${env().PGHOST}/${env().PGDATABASE}?sslmode=require&channel_binding=require`,
  { ssl: "require" }
);

export default sql;
