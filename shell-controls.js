/* Crossover Shelf — lightweight shell controls */
(() => {
  "use strict";
  const boot = () => {
    if (document.getElementById("cs-shell-style")) return;
    const style = document.createElement("style");
    style.id = "cs-shell-style";
    style.textContent = `
      #cs-shell-splash{position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;background:var(--ink,#12151d);color:var(--text,#eee);opacity:1;transition:opacity .35s ease;pointer-events:auto}
      #cs-shell-splash.cs-hidden{opacity:0;pointer-events:none}
      .cs-splash-inner{text-align:center;padding:24px}.cs-splash-mark{width:72px;height:72px;border-radius:18px;margin:0 auto 18px;display:block;object-fit:contain}.cs-splash-title{font:700 1.65rem Fraunces,serif}.cs-splash-sub{margin-top:5px;font-size:.75rem;color:var(--text-dim,#a7acb7)}
      #cs-refresh-btn{font:inherit;border:1px solid var(--ink-line,#363b47);background:transparent;color:inherit;border-radius:999px;padding:7px 11px;cursor:pointer;margin-left:7px}
      #cs-refresh-btn:hover{border-color:var(--brass,#c89a3c)}
    `;
    document.head.appendChild(style);

    if (!document.getElementById("cs-shell-splash")) {
      const splash=document.createElement("div"); splash.id="cs-shell-splash";
      splash.innerHTML=`<div class="cs-splash-inner"><img class="cs-splash-mark" src="./icon-192.png" alt=""><div class="cs-splash-title">Crossover Shelf</div><div class="cs-splash-sub">Literary Awards × Genre Fiction</div></div>`;
      document.body.appendChild(splash);
      window.setTimeout(()=>splash.classList.add("cs-hidden"),850);
      window.setTimeout(()=>splash.remove(),1250);
    }

    if (!document.getElementById("cs-refresh-btn")) {
      const nav=document.querySelector("nav");
      if(nav){
        const b=document.createElement("button");
        b.id="cs-refresh-btn"; b.type="button"; b.textContent="↻ Refresh"; b.title="Refresh Crossover Shelf";
        b.addEventListener("click",()=>window.location.reload());
        nav.appendChild(b);
      }
    }
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
})();
