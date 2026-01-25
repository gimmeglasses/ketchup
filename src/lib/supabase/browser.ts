import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Environment variable NEXT_PUBLIC_SUPABASE_URL is not set. " +
        "Please define it before creating the Supabase browser client."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. " +
        "Please define it before creating the Supabase browser client."
    );
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
