"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js on first paint in production. Silently no-ops in dev (Next
 * HMR + SW caching is a sharp edge — easier to keep it off locally) and on
 * browsers without service-worker support.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("[pwa] sw registration failed:", err));
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);
  return null;
}
