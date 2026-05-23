"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";

const heroWords = ["Photographers", "Videographers", "Editors"];

const trustPoints = [
  "Portfolio-first profiles",
  "Fast client discovery",
  "Managed conversations and bookings",
];

const metrics = [
  { value: "120+", label: "curated professional profiles" },
  { value: "24h", label: "average response time" },
  { value: "4.9/5", label: "client satisfaction" },
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
  return (
    <section
      id="discover"
      className="relative grid gap-16 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-8"
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

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
            Book Trusted Creative Professionals in Minutes
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
            Find verified photographers, videographers, editors, and creative
            experts for weddings, events, businesses, content creation, and
            personal projects.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/professionals"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#06b6d4,#7c3aed)] px-7 text-sm font-semibold text-white shadow-[0_0_40px_rgba(56,189,248,0.24)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            >
              Find Professionals
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/join"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/4 px-7 text-sm font-semibold text-white/88 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <PlayCircle className="h-4 w-4 text-cyan-300" />
              Join as a Professional
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-4 pt-2 sm:grid-cols-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + 0.08 * index }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <p className="text-3xl font-semibold tracking-[-0.04em] text-white">
                {metric.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/54">
                {metric.label}
              </p>
            </motion.div>
          ))}
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
        <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_42%)] blur-3xl" />

        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-[1.6rem] border border-white/10 bg-[#0d0d0d]/90 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/42">
                  featured professional
                </p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-white">
                  Jordan Lee, Director / Editor
                </h2>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Available now
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(56,189,248,0.14),rgba(255,255,255,0.03))] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                  Recent booking
                </p>
                <p className="mt-3 text-lg font-medium text-white">
                  Editorial campaign for a luxury brand launch.
                </p>
                <p className="mt-4 text-sm leading-6 text-white/56">
                  Approved in under 12 hours with clean scope, deliverables, and
                  timeline.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                  Workflow status
                </p>
                <ul className="mt-4 space-y-3 text-sm text-white/72">
                  <li className="flex items-center justify-between gap-4">
                    <span>Profile polish</span>
                    <span className="text-cyan-300">Complete</span>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span>Active service packages</span>
                    <span className="text-cyan-300">4</span>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span>Open conversations</span>
                    <span className="text-cyan-300">7</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <p className="text-sm font-medium text-white">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/54">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
