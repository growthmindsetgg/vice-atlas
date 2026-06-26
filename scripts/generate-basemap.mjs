#!/usr/bin/env node
/**
 * Original Leonida-inspired basemap generator.
 *
 * Produces an SVG of a fictional Vice-City-inspired landmass at the canvas
 * size declared in lib/mapConfig.ts, renders it to a PNG, then chains
 * scripts/generate-tiles.mjs to slice it into a z0..z5 tile pyramid.
 *
 *   node scripts/generate-basemap.mjs
 *
 * Output:
 *   art/basemap.svg          — vector source (committable for diffing)
 *   art/basemap.png          — raster source for tiles
 *   public/tiles/{z}/{x}/{y}.png — pyramid (overwrites whatever was there)
 *
 * The art is procedural and deterministic (seeded PRNG) — re-running yields
 * the same output. Edit the geometry below to change districts/roads/coast.
 *
 * IMPORTANT: do NOT copy any existing GTA/community map. All polygons here
 * are hand-authored for this project.
 */

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// MUST match lib/mapConfig.ts mapWidth/mapHeight.
const SIZE = 8192;

// ---------- Palette ----------
// Vice City neon-noir: deep teal oceans, warm-purple land, magenta + cyan
// road accents. Keep it readable at z=0..5 — saturation matters more than
// contrast.
const C = {
  oceanDeep: "#062436",
  oceanMid: "#0a4a64",
  oceanShallow: "#137a8a",
  oceanFoam: "rgba(25,240,208,0.18)",

  beachHalo: "#3d2a55",

  landBase: "#1a1132",
  suburbs: "#241541",
  downtown: "#3c1f5e",
  beach: "#4d2a66",
  airport: "#170b28",
  parkBase: "#1c3528",
  parkLight: "#264a35",
  docks: "#221a3d",

  building: "#5a2a7c",
  buildingDark: "#3a1b58",

  roadMain: "#ff45a6",
  roadGlow: "#ffe156",
  roadMinor: "#19f0d0",
  runway: "#0a0414",

  text: "#19f0d0",
  textDim: "#7a5aa3",
};

// ---------- Deterministic PRNG ----------
function mulberry(seed) {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry(424242);
const jitter = (x, y, amt = 60) => [
  x + (rnd() - 0.5) * 2 * amt,
  y + (rnd() - 0.5) * 2 * amt,
];

// ---------- Smooth path builder (Catmull-Rom via Q midpoints) ----------
function smoothClosed(pts) {
  if (pts.length < 3) return "";
  const startX = (pts[0][0] + pts[1][0]) / 2;
  const startY = (pts[0][1] + pts[1][1]) / 2;
  let d = `M ${startX.toFixed(0)} ${startY.toFixed(0)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const mx = (x + nx) / 2;
    const my = (y + ny) / 2;
    d += ` Q ${x.toFixed(0)} ${y.toFixed(0)} ${mx.toFixed(0)} ${my.toFixed(0)}`;
  }
  const last = pts[pts.length - 1];
  d += ` Q ${last[0].toFixed(0)} ${last[1].toFixed(0)} ${startX.toFixed(0)} ${startY.toFixed(0)} Z`;
  return d;
}

// Offset a closed polygon outward (positive) or inward (negative) from its centroid.
function offsetFromCentroid(pts, dist) {
  let cx = 0,
    cy = 0;
  for (const [x, y] of pts) {
    cx += x;
    cy += y;
  }
  cx /= pts.length;
  cy /= pts.length;
  return pts.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const f = (len + dist) / len;
    return [cx + dx * f, cy + dy * f];
  });
}

// ---------- Main island coastline ----------
// Clockwise from the NW. Each anchor is jittered for organic feel.
const mainAnchors = (() => {
  const pts = [];
  // North coast
  for (let i = 0; i < 9; i++) {
    pts.push(
      jitter(800 + i * 800, 600 + Math.sin(i * 0.7) * 70 + i * 10, 70)
    );
  }
  // E coast going south
  for (let i = 1; i < 7; i++) {
    pts.push(jitter(7700 - Math.sin(i * 0.6) * 200, 600 + i * 720, 90));
  }
  // S coast, east half
  pts.push(jitter(7000, 5300, 60));
  pts.push(jitter(6300, 5400, 60));
  pts.push(jitter(5500, 5350, 60));
  // Inlet (water bites north into the land)
  pts.push(jitter(5050, 5300, 30));
  pts.push(jitter(4880, 5650, 30));
  pts.push(jitter(4700, 5780, 20));
  pts.push(jitter(4520, 5400, 30));
  pts.push(jitter(4350, 5340, 30));
  // S coast, west half
  pts.push(jitter(3500, 5460, 60));
  pts.push(jitter(2700, 5520, 60));
  pts.push(jitter(2000, 5420, 60));
  pts.push(jitter(1300, 5200, 70));
  // W coast going back north
  for (let i = 4; i >= 0; i--) {
    pts.push(jitter(700 - Math.sin(i * 0.5) * 80, 800 + i * 1000, 60));
  }
  return pts;
})();

// ---------- Southern keys (small islands) ----------
const keys = [
  { cx: 1600, cy: 6800, r: 320, label: "PELICAN KEY" },
  { cx: 3200, cy: 7100, r: 460, label: "PALM KEY" },
  { cx: 4800, cy: 6900, r: 300, label: null },
  { cx: 6300, cy: 7000, r: 400, label: "SUNSET KEY" },
  { cx: 7400, cy: 7300, r: 220, label: null },
];

function islandShape(cx, cy, r, seed) {
  const r2 = mulberry(seed);
  const pts = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.82 + r2() * 0.35);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

// ---------- Districts ----------
const districts = {
  airport: [
    [900, 1700],
    [1300, 1480],
    [2500, 1450],
    [2820, 1700],
    [2750, 2400],
    [2600, 2900],
    [2300, 3000],
    [1200, 2950],
    [880, 2700],
    [880, 1900],
  ],
  park: [
    [2900, 700],
    [3300, 580],
    [4400, 620],
    [4650, 980],
    [4500, 1700],
    [4250, 2200],
    [3300, 2250],
    [2900, 2000],
    [2820, 1300],
  ],
  downtown: [
    [4700, 700],
    [5500, 620],
    [6500, 660],
    [7100, 920],
    [7250, 1700],
    [7100, 2400],
    [6700, 2650],
    [5500, 2700],
    [4750, 2400],
    [4650, 1500],
  ],
  beach: [
    [7180, 1100],
    [7480, 1340],
    [7420, 3200],
    [7280, 4300],
    [6980, 4400],
    [6920, 3000],
    [7030, 2200],
  ],
  suburbs: [
    [1100, 3200],
    [2000, 3050],
    [3200, 3100],
    [3700, 3400],
    [4250, 3850],
    [4500, 4500],
    [4300, 5100],
    [3500, 5320],
    [2400, 5340],
    [1500, 5050],
    [1100, 4500],
    [1000, 3700],
  ],
  docks: [
    [4900, 4880],
    [5800, 4920],
    [6500, 5020],
    [6680, 5280],
    [6300, 5400],
    [5500, 5400],
    [4900, 5340],
  ],
};

// ---------- Roads ----------
const roads = {
  highway: "M 750 3320 Q 2200 3220 4000 3400 T 7300 3260",
  westArtery: "M 1500 1900 L 1520 3050 L 1850 4400 L 2500 5100",
  eastArtery: "M 6800 980 L 7000 1900 L 6900 3400 L 6400 4900",
  beachStrip: "M 7250 1320 L 7150 4250",
  inlandLink: "M 3500 750 L 3300 2400 L 3000 3300 L 2700 4300 L 2800 5150",
  southBridge: "M 4500 5500 L 4400 5800 L 4400 6300",
  keyBridge: "M 3200 5650 L 3200 6600",
  // Downtown grid (axial)
  ...Object.fromEntries(
    [
      "M 4900 900 L 7000 900",
      "M 4900 1250 L 7100 1250",
      "M 4900 1600 L 7150 1600",
      "M 4900 1950 L 7100 1950",
      "M 4900 2300 L 7000 2300",
      "M 5300 720 L 5300 2500",
      "M 5700 700 L 5700 2600",
      "M 6100 700 L 6100 2600",
      "M 6500 720 L 6500 2620",
    ].map((d, i) => [`dt${i}`, d])
  ),
};

// ---------- SVG ----------
function buildSVG() {
  const out = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`
  );

  // -- Defs --
  out.push(`<defs>
    <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.oceanDeep}"/>
      <stop offset="55%" stop-color="${C.oceanMid}"/>
      <stop offset="100%" stop-color="${C.oceanShallow}"/>
    </linearGradient>
    <pattern id="dtGrid" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
      <rect width="240" height="240" fill="${C.downtown}"/>
      <rect x="22" y="22" width="86" height="86" fill="${C.building}" opacity="0.5"/>
      <rect x="128" y="20" width="92" height="98" fill="${C.building}" opacity="0.45"/>
      <rect x="22" y="135" width="98" height="86" fill="${C.building}" opacity="0.5"/>
      <rect x="138" y="138" width="84" height="82" fill="${C.building}" opacity="0.4"/>
    </pattern>
    <pattern id="suburbsTex" x="0" y="0" width="170" height="170" patternUnits="userSpaceOnUse">
      <rect width="170" height="170" fill="${C.suburbs}"/>
      <rect x="30" y="30" width="22" height="22" fill="${C.buildingDark}" opacity="0.55"/>
      <rect x="100" y="50" width="20" height="22" fill="${C.buildingDark}" opacity="0.5"/>
      <rect x="60" y="100" width="22" height="20" fill="${C.buildingDark}" opacity="0.55"/>
      <rect x="120" y="120" width="22" height="22" fill="${C.buildingDark}" opacity="0.5"/>
    </pattern>
    <pattern id="parkTex" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
      <rect width="160" height="160" fill="${C.parkBase}"/>
      <circle cx="40" cy="40" r="14" fill="${C.parkLight}"/>
      <circle cx="100" cy="60" r="18" fill="${C.parkLight}"/>
      <circle cx="60" cy="110" r="16" fill="${C.parkLight}"/>
      <circle cx="120" cy="120" r="14" fill="${C.parkLight}"/>
    </pattern>
    <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe156" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffe156" stop-opacity="0"/>
    </radialGradient>
  </defs>`);

  // -- Ocean --
  out.push(`<rect width="${SIZE}" height="${SIZE}" fill="url(#ocean)"/>`);
  // Subtle wave hints
  for (let y = 200; y < SIZE; y += 360) {
    out.push(
      `<path d="M 0 ${y} Q ${SIZE / 2} ${y - 24} ${SIZE} ${y}" stroke="${C.oceanFoam}" stroke-width="2" fill="none"/>`
    );
  }

  // -- South keys (smallest first so labels read above) --
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const halo = offsetFromCentroid(islandShape(k.cx, k.cy, k.r, i * 17), 60);
    out.push(`<path d="${smoothClosed(halo)}" fill="${C.oceanShallow}" opacity="0.55"/>`);
    const base = islandShape(k.cx, k.cy, k.r, i * 17);
    out.push(`<path d="${smoothClosed(base)}" fill="${C.landBase}"/>`);
    const inner = offsetFromCentroid(base, -30);
    out.push(`<path d="${smoothClosed(inner)}" fill="${C.suburbs}" opacity="0.7"/>`);
  }

  // -- Main island beach halo --
  out.push(
    `<path d="${smoothClosed(offsetFromCentroid(mainAnchors, 70))}" fill="${C.beachHalo}" opacity="0.55"/>`
  );
  // -- Main island base --
  out.push(`<path d="${smoothClosed(mainAnchors)}" fill="${C.landBase}"/>`);

  // -- Districts (z-order: suburbs first, then more specific ones on top) --
  out.push(`<path d="${smoothClosed(districts.suburbs)}" fill="url(#suburbsTex)"/>`);
  out.push(`<path d="${smoothClosed(districts.airport)}" fill="${C.airport}"/>`);
  // Runways
  out.push(`<rect x="960" y="1900" width="1780" height="42" fill="${C.runway}" opacity="0.85"/>`);
  out.push(`<rect x="1080" y="2480" width="1620" height="38" fill="${C.runway}" opacity="0.8"/>`);
  out.push(
    `<line x1="980" y1="1921" x2="2720" y2="1921" stroke="#ffe156" stroke-width="3" stroke-dasharray="22 22" opacity="0.55"/>`
  );
  out.push(
    `<line x1="1100" y1="2499" x2="2680" y2="2499" stroke="#ffe156" stroke-width="3" stroke-dasharray="22 22" opacity="0.45"/>`
  );

  out.push(`<path d="${smoothClosed(districts.park)}" fill="url(#parkTex)"/>`);
  out.push(`<path d="${smoothClosed(districts.downtown)}" fill="url(#dtGrid)"/>`);
  // Downtown glow
  out.push(
    `<ellipse cx="5950" cy="1650" rx="1300" ry="900" fill="url(#cityGlow)"/>`
  );

  out.push(`<path d="${smoothClosed(districts.beach)}" fill="${C.beach}"/>`);
  // Beach pier hints
  for (let y = 1500; y < 4200; y += 380) {
    out.push(
      `<rect x="7300" y="${y}" width="180" height="14" fill="${C.buildingDark}" opacity="0.55"/>`
    );
  }

  out.push(`<path d="${smoothClosed(districts.docks)}" fill="${C.docks}"/>`);
  // Dock warehouses
  for (let i = 0; i < 6; i++) {
    const x = 5000 + i * 250;
    out.push(
      `<rect x="${x}" y="4960" width="200" height="120" fill="${C.buildingDark}" opacity="0.7"/>`
    );
    out.push(
      `<rect x="${x}" y="5200" width="200" height="80" fill="${C.buildingDark}" opacity="0.6"/>`
    );
  }

  // -- Coastal road (inset from coastline) --
  const coastal = offsetFromCentroid(mainAnchors, -180);
  out.push(
    `<path d="${smoothClosed(coastal)}" stroke="${C.roadMinor}" stroke-width="14" fill="none" opacity="0.35"/>`
  );

  // -- Major roads (glow underlay + bright top) --
  for (const d of Object.values(roads)) {
    out.push(
      `<path d="${d}" stroke="${C.roadMain}" stroke-width="26" fill="none" opacity="0.6" stroke-linecap="round" stroke-linejoin="round"/>`
    );
    out.push(
      `<path d="${d}" stroke="${C.roadGlow}" stroke-width="6" fill="none" opacity="0.55" stroke-linecap="round" stroke-dasharray="44 32"/>`
    );
  }

  // -- City lights scattered in downtown --
  for (let i = 0; i < 140; i++) {
    const x = 4800 + rnd() * 2400;
    const y = 750 + rnd() * 1900;
    const r = 5 + rnd() * 6;
    out.push(
      `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#ffe156" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`
    );
  }
  // Sparser lights in suburbs
  for (let i = 0; i < 60; i++) {
    const x = 1300 + rnd() * 3200;
    const y = 3300 + rnd() * 1900;
    out.push(
      `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3" fill="#ff45a6" opacity="${(0.3 + rnd() * 0.4).toFixed(2)}"/>`
    );
  }

  // -- District labels (large, low opacity — readable when zoomed in) --
  const label = (x, y, t, size = 140, op = 0.16, rot = 0) =>
    `<text x="${x}" y="${y}" fill="${C.text}" font-family="Arial Black, sans-serif" font-size="${size}" font-weight="900" text-anchor="middle" opacity="${op}" letter-spacing="${Math.round(size * 0.08)}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ""}>${t}</text>`;

  out.push(label(5900, 1700, "DOWNTOWN", 180, 0.17));
  out.push(label(1820, 2380, "AIRPORT", 140));
  out.push(label(3700, 1480, "CORAL PARK", 130));
  out.push(label(2800, 4500, "SUBURBS", 160));
  out.push(label(7250, 2800, "BEACH STRIP", 100, 0.22, 90));
  out.push(label(5800, 5200, "DOCKS", 100, 0.2));

  // -- Key island labels --
  for (const k of keys) {
    if (!k.label) continue;
    out.push(
      `<text x="${k.cx}" y="${k.cy + 8}" fill="${C.textDim}" font-family="Arial, sans-serif" font-size="70" font-weight="700" text-anchor="middle" opacity="0.45" letter-spacing="7">${k.label}</text>`
    );
  }

  // -- "LEONIDA" plate, large, very faint, NW ocean --
  out.push(label(2100, 220, "LEONIDA", 90, 0.18));

  out.push("</svg>");
  return out.join("\n");
}

// ---------- Main ----------
async function main() {
  console.log("Generating Vice Atlas basemap…");
  const svg = buildSVG();

  const artDir = path.join(ROOT, "art");
  await fs.mkdir(artDir, { recursive: true });
  const svgPath = path.join(artDir, "basemap.svg");
  const pngPath = path.join(artDir, "basemap.png");

  await fs.writeFile(svgPath, svg);
  console.log(
    `  wrote ${path.relative(ROOT, svgPath)}  (${(svg.length / 1024).toFixed(0)} kB)`
  );

  console.log(`  rendering ${SIZE}x${SIZE} PNG (this can take a moment)…`);
  await sharp(Buffer.from(svg), { limitInputPixels: false })
    .resize(SIZE, SIZE, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log(`  wrote ${path.relative(ROOT, pngPath)}`);

  // Chain the existing tile generator. Keeps the one-line swap intact —
  // anyone can also call generate-tiles.mjs directly with another source.
  console.log("  slicing tile pyramid (this takes a minute)…");
  await new Promise((resolve, reject) => {
    const p = spawn(
      "node",
      ["scripts/generate-tiles.mjs", pngPath],
      { cwd: ROOT, stdio: "inherit" }
    );
    p.on("exit", (code) =>
      code === 0 ? resolve(null) : reject(new Error(`tile gen exit ${code}`))
    );
  });

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
