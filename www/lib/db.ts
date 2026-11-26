import postgres from "postgres";

import env from "@/lib/env";

const sql = postgres(env().PG_CONNECTION_STRING, {
  transform: postgres.camel,
});

export default sql;
