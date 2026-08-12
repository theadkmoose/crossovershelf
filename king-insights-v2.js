(()=>{
"use strict";
const FLAG="__CrossoverShelfKingInsightsV2";
if(window[FLAG])return;
window[FLAG]=true;
function isKingPage(){
  const active=[...document.querySelectorAll("[role='tab'].active,[role='tab'][aria-selected='true'],.tab.active,.tab-btn.active,button.active")];
  if(active.some(el=>/king/i.test((el.textContent||"").trim())))return true;
  return [...document.querySelectorAll("h1,h2,h3,.page-title,.shelf-title")].some(el=>{const s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden"&&/stephen king/i.test(el.textContent||"")});
}
function card(label){return [...document.querySelectorAll(".stat-card")].find(c=>c.querySelector("h3")?.textContent.trim().toLowerCase()===label.toLowerCase())}
function wire(c){
  if(!c)return;
  const h=c.querySelector("h3"),list=c.querySelector(".stat-list");
  if(!h||!list)return;
  if(c.dataset.kingV2!=="1"){
    c.dataset.kingV2="1";
    h.setAttribute("role","button");h.setAttribute("tabindex","0");
    const toggle=()=>{if(!isKingPage())return;const collapsed=c.classList.toggle("king-insight-collapsed");h.setAttribute("aria-expanded",String(!collapsed));};
    // Capture phase prevents the generic shell-controls stats handler from toggling these cards too.
    h.addEventListener("click",e=>{if(isKingPage()){e.stopImmediatePropagation();toggle()}},true);
    h.addEventListener("keydown",e=>{if(isKingPage()&&(e.key==="Enter"||e.key===" ")){e.preventDefault();e.stopImmediatePropagation();toggle()}},true);
  }
  if(isKingPage()){
    c.classList.add("king-insight-collapsed");
    h.setAttribute("aria-expanded","false");
  }
}
function apply(){
  if(!document.getElementById("king-insights-style-v2")){
    const s=document.createElement("style");s.id="king-insights-style-v2";s.textContent=`.king-insight-collapsed .stat-list{display:none!important}.king-insight-collapsed h3::after{content:'▸';float:right;color:var(--text-dim,#a7acb7);font-size:.78em}.stat-card:not(.king-insight-collapsed) h3::after{content:'▾';float:right;color:var(--text-dim,#a7acb7);font-size:.78em}`;document.head.appendChild(s);
  }
  wire(card("Top Authors"));wire(card("Score Extremes"));
}
let pending=false;function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;apply()},60)}
apply();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});document.addEventListener("click",schedule,{passive:true});[100,300,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
})();
