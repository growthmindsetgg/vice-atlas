import type { CategoryKey } from "@/lib/categories";

/** GeoJSON Feature shape used across the app. Coords are [x, y] in game px. */
export type MarkerFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    category: CategoryKey;
    description?: string;
  };
};

export type MarkerCollection = {
  type: "FeatureCollection";
  features: MarkerFeature[];
};
