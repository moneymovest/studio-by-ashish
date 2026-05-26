"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, Star, X } from "lucide-react";
import type { Professional } from "@/app/actions/professional";

type ProfessionalsBrowserProps = {
  professionals: Professional[];
};

function matchesSearch(professional: Professional, query: string) {
  if (!query) return true;

  const haystack = [
    professional.full_name,
    professional.bio,
    professional.user_id,
    ...(professional.categories ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function ProfessionalsBrowser({
  professionals,
}: ProfessionalsBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          professionals.flatMap(
            (professional) => professional.categories ?? [],
          ),
        ),
      ).sort(),
    [professionals],
  );

  const filteredProfessionals = useMemo(() => {
    const normalizedQuery = query.trim();

    return [...professionals]
      .filter((professional) => {
        const categoryMatches =
          category === "all" ||
          (professional.categories ?? []).includes(category);
        return categoryMatches && matchesSearch(professional, normalizedQuery);
      })
      .sort((left, right) => {
        const leftRating = left.rating ?? 0;
        const rightRating = right.rating ?? 0;
        if (rightRating !== leftRating) return rightRating - leftRating;

        return (left.full_name ?? left.user_id).localeCompare(
          right.full_name ?? right.user_id,
        );
      });
  }, [category, professionals, query]);

  const hasFilters = Boolean(query.trim()) || category !== "all";

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">
              Search and filters
            </p>
            <p className="text-sm text-white/62">
              Search by name, bio, or service. Filter by category.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {filteredProfessionals.length} shown
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {professionals.length} total
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <label className="flex min-h-11 min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#090909]/75 px-4 py-3 text-white/72 focus-within:border-cyan-300/30">
            <Search className="h-4 w-4 text-cyan-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search professionals"
              className="min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </label>

          <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-[#090909]/75 px-4 py-3 text-sm text-white/72">
            <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
            <select
              aria-label="Filter by service category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-w-0 w-full bg-transparent text-white outline-none"
            >
              <option value="all">All services</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/52 transition hover:border-cyan-300/30 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-[0.6875rem] uppercase tracking-[0.24em] transition sm:text-xs ${
                category === "all"
                  ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 bg-white/5 text-white/52 hover:border-cyan-300/30 hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-[0.6875rem] uppercase tracking-[0.24em] transition sm:text-xs ${
                  category === item
                    ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/52 hover:border-cyan-300/30 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredProfessionals.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/64">
          <p className="text-base text-white/80">
            No professionals match{" "}
            {query.trim() ? `“${query.trim()}”` : "the current filters"}.
          </p>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Try a partial name, a service like photographer, or clear the
            category filter to widen the results.
          </p>
        </div>
      )}

      {filteredProfessionals.map((professional) => (
        <article
          key={professional.id}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/7 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {professional.bio && (
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                  {professional.bio}
                </p>
              )}
              <h2 className="mt-2 text-[clamp(1.5rem,4vw,2rem)] font-medium tracking-[-0.04em] text-white">
                {professional.full_name ?? professional.user_id}
              </h2>
            </div>
            {professional.rating != null && (
              <div className="flex w-fit items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                <Star className="h-3.5 w-3.5 fill-current" />
                {professional.rating}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/56">
            {professional.service_radius_km != null && (
              <span>{`${professional.service_radius_km} km radius`}</span>
            )}

            {professional.service_radius_km != null &&
              professional.hourly_rate != null && (
                <span className="h-1 w-1 rounded-full bg-white/30" />
              )}

            {professional.hourly_rate != null && (
              <span>{`From $${professional.hourly_rate}`}</span>
            )}
          </div>

          {professional.categories && professional.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {professional.categories.map((tag) => (
                <span
                  key={String(tag)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6875rem] uppercase tracking-[0.24em] text-white/52 sm:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <div />
            <Link
              href={`/professionals/${professional.id}`}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-white"
            >
              View profile <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
