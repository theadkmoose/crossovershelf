/* Crossover Shelf — personal rating UI enhancement */
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
      .cs-personal-rating{margin-top:7px;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
      .cs-personal-rating-label{font-size:.66rem;color:var(--text-dim,#a7acb7);text-transform:uppercase;letter-spacing:.04em}
      .cs-personal-rating-stars{display:inline-flex;gap:1px}
      .cs-personal-rating-stars button{border:0;background:transparent;color:var(--text-dim,#a7acb7);font-size:1.05rem;line-height:1;padding:2px;cursor:pointer}
      .cs-personal-rating-stars button:hover,.cs-personal-rating-stars button.on{color:var(--brass,#c89a3c)}
    `; document.head.appendChild(s);
  }

  function renderRatings(){
    const panel=document.getElementById("cs-reading-panel");
    if(!panel || !panel.classList.contains("open")) return;
    const content=panel.querySelector("#cs-reading-content");
    if(!content) return;
    content.querySelectorAll(".cs-bookrow").forEach(row=>{
      if(row.querySelector(".cs-personal-rating")) return;
      const title=row.querySelector(".cs-bookrow-title")?.textContent?.trim();
      const meta=row.querySelector(".cs-bookrow-meta")?.textContent?.trim() || "";
      if(!title) return;
      const author=meta.split(" · ")[0].trim();
      const key=keyFor(title,author), data=load(), rec=data[key];
      if(!rec) return;
      const box=document.createElement("div"); box.className="cs-personal-rating";
      const label=document.createElement("span"); label.className="cs-personal-rating-label"; label.textContent="Your rating";
      const stars=document.createElement("span"); stars.className="cs-personal-rating-stars";
      for(let n=1;n<=5;n++){
        const b=document.createElement("button"); b.type="button"; b.textContent=n<=(Number(rec.rating)||0)?"★":"☆"; b.title=`Rate ${n} out of 5`;
        b.addEventListener("click",()=>{
          const d=load(),r=d[key]; if(!r)return;
          r.rating=n; d[key]=r; save(d); renderRatings();
          try { window.dispatchEvent(new CustomEvent("crossoverShelfReadingRatingChanged",{detail:{key,rating:n}})); } catch(_) {}
        }); stars.appendChild(b);
      }
      box.append(label,stars); row.querySelector(".cs-bookrow-main")?.appendChild(box);
    });
  }

  function observe(){
    const panel=document.getElementById("cs-reading-panel");
    if(panel){ new MutationObserver(()=>renderRatings()).observe(panel,{childList:true,subtree:true}); renderRatings(); return; }
    setTimeout(observe,300);
  }

  installStyles(); observe();
})();
