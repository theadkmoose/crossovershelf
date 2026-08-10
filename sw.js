// Crossover Shelf — stable core + unified My Reading + lightweight shell controls
const CACHE_VERSION = "v17-shell-controls";
const SHELL_CACHE = `crossover-shelf-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `crossover-shelf-runtime-${CACHE_VERSION}`;
const MY_READING = "./my-reading.js";
const SHELL_CONTROLS = "./app-shell-controls.js";
const CORE_ASSETS = ["./","./index.html",MY_READING,SHELL_CONTROLS,"./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install", event => event.waitUntil(
  caches.open(SHELL_CACHE).then(c => c.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener("activate", event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("crossover-shelf-") && k !== SHELL_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
function runtime(url){return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "covers.openlibrary.org" || url.hostname === "openlibrary.org";}
async function injectModules(response){
  if(!response || !response.ok) return response;
  const type=response.headers.get("content-type")||""; if(!type.includes("text/html")) return response;
  const html=await response.clone().text();
  if(html.includes("<!-- crossover-shelf-shell-controls-v17 -->")) return response;
  const injected=html.replace(/<\/body>/i, `<!-- crossover-shelf-shell-controls-v17 --><script>try{window.CrossoverShelfBooks=BOOKS}catch(e){}</script><script src="${MY_READING}"></script><script src="${SHELL_CONTROLS}"></script></body>`);
  const headers=new Headers(response.headers); headers.set("content-type","text/html; charset=utf-8"); headers.delete("content-length");
  return new Response(injected,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener("fetch", event => {
  const req=event.request; if(req.method!=="GET") return; const url=new URL(req.url);
  if(url.origin===self.location.origin){
    const doc=url.pathname.endsWith("/")||url.pathname.endsWith("/index.html");
    event.respondWith((async()=>{try{const fresh=await fetch(req,{cache:"no-store"});if(fresh.ok){const copy=fresh.clone();const cache=await caches.open(SHELL_CACHE);cache.put(req,copy);return doc?injectModules(fresh):fresh}}catch(_){}const cached=await caches.match(req);if(cached)return doc?injectModules(cached):cached;const fallback=await caches.match("./index.html");return doc?injectModules(fallback):fallback})());
    return;
  }
  if(runtime(url)) event.respondWith((async()=>{const cache=await caches.open(RUNTIME_CACHE);try{const fresh=await fetch(req);if(fresh.ok)cache.put(req,fresh.clone());return fresh}catch(_){return cache.match(req)}})());
});
