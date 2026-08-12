/* Crossover Shelf — hamburger menu + global stats + r/Fantasy insights behavior */
(() => {
  "use strict";
  const BRIDGE_FLAG="__CrossoverShelfReadingRatingBridgeLoaded";
  const STATS_FLAG="__CrossoverShelfStatsEnhancementLoaded";
  const UI_FLAG="__CrossoverShelfShellV26Loaded";
  if(window[UI_FLAG]) return;
  window[UI_FLAG]=true;

  function loadBridge(){
    if(window[BRIDGE_FLAG])return;
    window[BRIDGE_FLAG]=true;
    const s=document.createElement("script");
    s.src="reading-global-sync.js?v=20260811";
    s.async=false;
    s.onerror=()=>{window[BRIDGE_FLAG]=false};
    document.head.appendChild(s);
  }

  function enhanceStats(){
    if(window[STATS_FLAG])return;
    const install=()=>{
      if(window[STATS_FLAG])return true;
      if(typeof window.renderStats!=="function")return false;
      const original=window.renderStats;
      const renderEnhanced=(list)=>{
        original(list);
        const authors=document.getElementById("statAuthors");
        const extremes=document.getElementById("statExtremes");
        if(!authors||!extremes)return;
        const byAuthor={};
        (list||[]).forEach(b=>{byAuthor[b.author]=(byAuthor[b.author]||0)+b.score});
        const topAuthors=Object.entries(byAuthor).sort((a,b)=>b[1]-a[1]).slice(0,10);
        const maxA=topAuthors.length?topAuthors[0][1]:1;
        authors.innerHTML=topAuthors.map(([name,val],i)=>`<li><span class="stat-rank mono">#${i+1}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span><div class="stat-bar-track" style="max-width:80px;"><div class="stat-bar-fill" style="width:${(val/maxA)*100}%"></div></div><span class="stat-val">${val}</span></li>`).join("")||`<li style="color:var(--text-dim);">No data for this view.</li>`;
        const sorted=[...(list||[])].sort((a,b)=>b.score-a.score);
        const top5=sorted.slice(0,5);
        const topIds=new Set(top5.map(b=>b.id));
        const bottom5=sorted.slice(-5).reverse().filter(b=>!topIds.has(b.id));
        const row=(b,high)=>`<li><span class="stat-rank">${high?"▲":"▽"}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.title}</span><span class="stat-val" style="color:${high?'var(--brass)':'var(--text-dim)'}">${b.score}</span></li>`;
        extremes.innerHTML=[...top5.map(b=>row(b,true)),...(bottom5.length?[`<li style="border-top:1px solid var(--ink-line);margin-top:2px;padding-top:9px;"></li>`]:[]),...bottom5.map(b=>row(b,false))].join("")||`<li style="color:var(--text-dim);">No data for this view.</li>`;
      };
      window.renderStats=renderEnhanced;
      window[STATS_FLAG]=true;
      return true;
    };
    if(!install()){
      let tries=0;
      const timer=setInterval(()=>{if(install()||++tries>80)clearInterval(timer)},100);
    }
  }

  function getBooks(){
    if(Array.isArray(window.CrossoverShelfBooks)) return window.CrossoverShelfBooks;
    try{return BOOKS}catch(e){return []}
  }

  function globalStats(){
    const books=getBooks();
    const total=books.length;
    const authors=new Set(books.map(b=>b.author).filter(Boolean)).size;
    const years=books.map(b=>Number(b.year)).filter(Number.isFinite);
    const decades=new Set(years.map(y=>Math.floor(y/10)*10)).size;
    const el=document.getElementById("cs-global-stats");
    if(!el)return;
    el.innerHTML=`<div class="cs-global-stat"><strong>${total}</strong><span>Books tracked</span></div><div class="cs-global-stat"><strong>3</strong><span>Shelves</span></div><div class="cs-global-stat"><strong>${authors}</strong><span>Authors</span></div><div class="cs-global-stat"><strong>${decades}</strong><span>Decades spanned</span></div>`;
  }

  function wireInsightCard(card){
    if(!card||card.dataset.csInsightWired==="1")return;
    const h=card.querySelector("h3");
    const list=card.querySelector(".stat-list");
    if(!h||!list)return;
    card.dataset.csInsightWired="1";
    h.setAttribute("role","button");
    h.setAttribute("tabindex","0");
    h.setAttribute("aria-expanded","false");
    card.classList.add("cs-insight-collapsed");
    const toggle=()=>{
      const collapsed=card.classList.toggle("cs-insight-collapsed");
      h.setAttribute("aria-expanded",String(!collapsed));
    };
    h.addEventListener("click",toggle);
    h.addEventListener("keydown",e=>{
      if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}
    });
  }

  function watchInsight(){
    const existing=document.getElementById("rfRankMovement");
    if(existing)wireInsightCard(existing);
    const mo=new MutationObserver(()=>{
      const el=document.getElementById("rfRankMovement");
      if(el)wireInsightCard(el);
    });
    mo.observe(document.body,{subtree:true,childList:true});
  }

  function boot(){
    if(document.getElementById("cs-menu-button"))return;
    loadBridge();

    const style=document.createElement("style");
    style.id="cs-menu-style-v26";
    style.textContent=`
      #cs-menu-button{position:fixed;left:12px;top:calc(15px + env(safe-area-inset-top));z-index:12000;width:44px;height:44px;border:1px solid var(--ink-line,#363b47);border-radius:12px;background:var(--ink-2,#1b1f28);color:var(--text,#eee);font-size:23px;line-height:1;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.18);transition:opacity .18s,transform .18s}
      #cs-menu-button.cs-hidden{opacity:0;pointer-events:none;transform:scale(.9)}
      #cs-menu-backdrop{position:fixed;inset:0;z-index:11998;background:rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .2s}
      #cs-menu-backdrop.open{opacity:1;pointer-events:auto}
      #cs-side-menu{position:fixed;left:0;top:0;bottom:0;width:min(310px,84vw);z-index:11999;background:var(--ink-2,#1b1f28);color:var(--text,#eee);border-right:1px solid var(--ink-line,#363b47);box-shadow:16px 0 50px rgba(0,0,0,.3);transform:translateX(-102%);transition:transform .24s ease;padding:calc(72px + env(safe-area-inset-top)) 18px 24px;box-sizing:border-box;overflow:auto}
      #cs-side-menu.open{transform:translateX(0)}
      .cs-menu-title{font:700 1.45rem Fraunces,serif;margin:0 0 16px}
      .cs-menu-section{margin:20px 0 8px;font:600 .65rem 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--text-dim,#a7acb7)}
      .cs-menu-item{width:100%;display:flex;align-items:center;gap:11px;text-align:left;border:1px solid var(--ink-line,#363b47);background:transparent;color:var(--text,#eee);border-radius:10px;padding:12px 13px;margin:7px 0;font:inherit;cursor:pointer}
      .cs-menu-item:hover{border-color:var(--brass,#c89a3c)}
      .cs-menu-close{position:absolute;right:14px;top:calc(14px + env(safe-area-inset-top));border:0;background:transparent;color:var(--text-dim,#a7acb7);font-size:26px;cursor:pointer}
      #cs-ai-fab,.cs-ai-fab,button[title="AI recommendation settings"]{display:none!important}
      #addBookBtn,#backupBtn,#themeToggle{display:none!important}
      .site-header .topline{position:relative;min-height:74px}
      .site-header .brand{position:absolute;left:50%;transform:translateX(-50%);font-size:1.22rem!important}
      .site-header .brand .txt{font-size:inherit!important}
      .site-header .header-actions{visibility:hidden;pointer-events:none}
      .site-header .tabbar{margin-top:2px}
      .method-card{display:none!important}
      /* The persistent library totals now live only in the hamburger menu. */
      .hero{display:none!important}
      .cs-global-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 18px;padding:12px;border:1px solid var(--ink-line);border-radius:12px;background:var(--ink-3)}
      .cs-global-stat{min-width:0;text-align:center}
      .cs-global-stat strong{display:block;font:600 1.35rem Fraunces,serif;color:var(--text)}
      .cs-global-stat span{display:block;margin-top:2px;font:500 .58rem 'IBM Plex Mono',monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--text-faint)}
      .stats-row .stat-card h3{cursor:pointer;user-select:none}
      .stats-row .stat-card.is-collapsed .stat-list{display:none}
      .stats-row .stat-card.is-collapsed h3::after{content:'▸';float:right;font-size:.78em;color:var(--text-dim,#a7acb7)}
      .stats-row .stat-card:not(.is-collapsed) h3::after{content:'▾';float:right;font-size:.78em;color:var(--text-dim,#a7acb7)}
      #rfRankMovement.cs-insight-collapsed .stat-list{display:none!important}
      #rfRankMovement.cs-insight-collapsed h3::after{content:'▸';float:right;font-size:.78em;color:var(--text-dim,#a7acb7)}
      #rfRankMovement:not(.cs-insight-collapsed) h3::after{content:'▾';float:right;font-size:.78em;color:var(--text-dim,#a7acb7)}
      @media(max-width:520px){.site-header .topline{min-height:68px}.site-header .brand{font-size:1.05rem!important}}
      #cs-my-reading{padding-top:calc(env(safe-area-inset-top,0px) + 16px)!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 16px)!important;overflow:hidden!important}
      #cs-my-reading .cs-mr-box{max-height:calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 32px)!important;-webkit-overflow-scrolling:touch}
    `;
    document.head.appendChild(style);

    document.querySelectorAll("button[title=\"AI recommendation settings\"]").forEach(el=>{el.setAttribute("aria-hidden","true");el.tabIndex=-1});

    const button=document.createElement("button");
    button.id="cs-menu-button";button.type="button";button.setAttribute("aria-label","Open menu");button.textContent="☰";document.body.appendChild(button);
    const backdrop=document.createElement("div");backdrop.id="cs-menu-backdrop";document.body.appendChild(backdrop);
    const menu=document.createElement("aside");
    menu.id="cs-side-menu";
    menu.innerHTML=`<button class="cs-menu-close" type="button" aria-label="Close menu">×</button><h2 class="cs-menu-title">Crossover Shelf</h2><div id="cs-global-stats" class="cs-global-stats"></div><div class="cs-menu-section">Library</div><button class="cs-menu-item" data-action="add">＋ Add a Book</button><button class="cs-menu-item" data-action="save">▣ Save</button><div class="cs-menu-section">My Reading</div><button class="cs-menu-item" data-action="reading">▦ My Reading</button><button class="cs-menu-item" data-action="ai">✦ AI Recommendations</button><div class="cs-menu-section">Scoring</div><button class="cs-menu-item" data-action="method">◎ Scoring Methodology</button><div class="cs-menu-section">App</div><button class="cs-menu-item" data-action="theme">◐ Dark Mode</button><button class="cs-menu-item" data-action="refresh">↻ Refresh</button>`;
    document.body.appendChild(menu);

    const close=()=>{menu.classList.remove("open");backdrop.classList.remove("open")};
    const open=()=>{globalStats();menu.classList.add("open");backdrop.classList.add("open")};
    button.onclick=open;backdrop.onclick=close;menu.querySelector(".cs-menu-close").onclick=close;

    menu.addEventListener("click",e=>{
      const b=e.target.closest("[data-action]");if(!b)return;
      const a=b.dataset.action;
      if(a==="reading"){close();window.CrossoverShelfMyReading?.open?.()||document.dispatchEvent(new CustomEvent("crossoverShelfOpenMyReading"))}
      else if(a==="ai"){close();const ai=document.getElementById("cs-ai-fab");if(ai)ai.click();else window.CrossoverShelfAI?.openSettings?.()||document.dispatchEvent(new CustomEvent("crossoverShelfOpenAI"))}
      else if(a==="refresh"){close();location.reload()}
      else if(a==="theme"){close();document.getElementById("themeToggle")?.click()}
      else if(a==="add"){close();document.getElementById("addBookBtn")?.click()}
      else if(a==="save"){close();document.getElementById("backupBtn")?.click()}
      else if(a==="method"){close();document.getElementById("methodBtn")?.click()}
    });

    // Keep the existing Crossover/King stats collapsible, but don't interfere with r/Fantasy's custom card.
    document.querySelectorAll(".stats-row .stat-card:not(#rfRankMovement)").forEach(card=>{
      const h=card.querySelector("h3");if(!h)return;
      h.setAttribute("role","button");h.setAttribute("tabindex","0");h.setAttribute("aria-expanded","true");
      const toggle=()=>{const collapsed=card.classList.toggle("is-collapsed");h.setAttribute("aria-expanded",String(!collapsed))};
      h.addEventListener("click",toggle);
      h.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
    });

    enhanceStats();
    watchInsight();
    globalStats();
    update();
    // r/Fantasy replaces its initial rows asynchronously; refresh global totals while that happens.
    let tries=0;
    const timer=setInterval(()=>{globalStats();if(++tries>150)clearInterval(timer)},100);
  }

  function update(){
    const button=document.getElementById("cs-menu-button");
    if(button)button.classList.toggle("cs-hidden",!!document.getElementById("cs-my-reading")?.classList.contains("open"));
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  document.addEventListener("crossoverShelfMyReadingVisibilityChanged",update);
})();
