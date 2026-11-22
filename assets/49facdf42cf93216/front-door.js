"use strict";
const FrontDoor=(()=>{
  const cover=el("titleScene"),shell=document.querySelector(".shell"),image=el("titleArt");
  const covers={
    ja:["./dawnbell-portrait-ja.webp","./dawnbell-wide-ja.webp"],
    ko:["./dawnbell-portrait-ko.webp","./dawnbell-wide-ko.webp"]
  };
  let active=false;
  function paint(){
    const [source,wide]=covers[saved.locale==="ko"?"ko":"ja"];
    if(image.getAttribute("src")!==source){
      cover.classList.remove("cover-error");el("titleWide").srcset=wide;image.src=source;
    }
    el("titleName").textContent=t("title");el("titlePrompt").textContent=localizedPair(["冒険をはじめる","원정 시작"]);
    el("titleStory").textContent=localizedPair(["消えた朝の鐘","사라진 새벽종"]);
  }
  new MutationObserver(()=>{if(active)paint();}).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  image.addEventListener("error",()=>cover.classList.add("cover-error"));
  image.addEventListener("load",()=>cover.classList.remove("cover-error"));
  function show(visible){
    active=visible;cover.hidden=!visible;shell.inert=visible;document.body.classList.toggle("at-title",visible);
    if(visible){paint();el("enterGame").focus({preventScroll:true});}
    try{if(visible)sessionStorage.removeItem(CampaignSlots.session("bfq-entered"));else sessionStorage.setItem(CampaignSlots.session("bfq-entered"),"1");}catch{}
  }
  function enter(){show(false);openMap(mapLocation());el("voyGo").focus({preventScroll:true});}
  el("enterGame").onclick=enter;
  let entered=false;try{entered=sessionStorage.getItem(CampaignSlots.session("bfq-entered"))==="1";}catch{}
  show(!entered);
  return {show,enter,get active(){return active;}};
})();

const GameNavigation=(()=>{
  const dialogs=["gearDialog","roadDialog","matchDialog","journalDialog","trainingBackup","burstDialog"];
  let applying=false,returning=null,serial=0;
  const ids=s=>s?.bfq===2;
  function snapshot(){
    const root=FrontDoor.active?"title":el("voyage").hidden?"field":"map";
    const modal=FrontDoor.active?null:dialogs.find(id=>id==="gearDialog"?!el(id).hidden:el(id).open)||null;
    return {root,modal,stage:root==="field"?level:mapStage||0,track:saved.track,trial:trial?.id??-1,rank:BossMatch.rank||0,early:BossMatch.early,practice:!!modal&&root==="map"};
  }
  const key=s=>s.root+"-"+(s.modal||"");
  const state=(view,depth)=>({bfq:2,view,depth,id:++serial});
  let view=snapshot(),depth=view.root==="title"?0:1;
  const title=state({...view,root:"title",modal:null},0);
  if(!ids(history.state)){history.replaceState(title,"");if(depth)history.pushState(state(view,depth),"");}
  else {depth=history.state.depth;if(!history.state.reachArea&&!history.state.outerArea&&history.state.siteBrief===undefined)history.replaceState(state(view,depth),"");}
  function sync(){
    if(history.state?.siteBrief!==undefined||CampMenu.managesHistory()||(typeof ReachMap!=="undefined"&&ReachMap.active)||(typeof OuterMap!=="undefined"&&OuterMap.active)||applying||returning)return;const next=snapshot(),current=history.state;
    if(!ids(current)||key(view)===key(next)){view=next;if(ids(current))history.replaceState({...current,view:next},"");return;}
    const nextDepth=next.root==="title"?0:next.root==="map"?(next.modal?2:1):(next.modal?3:2);
    if(nextDepth<depth){returning={key:key(next)};view=next;history.go(nextDepth-depth);return;}
    // A saved gate can mount the field and its match in the same click. Keep a
    // real field history entry so closing that match returns to this map.
    if(depth===1&&next.root==="field"&&next.modal==="matchDialog"){
      history.pushState(state({...next,modal:null},2),"");
    }
    const entry=state(next,nextDepth);
    if(nextDepth===depth)history.replaceState(entry,"");else history.pushState(entry,"");
    depth=nextDepth;view=next;
  }
  function restore(target){
    if(BossMatch.active&&target.modal!=="matchDialog")el("matchBack").click();
    for(const id of dialogs){if(id===target.modal)continue;if(id==="gearDialog"){if(!el(id).hidden)closeSettings();}else if(el(id).open)el(id).close();}
    if(target.root==="title"){if(el("voyage").hidden)openMap(mapLocation());FrontDoor.show(true);return;}
    FrontDoor.show(false);
    if(target.root==="map"){if(el("voyage").hidden||target.stage!==mapStage)openMap(Math.min(79,target.stage));}
    else if(!el("voyage").hidden){
      if(target.trial>=0)startTrial(target.trial);
      else if(target.track==="expedition"){showField();trial=null;saved.track="expedition";startExpedition(Math.min(target.stage,saved.expedition));}
      else enterTrack(target.track);
    }
    if(!target.modal)return;
    if(target.modal==="gearDialog"){if(el("gearDialog").hidden)openGear();return;}
    if(el(target.modal).open)return;
    if(target.modal==="roadDialog")RoadTalk.open(Math.max(0,target.stage-1),target.stage);
    if(target.modal==="matchDialog")BossMatch.open(target.rank,target.practice,false,target.early);
    if(target.modal==="journalDialog")el("journalButton").click();
    if(target.modal==="trainingBackup")el("backup").click();
  }
  addEventListener("popstate",event=>{
    if(!ids(event.state)||event.state.siteBrief!==undefined||event.state.reachArea||event.state.outerArea||(typeof OuterMap!=="undefined"&&OuterMap.active)||(typeof ReachMap!=="undefined"&&ReachMap.active))return;
    const target=event.state.view,now=snapshot();depth=event.state.depth;
    applying=true;
    if(!returning||key(now)===returning.key){if(key(now)!==key(target)||!returning)restore(target);}
    returning=null;view=snapshot();history.replaceState(state(view,depth),"");applying=false;
  });
  const observer=new MutationObserver(sync);
  for(const id of [...dialogs,"voyage","titleScene"])observer.observe(el(id),{attributes:true,attributeFilter:["hidden","open"]});
  return {sync};
})();
