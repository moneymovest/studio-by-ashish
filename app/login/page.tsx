"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RouteShell } from "@/components/landing/route-shell";
import getSupabaseClient from "@/lib/supabaseClient";

type LoginPageProps = {
  searchParams?: { message?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        const message = signInError.message || "Sign in failed";
        if (message.toLowerCase().includes("invalid login credentials")) {
          setError(
            "Invalid credentials or unverified email. If you recently signed up, check your inbox for the confirmation link first.",
          );
        } else {
          setError(message);
        }
        setLoading(false);
        return;
      }

      router.replace("/profile");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as any).message
          : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <RouteShell
      eyebrow="Account"
      title="Sign in"
      description="Sign in to manage your profile, bookings, and messages."
      primaryLabel="Explore"
      primaryHref="/professionals"
      secondaryLabel="Back"
      secondaryHref="/"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="max-w-md space-y-4">
          {searchParams?.message && (
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
              {searchParams.message}
            </div>
          )}

          <label htmlFor="email" className="block text-sm text-white/70">
            Email
          </label>
          <input
            id="email"
            title="email"
            placeholder="you@studio.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-white/12 bg-white/4 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-300/50"
          />

          <label htmlFor="password" className="block text-sm text-white/70">
            Password
          </label>
          <input
            id="password"
            title="password"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-white/12 bg-white/4 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-300/50"
          />

          {error && <div className="text-sm text-rose-400">{error}</div>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#38bdf8,#7c3aed)] px-6 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(56,189,248,0.18)] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <a
              href="/signup"
              className="text-sm text-white/70 hover:text-white"
            >
              Create account
            </a>
          </div>
        </div>
      </form>
    </RouteShell>
  );
}
