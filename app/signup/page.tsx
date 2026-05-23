"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RouteShell } from "@/components/landing/route-shell";
import getSupabaseClient from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) {
        setError(signUpError.message || "Sign up failed");
        setLoading(false);
        return;
      }

      const session = data?.session ?? null;

      if (session) {
        router.replace("/");
        return;
      }

      router.replace(
        `/login?message=${encodeURIComponent("Account created. Please sign in with your credentials.")}`,
      );
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? (err as any).message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <RouteShell
      eyebrow="Account"
      title="Create an account"
      description="Get started as a creator or client — set up your profile and services."
      primaryLabel="Explore"
      primaryHref="/professionals"
      secondaryLabel="Back"
      secondaryHref="/"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="max-w-md space-y-4">
          <label htmlFor="full_name" className="block text-sm text-white/70">
            Full name
          </label>
          <input
            id="full_name"
            title="full name"
            placeholder="Jordan Lee"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-white/12 bg-white/4 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-300/50"
          />

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
            placeholder="Choose a secure password"
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
              {loading ? "Creating..." : "Create account"}
            </button>

            <a href="/login" className="text-sm text-white/70 hover:text-white">
              Have an account?
            </a>
          </div>
        </div>
      </form>
    </RouteShell>
  );
}
