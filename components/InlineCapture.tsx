"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

type Props = {
  /** Identifier sent along with the subscription (utm_campaign). */
  source: string;
  /** Visual variant. */
  variant?: "default" | "compact";
  /** Override the headline copy. */
  headline?: string;
  /** Override the subhead copy. */
  subhead?: string;
};

export default function InlineCapture({
  source,
  variant = "default",
  headline = "New maps, new secrets",
  subhead = "Get every collectible drop and easter egg in your inbox.",
}: Props) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Subscription failed");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Subscription failed");
    }
  }

  const compact = variant === "compact";

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl border border-neon-teal/40 bg-night-900/70 ${
          compact ? "p-4" : "p-6"
        } text-center`}
      >
        <div className="font-display text-3xl text-neon-teal">✓</div>
        <div className="text-sm text-white mt-2">
          You're in. See you on the next drop.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-neon-purple/40 bg-gradient-to-br from-night-800/70 to-night-900/70 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="font-display text-[11px] tracking-[0.3em] text-neon-teal">
        STAY IN THE LOOP
      </div>
      <h3
        className={`font-display font-bold mt-1 text-white ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        {headline}
      </h3>
      <p className="mt-1 text-[13px] text-purple-100/80">{subhead}</p>

      <form
        onSubmit={submit}
        className={`mt-3 flex gap-2 ${compact ? "" : "sm:flex-row"} flex-col`}
      >
        {/* Honeypot — visually hidden, off the focus chain */}
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
          placeholder="you@example.com"
          disabled={status === "loading"}
          className="flex-1 bg-night-900 border border-neon-purple/40 rounded-lg px-3 py-2 text-sm text-white placeholder-purple-200/40 focus:outline-none focus:border-neon-teal disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="py-2 px-4 rounded-lg bg-gradient-to-r from-neon-teal to-neon-cyan text-night-950 font-display font-bold tracking-wider hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-[12px] text-neon-pink" role="alert">
          {error}
        </p>
      )}
      <p className="mt-2 text-[10px] text-purple-200/40">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
