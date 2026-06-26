"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBox from "@/components/SearchBox";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import AdSlot from "@/components/AdSlot";
import CountdownBanner from "@/components/CountdownBanner";
import CoordHUD from "@/components/CoordHUD";
import MapControls from "@/components/MapControls";
import DetailPanel from "@/components/DetailPanel";
import HelpModal from "@/components/HelpModal";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import PwaRegister from "@/components/PwaRegister";
import type { MarkerFeature } from "@/types";

// Leaflet touches `window` on import — keep it off the server.
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-night-950 text-purple-200/50 text-sm">
      Loading map…
    </div>
  ),
});

type Props = {
  features: MarkerFeature[];
};

export default function AppShell({ features }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-dvh w-screen flex flex-col bg-vice-gradient overflow-hidden">
      <CountdownBanner />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar — slides over on mobile, static on md+ */}
        <div
          className={`fixed inset-y-0 left-0 z-[1200] w-80 max-w-[85vw] transform transition-transform duration-200 md:static md:translate-x-0 md:w-80 md:flex-shrink-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar features={features} onClose={() => setSidebarOpen(false)} />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[1100] bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Map area */}
        <section className="relative flex-1 h-full">
          {/* Top bar overlay */}
          <div className="absolute top-3 left-3 right-3 z-[900] flex items-center gap-2 md:gap-3 pointer-events-none">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden pointer-events-auto bg-night-900/85 backdrop-blur border border-neon-purple/40 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-neon flex-shrink-0"
              aria-label="Open sidebar"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 max-w-md pointer-events-auto">
              <SearchBox features={features} />
            </div>
            <div className="hidden md:block pointer-events-auto w-48 lg:w-64">
              <AdSlot slot="top-banner" />
            </div>
          </div>

          {/* Map + overlays */}
          <Map features={features} />
          <CoordHUD />
          <MapControls />
        </section>

        {/* Detail panel slides in from the right */}
        <DetailPanel features={features} />
      </main>

      {/* Global modals + side-effects */}
      <EmailCaptureModal />
      <HelpModal />
      <KeyboardShortcuts />
      <PwaRegister />
    </div>
  );
}
