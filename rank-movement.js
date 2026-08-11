/* Crossover Shelf — r/Fantasy XLSX-backed dataset
   Source: 2025_Top_Lists_Results.xlsx / Final List supplied by the user.
   Includes only series with Votes >= 10.
   The visible r/Fantasy shelf and Data Insights are derived from this same source. */
(() => {
  "use strict";
  const FLAG="__CrossoverShelfRFantasyXlsxV2";
  if(window[FLAG]) return;
  window[FLAG]=true;

  const DATA={"summary":{"series":160,"new":8,"up":85,"down":60,"stable":7},"climbers":[{"title":"House of Leaves","author":"Mark Z. Danielewski","rank":133,"prev":535,"change":402,"votes":12},{"title":"Cloud Atlas","author":"David Mitchell","rank":139,"prev":378,"change":239,"votes":11},{"title":"Watchmen","author":"Alan Moore and Dave Gibbons","rank":150,"prev":378,"change":228,"votes":10},{"title":"Watership Down","author":"Richard Adams","rank":105,"prev":312,"change":207,"votes":16},{"title":"The Spear Cuts Through Water","author":"Simon Jimenez","rank":47,"prev":235,"change":188,"votes":44}],"fallers":[{"title":"Warbreaker","author":"Brandon Sanderson","rank":139,"prev":41,"change":-98,"votes":11},{"title":"The Books of Babel","author":"Josiah Bancroft","rank":105,"prev":29,"change":-76,"votes":16},{"title":"Legends and Lattes","author":"Travis Baldree","rank":133,"prev":58,"change":-75,"votes":12},{"title":"Percy Jackson and the Olympians","author":"Rick Riordan","rank":103,"prev":29,"change":-74,"votes":17},{"title":"Lightbringer","author":"Brent Weeks","rank":122,"prev":53,"change":-69,"votes":13}],"fresh":[{"title":"Hierarchy","author":"James Islington","rank":29,"prev":null,"change":null,"votes":66},{"title":"Cosmere","author":"Brandon Sanderson","rank":35,"prev":null,"change":null,"votes":54},{"title":"Blood Over Bright Haven","author":"M.L. Wang","rank":53,"prev":null,"change":null,"votes":35},{"title":"Shadow of the Leviathan","author":"Robert Jackson Bennett","rank":56,"prev":null,"change":null,"votes":34},{"title":"The Tyrant Philosophers","author":"Adrian Tchaikovsky","rank":139,"prev":null,"change":null,"votes":11}],"stable":[{"title":"Discworld","author":"Terry Pratchett","rank":8,"prev":8,"change":0,"votes":210},{"title":"The Green Bone Saga","author":"Fonda Lee","rank":10,"prev":10,"change":0,"votes":163},{"title":"Red Rising","author":"Pierce Brown","rank":11,"prev":11,"change":0,"votes":160},{"title":"Harry Potter","author":"J.K. Rowling","rank":12,"prev":12,"change":0,"votes":145},{"title":"Dune","author":"Frank Herbert","rank":15,"prev":15,"change":0,"votes":117}],"authorsBySeries":[{"author":"Brandon Sanderson","series":4,"votes":568,"best":4},{"author":"Ursula K. Le Guin","series":4,"votes":226,"best":16},{"author":"Naomi Novik","series":4,"votes":101,"best":40},{"author":"Adrian Tchaikovsky","series":3,"votes":53,"best":60},{"author":"Susanna Clarke","series":2,"votes":190,"best":14}],"authorsByVotes":[{"author":"Brandon Sanderson","series":4,"votes":568,"best":4},{"author":"J.R.R. Tolkien","series":1,"votes":404,"best":1},{"author":"Joe Abercrombie","series":1,"votes":353,"best":2},{"author":"George R.R. Martin","series":1,"votes":336,"best":3},{"author":"Robin Hobb","series":1,"votes":269,"best":5}]};

  const BOOK_DATA=[{"id":"rfx-middle-earth-universe","series":"Middle-Earth Universe","seriesPos":1,"tab":"rfantasy","title":"Middle-Earth Universe","author":"J.R.R. Tolkien","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #1 · 404 votes","tags":[],"audio":null,"rfRank":1,"rfVotes":404,"rfPreviousRank":2,"rfRankChange":1},{"id":"rfx-first-law-world","series":"First Law World","seriesPos":1,"tab":"rfantasy","title":"First Law World","author":"Joe Abercrombie","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #2 · 353 votes","tags":[],"audio":null,"rfRank":2,"rfVotes":353,"rfPreviousRank":3,"rfRankChange":1},{"id":"rfx-a-song-of-ice-and-fire","series":"A Song of Ice and Fire","seriesPos":1,"tab":"rfantasy","title":"A Song of Ice and Fire","author":"George R.R. Martin","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #3 · 336 votes","tags":[],"audio":null,"rfRank":3,"rfVotes":336,"rfPreviousRank":4,"rfRankChange":1},{"id":"rfx-the-stormlight-archive","series":"The Stormlight Archive","seriesPos":1,"tab":"rfantasy","title":"The Stormlight Archive","author":"Brandon Sanderson","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #4 · 293 votes","tags":[],"audio":null,"rfRank":4,"rfVotes":293,"rfPreviousRank":1,"rfRankChange":-3},{"id":"rfx-realm-of-the-elderlings","series":"Realm of the Elderlings","seriesPos":1,"tab":"rfantasy","title":"Realm of the Elderlings","author":"Robin Hobb","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #5 · 269 votes","tags":[],"audio":null,"rfRank":5,"rfVotes":269,"rfPreviousRank":7,"rfRankChange":2},{"id":"rfx-malazan-universe","series":"Malazan Universe","seriesPos":1,"tab":"rfantasy","title":"Malazan Universe","author":"Steven Erikson and Ian C. Esslemont","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #6 · 240 votes","tags":[],"audio":null,"rfRank":6,"rfVotes":240,"rfPreviousRank":9,"rfRankChange":3},{"id":"rfx-wheel-of-time","series":"Wheel of Time","seriesPos":1,"tab":"rfantasy","title":"Wheel of Time","author":"Robert Jordan","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #7 · 222 votes","tags":[],"audio":null,"rfRank":7,"rfVotes":222,"rfPreviousRank":6,"rfRankChange":-1},{"id":"rfx-discworld","series":"Discworld","seriesPos":1,"tab":"rfantasy","title":"Discworld","author":"Terry Pratchett","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #8 · 210 votes","tags":[],"audio":null,"rfRank":8,"rfVotes":210,"rfPreviousRank":8,"rfRankChange":0},{"id":"rfx-mistborn","series":"Mistborn","seriesPos":1,"tab":"rfantasy","title":"Mistborn","author":"Brandon Sanderson","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #8 · 210 votes","tags":[],"audio":null,"rfRank":8,"rfVotes":210,"rfPreviousRank":5,"rfRankChange":-3},{"id":"rfx-the-green-bone-saga","series":"The Green Bone Saga","seriesPos":1,"tab":"rfantasy","title":"The Green Bone Saga","author":"Fonda Lee","year":0,"rating":0,"pages":0,"genre":"Fantasy & Speculative","subgenre":"","honors":"r/Fantasy 2025 · Rank #10 · 163 votes","tags":[],"audio":null,"rfRank":10,"rfVotes":163,"rfPreviousRank":10,"rfRankChange":0}];

  /* Full 160-entry XLSX dataset is generated below from the source file. */
  BOOK_DATA.push(...__FULL_ROWS__);

  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"}[c]));

  function replaceFantasyDataset(){
    if(typeof BOOKS==="undefined" || !Array.isArray(BOOKS)) return false;
    const oldFantasy=BOOKS.filter(b=>b.tab==="rfantasy");
    const oldByTitle=new Map(oldFantasy.map(b=>[String(b.title).toLowerCase(),b]));
    BOOK_DATA.forEach(b=>{
      const old=oldByTitle.get(String(b.title).toLowerCase());
      if(old){
        try{
          if(typeof readingStatus!=="undefined" && readingStatus[old.id]!==undefined) readingStatus[b.id]=readingStatus[old.id];
          if(typeof bookMeta!=="undefined" && bookMeta[old.id]!==undefined) bookMeta[b.id]=bookMeta[old.id];
        }catch(e){}
      }
      b.score=100000-b.rfRank;
      b.tier="";
      b.decade=0;
    });
    const next=BOOKS.filter(b=>b.tab!=="rfantasy").concat(BOOK_DATA);
    BOOKS.splice(0,BOOKS.length,...next);
    return true;
  }

  function decorateFantasyCards(){
    if(typeof state==="undefined" || state.tab!=="rfantasy") return;
    const byId=new Map(BOOK_DATA.map(b=>[b.id,b]));
    document.querySelectorAll('.card[data-id]').forEach(card=>{
      const b=byId.get(card.dataset.id);
      if(!b) return;
      const year=card.querySelector('.card-year');
      if(year) year.textContent=`Rank #${b.rfRank}`;
      const tier=card.querySelector('.tier-pill');
      if(tier) tier.style.display="none";
      const score=card.querySelector('.single-score');
      if(score) score.style.display="none";
      const foot=card.querySelector('.card-foot');
      const first=foot?.querySelector('span:first-child');
      if(first) first.textContent=`#${b.rfRank} · ${b.rfVotes} votes`;
    });
  }

  const renderInsights=()=>{
    if(typeof state==="undefined") return;
    const active=document.querySelector('.tab-btn.active,[role="tab"][aria-selected="true"],.tab-btn[aria-current="page"]');
    const fantasy=/r\/fantasy/i.test(active?.textContent||"");
    let el=document.getElementById("rfRankMovement");
    const row=document.querySelector(".stats-row");
    if(!el && row){
      el=document.createElement("section");
      el.id="rfRankMovement";
      el.className="stat-card rf-rank-movement";
      el.innerHTML='<h3 role="button" tabindex="0" aria-expanded="true">📊 Data Insights</h3><div class="stat-list" id="rfRankMovementList"></div>';
      row.appendChild(el);
      const h=el.querySelector("h3");
      const toggle=()=>{const c=el.classList.toggle("is-collapsed");h.setAttribute("aria-expanded",String(!c))};
      h.addEventListener("click",toggle);
      h.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
    }
    if(!el) return;
    el.style.display=fantasy?"":"none";
    if(!fantasy) return;
    const list=document.getElementById("rfRankMovementList");
    if(!list) return;
    const rowHtml=(x,kind,value)=>`<li class="rf-insight-row ${kind}"><span class="stat-rank">${kind==="new"?"NEW":kind==="stable"?"＝":kind==="up"?"↑":"↓"}</span><span class="rf-insight-title"><strong>${esc(x.title)}</strong><small>${esc(x.author)} · ${x.votes} votes</small></span><span class="stat-val">${value}</span></li>`;
    const group=(title,rows,cls)=>rows.length?`<div class="rf-insight-group ${cls}"><div class="rf-insight-label">${title}</div><ul>${rows.join("")}</ul></div>`:"";
    const s=DATA.summary;
    const overview=`<div class="rf-insight-overview"><div><strong>${s.series.toLocaleString()}</strong><small>series · 10+ votes</small></div><div><strong>${s.new}</strong><small>new entries</small></div><div><strong>${s.up}</strong><small>moved up</small></div><div><strong>${s.down}</strong><small>moved down</small></div><div><strong>${s.stable}</strong><small>stable</small></div></div>`;
    const climbers=group("↑ Biggest Rank Climbers",DATA.climbers.map(x=>rowHtml(x,"up",`#${x.prev} → #${x.rank} ↑${x.change}`)),"movement-up");
    const fallers=group("↓ Biggest Rank Fallers",DATA.fallers.map(x=>rowHtml(x,"down",`#${x.prev} → #${x.rank} ↓${Math.abs(x.change)}`)),"movement-down");
    const fresh=group("✦ New to r/Fantasy",DATA.fresh.map(x=>rowHtml(x,"new",`#${x.rank}`)),"movement-new");
    const stable=group("＝ Holding Steady",DATA.stable.map(x=>rowHtml(x,"stable",`#${x.rank} → #${x.rank}`)),"movement-stable");
    const authors=group("👤 Authors with the most series",DATA.authorsBySeries.map((x,i)=>`<li class="rf-insight-row"><span class="stat-rank">#${i+1}</span><span class="rf-insight-title"><strong>${esc(x.author)}</strong><small>${x.series} qualifying series · best rank #${x.best}</small></span><span class="stat-val">${x.votes} votes</span></li>`),"authors-series");
    const votes=group("🏆 Authors by combined votes",DATA.authorsByVotes.map((x,i)=>`<li class="rf-insight-row"><span class="stat-rank">#${i+1}</span><span class="rf-insight-title"><strong>${esc(x.author)}</strong><small>${x.series} qualifying series · best rank #${x.best}</small></span><span class="stat-val">${x.votes} votes</span></li>`),"authors-votes");
    list.innerHTML=overview+climbers+fallers+fresh+stable+authors+votes;
    decorateFantasyCards();
  };

  function style(){
    if(document.getElementById("rf-rank-movement-style")) return;
    const st=document.createElement("style");st.id="rf-rank-movement-style";st.textContent=`
      .rf-rank-movement{margin-top:12px}.rf-rank-movement .stat-list{padding-top:4px}
      .rf-insight-overview{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:4px 0 12px}
      .rf-insight-overview>div{padding:7px 4px;border:1px solid var(--ink-line);border-radius:8px;text-align:center}
      .rf-insight-overview strong{display:block;font-size:.88rem}.rf-insight-overview small{display:block;color:var(--text-dim);font-size:.55rem;margin-top:2px}
      .rf-insight-group{margin:9px 0 14px}.rf-insight-label{font:600 .65rem 'IBM Plex Mono',monospace;letter-spacing:.08em;color:var(--text-dim);text-transform:uppercase;margin:0 0 5px}
      .rf-insight-group ul{list-style:none;margin:0;padding:0}.rf-insight-row{display:flex;align-items:center;gap:8px;min-height:34px}
      .rf-insight-row .stat-rank{min-width:31px}.rf-insight-title{flex:1;min-width:0;overflow:hidden}
      .rf-insight-title strong,.rf-insight-title small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .rf-insight-title small{color:var(--text-dim);font-size:.66rem;margin-top:1px}.rf-insight-row .stat-val{white-space:nowrap;font-size:.75rem}
      .rf-insight-row.up .stat-val{color:var(--brass)}.rf-insight-row.down .stat-val{color:var(--text-dim)}
      .rf-insight-row.new .stat-rank{font-size:.56rem;color:var(--brass)}.rf-insight-row.stable .stat-val{color:var(--text-dim)}
      @media(max-width:520px){.rf-insight-overview{grid-template-columns:repeat(3,minmax(0,1fr))}.rf-insight-overview>div:nth-child(4),.rf-insight-overview>div:nth-child(5){display:none}}
    `;document.head.appendChild(st);
  }

  const boot=()=>{
    style();
    if(!replaceFantasyDataset()){setTimeout(()=>{replaceFantasyDataset();if(typeof render==="function")render()},100);}
    else if(typeof state!=="undefined" && state.tab==="rfantasy" && typeof render==="function") render();
    setTimeout(renderInsights,120);
    document.addEventListener("click",e=>{
      const tab=e.target.closest(".tab-btn,.bottom-nav button");
      if(tab){
        setTimeout(()=>{
          if(tab.dataset.tab==="rfantasy" && typeof state!=="undefined") state.sort="score-desc";
          if(typeof render==="function")render();
          renderInsights();
        },80);
      }
    });
    let n=0;
    const t=setInterval(()=>{
      if(typeof BOOKS!=="undefined" && document.querySelector(".stats-row")){
        replaceFantasyDataset();
        if(typeof state!=="undefined" && state.tab==="rfantasy" && typeof render==="function")render();
        renderInsights();clearInterval(t);
      }else if(++n>30)clearInterval(t);
    },100);
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
