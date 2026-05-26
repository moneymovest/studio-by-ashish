"use client";

import { useAuthUser } from "@/components/auth/useAuthUser";
import { ProfessionalDashboard } from "@/components/landing/professional-dashboard";
import { RouteShell } from "@/components/landing/route-shell";

export default function ProfilePage() {
  const { user, loading } = useAuthUser();

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
        <div className="p-4 text-white/64 sm:p-6">Loading...</div>
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

  const accountType = user.user_metadata?.account_type ?? "customer";
  const isProfessional = accountType === "professional";

  if (isProfessional) {
    return <ProfessionalDashboard user={user} />;
  }

  return (
    <RouteShell
      eyebrow="Account"
      title={user.user_metadata?.full_name || user.email || "Profile"}
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
              {(user.user_metadata?.service_categories ?? []).length > 0 ? (
                user.user_metadata?.service_categories?.map((service) => (
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
            {user.email}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">
            Display name
          </p>
          <p className="mt-2 text-lg text-white">
            {user.user_metadata?.full_name || "Not set"}
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100 sm:p-5">
          Use the account menu in the top right to log out.
        </div>
      </div>
    </RouteShell>
  );
}
