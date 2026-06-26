import Link from "next/link";
import type { Metadata } from "next";
import InlineCapture from "@/components/InlineCapture";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "GTA 6 Locations — Businesses, Gang Spots, Stunt Jumps",
  description:
    "Every major GTA 6 location pinned on one interactive map: businesses you can own, gang hideouts to clear, stunt jumps to land, and the easter eggs you'd never find on your own.",
  path: "/gta-6-locations",
  keywords: [
    "GTA 6 locations",
    "GTA 6 businesses",
    "GTA 6 gang locations",
    "GTA 6 stunt jumps",
    "GTA VI locations map",
  ],
});

export default function Page() {
  return (
    <article className="prose-vice">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "GTA 6 Locations — Businesses, Gang Spots, Stunt Jumps",
          description: (metadata.description as string) ?? "",
          mainEntityOfPage: absoluteUrl("/gta-6-locations"),
          author: { "@type": "Organization", name: "Vice Atlas" },
        }}
      />

      <p className="text-[11px] tracking-[0.3em] uppercase text-neon-cyan font-display">
        Guide · Locations
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 leading-tight bg-gradient-to-r from-neon-cyan via-neon-teal to-neon-purple bg-clip-text text-transparent">
        Key locations across GTA 6
      </h1>
      <p className="mt-4 text-lg text-purple-100/90 leading-relaxed">
        Beyond the story missions, Vice City is full of places worth visiting
        — businesses you can buy and run, gang strongholds with their own
        questlines, stunt jumps to chase, and easter eggs the community is
        still uncovering. Every one is on the map.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-teal text-night-950 font-display font-bold text-sm tracking-wider px-5 py-2.5 hover:brightness-110"
        >
          Open the locations map →
        </Link>
      </div>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        Businesses
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Asset properties are the long-term economy. Some are tied to the main
        story; others unlock through side content. Each business marker shows
        a short description of how you acquire it and what kind of return to
        expect. If you're early in the game and trying to plan a route, leave
        only the Businesses layer on and you'll see the full network at once.
      </p>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Examples on the map already: the Malibu Club nightclub asset, the
        Print Works counterfeiting front, Sunshine Autos (with its
        car-collection bounty), an ice-cream distribution front, and a coastal
        boatyard for smuggling work.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        Gang locations
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Gang spots are dangerous on purpose. Each marker calls out the gang,
        the threat level, and a short tip on how to approach — which way the
        guards face, whether there's a side entrance, what loadout makes the
        fight easy. Some are mission-relevant; others are just paydays once
        you outgrow the early-game.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        Stunt jumps
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        The most fun, least useful category. Each jump has a description of
        the approach: what vehicle, what speed, and which direction. We've
        seeded a handful and add more as the community confirms working ones —
        official lists are rarely complete on launch.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        Easter eggs
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Rockstar hides callbacks to previous games, internal jokes, and the
        occasional impossible-to-find object in every release. The
        Easter-Eggs layer is opinionated: we only pin items the community has
        verified more than once. If something on the map turns out to be
        wrong, please email us — addresses below.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        How to use this page with the map
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Open the map, turn off the categories you don't care about, and use the
        search box to fly the camera around. Mark spots as found as you visit
        them, and the sidebar will track your completion percentage by
        category. On mobile the sidebar swipes in from the left; pinch-zoom
        works exactly like the in-game minimap.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-teal">
        Keep exploring
      </h2>
      <ul className="mt-3 space-y-2 text-purple-100/90">
        <li>
          <Link href="/gta-6-map" className="text-neon-pink hover:underline">
            Tour of the full GTA 6 map →
          </Link>
        </li>
        <li>
          <Link
            href="/gta-6-collectibles"
            className="text-neon-pink hover:underline"
          >
            Every GTA 6 collectible →
          </Link>
        </li>
        <li>
          <Link href="/" className="text-neon-pink hover:underline">
            Open the live map →
          </Link>
        </li>
      </ul>

      <div className="mt-12">
        <InlineCapture
          source="guide-locations"
          headline="New locations as they're confirmed"
          subhead="One short email per patch. No spam, ever."
        />
      </div>
    </article>
  );
}
