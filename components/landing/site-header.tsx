"use client";

import Link from "next/link";
import { useEffect } from "react";
import AuthMenu from "@/components/AuthMenu";

export function SiteHeader() {
  useEffect(() => {
  }, []);

  return (
    <header className="relative z-10 flex items-center justify-between border-b border-white/10 py-5">
      <Link href="/" className="group inline-flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold tracking-[0.35em] text-white shadow-[0_0_40px_rgba(56,189,248,0.12)] backdrop-blur-xl transition duration-300 group-hover:border-cyan-300/30 group-hover:bg-cyan-300/10">
          F
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-medium tracking-[0.22em] text-white/90">
            FRAMEBOOK
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            creative studio network
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <AuthMenu />
      </div>
    </header>
  );
}
