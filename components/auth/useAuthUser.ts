"use client";

import { useEffect, useState } from "react";
import getSupabaseClient from "@/lib/supabaseClient";

export type AuthUser = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
} | null;

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const supabase = getSupabaseClient();
      if (!mounted) return;
      if (!supabase) {
        setLoading(false);
        return;
      }

      const res = await supabase.auth.getSession();
      if (!mounted) return;
      setUser((res as any)?.data?.session?.user ?? null);
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return;
          setUser((session as any)?.user ?? null);
          setLoading(false);
        },
      );

      return () => {
        mounted = false;
        try {
          sub?.subscription?.unsubscribe?.();
        } catch {}
      };
    }

    const cleanupPromise = init();

    return () => {
      mounted = false;
      Promise.resolve(cleanupPromise).then((fn: any) => fn && fn());
    };
  }, []);

  return { user, loading };
}