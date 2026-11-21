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
const StationTalk=(()=>{
  // A stop can be inspected again without consuming a move or changing its save.
  const lines={
    0:[0,["袋の音、聞こえた？","자루에서 소리 들었어?"],["三回たたいたね。岩角の足もとを見て。白い留め石の最後の隙間をふさげば、袋を開けられる。","세 번 두드렸어. 바위뿔 발밑을 봐. 하얀 누름돌의 마지막 틈을 막으면 자루를 열 수 있어."]],
    1:[1,["その櫂、本当に郵便舟の？","정말 우편선에서 쓰던 노야?"],["ここ、ぼくが結んだ赤い糸！ 白い石を外してみて。櫂の先の泥で、舟がどちらに流れたかわかるよ。","여기, 내가 묶은 빨간 실이야! 흰 돌을 걷어 봐. 노 끝에 묻은 진흙을 보면 배가 어느 쪽으로 갔는지 알 수 있어."]],
    2:[1,["中州の人に綱が届かないね。","모래섬까지 밧줄이 안 닿네."],["両岸から半分ずつ渡そう。離れた黒い杭をひとつにつなげば、あの人が綱をつかめるよ。","양쪽에서 반씩 건네자. 떨어진 흑돌 말뚝을 하나로 이으면 저 사람이 밧줄을 잡을 수 있어."]],
    3:[0,["葉と泥、どちらについて行く？","잎과 진흙 중 뭘 따라가?"],["舟底についたのは泥だよ。水面の葉は下流に行くのに、泥の跡は上流に続いてる。橋脚を見に行こう。","배 밑에 묻은 건 진흙이야. 물 위의 잎은 하류로 가는데 진흙 자국은 상류로 이어져. 교각을 보러 가자."]],
    4:[2,["橋板はどこに戻す？","다릿장은 어디에 놓을까?"],["鈴蛾が片側をふさぐまで待つんだ。最初の隙間だけ見ないで、白が返した後の岸に板を渡そう。","방울나방이 한쪽을 막을 때까지 봐. 처음 난 틈만 보지 말고, 백이 응수한 뒤에 열린 쪽에 다릿장을 놓자."]],
    9:[0,["あの盾を支えているのは？","저 방패는 뭐가 붙들고 있어?"],["印のついた白い鎖だ。端の石を取っても外れない。まず黒い足場をつないで、鎖の逃げ口を一つにしよう。","표시된 흰 사슬이야. 구석 돌을 따내도 방패는 그대로야. 흑돌 발판부터 잇고 사슬의 출구를 하나로 줄이자."]]
  };
  const canvas=el("sceneCast"),button=document.createElement("button");
  canvas.width=canvas.height=140;button.type="button";button.className="map-face";
  canvas.before(button);button.append(canvas);button.setAttribute("aria-controls","voyLine");
  el("voyLine").setAttribute("aria-live","polite");el("voyLine").setAttribute("aria-atomic","true");
  let active=null;
  function render(member,locked){
    const line=el("voyLine"),who=el("voySpeaker"),base=line.textContent,label=who.textContent;
    const key=[mapStage,mapOutcome,saved.locale].join("/"),record=!locked&&!mapOutcome&&lines[mapStage];
    if(active!==key)active=null;
    button.disabled=!record;button.hidden=locked;
    function apply(){
      const answering=!!record&&active===key,id=answering?record[0]:member;
      const name=localizedPair(Voyage.cast[id].name);
      const spoken=answering?localizedPair(record[2]):base;
      who.textContent=answering?name+" · "+localizedPair(Voyage.cast[id].role):label;
      line.textContent=spoken;
      if(answering){
        const question=document.createElement("small");question.className="talk-question";question.textContent=localizedPair(record[1]);line.prepend(question);
      }
      const talk=answering||!locked&&(/^\s*[「“"]/u.test(base)||!!(mapOutcome&&newRecruit));
      const action=answering?localizedPair(["元の場面へ戻る","원래 장면 보기"]):name+localizedPair(["に話しかける","에게 말 걸기"]);
      button.title=record?action:"";button.setAttribute("aria-label",record?action:name);
      if(record)button.setAttribute("aria-pressed",String(answering));else button.removeAttribute("aria-pressed");
      if(locked){who.textContent="";window.TalkPortrait.clear(canvas);}
      else window.TalkPortrait.show(canvas,id,{speaking:talk,line:spoken,key:key+"/"+answering});
    }
    button.onclick=record?()=>{active=active===key?null:key;apply();}:null;
    apply();
  }
  return {render,leave(){active=null;window.TalkPortrait.clear(canvas);}};
})();
function openMap(id,outcome=false,preview=false){
  if(TempoCombat.status&&mode==="playing"&&!el("battleLayout").hidden)checkpointStand();
  fieldTransition.cancel();TempoCombat.leave();
  clearTimeout(timer);WorldMap.cancel();
  if(outcome)WorldMap.resetParty();
  if(outcome&&id<79&&id<saved.expedition)MapJourney.write("road",id);
  const pending=MapJourney.pending();
  mapStage=!preview&&pending!==null&&id===mapLocation()?pending:id;
  mapOutcome=outcome||!preview&&pending!==null&&mapStage===pending;
  el("voyage").hidden=false;
  el("battleLayout").hidden=true;
  renderMap(!preview);
  if(!preview)window.scrollTo({top:0,behavior:"instant"});
}
function showField(){
  StationTalk.leave();SiteVisit.reset();WorldMap.resetParty();
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
function renderMap(center=true){
  const rank=Expedition.rankOf(mapStage),scene=Voyage.scene(mapStage);
  const member=mapOutcome && newRecruit?newRecruit:scene.speaker;
  const actor=Voyage.cast[member];
  const locked=mapStage>saved.expedition;
  const finale=mapOutcome && mapStage===79;
  el("mapRegion").textContent=localizedPair(Atlas.chapters[rank].name);
  WorldMap.render(mapStage,mapOutcome,center);
  el("voyChapter").textContent=t("chapterLabel",rank+1);
  el("voyTitle").textContent=localizedPair(Voyage.chapters[rank]);
  el("voyLocation").textContent=t("stageLabel",String(mapStage%20+1).padStart(2,"0"))+" / 20"+(mapStage<saved.expedition?" · ✓ "+t("cleared"):"");
  el("voyPlace").textContent=mapOutcome?(finale?t("returnCrew"):newRecruit?t("recruit")+" · "+localizedPair(actor.name):t("clearedStage")+" · "+localizedPair(scene.title)):localizedPair(scene.title);
  el("voySpeaker").textContent=localizedPair(actor.name)+" · "+localizedPair(actor.role);
  el("voyLine").textContent=localizedPair(mapOutcome?scene.after:scene.before)+(mapOutcome&&newRecruit?" “"+localizedPair(actor.oath)+"”":"");
  if(locked)el("voyLine").textContent=t("needsSite",localizedPair(Voyage.places[mapStage-1]));
  const pendingRound=mapStage===saved.expedition?storedFieldRound(mapStage,saved.round):0;
  const preview=el("voyEncounter");
  preview.hidden=locked||mapOutcome;
  if(!preview.hidden){
    const encounter=Expedition.stage(mapStage,exercise);
    const phases=encounter.phases;
    const target=mapStage%10===9?localizedPair(Voyage.guardians[Math.floor(mapStage/10)]):monsterName(encounter.species);
    const lastDefense=pendingRound===phases.length&&LastStand.has(mapStage);
    preview.textContent=target+" · "+(lastDefense?localizedPair(["最後の守り","마지막 방어"]):t((phases[pendingRound]||TempoCombat.extraProblem(mapStage,pendingRound,phases)).kind));
  }
  if(mapOutcome){
    BattleResults.present(mapStage);
    if((mapStage+1)%20===0 && !finale)el("voyLine").append(" · "+t("nextChapter",localizedPair(Voyage.chapters[rank+1])));
  }
  StationTalk.render(member,locked);
  el("quickTrials").hidden=mapOutcome;
  el("voyGo").hidden=mapOutcome&&!finale||MapJourney.pending()===mapStage-1&&mapStage>0;
  el("voyGo").disabled=locked || !!WorldMap.travel;
  el("voyGo").textContent=WorldMap.travel?t("walking"):!mapOutcome&&saved.gate===mapStage?t("playDuel"):mapOutcome?t("homeRoute"):locked?t("previewLocked"):t("act",1+pendingRound);
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
    return;
  }
  showField();trial=null;saved.location=mapStage;saved.track="expedition";save();startExpedition(mapStage);
  if(saved.gate===mapStage||EarlyGuardians.ready(mapStage,saved)){mode="matchReady";showBossMatch();}
};
MapJourney.shelf(el("mapViewport").parentElement,[el("voyPlace"),el("voyGo")]);
localize();
resumeTrack();
openMap(mapLocation());
battleReady=true;
requestAnimationFrame(battleLoop);
CrewArt.ready.then(()=>{if(!el("voyage").hidden)WorldMap.render(mapStage,mapOutcome,false);},()=>{});
