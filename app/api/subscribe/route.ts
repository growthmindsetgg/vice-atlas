import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Don't cache subscription POSTs at the edge.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: string;
  source?: string;
  // Honeypot — bots tend to fill every field. Real users won't see it.
  website?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Silently accept bot submissions so they don't retry.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const source = (body.source ?? "site").slice(0, 40);

  // Soft-fail when creds aren't set (e.g. previews, local dev). Email is
  // logged and the UI shows success — swap for a queue if you want durability.
  if (!apiKey || !pubId) {
    console.warn(
      "[subscribe] BEEHIIV creds missing — accepting email without sending:",
      email
    );
    return NextResponse.json({ ok: true, queued: true });
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "vice-atlas",
          utm_medium: "site",
          utm_campaign: source,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[subscribe] beehiiv error", res.status, text);
      // Surface a generic message; don't leak provider details.
      return NextResponse.json(
        { error: "Couldn't subscribe right now. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[subscribe] network error:", e);
    return NextResponse.json(
      { error: "Network error. Please try again." },
      { status: 502 }
    );
  }
}
