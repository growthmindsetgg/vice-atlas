import Link from "next/link";
import type { ReactNode } from "react";
import InlineCapture from "@/components/InlineCapture";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

const NAV_LINKS = [
  { href: "/gta-6-map", label: "GTA 6 Map" },
  { href: "/gta-6-collectibles", label: "Collectibles" },
  { href: "/gta-6-locations", label: "Locations" },
];

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-vice-gradient text-white">
      <header className="border-b border-neon-purple/20 bg-night-950/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display font-bold text-lg leading-none flex items-center gap-2"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple text-night-950 text-sm font-black shadow-neon">
              ★
            </span>
            <span className="bg-gradient-to-r from-neon-pink via-neon-magenta to-neon-teal bg-clip-text text-transparent">
              {SITE_NAME}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-purple-100/80 hover:text-neon-teal transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-neon-pink to-neon-magenta text-night-950 font-display font-bold text-xs tracking-wider px-3.5 py-1.5 hover:brightness-110"
          >
            Open Map →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16">{children}</main>

      <footer className="border-t border-neon-purple/20 bg-night-950/60 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-10 grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="font-display text-[11px] tracking-[0.3em] text-neon-pink">
              {SITE_NAME.toUpperCase()}
            </div>
            <p className="font-display text-xl mt-1">{SITE_TAGLINE}</p>
            <p className="text-[13px] text-purple-200/70 mt-2 max-w-sm">
              Unofficial fan project. Not affiliated with Rockstar Games or
              Take-Two Interactive. All trademarks belong to their respective
              owners.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
              <Link href="/" className="text-neon-teal hover:underline">
                Map
              </Link>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-purple-100/70 hover:text-neon-teal"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <InlineCapture source="guide-footer" variant="compact" />
        </div>
      </footer>
    </div>
  );
}
