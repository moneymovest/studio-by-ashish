import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabaseServer";

type CreateProfileBody = {
  userId?: string;
  fullName?: string;
  accountType?: string;
  serviceCategories?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateProfileBody;
  const userId = body.userId?.trim();
  const fullName = body.fullName?.trim() || null;
  const accountType = body.accountType?.trim();
  const serviceCategories = Array.isArray(body.serviceCategories)
    ? body.serviceCategories.map((service) => service.trim()).filter(Boolean)
    : [];

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

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
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
    const { error: professionalError } = await supabaseAdmin
      .from("professionals")
      .upsert(
        {
          id: userId,
          user_id: userId,
          categories: serviceCategories,
        },
        {
          onConflict: "id",
          defaultToNull: false,
        },
      );

    if (professionalError) {
      return NextResponse.json(
        {
          error:
            professionalError.message ||
            "Failed to create professional profile",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
