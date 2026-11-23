"use strict";

// One monotonic byte carries the new frontier and its completed phases. The
// original 0..79 expedition remains a different namespace throughout.
const ReachProgress=(()=>{
  const base=80,count=20,gate=20;
  const local=id=>Number.isInteger(id)&&(id>=0&&id<count||id>=base&&id<base+count)?id>=base?id-base:id:-1;
  const isBoss=i=>i===6||i===9||i===19;
  const phases=i=>i===9||i===19?5:i===4||i===14?4:3;
  function read(value,frontier){
    if(!Number.isInteger(frontier)||frontier<gate||!Number.isInteger(value)||value<0||value>count*8)return 0;
    const i=Math.floor(value/8),phase=value%8;
    return i===count?value:phase<phases(i)+Number(isBoss(i))?value:0;
  }
  function allowed(id,frontier,raw){
    const i=local(id);return i>=0&&frontier>=gate&&i<=Math.floor(read(raw,frontier)/8);
  }
  function checkpoint(id,phase,raw,frontier){
    const value=read(raw,frontier),i=local(id);
    if(!allowed(i,frontier,value)||Math.floor(value/8)!==i||phase!==value%8)return value;
    if(!isBoss(i)&&phase+1>=phases(i))return value;
    return phase+1===phases(i)+Number(isBoss(i))?(i+1)*8:i*8+phase+1;
  }
  function defeat(id,raw,frontier){
    const i=local(id),value=read(raw,frontier);
    return allowed(i,frontier,value)&&!isBoss(i)&&Math.floor(value/8)===i?(i+1)*8:value;
  }
  // Both positions were played from the empty board. Keep every move to retain
  // the superko history. Neither position is ahead for Black when it opens.
  const matches={
    get 6(){return EarlyGuardians.game(86);},
    9:{rank:1,komi:2.5,start:[59,38,48,31,33,20,32,29,39,30,40,50,41,21,51,22,49,23,42,24,58,47,57,56,60,11,34,10,25,12,16,13,15,14,43,19,52,28,61,37,66,46,65,55,64,68,69,1,77,76]},
    19:{rank:2,komi:2.5,start:[48,32,50,30,38,42,39,31,49,41,40,21,29,20,47,22,51,23,56,24,57,33,59,11,58,10,60,12,28,13,19,14,37,15,46,16,52,25,43,34,55,64,65,67]}
  };
  return Object.freeze({base,count,gate,local,isBoss,phases,read,allowed,checkpoint,defeat,matches});
})();

const SecondReach=(()=>{
  let dialog,index=-1,phase=0,mode="closed",stage,mission,state,turns,last=null,reply=null,hint=null;
  let match=null,line=[],message="",epoch=0,anim=0,motion="idle",swing=0,matchCapture=null,afterBack=null,played=[],restoring=false,idleTimer=0;
  let victoryAt=0,victoryTimer=0;
  const transition=boardTransition();
  let saveFailed=false,reading,previousLessonEdition=false;
  let crewMask=0,focusedPoint=-1,defenses=[],guardSpent=false,committing=false,legacyWin=false;
  let actorHeight=0;
  const pair=(ja,ko)=>localizedPair([ja,ko]);
  const element=id=>document.getElementById(id);
  const cleared=()=>Math.floor(ReachProgress.read(saved.reach,saved.expedition)/8);
  const outer=id=>typeof OuterCampaign!=="undefined"&&OuterCampaign.abs(id);
  const isBoss=id=>outer(id)?OuterCampaign.boss(id):ReachProgress.isBoss(id);
  const countPhases=id=>outer(id)?OuterCampaign.phaseCount(id):ReachProgress.phases(id);
  const regionCount=id=>outer(id)?OuterCampaign.cleared(saved,OuterCampaign.region(id)):cleared();
  const local=id=>outer(id)?OuterCampaign.local(id):id;
  const unlocked=id=>outer(id)?OuterCampaign.allowed(id,saved):ReachProgress.allowed(id,saved.expedition,saved.reach)&&(ReachProgress.local(id)!==9||typeof ReachFork==="undefined"||ReachFork.bossOpen(saved.reachFork,saved.reach));
  const bossGame=()=>outer(index)?OuterCampaign.game(index,saved):typeof ReachFork==="undefined"?ReachProgress.matches[index]:ReachFork.match(index,ReachProgress.matches[index],saved.reachFork);
  let assistance=null;
  function helper(){
    if(!assistance||assistance.position!==state)assistance={position:state,step:0,points:[]};
    return assistance;
  }
  const inMatch=()=>!!match;
  const tempoView={
    active:()=>!!dialog?.open&&!match,
    mode:()=>mode==="reply"?"waiting":mode,
    boss:()=>isBoss(index),enemyName:()=>element("reachEnemy").textContent,knockout:()=>{if(!match&&!isBoss(index)&&mode==="playing")knockout();},
    guard:()=>act(-1,[],white),kind:()=>mission.kind,species:()=>stage.species,
    mount:hud=>element("reachScene").after(hud),
    foeVitals:()=>element("reachFoeVitals"),
    health:r=>{const output=element("reachHP");output.hidden=false;
      const ally=output.firstElementChild, enemy=pair("敵 ","상대 ")+r.hp+"/"+r.max;
      showPartyHealth(ally,r.ally);
      const label=pair("味方体力","아군 체력");if(ally.getAttribute("aria-label")!==label)ally.setAttribute("aria-label",label);
      const enemyMeter=element("reachEnemyVital");
      if(enemyMeter.textContent!==enemy){
        enemyMeter.textContent=enemy;enemyMeter.setAttribute("role","meter");enemyMeter.setAttribute("aria-label",pair("敵の体力","적 체력"));
        enemyMeter.setAttribute("aria-valuemax",r.max);enemyMeter.setAttribute("aria-valuenow",r.hp);
        enemyMeter.style.setProperty("--enemy-health",100*r.hp/r.max+"%");
      }},
    strike:()=>{motion="break";swing=performance.now();scene();},persist:()=>remember(),
    openRite:()=>{if(history.state?.reachBattle===index&&!history.state.reachRite)history.pushState({...history.state,reachRite:true},"");},
    closeRite:()=>{if(history.state?.reachRite)history.back();}
  };
  function install(){
    if(dialog)return;
    dialog=document.createElement("dialog");dialog.id="reachBattleDialog";dialog.setAttribute("aria-labelledby","reachEnemy");
    dialog.innerHTML='<div class="reach-fight"><header><button id="reachBattleBack" type="button">‹</button><div><small id="reachDepth"></small><h2 id="reachEnemy"></h2></div><output id="reachHP" aria-live="off" hidden><span class="party-vital" id="reachAllyVital" role="meter" aria-valuemin="0" aria-valuemax="100"></span><span id="reachEnemyVital"></span><span id="reachFoeVitals" class="foe-vitals" hidden></span></output></header><canvas id="reachScene" width="480" height="150" aria-hidden="true"></canvas><p id="reachGoal"></p><div class="reach-goban"><canvas id="reachBoard" width="540" height="540" aria-hidden="true"></canvas><canvas id="reachFx" width="540" height="540" aria-hidden="true"></canvas><div id="reachPoints"></div></div><p id="reachStatus" role="status"></p><nav><button id="reachHint" type="button"></button><button id="reachReset" type="button"></button><button id="reachPass" type="button"></button><button id="reachContinue" type="button" hidden></button><button id="reachNext" type="button"></button></nav></div>';
    document.body.append(dialog);
    const points=element("reachPoints");
    for(let p=0;p<81;p++){
      const b=document.createElement("button");b.type="button";b.dataset.point=p;b.onclick=()=>place(p);points.append(b);
    }
    reading=DuelReading.mount(element("reachStatus"),points);
    const arena=element("reachScene");
    new ResizeObserver(()=>{
      actorHeight=portraitArenaHeight(480,arena.getBoundingClientRect().width,118,.21,230);
      if(dialog.open&&index>=0)scene();
    }).observe(arena);
    points.addEventListener("keydown",event=>{
      const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!delta||!event.target.matches("button[data-point]"))return;event.preventDefault();
      const origin=Number(event.target.dataset.point);let x=origin%9,y=Math.floor(origin/9);
      for(let i=0;i<8;i++){x+=delta[0];y+=delta[1];if(x<0||x>=9||y<0||y>=9)return;
        const next=points.children[y*9+x];if(!next.disabled){event.target.tabIndex=-1;next.tabIndex=0;focusedPoint=y*9+x;next.focus();return;}}
    });
    points.addEventListener("focusin",e=>{if(e.target.matches("button[data-point]"))focusedPoint=Number(e.target.dataset.point);});
    element("reachNext").onclick=advance;element("reachReset").onclick=retry;element("reachHint").onclick=guide;
    element("reachContinue").onclick=continueMatch;
    element("reachPass").onclick=()=>place(-1);element("reachBattleBack").onclick=()=>exit();
    dialog.addEventListener("cancel",event=>{event.preventDefault();exit();});
    addEventListener("popstate",()=>{
      if(dialog.open&&element("burstDialog").open&&!history.state?.reachRite)element("burstDialog").close();
      if(dialog.open&&history.state?.reachBattle!==index)leave();
    });
  }
  const resumeKey=CampaignSlots.session("bfq-second-reach.field.v1");
  const fieldKey=i=>storageKey+".field-health."+CampaignSlots.id+"."+i;
  function readRecord(storage,key){
    try{
      const r=JSON.parse(storage.getItem(key));
      if(!r||!Number.isInteger(r.i)||!unlocked(r.i)||r.campaign&&r.campaign!==CampaignSlots.id)return null;
      // The old ledger has only eight slots per stage. Extra rounds are stored
      // alongside health, never in the next stage's ledger or next lamp bit.
      const maxPhase=isBoss(r.i)||r.version!==2?countPhases(r.i):4096;
      return Number.isInteger(r.phase)&&r.phase>=0&&r.phase<=maxPhase&&Array.isArray(r.moves)&&r.moves.length<=8?r:null;
    }catch{return null;}
  }
  const session=()=>readRecord(sessionStorage,resumeKey);
  function remember(){
    if(!dialog?.open||restoring||mode==="leaving")return;
    const data=JSON.stringify({version:2,readingBook:1,pick:mission?.bookCode,lessonVersion:previousLessonEdition?0:1,campaign:CampaignSlots.id,i:index,phase,moves:played,defenses,guardSpent,crew:crewMask,mode,
      legacyWin,combat:match?null:TempoCombat.snapshot()});
    try{sessionStorage.setItem(resumeKey,data);}catch{}
    if(!match&&!isBoss(index)&&local(index)===regionCount(index)){
      try{localStorage.setItem(fieldKey(index),data);}catch{}
    }
  }
  addEventListener("pagehide",remember);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)remember();});
  function pending(){return session()?.i??null;}
  function resume(){const r=session();return r?enter(r.i,r):false;}
  function enter(id,record=null){
    const i=outer(id)?id:ReachProgress.local(id);
    if(!unlocked(i)||typeof ReachPuzzles==="undefined")return false;
    if(outer(i)&&OuterCampaign.local(i)===9&&typeof OuterCrossings!=="undefined"&&CrossingLog.required(OuterCampaign.region(i),saved))return false;
    install();if(dialog.open)return false;
    const frontier=local(i)===regionCount(i);
    if(!record&&frontier&&!isBoss(i))record=readRecord(localStorage,fieldKey(i));
    const savedPhase=frontier?(outer(i)?OuterCampaign.value(saved,OuterCampaign.region(i)):ReachProgress.read(saved.reach,saved.expedition))%8:0;
    if(record&&(record.i!==i||frontier&&Math.min(record.phase, countPhases(i)-Number(!isBoss(i)))!==savedPhase))record=null;
    committing=legacyWin=false;
    crewMask=record&&Number.isInteger(record.crew)&&record.crew>=0&&record.crew<=0x7fffffff?record.crew:0;
    guardSpent=!!record?.guardSpent;
    index=i;phase=record?.phase??savedPhase;
    // Replay older in-flight turns on the boards that originally accepted them.
    previousLessonEdition=!outer(i)&&!!record&&record.lessonVersion!==1;
    stage=outer(i)?OuterPuzzles.stage(i):ReachPuzzles.stage(i,previousLessonEdition);mode="ready";afterBack=null;dialog.showModal();
    if(!record||history.state?.reachBattle!==i)history.pushState({...history.state,reachBattle:i},"");
    if(!phase&&!record)BattleEntrance.begin(outer(i)?i:80+i,true);
    restoring=!!record;loadPhase(false,!!record&&record.readingBook!==1);
    if(record?.defenses?.length<=8&&Array.isArray(record.defenses))defenses=record.defenses.map(n=>Number.isInteger(n)&&n>=-1&&n<81?n:null);
    if(record&&!match){
      for(const [i,p] of record.moves.entries()){
        if(mode!=="playing"||!Number.isInteger(p)||p<0||p>=81)break;
        const unresolved=record.mode==="reply"&&i===record.moves.length-1;
        place(p,true,unresolved);
      }
    }
    if(record&&!match){
      const restored=TempoCombat.restore(record.combat);
      if(restored&&record.mode==="reply"&&mode==="retry")TempoCombat.hit(null,{silent:true});
      // An already solved pre-HP final board kept its earned map confirmation.
      legacyWin=!isBoss(i)&&record.mode==="complete"&&(record.version===undefined||record.legacyWin===true)
        &&phase===stage.phases.length-1&&mode==="phase"&&solved(state.board,mission);
      if(!isBoss(i)&&(restored&&TempoCombat.status.hp===0||legacyWin))knockout();
      else if(restored&&TempoCombat.status.ally===0)regroup();
      else render();
    }
    restoring=false;render();element("reachBattleBack").focus({preventScroll:true});return true;
  }
  function leave(){
    FieldCoaching.dismiss("reachStatus");transition.cancel();remember();epoch++;cancelAnimationFrame(anim);clearTimeout(idleTimer);try{sessionStorage.removeItem(resumeKey);}catch{}
    clearTimeout(victoryTimer);victoryAt=0;
    TempoCombat.leave();if(dialog?.open)dialog.close();mode="closed";match=null;index=-1;
    const next=afterBack;afterBack=null;if(next)next();
  }
  function exit(next=afterBack){
    if(!dialog?.open)return;
    afterBack=typeof next==="function"?next:null;
    if(history.state?.reachBattle===index)history.back();else leave();
  }
  function returnMain(){if(typeof ReachMap!=="undefined")ReachMap.close();openMap(Math.min(saved.expedition,20));}
  function key(){
    const route=outer(index)?OuterCampaign.route(saved):index===9&&typeof ReachFork!=="undefined"?ReachFork.bossRoute(saved.reachFork):0;
    return storageKey+".second-reach.match."+index+(route?".route."+route:"");
  }
  function saveLine(){try{localStorage.setItem(key(),JSON.stringify(line));}catch{}}
  function readLine(){
    try{const v=JSON.parse(localStorage.getItem(key()));if(Array.isArray(v)&&v.length<=1250&&v.every(n=>Number.isInteger(n)&&n>=-1&&n<81))return v;}catch{}
    return [];
  }
  function loadPhase(restart=false,legacy=false){
    transition.cancel();saveFailed=false;reading.reset();
    if(dialog?.open)dialog.scrollTop=0;
    epoch++;cancelAnimationFrame(anim);clearTimeout(idleTimer);played=[];defenses=[];reply=last=hint=null;message="";swing=0;motion="idle";matchCapture=null;
    const token=epoch,fauna=outer(index)?OuterFauna:ReachFauna;
    if(!isBoss(index)||phase<stage.phases.length){
      const id=outer(index)?index:80+index;
      match=null;mission=stage.phases[phase]??FieldBook.select(id,phase,stage.phases,{replay:local(index)<regionCount(index),legacy});turns=mission.turns;
      state={board:mission.board.slice(),previous:"",captured:[]};mode="playing";
      TempoCombat.begin(outer(index)?index:80+index,phase,stage.phases.length,turns,tempoView);
    }else{
      TempoCombat.leave();element("reachHP").hidden=true;
      const game=bossGame();
      line=restart?[]:readLine();
      try{match=MatchRules.replay(9,[...game.start,...line]);}catch{line=[];match=MatchRules.replay(9,game.start);}
      saveLine();state=null;mission=null;turns=0;last=match.last;
      mode=match.passes===2?finishMatch():match.side===1?"match":"white";
    }
    const painted=fauna.motionReady(index)??(match&&index<160?fauna.ready:null);
    painted?.then(ready=>{if(ready&&epoch===token&&dialog.open)scene();}).catch(()=>{});
    render();if(mode==="white")think();
  }
  function regroup(){
    mode="retry";message=pair("味方の体力が尽きた。立て直して同じ局面へ。","아군 체력이 다했어요. 재정비하고 같은 국면에 다시 도전하세요.");render();
  }
  function knockout(){
    if(isBoss(index)||match)return;
    mode="complete";message=legacyWin?pair("道が開いた。","길이 열렸어요."):pair("敵を撃破。道が開いた。","적을 격파했다. 길이 열렸어요.");
    render();
  }
  function finishMatch(){
    const result=MatchRules.score(match,bossGame().komi);
    message=pair("双方がパス。盤を確かめてから進もう。","양쪽이 패스했어요. 판을 확인한 뒤 진행하세요.");
    return result.margin>0?"complete":"matchLost";
  }
  function continueMatch(){
    if(!match||committing)return;
    const continuation=MatchRules.resumeLine(match,line);
    if(!continuation)return;
    match=MatchRules.replay(9,[...bossGame().start,...continuation]);
    line=continuation;saveLine();last=match.last;
    mode="match";saveFailed=false;reading.reset();
    message=pair("同じ盤から黒番を再開。残った石を確かめよう。","같은 판에서 흑 차례로 이어 둡니다. 남은 돌을 확인하세요.");
    render();
    const point=element("reachPoints").querySelector('button[tabindex="0"]');
    if(point){
      point.focus({preventScroll:true});
      point.scrollIntoView({block:"nearest",inline:"nearest"});
    }
  }
  function position(){return match?match.board:state.board;}
  function paintBoard(){
    const canvas=element("reachBoard"),c=canvas.getContext("2d"),u=canvas.width/9,at=p=>[(p%9+.5)*u,(Math.floor(p/9)+.5)*u];
    Wardrobe.surface(c,canvas.width,canvas.height,saved.gear[0]);c.strokeStyle=Wardrobe.boards[saved.gear[0]][5][2];c.lineWidth=1.7;
    for(let n=0;n<9;n++){const v=(n+.5)*u;c.beginPath();c.moveTo(.5*u,v);c.lineTo(8.5*u,v);c.moveTo(v,.5*u);c.lineTo(v,8.5*u);c.stroke();}
    for(const p of [20,24,40,56,60]){const [x,y]=at(p);c.fillStyle=c.strokeStyle;c.beginPath();c.arc(x,y,3.2,0,Math.PI*2);c.fill();}
    const b=position();
    const anchor=focusedPoint>=0&&!b[focusedPoint]?focusedPoint:b.indexOf(0);
    for(let p=0;p<81;p++){const [x,y]=at(p),v=b[p];if(v)Wardrobe.stone(c,x,y,u*.453,v===2,saved.gear[1]);
      if(mission?.kind==="signal"&&mission.signalPoint===p){
        c.strokeStyle="#195963";c.lineWidth=3.1;c.beginPath();c.moveTo(x,y-u*.29);c.lineTo(x+u*.24,y);c.lineTo(x,y+u*.29);c.lineTo(x-u*.24,y);c.closePath();c.stroke();
      }
      if(mission?.targets.includes(p)){c.strokeStyle=v===1?"#ffc978":"#97401e";c.lineWidth=2.7;c.strokeRect(x-u*.17,y-u*.17,u*.34,u*.34);}
      const lit=mission&&helper().points.includes(p);
      if(p===last||lit){c.strokeStyle=lit?"#1a6375":v===1?"#ffdb88":"#374d54";c.lineWidth=3;
        c.beginPath();c.arc(x,y,lit?u*.36:u*.12,0,Math.PI*2);c.stroke();}
      const btn=element("reachPoints").children[p];btn.disabled=!["playing","match"].includes(mode)||!!v;btn.tabIndex=!btn.disabled&&p===anchor?0:-1;
      btn.classList.toggle("lit-choice",!!lit);
      btn.setAttribute("aria-label",MatchRules.coordinate(9,p)+(v===1?pair(" 黒"," 흑"):v===2?pair(" 白"," 백"):"")+(mission?.targets.includes(p)?pair(" 目印"," 목표"):"")+(lit?pair(" 候補"," 후보"):""));
    }
  }
  function scene(now=performance.now()){
    if(!dialog?.open)return;cancelAnimationFrame(anim);clearTimeout(idleTimer);
    const ca=element("reachScene"),c=ca.getContext("2d"),age=swing?(now-swing)/(match?BattleActions.duration:650):2,f=Math.max(0,Math.min(1,age));
    c.imageSmoothingEnabled=false;
    const bg=outer(index)?OuterMapArt.battle(index,regionCount(index),true):typeof ReachMap!=="undefined"&&ReachMap.battle?ReachMap.battle(index,cleared(),true):MapArt.battle(0,index,true);
    const height=drawFieldScenery(ca,c,bg,480,150);
    const heroX=190,base=height*.84,h=Math.min(107,(actorHeight||height)*.50),attack=motion==="hit"||motion==="break";
    if(BattleEntrance.blocking&&!match){
      const fauna=outer(index)?OuterFauna:ReachFauna,boss=isBoss(index),id=boss?(index===9?0:1):stage.species;
      const arrival={x:369,height:94,name:(fauna.name(index)||Expedition.names.flat()[stage.species])[1],kind:"",
        paint:(ink,x,y,height,frame,cel)=>{
          const pose=frame===2?"tell":"idle",beat=frame===1?.72:.12;
          if(fauna.draw(ink,index,x,y,height,pose,beat,undefined,cel))return true;
          (boss?ExpeditionCast.guardian:ExpeditionCast.foe)(ink,id,x,y,height,0,1,0,true,{pose,beat,cel});
        }};
      if(BattleEntrance.draw(c,ca,480,height,base,heroX,h,6,heroX-40,3,arrival,now)){
        anim=requestAnimationFrame(scene);return;
      }
    }
    const beat=reduceMotion?0:Math.sin(f*Math.PI);
    const receipt=match?null:TempoCombat.action;
    const action=BattleActions.phase(receipt,now,reduceMotion)?receipt:null;
    const health=match?null:TempoCombat.shownHealth(now);
    const pack=match?[]:TempoCombat.shownFoes(now),struck=TempoCombat.partyHit;
    const reviewing=match?.passes===2;
    const capture=match&&!reviewing&&age<1?matchCapture:null;
    if(capture&&!capture.heard)BattleActions.contactSound(capture,now,reduceMotion,!document.hidden);
    const foeAction=BattleActions.foe(receipt||capture,now,!pack.length&&health?.hp===0);
    const allies=Crew.draw(c,6,heroX-40,base,h,reduceMotion?0:Math.floor(now/180)%2,0,3,receipt||capture,now,health?.ally===0,match?null:TempoCombat.techniques);
    const legacy=!match&&!receipt&&age<1;
    const heroContact=BattleActions.hero(receipt||capture,now,h,health?.ally===0);
    const heroPose=reviewing?0:legacy&&age<1?attack?2:3:heroContact.pose;
    WorldScale.hero(c,heroX+(legacy?(attack?10:-4)*beat:0)+heroContact.x,base+heroContact.y,h,heroPose,heroContact.cel);
    const pose=victoryAt?"break":reviewing?"idle":foeAction?.pose??(legacy&&age<1?motion:mode==="reply"?"tell":"idle");
    const spriteBeat=victoryAt?Math.min(1,(now-victoryAt)/BattleActions.fallDuration):
      foeAction?.beat??(legacy&&age<1?f:reduceMotion?0:now%1200/1200);
    const enemyX=369+(legacy?(attack?10:-18)*beat:0)+(foeAction?.shift??0)*94;
    const fauna=outer(index)?OuterFauna:typeof ReachFauna==="undefined"?null:ReachFauna;
    const phaseCel=!match&&mode==="phase"?fauna?.transitionCel?.(index,swing,now,reduceMotion):undefined;
    const lane=pack.length?FoeParty.layout(480,height,base,pack.length)[TempoCombat.targetSlot(now)]:null;
    if(pack.length)FoeParty.draw(c,pack,480,height,base,now,{pose,beat:spriteBeat,shift:foeAction?.shift,step:foeAction?.step,hit:struck});
    else if(!fauna||!fauna.draw(c,index,enemyX,base,94,pose,spriteBeat,foeAction?.step,phaseCel)){
      const foe=isBoss(index)?ExpeditionCast.guardian:ExpeditionCast.foe;
      foe(c,isBoss(index)?index===9?0:1:stage.species,enemyX,base,94,0,1,legacy&&age<1?attack?3:2:0,true,foeAction??undefined);
    }
    if(!match)TempoCombat.render(c,480,height,now,heroX,lane?.x??enemyX,allies??[],base,lane?.y??base,h);
    checkHintDelay();
    // A waiting reply advances only through the visible turn clock, also with reduced motion.
    cancelAnimationFrame(anim);clearTimeout(idleTimer);
    if(!reduceMotion&&(action||age<1||phaseCel!==undefined||victoryAt))anim=requestAnimationFrame(scene);
    else if(!match||!reduceMotion)idleTimer=setTimeout(()=>scene(),match?260:80);
  }
  function act(p,removed,side){
    if(!match||removed.length){
      motion=side===2?"strike":removed.length?"break":"hit";
      swing=performance.now();cancelAnimationFrame(anim);
      if(match)matchCapture=BattleActions.duelCapture(side,swing);
    }
    if(p>=0)BoardFX.playOn(element("reachFx"),9,p,removed,side,saved.fx);
  }
  function render(){
    if(mission?.reviewOffer)FieldBook.offer(mission,()=>exit(),()=>dialog.open&&mode==="playing"&&mission);
    const event=outer(index)?OuterStory.event(index):typeof ReachMap!=="undefined"?ReachMap.events?.[index]:null;
    const foeName=outer(index)?OuterFauna.name(index):typeof ReachFauna==="undefined"?null:ReachFauna.name(index);
    element("reachEnemy").textContent=!match&&TempoCombat.foes.length?pair("敵の群れ","적 무리"):foeName?localizedPair(foeName):event?localizedPair(event.name):pair("水路の遠征","수로 원정");
    const regionLabel=outer(index)?localizedPair(OuterMap.names(OuterCampaign.region(index))):pair("初級 II","초급 II");
    element("reachDepth").textContent=regionLabel+(event&&foeName?" · "+localizedPair(event.name):"")+" · "+(local(index)+1)+"/20 · "+(inMatch()?pair("九路決戦","9줄 결전"):isBoss(index)?pair("前哨戦 ","전초전 ")+(phase+1)+"/"+stage.phases.length:pair("第","제")+(phase+1)+pair("局","국"));
    const goal=mission?({liberty:"goalLiberty",link:"goalLink",escape:"goalEscape",capture:"goalCapture",atari:"goalAtari",read:"goalRead"})[mission.kind]:null;
    const readingOn=mission?.studyPrompt&&mode==="playing"&&turns>0&&turns<mission.turns;
    const studyGoal=readingOn?pair("印の白を追おう · 黒は残り"+turns+"手","표시된 백 무리를 쫓으세요 · 흑 "+turns+"수 남음")
      :mission?.studyPrompt&&localizedPair(mission.studyPrompt);
    const matchGoal=match?.passes===2?pair("仮計算を確認しよう。必要なら対局を続けられます。","잠정 계가를 확인하세요. 필요하면 계속 둘 수 있어요."):
      index===6?localizedPair(EarlyGuardians.game(86).goal):pair("黒番。終局の面積で白を上回ろう。","흑으로 두어 계가 때 백보다 많은 면적을 확보하세요.");
    element("reachGoal").textContent=studyGoal||(mission?.kind==="signal"?pair("両岸の黒に二眼ずつ。合図の空点を残そう。","양쪽 흑 무리에 두 눈씩 만들고 신호점은 비워 두세요."):mission?.tactic&&mission.lesson?localizedPair(mission.lesson):goal?t(goal,mission.turns):matchGoal);
    element("reachBattleBack").setAttribute("aria-label",pair("地図へ戻る","원정 지도로"));
    element("reachStatus").textContent=message||(mode==="white"?pair("白が応手を読む…","백이 응수를 읽고 있어요…"):inMatch()?pair("続けてパスすると仮に数えます。コミ ","두 번 연속 패스하면 잠정 계가합니다. 덤 ")+bossGame().komi:"");
    if(outer(index)&&!inMatch()&&mode==="playing"&&mission?.kind==="read"&&!mission.guardian&&turns>1&&!message){
      const cue=OuterDefenseStyle.cue(TempoCombat.focus?.actor??index);if(cue)element("reachStatus").textContent=localizedPair(cue);
    }
    const show=(id,label,yes)=>{const b=element(id);b.textContent=label;b.hidden=!yes;};
    show("reachHint",mode==="playing"?hintLabel():t("hint"),mode==="playing");show("reachReset",mode==="matchLost"?t("retry"):pair("打ち直す","다시 두기"),["retry","matchLost"].includes(mode));
    if(match)reading.show(match,match.passes===2?MatchRules.score(match,bossGame().komi):null,bossGame().komi,local(index)!==19);
    show("reachPass",match?DuelReading.passLabel(match):"",mode==="match");
    show("reachContinue",pair("対局を続ける","대국 계속 두기"),mode!=="leaving"&&!!match&&!!MatchRules.resumeLine(match,line));
    element("reachContinue").disabled=committing;
    const solvedPuzzle=mode==="phase"||mode==="complete"&&!match;
    show("reachNext",saveFailed?pair("保存を再試行","저장 다시 시도"):pair("この数え方で勝利を記録","이 점수로 승리 기록"),saveFailed||mode==="complete"&&!!match);
    if(solvedPuzzle&&!restoring&&!saveFailed&&!committing){
      const token=epoch,outcome=mode;
      transition.schedule(state,dialog,()=>dialog.open&&epoch===token&&mode===outcome,advance);
    }
    paintBoard();scene();remember();
  }
  function checkHintDelay(){
    element("reachHint").classList.toggle("hint-idle",!match&&mode==="playing"&&helper().step===0&&(TempoCombat.status?.spent||0)>=25000);
  }
  const journal=()=>outer(index)?OuterCampaign:ReachJournal;
  const lampField=()=>outer(index)?"outerLamp":"reachLamps";
  function hintLabel(){
    const step=helper().step;
    if(!step)return t("hint");
    if(phase>=stage.phases.length)return pair("候補を見る","후보 보기");
    if(journal().lit(saved[lampField()],journal().bit(index,phase)))return pair("灯した局の候補","밝힌 국의 후보");
    if(step===2)return pair("灯り1個を使う","등불 1개 사용");
    return pair("候補を照らす","후보 밝히기")+" ("+ReachJournal.balance(saved.expedition,saved.lamps,saved.reachLamps,saved.outerLamp)+")";
  }
  async function guide(){
    if(mode!=="playing"||match)return;
    const help=helper(),k=journal().bit(index,phase),board=state;
    if(help.step===0){
      help.step=1;
      const advice={signal:["上下の黒をつなげず、それぞれの眼を二つ残そう。菱形は最後まで空点に。","위아래 흑을 서로 잇지 말고, 각 무리에 따로 두 눈을 남겨요. 마름모 신호점은 비웁니다."],liberty:["印の白に接する空点を数えよう。","표시한 백 무리에 붙은 빈 점을 세어 보세요."],capture:["白の最後の呼吸点はどこ？","백 무리의 마지막 활로를 찾아보세요."],link:["二つの黒が共有する空点を探そう。","두 흑 무리가 함께 닿는 빈 점을 찾아보세요."],atari:["この手の後、白にいくつ呼吸点が残る？","이 수를 두면 백의 활로가 몇 개 남을까요?"],escape:["黒が広い方へ逃げる道を読もう。","흑이 더 넓은 곳으로 나갈 길을 읽으세요."],read:["白が逃げる手を考えてから黒を選ぼう。","백이 도망갈 수를 먼저 읽고 흑 수를 골라 보세요."]};
      message=localizedPair(Expedition.studyHint(mission,turns)??advice[mission.kind]);render();return;
    }
    if(k<0){
      help.points=state.board.map((_,p)=>p).filter(p=>!state.board[p]&&goodMove(state,mission,turns,p));
      help.step=3;message=pair("追加の局面。輪の交点から選ぼう。","추가 국면이에요. 표시한 후보 중에서 고르세요.");render();return;
    }
    if(help.step===1&&!journal().lit(saved[lampField()],k)){
      help.step=2;message=pair("この局の全候補を照らす？ 灯り1個を使います。","이 국면의 모든 후보를 밝힐까요? 등불 1개를 사용합니다.");render();return;
    }
    const light=()=>{
      if(mode!=="playing"||match||state!==board||!dialog.open)return;
      let disk=null;try{disk=JSON.parse(localStorage.getItem(storageKey));}catch{}
      saved.lamps=Lanterns.merge(saved.lamps,disk?.lamps);
      const field=lampField(),old=journal().lamps(saved[field],disk?.[field]);
      if(outer(index))saved.reachLamps=ReachJournal.lamps(saved.reachLamps,disk?.reachLamps);
      if(typeof OuterCampaign!=="undefined")saved.outerLamp=OuterCampaign.lamps(saved.outerLamp,disk?.outerLamp);
      const next=outer(index)?OuterCampaign.light(old,k,ReachJournal.balance(saved.expedition,saved.lamps,saved.reachLamps,saved.outerLamp)):ReachJournal.light(old,k,saved.expedition,saved.lamps,saved.outerLamp);
      if(next===null){message=pair("灯りがありません。","남은 등불이 없어요.");render();return;}
      const points=[];for(let p=0;p<81;p++)if(!state.board[p]&&goodMove(state,mission,turns,p))points.push(p);
      if(!points.length){message=t("noHint");render();return;}
      saved[field]=next;
      if(old!==next&&!save()){saved[field]=old;message=pair("保存できません。灯りは手元にあります。","저장할 수 없어 등불을 그대로 두었어요.");render();return;}
      help.points=points;help.step=3;message=pair("輪の交点はすべて有効です。","동그라미로 표시한 수는 모두 유효해요.");
      if(outer(index)&&turns>1&&mission.kind!=="signal"&&CrewFormation.first(saved.roster,0)!==null){
        const plan=CrewCoach.recommend(Crew.deployed(),state,mission,turns,reply),forecast=CrewFormation.forecast(saved.roster,plan);
        if(forecast?.frames.length){const answer=forecast.frames[0].point;
          const placed=MatchRules.coordinate(9,plan.point),white=answer<0?pair("パス","패스"):MatchRules.coordinate(9,answer);
          message+=" "+localizedPair(CrewTactics.members[forecast.member].name)+pair("「黒"," “흑 ")+placed+pair("なら白"," 뒤 백 ")+white+pair("を読もう」","를 읽어 봐.”");}
      }
      render();
    };
    if(navigator.locks?.request)await navigator.locks.request("dawn-bell-hint",light);else light();
  }
  function retry(){if(mode==="retry"||mode==="matchLost")loadPhase(true);}
  function punish(after,p,known){
    let candidates;
    if(mission.kind==="read"||mission.kind==="capture")candidates=known||replies(after,mission,turns-1,p);
    else{
      const near=new Set([...mission.targets.flatMap(q=>[...neighbors[q],...(after.board[q]?group(after.board,q).liberties:[])]),...neighbors[p],-1]);
      candidates=[...near].map(point=>({point,state:play(after,point,white)})).filter(r=>r.state);
    }
    const danger=r=>r.state.captured.length*50+mission.targets.reduce((sum,q)=>sum+(r.state.board[q]===2?group(r.state.board,q).liberties.size:0),0);
    return candidates.sort((a,b)=>Number(a.canWin===true)-Number(b.canWin===true)||danger(b)-danger(a)||Number(a.point<0)-Number(b.point<0))[0];
  }
  function place(p,replaying=false,unresolved=false){
    if(!replaying&&BattleEntrance.blocking)return;
    if(!replaying&&!match&&!FieldBook.allow(mission,()=>exit()))return;
    if(mode==="match"){
      const next=MatchRules.move(match,p);if(!next)return;
      const captured=[];for(let i=0;i<81;i++)if(match.board[i]===2&&!next.board[i])captured.push(i);
      reading.afterBlack(next.taken);match=next;line.push(p);saveLine();last=p;message="";mode=match.passes===2?finishMatch():"white";
      if(p>=0)act(p,captured,black);render();if(mode==="white")think();else reading.focus();return;
    }
    if(mode!=="playing"||p<0)return;
    const next=play(state,p,black);if(!next){message=FieldCoaching.koReason(state,p,black)||pair("そこには打てない。","그 교차점에는 둘 수 없어요.");render();return;}
    if(!replaying)FieldCoaching.dismiss("reachStatus");
    const before=state,previousWhite=reply,priorTurns=turns;
    const verdict=mission.guardian?guardianMove(state,mission,turns,p):null;
    const accepted=verdict?verdict.win:goodMove(state,mission,turns,p);
    state=next;last=p;hint=null;reply=null;played.push(p);if(!replaying)act(p,next.captured,black);
    const done=accepted&&(verdict?verdict.done:completedMove(next,mission,p));
    const event={before:before.board,after:next.board,point:p,mission,remaining:turns,previousWhite,ids:Crew.deployed(),accepted,done};
    const oldCrew=crewMask;
    if(outer(index)&&!replaying)crewMask=CrewTactics.record(event.ids,crewMask,event,saved.roster);
    let impact=null;
    if(!replaying){
      impact=TempoCombat.attack(accepted,done,event);
      if(accepted&&TempoCombat.status.ally===0){regroup();return;}
    }
    if(done){
      if(!replaying)TempoCombat.earnedTechniques(crewMask&~oldCrew);
      if(!replaying&&local(index)===regionCount(index))FieldBook.solved(mission);
      if(!replaying&&!isBoss(index)&&TempoCombat.status.hp===0){knockout();return;}
      mode="phase";message=pair("敵が構え直す。次の局面へ。","적이 자세를 고쳐 잡는다. 다음 국면으로.");render();
      if(!replaying)FieldCoaching.record({before,after:next,mission,blackPoint:p,accepted,lure:impact},{stage:outer(index)?index:80+index,host:"reachStatus",board:"reachPoints"});
      return;
    }
    const candidates=accepted&&!verdict&&["read","capture"].includes(mission.kind)?replies(state,mission,turns-1,p):null;
    const refutation=!accepted&&atariCounter(next,mission,p);
    let counter=verdict?verdict.reply:refutation||(!accepted&&TempoDefense.counter(before,state,mission))||punish(state,p,candidates);
    if(candidates&&!replaying){
      if(outer(index))counter=OuterDefenseStyle.respond(TempoCombat.focus?.actor??index,mission,candidates,counter,state,p);
      if(crewMask!==oldCrew)counter=CrewTactics.redirect(crewMask&~oldCrew,candidates,counter,event);
      counter=TempoCombat.relay(counter,mission,p,candidates);
    }
    if(!replaying)TempoCombat.earnedTechniques(crewMask&~oldCrew);
    const historyIndex=played.length-1;
    if(replaying&&Number.isInteger(defenses[historyIndex])&&counter?.point!==defenses[historyIndex]){
      const witness=play(state,defenses[historyIndex],white);
      if(witness)counter={point:defenses[historyIndex],state:witness};
    }
    defenses[historyIndex]=counter?.point??null;
    turns--;mode="reply";message=pair("白の応手…","백의 응수…");render();const token=epoch;
    const answer=()=>{
      if(epoch!==token||!dialog.open)return;
      if(counter){state=counter.state;reply=counter.point;last=reply;if(!replaying)act(reply,state.captured,white);}
      // Resolved history only reconstructs the board. A white move which was
      // pending at reload still gets its one genuine chance to be intercepted.
      if(!accepted&&(!replaying||unresolved)&&outer(index)&&!guardSpent){
        const guard=CrewFormation.intercept(saved.roster,before,mission,priorTurns,counter);
        if(guard&&!(TempoCombat.status?.aids&(1<<guard.member))){guardSpent=true;played.pop();defenses.pop();state=before;turns=priorTurns;last=reply=previousWhite;mode="playing";
          TempoCombat.newTurn(turns);TempoCombat.block(guard.member);message=localizedPair(CrewTactics.members[guard.member].name)+pair("が割って入った。この形をもう一度読もう。"," · 반격을 막았어요. 같은 국면에서 다시 둘 수 있어요.");render();return;}
      }
      const retaliation=!replaying&&(!accepted||counter?.point>=0)?TempoCombat.hit(counter,{continued:accepted}):null;
      if(!replaying&&TempoCombat.status.ally===0){regroup();return;}
      if(accepted)TempoCombat.newTurn(turns);
      mode=accepted?"playing":"retry";
      message=accepted?pair("次の黒を読もう。","다음 흑 수를 읽어 보세요."):refutation?t("atariTaken"):reply===-1?pair("白は手を抜ける。もう一度読もう。","백이 손을 빼도 됩니다. 다시 읽어 보세요."):pair("白に応じられた。印の石を見直そう。","백이 응수했어요. 표시한 무리를 다시 보세요.");
      if(!accepted&&mission.studyPattern)message+=" "+localizedPair(Expedition.studyHint(mission,priorTurns));
      render();
      if(!replaying)FieldCoaching.record({before,after:next,mission,blackPoint:p,accepted,whiteReply:counter,retaliation},
        {stage:outer(index)?index:80+index,host:"reachStatus",board:"reachPoints"});
    };
    if(replaying)answer();
    else{TempoCombat.prepareReply(reduceMotion?100:330,answer,accepted?counter:null);remember();}
  }
  async function think(){
    const token=epoch,game=bossGame();
    const p=await MatchRules.chooseLocally(match,game.rank,game.komi,()=>epoch===token&&dialog.open);
    if(p===null||token!==epoch||!dialog.open)return;
    const next=MatchRules.move(match,p);if(!next)return;
    const removed=[];for(let i=0;i<81;i++)if(match.board[i]===1&&!next.board[i])removed.push(i);
    match=next;line.push(p);saveLine();last=reply=p;mode=match.passes===2?finishMatch():"match";
    if(mode==="match")message=p<0?pair("白はパス。黒番。","백이 패스했어요. 흑 차례."):pair("白の応手。黒番。","백이 응수했어요. 흑 차례.");
    if(p>=0)act(p,removed,white);render();if(match.passes===2)reading.focus();
  }
  function advance(){
    if(committing||mode!=="phase"&&mode!=="complete")return;
    const token=epoch;
    committing=true;saveFailed=false;
    const commit=()=>{try{if(epoch===token)advanceSaved();}finally{committing=false;}};
    if(navigator.locks?.request)navigator.locks.request(storageKey+".field-clear",commit).catch(()=>{
      committing=false;if(epoch===token){saveFailed=true;message=pair("保存を再試行してください。","저장을 다시 시도하세요.");render();}
    });
    else commit();
  }
  function advanceSaved(){
    if(!dialog?.open||mode!=="phase"&&mode!=="complete")return;
    const ordinary=!isBoss(index);
    if(mode==="complete"&&ordinary&&!legacyWin&&TempoCombat.status?.hp!==0)return;
    // Two tabs can look at the same pending victory. Re-read its frontier
    // inside the lock before granting the region's one-time materials.
    try{
      const disk=JSON.parse(localStorage.getItem(storageKey));
      if(disk&&(!disk.campaignId||disk.campaignId===CampaignSlots.id)){
        Workshop.merge(saved.work,disk.work);
        if(outer(index))saved.outer=OuterCampaign.merge(saved.outer,disk.outer,saved.expedition);
        else saved.reach=Math.max(ReachProgress.read(saved.reach,saved.expedition),ReachProgress.read(disk.reach,disk.expedition));
      }
    }catch{}
    const field=outer(index)?"outer":"reach",before=saved[field],oldSentries=saved.sentries;
    if(index===6&&inMatch()&&mode==="complete")saved.sentries|=EarlyGuardians.bit(86);
    let value=before;
    if(ordinary&&mode==="complete")value=outer(index)?OuterCampaign.defeat(index,saved):ReachProgress.defeat(index,before,saved.expedition);
    else if(!ordinary||phase+1<stage.phases.length)
      value=outer(index)?OuterCampaign.mark(index,phase,saved):ReachProgress.checkpoint(index,phase,before,saved.expedition);
    let baseLoot=[],crewLoot=[];
    const first=value!==before;
    if(first||saved.sentries!==oldSentries){
      const earnings=saved.work.earned.slice();
      if(outer(index)&&mode==="complete"){
        const resource=[3,2,1,0,0,1,1,2,2,3,4][OuterCampaign.region(index)];
        baseLoot=BattleResults.grantMaterials(saved.work,[[resource,isBoss(index)?3:1]]);
        crewLoot=BattleResults.grantMaterials(saved.work,CrewTactics.materialsFor(crewMask));
      }
      saved[field]=value;if(!save()){saved.work.earned=earnings;saved[field]=before;saved.sentries=oldSentries;saveFailed=true;message=pair("保存できません。もう一度。","저장할 수 없어요. 다시 눌러 주세요.");render();return;}}
    if(mode==="phase"){phase++;FieldCoaching.afterAdvance("reachStatus",loadPhase);return;}
    const completed=index;mode="leaving";if(inMatch()){line=[];saveLine();}
    if(ordinary)try{localStorage.removeItem(fieldKey(index));}catch{}
    const id=outer(completed)?completed:80+completed;
    const name=outer(completed)?OuterStory.event(completed).name:ReachMap.events[completed].name;
    const skins=first&&!outer(completed)?[...Wardrobe.boards,...Wardrobe.stones].filter(item=>item[7]===completed+1).map(item=>item[3]):[];
    BattleResults.start({id,name,base:baseLoot,crew:crewLoot,skins,first});
    const updateMap=()=>{
      if(outer(completed))OuterMap.win(completed);else ReachMap.win(completed);
    };
    const showResult=()=>{
      const returnToMap=()=>exit(updateMap);
      if(!BattleResults.holdAtField(id,returnToMap))returnToMap();
    };
    if(match&&outer(completed)&&OuterFauna.hasMotion(completed)&&!reduceMotion){
      // The score and rewards are already saved. Back can finish this view
      // immediately without losing the result or issuing a second reward.
      afterBack=()=>{updateMap();BattleResults.present(id);};
      victoryAt=performance.now();sound("win");render();
      victoryTimer=setTimeout(showResult,BattleActions.fallDuration+130);
    }else showResult();
  }
  function exportExtras(){
    remember();
    const records=[];
    for(let id=80;id<320;id++){
      const i=outer(id)?id:id-80;
      if(isBoss(i)||!unlocked(i)||local(i)!==regionCount(i))continue;
      const rec=readRecord(localStorage,fieldKey(i));
      if(rec&&rec.phase>=countPhases(i))records.push(rec);
    }
    return records;
  }
  function restoreExtras(records){
    for(const rec of records){
      const i=rec?.i;
      if(!Number.isInteger(i)||!(i>=0&&i<20||i>=100&&i<320)||rec.campaign!==CampaignSlots.id||!unlocked(i)||
         isBoss(i)||local(i)!==regionCount(i)||!Number.isInteger(rec.phase)||rec.phase<countPhases(i)||rec.phase>=32||
         !Array.isArray(rec.moves)||rec.moves.length>8||!Array.isArray(rec.defenses)||rec.defenses.length>8)continue;
      const id=outer(i)?i:80+i;
      if(rec.pick!==undefined&&rec.pick!==FieldBook.currentPick(id,rec.phase))continue;
      const existing=readRecord(localStorage,fieldKey(i));
      if(!existing||existing.phase<rec.phase||existing.phase===rec.phase&&existing.pick===rec.pick&&
         FieldBook.continuesLine(existing.moves,rec.moves))localStorage.setItem(fieldKey(i),JSON.stringify(rec));
    }
  }
  return {enter,close:exit,pending,resume,returnMain,cleared,unlocked,exportExtras,restoreExtras,
    inspect:()=>({index,phase,mode,mission,state,turns,last,reply,match}),get active(){return !!dialog?.open;}};
})();
