(()=>{
"use strict";
const FLAG="__RFantasyModalPresentationV1";
if(window[FLAG])return;window[FLAG]=true;
const isRF=()=>typeof state!=="undefined"&&state.tab==="rfantasy";
function fix(){
 if(!isRF())return;
 const books=window.__rfBooks||[];if(!books.length)return;
 const modal=[...document.querySelectorAll("body *")].find(el=>{if(!el.children.length)return false;const t=(el.textContent||"").replace(/\s+/g," ");return t.includes("Community hype")&&t.includes("Reading Status")&&t.includes("Your Notes")});
 if(!modal)return;
 const titleEl=[...modal.querySelectorAll("h1,h2,h3,.book-title,[class*=title]")].find(el=>books.some(b=>(el.textContent||"").trim()===b.title));
 const b=books.find(x=>x.title===titleEl?.textContent?.trim());if(!b)return;
 const walker=document.createTreeWalker(modal,NodeFilter.SHOW_TEXT),nodes=[];let n;while(n=walker.nextNode())nodes.push(n);
 for(const node of nodes){const raw=node.nodeValue||"",t=raw.trim();if(/^Tier\s*[·•]\s*\d+\/100$/i.test(t))node.nodeValue=raw.replace(t,`r/Fantasy 2025 · Rank #${b.rfRank}`);else if(t==="Community hype")node.nodeValue=raw.replace(t,"Community votes");else if(/^\d{4,6}$/.test(t)&&Number(t)===100000-b.rfRank)node.nodeValue=raw.replace(t,String(b.rfVotes));}
}
function boot(){document.addEventListener("click",()=>setTimeout(fix,60),{passive:true});setTimeout(fix,100)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
