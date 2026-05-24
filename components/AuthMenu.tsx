"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import getSupabaseClient from "@/lib/supabaseClient";
import { useAuthUser } from "@/components/auth/useAuthUser";

export default function AuthMenu() {
  const { user, loading } = useAuthUser();
  const [open, setOpen] = useState(false);

  const displayName = useMemo(
    () => user?.user_metadata?.full_name || user?.email || "Account",
    [user],
  );

  async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setOpen(false);
  }

  if (loading) {
    return <div className="h-11 w-28 rounded-md bg-white/6" />;
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-full border border-white/12 bg-white/6 px-4 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center rounded-full border border-white/12 bg-white/6 px-4 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
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
        className="flex min-h-11 items-center gap-3 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-left backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
      >
        <Image
          src={user?.user_metadata?.avatar_url || "/favicon.ico"}
          alt={displayName}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full border border-white/12 object-cover"
        />
        <span className="hidden max-w-28 truncate text-sm font-medium text-white/90 sm:block">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 text-white/60" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 max-h-[calc(100vh-5rem)] w-[min(16rem,calc(100vw-1rem))] overflow-auto rounded-3xl border border-white/12 bg-[#090909]/95 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/6 hover:text-white"
          >
            <UserCircle2 className="h-4 w-4 text-cyan-300" />
            Profile
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/6 hover:text-white"
          >
            <LogOut className="h-4 w-4 text-cyan-300" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
