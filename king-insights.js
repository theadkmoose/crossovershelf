(()=>{
"use strict";
const FLAG="__CrossoverShelfKingInsightsV1";
if(window[FLAG])return;
window[FLAG]=true;

function isKingPage(){
  const active=[...document.querySelectorAll("[role='tab'].active,[role='tab'][aria-selected='true'],.tab.active,.tab-btn.active,button.active")];
  if(active.some(el=>/king/i.test((el.textContent||"").trim())))return true;
  const visible=[...document.querySelectorAll("h1,h2,h3,.page-title,.shelf-title")].filter(el=>{
    const s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden";
  });
  return visible.some(el=>/stephen king/i.test(el.textContent||""));
}

function findCard(label){
  return [...document.querySelectorAll(".stat-card")].find(card=>{
    const h=card.querySelector("h3");
    return h&&h.textContent.trim().toLowerCase()===label.toLowerCase();
  });
}

function wire(card){
  if(!card)return;
  const h=card.querySelector("h3");
  const list=card.querySelector(".stat-list");
  if(!h||!list)return;
  if(card.dataset.kingInsightWired!=="1"){
    card.dataset.kingInsightWired="1";
    h.setAttribute("role","button");
    h.setAttribute("tabindex","0");
    const toggle=()=>{
      const collapsed=card.classList.toggle("king-insight-collapsed");
      h.setAttribute("aria-expanded",String(!collapsed));
    };
    h.addEventListener("click",toggle);
    h.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
  }
  if(isKingPage()){
    if(!card.dataset.kingInsightInitialized){
      card.classList.add("king-insight-collapsed");
      h.setAttribute("aria-expanded","false");
      card.dataset.kingInsightInitialized="1";
    }
  }else{
    card.classList.remove("king-insight-collapsed");
    h.setAttribute("aria-expanded","true");
    delete card.dataset.kingInsightInitialized;
  }
}

function apply(){
  const styleId="king-insights-style-v1";
  if(!document.getElementById(styleId)){
    const s=document.createElement("style");s.id=styleId;s.textContent=`
      .king-insight-collapsed .stat-list{display:none!important}
      .king-insight-collapsed h3::after{content:'▸';float:right;color:var(--text-dim,#a7acb7);font-size:.78em}
      .stat-card:not(.king-insight-collapsed) h3::after{content:'▾';float:right;color:var(--text-dim,#a7acb7);font-size:.78em}
      .king-insight-collapsed{padding-bottom:10px!important}
    `;document.head.appendChild(s);
  }
  wire(findCard("Top Authors"));
  wire(findCard("Score Extremes"));
}

let pending=false;
function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;apply()},40)}
apply();
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});
document.addEventListener("click",schedule,{passive:true});
[200,600,1200,2500].forEach(ms=>setTimeout(apply,ms));
})();
