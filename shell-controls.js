/* Crossover Shelf — lightweight shell controls */
(() => {
  "use strict";
  function boot(){
    if(!document.getElementById("cs-shell-style")){
      const style=document.createElement("style");style.id="cs-shell-style";style.textContent=`
        #cs-shell-splash{position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;background:var(--ink,#12151d);color:var(--text,#eee);opacity:1;transition:opacity .35s ease;pointer-events:auto}
        #cs-shell-splash.cs-hidden{opacity:0;pointer-events:none}.cs-splash-inner{text-align:center;padding:24px}.cs-splash-mark{width:72px;height:72px;border-radius:18px;margin:0 auto 18px;display:block;object-fit:contain}.cs-splash-title{font:700 1.65rem Fraunces,serif}.cs-splash-sub{margin-top:5px;font-size:.75rem;color:var(--text-dim,#a7acb7)}
        #cs-shell-tools{position:fixed;left:10px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:9000;display:flex;gap:6px;align-items:center;pointer-events:none}
        #cs-shell-tools button{pointer-events:auto;font:600 12px/1 IBM Plex Sans,sans-serif;border:1px solid var(--ink-line,#363b47);background:rgba(18,21,29,.94);color:inherit;border-radius:999px;padding:8px 10px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.18)}
        #cs-shell-tools button:hover{border-color:var(--brass,#c89a3c)}
        @media(max-width:600px){#cs-shell-tools{left:8px;bottom:calc(70px + env(safe-area-inset-bottom));gap:5px}#cs-shell-tools button{font-size:11px;padding:7px 9px}}
      `;document.head.appendChild(style);
    }
    if(!document.getElementById("cs-shell-splash")){const splash=document.createElement("div");splash.id="cs-shell-splash";splash.innerHTML=`<div class="cs-splash-inner"><img class="cs-splash-mark" src="./icon-192.png" alt=""><div class="cs-splash-title">Crossover Shelf</div><div class="cs-splash-sub">Literary Awards × Genre Fiction</div></div>`;document.body.appendChild(splash);setTimeout(()=>splash.classList.add("cs-hidden"),850);setTimeout(()=>splash.remove(),1250)}
    let tools=document.getElementById("cs-shell-tools");if(!tools){tools=document.createElement("div");tools.id="cs-shell-tools";tools.innerHTML=`<button id="cs-my-reading-btn" type="button">▦ My Reading</button><button id="cs-refresh-btn" type="button">↻ Refresh</button>`;document.body.appendChild(tools)}
    const mr=document.getElementById("cs-my-reading-btn");
    if(mr&&!mr.dataset.bound){mr.dataset.bound="1";mr.addEventListener("click",()=>{
      const tryOpen=()=>{if(window.CrossoverShelfMyReading&&typeof window.CrossoverShelfMyReading.open==="function"){window.CrossoverShelfMyReading.open();return true}return false};
      if(tryOpen())return;
      document.dispatchEvent(new CustomEvent("crossoverShelfOpenMyReading"));
      let attempts=0;const timer=setInterval(()=>{attempts++;if(tryOpen()||attempts>=30)clearInterval(timer)},100);
    })}
    const rf=document.getElementById("cs-refresh-btn");if(rf&&!rf.dataset.bound){rf.dataset.bound="1";rf.addEventListener("click",()=>location.reload())}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
