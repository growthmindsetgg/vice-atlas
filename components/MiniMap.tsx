"use client";

import { useEffect, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { mapConfig } from "@/lib/mapConfig";
import { useMapStore } from "@/lib/store";

type Rect = { left: number; top: number; width: number; height: number };

const W = 180; // CSS px
const H = 180;

/**
 * Bottom-right inset minimap. Renders the world at z=0 as a single tile
 * (mapConfig.tileUrl with /0/0/0) and draws a rectangle showing the main map's
 * current viewport. Click to recenter.
 */
export default function MiniMap() {
  const map = useMap();
  const show = useMapStore((s) => s.showMinimap);
  const [rect, setRect] = useState<Rect>({
    left: 0,
    top: 0,
    width: W,
    height: H,
  });

  function refreshRect() {
    const b = map.getBounds();
    // Map total extent in latlng space (matches imageBoundsLatLng)
    const scale = Math.pow(2, mapConfig.maxZoom);
    const totalH = mapConfig.mapHeight / scale;
    const totalW = mapConfig.mapWidth / scale;

    // Visible bounds in latlng — note CRS.Simple lat axis is negative going down
    const north = Math.max(b.getNorth(), -totalH);
    const south = Math.max(b.getSouth(), -totalH);
    const west = Math.max(b.getWest(), 0);
    const east = Math.min(b.getEast(), totalW);

    const left = (west / totalW) * W;
    const right = (east / totalW) * W;
    // Lat: 0 at top, -totalH at bottom
    const top = (-north / totalH) * H;
    const bottom = (-south / totalH) * H;

    setRect({
      left: Math.max(0, Math.min(W, left)),
      top: Math.max(0, Math.min(H, top)),
      width: Math.max(4, Math.min(W, right - left)),
      height: Math.max(4, Math.min(H, bottom - top)),
    });
  }

  useEffect(() => {
    refreshRect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    move: refreshRect,
    zoom: refreshRect,
    resize: refreshRect,
  });

  if (!show) return null;

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height;
    const xy: [number, number] = [
      px * mapConfig.mapWidth,
      py * mapConfig.mapHeight,
    ];
    const scale = Math.pow(2, mapConfig.maxZoom);
    map.panTo([-xy[1] / scale, xy[0] / scale]);
  }

  // Background tile URL at z=0
  const bgUrl = mapConfig.tileUrl
    .replace("{z}", "0")
    .replace("{x}", "0")
    .replace("{y}", "0");

  return (
    <div
      onClick={onClick}
      className="absolute bottom-3 right-3 z-[600] cursor-crosshair rounded-md overflow-hidden border border-neon-purple/40 shadow-neon"
      style={{ width: W, height: H }}
      title="Minimap — click to recenter"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-night-950/30" />
      <div
        className="absolute border-2 border-neon-pink pointer-events-none"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          boxShadow:
            "0 0 8px rgba(255,43,214,0.7), inset 0 0 8px rgba(255,43,214,0.4)",
        }}
      />
      <div className="absolute top-1 left-1 font-display text-[9px] tracking-[0.2em] text-neon-teal bg-night-950/70 px-1.5 py-0.5 rounded">
        MINIMAP
      </div>
    </div>
  );
}
