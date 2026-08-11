/* Crossover Shelf — r/Fantasy rank movement */
(() => {
  "use strict";
  const KEY = "crossover-shelf-rfantasy-ranking-v1";
  const FLAG = "__CrossoverShelfRankMovementLoaded";
  if (window[FLAG]) return;
  window[FLAG] = true;

  const esc = s => String(s ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const getActiveTab = () => document.querySelector('.tab-btn.active,[role="tab"][aria-selected="true"],.tab-btn[aria-current="page"]');
  const isFantasy = () => /r\/fantasy/i.test(getActiveTab()?.textContent || "");
  const fullFantasyList = () => {
    const books = window.CrossoverShelfBooks || [];
    const tab = getActiveTab()?.dataset?.tab;
    return tab ? books.filter(b => b.tab === tab) : [];
  };
  const loadPrevious = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (_) { return null; } };
  const saveCurrent = list => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        savedAt: Date.now(),
        positions: Object.fromEntries(list.map((b, i) => [String(b.id), { rank: i + 1, title: b.title }]))
      }));
    } catch (_) {}
  };
  const card = () => {
    let el = document.getElementById("rfRankMovement");
    if (!el) {
      el = document.createElement("section");
      el.id = "rfRankMovement";
      el.className = "stat-card rf-rank-movement";
      el.innerHTML = `<h3 role="button" tabindex="0" aria-expanded="true">Rank Movement</h3><div class="stat-list" id="rfRankMovementList"></div>`;
      const row = document.querySelector(".stats-row");
      if (row) row.appendChild(el); else return null;
      const h = el.querySelector("h3");
      const toggle = () => { const c = el.classList.toggle("is-collapsed"); h.setAttribute("aria-expanded", String(!c)); };
      h.addEventListener("click", toggle);
      h.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    }
    return el;
  };
  const render = () => {
    const el = card();
    if (!el) return;
    if (!isFantasy()) { el.style.display = "none"; return; }
    el.style.display = "";
    const current = fullFantasyList();
    const list = document.getElementById("rfRankMovementList");
    if (!list || !current.length) { if (list) list.innerHTML = `<div class="rf-empty">No r/Fantasy ranking data.</div>`; return; }
    const previous = loadPrevious();
    if (!previous?.positions) {
      list.innerHTML = `<div class="rf-empty">No previous ranking snapshot yet. Movement will appear after the next ranking update.</div>`;
      saveCurrent(current);
      return;
    }
    const up = [], down = [], stable = [], fresh = [];
    current.forEach((b, i) => {
      const now = i + 1;
      const old = previous.positions[String(b.id)];
      if (!old) { fresh.push({ b, now }); return; }
      const delta = old.rank - now;
      if (Math.abs(delta) <= 1) stable.push({ b, now, delta });
      else if (delta > 0) up.push({ b, now, delta });
      else down.push({ b, now, delta });
    });
    up.sort((a,b)=>b.delta-a.delta); down.sort((a,b)=>a.delta-b.delta); stable.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)); fresh.sort((a,b)=>a.now-b.now);
    const row = (x, cls, symbol, suffix) => `<li class="rf-movement-row ${cls}"><span class="stat-rank">${symbol}</span><span class="rf-movement-title">${esc(x.b.title)}</span><span class="stat-val">${suffix}</span></li>`;
    const section = (title, rows) => rows.length ? `<div class="rf-movement-group"><div class="rf-movement-label">${title}</div><ul>${rows.slice(0,5).join("")}</ul></div>` : "";
    const html = section("↑ Moved Up", up.map(x=>row(x,"up","↑",`+${x.delta}`))) +
      section("↓ Moved Down", down.map(x=>row(x,"down","↓",`${x.delta}`))) +
      section("✦ New Entries", fresh.map(x=>row(x,"new","NEW",`#${x.now}`))) +
      section("＝ Stable", stable.map(x=>row(x,"stable","＝",x.delta===0?"No change":"±1")));
    list.innerHTML = html || `<div class="rf-empty">No meaningful movement since the previous snapshot.</div>`;
    saveCurrent(current);
  };
  const injectStyle = () => {
    if (document.getElementById("rf-rank-movement-style")) return;
    const s = document.createElement("style"); s.id = "rf-rank-movement-style";
    s.textContent = `.rf-rank-movement{margin-top:12px}.rf-rank-movement .stat-list{padding-top:4px}.rf-movement-group{margin:7px 0 12px}.rf-movement-label{font:600 .65rem 'IBM Plex Mono',monospace;letter-spacing:.08em;color:var(--text-dim);text-transform:uppercase;margin:0 0 5px}.rf-movement-group ul{list-style:none;margin:0;padding:0}.rf-movement-row{display:flex;align-items:center;gap:8px;min-height:30px}.rf-movement-row .stat-rank{min-width:30px}.rf-movement-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rf-movement-row.up .stat-val{color:var(--brass)}.rf-movement-row.down .stat-val{color:var(--text-dim)}.rf-movement-row.new .stat-rank{font-size:.58rem;color:var(--brass)}.rf-movement-row.stable .stat-val{color:var(--text-dim)}.rf-empty{color:var(--text-dim);font-size:.82rem;line-height:1.45;padding:4px 0 8px}`;
    document.head.appendChild(s);
  };
  const boot = () => { injectStyle(); render(); document.addEventListener("click", e => { if (e.target.closest(".tab-btn,.bottom-nav button")) setTimeout(render, 0); }); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true }); else boot();
  const observer = new MutationObserver(() => { if (document.querySelector(".stats-row")) render(); });
  observer.observe(document.documentElement, { childList:true, subtree:true });
})();
