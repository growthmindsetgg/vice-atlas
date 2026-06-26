"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import {
  gameXYToLatLng,
  imageBoundsLatLng,
  mapConfig,
} from "@/lib/mapConfig";
import { CATEGORY_BY_KEY } from "@/lib/categories";
import { useMapStore } from "@/lib/store";
import type { MarkerFeature } from "@/types";

type Props = {
  features: MarkerFeature[];
};

/** Subscribes to store.flyTo and pans/zooms the map when it changes. */
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

function makeIcon(color: string, glyph: string, found: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="vice-marker${found ? " is-found" : ""}" style="background:${color};color:${color}">${glyph}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  });
}

function MarkerPopupBody({ feature }: { feature: MarkerFeature }) {
  const found = useMapStore((s) => !!s.found[feature.properties.id]);
  const toggle = useMapStore((s) => s.toggleFound);
  const cat = CATEGORY_BY_KEY[feature.properties.category];

  return (
    <div className="min-w-[200px]">
      <div
        className="text-[10px] uppercase tracking-[0.18em] font-display"
        style={{ color: cat.color }}
      >
        {cat.label}
      </div>
      <div className="text-sm font-semibold text-white mt-0.5">
        {feature.properties.name}
      </div>
      {feature.properties.description && (
        <p className="text-[12px] text-purple-100/80 mt-1.5 leading-snug">
          {feature.properties.description}
        </p>
      )}
      <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={found}
          onChange={() => toggle(feature.properties.id)}
          className="accent-pink-500 w-4 h-4"
        />
        <span className="text-[12px] text-purple-100">
          {found ? "Found" : "Mark as found"}
        </span>
      </label>
    </div>
  );
}

export default function Map({ features }: Props) {
  const enabled = useMapStore((s) => s.enabled);
  const search = useMapStore((s) => s.search);
  const hideFound = useMapStore((s) => s.hideFound);
  const isPremium = useMapStore((s) => s.isPremium);
  const found = useMapStore((s) => s.found);

  const bounds = useMemo(() => imageBoundsLatLng(), []);
  const initialCenter = useMemo(
    () => gameXYToLatLng(mapConfig.initialCenter),
    []
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return features.filter((f) => {
      if (!enabled[f.properties.category]) return false;
      if (hideFound && isPremium && found[f.properties.id]) return false;
      if (q) {
        const hay = `${f.properties.name} ${f.properties.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [features, enabled, search, hideFound, isPremium, found]);

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
      className="h-full w-full"
    >
      <TileLayer
        url={mapConfig.tileUrl}
        tileSize={mapConfig.tileSize}
        noWrap={true}
        bounds={bounds}
        attribution={mapConfig.attribution}
      />

      <FlyToController />

      {visible.map((f) => {
        const cat = CATEGORY_BY_KEY[f.properties.category];
        const isFound = !!found[f.properties.id];
        return (
          <Marker
            key={f.properties.id}
            position={gameXYToLatLng(f.geometry.coordinates)}
            icon={makeIcon(cat.color, cat.glyph, isFound)}
          >
            <Popup>
              <MarkerPopupBody feature={f} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
