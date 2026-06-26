/**
 * Category metadata — color, icon glyph, label. Keys MUST match the GeoJSON
 * filenames in /data/markers/{key}.geojson AND the `category` property inside
 * each Feature.
 */

export type CategoryKey =
  | "collectibles"
  | "businesses"
  | "stunt-jumps"
  | "gang-locations"
  | "easter-eggs";

export type CategoryMeta = {
  key: CategoryKey;
  label: string;
  /** Tailwind/HEX color for marker dot + sidebar accent. */
  color: string;
  /** Single-character glyph rendered inside the marker dot. */
  glyph: string;
  /** Short description shown under the label in the sidebar. */
  blurb: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "collectibles",
    label: "Collectibles",
    color: "#ffe156",
    glyph: "★",
    blurb: "Hidden packages & trophies",
  },
  {
    key: "businesses",
    label: "Businesses",
    color: "#19f0d0",
    glyph: "$",
    blurb: "Asset properties to acquire",
  },
  {
    key: "stunt-jumps",
    label: "Stunt Jumps",
    color: "#ff2bd6",
    glyph: "▲",
    blurb: "Unique jumps & ramps",
  },
  {
    key: "gang-locations",
    label: "Gang Locations",
    color: "#8a2be2",
    glyph: "✖",
    blurb: "Rival turf & hideouts",
  },
  {
    key: "easter-eggs",
    label: "Easter Eggs",
    color: "#00e5ff",
    glyph: "?",
    blurb: "Secrets & references",
  },
];

export const CATEGORY_BY_KEY: Record<CategoryKey, CategoryMeta> =
  CATEGORIES.reduce(
    (acc, c) => ({ ...acc, [c.key]: c }),
    {} as Record<CategoryKey, CategoryMeta>
  );
