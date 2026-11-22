"use strict";
// A campaign commits to one bank. A bit is a victory actually achieved on that
// bank in this district. Older travelers continue without invented trophies.
const CrossingLog=(()=>{
  const count=11,limit=1<<count;
  const regionOK=r=>Number.isInteger(r)&&r>=0&&r<count;
  const stage=r=>regionOK(r)?109+r*20:-1;
  function eligible(r,s){
    return regionOK(r)&&OuterCampaign.districtOpen(r,s)&&OuterCampaign.value(s,r)>=72&&OuterCampaign.route(s)!==0;
  }
  function normalize(mask,s){
    if(!Number.isInteger(mask)||mask<=0||mask>=limit)return 0;
    let valid=0;
    for(let r=0;r<count;r++)if(mask&(1<<r)&&eligible(r,s))valid|=1<<r;
    return valid;
  }
  const merge=(a,b,s)=>normalize(a,s)|normalize(b,s);
  const cleared=(r,s)=>eligible(r,s)&&!!(normalize(s.crossings,s)&(1<<r));
  const required=(r,s)=>eligible(r,s)&&OuterCampaign.value(s,r)===72&&!cleared(r,s);
  function complete(r,route,s,write=save){
    if(!eligible(r,s)||route!==OuterCampaign.route(s))return false;
    if(typeof CampaignSlots!=="undefined"){
      try{
        const disk=JSON.parse(localStorage.getItem(CampaignSlots.key));
        if(disk?.campaignId===CampaignSlots.id&&OuterCampaign.route(disk)===route)
          s.crossings=merge(s.crossings,normalize(disk.crossings,disk),s);
      }catch{}
    }
    if(cleared(r,s))return false;
    const before=normalize(s.crossings,s);s.crossings=before|(1<<r);
    if(write())return true;s.crossings=before;return false;
  }
  return Object.freeze({stage,eligible,normalize,merge,cleared,required,complete});
})();
