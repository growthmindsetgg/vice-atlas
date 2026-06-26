"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { latLngToGameXY, gameXYToLatLng } from "@/lib/mapConfig";
import { useMapStore } from "@/lib/store";

function pointDistance(a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function format(px: number) {
  if (px < 1000) return `${px.toFixed(0)} px`;
  return `${(px / 1000).toFixed(2)} kpx`;
}

/**
 * Imperative measure-distance tool. When measureMode is on:
 *   - first click drops a start point
 *   - subsequent clicks extend the polyline
 *   - right-click / Esc / second toggle stops measuring
 * Distances are in game pixels (CRS.Simple maxZoom resolution).
 */
export default function MeasureLayer() {
  const map = useMap();
  const measureMode = useMapStore((s) => s.measureMode);
  const setMeasureMode = useMapStore((s) => s.setMeasureMode);
  const pointsRef = useRef<[number, number][]>([]);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!measureMode) return;

    const group = L.layerGroup().addTo(map);
    layerRef.current = group;
    pointsRef.current = [];
    const container = map.getContainer();
    container.classList.add("measure-mode");

    function redraw() {
      group.clearLayers();
      const pts = pointsRef.current;
      if (pts.length === 0) return;

      // Polyline
      const latlngs = pts.map((p) => gameXYToLatLng(p));
      L.polyline(latlngs, {
        color: "#19f0d0",
        weight: 2,
        dashArray: "6 4",
        opacity: 0.9,
      }).addTo(group);

      // Vertices
      pts.forEach((p, i) => {
        const ll = gameXYToLatLng(p);
        L.circleMarker(ll, {
          radius: 4,
          color: "#ff2bd6",
          fillColor: "#ff2bd6",
          fillOpacity: 1,
          weight: 2,
        }).addTo(group);

        if (i > 0) {
          const segLen = pointDistance(pts[i - 1], p);
          const totalLen = pts
            .slice(1, i + 1)
            .reduce(
              (acc, cur, idx) => acc + pointDistance(pts[idx], cur),
              0
            );
          const tip = L.divIcon({
            className: "",
            html: `<div class="measure-label">${format(segLen)} · Σ ${format(totalLen)}</div>`,
            iconSize: [1, 1],
            iconAnchor: [-8, 8],
          });
          L.marker(ll, { icon: tip, interactive: false }).addTo(group);
        }
      });
    }

    function onClick(e: L.LeafletMouseEvent) {
      pointsRef.current.push(latLngToGameXY(e.latlng));
      redraw();
    }

    function onContext(e: L.LeafletMouseEvent) {
      e.originalEvent.preventDefault();
      setMeasureMode(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMeasureMode(false);
    }

    map.on("click", onClick);
    map.on("contextmenu", onContext);
    document.addEventListener("keydown", onKey);

    return () => {
      map.off("click", onClick);
      map.off("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
      group.remove();
      container.classList.remove("measure-mode");
      layerRef.current = null;
      pointsRef.current = [];
    };
  }, [measureMode, map, setMeasureMode]);

  return null;
}
