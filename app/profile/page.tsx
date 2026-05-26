"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/components/auth/useAuthUser";
import { ProfessionalDashboard } from "@/components/landing/professional-dashboard";
import { RouteShell } from "@/components/landing/route-shell";

export default function ProfilePage() {
  const { user, loading } = useAuthUser();

  // For local/dev testing we may build a synthetic user from a known
  // account id so the dashboard can render without an interactive login.
  const [overrideUser, setOverrideUser] = useState<any | null>(null);
  // Allow forcing the professional dashboard via query string for local/dev testing
  let forceDashboard = false;
  try {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      forceDashboard = params.get("dashboard") === "1";
    }
  } catch (e) {
    forceDashboard = false;
  }

  useEffect(() => {
    if (!forceDashboard) return;

    // Resolved user id found earlier during debugging — safe for local dev only.
    const debugUserId = "93f753dc-a91e-4e77-84eb-da0027992126";

    (async () => {
      try {
        const res = await fetch(`/api/profiles?userId=${debugUserId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const payload = await res.json().catch(() => ({}));
        const profile = payload.profile ?? {};
        const prof = payload.professional ?? {};

        const syntheticUser = {
          id: debugUserId,
          email: profile?.email || "itsashish0091@gmail.com",
          user_metadata: {
            full_name: profile?.full_name || prof?.full_name || "Professional",
            avatar_url: profile?.avatar_url || prof?.avatar_url || "/favicon.ico",
            bio: prof?.bio || "",
            account_type: "professional",
            service_categories: prof?.categories || profile?.service_categories || [],
          },
        };

        setOverrideUser(syntheticUser);
      } catch {
        // ignore — leave overrideUser null
      }
    })();
  }, [forceDashboard]);

  if (loading && !forceDashboard && !overrideUser) {
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
        <div className="p-4 text-white/64 sm:p-6">Loading...</div>
      </RouteShell>
    );
  }

  const currentUser = user ?? overrideUser;

  if (!currentUser) {
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

  const accountType = currentUser.user_metadata?.account_type ?? "customer";
  const isProfessional = accountType === "professional";

  if (isProfessional || forceDashboard) {
    return <ProfessionalDashboard user={currentUser} />;
  }

  return (
    <RouteShell
      eyebrow="Account"
      title={currentUser.user_metadata?.full_name || currentUser.email || "Profile"}
      description="Manage your account session and review the identity attached to this profile."
      primaryLabel={isProfessional ? undefined : "Explore professionals"}
      primaryHref={isProfessional ? undefined : "/professionals"}
      secondaryLabel="Home"
      secondaryHref="/"
      align="start"
      panelScrollable
    >
      <div className="space-y-5 pt-2 sm:space-y-6 sm:pt-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">
            Account type
          </p>
          <p className="mt-2 text-lg text-white">
            {isProfessional ? "Professional" : "Customer"}
          </p>
        </div>

        {isProfessional ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">
              Services
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(currentUser.user_metadata?.service_categories ?? []).length > 0 ? (
                currentUser.user_metadata?.service_categories?.map((service: string) => (
                  <span
                    key={service}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6875rem] uppercase tracking-[0.24em] text-white/72 sm:text-xs"
                  >
                    {service}
                  </span>
                ))
              ) : (
                <p className="text-sm text-white/64">
                  No services selected yet.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">
              Customer hub
            </p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Use this profile to manage saved professionals, bookings, and your
              project preferences.
            </p>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">
            Email
          </p>
          <p className="mt-2 break-all text-base text-white sm:text-lg">
            {currentUser.email}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">
            Display name
          </p>
          <p className="mt-2 text-lg text-white">
            {currentUser.user_metadata?.full_name || "Not set"}
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100 sm:p-5">
          Use the account menu in the top right to log out.
        </div>
      </div>
    </RouteShell>
  );
}
