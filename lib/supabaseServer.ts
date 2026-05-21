import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (err) {
    // Log and return null to avoid crashing during builds when env is misconfigured
    // (e.g., local dev without .env.local set).
    // Server actions should check for null and handle gracefully.
    // eslint-disable-next-line no-console
    console.error("Failed to create Supabase admin client", err);
    return null;
  }
}

export default getSupabaseAdmin;
