(()=>{
"use strict";
const FLAG="__RFantasyModalPresentationV6";
if(window[FLAG])return;window[FLAG]=true;
function findRFModal(){
  const candidates=[...document.querySelectorAll('#bookModalBackdrop,[role="dialog"],.modal,[class*="modal"],[id*="modal"]')];
  const direct=candidates.find(el=>{const t=(el.textContent||"").replace(/\s+/g," ");return /r\/Fantasy 2025/i.test(t)&&/Reading Status/i.test(t)&&/Your Notes/i.test(t);});
  if(direct)return direct;
  return [...document.body.querySelectorAll("div,section,article")].reverse().find(el=>{const t=(el.textContent||"").replace(/\s+/g," ");return /r\/Fantasy 2025/i.test(t)&&/Reading Status/i.test(t)&&/Your Notes/i.test(t);})||null;
}
function hideHeadingSection(modal,label){
  const heads=[...modal.querySelectorAll("h1,h2,h3,h4,h5,h6,[role='heading']")].filter(el=>(el.textContent||"").replace(/\s+/g," ").trim().toLowerCase()===label.toLowerCase());
  for(const head of heads){
    let section=head.parentElement;
    if(section&&section.children.length<=3){section.style.display="none";continue;}
    head.style.display="none";
    let next=head.nextElementSibling;
    if(next)next.style.display="none";
  }
}
function hideMetadataRow(modal){
  const all=[...modal.querySelectorAll("div,section,article")];
  const target=all.find(el=>{const t=(el.textContent||"").replace(/\s+/g," ").toLowerCase();return t.includes("published")&&t.includes("aggregate rating")&&t.includes("pages (approx.")&&t.length<300;});
  if(target)target.style.display="none";
}
function fix(){
  const modal=findRFModal();
  if(!modal)return;
  const nodes=[];const walker=document.createTreeWalker(modal,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode())nodes.push(n);
  let rank=null,votes=null;
  for(const node of nodes){const t=(node.nodeValue||"").replace(/\s+/g," ").trim();const m=t.match(/^r\/Fantasy 2025\s*[·•]\s*Rank\s*#(\d+)\s*[·•]\s*(\d+)\s+votes$/i);if(m){rank=Number(m[1]);votes=Number(m[2]);break;}}
  if(rank===null||votes===null)return;
  for(const node of nodes){const raw=node.nodeValue||"";const t=raw.replace(/\s+/g," ").trim();if(/^Tier\s*[·•]\s*\d+\/100$/i.test(t))node.nodeValue=raw.replace(t,`r/Fantasy 2025 · Rank #${rank}`);else if(/^Community hype$/i.test(t))node.nodeValue=raw.replace(t,"Community votes");else if(/^\d{4,6}$/.test(t)&&Number(t)>=90000)node.nodeValue=raw.replace(t,String(votes));}
  hideMetadataRow(modal);
  hideHeadingSection(modal,"Synopsis");
  hideHeadingSection(modal,"Themes & Tags");
}
function boot(){const run=()=>setTimeout(fix,20);document.addEventListener("click",run,{passive:true});document.addEventListener("pointerup",run,{passive:true});const mo=new MutationObserver(run);mo.observe(document.body,{subtree:true,childList:true,characterData:true});setTimeout(fix,100);setTimeout(fix,500);setTimeout(fix,1200);setTimeout(fix,2500);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
