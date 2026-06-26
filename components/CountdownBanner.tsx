"use client";

import { useEffect, useState } from "react";
import { LAUNCH_DATE_ISO, timeUntil } from "@/lib/launch";
import { useMapStore } from "@/lib/store";

const TARGET = new Date(LAUNCH_DATE_ISO);

export default function CountdownBanner() {
  const dismissed = useMapStore((s) => s.countdownDismissed);
  const dismiss = useMapStore((s) => s.dismissCountdown);
  const [t, setT] = useState(() => timeUntil(TARGET));

  useEffect(() => {
    const id = window.setInterval(() => setT(timeUntil(TARGET)), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (dismissed || t.past) return null;

  return (
    <div className="relative z-[1100] bg-gradient-to-r from-neon-pink/95 via-neon-magenta/95 to-neon-purple/95 text-night-950 px-3 py-1.5 shadow-neon flex items-center justify-center gap-3 text-[12px] font-display font-bold tracking-wider">
      <span className="hidden sm:inline-block animate-pulse">●</span>
      <span className="uppercase">GTA 6 launches in</span>
      <span className="font-mono">
        <Cell n={t.days} label="d" />
        <span className="opacity-50 mx-0.5">:</span>
        <Cell n={t.hours} label="h" />
        <span className="opacity-50 mx-0.5">:</span>
        <Cell n={t.minutes} label="m" />
        <span className="opacity-50 mx-0.5">:</span>
        <Cell n={t.seconds} label="s" />
      </span>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform text-night-950/70 hover:text-night-950"
        aria-label="Dismiss countdown"
      >
        ×
      </button>
    </div>
  );
}

function Cell({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="tabular-nums">{String(n).padStart(2, "0")}</span>
      <span className="opacity-60 text-[10px] ml-0.5">{label}</span>
    </span>
  );
}
