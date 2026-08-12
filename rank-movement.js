/* Crossover Shelf — r/Fantasy XLSX-backed shelf + insights.
   Final safe implementation: preserve the app's complete book schema, preserve existing IDs
   for matching titles, and keep Crossover Shelf / King rendering unchanged. */
(()=>{
"use strict";
const FLAG="__CrossoverShelfRFantasyFinalV1";
if(window[FLAG])return;window[FLAG]=true;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const parseCSV=text=>{
 const lines=text.trim().split(/\r?\n/).filter(Boolean);
 return lines.slice(1).map(line=>{
   const p=line.split(",");
   return {title:(p[0]||"").trim(),author:(p[1]||"").trim(),rank:Number(p[2]),votes:Number(p[3]),prev:p[4]===""?null:Number(p[4]),change:p[5]===""?null:Number(p[5]),goodreads:p.slice(6).join(",").trim()};
 }).filter(r=>r.title&&Number.isFinite(r.rank)&&Number.isFinite(r.votes)&&r.votes>=10);
};
const key=s=>String(s||"").trim().toLowerCase().replace(/[’']/g,"'");
function makeBook(row,oldByTitle,template){
 const old=oldByTitle.get(key(row.title));
 const b=old?Object.assign({},old):Object.assign({},template);
 b.id=old?old.id:"rf-"+row.rank+"-"+row.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
 b.tab="rfantasy";b.title=row.title;b.author=row.author;b.series=old?.series||row.title;b.seriesPos=old?.seriesPos||1;
 b.year=old?.year||0;b.rating=old?.rating||0;b.pages=old?.pages||0;b.genre=old?.genre||"Fantasy & Speculative";b.subgenre=old?.subgenre||"";
 b.honors=`r/Fantasy 2025 · Rank #${row.rank} · ${row.votes} votes`;
 b.tags=Array.isArray(old?.tags)?[...old.tags]:[];b.audio=old?.audio?Object.assign({},old.audio):null;
 b.goodreads=row.goodreads||old?.goodreads||null;
 b.rfRank=row.rank;b.rfVotes=row.votes;b.rfPreviousRank=row.prev;b.rfRankChange=row.change;
 b.score=100000-row.rank;b.tier="";b.decade=b.year?Math.floor(b.year/10)*10:0;
 return b;
}
function install(rows){
 if(typeof BOOKS==="undefined"||!Array.isArray(BOOKS)||!BOOKS.length)return [];
 const old=BOOKS.filter(b=>b.tab==="rfantasy"),oldByTitle=new Map(old.map(b=>[key(b.title),b])),template=old[0]||BOOKS[0];
 const books=rows.map(r=>makeBook(r,oldByTitle,template));
 BOOKS.splice(0,BOOKS.length,...BOOKS.filter(b=>b.tab!=="rfantasy"),...books);
 window.__rfBooks=books;return books;
}
function rfActive(){return typeof state!=="undefined"&&state.tab==="rfantasy";}
function hideRfStats(){
 if(!rfActive())return;
 ["statAuthorsTitle","statExtremes"].forEach(id=>{const el=document.getElementById(id);const card=el?.closest(".stat-card");if(card)card.style.display="none";});
}
function showNormalStats(){
 if(rfActive())return;
 ["statAuthorsTitle","statExtremes"].forEach(id=>{const el=document.getElementById(id);const card=el?.closest(".stat-card");if(card)card.style.display="";});
}
function decorateCards(){
 if(!rfActive())return;
 const byId=new Map((window.__rfBooks||[]).map(b=>[b.id,b]));
 document.querySelectorAll(".card[data-id]").forEach(card=>{
   const b=byId.get(card.dataset.id);if(!b)return;
   card.querySelectorAll(".single-score").forEach(el=>el.style.display="none");
   card.querySelectorAll(".tier-pill").forEach(el=>el.style.display="none");
   const year=card.querySelector(".card-year");if(year)year.textContent=`Rank #${b.rfRank}`;
   const foot=card.querySelector(".card-foot span:first-child");if(foot)foot.textContent=`#${b.rfRank} · ${b.rfVotes} votes`;
 });
 hideRfStats();
}
function fixRfModal(){
 if(!rfActive())return;
 const id=typeof currentModalBookId!=="undefined"?currentModalBookId:null;
 const b=(window.__rfBooks||[]).find(x=>x.id===id);if(!b)return;
 const modal=document.getElementById("bookModalBackdrop");if(!modal||!modal.classList.contains("open"))return;
 const tier=document.getElementById("m-tier");if(tier){tier.textContent=`r/Fantasy 2025 · Rank #${b.rfRank}`;tier.className="tier-pill";}
 const meta=modal.querySelector(".meta-row");if(meta)meta.innerHTML=`<span><b>#${b.rfRank}</b> rank</span><span><b>${b.rfVotes}</b> community votes</span>`;
 const honors=document.getElementById("m-honors");if(honors)honors.textContent=`r/Fantasy 2025 · Rank #${b.rfRank} · ${b.rfVotes} votes`;
 const score=document.querySelector("#bookModalBackdrop .single-score");if(score)score.style.display="none";
}
function style(){
 if(document.getElementById("rf-final-style"))return;
 const s=document.createElement("style");s.id="rf-final-style";s.textContent=`.rf-rank-movement{margin-top:12px}.rf-insight-overview{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:4px 0 12px}.rf-insight-overview>div{padding:7px 4px;border:1px solid var(--ink-line);border-radius:8px;text-align:center}.rf-insight-overview strong{display:block;font-size:.88rem}.rf-insight-overview small{display:block;color:var(--text-dim);font-size:.55rem;margin-top:2px}.rf-insight-group{margin:9px 0 14px}.rf-insight-label{font:600 .65rem 'IBM Plex Mono',monospace;letter-spacing:.08em;color:var(--text-dim);text-transform:uppercase;margin:0 0 5px}.rf-insight-group ul{list-style:none;margin:0;padding:0}.rf-insight-row{display:flex;align-items:center;gap:8px;min-height:34px}.rf-insight-row .stat-rank{min-width:31px}.rf-insight-title{flex:1;min-width:0;overflow:hidden}.rf-insight-title strong,.rf-insight-title small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rf-insight-title small{color:var(--text-dim);font-size:.66rem;margin-top:1px}.rf-insight-row .stat-val{white-space:nowrap;font-size:.75rem}.rf-insight-row.up .stat-val{color:var(--brass)}.rf-insight-row.new .stat-rank{color:var(--brass)}@media(max-width:520px){.rf-insight-overview{grid-template-columns:repeat(3,minmax(0,1fr))}.rf-insight-overview>div:nth-child(4),.rf-insight-overview>div:nth-child(5){display:none}}`;document.head.appendChild(s);
}
function insights(){
 if(typeof state==="undefined")return;
 if(!rfActive()){showNormalStats();const old=document.getElementById("rfRankMovement");if(old)old.style.display="none";return;}
 hideRfStats();
 let el=document.getElementById("rfRankMovement"),row=document.querySelector(".stats-row");
 if(!el&&row){el=document.createElement("section");el.id="rfRankMovement";el.className="stat-card rf-rank-movement";el.innerHTML='<h3>📊 Data Insights</h3><div class="stat-list" id="rfRankMovementList"></div>';row.appendChild(el);}
 if(!el)return;el.style.display="";
 const d=window.__rfRows||[],list=document.getElementById("rfRankMovementList");if(!list)return;
 const up=d.filter(x=>x.change>0).sort((a,b)=>b.change-a.change).slice(0,5),down=d.filter(x=>x.change<0).sort((a,b)=>a.change-b.change).slice(0,5),fresh=d.filter(x=>x.prev===null).sort((a,b)=>a.rank-b.rank).slice(0,5),stable=d.filter(x=>x.change===0).sort((a,b)=>a.rank-b.rank).slice(0,5);
 const counts={series:d.length,new:d.filter(x=>x.prev===null).length,up:d.filter(x=>x.change>0).length,down:d.filter(x=>x.change<0).length,stable:d.filter(x=>x.change===0).length};
 const item=(x,k,v)=>`<li class="rf-insight-row ${k}"><span class="stat-rank">${k==="new"?"NEW":k==="stable"?"＝":k==="up"?"↑":"↓"}</span><span class="rf-insight-title"><strong>${esc(x.title)}</strong><small>${esc(x.author)} · ${x.votes} votes</small></span><span class="stat-val">${v}</span></li>`;
 const group=(t,a,c)=>a.length?`<div class="rf-insight-group ${c}"><div class="rf-insight-label">${t}</div><ul>${a.join("")}</ul></div>`:"";
 list.innerHTML=`<div class="rf-insight-overview"><div><strong>${counts.series}</strong><small>books · 10+ votes</small></div><div><strong>${counts.new}</strong><small>new entries</small></div><div><strong>${counts.up}</strong><small>moved up</small></div><div><strong>${counts.down}</strong><small>moved down</small></div><div><strong>${counts.stable}</strong><small>stable</small></div></div>`+
 group("↑ Biggest Rank Climbers",up.map(x=>item(x,"up",`#${x.prev} → #${x.rank} ↑${x.change}`)),"movement-up")+
 group("↓ Biggest Rank Fallers",down.map(x=>item(x,"down",`#${x.prev} → #${x.rank} ↓${Math.abs(x.change)}`)),"movement-down")+
 group("✦ New to r/Fantasy",fresh.map(x=>item(x,"new",`#${x.rank}`)),"movement-new")+
 group("＝ Holding Steady",stable.map(x=>item(x,"stable",`#${x.rank} → #${x.rank}`)),"movement-stable");
 decorateCards();fixRfModal();
}
async function boot(){
 style();
 try{
   const res=await fetch("rfantasy-2025-10plus.csv",{cache:"no-store"});if(!res.ok)throw Error("dataset fetch failed");
   const rows=parseCSV(await res.text());window.__rfRows=rows;
   if(rows.length){install(rows);if(rfActive()&&typeof render==="function")render();}
   setTimeout(insights,80);
 }catch(e){console.error("r/Fantasy dataset:",e)}
 document.addEventListener("click",e=>{const tab=e.target.closest(".tab-btn,.bottom-nav button");if(tab)setTimeout(()=>{if(rfActive()&&typeof render==="function")render();insights();},80)});
 const mo=document.getElementById("bookModalBackdrop");if(mo)new MutationObserver(()=>{if(mo.classList.contains("open"))setTimeout(fixRfModal,0)}).observe(mo,{attributes:true,attributeFilter:["class"]});
 document.addEventListener("click",()=>{if(rfActive())setTimeout(()=>{decorateCards();fixRfModal();},0)});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
