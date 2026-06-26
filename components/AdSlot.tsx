"use client";

import { useMapStore } from "@/lib/store";

type Props = {
  /** Slot identifier — pass to the ad-network when you wire it. */
  slot: string;
};

/**
 * Placeholder ad slot. Premium users see nothing. Swap the placeholder block
 * for your ad-network embed (AdSense, Ezoic, Snigel, etc.) — keep the same
 * outer wrapper so layout doesn't shift.
 */
export default function AdSlot({ slot }: Props) {
  const isPremium = useMapStore((s) => s.isPremium);
  if (isPremium) return null;

  return (
    <div
      className="rounded-md border border-dashed border-neon-purple/30 bg-night-900/40 text-center py-4 text-[10px] tracking-[0.25em] uppercase text-purple-200/40 font-display"
      data-ad-slot={slot}
    >
      Ad · {slot}
    </div>
  );
}
