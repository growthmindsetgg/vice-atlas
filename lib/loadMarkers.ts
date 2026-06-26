import { promises as fs } from "node:fs";
import path from "node:path";
import { CATEGORIES } from "@/lib/categories";
import type { MarkerCollection, MarkerFeature } from "@/types";

/**
 * Server-only. Reads every /data/markers/*.geojson and returns one flat array
 * of features. Keeping this on the server lets the source of truth stay as raw
 * .geojson files without a custom webpack loader.
 */
export async function loadAllMarkers(): Promise<MarkerFeature[]> {
  const dir = path.join(process.cwd(), "data", "markers");
  const features: MarkerFeature[] = [];

  for (const cat of CATEGORIES) {
    const file = path.join(dir, `${cat.key}.geojson`);
    const raw = await fs.readFile(file, "utf-8");
    const fc = JSON.parse(raw) as MarkerCollection;
    for (const f of fc.features) features.push(f);
  }

  return features;
}
