"use client";

import { useEffect, useState } from "react";
import getSupabaseClient from "@/lib/supabaseClient";

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    account_type?: "customer" | "professional";
    service_categories?: string[];
  };
} | null;

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(() => Boolean(getSupabaseClient()));

  function clearSupabaseSessionStorage() {
    if (typeof window === "undefined") return;

    const storages = [window.localStorage, window.sessionStorage];
    for (const storage of storages) {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
          storage.removeItem(key);
        }
      }
    }
  }

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const init = async () => {
      try {
        const res = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(res.data.session?.user ?? null);
      } catch (err) {
        // Ensure we don't leave the UI stuck if the auth call fails.
        // Log for diagnostics and clear any partial state.
        // eslint-disable-next-line no-console
        console.error("supabase.getSession error", err);
        const message = err instanceof Error ? err.message : String(err ?? "");
        if (message.toLowerCase().includes("invalid compact jws")) {
          try {
            clearSupabaseSessionStorage();
            await supabase.auth.signOut({ scope: "local" });
          } catch {
            // If signOut also fails, the session is still unusable.
          }
        }
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      try {
        subscription?.subscription?.unsubscribe();
      } catch {
        // ignore if unsubscribe fails
      }
    };
  }, []);

  return { user, loading };
}
