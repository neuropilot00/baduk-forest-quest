"use strict";
// Keep the original 264-position lantern ledger intact. Its current balance is
// shared with the second reach, which has an independent 66-position ledger.
const ReachJournal=(()=>{
  const count=66;
  const encode=bytes=>btoa(String.fromCharCode(...bytes)).replace(/=+$/,"");
  function bytes(raw){
    if(typeof raw!=="string"||raw.length>12||raw.length%4===1||!/^[A-Za-z0-9+/]*$/.test(raw))return new Uint8Array(9);
    const result=new Uint8Array(9);result.set(Uint8Array.from(atob(raw),v=>v.charCodeAt(0)));result[8]&=3;return result;
  }
  function lamps(a,b){
    const merged=bytes(a),incoming=bytes(b);merged.forEach((n,i)=>{merged[i]=n|incoming[i];});
    return merged.some(Boolean)?encode(merged):"";
  }
  function balance(frontier,base,extra,outer){
    let spent=0;for(let q of bytes(extra))for(;q;q&=q-1)spent++;
    return Math.max(0,Lanterns.balance(frontier,base)-spent-(typeof OuterCampaign==="undefined"?0:OuterCampaign.spent(outer)));
  }
  function bit(index,phase){
    if(ReachProgress.local(index)!==index||!Number.isInteger(phase)||phase<0||phase>=ReachProgress.phases(index))return -1;
    let n=phase;for(let i=0;i<index;i++)n+=ReachProgress.phases(i);return n;
  }
  function lit(raw,k){return k>=0&&k<count&&!!(bytes(raw)[k>>3]&(1<<(k%8)));}
  function light(raw,k,frontier,base,outer){
    if(!Number.isInteger(k)||k<0||k>=count)return null;
    if(lit(raw,k))return raw;
    if(!balance(frontier,base,raw,outer))return null;
    const data=bytes(raw);data[k>>3]|=1<<(k%8);return encode(data);
  }
  function pack(raw,fork){
    const data=new Uint8Array(10);data.set(bytes(raw));data[9]=fork||0;
    return data.some(Boolean)?encode(data):"";
  }
  function unpack(raw){
    if(typeof raw!=="string"||!/^[A-Za-z0-9+/]{14}$/.test(raw))return {lamps:"",fork:0};
    const data=Uint8Array.from(atob(raw),v=>v.charCodeAt(0));
    return {lamps:lamps("",encode(data.slice(0,9))),fork:data[9]};
  }
  function fork(local,incoming,checkpoint){
    return typeof ReachFork==="undefined"?0:ReachFork.merge(local,incoming,checkpoint);
  }
  return Object.freeze({lamps,balance,bit,lit,light,pack,unpack,fork});
})();
