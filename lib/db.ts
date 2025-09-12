import env from "@/lib/env";
import postgres from "postgres";

const sql = postgres(env().SUPABASE_CONNECTION_STRING, { ssl: "require" });

export default sql;
