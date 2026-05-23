import { Camera, MessageSquare, ShieldCheck, Workflow } from "lucide-react";

const featureTiles = [
  {
    icon: Camera,
    title: "Portfolio-first layouts",
    body: "Give every professional a cinematic, high-end presence that puts the work front and center.",
  },
  {
    icon: Workflow,
    title: "Clear booking flow",
    body: "Move from discovery to inquiry to reservation with a structured, calm experience.",
  },
  {
    icon: MessageSquare,
    title: "Conversations in one place",
    body: "Keep client communication organized across threads, updates, and notifications.",
  },
  {
    icon: ShieldCheck,
    title: "Vetted professional network",
    body: "Help brands and planners find top-tier creative talent with less friction.",
  },
];

export function FeatureBento() {
  return (
    <section id="professionals" className="pb-20 pt-6 lg:pb-28">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featureTiles.map((tile) => {
          const Icon = tile.icon;

          return (
            <article
              key={tile.title}
              className="group rounded-[1.75rem] border border-white/12 bg-[#070707]/80 p-6 backdrop-blur-xl cursor-default"
              aria-hidden
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/6 text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-[-0.03em] text-white">
                {tile.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/56">
                {tile.body}
              </p>
            </article>
          );
        })}
      </div>

      <div
        id="how-it-works"
        className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 backdrop-blur-xl sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-white/42">
              how it works
            </p>
            <h2 className="mt-4 max-w-lg text-3xl font-medium tracking-[-0.05em] text-white sm:text-4xl">
              Built to feel like a premium studio, not a generic marketplace.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [
                "1",
                "Professionals build a polished profile with services, media, and proof of work.",
              ],
              [
                "2",
                "Clients discover the right talent, inspect the portfolio, and start a conversation.",
              ],
              [
                "3",
                "Bookings, updates, and notifications stay organized in one clean workflow.",
              ],
            ].map(([step, text]) => (
              <div
                key={step}
                className="rounded-3xl border border-white/12 bg-[#0b0b0b]/88 p-5"
              >
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-300">
                  Step {step}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
