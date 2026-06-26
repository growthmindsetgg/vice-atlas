import Link from "next/link";
import type { Metadata } from "next";
import InlineCapture from "@/components/InlineCapture";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "GTA 6 Interactive Map — Vice City Atlas",
  description:
    "The complete GTA 6 interactive map. Track collectibles, businesses, stunt jumps, gang hideouts, and easter eggs across Vice City. Free, mobile-friendly, no login required.",
  path: "/gta-6-map",
  keywords: [
    "GTA 6 map",
    "GTA 6 interactive map",
    "GTA VI map",
    "Vice City map",
    "GTA 6 world map",
  ],
});

export default function Page() {
  return (
    <article className="prose-vice">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "GTA 6 Interactive Map — Vice City Atlas",
          description: (metadata.description as string) ?? "",
          mainEntityOfPage: absoluteUrl("/gta-6-map"),
          author: { "@type": "Organization", name: "Vice Atlas" },
        }}
      />

      <p className="text-[11px] tracking-[0.3em] uppercase text-neon-pink font-display">
        Guide · The Map
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 leading-tight bg-gradient-to-r from-neon-pink via-neon-magenta to-neon-teal bg-clip-text text-transparent">
        The GTA 6 Interactive Map
      </h1>
      <p className="mt-4 text-lg text-purple-100/90 leading-relaxed">
        Vice Atlas is the complete, fan-made interactive map of GTA 6. Pan and
        zoom across Vice City, filter by category, search by name, and tick off
        what you've found — your progress saves automatically.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-neon-pink to-neon-magenta text-night-950 font-display font-bold text-sm tracking-wider px-5 py-2.5 hover:brightness-110"
        >
          Open the map →
        </Link>
        <Link
          href="/gta-6-collectibles"
          className="inline-flex items-center gap-1.5 rounded-full border border-neon-teal/50 text-neon-teal text-sm font-display font-bold tracking-wider px-5 py-2.5 hover:bg-night-800"
        >
          Browse collectibles
        </Link>
      </div>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        What's on the map
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Five categories of marker, each toggleable from the sidebar. Switch
        layers off when you're focused on one type of collectible, or keep
        them all on to plan a route that hits everything in a single drive.
      </p>
      <ul className="mt-4 space-y-2 text-purple-100/90">
        <li>
          <strong className="text-neon-yellow">Collectibles</strong> — hidden
          packages, trophies, and pickup items scattered across the map.
        </li>
        <li>
          <strong className="text-neon-teal">Businesses</strong> — asset
          properties, fronts, and money-generating buildings you can acquire.
        </li>
        <li>
          <strong className="text-neon-pink">Stunt jumps</strong> — unique
          ramps and gaps with their best approach speeds.
        </li>
        <li>
          <strong className="text-neon-purple">Gang locations</strong> — rival
          turf, hideouts, and high-risk encounters.
        </li>
        <li>
          <strong className="text-neon-cyan">Easter eggs</strong> — references,
          jokes, and developer secrets the community has unearthed.
        </li>
      </ul>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        Why we built it
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Every major GTA release ends up with dozens of competing trackers, most
        of them buried under ads or trapped behind logins. We wanted a single,
        fast map that just works — open it on your phone next to the TV, tap a
        marker to read about the pickup, check it off, done. No accounts to
        create. No checklists to print. Your progress lives in your browser
        and stays there.
      </p>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        We add new markers as the community discovers them. If you want a
        heads-up when a new wave of secrets goes live, drop your email below.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        How it works
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        The whole experience is one page. Tap a marker to open its popup — name,
        a short description, and a "Mark as found" checkbox. The sidebar shows
        how close you are to 100% in each category, and a search box at the
        top flies the camera to any marker by name. On mobile, the sidebar
        slides over from the left; pinch-zoom works exactly as you'd expect.
      </p>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Want to hide the markers you've already grabbed? That's part of
        Premium. Everything else is free, forever.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        Keep exploring
      </h2>
      <ul className="mt-3 space-y-2 text-purple-100/90">
        <li>
          <Link
            href="/gta-6-collectibles"
            className="text-neon-pink hover:underline"
          >
            Every GTA 6 collectible, by type →
          </Link>
        </li>
        <li>
          <Link
            href="/gta-6-locations"
            className="text-neon-pink hover:underline"
          >
            Key locations, businesses, and gang spots →
          </Link>
        </li>
        <li>
          <Link href="/" className="text-neon-pink hover:underline">
            Open the live map →
          </Link>
        </li>
      </ul>

      <div className="mt-12">
        <InlineCapture source="guide-map" />
      </div>
    </article>
  );
}
