// Crossover Shelf — service worker
// Strategy: cache-first for the app shell (works fully offline once visited),
// stale-while-revalidate for Google Fonts and book cover images (so offline
// still shows whatever was already loaded, while quietly refreshing online).
// The app shell also injects the optional browser-only AI recommendation module.

const CACHE_VERSION = "v3";
const SHELL_CACHE = `crossover-shelf-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `crossover-shelf-runtime-${CACHE_VERSION}`;
const AI_SCRIPT = "./ai-recommendations.js";

const SHELL_ASSETS = [
  "./",
  "./index.html",
  AI_SCRIPT,
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isRuntimeCacheable(url) {
  return (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "covers.openlibrary.org" ||
    url.hostname === "openlibrary.org"
  );
}

async function injectAiModule(response) {
  if (!response || !response.ok) return response;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.clone().text();
  if (html.includes(AI_SCRIPT)) return response;

  const injected = html.replace(/<\/body>/i, `<script src="${AI_SCRIPT}"></script></body>`);
  if (injected === html) return response;

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.delete("content-length");
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // App shell: cache-first, so the app opens instantly and works offline.
  // index.html is transformed at response time so the optional AI module can
  // be added without modifying the large single-file application itself.
  if (url.origin === self.location.origin) {
    const isAppDocument = url.pathname.endsWith("/index.html") || url.pathname.endsWith("/");
    event.respondWith(
      caches.match(req).then(async (cached) => {
        if (cached) return isAppDocument ? injectAiModule(cached) : cached;
        return fetch(req)
          .then(async (res) => {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
            return isAppDocument ? injectAiModule(res) : res;
          })
          .catch(() => caches.match("./index.html").then((fallback) => isAppDocument ? injectAiModule(fallback) : fallback));
      })
    );
    return;
  }

  // Fonts + cover images: stale-while-revalidate.
  if (isRuntimeCacheable(url)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((res) => {
              if (res.ok) cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});
