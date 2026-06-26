"use client";

import { useMapStore } from "@/lib/store";
import { mapConfig } from "@/lib/mapConfig";

const fmt = (n: number) => n.toFixed(3);

/**
 * Bottom-left HUD: live game X/Y under cursor + current zoom.
 * On desktop, X/Y updates on mousemove; on touch devices it updates on tap
 * (handled inside Map.tsx by listening for both mousemove and click).
 */
export default function CoordHUD() {
  const xy = useMapStore((s) => s.cursorXY);
  const z = useMapStore((s) => s.zoomLevel);

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[600] flex flex-col gap-1 font-mono text-[11px]">
      <div className="px-2.5 py-1.5 rounded-md bg-night-950/80 backdrop-blur border border-neon-purple/30 text-purple-100 shadow-neon flex items-center gap-2">
        <span className="text-neon-teal">XY</span>
        <span className="tabular-nums text-white">
          {xy ? `${fmt(xy[0])}, ${fmt(xy[1])}` : "—"}
        </span>
      </div>
      <div className="px-2.5 py-1.5 rounded-md bg-night-950/80 backdrop-blur border border-neon-purple/30 text-purple-100 flex items-center gap-2">
        <span className="text-neon-pink">Z</span>
        <span className="tabular-nums text-white">
          {z.toFixed(1)}
        </span>
        <span className="text-purple-200/40">/ {mapConfig.maxZoom}</span>
      </div>
    </div>
  );
}
