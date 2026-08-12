(()=>{
"use strict";
const FLAG="__RFantasyModalPresentationV7";
if(window[FLAG]) return;
window[FLAG]=true;

function rfModal(){
  const el=document.querySelector("#bookModalBackdrop .modal");
  return el || null;
}

function getRankVotes(modal){
  const text=(modal.textContent||"").replace(/\s+/g," ");
  const m=text.match(/r\/Fantasy 2025\s*[·•]\s*Rank\s*#(\d+)\s*[·•]\s*(\d+)\s+votes/i);
  return m ? {rank:Number(m[1]),votes:Number(m[2])} : null;
}

function hideSectionByHeading(modal,label){
  const heads=[...modal.querySelectorAll("h1,h2,h3,h4,h5,h6,[role='heading']")];
  for(const head of heads){
    if((head.textContent||"").trim().toLowerCase()!==label.toLowerCase()) continue;
    head.style.display="none";
    const content=head.nextElementSibling;
    if(content) content.style.display="none";
    const parent=head.parentElement;
    if(parent && parent!==modal && parent.children.length<=3) parent.style.display="none";
  }
}

function hideRFMetadata(modal){
  const row=modal.querySelector(".meta-row");
  if(row && /published/i.test(row.textContent||"") && /aggregate rating/i.test(row.textContent||"")) row.style.display="none";
}

function rewrite(modal,rank,votes){
  const tier=modal.querySelector("#m-tier");
  if(tier){
    tier.className="rfantasy-rank-label";
    tier.textContent=`r/Fantasy 2025 · Rank #${rank}`;
    tier.style.cssText="display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:.78rem;font-weight:600;color:var(--text);margin-bottom:10px;";
  }
  const bridge=modal.querySelector("#m-bridge-wrap");
  if(bridge){
    bridge.innerHTML=`<div class="row"><span class="name">Community votes</span><div class="track"><div class="fill" style="width:100%;background:var(--moss);"></div></div><span class="num">${votes}</span></div>`;
  }
  hideRFMetadata(modal);
  hideSectionByHeading(modal,"Synopsis");
  hideSectionByHeading(modal,"Themes & Tags");
}

function fix(){
  const modal=rfModal();
  if(!modal) return;
  const author=(modal.querySelector("#m-author")?.textContent||"");
  if(!/r\/Fantasy 2025/i.test(author)) return;
  const rv=getRankVotes(modal);
  if(!rv) return;
  rewrite(modal,rv.rank,rv.votes);
}

let scheduled=false;
function schedule(){
  if(scheduled) return;
  scheduled=true;
  setTimeout(()=>{scheduled=false;fix();},30);
}

document.addEventListener("click",schedule,{passive:true});
document.addEventListener("pointerup",schedule,{passive:true});
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});
[100,300,700,1500,3000].forEach(ms=>setTimeout(fix,ms));
})();
