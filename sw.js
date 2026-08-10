// Crossover Shelf — stable service worker
// Temporarily keep the core application on a clean loading path while the My Reading UI is rebuilt.
const CACHE_VERSION = "v15-core-stable";
const SHELL_CACHE = `crossover-shelf-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `crossover-shelf-runtime-${CACHE_VERSION}`;
const CORE_ASSETS = ["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install", event => event.waitUntil(
  caches.open(SHELL_CACHE).then(c => c.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener("activate", event => event.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("crossover-shelf-") && k !== SHELL_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim())
));
function runtime(url){
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" ||
    url.hostname === "covers.openlibrary.org" || url.hostname === "openlibrary.org";
}
self.addEventListener("fetch", event => {
  const req = event.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin === self.location.origin){
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, {cache:"no-store"});
        if(fresh.ok) return fresh;
      } catch(_) {}
      return (await caches.match(req)) || (await caches.match("./index.html"));
    })());
    return;
  }
  if(runtime(url)){
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      try {
        const fresh = await fetch(req);
        if(fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch(_) {
        return await cache.match(req);
      }
    })());
  }
});
