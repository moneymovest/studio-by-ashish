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

export async function getProfessionals(
  limit?: number,
): Promise<Professional[]> {
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

  let query = supabaseAdmin.from("professionals").select("*");

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data: pros, error } = await query;

  if (error) {
    console.error("Error fetching professionals:", error);
    return [];
  }

  const prosList = Array.isArray(pros)
    ? (pros as Array<Record<string, unknown>>)
    : [];

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

  const knownUserIds = new Set(userIds);
  const authUsersResult = await supabaseAdmin.auth.admin.listUsers();
  const authUsers = authUsersResult.data?.users ?? [];

  for (const user of authUsers) {
    const userId = user.id;
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const accountType = metadata?.account_type;

    if (accountType !== "professional" || knownUserIds.has(userId)) {
      continue;
    }

    prosList.push({
      id: userId,
      user_id: userId,
      categories: Array.isArray(metadata?.service_categories)
        ? (metadata?.service_categories as string[])
        : [],
      bio: undefined,
      hourly_rate: undefined,
      travel_rate_per_km: undefined,
      service_radius_km: undefined,
      rating: undefined,
      total_reviews: undefined,
      full_name:
        (profileMap[userId]?.["full_name"] as string | undefined) ||
        (metadata?.full_name as string | undefined) ||
        undefined,
      avatar_url:
        (profileMap[userId]?.["avatar_url"] as string | undefined) ||
        (metadata?.avatar_url as string | undefined) ||
        undefined,
    });
  }

  const allUserIds = Array.from(
    new Set(
      prosList
        .map((professional) => {
          const v = professional["user_id"];
          return v === undefined || v === null ? "" : String(v);
        })
        .filter(Boolean),
    ),
  );

  const { data: allProfiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", allUserIds);

  const mergedProfileMap: Record<string, Record<string, unknown>> = {};
  if (allProfiles) {
    for (const pr of allProfiles as Array<Record<string, unknown>>) {
      const id = pr["id"] as string;
      mergedProfileMap[id] = pr;
    }
  }

  return prosList.map((p) => {
    const uid = String(p["user_id"] ?? "");
    const pr = mergedProfileMap[uid] || profileMap[uid] || {};
    const mergedFullName =
      (pr["full_name"] as string | undefined) ||
      (p["full_name"] as string | undefined) ||
      undefined;
    const mergedAvatarUrl =
      (pr["avatar_url"] as string | undefined) ||
      (p["avatar_url"] as string | undefined) ||
      undefined;

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
      full_name: mergedFullName,
      avatar_url: mergedAvatarUrl,
    };
  });
}

export async function getProfessionalById(
  id: string,
): Promise<Professional | null> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return null;

  const { data: proById, error: proByIdError } = await supabaseAdmin
    .from("professionals")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  let pro = proById;

  if (proByIdError) return null;

  if (!pro) {
    const { data: proByUserId, error: proByUserIdError } = await supabaseAdmin
      .from("professionals")
      .select("*")
      .eq("user_id", id)
      .limit(1)
      .maybeSingle();

    if (proByUserIdError) return null;
    pro = proByUserId;
  }

  if (pro) {
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

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  const authUser = authUsers?.users?.find(
    (user) => user.id === id && user.user_metadata?.account_type === "professional",
  );

  if (!authUser) return null;

  const metadata = authUser.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  return {
    id,
    user_id: id,
    categories: Array.isArray(metadata?.service_categories)
      ? (metadata?.service_categories as string[])
      : [],
    bio: (metadata?.bio as string) || undefined,
    hourly_rate: undefined,
    travel_rate_per_km: undefined,
    service_radius_km: undefined,
    rating: undefined,
    total_reviews: undefined,
    full_name:
      (profile?.["full_name"] as string | undefined) ||
      (metadata?.full_name as string | undefined) ||
      undefined,
    avatar_url:
      (profile?.["avatar_url"] as string | undefined) ||
      (metadata?.avatar_url as string | undefined) ||
      undefined,
  };
}
