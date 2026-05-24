import getSupabaseAdmin from "@/lib/supabaseServer";

export type Professional = {
  id: string;
  user_id: string;
  categories?: string[];
  bio?: string;
  hourly_rate?: number;
  travel_rate_per_km?: number;
  service_radius_km?: number;
  rating?: number;
  total_reviews?: number;
  // profile fields merged in
  full_name?: string;
  avatar_url?: string;
};

export async function getProfessionals(limit = 50): Promise<Professional[]> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    // Supabase keys missing in the environment; avoid throwing during build.
    // Return an empty list so pages can render during local dev/build.
    // The user should set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
    console.warn(
      "Supabase admin client unavailable; returning empty professionals list.",
    );
    return [];
  }

  const { data: pros, error } = await supabaseAdmin
    .from("professionals")
    .select("*")
    .limit(limit);

  if (error) {
    console.error("Error fetching professionals:", error);
    return [];
  }

  if (!pros || (pros as unknown[]).length === 0) return [];

  const prosList = pros as Array<Record<string, unknown>>;

  const userIds = prosList
    .map((p) => {
      const v = p["user_id"];
      return v === undefined || v === null ? "" : String(v);
    })
    .filter(Boolean);

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  const profileMap: Record<string, Record<string, unknown>> = {};
  if (profiles) {
    for (const pr of profiles as Array<Record<string, unknown>>) {
      const id = pr["id"] as string;
      profileMap[id] = pr;
    }
  }

  return prosList.map((p) => {
    const uid = String(p["user_id"] ?? "");
    const pr = profileMap[uid] || {};

    return {
      id: String(p["id"] ?? ""),
      user_id: uid,
      categories: (p["categories"] as string[]) || [],
      bio: (p["bio"] as string) || undefined,
      hourly_rate: (p["hourly_rate"] as number) || undefined,
      travel_rate_per_km: (p["travel_rate_per_km"] as number) || undefined,
      service_radius_km: (p["service_radius_km"] as number) || undefined,
      rating: (p["rating"] as number) || undefined,
      total_reviews: (p["total_reviews"] as number) || undefined,
      full_name: (pr["full_name"] as string) || undefined,
      avatar_url: (pr["avatar_url"] as string) || undefined,
    };
  });
}

export async function getProfessionalById(
  id: string,
): Promise<Professional | null> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return null;

  const { data: pro, error } = await supabaseAdmin
    .from("professionals")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error || !pro) return null;

  const uid = String(pro["user_id"] ?? "");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", uid)
    .limit(1)
    .maybeSingle();

  return {
    id: String(pro["id"] ?? ""),
    user_id: uid,
    categories: (pro["categories"] as string[]) || [],
    bio: (pro["bio"] as string) || undefined,
    hourly_rate: (pro["hourly_rate"] as number) || undefined,
    travel_rate_per_km: (pro["travel_rate_per_km"] as number) || undefined,
    service_radius_km: (pro["service_radius_km"] as number) || undefined,
    rating: (pro["rating"] as number) || undefined,
    total_reviews: (pro["total_reviews"] as number) || undefined,
    full_name: (profile?.["full_name"] as string) || undefined,
    avatar_url: (profile?.["avatar_url"] as string) || undefined,
  };
}
