import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    return createClient(url, key);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to create Supabase client", err);
    return null;
  }
}

export default getSupabaseClient;
