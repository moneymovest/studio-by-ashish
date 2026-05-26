"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RouteShell } from "@/components/landing/route-shell";
import type { Professional } from "@/app/actions/professional";
import getSupabaseClient from "@/lib/supabaseClient";

export default function ProfessionalPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfessional() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      const [{ data: proById }, { data: proByUserId }, { data: profile }] =
        await Promise.all([
          supabase
            .from("professionals")
            .select("*")
            .eq("id", id)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("professionals")
            .select("*")
            .eq("user_id", id)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", id)
            .limit(1)
            .maybeSingle(),
        ]);

      const pro = proById || proByUserId;

      if (!mounted) return;

      if (pro) {
        const userId = String(pro["user_id"] ?? id);
        setProfessional({
          id: String(pro["id"] ?? id),
          user_id: userId,
          categories: (pro["categories"] as string[]) || [],
          bio: (pro["bio"] as string) || undefined,
          hourly_rate: (pro["hourly_rate"] as number) || undefined,
          travel_rate_per_km:
            (pro["travel_rate_per_km"] as number) || undefined,
          service_radius_km: (pro["service_radius_km"] as number) || undefined,
          rating: (pro["rating"] as number) || undefined,
          total_reviews: (pro["total_reviews"] as number) || undefined,
          full_name:
            (profile?.["full_name"] as string | undefined) ||
            (pro["full_name"] as string | undefined) ||
            undefined,
          avatar_url:
            (profile?.["avatar_url"] as string | undefined) ||
            (pro["avatar_url"] as string | undefined) ||
            undefined,
        });
        setLoading(false);
        return;
      }

      if (profile) {
        setProfessional({
          id,
          user_id: id,
          categories: [],
          full_name: (profile["full_name"] as string) || undefined,
          avatar_url: (profile["avatar_url"] as string) || undefined,
        });
        setLoading(false);
        return;
      }

      setProfessional(null);
      setLoading(false);
    }

    loadProfessional();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <RouteShell
        eyebrow="Professional"
        title="Loading profile"
        description="Fetching professional details..."
        primaryLabel="Back to list"
        primaryHref="/professionals"
        secondaryLabel="Home"
        secondaryHref="/"
      >
        <div className="p-6 text-white/64">Loading profile...</div>
      </RouteShell>
    );
  }

  if (!professional) {
    return (
      <RouteShell
        eyebrow="Professional"
        title="Profile not found"
        description="We couldn't locate that profile."
        primaryLabel="Back to list"
        primaryHref="/professionals"
        secondaryLabel="Home"
        secondaryHref="/"
      >
        <div className="p-6 text-white/64">No profile found.</div>
      </RouteShell>
    );
  }

  return (
    <RouteShell
      eyebrow="Professional"
      title={professional.full_name ?? "Professional profile"}
      description={professional.bio ?? ""}
      primaryLabel="Message"
      primaryHref="#"
      secondaryLabel="Back"
      secondaryHref="/professionals"
    >
      <div className="p-4 text-white sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Image
            src={professional.avatar_url || "/favicon.ico"}
            alt={professional.full_name ?? "avatar"}
            width={112}
            height={112}
            className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28"
          />
          <div className="min-w-0">
            <h3 className="text-xl font-medium sm:text-2xl">
              {professional.full_name}
            </h3>
            <p className="mt-2 text-sm text-white/64">{professional.bio}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/72">
              {professional.categories &&
                professional.categories.length > 0 &&
                professional.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                  >
                    {category}
                  </span>
                ))}
              {professional.hourly_rate != null && (
                <span>{`From $${professional.hourly_rate}/hr`}</span>
              )}
              {professional.service_radius_km != null && (
                <span>{`${professional.service_radius_km} km radius`}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteShell>
  );
}
