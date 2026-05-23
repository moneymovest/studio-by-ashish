import { ArrowUpRight, Search, SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/landing/site-header";
import { getProfessionals, Professional } from "@/app/actions/professional";

export const dynamic = "force-dynamic";

export default async function ProfessionalsPage() {
  const professionals: Professional[] = await getProfessionals(50);

  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.1),transparent_24)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-8 lg:px-10">
        <SiteHeader />

        <section className="grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:py-24">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">
              Discover talent
            </p>
            <h1 className="max-w-2xl text-5xl font-medium tracking-[-0.06em] text-white sm:text-6xl">
              Find creative professionals that look as premium as the clients
              they serve.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-white/64">
              Browse vetted professionals — data shown reflects live Supabase
              records.
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 backdrop-blur-xl">
                <Search className="h-4 w-4 text-cyan-300" />
                Search by style, location, or service
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 backdrop-blur-xl">
                <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
                Curated filters next
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {professionals.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/64">
                No professionals yet — check back later.
              </div>
            )}

            {professionals.map((professional) => (
              <article
                key={professional.id}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {professional.bio && (
                      <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                        {professional.bio}
                      </p>
                    )}
                    <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-white">
                      {professional.full_name ?? professional.user_id}
                    </h2>
                  </div>
                  {professional.rating != null && (
                    <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
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

                {professional.categories &&
                  professional.categories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {professional.categories.map((tag) => (
                        <span
                          key={String(tag)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/52"
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
                    className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-white"
                  >
                    View profile <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
