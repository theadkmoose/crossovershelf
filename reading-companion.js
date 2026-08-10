/* Crossover Shelf — personal reading layer
 * Adds Reading History, DNF, personal analytics, and a global AI recommendation destination
 * without rewriting the large single-file application.
 */
(() => {
  "use strict";

  const STORE = "crossoverShelfReadingHistoryV1";
  const AI_STORE = "crossoverShelfAISettings";
  const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models/";
  const DEFAULT_MODEL = "gemini-3.6-flash";
  let lastBookKey = "";

  const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (_) { return {}; } };
  const save = d => { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (_) {} };
  const keyFor = (title, author="") => `${String(title).trim().toLowerCase()}::${String(author).replace(/^by\s+/i,"").trim().toLowerCase()}`;

  function currentModal(){ return document.querySelector(".modal-backdrop.open .modal") || document.querySelector(".modal.open"); }
  function currentBook(){
    const modal=currentModal(); if(!modal) return null;
    const title=modal.querySelector(".modal-head h2")?.textContent?.trim() || "";
    const by=modal.querySelector(".modal-head .by")?.textContent?.trim() || "";
    if(!title) return null;
    const author=by.replace(/^by\s+/i,"").trim();
    const card=[...document.querySelectorAll(".card")].find(c=>c.querySelector(".card-title")?.textContent?.trim()===title);
    const read=!!card?.querySelector('.card-status[data-status="read"]');
    const body=modal.querySelector(".modal-body")?.innerText?.trim() || "";
    return {title,author,body,read,modal};
  }

  function bootstrap(){
    const data=load(); let changed=false;
    document.querySelectorAll(".card").forEach(card=>{
      const title=card.querySelector(".card-title")?.textContent?.trim(); if(!title)return;
      const author=card.querySelector(".card-author")?.textContent?.trim() || "";
      const key=keyFor(title,author); const read=!!card.querySelector('.card-status[data-status="read"]');
      if(read && !data[key]) { data[key]={title,author,status:"read",finishedAt:null,rating:null,createdAt:new Date().toISOString()}; changed=true; }
    });
    if(changed) save(data);
  }

  function injectStyles(){
    if(document.getElementById("cs-reading-styles")) return;
    const s=document.createElement("style"); s.id="cs-reading-styles"; s.textContent=`
      #cs-reading-launch{position:fixed;right:16px;bottom:calc(128px + env(safe-area-inset-bottom));z-index:95;border:1px solid var(--ink-line,#363b47);background:var(--ink-2,#1b1f28);color:var(--text,#eee);border-radius:999px;padding:9px 13px;box-shadow:0 8px 24px rgba(0,0,0,.22);font-size:.75rem;font-weight:700;cursor:pointer}
      #cs-reading-panel{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(6,8,12,.8);backdrop-filter:blur(5px)}
      #cs-reading-panel.open{display:flex}.cs-rp{width:min(860px,100%);max-height:90vh;overflow:auto;background:var(--ink-2,#1b1f28);color:var(--text,#eee);border:1px solid var(--ink-line,#363b47);border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,.45);padding:22px}.cs-rp h2{margin:0 0 4px;font-family:'Fraunces',serif}.cs-rp-sub{margin:0 0 18px;color:var(--text-dim,#a7acb7);font-size:.8rem}.cs-tabs{display:flex;gap:7px;overflow:auto;margin-bottom:16px}.cs-tab{border:1px solid var(--ink-line,#363b47);background:transparent;color:var(--text,#eee);border-radius:999px;padding:8px 11px;white-space:nowrap;cursor:pointer;font-weight:600}.cs-tab.active{background:var(--brass,#c89a3c);color:var(--ink,#12151d);border-color:var(--brass,#c89a3c)}.cs-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:16px}.cs-stat{background:var(--ink-3,#242934);border-radius:12px;padding:12px}.cs-stat b{display:block;font:700 1.25rem 'IBM Plex Mono',monospace}.cs-stat span{font-size:.68rem;color:var(--text-dim,#a7acb7);text-transform:uppercase;letter-spacing:.05em}.cs-list{display:grid;gap:8px}.cs-bookrow{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--ink-line,#363b47)}.cs-bookrow:last-child{border-bottom:0}.cs-bookrow-main{flex:1;min-width:0}.cs-bookrow-title{font-family:'Fraunces',serif;font-size:1rem}.cs-bookrow-meta{font-size:.72rem;color:var(--text-dim,#a7acb7);margin-top:3px}.cs-status{font:700 .62rem 'IBM Plex Mono',monospace;text-transform:uppercase;color:var(--brass,#c89a3c)}.cs-r-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:15px}.cs-r-btn{border:1px solid var(--ink-line,#363b47);background:transparent;color:var(--text,#eee);border-radius:9px;padding:9px 11px;cursor:pointer;font-weight:600}.cs-r-btn.primary{background:var(--brass,#c89a3c);color:var(--ink,#12151d);border-color:var(--brass,#c89a3c)}.cs-rating button{border:0;background:none;color:var(--text-dim,#a7acb7);font-size:1.2rem;cursor:pointer;padding:2px}.cs-rating button.on{color:var(--brass,#c89a3c)}.cs-empty{padding:24px 4px;color:var(--text-dim,#a7acb7);text-align:center}.cs-ai-dest{padding:15px;border:1px solid var(--ink-line,#363b47);border-radius:13px;background:var(--ink-3,#242934);margin-bottom:14px}.cs-ai-dest h3{margin:0 0 5px;font-family:'Fraunces',serif}.cs-ai-dest p{margin:0;color:var(--text-dim,#a7acb7);font-size:.78rem;line-height:1.5}.cs-ai-out{margin-top:14px}.cs-ai-card{padding:12px 0;border-bottom:1px solid var(--ink-line,#363b47)}.cs-ai-card h4{margin:0 0 3px;font-family:'Fraunces',serif;font-size:1rem}.cs-ai-card p{margin:4px 0;font-size:.77rem;line-height:1.45}.cs-modal-reading{display:none!important}.cs-status-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
      @media(max-width:600px){.cs-stats{grid-template-columns:repeat(2,1fr)}#cs-reading-launch{right:12px;bottom:calc(126px + env(safe-area-inset-bottom))}.cs-rp{padding:17px;border-radius:15px}}
    `; document.head.appendChild(s);
  }

  function ensurePanel(){
    if(document.getElementById("cs-reading-panel")) return;
    const wrap=document.createElement("div"); wrap.id="cs-reading-panel";
    wrap.innerHTML=`<div class="cs-rp"><h2>My Reading</h2><p class="cs-rp-sub">Your reading history, progress, DNF list, analytics, and AI discovery in one place.</p><div class="cs-tabs"><button class="cs-tab active" data-tab="history">History</button><button class="cs-tab" data-tab="analytics">Analytics</button><button class="cs-tab" data-tab="ai">What Should I Read Next?</button></div><div id="cs-reading-content"></div><div class="cs-r-actions"><button class="cs-r-btn" id="cs-reading-close" type="button">Close</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener("click",e=>{if(e.target===wrap)closePanel(); const tab=e.target.closest(".cs-tab"); if(tab){wrap.querySelectorAll(".cs-tab").forEach(x=>x.classList.remove("active"));tab.classList.add("active");renderTab(tab.dataset.tab)} const statusBtn=e.target.closest("[data-reading-key][data-reading-status]");if(statusBtn){const d=load(),rec=d[statusBtn.dataset.readingKey];if(rec){setStatus({title:rec.title,author:rec.author},statusBtn.dataset.readingStatus);renderTab("history");}}});
    wrap.querySelector("#cs-reading-close").addEventListener("click",closePanel);
  }
  function openPanel(tab="history"){ensurePanel();document.getElementById("cs-reading-panel").classList.add("open");document.querySelectorAll(".cs-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));renderTab(tab)}
  function closePanel(){document.getElementById("cs-reading-panel")?.classList.remove("open")}
  function addLaunch(){if(document.getElementById("cs-reading-launch"))return;const b=document.createElement("button");b.id="cs-reading-launch";b.textContent="▦ My Reading";b.addEventListener("click",()=>openPanel("history"));document.body.appendChild(b)}

  function statusFor(book){const d=load(); return d[keyFor(book.title,book.author)] || (book.read?{title:book.title,author:book.author,status:"read",rating:null}:null)}
  function setStatus(book,status){const d=load(),k=keyFor(book.title,book.author),old=d[k]||{title:book.title,author:book.author,createdAt:new Date().toISOString()};old.status=status;if(status==="currently-reading"&&!old.startedAt)old.startedAt=new Date().toISOString();if(status==="read")old.finishedAt=new Date().toISOString();if(status==="dnf")old.dnfAt=new Date().toISOString();d[k]=old;save(d);renderTab("history")}
  function setRating(book,rating){const d=load(),k=keyFor(book.title,book.author),old=d[k]||{title:book.title,author:book.author,status:book.read?"read":"want-to-read",createdAt:new Date().toISOString()};old.rating=rating;d[k]=old;save(d)}
  function renderModalControls(){return;}
  function records(){return Object.values(load()).filter(x=>x&&x.title)}

  function renderHistory(){
    const all=records().sort((a,b)=>new Date(b.finishedAt||b.dnfAt||b.startedAt||b.createdAt||0)-new Date(a.finishedAt||a.dnfAt||a.startedAt||a.createdAt||0));
    const read=all.filter(x=>x.status==="read"), current=all.filter(x=>x.status==="currently-reading"), dnf=all.filter(x=>x.status==="dnf");
    const list=all.slice(0,100);
    return `<div class="cs-stats"><div class="cs-stat"><b>${read.length}</b><span>Read</span></div><div class="cs-stat"><b>${current.length}</b><span>Currently Reading</span></div><div class="cs-stat"><b>${all.filter(x=>x.status==="want-to-read").length}</b><span>Want to Read</span></div><div class="cs-stat"><b>${dnf.length}</b><span>DNF</span></div></div><div class="cs-list">${list.length?list.map(x=>{const k=keyFor(x.title,x.author);return `<div class="cs-bookrow"><div class="cs-bookrow-main"><div class="cs-bookrow-title">${esc(x.title)}</div><div class="cs-bookrow-meta">${esc(x.author||"")}${x.finishedAt?` · Finished ${new Date(x.finishedAt).toLocaleDateString()}`:x.dnfAt?` · DNF ${new Date(x.dnfAt).toLocaleDateString()}`:x.startedAt?` · Started ${new Date(x.startedAt).toLocaleDateString()}`:""}</div><div class="cs-r-actions"><button class="cs-r-btn ${x.status==="read"?"primary":""}" data-reading-key="${esc(k)}" data-reading-status="read" type="button">Read</button><button class="cs-r-btn ${x.status==="currently-reading"?"primary":""}" data-reading-key="${esc(k)}" data-reading-status="currently-reading" type="button">Reading</button><button class="cs-r-btn ${x.status==="want-to-read"?"primary":""}" data-reading-key="${esc(k)}" data-reading-status="want-to-read" type="button">Want</button><button class="cs-r-btn ${x.status==="dnf"?"primary":""}" data-reading-key="${esc(k)}" data-reading-status="dnf" type="button">DNF</button></div></div><div><div class="cs-status">${esc(x.status.replaceAll("-"," "))}</div>${x.rating?`<div class="cs-rating">${"★".repeat(x.rating)}${"☆".repeat(5-x.rating)}</div>`:""}</div></div>`}).join(""):`<div class="cs-empty">Your reading history will appear here as you mark books Read, Currently Reading, or DNF.</div>`}</div>`;
  }

  function renderAnalytics(){
    const r=records(),read=r.filter(x=>x.status==="read"),rated=read.filter(x=>x.rating),avg=rated.length?(rated.reduce((s,x)=>s+x.rating,0)/rated.length).toFixed(1):"—",started=r.filter(x=>x.startedAt).length,completed=read.length+r.filter(x=>x.status==="dnf").length,completion=completed?Math.round(read.length/completed*100):0;
    const months={};read.forEach(x=>{if(x.finishedAt){const d=new Date(x.finishedAt),m=d.toLocaleString(undefined,{month:"short",year:"numeric"});months[m]=(months[m]||0)+1}});const recent=Object.entries(months).slice(-6);
    return `<div class="cs-stats"><div class="cs-stat"><b>${read.length}</b><span>Books Read</span></div><div class="cs-stat"><b>${avg}</b><span>Average Rating</span></div><div class="cs-stat"><b>${started}</b><span>Books Started</span></div><div class="cs-stat"><b>${completion||0}%</b><span>Completion Rate</span></div></div><div class="cs-ai-dest"><h3>Your Reading Profile</h3><p>${read.length?`You've recorded ${read.length} finished book${read.length===1?"":"s"}${rated.length?`, averaging ${avg}/5`:""}. ${r.filter(x=>x.status==="dnf").length?`You have ${r.filter(x=>x.status==="dnf").length} DNF${r.filter(x=>x.status==="dnf").length===1?"":"s"}.`:""}`:"Start tracking statuses and ratings to build your personal reading profile."}</p></div><h3 style="font-family:'Fraunces',serif">Finished by month</h3><div class="cs-list">${recent.length?recent.map(([m,n])=>`<div class="cs-bookrow"><div class="cs-bookrow-main">${esc(m)}</div><strong>${n}</strong></div>`).join(""):`<div class="cs-empty">Finish dates will populate this view automatically.</div>`}</div>`;
  }

  async function globalAI(){
    const settings=(()=>{try{return JSON.parse(localStorage.getItem(AI_STORE)||"{}")}catch(_){return {}}})();
    if(!settings.apiKey){alert("Open ✦ AI first and add your Gemini API key.");return}
    const r=records(),read=r.filter(x=>x.status==="read"),tbr=r.filter(x=>x.status==="want-to-read");
    if(!read.length){alert("Mark at least one book Read so AI can personalize your recommendations.");return}
    const content=document.getElementById("cs-reading-content");content.innerHTML=`<div class="cs-ai-dest"><h3>What Should I Read Next?</h3><p>Gemini will use your reading history, ratings, and Want-to-Read list to suggest six books.</p><div class="cs-r-actions"><button class="cs-r-btn primary" id="cs-run-global-ai">Find My Next Books</button></div><div class="cs-ai-out" id="cs-global-out"></div></div>`;
    content.querySelector("#cs-run-global-ai").addEventListener("click",async()=>{
      const out=content.querySelector("#cs-global-out");out.innerHTML="<p>Asking Gemini…</p>";
      const prompt=`You are the recommendation engine for a personal book library. Recommend exactly 6 real published books the reader is likely to love next. Use the reader's highest-rated/read books and their Want-to-Read list. Do not recommend any already-read or already-listed book. Favor strong thematic, tonal, stylistic, or author connections. Return JSON only with recommendations:[{title,author,match,why,connections}].\n\nREAD BOOKS:\n${read.map(x=>`- ${x.title} — ${x.author} — rating ${x.rating||"unrated"}`).join("\n")}\n\nWANT-TO-READ:\n${tbr.map(x=>`- ${x.title} — ${x.author}`).join("\n")||"None"}`;
      try{const model=settings.model||DEFAULT_MODEL;const endpoint=`${API_ROOT}${encodeURIComponent(model)}:generateContent`;const schema={type:"object",properties:{recommendations:{type:"array",items:{type:"object",properties:{title:{type:"string"},author:{type:"string"},match:{type:"integer"},why:{type:"string"},connections:{type:"string"}},required:["title","author","match","why","connections"]}}},required:["recommendations"]};const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":settings.apiKey},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",responseSchema:schema}})});const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||`Gemini request failed (${res.status})`);const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";const parsed=JSON.parse(text);const recs=parsed.recommendations||[];out.innerHTML=recs.slice(0,6).map(x=>`<div class="cs-ai-card"><h4>${esc(x.title)} <span style="color:var(--brass,#c89a3c);font:700 .65rem 'IBM Plex Mono'">${esc(x.match)}%</span></h4><p><strong>${esc(x.author)}</strong></p><p>${esc(x.why)}</p><p style="color:var(--text-dim,#a7acb7)">${esc(x.connections)}</p></div>`).join("")||"<p>No recommendations returned.</p>";}catch(e){out.innerHTML=`<p style="color:var(--crimson,#d77)">${esc(e.message)}</p>`}
    });
  }
  function renderTab(tab){const c=document.getElementById("cs-reading-content");if(!c)return;if(tab==="history")c.innerHTML=renderHistory();else if(tab==="analytics")c.innerHTML=renderAnalytics();else globalAI()}
  function watchModal(){const observer=new MutationObserver(()=>{const b=currentBook();if(b){const k=keyFor(b.title,b.author);if(k!==lastBookKey){lastBookKey=k}else if(!document.querySelector(".cs-modal-reading"))renderModalControls();}});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});}
  function init(){injectStyles();bootstrap();ensurePanel();addLaunch();watchModal();setTimeout(()=>{bootstrap();renderModalControls()},500)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
