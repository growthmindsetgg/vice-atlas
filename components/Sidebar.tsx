"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { useMapStore } from "@/lib/store";
import type { MarkerFeature } from "@/types";
import PremiumGate from "@/components/PremiumGate";
import AdSlot from "@/components/AdSlot";

type Props = {
  features: MarkerFeature[];
  onClose?: () => void;
};

export default function Sidebar({ features, onClose }: Props) {
  const enabled = useMapStore((s) => s.enabled);
  const toggle = useMapStore((s) => s.toggleCategory);
  const setAll = useMapStore((s) => s.setAllCategories);
  const found = useMapStore((s) => s.found);
  const clearFound = useMapStore((s) => s.clearFound);
  const hideFound = useMapStore((s) => s.hideFound);
  const setHideFound = useMapStore((s) => s.setHideFound);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const stats = useMemo(() => {
    const byCat: Record<CategoryKey, { total: number; done: number }> =
      CATEGORIES.reduce(
        (acc, c) => ({ ...acc, [c.key]: { total: 0, done: 0 } }),
        {} as Record<CategoryKey, { total: number; done: number }>
      );
    for (const f of features) {
      const k = f.properties.category;
      byCat[k].total += 1;
      if (found[f.properties.id]) byCat[k].done += 1;
    }
    const total = features.length;
    const done = features.filter((f) => found[f.properties.id]).length;
    return { byCat, total, done };
  }, [features, found]);

  return (
    <aside className="h-full w-full md:w-80 bg-night-950/85 backdrop-blur-xl border-r border-neon-purple/25 text-white flex flex-col">
      <header className="px-5 pt-5 pb-3 border-b border-neon-purple/20">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-xs tracking-[0.3em] text-neon-pink/80">
              VICE ATLAS
            </div>
            <h1 className="font-display text-2xl font-bold mt-1 leading-none">
              <span className="bg-gradient-to-r from-neon-pink via-neon-magenta to-neon-teal bg-clip-text text-transparent">
                Game Map
              </span>
            </h1>
            <p className="text-[11px] text-purple-200/60 mt-1.5">
              Collectibles · Missions · Secrets
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-purple-200/70 hover:text-white text-2xl leading-none p-1"
              aria-label="Close sidebar"
            >
              ×
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-widest text-purple-200/70">
            Overall progress
          </div>
          <div className="text-[11px] font-mono text-neon-teal">
            {stats.done}/{stats.total}
          </div>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-night-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-neon-teal transition-all"
            style={{
              width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </header>

      <div className="flex items-center justify-between px-5 py-2.5 text-[11px] uppercase tracking-widest text-purple-200/60 border-b border-neon-purple/10">
        <span>Categories</span>
        <div className="flex gap-2">
          <button
            onClick={() => setAll(true)}
            className="hover:text-neon-teal transition-colors"
          >
            all
          </button>
          <span className="text-purple-200/30">|</span>
          <button
            onClick={() => setAll(false)}
            className="hover:text-neon-pink transition-colors"
          >
            none
          </button>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto thin-scroll px-3 py-2 space-y-1">
        {CATEGORIES.map((c) => {
          const s = stats.byCat[c.key];
          const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
          const on = enabled[c.key];
          return (
            <li key={c.key}>
              <button
                onClick={() => toggle(c.key)}
                className={`w-full text-left rounded-lg px-3 py-2 flex items-center gap-3 transition-all border ${
                  on
                    ? "bg-night-800/70 border-neon-purple/30 hover:border-neon-pink/60"
                    : "bg-night-900/50 border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-display font-bold text-night-950 flex-shrink-0"
                  style={{
                    background: c.color,
                    boxShadow: on ? `0 0 12px ${c.color}` : "none",
                  }}
                >
                  {c.glyph}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">
                    {c.label}
                  </span>
                  <span className="block text-[11px] text-purple-200/60 truncate">
                    {c.blurb}
                  </span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="block text-[11px] font-mono text-neon-teal">
                    {s.done}/{s.total}
                  </span>
                  <span className="block text-[10px] text-purple-200/50">
                    {pct}%
                  </span>
                </span>
              </button>
              <div className="h-0.5 mt-0.5 mx-3 rounded-full bg-night-700 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ width: `${pct}%`, background: c.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-5 py-3 border-t border-neon-purple/20 space-y-3">
        <PremiumGate
          feature="hide-found"
          fallback={
            <div className="text-[11px] text-purple-200/60 leading-snug">
              <span className="text-neon-yellow">★ Premium:</span> hide found
              markers and sync across devices.
            </div>
          }
        >
          <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
            <span className="text-[12px] text-purple-100">
              Hide found markers
            </span>
            <input
              type="checkbox"
              checked={hideFound}
              onChange={(e) => setHideFound(e.target.checked)}
              className="accent-pink-500 w-4 h-4"
            />
          </label>
        </PremiumGate>

        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="w-full text-[11px] text-purple-200/60 hover:text-neon-pink transition-colors text-left"
          >
            Reset progress…
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-purple-100 flex-1">
              Erase all found markers?
            </span>
            <button
              onClick={() => {
                clearFound();
                setConfirmingReset(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-neon-pink/80 hover:bg-neon-pink text-night-950 font-semibold"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmingReset(false)}
              className="text-[11px] px-2 py-0.5 rounded bg-night-700 hover:bg-night-600 text-purple-100"
            >
              No
            </button>
          </div>
        )}

        <AdSlot slot="sidebar-bottom" />
      </div>
    </aside>
  );
}
