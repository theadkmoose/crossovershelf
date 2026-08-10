// Crossover Shelf — service worker
// Strategy: cache-first for the app shell, stale-while-revalidate for
// fonts and Open Library cover assets. The AI module is injected into index.html
// so the large single-file application does not need to be rewritten.

const CACHE_VERSION = "v5-ai-covers";
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
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => Promise.all(
        clients.map((client) => {
          if (client.url && "navigate" in client) {
            return client.navigate(client.url).catch(() => undefined);
          }
          return undefined;
        })
      ))
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

  const injected = html.replace(
    /<\/body>/i,
    `<script>try{if(!localStorage.getItem("crossoverShelfCoverCacheResetV1")){localStorage.removeItem("crossover-shelf-cover-cache-v1");localStorage.setItem("crossoverShelfCoverCacheResetV1","1")}}catch(e){}</script><style id="cs-ai-layout-fix">#cs-ai-fab{bottom:calc(78px + env(safe-area-inset-bottom)) !important;}</style><script src="${AI_SCRIPT}"></script></body>`
  );
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

  if (url.origin === self.location.origin) {
    const isAppDocument =
      url.pathname.endsWith("/index.html") ||
      url.pathname.endsWith("/");

    event.respondWith(
      caches.match(req).then(async (cached) => {
        if (cached) {
          return isAppDocument ? injectAiModule(cached) : cached;
        }

        try {
          const response = await fetch(req);
          const copy = response.clone();
          const cache = await caches.open(SHELL_CACHE);
          await cache.put(req, copy);
          return isAppDocument ? injectAiModule(response) : response;
        } catch (_) {
          const fallback = await caches.match("./index.html");
          return isAppDocument ? injectAiModule(fallback) : fallback;
        }
      })
    );
    return;
  }

  if (url.hostname === "openlibrary.org" && url.pathname.endsWith("/search.json")) {
    event.respondWith(
      fetch(req)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(req, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(RUNTIME_CACHE);
          return cache.match(req);
        })
    );
    return;
  }

  if (isRuntimeCacheable(url)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((response) => {
              if (response.ok) cache.put(req, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});