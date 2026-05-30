import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabaseServer";

type CreateProfileBody = {
  userId?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  accountType?: string;
  serviceCategories?: string[];
};

export async function POST(request: Request) {
  try {
    // Read raw body for debugging — some clients may send bodies that
    // Next's built-in parser doesn't surface as expected in dev.
    const raw = await request.text().catch(() => "");
    // eslint-disable-next-line no-console
    console.log("/api/profiles POST raw body:", raw);
    const body = (raw ? JSON.parse(raw) : {}) as CreateProfileBody;
    const userId = body.userId?.trim();
    const fullName = body.fullName?.trim() || null;
    const avatarUrl = body.avatarUrl?.trim() || null;
    const bio = body.bio?.trim() || null;
    const accountType = body.accountType?.trim();
    const serviceCategories = Array.isArray(body.serviceCategories)
      ? body.serviceCategories.map((service) => service.trim()).filter(Boolean)
      : [];

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client unavailable" },
        { status: 500 },
      );
    }

    // If caller passed an email address as `userId`, resolve it to the
    // corresponding Supabase auth user id (UUID) using the admin API.
    let resolvedUserId = userId;
    if (resolvedUserId?.includes("@")) {
      try {
        // Attempt to resolve email -> auth user id
        // supabase-admin API may expose `auth.admin.getUserByEmail`.
        // Use a defensive approach to handle varying response shapes.
        const getUser = await (supabaseAdmin.auth.admin as any).getUserByEmail(
          resolvedUserId,
        );
        // getUser may be { data: { user } } or { data: user }
        // Try to extract an id field safely.
        const userObj = getUser?.data?.user ?? getUser?.data ?? getUser?.user;
        if (userObj && userObj.id) {
          resolvedUserId = String(userObj.id);
        } else {
          return NextResponse.json(
            { error: "Unable to resolve email to a user id" },
            { status: 400 },
          );
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error("Failed to resolve user by email:", err);
        return NextResponse.json(
          { error: String(err?.message ?? err) },
          { status: 500 },
        );
      }
    }

    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id: resolvedUserId,
        full_name: fullName,
        avatar_url: avatarUrl,
        user_type: accountType || undefined,
      },
      {
        onConflict: "id",
        defaultToNull: false,
      },
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create profile" },
        { status: 500 },
      );
    }

    if (accountType === "professional") {
      try {
        // Detect existing professionals row (by id or user_id) to infer columns
        let existingPro: any = null;
        try {
          const { data: byId } = await supabaseAdmin
            .from("professionals")
            .select("*")
            .eq("id", resolvedUserId)
            .limit(1)
            .maybeSingle();
          existingPro = byId ?? null;
        } catch {
          existingPro = null;
        }

        if (!existingPro) {
          try {
            const { data: byUserId } = await supabaseAdmin
              .from("professionals")
              .select("*")
              .eq("user_id", resolvedUserId)
              .limit(1)
              .maybeSingle();
            existingPro = byUserId ?? null;
          } catch {
            existingPro = null;
          }
        }

        const cols = existingPro ? Object.keys(existingPro) : [];

        // Build payload using only columns that exist in the table.
        const payload: Record<string, any> = {};
        payload.id = resolvedUserId;
        if (cols.includes("user_id")) payload.user_id = resolvedUserId;
        if (cols.includes("bio")) payload.bio = bio;
        if (cols.includes("categories")) payload.categories = serviceCategories;
        if (cols.includes("category")) {
          // Use lowercase category values if client provided them capitalized.
          payload.category = serviceCategories.length
            ? serviceCategories.map((s) => String(s).toLowerCase())
            : ["photographer"];
        }

        // If we discovered no existing columns (table may be empty or unknown schema),
        // attempt a minimal insert that covers common required columns.
        if (cols.length === 0) {
          try {
            await supabaseAdmin.from("professionals").insert([
              {
                id: resolvedUserId,
                category: serviceCategories.length
                  ? serviceCategories.map((s) => String(s).toLowerCase())
                  : ["photographer"],
                bio,
              },
            ]);
          } catch (e: any) {
            // Log and continue — don't fail the whole request
            // eslint-disable-next-line no-console
            console.warn(
              "professionals minimal insert failed:",
              e?.message ?? e,
            );
          }
        } else {
          try {
            await supabaseAdmin.from("professionals").upsert(payload, {
              onConflict: "id",
              defaultToNull: false,
            });
          } catch (e: any) {
            // Log and continue
            // eslint-disable-next-line no-console
            console.warn("professionals upsert failed:", e?.message ?? e);
          }
        }
      } catch (professionalError: any) {
        // eslint-disable-next-line no-console
        console.warn(
          "professionals upsert skipped/failed:",
          professionalError?.message ?? professionalError,
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Surface unexpected server errors as JSON for easier debugging in dev.
    // eslint-disable-next-line no-console
    console.error("/api/profiles POST error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client unavailable" },
      { status: 500 },
    );
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  // Try both user_id and id columns to handle schema variations
  let professional: any = null;
  try {
    const { data: proByUserId } = await supabaseAdmin
      .from("professionals")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    professional = proByUserId;
  } catch {
    // ignore
  }

  if (!professional) {
    try {
      const { data: proById } = await supabaseAdmin
        .from("professionals")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .maybeSingle();

      professional = proById;
    } catch {
      // ignore
    }
  }

  // If there's no professionals row, try to build a professional object
  // from the auth user's metadata (useful during dev when rows aren't present).
  if (!professional) {
    try {
      // Try SDK helper first
      // @ts-ignore
      const getUser = (await supabaseAdmin.auth.admin.getUserById)
        ? await supabaseAdmin.auth.admin.getUserById(userId)
        : null;

      const authUser = getUser?.data?.user ?? null;

      // Fallback to listing users and finding by id
      if (!authUser) {
        const listed = await supabaseAdmin.auth.admin.listUsers();
        const found = listed.data?.users?.find((u: any) => u.id === userId);
        if (found) {
          const metadata = found.user_metadata as
            | Record<string, any>
            | undefined;
          const profObj = {
            id: found.id,
            user_id: found.id,
            categories: Array.isArray(metadata?.service_categories)
              ? metadata?.service_categories
              : [],
            bio: metadata?.bio || null,
          };

          return NextResponse.json({ profile, professional: profObj });
        }
      } else {
        const metadata = authUser.user_metadata as
          | Record<string, any>
          | undefined;
        const profObj = {
          id: authUser.id,
          user_id: authUser.id,
          categories: Array.isArray(metadata?.service_categories)
            ? metadata?.service_categories
            : [],
          bio: metadata?.bio || null,
        };

        return NextResponse.json({ profile, professional: profObj });
      }
    } catch (err) {
      // ignore and return null professional
    }
  }

  return NextResponse.json({ profile, professional });
}
