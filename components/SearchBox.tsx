"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { CATEGORY_BY_KEY } from "@/lib/categories";
import { useMapStore } from "@/lib/store";
import type { MarkerFeature } from "@/types";

type Props = {
  features: MarkerFeature[];
};

export default function SearchBox({ features }: Props) {
  const search = useMapStore((s) => s.search);
  const setSearch = useMapStore((s) => s.setSearch);
  const requestFlyTo = useMapStore((s) => s.requestFlyTo);
  const enabled = useMapStore((s) => s.enabled);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return features
      .filter((f) => {
        if (!enabled[f.properties.category]) return false;
        return (
          f.properties.name.toLowerCase().includes(q) ||
          f.properties.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [features, search, enabled]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search markers…"
          className="w-full bg-night-900/85 backdrop-blur border border-neon-purple/40 rounded-full px-4 pl-10 py-2.5 text-sm text-white placeholder-purple-200/50 focus:outline-none focus:border-neon-pink/80 focus:shadow-neon transition-all"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-200/60 hover:text-white text-lg leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-[1000] mt-1.5 w-full bg-night-900/95 backdrop-blur-xl border border-neon-purple/40 rounded-2xl overflow-hidden shadow-neon">
          {results.map((f) => {
            const cat = CATEGORY_BY_KEY[f.properties.category];
            return (
              <li key={f.properties.id}>
                <button
                  onClick={() => {
                    requestFlyTo(f.geometry.coordinates);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-night-800 transition-colors"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: cat.color,
                      boxShadow: `0 0 6px ${cat.color}`,
                    }}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-white truncate">
                      {f.properties.name}
                    </span>
                    <span className="block text-[11px] text-purple-200/60">
                      {cat.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
