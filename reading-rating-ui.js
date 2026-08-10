/* Crossover Shelf — My Reading personal rating + title detail UI */
(() => {
  "use strict";
  const STORE = "crossoverShelfReadingHistoryV1";
  let refreshing = false;
  const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (_) { return {}; } };
  const save = d => { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (_) {} };
  const keyFor = (title,author="") => `${String(title).trim().toLowerCase()}::${String(author).replace(/^by\s+/i,"").trim().toLowerCase()}`;
  const infoFromRow = row => { const title=row?.querySelector(".cs-bookrow-title")?.textContent?.trim()||""; const meta=row?.querySelector(".cs-bookrow-meta")?.textContent?.trim()||""; const author=(meta.split(" · ")[0]||"").trim(); return title?{title,author,key:keyFor(title,author)}:null; };
  function styles(){if(document.getElementById("cs-rating-ui-styles"))return;const s=document.createElement("style");s.id="cs-rating-ui-styles";s.textContent=`
    .cs-bookrow-title{cursor:pointer!important;text-decoration:none!important}.cs-bookrow-title:hover{text-decoration:underline!important}
    .cs-my-rating{display:flex;align-items:center;gap:5px;margin-top:6px}.cs-my-rating-label{font-size:.64rem;color:var(--text-dim,#a7acb7);text-transform:uppercase;letter-spacing:.05em}.cs-my-rating button{border:0;background:transparent;color:var(--text-dim,#a7acb7);font-size:1.15rem;line-height:1;padding:1px;cursor:pointer}.cs-my-rating button.on{color:var(--brass,#c89a3c)}
    #cs-my-reading-detail{position:fixed;inset:0;z-index:11000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.74);backdrop-filter:blur(5px)}
    .cs-mrd-card{width:min(500px,100%);max-height:90vh;overflow:auto;background:var(--ink-2,#1b1f28);color:var(--text,#eee);border:1px solid var(--ink-line,#363b47);border-radius:18px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,.5)}
    .cs-mrd-head{display:flex;justify-content:space-between;gap:12px}.cs-mrd-title{font:700 1.35rem 'Fraunces',serif}.cs-mrd-author{margin-top:4px;color:var(--text-dim,#a7acb7);font-size:.82rem}.cs-mrd-close{border:0;background:transparent;color:inherit;font-size:1.5rem;cursor:pointer}.cs-mrd-label{display:block;margin:20px 0 8px;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-dim,#a7acb7)}.cs-mrd-stars{display:flex;gap:3px}.cs-mrd-stars button{border:0;background:transparent;color:var(--text-dim,#a7acb7);font-size:2rem;line-height:1;cursor:pointer}.cs-mrd-stars button.on{color:var(--brass,#c89a3c)}.cs-mrd-status{display:grid;grid-template-columns:1fr 1fr;gap:8px}.cs-mrd-status button{border:1px solid var(--ink-line,#363b47);background:transparent;color:inherit;border-radius:9px;padding:10px;cursor:pointer}.cs-mrd-status button.active{background:var(--brass,#c89a3c);color:var(--ink,#12151d);border-color:var(--brass,#c89a3c)}
  `;document.head.appendChild(s)}
  function ensureRecord(info){const d=load();const r=d[info.key]||{title:info.title,author:info.author,status:"want-to-read",rating:null,createdAt:new Date().toISOString()};d[info.key]=r;save(d);return r}
  function setRating(info,n){const d=load(),r=ensureRecord(info);r.rating=n;d[info.key]=r;save(d);refresh();updateDetailStars(n)}
  function setStatus(info,status){const d=load(),r=ensureRecord(info);r.status=status;if(status==="currently-reading"&&!r.startedAt)r.startedAt=new Date().toISOString();if(status==="read"&&!r.finishedAt)r.finishedAt=new Date().toISOString();if(status==="dnf"&&!r.dnfAt)r.dnfAt=new Date().toISOString();d[info.key]=r;save(d);refresh();openDetail(info)}
  function updateDetailStars(n){document.querySelectorAll("#cs-my-reading-detail .cs-mrd-stars button").forEach((b,i)=>{b.textContent=i<n?"★":"☆";b.classList.toggle("on",i<n)})}
  function closeDetail(){document.getElementById("cs-my-reading-detail")?.remove()}
  function openDetail(info){closeDetail();const r=load()[info.key]||{status:"want-to-read",rating:null};const ov=document.createElement("div");ov.id="cs-my-reading-detail";const card=document.createElement("div");card.className="cs-mrd-card";card.innerHTML=`<div class="cs-mrd-head"><div><div class="cs-mrd-title">${esc(info.title)}</div><div class="cs-mrd-author">${esc(info.author)}</div></div><button class="cs-mrd-close" type="button" aria-label="Close">×</button></div><span class="cs-mrd-label">Your rating</span><div class="cs-mrd-stars"></div><span class="cs-mrd-label">Reading status</span><div class="cs-mrd-status"></div>`;ov.appendChild(card);document.body.appendChild(ov);card.querySelector(".cs-mrd-close").onclick=closeDetail;ov.addEventListener("click",e=>{if(e.target===ov)closeDetail()});const stars=card.querySelector(".cs-mrd-stars");for(let n=1;n<=5;n++){const b=document.createElement("button");b.type="button";b.textContent=n<=(r.rating||0)?"★":"☆";b.className=n<=(r.rating||0)?"on":"";b.setAttribute("aria-label",`Rate ${n} out of 5`);b.onclick=()=>setRating(info,n);stars.appendChild(b)}const box=card.querySelector(".cs-mrd-status");[["want-to-read","Want to Read"],["currently-reading","Currently Reading"],["read","Read"],["dnf","Did Not Finish"]].forEach(([value,label])=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.className=r.status===value?"active":"";b.onclick=()=>setStatus(info,value);box.appendChild(b)})}
  function refresh(){
    if(refreshing)return;
    const panel=document.getElementById("cs-reading-panel");if(!panel)return;
    refreshing=true;
    try{
      const data=load();
      panel.querySelectorAll(".cs-bookrow").forEach(row=>{
        const info=infoFromRow(row);if(!info)return;
        const r=data[info.key];if(!r)return;
        let box=row.querySelector(".cs-my-rating");
        if(!box){box=document.createElement("div");box.className="cs-my-rating";row.querySelector(".cs-bookrow-main")?.appendChild(box)}
        const current=Number(r.rating)||0;
        box.dataset.rating=String(current);
        if(!box.querySelector("button")){
          box.innerHTML=`<span class="cs-my-rating-label">Your rating</span>`+Array.from({length:5},(_,i)=>`<button type="button" data-rate="${i+1}" aria-label="Rate ${i+1} out of 5">${i+1<=current?"★":"☆"}</button>`).join("");
          box.querySelectorAll("button").forEach(b=>b.onclick=e=>{e.stopPropagation();setRating(info,Number(b.dataset.rate))});
        } else {
          box.querySelectorAll("button").forEach((b,i)=>{b.textContent=i<current?"★":"☆";b.classList.toggle("on",i<current)});
        }
      });
    } finally {refreshing=false;}
  }
  function install(){
    styles();
    document.addEventListener("click",e=>{const title=e.target.closest(".cs-bookrow-title");if(title){const info=infoFromRow(title.closest(".cs-bookrow"));if(info){e.preventDefault();e.stopPropagation();openDetail(info)}}},true);
    refresh();
    // Do not observe the entire document: this module changes the My Reading DOM itself.
    // A light periodic check handles tab/shelf switches without creating a mutation loop.
    setInterval(refresh,1500);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();
