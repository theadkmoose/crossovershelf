// Crossover Shelf — service worker
// Enhancement modules are injected into index.html so the large single-file application does not need to be rewritten.
const CACHE_VERSION = "v13-stable-reading";
const SHELL_CACHE = `crossover-shelf-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `crossover-shelf-runtime-${CACHE_VERSION}`;
const AI_SCRIPT = "./ai-recommendations.js";
const READING_SCRIPT = "./reading-companion.js";
const GLOBAL_READING_SCRIPT = "./global-reading-sync.js";
const RATING_SCRIPT = "./reading-rating-ui.js";
const SHELL_ASSETS = ["./","./index.html",AI_SCRIPT,READING_SCRIPT,GLOBAL_READING_SCRIPT,RATING_SCRIPT,"./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(SHELL_CACHE).then(c=>c.addAll(SHELL_ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("crossover-shelf-")&&(k!==SHELL_CACHE&&k!==RUNTIME_CACHE)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function isRuntimeCacheable(url){return url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com"||url.hostname==="covers.openlibrary.org"||url.hostname==="openlibrary.org";}
async function injectModules(response){
 if(!response||!response.ok)return response;
 const ct=response.headers.get("content-type")||"";if(!ct.includes("text/html"))return response;
 const html=await response.clone().text();
 const marker="<!-- crossover-shelf-enhancements-v13 -->";
 if(html.includes(marker))return response;
 const injected=html.replace(/<\/body>/i,`${marker}<script>try{if(!localStorage.getItem("crossoverShelfCoverCacheResetV1")){localStorage.removeItem("crossover-shelf-cover-cache-v1");localStorage.setItem("crossoverShelfCoverCacheResetV1","1")}}catch(e){}</script><script>try{window.CrossoverShelfBooks=BOOKS;window.CrossoverShelfReadingStatus=readingStatus;}catch(e){}</script><style id="cs-ai-layout-fix">#cs-ai-fab{bottom:calc(78px + env(safe-area-inset-bottom)) !important;}</style><script src="${AI_SCRIPT}"></script><script src="${GLOBAL_READING_SCRIPT}"></script><script src="${READING_SCRIPT}"></script><script src="${RATING_SCRIPT}"></script></body>`);
 const headers=new Headers(response.headers);headers.set("content-type","text/html; charset=utf-8");headers.delete("content-length");return new Response(injected,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener("fetch",event=>{const req=event.request;if(req.method!=="GET")return;const url=new URL(req.url);
 if(url.origin===self.location.origin){const doc=url.pathname.endsWith("/index.html")||url.pathname.endsWith("/");event.respondWith((async()=>{try{const r=await fetch(req,{cache:"no-store"});if(r.ok){const copy=r.clone(),c=await caches.open(SHELL_CACHE);await c.put(req,copy);return doc?injectModules(r):r}}catch(_){}const cached=await caches.match(req);if(cached)return doc?injectModules(cached):cached;const fallback=await caches.match("./index.html");return doc?injectModules(fallback):fallback})());return;}
 if(url.hostname==="openlibrary.org"&&url.pathname.endsWith("/search.json")){event.respondWith(fetch(req).then(async r=>{if(r.ok){const c=await caches.open(RUNTIME_CACHE);await c.put(req,r.clone())}return r}).catch(async()=>{const c=await caches.open(RUNTIME_CACHE);return c.match(req)}));return;}
 if(isRuntimeCacheable(url)){event.respondWith(caches.open(RUNTIME_CACHE).then(cache=>cache.match(req).then(cached=>{const p=fetch(req).then(r=>{if(r.ok)cache.put(req,r.clone());return r}).catch(()=>cached);return cached||p})))}
});
