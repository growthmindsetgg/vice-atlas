"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function LegendCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="absolute top-20 left-3 z-[700] w-56 md:w-60 pointer-events-auto">
      <div className="rounded-lg bg-night-950/85 backdrop-blur border border-neon-purple/40 shadow-neon overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-night-900/60 transition-colors"
          aria-expanded={open}
        >
          <span className="font-display text-[10px] tracking-[0.3em] uppercase text-neon-pink">
            Legend
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 text-purple-200/70 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="px-3 pb-3">
            <ul className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <li key={c.key} className="flex items-center gap-2.5">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-display font-bold text-night-950 flex-shrink-0"
                    style={{
                      background: c.color,
                      boxShadow: `0 0 6px ${c.color}`,
                    }}
                  >
                    {c.glyph}
                  </span>
                  <span className="text-[12px] text-purple-100 truncate">
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 pt-2.5 border-t border-neon-purple/15 text-[10px] leading-snug text-purple-200/55">
              Unofficial fan project. Original cartography — not affiliated with
              Rockstar Games or Take-Two Interactive.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
