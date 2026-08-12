(()=>{
"use strict";
const FLAG="__RFantasyModalPresentationV3";
if(window[FLAG])return;window[FLAG]=true;
function findModal(){
 return [...document.querySelectorAll("body *")].reverse().find(el=>{
   if(!el.children.length)return false;
   const t=(el.textContent||"").replace(/\s+/g," ");
   return t.includes("Reading Status")&&t.includes("Your Notes")&&t.includes("r/Fantasy 2025");
 })||null;
}
function fix(){
 const modal=findModal();if(!modal)return;
 const texts=[];const walker=document.createTreeWalker(modal,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode())texts.push(n);
 let rank=null,votes=null;
 for(const node of texts){
   const t=(node.nodeValue||"").trim();
   const m=t.match(/^r\/Fantasy 2025\s*[·•]\s*Rank\s*#(\d+)\s*[·•]\s*(\d+)\s+votes$/i);
   if(m){rank=Number(m[1]);votes=Number(m[2]);break;}
 }
 if(rank===null||votes===null)return;
 for(const node of texts){
   const raw=node.nodeValue||"",t=raw.trim();
   if(/^Tier\s*[·•]\s*\d+\/100$/i.test(t))node.nodeValue=raw.replace(t,`r/Fantasy 2025 · Rank #${rank}`);
   else if(t==="Community hype")node.nodeValue=raw.replace(t,"Community votes");
   else if(/^\d{4,6}$/.test(t)&&Number(t)>=90000)node.nodeValue=raw.replace(t,String(votes));
 }
}
function boot(){
 const run=()=>setTimeout(fix,30);
 document.addEventListener("click",run,{passive:true});
 const mo=new MutationObserver(run);mo.observe(document.body,{subtree:true,childList:true,characterData:true});
 setTimeout(fix,100);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
