"use client";

import { useState, type ReactNode } from "react";
import { useMapStore } from "@/lib/store";

type Props = {
  /** Which premium feature this gate protects (for analytics/messaging). */
  feature: "hide-found" | "cross-device" | "exports";
  children: ReactNode;
  /** Optional fallback shown when locked. Defaults to a generic upsell. */
  fallback?: ReactNode;
};

/**
 * Wraps premium-only UI. When the user is not premium, the wrapped content is
 * replaced with the fallback (or a default upsell) and a "Unlock" CTA. Clicking
 * Unlock flips the stub premium flag — swap this for Stripe/lemonsqueezy later.
 */
export default function PremiumGate({ feature, children, fallback }: Props) {
  const isPremium = useMapStore((s) => s.isPremium);
  const setPremium = useMapStore((s) => s.setPremium);
  const [showModal, setShowModal] = useState(false);

  if (isPremium) return <>{children}</>;

  return (
    <>
      <div className="relative rounded-lg border border-neon-yellow/30 bg-gradient-to-br from-night-800/60 to-night-900/60 p-3">
        {fallback ?? (
          <div className="text-[11px] text-purple-200/70">
            This feature is part of Premium.
          </div>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="mt-2 w-full text-[11px] font-display tracking-widest uppercase text-night-950 bg-gradient-to-r from-neon-yellow to-neon-pink py-1.5 rounded-md hover:brightness-110 transition-all"
        >
          Unlock Premium
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-night-900 border border-neon-pink/50 rounded-2xl p-6 max-w-sm w-full shadow-neon"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-xs tracking-[0.3em] text-neon-yellow">
              VICE ATLAS
            </div>
            <h2 className="font-display text-2xl font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-teal bg-clip-text text-transparent">
              Go Premium
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-purple-100">
              <li>✓ Hide found markers</li>
              <li>✓ Sync progress across devices</li>
              <li>✓ Export checklists (CSV/JSON)</li>
              <li>✓ Ad-free experience</li>
            </ul>
            <p className="mt-4 text-[11px] text-purple-200/60 italic">
              Stub: clicking the button below flips a local flag. Swap for
              Stripe/lemonsqueezy in production.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setPremium(true);
                  setShowModal(false);
                  console.log("[premium] unlocked feature:", feature);
                }}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-neon-pink to-neon-yellow text-night-950 font-display font-bold tracking-wider hover:brightness-110"
              >
                Unlock
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-lg bg-night-800 text-purple-100 hover:bg-night-700"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
