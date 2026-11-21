"use strict";

// A warning is backed by a specific legal white move on the current board.
// Only a black move accepted by the puzzle and neutralizing this exact threat
// can soften its RPG damage. No predicted stone or health value changes Go.
const TempoDefense=(()=>{
  const quickMs=4000,windowMs=18000,delayMs=280;
  let active=null,last=null,strong=false,written=-1,frozen=false,unfocused=false;
  const pointAfter=(s,p,side)=>play(s,p,side);
  function threat(s,m){
    if(!s||!m||!["link","escape"].includes(m.kind)||!m.targets.every(p=>s.board[p]===1))return null;
    const anchor=m.targets[0],chain=group(s.board,anchor);
    if(m.kind==="escape"){
      if(chain.liberties.size>2)return null;
      for(const p of chain.liberties){
        const w=pointAfter(s,p,2);if(!w)continue;
        if(!w.board[anchor]||group(w.board,anchor).liberties.size===1)return {kind:w.board[anchor]?"atari":"capture",p,anchor};
      }
      return null;
    }
    if(m.targets.every(p=>chain.stones.has(p)))return null;
    // A single immediate linking point is a genuine cut threat if white can
    // occupy it. With two bridges white cannot cut both in one move.
    const links=[];
    for(const p of chain.liberties){
      const b=pointAfter(s,p,1);
      if(b&&m.targets.every(t=>group(b.board,anchor).stones.has(t)))links.push(p);
    }
    if(links.length!==1||!pointAfter(s,links[0],2))return null;
    return {kind:"cut",p:links[0],anchor,targets:[...m.targets]};
  }
  function answers(cue,after){
    if(!cue||!after||after.board[cue.anchor]!==1)return false;
    const holds=s=>{
      if(s.board[cue.anchor]!==1)return false;
      const g=group(s.board,cue.anchor);
      return cue.kind==="cut"?cue.targets.every(p=>g.stones.has(p)):g.liberties.size>=2;
    };
    const w=pointAfter(after,cue.p,2);
    return holds(after)&&(!w||holds(w));
  }
  function counter(before,after,mission){
    if(mission.guardian)return null;
    const cue=threat(before,mission);if(!cue)return null;
    const white=pointAfter(after,cue.p,2);if(!white)return null;
    const target=white.board[cue.anchor];
    if(cue.kind==="cut"){
      const bridge=pointAfter(after,cue.p,1);
      if(!bridge||!cue.targets.every(p=>group(bridge.board,cue.anchor).stones.has(p)))return null;
      if(target===1&&cue.targets.every(p=>group(white.board,cue.anchor).stones.has(p)))return null;
    }else if(target===1&&group(white.board,cue.anchor).liberties.size>1)return null;
    return {point:cue.p,state:white};
  }
  const sessionKey=()=>CampaignSlots.session("bfq.defense-clock");
  function read(){
    try{const data=JSON.parse(sessionStorage.getItem(sessionKey()));return data&&typeof data==="object"&&!Array.isArray(data)?data:{};}
    catch{return {};}
  }
  function store(finish=false){
    if(!active)return;
    const {key,ms,aided}=active,quant=Math.min(windowMs,Math.ceil(ms));
    if(!finish&&written===quant&&!aided)return;
    const map=read();
    if(finish)delete map[key];else map[key]=[quant,aided?1:0];
    try{sessionStorage.setItem(sessionKey(),JSON.stringify(map));}catch{}
    written=quant;strong=!aided&&ms<=quickMs;
  }
  function pause(){last=null;}
  function clear(){store();active=null;pause();}
  function arm(id,round,position){
    clear();const {state,mission}=position||{},cue=threat(state,mission);if(!cue)return;
    const key=[id,round,state.board.join(""),state.previous||""].join("/"),old=read()[key];
    const ms=Array.isArray(old)&&Number.isFinite(old[0])?Math.min(windowMs,Math.max(0,old[0])):0;
    const aided=old?.[1]===1;
    active={cue,key,ms,aided};written=ms;strong=!aided&&ms<=quickMs;
  }
  function clock(running,now){
    if(!active)return;
    if(!running||frozen||unfocused||document.readyState!=="complete"){pause();return;}
    if(last!==null)active.ms=Math.min(windowMs,active.ms+Math.max(0,now-last));
    last=now;
    if(Math.floor(active.ms/500)>Math.floor(written/500)||strong&&active.ms>quickMs)store();
  }
  function assist(){if(active){active.aided=true;pause();store();}}
  function incomingDamage(ms,base,aided=false){
    const elapsed=Math.min(windowMs,Math.max(aided?windowMs/2:0,ms));
    return Math.max(1,Math.round(base*(3+11*elapsed/windowMs)/18));
  }
  function resolve(accepted,after,base){
    if(!active)return null;
    const {cue,ms,aided}=active;
    if(!accepted||!answers(cue,after)){clear();return null;}
    const fast=!aided&&ms<=quickMs,amount=incomingDamage(ms,base,aided);
    store(true);active=null;pause();
    return {kind:"guard",side:2,amount,fast,ms,base,aided,threat:cue.kind,point:cue.p};
  }
  function cueText(ko,base){
    if(!active)return "";
    const types={cut:["切断予告","절단 예고"],capture:["捕獲予告","포획 예고"],atari:["アタリ予告","단수 예고"]};
    return types[active.cue.kind][ko?1:0];
  }
  function previewText(ko,base,hp=Infinity,reduction=0){
    if(!active)return "";
    return (ko?"받을 피해 ":"受けるダメージ ")+Math.min(hp,Math.max(1,incomingDamage(active.ms,base,active.aided)-reduction));
  }
  function resultText(ko,hit){return (ko?(hit.fast?"빠른 방어":"방어"):(hit.fast?"速攻防御":"防御"))+" −"+hit.amount;}
  if(typeof document!=="undefined"){
    document.addEventListener("click",e=>{if(e.target.closest?.("#hint,#reachHint,#fieldTools button"))assist();},true);
    document.addEventListener("visibilitychange",()=>{pause();store();});
    document.addEventListener("freeze",()=>{frozen=true;pause();store();},{capture:true});
    document.addEventListener("resume",()=>{frozen=false;pause();},{capture:true});
    addEventListener("pagehide",()=>{pause();store();});
    addEventListener("pageshow",pause);
    addEventListener("blur",()=>{unfocused=true;pause();store();});
    addEventListener("focus",()=>{unfocused=false;pause();});
  }
  return {threat,answers,counter,incomingDamage,arm,clock,assist,clear,resolve,pause,cueText,previewText,resultText,delayMs,
    get status(){return active?{cue:active.cue,ms:active.ms,aided:active.aided}:null;}};
})();
