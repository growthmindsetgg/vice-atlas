"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
};

/**
 * Pure-CSS before/after image slider. Drag the handle (or click/tap) to reveal
 * either side. No external dependencies; uses clip-path inset() for performance.
 */
export default function CompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
}: Props) {
  const [pos, setPos] = useState(50); // 0..100 percentage from left
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function updateFromClientX(clientX: number) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!draggingRef.current) return;
      const x =
        "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as MouseEvent).clientX;
      updateFromClientX(x);
    }
    function onUp() {
      draggingRef.current = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    draggingRef.current = true;
    const x =
      "touches" in e
        ? e.touches[0]?.clientX ?? 0
        : (e as React.MouseEvent).clientX;
    updateFromClientX(x);
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden border border-neon-purple/30 select-none touch-none"
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-neon-pink"
        style={{
          left: `${pos}%`,
          boxShadow: "0 0 10px #ff2bd6",
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full bg-night-950 border-2 border-neon-pink flex items-center justify-center shadow-neon cursor-ew-resize"
          aria-label="Drag to compare"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-neon-pink" fill="currentColor">
            <path d="M8 6l-6 6 6 6V6zm8 0v12l6-6-6-6z" />
          </svg>
        </div>
      </div>

      <span className="absolute top-2 left-2 text-[10px] font-display tracking-widest bg-night-950/80 text-neon-teal px-2 py-1 rounded">
        {beforeLabel.toUpperCase()}
      </span>
      <span className="absolute top-2 right-2 text-[10px] font-display tracking-widest bg-night-950/80 text-neon-pink px-2 py-1 rounded">
        {afterLabel.toUpperCase()}
      </span>
    </div>
  );
}
