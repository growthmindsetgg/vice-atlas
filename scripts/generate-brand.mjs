#!/usr/bin/env node
/**
 * One-shot brand asset generator. Renders SVGs to PNG via sharp.
 *
 *   /public/og.png        1200x630  OpenGraph / Twitter card
 *   /app/icon.png         32x32     favicon
 *   /app/apple-icon.png   180x180   iOS home-screen icon
 *
 * Run:
 *   node scripts/generate-brand.mjs
 *   (or: npm run brand:generate)
 *
 * Re-run after editing the SVG templates below.
 */

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bgA" cx="20%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#ff2bd6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ff2bd6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bgB" cx="85%" cy="90%" r="55%">
      <stop offset="0%" stop-color="#19f0d0" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#19f0d0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff45a6"/>
      <stop offset="50%" stop-color="#ffe156"/>
      <stop offset="100%" stop-color="#19f0d0"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="#0a0414"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#bgA)"/>
  <rect width="1200" height="630" fill="url(#bgB)"/>

  <!-- Neon border -->
  <rect x="20" y="20" width="1160" height="590" rx="20" fill="none"
        stroke="rgba(255,43,214,0.4)" stroke-width="2"/>

  <!-- Pin in upper-right -->
  <g transform="translate(1010,150)" filter="url(#glow)">
    <path d="M 0 -50 C -30 -50 -50 -30 -50 0 C -50 30 0 90 0 90 C 0 90 50 30 50 0 C 50 -30 30 -50 0 -50 Z"
          fill="#ff2bd6"/>
    <circle cx="0" cy="0" r="14" fill="#0a0414"/>
  </g>

  <!-- Eyebrow -->
  <text x="80" y="240" font-family="Arial, sans-serif" font-size="28"
        font-weight="600" fill="#19f0d0" letter-spacing="8">
    INTERACTIVE GAME MAP
  </text>

  <!-- Title -->
  <text x="80" y="370" font-family="Arial Black, Arial, sans-serif"
        font-size="140" font-weight="900" fill="url(#titleGrad)"
        letter-spacing="-2" filter="url(#glow)">
    VICE ATLAS
  </text>

  <!-- Tagline -->
  <text x="80" y="440" font-family="Arial, sans-serif" font-size="34"
        font-weight="500" fill="#f4eaff" opacity="0.85">
    Collectibles · Businesses · Stunts · Secrets
  </text>

  <!-- Bottom strip -->
  <line x1="80" y1="540" x2="1120" y2="540" stroke="rgba(255,43,214,0.4)" stroke-width="1"/>
  <text x="80" y="580" font-family="Arial, sans-serif" font-size="22"
        font-weight="600" fill="#ff45a6" letter-spacing="3">
    GTA 6 INTERACTIVE MAP
  </text>
  <text x="1120" y="580" font-family="Arial, sans-serif" font-size="22"
        font-weight="500" fill="#19f0d0" text-anchor="end" letter-spacing="2">
    viceatlas.gg
  </text>
</svg>`;

function pinSVG(size, includeBg) {
  // Pin shape designed in a 100x100 viewBox; centered.
  const bg = includeBg
    ? `<rect width="100" height="100" rx="22" fill="#0a0414"/>
       <rect x="1" y="1" width="98" height="98" rx="22" fill="none" stroke="#ff2bd6" stroke-opacity="0.5" stroke-width="1.5"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="g" cx="50%" cy="35%" r="50%">
        <stop offset="0%" stop-color="#ffe156"/>
        <stop offset="60%" stop-color="#ff2bd6"/>
        <stop offset="100%" stop-color="#8a2be2"/>
      </radialGradient>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${bg}
    <g transform="translate(50,30)" filter="url(#glow)">
      <path d="M 0 -22 C -18 -22 -28 -10 -28 4 C -28 22 0 50 0 50 C 0 50 28 22 28 4 C 28 -10 18 -22 0 -22 Z"
            fill="url(#g)"/>
      <circle cx="0" cy="2" r="7" fill="#0a0414"/>
    </g>
  </svg>`;
}

async function writePng(svg, outPath, density = 300) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg), { density })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  wrote ${path.relative(PROJECT_ROOT, outPath)}`);
}

async function main() {
  console.log("Generating brand assets…");
  await writePng(OG_SVG, path.join(PROJECT_ROOT, "public", "og.png"), 144);
  await writePng(
    pinSVG(32, true),
    path.join(PROJECT_ROOT, "app", "icon.png"),
    400
  );
  await writePng(
    pinSVG(180, true),
    path.join(PROJECT_ROOT, "app", "apple-icon.png"),
    300
  );
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
