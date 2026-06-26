# Vice Atlas — Interactive GTA 6 Map

A Next.js 14 (App Router) interactive map for GTA 6. Leaflet on
`L.CRS.Simple` (pixel coords, not lat/lng), togglable category layers, search,
progress tracking in `localStorage`, Beehiiv email capture, SEO landing pages,
and monetization stubs. Production-ready for Vercel.

```
npm install        # installs deps + generates placeholder tiles (postinstall)
npm run dev        # http://localhost:3000
```

That's it for first run.

---

## Routes

| Path                    | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `/`                     | The interactive map (home)               |
| `/gta-6-map`            | SEO guide — overview of the map          |
| `/gta-6-collectibles`   | SEO guide — collectibles deep-dive       |
| `/gta-6-locations`      | SEO guide — businesses / gangs / stunts  |
| `/api/subscribe`        | POST `{ email }` → Beehiiv subscription  |
| `/sitemap.xml`          | Auto-generated from `app/sitemap.ts`     |
| `/robots.txt`           | Auto-generated from `app/robots.ts`      |
| `/og.png`               | OpenGraph image (1200×630)               |
| `/tiles/{z}/{x}/{y}.png`| Map tile pyramid                         |

---

## Project shape

```
app/
  layout.tsx              # root metadata, JSON-LD, viewport
  page.tsx                # home — server component, loads markers
  globals.css             # Vice City neon theme
  sitemap.ts, robots.ts   # SEO infra
  icon.png, apple-icon.png# favicons (generated)
  (guides)/
    layout.tsx            # shared header/footer for SEO pages
    gta-6-map/page.tsx
    gta-6-collectibles/page.tsx
    gta-6-locations/page.tsx
  api/subscribe/route.ts  # Beehiiv subscription endpoint
components/
  AppShell.tsx            # client shell, lazy-loads Map (no SSR)
  Map.tsx                 # Leaflet MapContainer + markers + popups
  Sidebar.tsx             # category toggles, % complete, hide-found
  SearchBox.tsx           # filter input + fly-to dropdown
  JsonLd.tsx              # JSON-LD <script> emitter
  PremiumGate.tsx         # premium upsell wrapper
  AdSlot.tsx              # placeholder ad slot
  EmailCaptureModal.tsx   # delayed pop-up email capture
  InlineCapture.tsx       # in-page email capture block
lib/
  mapConfig.ts            # SINGLE source of truth for tiles/bounds/zoom
  categories.ts           # category keys + colors + glyphs
  loadMarkers.ts          # server-side reader for /data/markers/*.geojson
  store.ts                # zustand store, localStorage-persisted
  seo.ts                  # site URL, metadata helpers, JSON-LD shapes
types/index.ts            # MarkerFeature, MarkerCollection
data/markers/*.geojson    # one file per category
public/
  og.png                  # generated (committed)
  tiles/                  # generated (committed) — see deploy notes
scripts/
  generate-tiles.mjs      # placeholder + real-source tile builder
  generate-brand.mjs      # og.png + favicon + apple-icon
```

---

## Environment variables

See `.env.example`.

| Var                       | Where used                          | Required for prod | Notes                                                        |
| ------------------------- | ----------------------------------- | ----------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`    | layout, sitemap, robots, JSON-LD    | yes               | `https://yourdomain.tld`, no trailing slash                  |
| `BEEHIIV_API_KEY`         | `app/api/subscribe/route.ts`        | yes (to subscribe)| If missing, route returns `ok:true` but doesn't enqueue      |
| `BEEHIIV_PUBLICATION_ID`  | `app/api/subscribe/route.ts`        | yes (to subscribe)| Same fallback behavior                                       |

---

## Deploying to Vercel

1. **Push the repo to GitHub.** (Or any git host Vercel can read.)
2. **Import the project on Vercel.** Framework preset auto-detects as Next.js.
3. **Set the env vars** (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL` — your production origin (e.g. `https://viceatlas.gg`)
   - `BEEHIIV_API_KEY` — from Beehiiv → Integrations → API
   - `BEEHIIV_PUBLICATION_ID` — Beehiiv Publication settings
4. **First deploy.** The build script will install deps; the `postinstall`
   tile generator no-ops because tiles are committed. `vercel.json` adds
   immutable `Cache-Control` headers for `/tiles/*` and `/og.png`.
5. **Bind a domain** (Project → Domains). Update `NEXT_PUBLIC_SITE_URL` to
   match and redeploy so canonicals/OG resolve correctly.
6. **Submit the sitemap** to Google Search Console: `https://<domain>/sitemap.xml`.

That's the whole prod path. No custom build command, no extra config.

---

## Swapping in the real map

There's exactly **one** place to edit when you swap the tile source: `lib/mapConfig.ts`.

```ts
export const mapConfig: MapConfig = {
  tileUrl: "/tiles/{z}/{x}/{y}.png",
  tileRoot: "public/tiles",
  mapWidth: 16384,        // <- your source width in px
  mapHeight: 16384,       // <- your source height in px
  tileSize: 256,
  minZoom: 0,
  maxZoom: 6,             // <- 2^maxZoom * tileSize must equal mapWidth
  initialZoom: 3,
  initialCenter: [8192, 8192],
  attribution: "Map © …",
  displayName: "…",
};
```

Then mirror `MIN_ZOOM` / `MAX_ZOOM` / `TILE_SIZE` at the top of
`scripts/generate-tiles.mjs`, drop your source PNG somewhere (e.g.
`art/map-source.png`), and run:

```
rm -rf public/tiles
npm run tiles:generate -- art/map-source.png
git add public/tiles && git commit -m "Real map tiles"
```

The pyramid is committed so Vercel's CDN can serve it cold without
regenerating. Each tile is set to `Cache-Control: max-age=31536000, immutable`
by `vercel.json`, so changes to a tile require either a new path or a CDN purge.

---

## Adding / editing markers

- Markers live in `/data/markers/{category}.geojson` — one file per category.
- Coordinates are `[x, y]` in **source-image pixels at `maxZoom`**.
- `properties.id` must be globally unique (used as the progress key).
- `properties.category` must match the filename (and one of the keys in
  `lib/categories.ts`).
- Add a new category by adding an entry to `CATEGORIES` in
  `lib/categories.ts` AND creating `/data/markers/{key}.geojson`.

---

## Regenerating brand assets

OG image, favicon, and apple-icon are produced by `scripts/generate-brand.mjs`.
Edit the SVG templates inside and re-run:

```
npm run brand:generate
```

---

## Monetization (currently stubbed)

| Component              | Where it shows                       | What to swap                                                    |
| ---------------------- | ------------------------------------ | --------------------------------------------------------------- |
| `PremiumGate.tsx`      | Wraps "hide found", future exports   | Replace stub `setPremium(true)` with Stripe/lemonsqueezy flow   |
| `AdSlot.tsx`           | Sidebar bottom + desktop top-bar     | Insert ad-network embed inside the wrapper                      |
| `EmailCaptureModal.tsx`| Auto-shows ~12s after first visit    | Already wired to `/api/subscribe`                               |
| `InlineCapture.tsx`    | Each guide page                      | Already wired to `/api/subscribe`                               |

---

## Tech

- Next.js 14.2 (App Router, React Server Components, static prerender)
- Tailwind CSS 3.4
- Leaflet 1.9 / react-leaflet 4.2 (client-only, dynamic import)
- Zustand 4.5 with `persist` middleware → `localStorage`
- Sharp 0.33 for tile + brand asset generation
- TypeScript 5.5
