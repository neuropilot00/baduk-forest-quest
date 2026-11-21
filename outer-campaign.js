"use strict";
// Stable 0..79 is the original route; 80..99 belongs to the delta. The three
// contiguous II regions here do not renumber legacy content. New addresses are append-only.
const OuterCampaign=(()=>{
  const count=11,base=100,first=[
    ["山の観測嶺","산악 관측령"],["硝子火山の都","화산 유리도시"],["潮の天文台","조석 천문대"]
  ];
  const rankOf=[1,2,3,0,0,1,1,2,2,3,3];
  const predecessors=[-1,-1,-1,-2,3,0,5,1,7,2,9];
  const region=id=>Number.isInteger(id)&&id>=base&&id<base+20*count?Math.floor((id-base)/20):-1;
  const local=id=>region(id)<0?-1:(id-base)%20;
  function boss(id){const i=local(id);return i===6||i===19||i===(region(id)<3?9:13);}
  // The existing longer studies at the 10th and final posts retain their puzzle IDs.
  const phaseCount=id=>local(id)===9||local(id)===19?5:local(id)===4||local(id)===14?4:3;
  const abs=id=>region(id)>=0;
  function decode(raw){
    if(typeof raw!=="string"||!raw||raw.length<6||raw.length>count*2||!/^(?:[a-f0-9]{2})+$/.test(raw))return [];
    return raw.match(/../g).map(v=>parseInt(v,16));
  }
  function checked(value,r){
    if(value===160)return value;
    if(!Number.isInteger(value)||value<0||value>=160)return 0;
    const id=base+r*20+Math.floor(value/8);
    return value%8<phaseCount(id)+Number(boss(id))?value:0;
  }
  function encode(bytes){while(bytes.length>3&&!bytes.at(-1))bytes.pop();
    return bytes.some(Boolean)?bytes.map(v=>v.toString(16).padStart(2,"0")).join(""):"";}
  function merge(a,b,frontier){
    const old=decode(a),incoming=decode(b);
    return encode(rankOf.map((rank,r)=>frontier>=(rank+1)*20?Math.max(checked(old[r],r),checked(incoming[r],r)):0));
  }
  const value=(saved,r)=>checked(decode(saved.outer)[r],r);
  const cleared=(saved,r)=>Math.floor(value(saved,r)/8);
  function districtOpen(r,s){
    if(!Number.isInteger(r)||rankOf[r]===undefined||s.expedition<(rankOf[r]+1)*20)return false;
    const prev=predecessors[r];return prev===-1|| (prev===-2?Math.floor(s.reach/8)>=20:cleared(s,prev)===20);
  }
  function route(s){
    if(typeof ReachFork==="undefined")return 0;
    const record=ReachFork.valid(s.reachFork,s.reach),bank=record&3;
    return bank&&((record>>(2*bank))&3)===2?bank:0;
  }
  function allowed(id,s){const r=region(id);return r>=0&&districtOpen(r,s)&&local(id)<=cleared(s,r)&&(local(id)<9||!!route(s));}
  function mark(id,phase,s){
    if(!allowed(id,s))return s.outer||"";
    const r=region(id),n=local(id),current=value(s,r);
    if(current!==n*8+phase)return s.outer||"";
    const bytes=Array.from({length:count},(_,i)=>value(s,i));
    bytes[r]=phase+1===phaseCount(id)+Number(boss(id))?(n+1)*8:current+1;return encode(bytes);
  }
  // A lit solution belongs to a region and stage. The same 66-bit layout is used for
  // each complete twenty-site district, including its longer checkpoint studies.
  const maxBytes=Math.ceil(66*count/8);
  function lampBytes(raw){
    const v=new Uint8Array(maxBytes);
    if(typeof raw!=="string"||raw.length>Math.ceil(maxBytes*4/3)||raw.length%4===1||!/^[A-Za-z0-9+/]*$/.test(raw))return v;
    try{v.set(Uint8Array.from(atob(raw),c=>c.charCodeAt(0)));}catch{return new Uint8Array(maxBytes);}
    v[maxBytes-1]&=(1<<((66*count)%8))-1;return v;
  }
  function lampCode(v){let len=v.length;while(len&&!v[len-1])len--;return btoa(String.fromCharCode(...v.slice(0,len))).replace(/=+$/,"");}
  function lamps(a,b){const left=lampBytes(a),right=lampBytes(b);return lampCode(left.map((v,i)=>v|right[i]));}
  function spent(raw){let n=0;for(let x of lampBytes(raw))for(;x;x&=x-1)n++;return n;}
  function bit(id,phase){const r=region(id);if(r<0||!Number.isInteger(phase)||phase<0||phase>=phaseCount(id))return -1;
    let k=66*r+phase;for(let j=0;j<local(id);j++)k+=phaseCount(base+20*r+j);return k;}
  function lit(code,k){return k>=0&&k<66*count&&!!(lampBytes(code)[k>>3]&(1<<(k%8)));}
  function light(code,k,balance){if(k<0||k>=66*count)return null;if(lit(code,k))return code;
    if(balance<1)return null;const v=lampBytes(code);v[k>>3]|=1<<(k%8);return lampCode(v);}
  const game=(id,s)=>OuterDuels.game(id,route(s));
  return Object.freeze({abs,region,local,boss,phaseCount,rankOf,first,merge,progress:merge,value,cleared,districtOpen,route,allowed,mark,game,lamps,spent,bit,lit,light});
})();
