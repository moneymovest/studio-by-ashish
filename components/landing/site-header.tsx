import Link from "next/link";

const navItems = [
  { label: "Explore professionals", href: "/professionals" },
  { label: "Join as a pro", href: "/join" },
  { label: "How it works", href: "#how-it-works" },
];

export function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-white/10 py-5">
      <Link href="/" className="group inline-flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold tracking-[0.35em] text-white shadow-[0_0_40px_rgba(56,189,248,0.12)] backdrop-blur-xl transition duration-300 group-hover:border-cyan-300/30 group-hover:bg-cyan-300/10">
          F
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-medium tracking-[0.22em] text-white/90">
            FRAMEBOOK
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            creative studio network
          </p>
        </div>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-sm text-white/60 transition hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <Link
        href="/professionals"
        className="inline-flex h-11 items-center rounded-full border border-white/12 bg-white/6 px-5 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
      >
        Start exploring
      </Link>
    </header>
  );
}
