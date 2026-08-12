(()=>{
"use strict";
const FLAG="__CrossoverShelfKingInsightsV3";
if(window[FLAG])return;
window[FLAG]=true;
let lastKing=false;
function isKingPage(){
 const active=[...document.querySelectorAll("[role='tab'].active,[role='tab'][aria-selected='true'],.tab.active,.tab-btn.active,button.active")];
 if(active.some(el=>/king/i.test((el.textContent||"").trim())))return true;
 return [...document.querySelectorAll("h1,h2,h3,.page-title,.shelf-title")].some(el=>{const s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden"&&/stephen king/i.test(el.textContent||"")});
}
function card(label){return [...document.querySelectorAll(".stat-card")].find(c=>c.querySelector("h3")?.textContent.trim().toLowerCase()===label.toLowerCase())}
function wire(c){
 if(!c)return;
 const h=c.querySelector("h3"),list=c.querySelector(".stat-list");if(!h||!list)return;
 if(c.dataset.kingV3!=="1"){
  c.dataset.kingV3="1";h.setAttribute("role","button");h.setAttribute("tabindex","0");
  const toggle=()=>{const collapsed=c.classList.toggle("king-insight-collapsed");h.setAttribute("aria-expanded",String(!collapsed));};
  h.addEventListener("click",e=>{if(isKingPage()){e.stopImmediatePropagation();toggle()}},true);
  h.addEventListener("keydown",e=>{if(isKingPage()&&(e.key==="Enter"||e.key===" ")){e.preventDefault();e.stopImmediatePropagation();toggle()}},true);
 }
 if(isKingPage()&&!c.dataset.kingV3Initialized){
  c.classList.add("king-insight-collapsed");c.dataset.kingV3Initialized="1";h.setAttribute("aria-expanded","false");
 }
 if(!isKingPage()) delete c.dataset.kingV3Initialized;
}
function apply(){
 if(!document.getElementById("king-insights-style-v3")){
  const s=document.createElement("style");s.id="king-insights-style-v3";s.textContent=`.king-insight-collapsed .stat-list{display:none!important}.king-insight-collapsed h3::after{content:'▸';float:right;color:var(--text-dim,#a7acb7);font-size:.78em}.stat-card:not(.king-insight-collapsed) h3::after{content:'▾';float:right;color:var(--text-dim,#a7acb7);font-size:.78em}`;document.head.appendChild(s);
 }
 const king=isKingPage();
 wire(card("Top Authors"));wire(card("Score Extremes"));
 if(king!==lastKing){lastKing=king;if(king){card("Top Authors")?.classList.add("king-insight-collapsed");card("Score Extremes")?.classList.add("king-insight-collapsed");}}
}
let pending=false;function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;apply()},60)}
apply();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});document.addEventListener("click",schedule,{passive:true});[100,300,700,1500,3000].forEach(ms=>setTimeout(apply,ms));
})();
