"use client";

import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useMemo, useRef } from "react";
import {
  gameXYToLatLng,
  imageBoundsLatLng,
  latLngToGameXY,
  mapConfig,
} from "@/lib/mapConfig";
import { CATEGORY_BY_KEY, type CategoryKey } from "@/lib/categories";
import { useMapStore } from "@/lib/store";
import { decodeHash, encodeHash } from "@/lib/hashState";
import type { MarkerFeature } from "@/types";
import MiniMap from "@/components/MiniMap";
import MeasureLayer from "@/components/MeasureLayer";

// =================================================================
// Controllers — each is a small component that mounts inside the map
// =================================================================

function FlyToController() {
  const map = useMap();
  const flyTo = useMapStore((s) => s.flyTo);
  useEffect(() => {
    if (!flyTo) return;
    const latlng = gameXYToLatLng(flyTo.xy);
    const targetZoom = Math.max(map.getZoom(), mapConfig.maxZoom - 1);
    map.flyTo(latlng, targetZoom, { duration: 0.9 });
  }, [flyTo, map]);
  return null;
}

function ResetViewController() {
  const map = useMap();
  const token = useMapStore((s) => s.resetViewToken);
  useEffect(() => {
    if (token === 0) return;
    map.flyTo(gameXYToLatLng(mapConfig.initialCenter), mapConfig.initialZoom, {
      duration: 0.9,
    });
  }, [token, map]);
  return null;
}

function MapEventTracker() {
  const map = useMap();
  const setCursor = useMapStore((s) => s.setCursorXY);
  const setZoom = useMapStore((s) => s.setZoomLevel);

  useEffect(() => {
    setZoom(map.getZoom());
  }, [map, setZoom]);

  useMapEvents({
    mousemove: (e) => setCursor(latLngToGameXY(e.latlng)),
    mouseout: () => setCursor(null),
    click: (e) => {
      // touch devices report click on tap — use it to update HUD too
      setCursor(latLngToGameXY(e.latlng));
    },
    zoom: () => setZoom(map.getZoom()),
    zoomend: () => setZoom(map.getZoom()),
  });
  return null;
}

function ScaleControl() {
  const map = useMap();
  const show = useMapStore((s) => s.showScale);
  useEffect(() => {
    if (!show) return;
    const ctrl = L.control
      .scale({ position: "bottomleft", imperial: false, maxWidth: 160 })
      .addTo(map);
    return () => {
      ctrl.remove();
    };
  }, [show, map]);
  return null;
}

function GridOverlay() {
  const map = useMap();
  const show = useMapStore((s) => s.showGrid);
  useEffect(() => {
    if (!show) return;
    const STEP = 1024; // game pixels per gridline
    const lines: L.Layer[] = [];
    const opts: L.PolylineOptions = {
      color: "#19f0d0",
      opacity: 0.25,
      weight: 1,
      interactive: false,
    };
    for (let x = 0; x <= mapConfig.mapWidth; x += STEP) {
      lines.push(
        L.polyline(
          [gameXYToLatLng([x, 0]), gameXYToLatLng([x, mapConfig.mapHeight])],
          opts
        )
      );
    }
    for (let y = 0; y <= mapConfig.mapHeight; y += STEP) {
      lines.push(
        L.polyline(
          [gameXYToLatLng([0, y]), gameXYToLatLng([mapConfig.mapWidth, y])],
          opts
        )
      );
    }
    const group = L.layerGroup(lines).addTo(map);
    return () => {
      group.remove();
    };
  }, [show, map]);
  return null;
}

function makeMarkerIcon(
  color: string,
  glyph: string,
  found: boolean,
  selected: boolean,
  opacity: number
) {
  const dot = `<div class="vice-marker${found ? " is-found" : ""}" style="background:${color};color:${color};opacity:${opacity}">${glyph}</div>`;
  const ring = selected ? `<div class="vice-selected-ring"></div>` : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative">${dot}${ring}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

type ClusterMarker = L.Marker & { _viceCategory?: CategoryKey };

/** Imperative marker cluster layer. Re-creates on dependency change. */
function ClusterLayer({
  features,
  measureMode,
}: {
  features: MarkerFeature[];
  measureMode: boolean;
}) {
  const map = useMap();
  const selectedId = useMapStore((s) => s.selectedId);
  const setSelected = useMapStore((s) => s.setSelected);
  const found = useMapStore((s) => s.found);
  const opacity = useMapStore((s) => s.opacity);

  useEffect(() => {
    // While measuring, hide the cluster so clicks don't get swallowed.
    if (measureMode) return;

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: (zoom) => Math.max(20, 70 - zoom * 10),
      disableClusteringAtZoom: mapConfig.maxZoom,
      iconCreateFunction: (c) => {
        const markers = c.getAllChildMarkers() as ClusterMarker[];
        const counts: Partial<Record<CategoryKey, number>> = {};
        for (const m of markers) {
          const k = m._viceCategory;
          if (k) counts[k] = (counts[k] ?? 0) + 1;
        }
        const dominant = (Object.keys(counts) as CategoryKey[]).sort(
          (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)
        )[0];
        const color = dominant
          ? CATEGORY_BY_KEY[dominant]?.color ?? "#ff2bd6"
          : "#ff2bd6";
        const total = markers.length;
        const size = total < 10 ? 36 : total < 50 ? 44 : 52;
        return L.divIcon({
          html: `<div class="vice-cluster" style="background:${color};color:${color};width:${size}px;height:${size}px;font-size:${Math.min(16, 10 + Math.log10(total) * 4)}px"><span style="color:#0a0414">${total}</span></div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    for (const f of features) {
      const cat = CATEGORY_BY_KEY[f.properties.category];
      const isFound = !!found[f.properties.id];
      const isSelected = selectedId === f.properties.id;
      const m: ClusterMarker = L.marker(
        gameXYToLatLng(f.geometry.coordinates),
        {
          icon: makeMarkerIcon(
            cat.color,
            cat.glyph,
            isFound,
            isSelected,
            opacity
          ),
          riseOnHover: true,
        }
      );
      m._viceCategory = f.properties.category;
      m.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelected(f.properties.id);
      });
      cluster.addLayer(m);
    }

    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [features, found, selectedId, opacity, measureMode, map, setSelected]);

  return null;
}

function HashSync() {
  const map = useMap();
  const selectedId = useMapStore((s) => s.selectedId);
  const setSelected = useMapStore((s) => s.setSelected);
  const writeTimerRef = useRef<number | null>(null);

  // On mount: restore from URL hash
  useEffect(() => {
    const h = decodeHash(window.location.hash);
    if (h.x != null && h.y != null) {
      const ll = gameXYToLatLng([h.x, h.y]);
      const z = h.z ?? map.getZoom();
      map.setView(ll, z, { animate: false });
    }
    if (h.m) setSelected(h.m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write hash on view changes
  function writeHash() {
    if (writeTimerRef.current) window.clearTimeout(writeTimerRef.current);
    writeTimerRef.current = window.setTimeout(() => {
      const c = map.getCenter();
      const xy = latLngToGameXY(c);
      const next = encodeHash({
        z: map.getZoom(),
        x: xy[0],
        y: xy[1],
        m: selectedId,
      });
      if (next !== window.location.hash) {
        history.replaceState(null, "", `${window.location.pathname}${next}`);
      }
    }, 300);
  }

  useMapEvents({ moveend: writeHash, zoomend: writeHash });

  useEffect(() => {
    writeHash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return null;
}

// =================================================================
// Main component
// =================================================================

export default function Map({ features }: { features: MarkerFeature[] }) {
  const measureMode = useMapStore((s) => s.measureMode);

  const bounds = useMemo(() => imageBoundsLatLng(), []);
  const initialCenter = useMemo(
    () => gameXYToLatLng(mapConfig.initialCenter),
    []
  );

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      maxBounds={bounds}
      maxBoundsViscosity={1}
      minZoom={mapConfig.minZoom}
      maxZoom={mapConfig.maxZoom}
      zoom={mapConfig.initialZoom}
      center={initialCenter}
      zoomControl={true}
      attributionControl={true}
      zoomSnap={0.5}
      zoomDelta={0.5}
      wheelDebounceTime={20}
      inertia={true}
      inertiaDeceleration={2400}
      className="h-full w-full"
    >
      <TileLayer
        url={mapConfig.tileUrl}
        tileSize={mapConfig.tileSize}
        noWrap={true}
        bounds={bounds}
        attribution={mapConfig.attribution}
        keepBuffer={4}
      />

      <ClusterLayer features={features} measureMode={measureMode} />
      <GridOverlay />
      <ScaleControl />
      <FlyToController />
      <ResetViewController />
      <MapEventTracker />
      <MeasureLayer />
      <MiniMap />
      <HashSync />
    </MapContainer>
  );
}
