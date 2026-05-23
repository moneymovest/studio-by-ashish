"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RouteShell } from "@/components/landing/route-shell";
import getSupabaseClient from "@/lib/supabaseClient";
import { useAuthUser } from "@/components/auth/useAuthUser";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <RouteShell
          eyebrow="Account"
          title="Create an account"
          description="Loading signup options."
          primaryLabel="Explore"
          primaryHref="/professionals"
          secondaryLabel="Back"
          secondaryHref="/"
        >
          <div className="p-6 text-white/64">Loading signup form...</div>
        </RouteShell>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"customer" | "professional">(
    "customer",
  );
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const professionalServices = ["Photographer", "Videographer", "Editor"];

  useEffect(() => {
    const requestedAccountType = searchParams.get("accountType");
    if (
      requestedAccountType === "professional" ||
      requestedAccountType === "customer"
    ) {
      setAccountType(requestedAccountType);
      if (requestedAccountType === "customer") {
        setServiceCategories([]);
      }
    }
  }, [searchParams]);

  function toggleServiceCategory(category: string) {
    setServiceCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  if (authLoading) {
    return (
      <RouteShell
        eyebrow="Account"
        title="Create an account"
        description="Loading account state."
        primaryLabel="Explore"
        primaryHref="/professionals"
        secondaryLabel="Back"
        secondaryHref="/"
      >
        <div className="p-6 text-white/64">Checking sign-in status...</div>
      </RouteShell>
    );
  }

  if (user) {
    return (
      <RouteShell
        eyebrow="Account"
        title="You are already signed in"
        description="Open your profile or use the account menu to log out before creating another account."
        primaryLabel="Open profile"
        primaryHref="/profile"
        secondaryLabel="Explore"
        secondaryHref="/professionals"
      >
        <div className="space-y-3 p-6 text-white/72">
          <p>You do not need to create another account while signed in.</p>
          <p>Use the top-right account menu to log out first.</p>
        </div>
      </RouteShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (accountType === "professional" && serviceCategories.length === 0) {
      setError(
        "Please select at least one service category so customers know what they can book.",
      );
      setLoading(false);
      return;
    }

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
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: name,
            account_type: accountType,
            service_categories:
              accountType === "professional" ? serviceCategories : [],
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Sign up failed");
        setLoading(false);
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        const profileResponse = await fetch("/api/profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            fullName: name,
          }),
        });

        if (!profileResponse.ok) {
          const payload = (await profileResponse.json().catch(() => ({}))) as {
            error?: string;
          };
          setError(
            payload.error || "Account created, but profile creation failed.",
          );
          setLoading(false);
          return;
        }
      }

      const session = data?.session ?? null;

      if (session) {
        router.replace("/profile");
        return;
      }

      const nextPath = `/verify-email?email=${encodeURIComponent(email)}`;

      router.replace(nextPath);
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
      title="Create an account"
      description="Choose whether you are signing up as a customer or a professional. Professionals can pick one or more services to book from their profile."
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
            placeholder="Your full name"
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

          <label htmlFor="account_type" className="block text-sm text-white/70">
            I’m signing up as
          </label>
          <select
            id="account_type"
            title="account type"
            value={accountType}
            onChange={(e) => {
              const nextType = e.target.value as "customer" | "professional";
              setAccountType(nextType);
              if (nextType === "customer") {
                setServiceCategories([]);
              }
            }}
            className="w-full rounded-lg border border-white/12 bg-white/4 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            <option value="customer">Customer</option>
            <option value="professional">Professional</option>
          </select>

          {accountType === "professional" && (
            <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
              <p className="text-sm text-white/70">
                Which services do you offer? Select one or more.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {professionalServices.map((service) => {
                  const checked = serviceCategories.includes(service);

                  return (
                    <label
                      key={service}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#090909]/70 px-4 py-3 text-sm text-white/80 transition hover:border-cyan-300/30"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleServiceCategory(service)}
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-300 focus:ring-cyan-300/50"
                      />
                      <span>{service}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-6 text-white/45">
                Customers will book the services you select here.
              </p>
            </div>
          )}

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
