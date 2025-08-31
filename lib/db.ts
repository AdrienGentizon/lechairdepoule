import env from "@/lib/env";
import postgres from "postgres";

const sql = postgres(env().SUPABASE_URL, { ssl: "require" });

export default sql;
