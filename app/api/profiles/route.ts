import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabaseServer";

type CreateProfileBody = {
  userId?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateProfileBody;
  const userId = body.userId?.trim();
  const fullName = body.fullName?.trim() || null;

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

  return NextResponse.json({ ok: true });
}
