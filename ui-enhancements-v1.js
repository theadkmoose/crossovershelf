/* Crossover Shelf — isolated UI enhancements (safe layer) */
(() => {
  "use strict";
  const STYLE_ID = "cs-ui-enhancements-v1-style";
  const MENU_STATS_ID = "cs-library-stats";
  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");style.id=STYLE_ID;style.textContent=`
      .hero .hero-stats,.hero .bridge{display:none!important}
      .cs-library-stats{border:1px solid var(--ink-line,#363b47);border-radius:12px;padding:12px 12px 10px;margin:0 0 18px;background:rgba(255,255,255,.02)}
      .cs-library-stats-title{margin:0 0 9px;font:600 .68rem 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--text-dim,#a7acb7)}
      .cs-library-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .cs-library-stat{min-width:0;padding:8px 9px;border-radius:9px;background:var(--ink-3,#151821)}
      .cs-library-stat .n{display:block;font:600 1.05rem 'IBM Plex Mono',monospace;color:var(--text,#eee)}
      .cs-library-stat .l{display:block;margin-top:2px;font-size:.68rem;color:var(--text-dim,#a7acb7)}
      #csKingInsightsToggle{display:none;width:100%;margin:8px 0;border:1px solid var(--ink-line,#363b47);background:transparent;color:var(--text,#eee);border-radius:10px;padding:11px 13px;text-align:left;font:600 .82rem 'IBM Plex Sans',sans-serif;cursor:pointer}
      body.cs-king-stats-collapsed .stats-row .stat-card{display:none!important}
    `;document.head.appendChild(style);
  }
  function getBooks(){return Array.isArray(window.BOOKS)?window.BOOKS:(Array.isArray(window.CrossoverShelfBooks)?window.CrossoverShelfBooks:[])}
  function ensureMenuStats(){
    const menu=document.getElementById("cs-side-menu");if(!menu||document.getElementById(MENU_STATS_ID))return;
    const title=menu.querySelector(".cs-menu-title");if(!title)return;
    const block=document.createElement("section");block.id=MENU_STATS_ID;block.className="cs-library-stats";
    block.innerHTML=`<div class="cs-library-stats-title">Library at a glance</div><div class="cs-library-stats-grid"><div class="cs-library-stat"><span class="n mono" id="csTotalBooks">—</span><span class="l">Books tracked</span></div><div class="cs-library-stat"><span class="n mono" id="csTotalShelves">—</span><span class="l">Shelves</span></div><div class="cs-library-stat"><span class="n mono" id="csTotalAuthors">—</span><span class="l">Authors</span></div><div class="cs-library-stat"><span class="n mono" id="csTotalDecades">—</span><span class="l">Decades spanned</span></div></div>`;
    title.insertAdjacentElement("afterend",block);
  }
  function updateMenuStats(){
    const books=getBooks();if(!books.length)return false;ensureMenuStats();
    const total=document.getElementById("csTotalBooks"),shelves=document.getElementById("csTotalShelves"),authors=document.getElementById("csTotalAuthors"),decades=document.getElementById("csTotalDecades");
    if(!total||!shelves||!authors||!decades)return false;
    const shelfCount=new Set(books.map(b=>b.tab).filter(Boolean)).size;
    const authorCount=new Set(books.map(b=>String(b.author||"").trim()).filter(Boolean)).size;
    const decadeCount=new Set(books.map(b=>{const y=Number(b.year);return Number.isFinite(y)?Math.floor(y/10)*10:null}).filter(y=>y!==null)).size;
    total.textContent=books.length;shelves.textContent=shelfCount;authors.textContent=authorCount;decades.textContent=decadeCount;return true;
  }
  function currentTab(){return document.querySelector(".tab-btn.active")?.dataset.tab||""}
  function installKingToggle(){
    const row=document.querySelector(".stats-row");if(!row||row.dataset.csKingToggleInstalled)return;
    row.dataset.csKingToggleInstalled="1";
    const toggle=document.createElement("button");toggle.type="button";toggle.id="csKingInsightsToggle";toggle.textContent="Data Insights";row.parentNode.insertBefore(toggle,row);
    toggle.addEventListener("click",()=>{const collapsed=document.body.classList.toggle("cs-king-stats-collapsed");toggle.setAttribute("aria-expanded",String(!collapsed))});
    window.__CrossoverShelfKingStatsToggle=toggle;
  }
  function syncKingToggle(){
    installKingToggle();const toggle=window.__CrossoverShelfKingStatsToggle;if(!toggle)return;const king=currentTab()==="king";toggle.style.display=king?"block":"none";
    if(king){if(toggle.dataset.initialized!=="1"){document.body.classList.add("cs-king-stats-collapsed");toggle.setAttribute("aria-expanded","false");toggle.dataset.initialized="1"}}
    else{document.body.classList.remove("cs-king-stats-collapsed");toggle.dataset.initialized=""}
  }
  function removeLiteraryBridge(){document.querySelectorAll(".hero .bridge").forEach(el=>el.remove())}
  function refresh(){ensureMenuStats();removeLiteraryBridge();updateMenuStats();syncKingToggle()}
  function boot(){
    installStyle();refresh();
    document.addEventListener("click",e=>{if(e.target.closest(".tab-btn"))setTimeout(refresh,0)},true);
    document.addEventListener("crossoverShelfUIRefresh",refresh);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
