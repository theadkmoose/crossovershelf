/* Crossover Shelf — r/Fantasy 2025 data insights
   Source: 2025_Top_Lists_Results.xlsx / Final List supplied by the user.
   This module is deterministic: it reads the source-derived summary below and never
   creates or overwrites a competing local ranking snapshot. */
(() => {
  "use strict";
  const FLAG="__CrossoverShelfRFantasyDataInsightsV1";
  if(window[FLAG]) return;
  window[FLAG]=true;

  const DATA={
    summary:{series:1345,new:1072,up:154,down:110,stable:9},
    climbers:[
      {title:"House of Leaves",author:"Mark Z. Danielewski",rank:133,prev:535,change:402},
      {title:"Covenant of Steel",author:"Anthony Ryan",rank:161,prev:535,change:374},
      {title:"Wayward Children",author:"Seanan McGuire",rank:161,prev:535,change:374},
      {title:"A Court of Thorns and Roses",author:"Sarah J. Maas",rank:183,prev:535,change:352},
      {title:"Fallen Gods / Godkiller",author:"Hannah Kaner",rank:198,prev:535,change:337}
    ],
    fallers:[
      {title:"American Gods",author:"Neil Gaiman",rank:212,prev:45,change:-167},
      {title:"Nevermoor",author:"Jessica Townsend",rank:212,prev:81,change:-131},
      {title:"The Once and Future Witches",author:"Alix E. Harrow",rank:247,prev:126,change:-121},
      {title:"The Stand",author:"Stephen King",rank:212,prev:101,change:-111},
      {title:"The Emperor's Soul",author:"Brandon Sanderson",rank:183,prev:84,change:-99}
    ],
    fresh:[
      {title:"Hierarchy",author:"James Islington",rank:29},
      {title:"Cosmere",author:"Brandon Sanderson",rank:35},
      {title:"Blood Over Bright Haven",author:"M.L. Wang",rank:53},
      {title:"Shadow of the Leviathan",author:"Robert Jackson Bennett",rank:56},
      {title:"The Tyrant Philosophers",author:"Adrian Tchaikovsky",rank:139}
    ],
    stable:[
      {title:"Discworld",author:"Terry Pratchett",rank:8,prev:8},
      {title:"The Green Bone Saga",author:"Fonda Lee",rank:10,prev:10},
      {title:"Red Rising",author:"Pierce Brown",rank:11,prev:11},
      {title:"Harry Potter",author:"J.K. Rowling",rank:12,prev:12},
      {title:"Dune",author:"Frank Herbert",rank:15,prev:15}
    ],
    authorsBySeries:[
      {author:"Brandon Sanderson",series:11,votes:590,best:4},
      {author:"Stephen King",series:11,votes:89,best:40},
      {author:"Adrian Tchaikovsky",series:10,votes:74,best:60},
      {author:"Ursula K. Le Guin",series:9,votes:236,best:16},
      {author:"K.J. Parker",series:9,votes:20,best:198}
    ],
    authorsByVotes:[
      {author:"Brandon Sanderson",series:11,votes:590,best:4},
      {author:"J.R.R. Tolkien",series:1,votes:404,best:1},
      {author:"Joe Abercrombie",series:2,votes:356,best:2},
      {author:"George R.R. Martin",series:3,votes:338,best:3},
      {author:"Robin Hobb",series:2,votes:271,best:5}
    ]
  };

  const esc=s=>String(s??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const activeTab=()=>document.querySelector('.tab-btn.active,[role="tab"][aria-selected="true"],.tab-btn[aria-current="page"]');
  const isFantasy=()=>/r\/fantasy/i.test(activeTab()?.textContent||"");

  const card=()=>{
    let el=document.getElementById("rfRankMovement");
    if(el)return el;
    const row=document.querySelector(".stats-row");
    if(!row)return null;
    el=document.createElement("section");
    el.id="rfRankMovement";
    el.className="stat-card rf-rank-movement";
    el.innerHTML='<h3 role="button" tabindex="0" aria-expanded="true">📊 Data Insights</h3><div class="stat-list" id="rfRankMovementList"></div>';
    row.appendChild(el);
    const h=el.querySelector("h3");
    const toggle=()=>{const c=el.classList.toggle("is-collapsed");h.setAttribute("aria-expanded",String(!c))};
    h.addEventListener("click",toggle);
    h.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
    return el;
  };

  const row=(x,kind,value)=>`<li class="rf-insight-row ${kind}"><span class="stat-rank">${kind==="new"?"NEW":kind==="stable"?"＝":kind==="up"?"↑":"↓"}</span><span class="rf-insight-title"><strong>${esc(x.title)}</strong><small>${esc(x.author)}</small></span><span class="stat-val">${value}</span></li>`;
  const group=(title,rows,cls)=>rows.length?`<div class="rf-insight-group ${cls}"><div class="rf-insight-label">${title}</div><ul>${rows.join("")}</ul></div>`:"";

  const render=()=>{
    const el=card();
    if(!el)return;
    if(!isFantasy()){el.style.display="none";return}
    el.style.display="";
    const list=document.getElementById("rfRankMovementList");
    if(!list)return;
    const s=DATA.summary;
    const overview=`<div class="rf-insight-overview"><div><strong>${s.series.toLocaleString()}</strong><small>series analyzed</small></div><div><strong>${s.new.toLocaleString()}</strong><small>new entries</small></div><div><strong>${s.up}</strong><small>moved up</small></div><div><strong>${s.down}</strong><small>moved down</small></div><div><strong>${s.stable}</strong><small>stable</small></div></div>`;
    const climbers=group("↑ Biggest Rank Climbers",DATA.climbers.map(x=>row(x,"up",`#${x.prev} → #${x.rank}  ↑${x.change}`)),"movement-up");
    const fallers=group("↓ Biggest Rank Fallers",DATA.fallers.map(x=>row(x,"down",`#${x.prev} → #${x.rank}  ↓${Math.abs(x.change)}`)),"movement-down");
    const fresh=group("✦ New to r/Fantasy",DATA.fresh.map(x=>row(x,"new",`#${x.rank}`)),"movement-new");
    const stable=group("＝ Holding Steady",DATA.stable.map(x=>row(x,"stable",`#${x.prev} → #${x.rank}`)),"movement-stable");
    const authors=group("👤 Authors with the most series",DATA.authorsBySeries.map((x,i)=>`<li class="rf-insight-row"><span class="stat-rank">#${i+1}</span><span class="rf-insight-title"><strong>${esc(x.author)}</strong><small>${x.series} series · best rank #${x.best}</small></span><span class="stat-val">${x.votes} votes</span></li>`),"authors-series");
    const votes=group("🏆 Authors by combined votes",DATA.authorsByVotes.map((x,i)=>`<li class="rf-insight-row"><span class="stat-rank">#${i+1}</span><span class="rf-insight-title"><strong>${esc(x.author)}</strong><small>${x.series} series · best rank #${x.best}</small></span><span class="stat-val">${x.votes} votes</span></li>`),"authors-votes");
    list.innerHTML=overview+climbers+fallers+fresh+stable+authors+votes;
  };

  const style=()=>{
    if(document.getElementById("rf-rank-movement-style"))return;
    const s=document.createElement("style");s.id="rf-rank-movement-style";s.textContent=`
      .rf-rank-movement{margin-top:12px}.rf-rank-movement .stat-list{padding-top:4px}
      .rf-insight-overview{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:4px 0 12px}
      .rf-insight-overview>div{padding:7px 4px;border:1px solid var(--ink-line);border-radius:8px;text-align:center}
      .rf-insight-overview strong{display:block;font-size:.88rem}.rf-insight-overview small{display:block;color:var(--text-dim);font-size:.55rem;margin-top:2px}
      .rf-insight-group{margin:9px 0 14px}.rf-insight-label{font:600 .65rem 'IBM Plex Mono',monospace;letter-spacing:.08em;color:var(--text-dim);text-transform:uppercase;margin:0 0 5px}
      .rf-insight-group ul{list-style:none;margin:0;padding:0}.rf-insight-row{display:flex;align-items:center;gap:8px;min-height:34px}
      .rf-insight-row .stat-rank{min-width:31px}.rf-insight-title{flex:1;min-width:0;overflow:hidden}.rf-insight-title strong,.rf-insight-title small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rf-insight-title small{color:var(--text-dim);font-size:.66rem;margin-top:1px}.rf-insight-row .stat-val{white-space:nowrap;font-size:.75rem}
      .rf-insight-row.up .stat-val{color:var(--brass)}.rf-insight-row.down .stat-val{color:var(--text-dim)}.rf-insight-row.new .stat-rank{font-size:.56rem;color:var(--brass)}.rf-insight-row.stable .stat-val{color:var(--text-dim)}
      @media(max-width:520px){.rf-insight-overview{grid-template-columns:repeat(3,minmax(0,1fr))}.rf-insight-overview>div:nth-child(4),.rf-insight-overview>div:nth-child(5){display:none}}
    `;document.head.appendChild(s);
  };

  const boot=()=>{style();setTimeout(render,50);document.addEventListener("click",e=>{if(e.target.closest(".tab-btn,.bottom-nav button"))setTimeout(render,50)});let n=0;const t=setInterval(()=>{if(document.querySelector(".stats-row")){render();clearInterval(t)}else if(++n>30)clearInterval(t)},100)};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
