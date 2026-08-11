/* Crossover Shelf — legacy compatibility bridge */
(() => {
  "use strict";
  const STATUS_KEY = "crossover-shelf-status-v1";
  function loadStatus(){try{return JSON.parse(localStorage.getItem(STATUS_KEY)||"{}")}catch(_){return {}}}
  function syncThroughStore(){
    const store=window.CrossoverShelfReadingStore;
    if(!store?.syncFromStatusMap)return false;
    store.syncFromStatusMap(loadStatus());
    return true;
  }
  function init(){
    if(syncThroughStore())return;
    document.addEventListener("DOMContentLoaded",syncThroughStore,{once:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
