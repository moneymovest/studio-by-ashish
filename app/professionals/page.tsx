import { SiteHeader } from "@/components/landing/site-header";
import { getProfessionals, Professional } from "@/app/actions/professional";
import { ProfessionalsBrowser } from "@/components/landing/professionals-browser";

export const dynamic = "force-dynamic";

export default async function ProfessionalsPage() {
  const professionals: Professional[] = await getProfessionals();

  return (
    <main className="relative isolate overflow-x-clip">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.1),transparent_24)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-10">
        <SiteHeader />

        <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:py-24">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">
              Discover talent
            </p>
            <h1 className="max-w-2xl text-[clamp(2rem,6.5vw,3.25rem)] font-medium tracking-[-0.06em] text-white sm:text-[clamp(2.35rem,5vw,3.9rem)] lg:text-[clamp(2.6rem,4.2vw,4.15rem)]">
              Find creative professionals that look as premium as the clients
              they serve.
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
              Browse vetted professionals — data shown reflects live Supabase
              records.
            </p>
          </div>

          <ProfessionalsBrowser professionals={professionals} />
        </section>
      </div>
    </main>
  );
}
