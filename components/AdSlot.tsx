"use client";

import { useMapStore } from "@/lib/store";

type Props = {
  /** Slot identifier — pass to the ad-network when you wire it. */
  slot: string;
};

/**
 * Ad slot. By design, renders NOTHING in production until a real ad network is
 * wired. To preview the placeholder during development, set:
 *   NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS=1
 * in .env.local. Premium users never see this regardless.
 *
 * When you integrate an ad network (AdSense, Ezoic, Snigel…), replace the
 * placeholder block below with the network's <ins>/<script> embed and remove
 * the early-return.
 */
export default function AdSlot({ slot }: Props) {
  const isPremium = useMapStore((s) => s.isPremium);
  if (isPremium) return null;

  const showPlaceholder =
    process.env.NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS === "1";
  if (!showPlaceholder) return null;

  return (
    <div
      className="rounded-md border border-dashed border-neon-purple/30 bg-night-900/40 text-center py-4 text-[10px] tracking-[0.25em] uppercase text-purple-200/40 font-display"
      data-ad-slot={slot}
    >
      Ad · {slot}
    </div>
  );
}
