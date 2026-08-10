/* Crossover Shelf — shell controls / UI only */
(() => {
  "use strict";
  function boot(){
    if(document.getElementById("cs-shell-tools")) return;
    const style=document.createElement("style");
    style.id="cs-shell-style";
    style.textContent=`
      #cs-shell-tools{
        position:fixed;
        left:50%;
        bottom:calc(150px + env(safe-area-inset-bottom));
        transform:translateX(-50%);
        z-index:90;
        display:flex;
        gap:6px;
        align-items:center;
        justify-content:center;
        pointer-events:none;
      }
      #cs-shell-tools button{
        pointer-events:auto;
        font:600 11px/1 IBM Plex Sans,sans-serif;
        border:1px solid var(--ink-line,#363b47);
        background:var(--ink-2,#1b1f28);
        color:var(--text,#eee);
        border-radius:999px;
        padding:7px 10px;
        cursor:pointer;
        box-shadow:0 3px 12px rgba(0,0,0,.16);
        white-space:nowrap;
      }
      #cs-shell-tools button:hover{border-color:var(--brass,#c89a3c)}
      #cs-ai-fab{
        right:12px !important;
        bottom:calc(150px + env(safe-area-inset-bottom)) !important;
        z-index:90 !important;
        background:var(--ink-2,#1b1f28) !important;
        color:var(--text,#eee) !important;
        border-color:var(--ink-line,#363b47) !important;
      }
      @media(max-width:600px){
        #cs-shell-tools{bottom:calc(142px + env(safe-area-inset-bottom));gap:5px}
        #cs-shell-tools button{padding:6px 9px;font-size:10px}
        #cs-ai-fab{bottom:calc(142px + env(safe-area-inset-bottom)) !important;right:10px !important}
      }
    `;
    document.head.appendChild(style);

    const tools=document.createElement("div");
    tools.id="cs-shell-tools";
    tools.innerHTML=`<button id="cs-my-reading-btn" type="button">▦ My Reading</button><button id="cs-refresh-btn" type="button">↻ Refresh</button>`;
    document.body.appendChild(tools);

    document.getElementById("cs-my-reading-btn").addEventListener("click",()=>{
      try{
        if(window.CrossoverShelfMyReading&&typeof window.CrossoverShelfMyReading.open==="function"){
          window.CrossoverShelfMyReading.open();
          return;
        }
      }catch(_){ }
      document.dispatchEvent(new CustomEvent("crossoverShelfOpenMyReading"));
    });
    document.getElementById("cs-refresh-btn").addEventListener("click",()=>location.reload());
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
