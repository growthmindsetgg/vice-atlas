"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";

type EnabledMap = Record<CategoryKey, boolean>;

type MapStore = {
  /** Which category layers are currently visible on the map. */
  enabled: EnabledMap;
  toggleCategory: (key: CategoryKey) => void;
  setAllCategories: (on: boolean) => void;

  /** Search query (free text), filters markers by name + category. */
  search: string;
  setSearch: (s: string) => void;

  /** Hide-found toggle (premium-gated). */
  hideFound: boolean;
  setHideFound: (v: boolean) => void;

  /** Per-marker found state, keyed by feature.properties.id. */
  found: Record<string, boolean>;
  toggleFound: (id: string) => void;
  setFound: (id: string, v: boolean) => void;
  clearFound: () => void;

  /** Imperative request to fly the map to a coordinate. Read by Map.tsx. */
  flyTo: { xy: [number, number]; ts: number } | null;
  requestFlyTo: (xy: [number, number]) => void;

  /** Premium stub. */
  isPremium: boolean;
  setPremium: (v: boolean) => void;
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

      search: "",
      setSearch: (s) => set({ search: s }),

      hideFound: false,
      setHideFound: (v) => set({ hideFound: v }),

      found: {},
      toggleFound: (id) =>
        set((s) => ({ found: { ...s.found, [id]: !s.found[id] } })),
      setFound: (id, v) =>
        set((s) => ({ found: { ...s.found, [id]: v } })),
      clearFound: () => set({ found: {} }),

      flyTo: null,
      requestFlyTo: (xy) => set({ flyTo: { xy, ts: Date.now() } }),

      isPremium: false,
      setPremium: (v) => set({ isPremium: v }),
    }),
    {
      name: "vice-atlas-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        enabled: s.enabled,
        hideFound: s.hideFound,
        found: s.found,
        isPremium: s.isPremium,
      }),
    }
  )
);
