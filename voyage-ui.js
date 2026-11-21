"use strict";

const trials=["trial2","trial3","trial4","trialBoss"];
function startTrial(id){
  if(id===4){trial={id,fortress:true,key:"fortRehearsal"};showField();startExpedition(9,0);return;}
  const phases=id===0?[exercise(5,0)]:id===1?[exercise(6,3)]:id===2?[Expedition.narrowGate(27,exercise)]
    :[exercise(2,414),exercise(3,415),exercise(5,6),exercise(6,9),Expedition.narrowGate(29,exercise)];
  trial={id,key:trials[id],stage:{enemy:3,species:31,phases}};
  showField();startExpedition(79,0);
}
function reviewChoice(){
  const candidates=Expedition.reviewKinds.map((kind,i)=>({kind,serial:saved.reviews[i],need:(saved.study[kind]?.[2]||0)-saved.reviews[i]}));
  return candidates.filter(c=>c.need>0 && c.serial<100).sort((a,b)=>b.need-a.need)[0];
}
el("voyReview").onclick=()=>{
  const choice=reviewChoice();if(!choice)return;
  const rank=Expedition.rankOf(Math.min(saved.expedition,79));
  const puzzle=Expedition.review(choice.kind,choice.serial,rank,exercise);
  trial={review:choice.kind,serial:choice.serial,key:"reviewName",stage:{enemy:rank,species:rank*8,phases:[puzzle]}};
  showField();startExpedition(Math.min(saved.expedition,79),0);
};
function returnFromTrial(){
  resumeTrack();openMap(mapLocation());
}
function portrait(canvas,character){
  const id=Voyage.cast.indexOf(character),ink=canvas.getContext("2d");
  const image=id?ExpeditionCast.sheet:cast[0];
  const paint=()=>{
    if(canvas.dataset.actor!==String(id))return;
    ink.clearRect(0,0,canvas.width,canvas.height);
    ExpeditionCast.party(ink,id,canvas.width/2,canvas.height*.97,canvas.height*.99);
  };
  canvas.dataset.actor=String(id);
  if(image.naturalWidth)paint();else image.addEventListener("load",paint,{once:true});
}
function openMap(id,outcome=false){
  TempoCombat.leave();
  clearTimeout(timer);WorldMap.cancel();
  mapStage=id;mapOutcome=outcome;
  el("voyage").hidden=false;
  el("battleLayout").hidden=true;
  renderMap();
  window.scrollTo({top:0,behavior:"instant"});
}
function showField(){
  WorldMap.cancel();
  el("voyage").hidden=true;
  el("battleLayout").hidden=false;
  resizeBattle();window.scrollTo({top:0,behavior:"instant"});
}
function enterTrack(track){
  showField();
  saved.track=track;
  save();resumeTrack();
}
function renderMap(){
  const rank=Expedition.rankOf(mapStage),scene=Voyage.scene(mapStage);
  const member=mapOutcome && newRecruit?newRecruit:scene.speaker;
  const actor=Voyage.cast[member];
  const locked=mapStage>saved.expedition;
  const finale=mapOutcome && mapStage===79;
  el("mapRegion").textContent=localizedPair(Atlas.chapters[rank].name);
  WorldMap.render(mapStage,mapOutcome);
  portrait(el("sceneCast"),actor);
  el("voyChapter").textContent=t("chapterLabel",rank+1);
  el("voyTitle").textContent=localizedPair(Voyage.chapters[rank]);
  el("voyLocation").textContent=t("stageLabel",String(mapStage+1).padStart(2,"0"))+" / 80"+(mapStage<saved.expedition?" · ✓ "+t("cleared"):"");
  el("voyPlace").textContent=mapOutcome?(finale?t("returnCrew"):newRecruit?t("recruit")+" · "+localizedPair(actor.name):t("clearedStage")+" · "+localizedPair(scene.title)):localizedPair(scene.title);
  el("voySpeaker").textContent=localizedPair(actor.name)+" · "+localizedPair(actor.role);
  el("voyLine").textContent=localizedPair(mapOutcome?scene.after:scene.before)+(mapOutcome&&newRecruit?" “"+localizedPair(actor.oath)+"”":"");
  if(locked)el("voyLine").textContent=t("needsSite",localizedPair(Voyage.places[mapStage-1]));
  if(mapOutcome){
    if(lastLoot)el("voyLine").append(" · "+localizedPair(Workshop.materials[lastLoot[0]])+" +"+lastLoot[1]);
    if(ticketWon)el("voyLine").append(" · "+localizedPair(["招待状","영입권"])+" +1");
    if(teamFound.length)el("voyLine").append(" · "+localizedPair(["同行者の成果","동료의 성과"])+" "+teamFound.map(([i,n])=>localizedPair(Workshop.materials[i])+" +"+n).join(" · "));
    const prize=earnedCosmetic;
    if(prize)el("voyLine").append(" · "+t("unlockedSkin",localizedPair(prize[3])));
    if((mapStage+1)%20===0 && !finale)el("voyLine").append(" · "+t("nextChapter",localizedPair(Voyage.chapters[rank+1])));
  }
  el("quickTrials").hidden=mapOutcome;
  el("voyGo").disabled=locked || !!WorldMap.travel;
  el("voyGo").textContent=WorldMap.travel?t("walking"):!mapOutcome&&saved.gate===mapStage?t("playDuel"):mapOutcome?t(finale?"homeRoute":"depart"):locked?t("previewLocked"):t("act",1+(mapStage===saved.expedition?saved.round:0));
  const review=reviewChoice();
  el("voyReview").hidden=!review;
  if(review)el("voyReview").textContent=t("reviewLabel",t(review.kind));
  el("mapCount").textContent=Math.max(0,Math.min(20,saved.expedition-rank*20))+" / 20";
  el("progress").textContent=t("progress",saved.expedition,80);
  el("chapterTabs").replaceChildren(...Expedition.ranks.map((label,i)=>{
    const b=document.createElement("button");b.type="button";b.textContent=localizedPair(label);b.setAttribute("aria-pressed",String(rank===i));
    b.onclick=()=>openMap(i===Expedition.rankOf(Math.min(79,saved.expedition))?Math.min(79,saved.expedition):20*i);
    return b;
  }));
  Crew.render();
  el("trialChoices").replaceChildren(...[...trials,"fortRehearsal"].map((key,i)=>{
    const b=document.createElement("button");b.type="button";b.className="control";b.dataset.trial=i;
    b.textContent=((i<4&&(saved.trials&(1<<i)))?"✓ ":"")+t(key);b.onclick=()=>startTrial(i);return b;
  }));
  el("bossPicker").replaceChildren(...MatchPositions.map((entry,i)=>new Option(((saved.matchWins&(1<<i))?"✓ ":"")+localizedPair(Voyage.guardians[i])+" · "+entry.size+t("lines"),String(i))));
  function entries(){
    const index=Number(el("bossPicker").value),item=MatchPositions[index],current=Number(el("matchEntry").value)||0;
    el("matchEntry").replaceChildren(...[0,1,2].map(depth=>new Option(t("entry"+depth)+" · "+t("entryPly",MatchRules.entry(item,depth).start.length+1),String(depth),false,depth===current)));
  }
  entries();el("bossPicker").onchange=entries;
  const rows=Object.entries(saved.study).filter(([,r])=>r.some(n=>n>0));
  el("studySummary").textContent=rows.length?t("studyCount",rows.reduce((n,[,r])=>n+r.reduce((a,b)=>a+b,0),0)):t("learningHelp");
  el("studyRows").replaceChildren(...rows.map(([kind,counts])=>{
    const row=document.createElement("p"),label=document.createElement("b");label.textContent=t(kind)+" · ";row.append(label,t("studyStat",...counts));return row;
  }));
}
el("bossPractice").onclick=()=>BossMatch.open(Number(el("bossPicker").value),true);
el("quickTrials").onclick=()=>{el("trialMenu").scrollIntoView({block:"center"});el("trialChoices").firstElementChild.focus({preventScroll:true});};
el("mapButton").onclick=()=>trial?returnFromTrial():openMap(journey()?level:mapLocation(),journey() && mode==="won");
el("campLegacy").onclick=()=>enterTrack("story");
el("campTrain").onclick=()=>enterTrack("training");
el("campBackup").onclick=()=>el("backup").onclick();
el("voyGo").onclick=()=>{
  if(mapStage>saved.expedition)return;
  if(mapOutcome){
    if(mapStage===79){openMap(mapStage);return;}
    beginWalk();return;
  }
  showField();trial=null;saved.location=mapStage;saved.track="expedition";save();startExpedition(mapStage);
  if(saved.gate===mapStage||EarlyGuardians.ready(mapStage,saved)){mode="matchReady";showBossMatch();}
};
localize();
resumeTrack();
openMap(mapLocation());
battleReady=true;
requestAnimationFrame(battleLoop);
CrewArt.ready.then(()=>{if(!el("voyage").hidden)WorldMap.render(mapStage,mapOutcome,false);},()=>{});
