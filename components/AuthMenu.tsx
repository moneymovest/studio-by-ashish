"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import getSupabaseClient from "@/lib/supabaseClient";

export default function AuthMenu() {
  type User = {
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | null;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>(null);
  const [open, setOpen] = useState(false);

  const displayName = useMemo(
    () => user?.user_metadata?.full_name || user?.email || "Account",
    [user],
  );

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

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setUser((session as any)?.user ?? null);
        setLoading(false);
      });

      // ensure we unsubscribe when unmounting
      return () => {
        mounted = false;
        try {
          sub?.subscription?.unsubscribe?.();
        } catch {}
      };
    }

    const cleanupPromise = init();
    // cleanup when unmounting
    return () => {
      mounted = false;
      // if init returns a cleanup, call it when ready
      Promise.resolve(cleanupPromise).then((fn: any) => fn && fn());
    };
  }, []);

  async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
  }

  if (loading) {
    return <div className="h-10 w-24 rounded-md bg-white/6" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="text-sm text-white/80 hover:text-white">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="hidden sm:inline-flex h-9 items-center rounded-full border border-white/12 bg-white/6 px-3 text-sm font-medium text-white/90"
        >
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-left backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
      >
        <img
          src={
            user?.user_metadata?.avatar_url || user?.avatar_url || "/favicon.ico"
          }
          alt={displayName}
          className="h-8 w-8 rounded-full border border-white/12 object-cover"
        />
        <span className="hidden max-w-28 truncate text-sm font-medium text-white/90 sm:block">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 text-white/60" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-56 rounded-3xl border border-white/12 bg-[#090909]/95 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/6 hover:text-white"
          >
            <UserCircle2 className="h-4 w-4 text-cyan-300" />
            Profile
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/6 hover:text-white"
          >
            <LogOut className="h-4 w-4 text-cyan-300" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
