"use strict";
const CampaignSlots=(()=>{
  const primary="baduk-forest-quest.v1",number=new URLSearchParams(location.search).get("journey")==="2"?2:1;
  const keyFor=n=>n===1?primary:primary+".slot2",key=keyFor(number);
  const idKey=n=>keyFor(n)+".campaign";
  const valid=n=>Number.isSafeInteger(n)&&n>0&&n<=0xffffffff;
  const get=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const put=(k,v)=>{try{localStorage.setItem(k,v);return true;}catch{return false;}};
  const random=()=>{const word=new Uint32Array(1);crypto.getRandomValues(word);return word[0]||1;};
  function identityIn(n){
    const stored=Number(get(idKey(n)));
    if(valid(stored))return stored;
    try{return JSON.parse(get(keyFor(n)))?.campaignId;}catch{return undefined;}
  }
  let identity=identityIn(number);
  if(!valid(identity))identity=random();
  put(idKey(number),String(identity));
  const branchKey=()=>primary+".oath."+identity.toString(36);
  function oath(){
    try{const a=JSON.parse(get(branchKey()));return Array.isArray(a)&&a.length===2?a:[0,0];}catch{return [0,0];}
  }
  function accept(incoming,fresh){
    if(incoming===undefined||incoming===identity)return null;
    if(!valid(incoming))return "invalid";
    if(identityIn(3-number)===incoming)return "duplicate";
    if(!fresh||oath()[0])return "occupied";
    if(!put(idKey(number),String(incoming)))return "storage";
    identity=incoming;return null;
  }
  function ledger(fork,q){
    const [old,checkpoint]=oath(),high=Math.max(q||0,checkpoint||0);
    const merged=ReachJournal.fork(old,fork,high);
    if(merged&&(merged!==old||high!==checkpoint)&&!put(branchKey(),JSON.stringify([merged,high])))throw Error("Cannot save campaign oath");
    return [merged,merged?high:q];
  }
  const session=s=>number===1?s:s+".slot2";
  function switchTo(n){
    if(n===number||![1,2].includes(n))return;
    const target=new URL(location.href);if(n===2)target.searchParams.set("journey","2");else target.searchParams.delete("journey");
    location.assign(target.href);
  }
  function menu(){
    if(document.getElementById("campaignSlots"))return;
    const panel=document.createElement("section"),heading=document.createElement("h3"),nav=document.createElement("div");
    panel.id="campaignSlots";nav.className="camp-choices";panel.append(heading,nav);
    const buttons=[1,2].map(n=>{const b=document.createElement("button");b.type="button";b.className="camp-choice";b.dataset.saveSlot=String(n);b.onclick=()=>switchTo(n);nav.append(b);return b;});
    const host=document.getElementById("camp-home");if(!host)return;host.append(panel);
    const paint=()=>{
      panel.hidden=document.getElementById("titleScene").hidden;
      heading.textContent=localizedPair(["旅の記録","여행 슬롯"]);
      buttons.forEach((b,i)=>{const n=i+1,raw=get(keyFor(n));let frontier=0;try{frontier=JSON.parse(raw)?.expedition||0;}catch{}
        b.textContent=localizedPair(["旅 ","여행 "])+n+" · "+(n===number?localizedPair(["プレイ中","플레이 중"]):raw?localizedPair(["遠征 ","원정 "])+frontier:localizedPair(["新しい旅","새 원정"]));
        b.disabled=n===number;b.setAttribute("aria-current",n===number?"true":"false");});
    };
    new MutationObserver(paint).observe(document.getElementById("titleScene"),{attributes:true,attributeFilter:["hidden"]});
    new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});paint();
  }
  return Object.freeze({number,key,session,accept,ledger,oath,menu,get id(){return identity;}});
})();
