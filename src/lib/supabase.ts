import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const supabase = {
  browser: createSupabaseBrowserClient,
  server: createSupabaseServerClient,
  serverAction: createSupabaseServerClient,
} as const;

