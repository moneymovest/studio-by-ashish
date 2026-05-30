import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabaseServer";

async function ensureBucketExists(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  bucketId: string,
) {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin.storage.createBucket(bucketId, {
    public: true,
  });

  if (!error) return;

  const message = error.message || "";
  if (
    message.includes("already exists") ||
    message.includes("duplicate") ||
    message.includes("409")
  ) {
    return;
  }

  throw error;
}

export async function POST() {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client unavailable" },
      { status: 500 },
    );
  }

  try {
    await ensureBucketExists(supabaseAdmin, "avatars");
    await ensureBucketExists(supabaseAdmin, "portfolio-media");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to bootstrap storage",
      },
      { status: 500 },
    );
  }
}
