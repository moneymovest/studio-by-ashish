"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Camera,
  CheckCircle2,
  ImagePlus,
  PencilLine,
  Save,
  Star,
  Upload,
  WandSparkles,
} from "lucide-react";
import type { AuthUser } from "@/components/auth/useAuthUser";
import type { Professional } from "@/app/actions/professional";
import getSupabaseClient from "@/lib/supabaseClient";
import { SiteHeader } from "@/components/landing/site-header";

const serviceOptions = ["Photographer", "Videographer", "Editor"];

const dashboardStats = [
  {
    label: "Recent bookings",
    helper: "Sync your booking source to make this live.",
  },
  {
    label: "Ratings",
    helper: "Clients see your average rating and review count here.",
  },
  {
    label: "Portfolio media",
    helper: "Keep your best visuals ready for discovery.",
  },
  {
    label: "Professional profile",
    helper: "Bio, services, and photo stay in one place.",
  },
];

type ProfessionalDashboardProps = {
  user: NonNullable<AuthUser>;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Unable to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

function starString(rating?: number) {
  if (!rating) return "No rating yet";

  return `${rating.toFixed(1)} / 5`;
}

export function ProfessionalDashboard({ user }: ProfessionalDashboardProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(
    "Ready to update your dashboard.",
  );
  const [fullName, setFullName] = useState(
    user.user_metadata?.full_name || user.email || "Professional",
  );
  const [bio, setBio] = useState(user.user_metadata?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(
    user.user_metadata?.avatar_url || "/favicon.ico",
  );
  const [services, setServices] = useState<string[]>(
    user.user_metadata?.service_categories ?? [],
  );
  const mediaStorageKey = `framebook-media-${user.id}`;
  const [mediaItems, setMediaItems] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const storedMedia = window.localStorage.getItem(mediaStorageKey);
      if (!storedMedia) return [];

      const parsed = JSON.parse(storedMedia) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [diagSource, setDiagSource] = useState<string | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      const TIMEOUT = 8000; // ms

      const fetchWithTimeout = (p: Promise<any>, ms: number) =>
        Promise.race([
          p,
          new Promise((_resolve, reject) =>
            setTimeout(() => reject(new Error("timeout")), ms),
          ),
        ]) as Promise<any>;

      try {
        const supabase = getSupabaseClient();

        // Try the client-side supabase path with a timeout so we don't hang.
        if (supabase) {
          try {
            const [{ data: profile }, { data: professionalRow }] =
              await fetchWithTimeout(
                Promise.all([
                  supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .eq("id", user.id)
                    .limit(1)
                    .maybeSingle(),
                  supabase
                    .from("professionals")
                    .select("*")
                    .eq("user_id", user.id)
                    .limit(1)
                    .maybeSingle(),
                ]),
                TIMEOUT,
              );

            if (!mounted) return;

            setDiagSource("client");
            setDiagError(null);

            setFullName(
              (profile?.["full_name"] as string | undefined) ||
                user.user_metadata?.full_name ||
                user.email ||
                "Professional",
            );
            setAvatarUrl(
              (profile?.["avatar_url"] as string | undefined) ||
                user.user_metadata?.avatar_url ||
                "/favicon.ico",
            );
            setBio(
              (professionalRow?.["bio"] as string) ||
                user.user_metadata?.bio ||
                "",
            );
            setServices(
              (professionalRow?.["categories"] as string[]) ||
                user.user_metadata?.service_categories ||
                [],
            );
            setProfessional(
              professionalRow
                ? {
                    id: String(professionalRow["id"] ?? ""),
                    user_id: String(professionalRow["user_id"] ?? user.id),
                    categories:
                      (professionalRow["categories"] as string[]) ||
                      user.user_metadata?.service_categories ||
                      [],
                    bio: (professionalRow["bio"] as string) || undefined,
                    hourly_rate:
                      (professionalRow["hourly_rate"] as number) || undefined,
                    travel_rate_per_km:
                      (professionalRow["travel_rate_per_km"] as number) ||
                      undefined,
                    service_radius_km:
                      (professionalRow["service_radius_km"] as number) ||
                      undefined,
                    rating: (professionalRow["rating"] as number) || undefined,
                    total_reviews:
                      (professionalRow["total_reviews"] as number) || undefined,
                    full_name: (profile?.["full_name"] as string) || undefined,
                    avatar_url:
                      (profile?.["avatar_url"] as string) || undefined,
                  }
                : null,
            );

            return; // success via client supabase
          } catch (err: any) {
            // client supabase failed or timed out — fall through to server fallback
            // eslint-disable-next-line no-console
            console.warn("Client supabase fetch failed, falling back", err);
            setDiagSource("client-failed");
            setDiagError(String(err?.message ?? err));
          }
        }

        // Server-side fallback: call our API route which uses the admin client.
        try {
          const res = await fetch(
            `/api/profiles?userId=${encodeURIComponent(user.id)}`,
            { cache: "no-store" },
          );

          if (res.ok) {
            const payload = await res.json().catch(() => ({}));
            const profile = payload.profile as any;
            const professionalRow = payload.professional as any;

            if (!mounted) return;

            setDiagSource("server");
            setDiagError(null);

            setFullName(
              (profile?.["full_name"] as string | undefined) ||
                user.user_metadata?.full_name ||
                user.email ||
                "Professional",
            );
            setAvatarUrl(
              (profile?.["avatar_url"] as string | undefined) ||
                user.user_metadata?.avatar_url ||
                "/favicon.ico",
            );
            setBio(
              (professionalRow?.["bio"] as string) ||
                user.user_metadata?.bio ||
                "",
            );
            setServices(
              (professionalRow?.["categories"] as string[]) ||
                user.user_metadata?.service_categories ||
                [],
            );
            setProfessional(
              professionalRow
                ? {
                    id: String(professionalRow["id"] ?? ""),
                    user_id: String(professionalRow["user_id"] ?? user.id),
                    categories:
                      (professionalRow["categories"] as string[]) ||
                      user.user_metadata?.service_categories ||
                      [],
                    bio: (professionalRow["bio"] as string) || undefined,
                    hourly_rate:
                      (professionalRow["hourly_rate"] as number) || undefined,
                    travel_rate_per_km:
                      (professionalRow["travel_rate_per_km"] as number) ||
                      undefined,
                    service_radius_km:
                      (professionalRow["service_radius_km"] as number) ||
                      undefined,
                    rating: (professionalRow["rating"] as number) || undefined,
                    total_reviews:
                      (professionalRow["total_reviews"] as number) || undefined,
                    full_name: (profile?.["full_name"] as string) || undefined,
                    avatar_url:
                      (profile?.["avatar_url"] as string) || undefined,
                  }
                : null,
            );
            return;
          }
        } catch (err: any) {
          // ignore and let finally clear loading state
          // eslint-disable-next-line no-console
          console.warn("Server fallback failed", err);
          setDiagSource("server-failed");
          setDiagError(String(err?.message ?? err));
        }
      } catch (err) {
        if (mounted) {
          setProfessional(null);
        }
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    try {
      window.localStorage.setItem(mediaStorageKey, JSON.stringify(mediaItems));
    } catch {
      // Ignore storage failures in private browsing or restricted environments.
    }
  }, [mediaItems, mediaStorageKey]);

  const rating = professional?.rating ?? 0;
  const reviewCount = professional?.total_reviews ?? 0;
  const publicProfileId = professional?.id || user.id;
  const bookingCards = [
    {
      label: "New inquiries",
      value: "0",
      helper: "Connect your booking source to make this live.",
    },
    {
      label: "Confirmed jobs",
      value: "0",
      helper: "Show active client work here.",
    },
    {
      label: "Completed bookings",
      value: "0",
      helper: "Track finished projects and repeat clients.",
    },
  ];

  async function handleAvatarUpload(file: File | null) {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setAvatarUrl(dataUrl);
    setSaveMessage("Avatar preview updated. Save to keep it on your profile.");
  }

  async function handleMediaUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const previews = await Promise.all(
      Array.from(files)
        .slice(0, 6)
        .map((file) => readFileAsDataUrl(file)),
    );

    setMediaItems((current) => [...previews, ...current].slice(0, 12));
    setSaveMessage("Media added to your dashboard gallery.");
  }

  function toggleService(service: string) {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  async function handleSaveProfile() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSaveMessage("Supabase is not configured in this environment.");
      return;
    }

    setSaving(true);
    setSaveMessage("Saving changes...");

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_url: avatarUrl,
        bio,
        account_type: "professional",
        service_categories: services,
      },
    });

    if (authError) {
      setSaveMessage(authError.message || "Unable to update account data.");
      setSaving(false);
      return;
    }

    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        fullName,
        avatarUrl,
        bio,
        accountType: "professional",
        serviceCategories: services,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setSaveMessage(
        payload.error ||
          "Saved locally, but the profile update endpoint failed.",
      );
      setSaving(false);
      return;
    }

    setProfessional((current) =>
      current
        ? {
            ...current,
            full_name: fullName,
            avatar_url: avatarUrl,
            bio,
            categories: services,
          }
        : current,
    );
    setSaveMessage("Dashboard saved.");
    setSaving(false);
  }

  if (loadingProfile) {
    return (
      <main className="relative isolate overflow-x-clip">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.1),transparent_24%)]" />
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-10">
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center py-16 text-white/64 sm:py-24">
            Loading your dashboard...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative isolate overflow-x-clip">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.12),transparent_24%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-10">
        <SiteHeader />
        {diagSource ? (
          <div className="mx-auto mt-4 w-full max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="rounded-lg border border-yellow-400/10 bg-yellow-500/6 p-2 text-sm text-yellow-200">
              <strong>Diag:</strong> {diagSource}
              {diagError ? ` — ${diagError}` : ""}
            </div>
          </div>
        ) : null}

        <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.14fr_0.86fr] lg:items-start lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/60 backdrop-blur-xl">
              <WandSparkles className="h-3.5 w-3.5 text-cyan-300" />
              professional dashboard
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="space-y-4">
                  <div className="relative w-fit">
                    <div className="h-28 w-28 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] sm:h-32 sm:w-32">
                      <Image
                        src={avatarUrl || "/favicon.ico"}
                        alt={fullName || "avatar"}
                        width={160}
                        height={160}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 text-sm text-white/80 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      <Camera className="h-4 w-4 text-cyan-300" />
                      Change photo
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      title="Upload profile photo"
                      className="hidden"
                      onChange={(event) => {
                        void handleAvatarUpload(
                          event.target.files?.[0] ?? null,
                        );
                      }}
                    />
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                      Quick score
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-amber-200">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-lg font-medium">
                        {starString(rating)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/56">
                      {reviewCount > 0
                        ? `${reviewCount} customer review${reviewCount === 1 ? "" : "s"}`
                        : "No reviews yet"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">
                      Profile overview
                    </p>
                    <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-medium tracking-[-0.06em] text-white">
                      {fullName}
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
                      This is your studio-style control room for bookings,
                      ratings, media, and profile edits.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6875rem] uppercase tracking-[0.24em] text-white/72 sm:text-xs"
                        >
                          {service}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6875rem] uppercase tracking-[0.24em] text-white/52 sm:text-xs">
                        No services selected yet
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-white/42">
                        Display name
                      </span>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/30"
                        placeholder="Your name"
                      />
                    </label>

                    <label className="space-y-2 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-white/42">
                        Bio writer
                      </span>
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={4}
                        className="min-h-11 w-full resize-none rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/30"
                        placeholder="Write a short, client-facing bio..."
                      />
                    </label>
                  </div>

                  <div className="space-y-3 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                          Service options
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                          Select the roles you want customers to find.
                        </p>
                      </div>
                      <PencilLine className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map((service) => {
                        const active = services.includes(service);

                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] transition sm:text-sm ${
                              active
                                ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-cyan-300/30 hover:text-white"
                            }`}
                          >
                            {service}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleSaveProfile()}
                      disabled={saving}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#38bdf8,#7c3aed)] px-5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(56,189,248,0.18)] transition hover:scale-[1.01] disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <Link
                      href={`/professionals/${publicProfileId}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/4 px-5 text-sm font-semibold text-white/88 transition hover:border-cyan-300/30 hover:bg-white/8"
                    >
                      View public profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/4 px-5 text-sm font-semibold text-white/88 transition hover:border-cyan-300/30 hover:bg-white/8"
                    >
                      <Upload className="h-4 w-4" />
                      Upload media
                    </button>
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      title="Upload portfolio media"
                      className="hidden"
                      onChange={(event) => {
                        void handleMediaUpload(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </div>

                  <p className="text-sm text-cyan-100/80">{saveMessage}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {dashboardStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/68">
                      {stat.helper}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100/90">
                Your dashboard is ready for profile edits, portfolio uploads,
                booking sync, and customer feedback.
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                Key numbers
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  {
                    label: "Average rating",
                    value: starString(rating),
                    icon: Star,
                  },
                  {
                    label: "Reviews",
                    value: String(reviewCount),
                    icon: CheckCircle2,
                  },
                  {
                    label: "Services",
                    value: String(services.length),
                    icon: WandSparkles,
                  },
                  {
                    label: "Service radius",
                    value: professional?.service_radius_km
                      ? `${professional.service_radius_km} km`
                      : "Not set",
                    icon: CalendarClock,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                          {label}
                        </p>
                        <p className="mt-2 text-lg font-medium text-white">
                          {value}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-cyan-300">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                  Recent bookings
                </p>
                <h2 className="mt-2 text-xl font-medium text-white">
                  Booking pipeline
                </h2>
              </div>
              <CalendarClock className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {bookingCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4 sm:p-5">
              <p className="text-sm leading-6 text-white/64">
                Recent bookings will populate here once you connect your booking
                source. Until then, this panel acts as your workflow tracker for
                inquiries, confirmations, and completed projects.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                  Reviews
                </p>
                <h2 className="mt-2 text-xl font-medium text-white">
                  What customers rated you
                </h2>
              </div>
              <Star className="h-5 w-5 text-amber-200" />
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {starString(rating)}
                </div>
                <span className="text-sm text-white/56">
                  {reviewCount > 0
                    ? `${reviewCount} client review${reviewCount === 1 ? "" : "s"}`
                    : "No reviews yet"}
                </span>
              </div>

              {reviewCount > 0 ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm leading-6 text-white/72">
                      Customers are rating your profile on reliability, style,
                      and communication. Keep your bio, media, and booking flow
                      updated so these scores stay strong.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                      Review snapshot
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/72">
                      Your next step is to surface individual customer feedback
                      once the review table is connected.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/64">
                  No customer feedback has been published yet. Once your first
                  clients rate you, the average score and written feedback will
                  appear here.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 pb-16 lg:grid-cols-[0.94fr_1.06fr] lg:pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                  Media library
                </p>
                <h2 className="mt-2 text-xl font-medium text-white">
                  Upload and preview your portfolio
                </h2>
              </div>
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/4 px-4 text-sm text-white/88 transition hover:border-cyan-300/30 hover:bg-white/8"
              >
                <ImagePlus className="h-4 w-4 text-cyan-300" />
                Add media
              </button>
            </div>

            {mediaItems.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {mediaItems.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0b0b]/80"
                  >
                    <Image
                      src={item}
                      alt={`Portfolio upload ${index + 1}`}
                      width={600}
                      height={420}
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMediaItems((current) =>
                          current.filter(
                            (_, currentIndex) => currentIndex !== index,
                          ),
                        )
                      }
                      className="absolute right-3 top-3 rounded-full border border-white/12 bg-black/40 px-3 py-1 text-xs text-white/90 opacity-0 backdrop-blur-xl transition group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0b0b0b]/80 p-6 text-sm leading-6 text-white/60">
                Drag in media, client photos, or portfolio stills to start
                building a visual gallery. Your uploaded previews will appear
                here first so you can curate them before making the profile
                live.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                  Dashboard tools
                </p>
                <h2 className="mt-2 text-xl font-medium text-white">
                  Important controls for your workflow
                </h2>
              </div>
              <CheckCircle2 className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Update bio and profile picture",
                "Manage service categories",
                "Review incoming bookings",
                "Track ratings and feedback",
                "Upload portfolio media",
                "Set pricing and availability",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4 text-sm leading-6 text-white/70"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100/90">
              This dashboard is intentionally built around the work a
              photographer, videographer, or editor needs most: profile editing,
              media uploads, bookings, and ratings. You can keep extending it
              with inbox, pricing, and availability controls next.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
