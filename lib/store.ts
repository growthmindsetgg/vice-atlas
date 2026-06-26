"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";

type EnabledMap = Record<CategoryKey, boolean>;

type MapStore = {
  // ---------- Layer state ----------
  enabled: EnabledMap;
  toggleCategory: (key: CategoryKey) => void;
  setAllCategories: (on: boolean) => void;

  /** Marker layer opacity (0..1). */
  opacity: number;
  setOpacity: (n: number) => void;

  // ---------- Search ----------
  search: string;
  setSearch: (s: string) => void;

  // ---------- Found / progress ----------
  hideFound: boolean;
  setHideFound: (v: boolean) => void;
  found: Record<string, boolean>;
  toggleFound: (id: string) => void;
  setFound: (id: string, v: boolean) => void;
  clearFound: () => void;

  // ---------- Imperative map requests ----------
  flyTo: { xy: [number, number]; ts: number } | null;
  requestFlyTo: (xy: [number, number]) => void;

  resetViewToken: number;
  requestResetView: () => void;

  // ---------- Selected marker (detail panel) ----------
  selectedId: string | null;
  setSelected: (id: string | null) => void;

  // ---------- Overlays ----------
  showGrid: boolean;
  toggleGrid: () => void;
  showScale: boolean;
  toggleScale: () => void;
  showMinimap: boolean;
  toggleMinimap: () => void;

  // ---------- Tools ----------
  measureMode: boolean;
  setMeasureMode: (v: boolean) => void;

  // ---------- Modals ----------
  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;

  // ---------- Countdown ----------
  countdownDismissed: boolean;
  dismissCountdown: () => void;

  // ---------- Premium stub ----------
  isPremium: boolean;
  setPremium: (v: boolean) => void;

  // ---------- Live HUD (not persisted) ----------
  cursorXY: [number, number] | null;
  setCursorXY: (xy: [number, number] | null) => void;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
};

const allOn: EnabledMap = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: true }),
  {} as EnabledMap
);

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      enabled: allOn,
      toggleCategory: (key) =>
        set((s) => ({ enabled: { ...s.enabled, [key]: !s.enabled[key] } })),
      setAllCategories: (on) =>
        set(() => ({
          enabled: CATEGORIES.reduce(
            (acc, c) => ({ ...acc, [c.key]: on }),
            {} as EnabledMap
          ),
        })),

      opacity: 1,
      setOpacity: (n) => set({ opacity: Math.max(0.2, Math.min(1, n)) }),

      search: "",
      setSearch: (s) => set({ search: s }),

      hideFound: false,
      setHideFound: (v) => set({ hideFound: v }),
      found: {},
      toggleFound: (id) =>
        set((s) => ({ found: { ...s.found, [id]: !s.found[id] } })),
      setFound: (id, v) => set((s) => ({ found: { ...s.found, [id]: v } })),
      clearFound: () => set({ found: {} }),

      flyTo: null,
      requestFlyTo: (xy) => set({ flyTo: { xy, ts: Date.now() } }),

      resetViewToken: 0,
      requestResetView: () =>
        set((s) => ({ resetViewToken: s.resetViewToken + 1 })),

      selectedId: null,
      setSelected: (id) => set({ selectedId: id }),

      showGrid: false,
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      showScale: true,
      toggleScale: () => set((s) => ({ showScale: !s.showScale })),
      showMinimap: true,
      toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),

      measureMode: false,
      setMeasureMode: (v) => set({ measureMode: v }),

      helpOpen: false,
      setHelpOpen: (v) => set({ helpOpen: v }),

      countdownDismissed: false,
      dismissCountdown: () => set({ countdownDismissed: true }),

      isPremium: false,
      setPremium: (v) => set({ isPremium: v }),

      cursorXY: null,
      setCursorXY: (xy) => set({ cursorXY: xy }),
      zoomLevel: 0,
      setZoomLevel: (z) => set({ zoomLevel: z }),
    }),
    {
      name: "vice-atlas-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        enabled: s.enabled,
        opacity: s.opacity,
        hideFound: s.hideFound,
        found: s.found,
        isPremium: s.isPremium,
        showGrid: s.showGrid,
        showScale: s.showScale,
        showMinimap: s.showMinimap,
        countdownDismissed: s.countdownDismissed,
      }),
    }
  )
);
