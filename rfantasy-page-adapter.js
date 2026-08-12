/* r/Fantasy page-scoped adapter. Does not mutate BOOKS or call global render(). */
(()=>{
  "use strict";
  if(window.__rfPageAdapterV1)return;
  window.__rfPageAdapterV1=true;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const parse=text=>text.trim().split(/\r?\n/).filter(Boolean).slice(1).map(line=>{const p=line.split(",");return {title:p[0],author:p[1],rank:Number(p[2]),votes:Number(p[3]),previousRank:p[4]===""?null:Number(p[4]),rankChange:p[5]===""?null:Number(p[5]),goodreads:p.slice(6).join(",")}}).filter(r=>r.votes>=10);
  async function load(){const res=await fetch("rfantasy-2025-10plus.csv",{cache:"no-store"});if(!res.ok)throw Error("r/Fantasy source unavailable");window.__rfPageRows=parse(await res.text());return window.__rfPageRows;}
  function active(){return typeof state!=="undefined"&&state.tab==="rfantasy";}
  function cleanStats(){if(!active())return;document.querySelectorAll(".stat-card,.stats-card,.stat-block").forEach(el=>{const t=(el.textContent||"").replace(/\s+/g," ");if(/top authors|score extremes|highest score|lowest score/i.test(t))el.remove()})}
  function insights(){if(!active())return;let host=document.getElementById("rfPageInsights");if(!host){host=document.createElement("section");host.id="rfPageInsights";host.className="stat-card";const row=document.querySelector(".stats-row");if(!row)return;row.prepend(host)}const d=window.__rfPageRows||[];const up=d.filter(x=>x.rankChange>0).sort((a,b)=>b.rankChange-a.rankChange).slice(0,5),down=d.filter(x=>x.rankChange<0).sort((a,b)=>a.rankChange-b.rankChange).slice(0,5),fresh=d.filter(x=>x.previousRank==null).sort((a,b)=>a.rank-b.rank).slice(0,5),stable=d.filter(x=>x.rankChange===0).sort((a,b)=>a.rank-b.rank).slice(0,5);const list=a=>a.map(x=>`<li><strong>#${x.rank} ${esc(x.title)}</strong><small>${esc(x.author)} · ${x.votes} votes</small></li>`).join("");host.innerHTML=`<h3>📊 Data Insights</h3><p>${d.length} books with 10+ votes</p><h4>Biggest Rank Climbers</h4><ul>${list(up)}</ul><h4>Biggest Rank Fallers</h4><ul>${list(down)}</ul><h4>New Entries</h4><ul>${list(fresh)}</ul><h4>Holding Steady</h4><ul>${list(stable)}</ul>`;cleanStats()}
  window.RFantasyPage={load,cleanStats,insights,rows:()=>window.__rfPageRows||[]};
})();
