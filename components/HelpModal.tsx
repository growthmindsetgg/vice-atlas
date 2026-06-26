"use client";

import { useEffect } from "react";
import { useMapStore } from "@/lib/store";

const SHORTCUTS: Array<[string, string]> = [
  ["?", "Open this help"],
  ["/", "Focus the search box"],
  ["F", "Toggle fullscreen"],
  ["R", "Reset map view"],
  ["G", "Toggle grid overlay"],
  ["M", "Toggle measure tool"],
  ["Esc", "Close panels / cancel measure"],
  ["+ / -", "Zoom in / out"],
  ["Arrow keys", "Pan the map"],
];

const ICONS = [
  ["★", "Collectibles", "#ffe156"],
  ["$", "Businesses", "#19f0d0"],
  ["▲", "Stunt jumps", "#ff2bd6"],
  ["✖", "Gang spots", "#8a2be2"],
  ["?", "Easter eggs", "#00e5ff"],
] as const;

export default function HelpModal() {
  const open = useMapStore((s) => s.helpOpen);
  const setOpen = useMapStore((s) => s.setHelpOpen);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative bg-night-900 border border-neon-purple/50 rounded-2xl p-6 max-w-lg w-full shadow-neon max-h-[90vh] overflow-y-auto thin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-3 text-purple-200/60 hover:text-white text-2xl"
          aria-label="Close help"
        >
          ×
        </button>

        <div className="font-display text-xs tracking-[0.3em] text-neon-teal">
          QUICK REFERENCE
        </div>
        <h2 className="font-display text-2xl font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-teal bg-clip-text text-transparent">
          Vice Atlas controls
        </h2>

        <section className="mt-5">
          <h3 className="font-display text-[11px] tracking-widest text-neon-pink uppercase">
            Legend
          </h3>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {ICONS.map(([glyph, label, color]) => (
              <li key={label} className="flex items-center gap-2 text-[13px]">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full font-display font-bold text-night-950 flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                >
                  {glyph}
                </span>
                <span className="text-purple-100">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-[11px] tracking-widest text-neon-pink uppercase">
            Keyboard shortcuts
          </h3>
          <ul className="mt-2 space-y-1">
            {SHORTCUTS.map(([k, d]) => (
              <li
                key={k}
                className="flex items-center justify-between gap-3 text-[13px]"
              >
                <span className="text-purple-100">{d}</span>
                <kbd className="font-mono text-[11px] bg-night-800 border border-neon-purple/30 rounded px-2 py-0.5 text-neon-teal">
                  {k}
                </kbd>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-[11px] tracking-widest text-neon-pink uppercase">
            Tips
          </h3>
          <ul className="mt-2 space-y-1.5 text-[13px] text-purple-100/90 list-disc list-inside">
            <li>Marker clusters merge nearby points — click to expand.</li>
            <li>
              The URL updates as you pan/zoom — copy it to share the exact view.
            </li>
            <li>
              Progress saves locally; clearing browser data resets it.
            </li>
            <li>Pinch-zoom and drag work on mobile.</li>
          </ul>
        </section>

        <div className="mt-5 pt-4 border-t border-neon-purple/20 text-center text-[11px] text-purple-200/50">
          Press{" "}
          <kbd className="font-mono bg-night-800 border border-neon-purple/30 rounded px-1.5 py-0.5">
            ?
          </kbd>{" "}
          anytime to reopen
        </div>
      </div>
    </div>
  );
}
