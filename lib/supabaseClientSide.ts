import { createBrowserClient } from "@supabase/ssr";

function getClient() {
  if (
    !process.env["NEXT_PUBLIC_SUPABASE_URL"] ||
    !process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  )
    throw new Error(
      "[Error] Env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required",
    );

  return createBrowserClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"],
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  );
}

export const supabaseClientSide = getClient();
