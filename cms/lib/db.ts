import postgres from "postgres";

import env from "@/lib/env";

const sql = postgres(env().PG_CONNECTION_STRING, { ssl: "require" });

export default sql;
