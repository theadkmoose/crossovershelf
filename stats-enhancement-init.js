/* Crossover Shelf — refresh enhanced stats after shell-controls installs */
(() => {
  "use strict";
  const run=()=>{
    const books=window.CrossoverShelfBooks||[];
    const active=document.querySelector(".tab-btn.active")?.dataset.tab;
    if(typeof window.renderStats!=="function"||!books.length||!active||active==="dashboard")return false;
    window.renderStats(books.filter(b=>b.tab===active));
    return true;
  };
  const boot=()=>{
    run();
    document.addEventListener("click",e=>{if(e.target.closest(".tab-btn"))setTimeout(run,0)},true);
    document.addEventListener("crossoverShelfStatsReady",run);
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
