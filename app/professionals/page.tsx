import { SiteHeader } from "@/components/landing/site-header";
import { getProfessionals, Professional } from "@/app/actions/professional";
import { ProfessionalsBrowser } from "@/components/landing/professionals-browser";

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
          </div>

          <ProfessionalsBrowser professionals={professionals} />
        </section>
      </div>
    </main>
  );
}
