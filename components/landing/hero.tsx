"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { useAuthUser } from "@/components/auth/useAuthUser";

const heroWords = ["Photographers", "Videographers", "Editors"];

const trustPoints = [
  "Portfolio-first profiles",
  "Fast client discovery",
  "Managed conversations and bookings",
];

const featureCards = [
  {
    title: "Professional-ready profiles",
    body: "Showcase your best work with a polished, studio-grade presentation.",
  },
  {
    title: "Frictionless booking",
    body: "Let clients move from discovery to inquiry without scattered messages.",
  },
  {
    title: "Live project clarity",
    body: "Keep conversations, updates, and notifications in one premium workflow.",
  },
];

export function Hero() {
  const { user, loading } = useAuthUser();
  const isProfessional = user?.user_metadata?.account_type === "professional";

  return (
    <section
      id="discover"
      className="relative grid gap-10 py-12 sm:gap-12 sm:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-7"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/60 backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          trusted professionals
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {heroWords.map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 * index }}
                className="inline-flex items-center rounded-full bg-white/6 px-3 py-1 text-sm font-semibold text-white/80"
              >
                {word}
              </motion.span>
            ))}
          </div>

          <h1 className="max-w-3xl text-[clamp(2.25rem,8vw,4rem)] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[clamp(2.75rem,6vw,5rem)] lg:text-[clamp(3.5rem,5vw,5.75rem)]">
            Book Trusted Creative Professionals in Minutes
          </h1>

          <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
            Find verified photographers, videographers, editors, and creative
            experts for weddings, events, businesses, content creation, and
            personal projects.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={isProfessional ? "/profile" : "/professionals"}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#06b6d4,#7c3aed)] px-6 text-sm font-semibold text-white shadow-[0_0_40px_rgba(56,189,248,0.24)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 sm:w-auto sm:px-7"
            >
              {isProfessional ? "Go to dashboard" : "Find Professionals"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {!loading && !user ? (
              <Link
                href="/join"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/4 px-6 text-sm font-semibold text-white/88 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:w-auto sm:px-7"
              >
                <PlayCircle className="h-4 w-4 text-cyan-300" />
                Join as a Professional
              </Link>
            ) : null}
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/58">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl"
            >
              <CheckCircle2 className="h-4 w-4 text-cyan-300" />
              {point}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_42%)] blur-3xl" />

        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="rounded-[1.6rem] border border-white/10 bg-[#0d0d0d]/90 p-5 sm:p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-white/42">
              professional profiles appear here after work begins
            </p>
            <h2 className="mt-4 text-[clamp(1.5rem,4vw,2rem)] font-medium tracking-[-0.04em] text-white">
              Real portfolios, service packages, and project updates will show
              once you start working with a professional.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/56">
              This space stays clean until a live project begins.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 sm:px-4 sm:text-sm"
                >
                  {card.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
