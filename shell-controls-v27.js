/* Crossover Shelf — stable shell + deterministic King insight defaults */
(()=>{
"use strict";
const FLAG="__CrossoverShelfShellV28Loaded";
if(window[FLAG])return;
window[FLAG]=true;
const toggled=new WeakSet();
let wasKing=false;
function isKing(){
 const active=[...document.querySelectorAll("[role='tab'].active,[role='tab'][aria-selected='true'],.tab.active,.tab-btn.active,button.active")];
 if(active.some(e=>/king/i.test((e.textContent||"").trim())))return true;
 return [...document.querySelectorAll("h1,h2,h3,.page-title,.shelf-title")].some(e=>{const s=getComputedStyle(e);return s.display!=="none"&&s.visibility!=="hidden"&&/stephen king/i.test(e.textContent||"")});
}
function find(label){return [...document.querySelectorAll(".stat-card")].find(c=>(c.querySelector("h3")?.textContent||"").trim().toLowerCase()===label.toLowerCase())}
function install(){
 if(document.getElementById("king-default-style-v28"))return;
 const s=document.createElement("style");s.id="king-default-style-v28";s.textContent=`
 body.king-page-active .king-default-collapsed .stat-list{display:none!important;max-height:0!important;overflow:hidden!important}
 body.king-page-active .king-default-collapsed h3::after{content:'▸'!important;float:right;color:var(--text-dim,#a7acb7);font-size:.78em}
 body.king-page-active .king-default-open h3::after{content:'▾'!important;float:right;color:var(--text-dim,#a7acb7);font-size:.78em}
 `;document.head.appendChild(s);
}
function apply(){
 install();
 const king=isKing();
 document.body.classList.toggle("king-page-active",king);
 if(!king){wasKing=false;return;}
 if(!wasKing){wasKing=true;toggled.delete(find("Top Authors"));toggled.delete(find("Score Extremes"));}
 ["Top Authors","Score Extremes"].forEach(label=>{
   const c=find(label);if(!c)return;
   if(!toggled.has(c))c.classList.add("king-default-collapsed");
   c.classList.toggle("king-default-open",toggled.has(c));
 });
}
function handleClick(e){
 if(!isKing())return;
 const h=e.target.closest?.(".stat-card h3");if(!h)return;
 const title=(h.textContent||"").trim().toLowerCase();
 if(title!=="top authors"&&title!=="score extremes")return;
 const c=h.closest(".stat-card");if(!c)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(toggled.has(c))toggled.delete(c);else toggled.add(c);
 c.classList.toggle("king-default-collapsed",!toggled.has(c));
 c.classList.toggle("king-default-open",toggled.has(c));
 h.setAttribute("aria-expanded",String(toggled.has(c)));
}
function handleKey(e){if(e.key!=="Enter"&&e.key!==" ")return;handleClick(e)}
document.addEventListener("click",handleClick,true);
document.addEventListener("keydown",handleKey,true);
apply();
new MutationObserver(()=>setTimeout(apply,0)).observe(document.body,{subtree:true,childList:true});
[50,150,300,600,1200,2500].forEach(ms=>setTimeout(apply,ms));
})();
