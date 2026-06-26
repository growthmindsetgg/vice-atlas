"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORY_BY_KEY } from "@/lib/categories";
import { useMapStore } from "@/lib/store";
import type { MarkerFeature } from "@/types";
import CompareSlider from "@/components/CompareSlider";

type Props = {
  features: MarkerFeature[];
};

export default function DetailPanel({ features }: Props) {
  const selectedId = useMapStore((s) => s.selectedId);
  const setSelected = useMapStore((s) => s.setSelected);
  const found = useMapStore((s) => s.found);
  const toggleFound = useMapStore((s) => s.toggleFound);
  const requestFlyTo = useMapStore((s) => s.requestFlyTo);
  const [copied, setCopied] = useState(false);

  const feature = useMemo(
    () => features.find((f) => f.properties.id === selectedId) ?? null,
    [features, selectedId]
  );

  // Close on Esc
  useEffect(() => {
    if (!feature) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [feature, setSelected]);

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const open = !!feature;
  const cat = feature ? CATEGORY_BY_KEY[feature.properties.category] : null;
  const isFound = feature ? !!found[feature.properties.id] : false;

  return (
    <aside
      className={`fixed top-0 right-0 bottom-0 z-[1300] w-full sm:w-96 bg-night-950/95 backdrop-blur-xl border-l border-neon-purple/40 shadow-neon transform transition-transform duration-300 ease-out flex flex-col ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      {feature && cat && (
        <>
          <header className="px-5 pt-5 pb-3 border-b border-neon-purple/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className="font-display text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </div>
                <h2 className="font-display text-xl font-bold mt-1 text-white leading-tight">
                  {feature.properties.name}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-purple-200/60 hover:text-white text-2xl leading-none p-1"
                aria-label="Close detail"
              >
                ×
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto thin-scroll px-5 py-4 space-y-4">
            {feature.properties.image && feature.properties.realImage ? (
              <CompareSlider
                beforeSrc={feature.properties.realImage}
                afterSrc={feature.properties.image}
                beforeLabel="Real life"
                afterLabel="In-game"
              />
            ) : feature.properties.image ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-neon-purple/30">
                <img
                  src={feature.properties.image}
                  alt={feature.properties.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg border border-dashed border-neon-purple/30 bg-night-900/40 flex items-center justify-center text-[11px] uppercase tracking-widest text-purple-200/40 font-display">
                No image yet
              </div>
            )}

            {feature.properties.description && (
              <p className="text-[13px] text-purple-100/90 leading-relaxed">
                {feature.properties.description}
              </p>
            )}

            <dl className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-md bg-night-900/50 border border-neon-purple/15 p-2.5">
                <dt className="text-[10px] uppercase tracking-widest text-purple-200/50">
                  Coordinates
                </dt>
                <dd className="font-mono text-white mt-0.5">
                  {feature.geometry.coordinates[0].toFixed(0)},{" "}
                  {feature.geometry.coordinates[1].toFixed(0)}
                </dd>
              </div>
              <div className="rounded-md bg-night-900/50 border border-neon-purple/15 p-2.5">
                <dt className="text-[10px] uppercase tracking-widest text-purple-200/50">
                  ID
                </dt>
                <dd className="font-mono text-white mt-0.5 truncate">
                  {feature.properties.id}
                </dd>
              </div>
            </dl>
          </div>

          <footer className="px-5 py-3 border-t border-neon-purple/20 flex items-center gap-2">
            <button
              onClick={() => toggleFound(feature.properties.id)}
              className={`flex-1 py-2 rounded-lg font-display text-[12px] tracking-widest font-bold transition-all ${
                isFound
                  ? "bg-neon-teal/15 text-neon-teal border border-neon-teal/40"
                  : "bg-gradient-to-r from-neon-pink to-neon-magenta text-night-950 hover:brightness-110"
              }`}
            >
              {isFound ? "✓ FOUND" : "MARK AS FOUND"}
            </button>
            <button
              onClick={() => requestFlyTo(feature.geometry.coordinates)}
              title="Center map"
              className="w-10 h-10 rounded-lg bg-night-800 border border-neon-purple/30 text-neon-teal hover:bg-night-700 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
            </button>
            <button
              onClick={copyShareLink}
              title="Copy share link"
              className="w-10 h-10 rounded-lg bg-night-800 border border-neon-purple/30 text-neon-pink hover:bg-night-700 flex items-center justify-center"
            >
              {copied ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
              )}
            </button>
          </footer>
        </>
      )}
    </aside>
  );
}
