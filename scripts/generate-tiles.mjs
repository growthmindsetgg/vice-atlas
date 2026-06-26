#!/usr/bin/env node
/**
 * Tile pyramid generator for Leaflet (L.CRS.Simple).
 *
 *   node scripts/generate-tiles.mjs --placeholder
 *       Synthesize a labeled grid pyramid (z0..z5) for development.
 *
 *   node scripts/generate-tiles.mjs path/to/map.png
 *       Slice a real source PNG into a tile pyramid. Source is resized to fit
 *       each zoom level (tilesPerSide * 256) then cut into 256x256 tiles.
 *
 *   --if-missing
 *       Skip if z0/0/0.png already exists (used by postinstall).
 *
 * Output: public/tiles/{z}/{x}/{y}.png
 *
 * Adjust MIN_ZOOM / MAX_ZOOM / TILE_SIZE to match lib/mapConfig.ts.
 */

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// These MUST match lib/mapConfig.ts.
const TILE_SIZE = 256;
const MIN_ZOOM = 0;
const MAX_ZOOM = 5;
const OUT_DIR = path.join(PROJECT_ROOT, "public", "tiles");

const args = process.argv.slice(2);
const isPlaceholder = args.includes("--placeholder");
const ifMissing = args.includes("--if-missing");
const sourcePath = args.find((a) => !a.startsWith("--"));

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function placeholderTileSVG(z, x, y) {
  // Hue shifts per zoom level so the user can see they're actually zooming.
  const hue = (z * 55) % 360;
  const accent = `hsl(${(hue + 180) % 360}, 90%, 65%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_SIZE}" height="${TILE_SIZE}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 75%, 18%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 30) % 360}, 75%, 7%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="0.5" y="0.5" width="${TILE_SIZE - 1}" height="${TILE_SIZE - 1}" fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="1"/>
  <line x1="0" y1="${TILE_SIZE / 2}" x2="${TILE_SIZE}" y2="${TILE_SIZE / 2}" stroke="${accent}" stroke-opacity="0.12"/>
  <line x1="${TILE_SIZE / 2}" y1="0" x2="${TILE_SIZE / 2}" y2="${TILE_SIZE}" stroke="${accent}" stroke-opacity="0.12"/>
  <text x="${TILE_SIZE / 2}" y="${TILE_SIZE / 2 - 8}" text-anchor="middle" font-family="monospace" font-weight="700" font-size="15" fill="${accent}">z${z}</text>
  <text x="${TILE_SIZE / 2}" y="${TILE_SIZE / 2 + 14}" text-anchor="middle" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.75)">${x},${y}</text>
</svg>`;
}

async function writePlaceholderTile(z, x, y) {
  const dir = path.join(OUT_DIR, String(z), String(x));
  await ensureDir(dir);
  const svg = placeholderTileSVG(z, x, y);
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(dir, `${y}.png`));
}

async function generatePlaceholder() {
  for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
    const n = 2 ** z;
    const jobs = [];
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        jobs.push(writePlaceholderTile(z, x, y));
      }
    }
    // Cap concurrency to avoid thrashing on Windows.
    const CONCURRENCY = 16;
    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
      await Promise.all(jobs.slice(i, i + CONCURRENCY));
    }
    console.log(`  z=${z}  ${n * n} tiles`);
  }
}

async function generateFromSource(src) {
  if (!(await exists(src))) {
    console.error(`Source image not found: ${src}`);
    process.exit(1);
  }
  console.log(`Source: ${src}`);
  console.log(`Tile pyramid: z=${MIN_ZOOM}..${MAX_ZOOM}, tile=${TILE_SIZE}px`);

  for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
    const n = 2 ** z;
    const dim = n * TILE_SIZE;
    console.log(`  z=${z}  rendering ${dim}x${dim}, cutting ${n * n} tiles…`);

    const resized = await sharp(src)
      .resize(dim, dim, { fit: "fill", kernel: "lanczos3" })
      .png()
      .toBuffer();

    const jobs = [];
    for (let x = 0; x < n; x++) {
      const dir = path.join(OUT_DIR, String(z), String(x));
      await ensureDir(dir);
      for (let y = 0; y < n; y++) {
        jobs.push(
          sharp(resized)
            .extract({
              left: x * TILE_SIZE,
              top: y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
            })
            .png({ compressionLevel: 9 })
            .toFile(path.join(dir, `${y}.png`))
        );
      }
    }
    const CONCURRENCY = 16;
    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
      await Promise.all(jobs.slice(i, i + CONCURRENCY));
    }
  }
}

async function main() {
  if (ifMissing && (await exists(path.join(OUT_DIR, "0", "0", "0.png")))) {
    console.log("Tiles already present, skipping (--if-missing).");
    return;
  }

  await ensureDir(OUT_DIR);

  if (sourcePath) {
    await generateFromSource(sourcePath);
  } else if (isPlaceholder) {
    console.log("Generating placeholder tile pyramid…");
    await generatePlaceholder();
  } else {
    console.error(
      "Usage: node scripts/generate-tiles.mjs [--placeholder] [path/to/source.png]"
    );
    process.exit(1);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
