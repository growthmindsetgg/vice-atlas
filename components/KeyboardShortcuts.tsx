"use client";

import { useEffect } from "react";
import { useMapStore } from "@/lib/store";

/**
 * Global keyboard shortcuts. Mounts once at the app shell level. Skips key
 * handling when focus is inside an input/textarea/contenteditable.
 */
export default function KeyboardShortcuts() {
  const setHelpOpen = useMapStore((s) => s.setHelpOpen);
  const requestResetView = useMapStore((s) => s.requestResetView);
  const toggleGrid = useMapStore((s) => s.toggleGrid);
  const measureMode = useMapStore((s) => s.measureMode);
  const setMeasureMode = useMapStore((s) => s.setMeasureMode);
  const setSelected = useMapStore((s) => s.setSelected);

  useEffect(() => {
    function isTyping(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        t.isContentEditable
      );
    }

    function onKey(e: KeyboardEvent) {
      // Esc always works (closes detail/help)
      if (e.key === "Escape") {
        setSelected(null);
        setHelpOpen(false);
        return;
      }

      if (isTyping(e)) return;

      switch (e.key) {
        case "?":
          setHelpOpen(true);
          e.preventDefault();
          break;
        case "/":
          (
            document.querySelector(
              "input[placeholder='Search markers…']"
            ) as HTMLInputElement | null
          )?.focus();
          e.preventDefault();
          break;
        case "f":
        case "F":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case "r":
        case "R":
          requestResetView();
          break;
        case "g":
        case "G":
          toggleGrid();
          break;
        case "m":
        case "M":
          setMeasureMode(!measureMode);
          break;
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [
    setHelpOpen,
    requestResetView,
    toggleGrid,
    measureMode,
    setMeasureMode,
    setSelected,
  ]);

  return null;
}
