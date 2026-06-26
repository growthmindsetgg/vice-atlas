import Link from "next/link";
import type { Metadata } from "next";
import InlineCapture from "@/components/InlineCapture";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "GTA 6 Collectibles — Full Map + Checklist",
  description:
    "Every GTA 6 collectible plotted on an interactive map. Hidden packages, trophies, pickups, and post-launch secrets — with descriptions, locations, and check-off progress tracking.",
  path: "/gta-6-collectibles",
  keywords: [
    "GTA 6 collectibles",
    "GTA 6 hidden packages",
    "GTA 6 100% checklist",
    "GTA VI collectibles map",
    "GTA 6 trophies",
  ],
});

export default function Page() {
  return (
    <article className="prose-vice">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "GTA 6 Collectibles — Full Map + Checklist",
          description: (metadata.description as string) ?? "",
          mainEntityOfPage: absoluteUrl("/gta-6-collectibles"),
          author: { "@type": "Organization", name: "Vice Atlas" },
        }}
      />

      <p className="text-[11px] tracking-[0.3em] uppercase text-neon-yellow font-display">
        Guide · Collectibles
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 leading-tight bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-magenta bg-clip-text text-transparent">
        Every GTA 6 collectible, mapped
      </h1>
      <p className="mt-4 text-lg text-purple-100/90 leading-relaxed">
        Hidden packages, trophies, photo subjects, and every other pickup —
        plotted on the same interactive map, with descriptions and a checkbox
        on each one. The category is on by default; toggle the others off if
        you only want to chase 100% on collectibles.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-neon-yellow to-neon-pink text-night-950 font-display font-bold text-sm tracking-wider px-5 py-2.5 hover:brightness-110"
        >
          Open the collectibles map →
        </Link>
      </div>

      <h2 className="font-display text-2xl mt-12 text-neon-yellow">
        Types of collectible
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Rockstar's collectible structure tends to repeat from one GTA to the
        next. We track every type the game has confirmed, plus community-
        verified additions as patches drop:
      </p>
      <ul className="mt-4 space-y-2 text-purple-100/90">
        <li>
          <strong className="text-neon-yellow">Hidden packages</strong> — the
          classic pickup. Always in plain sight if you know which roof, dock,
          or alley to look in.
        </li>
        <li>
          <strong className="text-neon-yellow">Trophies</strong> — one-shot
          interactions. Some require a specific weapon, time of day, or in-game
          state.
        </li>
        <li>
          <strong className="text-neon-yellow">Photo subjects</strong> — snap
          the right thing from the right angle. The marker shows the camera
          location, not the subject.
        </li>
        <li>
          <strong className="text-neon-yellow">Time-limited items</strong> —
          tied to in-game events. We mark these clearly so you don't burn time
          chasing one that's been retired.
        </li>
      </ul>

      <h2 className="font-display text-2xl mt-12 text-neon-yellow">
        Using the map for 100%
      </h2>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Open the map, leave only the Collectibles layer on, and zoom in on the
        district you're working through. Each marker has a one-line hint
        describing how to grab the item — usually enough to find it without a
        video. Tick the checkbox in the popup and the marker dims so you can
        see what's still ahead.
      </p>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Want to hide everything you've already grabbed? That's a Premium
        feature — useful for the final 5%, when you're scanning the map for
        the last few markers and the rest are just noise. The basic map and
        the checkbox itself are free.
      </p>
      <p className="mt-3 text-purple-100/90 leading-relaxed">
        Progress lives in your browser's local storage. Clearing your browser
        data resets it; we'll add cross-device sync as part of the Premium
        plan.
      </p>

      <h2 className="font-display text-2xl mt-12 text-neon-yellow">
        Tips from completionists
      </h2>
      <ul className="mt-3 space-y-2 text-purple-100/90">
        <li>
          Do collectibles after the main story. Many areas are gated or
          dangerous earlier, and a few items don't spawn until certain missions
          complete.
        </li>
        <li>
          Bring a fast bike. Most pickups are placed near rooftops or
          oddly-angled surfaces — a bike makes the approach trivial.
        </li>
        <li>
          Use the search box. If a friend tells you to look at "the Malibu
          Club," type it in and the map will fly you straight there.
        </li>
      </ul>

      <h2 className="font-display text-2xl mt-12 text-neon-yellow">
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
            href="/gta-6-locations"
            className="text-neon-pink hover:underline"
          >
            Businesses, gang turf, and other locations →
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
          source="guide-collectibles"
          headline="Get every new collectible drop"
          subhead="We email a short summary every time a patch adds new pickups."
        />
      </div>
    </article>
  );
}
