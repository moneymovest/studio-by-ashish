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
      const res = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(res.data.session?.user ?? null);
      setLoading(false);
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
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
