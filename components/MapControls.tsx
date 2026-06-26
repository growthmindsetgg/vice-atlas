"use client";

import { useMapStore } from "@/lib/store";
import { useEffect, useState } from "react";

type IconBtn = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function CtrlBtn({ label, active, onClick, children }: IconBtn) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-10 h-10 flex items-center justify-center rounded-md border transition-all ${
        active
          ? "bg-neon-pink/20 border-neon-pink/60 text-neon-pink shadow-neon"
          : "bg-night-950/80 backdrop-blur border-neon-purple/30 text-purple-100 hover:border-neon-teal/60 hover:text-neon-teal"
      }`}
    >
      {children}
    </button>
  );
}

export default function MapControls() {
  const requestResetView = useMapStore((s) => s.requestResetView);
  const showGrid = useMapStore((s) => s.showGrid);
  const toggleGrid = useMapStore((s) => s.toggleGrid);
  const showScale = useMapStore((s) => s.showScale);
  const toggleScale = useMapStore((s) => s.toggleScale);
  const showMinimap = useMapStore((s) => s.showMinimap);
  const toggleMinimap = useMapStore((s) => s.toggleMinimap);
  const measureMode = useMapStore((s) => s.measureMode);
  const setMeasureMode = useMapStore((s) => s.setMeasureMode);
  const setHelpOpen = useMapStore((s) => s.setHelpOpen);

  // Fullscreen toggle (managed outside store — it's a browser API)
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="absolute top-20 right-3 z-[700] flex flex-col gap-2">
      <CtrlBtn label="Reset view" onClick={requestResetView}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </CtrlBtn>
      <CtrlBtn
        label={`${measureMode ? "Stop" : "Measure"} distance`}
        active={measureMode}
        onClick={() => setMeasureMode(!measureMode)}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21l18-18" />
          <path d="M6 18l-3-3" />
          <path d="M10 14l-2-2" />
          <path d="M14 10l-2-2" />
          <path d="M18 6l-3-3" />
        </svg>
      </CtrlBtn>
      <CtrlBtn
        label={`${showGrid ? "Hide" : "Show"} grid`}
        active={showGrid}
        onClick={toggleGrid}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      </CtrlBtn>
      <CtrlBtn
        label={`${showScale ? "Hide" : "Show"} scale`}
        active={showScale}
        onClick={toggleScale}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17h18" />
          <path d="M5 17v-3M9 17v-4M13 17v-3M17 17v-4M21 17v-3" />
        </svg>
      </CtrlBtn>
      <CtrlBtn
        label={`${showMinimap ? "Hide" : "Show"} minimap`}
        active={showMinimap}
        onClick={toggleMinimap}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="13" y="13" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.3" />
        </svg>
      </CtrlBtn>
      <CtrlBtn label="Fullscreen (F)" active={isFullscreen} onClick={toggleFullscreen}>
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 4v3H6M15 4v3h3M9 20v-3H6M15 20v-3h3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        )}
      </CtrlBtn>
      <CtrlBtn label="Help (?)" onClick={() => setHelpOpen(true)}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" />
          <circle cx="12" cy="17.5" r="0.5" fill="currentColor" />
        </svg>
      </CtrlBtn>
    </div>
  );
}
