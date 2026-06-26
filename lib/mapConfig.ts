/**
 * Single source of truth for the map. Swap the entire tile source by editing
 * this object — no other file should hardcode dimensions, zoom, or tile paths.
 */

export type MapConfig = {
  /** Public URL template for tiles. {z}/{x}/{y} are filled in by Leaflet. */
  tileUrl: string;
  /** Path under /public to the tile pyramid root (used by the generator). */
  tileRoot: string;
  /** Native source-image width in pixels (at maxZoom). */
  mapWidth: number;
  /** Native source-image height in pixels (at maxZoom). */
  mapHeight: number;
  /** Tile side length in pixels. 256 is standard. */
  tileSize: number;
  /** Smallest zoom level rendered (zoomed out). */
  minZoom: number;
  /** Largest zoom level rendered (zoomed in / native pixels). */
  maxZoom: number;
  /** Initial zoom on first paint. */
  initialZoom: number;
  /** Initial center in GAME pixel coordinates [x, y] at maxZoom resolution. */
  initialCenter: [number, number];
  /** Attribution shown bottom-right. */
  attribution: string;
  /** Human-readable map name used in the header. */
  displayName: string;
};

export const mapConfig: MapConfig = {
  tileUrl: "/tiles/{z}/{x}/{y}.png",
  tileRoot: "public/tiles",
  mapWidth: 8192,
  mapHeight: 8192,
  tileSize: 256,
  minZoom: 0,
  maxZoom: 5,
  initialZoom: 2,
  initialCenter: [4096, 4096],
  attribution: "Map © Game Studio · Site by you",
  displayName: "Vice Atlas",
};

/**
 * Converts game pixel coordinates [x, y] at native (maxZoom) resolution into a
 * Leaflet [lat, lng] pair for L.CRS.Simple. No map instance required — uses
 * CRS.Simple's default transformation (1, 0, -1, 0), so y is flipped to lat.
 */
export function gameXYToLatLng(xy: [number, number]): [number, number] {
  const scale = Math.pow(2, mapConfig.maxZoom);
  const [x, y] = xy;
  return [-y / scale, x / scale];
}

/** Inverse of gameXYToLatLng — useful for click handlers and measure tools. */
export function latLngToGameXY(latlng: {
  lat: number;
  lng: number;
}): [number, number] {
  const scale = Math.pow(2, mapConfig.maxZoom);
  return [latlng.lng * scale, -latlng.lat * scale];
}

/** Static image bounds in LatLng space, used to constrain the map view. */
export function imageBoundsLatLng(): [[number, number], [number, number]] {
  const scale = Math.pow(2, mapConfig.maxZoom);
  return [
    [-mapConfig.mapHeight / scale, 0],
    [0, mapConfig.mapWidth / scale],
  ];
}
