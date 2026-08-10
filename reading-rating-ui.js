/* Crossover Shelf — My Reading UI cleanup + personal rating */
(() => {
  "use strict";
  const STORE = "crossoverShelfReadingHistoryV1";
  const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (_) { return {}; } };
  const save = d => { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (_) {} };
  const keyFor = (title, author="") => `${String(title).trim().toLowerCase()}::${String(author).replace(/^by\s+/i,"").trim().toLowerCase()}`;

  function installStyles(){
    if(document.getElementById("cs-rating-ui-styles")) return;
    const s=document.createElement("style"); s.id="cs-rating-ui-styles"; s.textContent=`
      #cs-reading-content{display:flex;flex-direction:column;gap:14px}
      .cs-reading-section{border:1px solid var(--border,#2b2e36);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)}
      .cs-reading-section-title{font-weight:700;font-size:.82rem;letter-spacing:.04em;text-transform:uppercase;margin-bottom:9px;color:var(--text,#f3f3f3)}
      .cs-bookrow{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07)}
      .cs-bookrow:last-child{border-bottom:0}
      .cs-bookrow-main{min-width:0;flex:1}
      .cs-bookrow-title{font-weight:700;cursor:pointer;text-decoration:none}
      .cs-bookrow-title:hover{text-decoration:underline}
      .cs-personal-rating{margin-top:7px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .cs-personal-rating-label{font-size:.66rem;color:var(--text-dim,#a7acb7);text-transform:uppercase;letter-spacing:.04em}
      .cs-personal-rating-stars{display:inline-flex;gap:1px}
      .cs-personal-rating-stars button{border:0;background:transparent;color:var(--text-dim,#a7acb7);font-size:1.08rem;line-height:1;padding:2px;cursor:pointer}
      .cs-personal-rating-stars button:hover,.cs-personal-rating-stars button.on{color:var(--brass,#c89a3c)}
      .cs-reading-detail{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72)}
      .cs-reading-detail-card{width:min(520px,100%);max-height:88vh;overflow:auto;border:1px solid var(--border,#2b2e36);border-radius:18px;background:var(--panel,#17191f);padding:20px;box-shadow:0 20px 70px rgba(0,0,0,.45)}
      .cs-reading-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
      .cs-reading-detail-title{font-size:1.25rem;font-weight:800}
      .cs-reading-detail-author{margin-top:3px;color:var(--text-dim,#a7acb7)}
      .cs-reading-detail-close{border:0;background:transparent;color:inherit;font-size:1.5rem;cursor:pointer}
      .cs-reading-detail-label{display:block;margin:18px 0 7px;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-dim,#a7acb7)}
      .cs-reading-detail-stars{display:flex;gap:4px}
      .cs-reading-detail-stars button{border:0;background:transparent;font-size:1.8rem;line-height:1;color:var(--text-dim,#a7acb7);cursor:pointer;padding:3px}
      .cs-reading-detail-stars button.on{color:var(--brass,#c89a3c)}
      .cs-reading-detail-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .cs-reading-detail-actions button{border:1px solid var(--border,#2b2e36);background:transparent;color:inherit;border-radius:9px;padding:8px 11px;cursor:pointer}
      .cs-reading-detail-actions button.active{background:var(--brass,#c89a3c);color:#111;border-color:var(--brass,#c89a3c)}
      @media(max-width:600px){.cs-reading-detail{padding:10px}.cs-reading-detail-card{max-height:94vh;padding:16px}}
    `; document.head.appendChild(s);
  }

  function getRowData(row){
    const title=row.querySelector(".cs-bookrow-title")?.textContent?.trim();
    const meta=row.querySelector(".cs-bookrow-meta")?.textContent?.trim() || "";
    if(!title) return null;
    return {title,author:meta.split(" · ")[0].trim(),key:keyFor(title,meta.split(" · ")[0].trim())};
  }

  function updateRating(key,n){
    const d=load(),r=d[key]; if(!r)return;
    r.rating=n; d[key]=r; save(d);
    try{window.dispatchEvent(new CustomEvent("crossoverShelfReadingRatingChanged",{detail:{key,rating:n}}));}catch(_){}
    renderRatings();
  }

  function renderRatings(){
    const panel=document.getElementById("cs-reading-panel");
    if(!panel || !panel.classList.contains("open")) return;
    panel.querySelectorAll(".cs-personal-rating").forEach(e=>e.remove());
    panel.querySelectorAll(".cs-bookrow").forEach(row=>{
      const info=getRowData(row); if(!info)return;
      const rec=load()[info.key]; if(!rec)return;
      const box=document.createElement("div"); box.className="cs-personal-rating";
      const label=document.createElement("span"); label.className="cs-personal-rating-label"; label.textContent="Your rating";
      const stars=document.createElement("span"); stars.className="cs-personal-rating-stars";
      for(let n=1;n<=5;n++){
        const b=document.createElement("button"); b.type="button"; b.textContent=n<=(Number(rec.rating)||0)?"★":"☆"; b.title=`Rate ${n} out of 5`;
        b.addEventListener("click",e=>{e.stopPropagation();updateRating(info.key,n);}); stars.appendChild(b);
      }
      box.append(label,stars); row.querySelector(".cs-bookrow-main")?.appendChild(box);
      const title=row.querySelector(".cs-bookrow-title");
      if(title && !title.dataset.csReadingDetailBound){
        title.dataset.csReadingDetailBound="1";
        title.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openDetail(info);});
      }
    });
  }

  function openDetail(info){
    closeDetail();
    const rec=load()[info.key] || {};
    const overlay=document.createElement("div"); overlay.className="cs-reading-detail"; overlay.id="cs-reading-detail";
    const card=document.createElement("div"); card.className="cs-reading-detail-card";
    card.innerHTML=`<div class="cs-reading-detail-head"><div><div class="cs-reading-detail-title">${esc(info.title)}</div><div class="cs-reading-detail-author">${esc(info.author)}</div></div><button class="cs-reading-detail-close" type="button" aria-label="Close">×</button></div><span class="cs-reading-detail-label">Your rating</span><div class="cs-reading-detail-stars"></div><span class="cs-reading-detail-label">Reading status</span><div class="cs-reading-detail-actions"></div>`;
    overlay.appendChild(card); document.body.appendChild(overlay);
    card.querySelector(".cs-reading-detail-close").onclick=closeDetail;
    overlay.addEventListener("click",e=>{if(e.target===overlay)closeDetail();});
    const stars=card.querySelector(".cs-reading-detail-stars");
    for(let n=1;n<=5;n++){const b=document.createElement("button");b.type="button";b.textContent=n<=(Number(rec.rating)||0)?"★":"☆";b.className=n<=(Number(rec.rating)||0)?"on":"";b.onclick=()=>{updateRating(info.key,n);for(let i=0;i<stars.children.length;i++){stars.children[i].textContent=i<n?"★":"☆";stars.children[i].classList.toggle("on",i<n);}};stars.appendChild(b);}
    const actions=card.querySelector(".cs-reading-detail-actions");
    ["want","reading","read","dnf"].forEach(status=>{const b=document.createElement("button");b.type="button";b.textContent={want:"Want to Read",reading:"Currently Reading",read:"Read",dnf:"Did Not Finish"}[status];b.className=rec.status===status?"active":"";b.onclick=()=>{const d=load(),r=d[info.key]||{};r.status=status;d[info.key]=r;save(d);actions.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");try{window.dispatchEvent(new CustomEvent("crossoverShelfReadingStatusChanged",{detail:{key:info.key,status}}));}catch(_){};renderRatings();};actions.appendChild(b);});
  }
  function closeDetail(){document.getElementById("cs-reading-detail")?.remove();}

  function observe(){
    const panel=document.getElementById("cs-reading-panel");
    if(panel){new MutationObserver(()=>renderRatings()).observe(panel,{childList:true,subtree:true});renderRatings();return;}
    setTimeout(observe,300);
  }
  installStyles(); observe();
})();
