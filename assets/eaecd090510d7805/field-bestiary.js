"use strict";
const FieldBestiary=(()=>{
  const groups=[
    {key:"forest",title:["四つの地方","첫 네 지역"]},
    {key:"guardian",id:"guardianBestiary",title:["関門の守り手","관문 수문장"]},
    {key:"reach",id:"reachBestiary",title:["星水の渡し","별물 나루"]},
    {key:"outer",id:"outerBestiary",title:["観測嶺・火山・天文台","관측령·화산·천문대"]},
    {key:"further",id:"furtherBestiary",title:["川を遡った先","상류 물길"]}
  ];
  let roster,observer;
  const actorKey=(group,id)=>group+"-"+id;
  function catalogue(){
    if(roster)return roster;
    roster=new Map();
    function add(group,id,name,source){
      const key=actorKey(group,id);
      if(!roster.has(key))roster.set(key,{key,group,id,name,source});
    }
    Expedition.names.flat().forEach((name,id)=>add("forest",id,name,FaunaMotion.fieldSource(id)));
    Voyage.guardians.forEach((name,id)=>add("guardian",id,name,FaunaMotion.guardianSource(id)));
    for(let site=80;site<100;site++){
      const id=ReachFauna.resident(site);
      if(id>=0)add("reach",id,ReachFauna.name(site),ReachFauna.motionSource(site));
    }
    for(let site=100;site<320;site++){
      const id=OuterFauna.resident(site);
      add(site<160?"outer":"further",id,OuterFauna.name(site),OuterFauna.motionSource(site));
    }
    return roster;
  }
  function discovered(save){
    const known=new Set();
    const add=(group,id)=>known.add(actorKey(group,id));
    function record(source,actor){
      if(source==="forest")add(source,actor);
      else if(source==="reach")add(source,ReachFauna.resident(actor));
      else add(actor<160?"outer":"further",OuterFauna.resident(actor));
    }
    function encounter(site,scripted,species){
      for(const actor of FoeParty.plan(site,scripted,species))record(actor.source,actor.actor);
    }
    for(let site=0;site<save.expedition;site++){
      const guardian=site%10===9;
      add("forest",Expedition.species(site));
      if(guardian)add("guardian",Math.floor(site/10));
      encounter(site,guardian||EarlyGuardians.is(site));
    }
    const reach=Math.floor(ReachProgress.read(save.reach,save.expedition)/8);
    for(let local=0;local<reach;local++){
      const site=80+local,id=ReachFauna.resident(site);
      const visitor=id<0?ReachPuzzles.stage(local).species:undefined;
      if(visitor===undefined)record("reach",site);else record("forest",visitor);
      encounter(site,ReachProgress.isBoss(local),visitor);
    }
    for(let region=0;region<OuterCampaign.rankOf.length;region++){
      const count=OuterCampaign.cleared(save,region);
      for(let local=0;local<count;local++){
        const site=100+region*20+local;
        record("outer",site);encounter(site,OuterCampaign.boss(site));
      }
    }
    return known;
  }
  function render(host,save){
    observer?.disconnect();
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        observer.unobserve(entry.target);
        const {target}=entry,canvas=target.querySelector("canvas"),actor=catalogue().get(target.dataset.bestiaryActor);
        FaunaMotion.portrait(canvas,actor.source).then(ready=>{
          if(ready&&canvas.isConnected)canvas.dataset.portrait="ready";
        });
      }
    },{root:host.closest("dialog"),rootMargin:"100px 0px"});
    const known=discovered(save),first=host.querySelector("#fieldCollection"),origin=first.closest("details");
    host.querySelector("#fieldBestiaryTotal").textContent=known.size+" / "+catalogue().size;
    let previous=origin;
    for(const group of groups){
      const actors=[...catalogue().values()].filter(actor=>actor.group===group.key);
      const visible=actors.filter(actor=>known.has(actor.key));
      let section=group.id?host.querySelector("#"+group.id):origin;
      if(group.id&&!visible.length){section?.remove();continue;}
      if(!section){section=document.createElement("details");section.id=group.id;previous.after(section);}
      let list=first;
      if(group.id){
        const summary=document.createElement("summary");
        summary.textContent=localizedPair(group.title)+" · "+visible.length+" / "+actors.length;
        list=document.createElement("div");list.className="collection expedition-collection";
        section.replaceChildren(summary,list);
      }else{
        host.querySelector("#fieldForestLabel").textContent=localizedPair(group.title);
        host.querySelector("#fieldCount").textContent=visible.length+" / "+actors.length;
      }
      section.classList.add("field-bestiary");
      list.replaceChildren();
      function open(){
        if(!section.open||list.childElementCount)return;
        for(const actor of visible){
          const card=document.createElement("article"),canvas=document.createElement("canvas"),name=document.createElement("span");
          card.className="creature";card.dataset.bestiaryActor=actor.key;
          canvas.width=120;canvas.height=86;canvas.setAttribute("aria-hidden","true");
          name.textContent=localizedPair(actor.name);card.append(canvas,name);list.append(card);observer.observe(card);
        }
      }
      section.ontoggle=open;open();previous=section;
    }
  }
  return {catalogue,discovered,render};
})();
