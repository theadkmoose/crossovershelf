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
  let tries=0;
  const timer=setInterval(()=>{if(run()||++tries>40)clearInterval(timer)},100);
})();
