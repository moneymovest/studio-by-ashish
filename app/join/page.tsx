import Link from "next/link";
import { CheckCircle2, LayoutGrid, Sparkles, Upload } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";

const checklist = [
  "Create your profile and brand story",
  "Add services, portfolio media, and pricing",
  "Define your availability and response workflow",
  "Go live and start receiving inquiries",
];

export default function JoinPage() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.1),transparent_24%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-8 lg:px-10">
        <SiteHeader />

        <section className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">
              Professional onboarding
            </p>
            <h1 className="max-w-2xl text-5xl font-medium tracking-[-0.06em] text-white sm:text-6xl">
              Build a profile that feels premium from the first scroll.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-white/64">
              This entry point is designed for professionals who want a clean,
              polished way to present services and manage client interest.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Sparkles,
                  title: "Polished presence",
                  body: "Showcase your best work with a studio-grade visual system.",
                },
                {
                  icon: LayoutGrid,
                  title: "Structured services",
                  body: "Package what you do in a way clients can understand fast.",
                },
                {
                  icon: Upload,
                  title: "Media ready",
                  body: "Lay the foundation for portfolio uploads and future integrations.",
                },
                {
                  icon: CheckCircle2,
                  title: "Clear progress",
                  body: "A guided setup flow keeps the setup experience calm and complete.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="mt-4 text-lg font-medium text-white">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/54">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-white/42">
              Setup checklist
            </p>
            <div className="mt-6 space-y-4">
              {checklist.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#38bdf8,#7c3aed)] text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-white/72">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100/90">
              Your professional signup is ready now. Use the button below to
              create an account and continue into the onboarding flow.
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup?accountType=professional"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#38bdf8,#7c3aed)] px-6 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(56,189,248,0.18)] transition hover:scale-[1.01]"
              >
                Create professional account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
