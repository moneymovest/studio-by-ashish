"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RouteShell } from "@/components/landing/route-shell";
import getSupabaseClient from "@/lib/supabaseClient";

export default function ProfilePage() {
  type User = { email?: string; user_metadata?: { full_name?: string } } | null;
  const [user, setUser] = useState<User>(null);
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

      const result = await supabase.auth.getSession();
      if (!mounted) return;
      setUser((result as any)?.data?.session?.user ?? null);
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <RouteShell
        eyebrow="Account"
        title="Profile"
        description="Loading account details..."
        primaryLabel="Home"
        primaryHref="/"
        secondaryLabel="Professionals"
        secondaryHref="/professionals"
      >
        <div className="p-6 text-white/64">Loading...</div>
      </RouteShell>
    );
  }

  if (!user) {
    return (
      <RouteShell
        eyebrow="Account"
        title="Sign in required"
        description="Log in to access your profile and settings."
        primaryLabel="Sign in"
        primaryHref="/login"
        secondaryLabel="Create account"
        secondaryHref="/signup"
      >
        <div className="p-6 text-white/64">You are not signed in.</div>
      </RouteShell>
    );
  }

  return (
    <RouteShell
      eyebrow="Account"
      title={user.user_metadata?.full_name || user.email || "Profile"}
      description="Manage your account session and review the identity attached to this profile."
      primaryLabel="Explore professionals"
      primaryHref="/professionals"
      secondaryLabel="Home"
      secondaryHref="/"
    >
      <div className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Email</p>
          <p className="mt-2 text-lg text-white">{user.email}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Display name</p>
          <p className="mt-2 text-lg text-white">
            {user.user_metadata?.full_name || "Not set"}
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm leading-6 text-cyan-100">
          Use the account menu in the top right to log out.
        </div>

        <Link href="/login" className="text-sm text-white/60 hover:text-white">
          Switch account
        </Link>
      </div>
    </RouteShell>
  );
}
