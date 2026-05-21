import { FeatureBento } from "@/components/landing/feature-bento";
import { Hero } from "@/components/landing/hero";
import { SiteHeader } from "@/components/landing/site-header";

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.12),transparent_24%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-8 lg:px-10">
        <SiteHeader />
        <Hero />
        <FeatureBento />
      </div>
    </main>
  );
}
