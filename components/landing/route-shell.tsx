import Link from "next/link";

type RouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  align?: "center" | "start";
  panelScrollable?: boolean;
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
  align = "center",
  panelScrollable = false,
  children,
}: RouteShellProps) {
  return (
    <main className="relative isolate overflow-x-clip">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.1),transparent_24%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8 xl:px-12">
        <header className="flex flex-col gap-4 border-b border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <Link
            href="/"
            className="text-sm font-medium tracking-[0.22em] text-white/90"
          >
            FRAMEBOOK
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white/80 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
          >
            Back home
          </Link>
        </header>

        <section
          className={`grid gap-8 py-12 sm:gap-10 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24 ${
            align === "start" ? "lg:items-start" : "lg:items-center"
          }`}
        >
          <div className="space-y-7">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-[clamp(2.5rem,8vw,4.25rem)] font-medium tracking-[-0.06em] text-white sm:text-[clamp(3rem,6vw,5rem)] lg:text-[clamp(3.75rem,5vw,5.75rem)]">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
              {description}
            </p>

            {(primaryLabel || secondaryLabel) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {primaryLabel && primaryHref ? (
                  <Link
                    href={primaryHref}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#38bdf8,#7c3aed)] px-6 text-sm font-semibold text-white shadow-[0_0_40px_rgba(56,189,248,0.25)] transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 sm:w-auto sm:px-7"
                  >
                    {primaryLabel}
                  </Link>
                ) : null}
                {secondaryLabel && secondaryHref ? (
                  <Link
                    href={secondaryHref}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/4 px-6 text-sm font-semibold text-white/88 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:w-auto sm:px-7"
                  >
                    {secondaryLabel}
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          <div
            className={`rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7 ${
              panelScrollable
                ? "lg:max-h-[calc(100vh-9.5rem)] lg:overflow-y-auto lg:pr-5"
                : ""
            }`}
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
