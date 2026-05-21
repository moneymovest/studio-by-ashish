import Link from "next/link";

type RouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  children: React.ReactNode;
};

export function RouteShell({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  children,
}: RouteShellProps) {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.1),transparent_24%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link
            href="/"
            className="text-sm font-medium tracking-[0.22em] text-white/90"
          >
            FRAMEBOOK
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/80 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
          >
            Back home
          </Link>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div className="space-y-7">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-5xl font-medium tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/64 sm:text-xl">
              {description}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#38bdf8,#7c3aed)] px-7 text-sm font-semibold text-white shadow-[0_0_40px_rgba(56,189,248,0.25)] transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
              >
                {primaryLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/4 px-7 text-sm font-semibold text-white/88 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
