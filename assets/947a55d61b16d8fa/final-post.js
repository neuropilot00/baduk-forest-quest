"use strict";
// A lasting decision is a local campaign receipt, separate from the map and the
// old eight-boss journal. The receipt also remembers the progress that earned it.
const FinalPost=(()=>{
  const valid=v=>v===1||v===2;
  const eligible=s=>s.expedition===80&&OuterCampaign.cleared(s,10)===20&&OuterCampaign.allowed(319,s);
  const key=id=>"baduk-forest-quest.v1.final-bell."+id.toString(36);
  function receipt(id=CampaignSlots.id){
    try{
      const r=JSON.parse(localStorage.getItem(key(id)));
      if(!Array.isArray(r)||r.length!==4||!valid(r[0]))return null;
      const s={finalBell:r[0],expedition:80,outer:r[1],reach:r[2],reachFork:r[3]};
      return eligible(s)?s:null;
    }catch{return null;}
  }
  function reconcile(s,requested=0){
    const prior=receipt();
    if(prior){
      s.expedition=80;s.reach=Math.max(s.reach,prior.reach);s.outer=OuterCampaign.merge(s.outer,prior.outer,80);
      s.reachFork=ReachFork.merge(prior.reachFork,s.reachFork,s.reach);
      return prior.finalBell;
    }
    if(!valid(requested)||!eligible(s))return 0;
    localStorage.setItem(key(CampaignSlots.id),JSON.stringify([requested,s.outer,s.reach,s.reachFork]));
    return requested;
  }
  // Browsers without Web Locks serialize using an IndexedDB read-write transaction.
  // No user progress goes into that database; its transaction supplies the lock.
  function withLock(id,job){
    const name=key(id);
    if(navigator.locks?.request)return navigator.locks.request(name,job);
    return new Promise((resolve,reject)=>{
      const open=indexedDB.open("baduk-forest-quest.final-post-lock",1);
      open.onupgradeneeded=()=>open.result.createObjectStore("turn");
      open.onerror=()=>reject(open.error);
      open.onsuccess=()=>{
        const db=open.result,tx=db.transaction("turn","readwrite");let result,failure;
        const read=tx.objectStore("turn").get(name);
        read.onsuccess=()=>{try{result=job();}catch(err){failure=err;tx.abort();}};
        tx.oncomplete=()=>{db.close();resolve(result);};
        tx.onabort=()=>{db.close();reject(failure||tx.error);};
      };
    });
  }
  const choice=()=>receipt()?.finalBell||(eligible(saved)&&valid(saved.finalBell)?saved.finalBell:0);
  async function choose(value){
    if(!valid(value)||!eligible(saved))return false;
    try{return await withLock(CampaignSlots.id,()=>{
      saved.finalBell=reconcile(saved,value);
      // Once the receipt exists it is already durable, even if a full raw save
      // cannot be written. Startup can reconstruct this checkpoint from it.
      save();return saved.finalBell===value;
    });}catch{return false;}
  }
  return Object.freeze({eligible,ready:()=>eligible(saved),valid,choice,choose,receipt,reconcile,withLock});
})();
