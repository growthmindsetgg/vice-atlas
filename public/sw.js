/* Vice Atlas service worker.
 * - App shell + Next static assets: cache-first
 * - Tiles: cache-first (LRU-capped)
 * - HTML navigations: network-first with cached fallback
 * Bump VERSION to invalidate the entire cache after a deploy that changes
 * shell assets (Next.js handles its own immutable hashing under /_next/static).
 */
const VERSION = "v1";
const SHELL_CACHE = `vice-shell-${VERSION}`;
const TILE_CACHE = `vice-tiles-${VERSION}`;
const TILE_LIMIT = 500;

const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/og.png",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((c) => Promise.all(SHELL_URLS.map((u) => c.add(u).catch(() => {}))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.endsWith(VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (let i = 0; i < keys.length - max; i++) {
    await cache.delete(keys[i]);
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Tiles — cache-first, LRU-capped
  if (url.pathname.startsWith("/tiles/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(TILE_CACHE);
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok) {
            cache.put(req, res.clone());
            // fire-and-forget LRU trim
            trimCache(TILE_CACHE, TILE_LIMIT);
          }
          return res;
        } catch (e) {
          return new Response("", { status: 504 });
        }
      })()
    );
    return;
  }

  // Next.js static + brand images + fonts — cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return new Response("", { status: 504 });
        }
      })()
    );
    return;
  }

  // HTML navigations — network-first, fall back to cached "/"
  if (
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html")
  ) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          // Opportunistically cache so the shell stays fresh
          if (res.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put("/", res.clone());
          }
          return res;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match(req)) || (await cache.match("/")) ||
            new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // Everything else — pass through
});
