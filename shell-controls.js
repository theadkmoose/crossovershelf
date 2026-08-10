/* Crossover Shelf — shell controls */
(() => {
  "use strict";
  function boot(){
    if(document.getElementById("cs-shell-tools")) return;
    const style=document.createElement("style");style.id="cs-shell-style";style.textContent=`#cs-shell-tools{position:fixed;left:8px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:9000;display:flex;gap:5px;align-items:center}#cs-shell-tools button{font:600 11px/1 IBM Plex Sans,sans-serif;border:1px solid var(--ink-line,#363b47);background:rgba(18,21,29,.96);color:inherit;border-radius:999px;padding:7px 9px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.18)}@media(min-width:601px){#cs-shell-tools{left:16px;bottom:20px}}`;document.head.appendChild(style);
    const tools=document.createElement("div");tools.id="cs-shell-tools";tools.innerHTML=`<button id="cs-my-reading-btn" type="button">▦ My Reading</button><button id="cs-refresh-btn" type="button">↻ Refresh</button>`;document.body.appendChild(tools);
    document.getElementById("cs-my-reading-btn").addEventListener("click",()=>{
      const open=()=>{try{if(window.CrossoverShelfMyReading&&typeof window.CrossoverShelfMyReading.open==="function"){window.CrossoverShelfMyReading.open();return true}}catch(e){}return false};
      if(open())return;document.dispatchEvent(new CustomEvent("crossoverShelfOpenMyReading"));let n=0;const timer=setInterval(()=>{if(open()||++n>=20)clearInterval(timer)},100);
    });
    document.getElementById("cs-refresh-btn").addEventListener("click",()=>location.reload());
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
