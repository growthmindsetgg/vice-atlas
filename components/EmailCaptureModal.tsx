"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vice-atlas-email-modal";

type Status = "idle" | "loading" | "success" | "error";

/**
 * One-time email capture modal. Shows ~12s after first visit unless dismissed
 * or already submitted. Wired to /api/subscribe (Beehiiv).
 */
export default function EmailCaptureModal() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = localStorage.getItem(STORAGE_KEY);
    if (state === "dismissed" || state === "submitted") return;
    const t = window.setTimeout(() => setShow(true), 12_000);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setShow(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, source: "modal" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Subscription failed");
      setStatus("success");
      localStorage.setItem(STORAGE_KEY, "submitted");
      window.setTimeout(() => setShow(false), 1800);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Subscription failed");
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-night-900 border border-neon-teal/40 rounded-2xl p-6 max-w-sm w-full shadow-neon-teal">
        <button
          onClick={dismiss}
          className="absolute top-2 right-3 text-purple-200/60 hover:text-white text-xl"
          aria-label="Dismiss"
        >
          ×
        </button>

        {status === "success" ? (
          <div className="text-center py-2">
            <div className="font-display text-3xl text-neon-teal">✓</div>
            <div className="text-sm text-white mt-2">
              You're in. See you soon.
            </div>
          </div>
        ) : (
          <>
            <div className="font-display text-xs tracking-[0.3em] text-neon-teal">
              GET UPDATES
            </div>
            <h2 className="font-display text-xl font-bold mt-1 text-white">
              New maps, new secrets
            </h2>
            <p className="mt-2 text-[12px] text-purple-200/70">
              We add new collectible drops and easter eggs every patch. Get them
              in your inbox.
            </p>
            <form onSubmit={submit} className="mt-4 space-y-2">
              {/* Honeypot */}
              <label className="sr-only" aria-hidden="true">
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                placeholder="you@example.com"
                className="w-full bg-night-800 border border-neon-purple/40 rounded-lg px-3 py-2 text-sm text-white placeholder-purple-200/40 focus:outline-none focus:border-neon-teal disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-neon-teal to-neon-cyan text-night-950 font-display font-bold tracking-wider hover:brightness-110 disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
              {error && (
                <p className="text-[12px] text-neon-pink" role="alert">
                  {error}
                </p>
              )}
            </form>
            <p className="mt-2 text-[10px] text-purple-200/40">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
