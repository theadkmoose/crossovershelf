(()=>{
"use strict";
const FLAG="__RFantasyModalPresentationV2";
if(window[FLAG])return;window[FLAG]=true;
const isRF=()=>typeof state!=="undefined"&&state.tab==="rfantasy";
function findModal(){return [...document.querySelectorAll("body *")].reverse().find(el=>{if(!el.children.length)return false;const t=(el.textContent||"").replace(/\s+/g," ");return t.includes("Reading Status")&&t.includes("Your Notes")&&t.includes("r/Fantasy 2025")})||null}
function fix(){
 if(!isRF())return;
 const modal=findModal();if(!modal)return;
 const texts=[];const walker=document.createTreeWalker(modal,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode())texts.push(n);
 let rank=null,votes=null;
 for(const node of texts){const t=(node.nodeValue||"").trim();const m=t.match(/^r\/Fantasy 2025\s*[·•]\s*Rank\s*#(\d+)\s*[·•]\s*(\d+)\s+votes$/i);if(m){rank=Number(m[1]);votes=Number(m[2]);break}}
 if(!rank||!votes)return;
 for(const node of texts){const raw=node.nodeValue||"",t=raw.trim();
   if(/^Tier\s*[·•]\s*\d+\/100$/i.test(t))node.nodeValue=raw.replace(t,`r/Fantasy 2025 · Rank #${rank}`);
   else if(t==="Community hype")node.nodeValue=raw.replace(t,"Community votes");
   else if(/^\d{4,6}$/.test(t)&&Number(t)>=90000)node.nodeValue=raw.replace(t,String(votes));
 }
 const bars=[...modal.querySelectorAll("div,span")].filter(el=>{const t=(el.textContent||"").trim();return t===""&&el.getBoundingClientRect().width>100&&el.getBoundingClientRect().height<30});
 bars.forEach(el=>{if(el.style.width&&/^(99|100)%$/.test(el.style.width))el.style.width="100%"});
}
function boot(){
 const run=()=>setTimeout(fix,50);
 document.addEventListener("click",run,{passive:true});
 const mo=new MutationObserver(run);mo.observe(document.body,{subtree:true,childList:true,characterData:true});
 setTimeout(fix,150);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
