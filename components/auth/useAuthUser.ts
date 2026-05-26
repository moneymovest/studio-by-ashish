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
