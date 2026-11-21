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
    return phase+1===phases(i)+Number(isBoss(i))?(i+1)*8:i*8+phase+1;
  }
  // Both positions were played from the empty board. Keep every move to retain
  // the superko history. Neither position is ahead for Black when it opens.
  const matches={
    get 6(){return EarlyGuardians.game(86);},
    9:{rank:1,komi:2.5,start:[59,38,48,31,33,20,32,29,39,30,40,50,41,21,51,22,49,23,42,24,58,47,57,56,60,11,34,10,25,12,16,13,15,14,43,19,52,28,61,37,66,46,65,55,64,68,69,1,77,76]},
    19:{rank:2,komi:2.5,start:[48,32,50,30,38,42,39,31,49,41,40,21,29,20,47,22,51,23,56,24,57,33,59,11,58,10,60,12,28,13,19,14,37,15,46,16,52,25,43,34,55,64,65,67]}
  };
  return Object.freeze({base,count,gate,local,isBoss,phases,read,allowed,checkpoint,matches});
})();

const SecondReach=(()=>{
  let dialog,index=-1,phase=0,mode="closed",stage,mission,state,turns,last=null,reply=null,hint=null;
  let match=null,line=[],message="",epoch=0,anim=0,motion="idle",swing=0,afterBack=null,played=[],restoring=false,idleTimer=0;
  let crewMask=0,focusedPoint=-1,defenses=[],guardSpent=false;
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
    kind:()=>mission.kind,species:()=>stage.species,
    mount:hud=>element("reachScene").after(hud),
    health:r=>{const output=element("reachHP");output.hidden=false;
      const ally=pair("味方 ","아군 ")+r.ally,enemy=pair("敵 ","상대 ")+r.hp+"/"+r.max;
      if(output.firstElementChild.textContent!==ally)output.firstElementChild.textContent=ally;
      if(output.lastElementChild.textContent!==enemy)output.lastElementChild.textContent=enemy;},
    strike:()=>{motion="break";swing=performance.now();scene();},persist:()=>remember(),
    openRite:()=>{if(history.state?.reachBattle===index&&!history.state.reachRite)history.pushState({...history.state,reachRite:true},"");},
    closeRite:()=>{if(history.state?.reachRite)history.back();}
  };
  function install(){
    if(dialog)return;
    dialog=document.createElement("dialog");dialog.id="reachBattleDialog";dialog.setAttribute("aria-labelledby","reachEnemy");
    dialog.innerHTML='<div class="reach-fight"><header><button id="reachBattleBack" type="button">‹</button><div><small id="reachDepth"></small><h2 id="reachEnemy"></h2></div><output id="reachHP" hidden><span></span><span></span></output></header><canvas id="reachScene" width="480" height="150" aria-hidden="true"></canvas><p id="reachGoal"></p><div class="reach-goban"><canvas id="reachBoard" width="540" height="540" aria-hidden="true"></canvas><canvas id="reachFx" width="540" height="540" aria-hidden="true"></canvas><div id="reachPoints"></div></div><p id="reachStatus" role="status"></p><nav><button id="reachHint" type="button"></button><button id="reachReset" type="button"></button><button id="reachPass" type="button"></button><button id="reachNext" type="button"></button></nav></div>';
    document.body.append(dialog);
    const points=element("reachPoints");
    for(let p=0;p<81;p++){
      const b=document.createElement("button");b.type="button";b.dataset.point=p;b.onclick=()=>place(p);points.append(b);
    }
    points.addEventListener("keydown",event=>{
      const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!delta||!event.target.matches("button[data-point]"))return;event.preventDefault();
      const origin=Number(event.target.dataset.point);let x=origin%9,y=Math.floor(origin/9);
      for(let i=0;i<8;i++){x+=delta[0];y+=delta[1];if(x<0||x>=9||y<0||y>=9)return;
        const next=points.children[y*9+x];if(!next.disabled){event.target.tabIndex=-1;next.tabIndex=0;focusedPoint=y*9+x;next.focus();return;}}
    });
    points.addEventListener("focusin",e=>{if(e.target.matches("button[data-point]"))focusedPoint=Number(e.target.dataset.point);});
    element("reachNext").onclick=advance;element("reachReset").onclick=retry;element("reachHint").onclick=guide;
    element("reachPass").onclick=()=>place(-1);element("reachBattleBack").onclick=()=>exit();
    dialog.addEventListener("cancel",event=>{event.preventDefault();exit();});
    addEventListener("popstate",()=>{
      if(dialog.open&&element("burstDialog").open&&!history.state?.reachRite)element("burstDialog").close();
      if(dialog.open&&history.state?.reachBattle!==index)leave();
    });
  }
  const resumeKey=CampaignSlots.session("bfq-second-reach.field.v1");
  function session(){
    try{const r=JSON.parse(sessionStorage.getItem(resumeKey));return r&&unlocked(r.i)&&Number.isInteger(r.phase)&&r.phase>=0&&r.phase<=countPhases(r.i)&&Array.isArray(r.moves)&&r.moves.length<=8?r:null;}catch{return null;}
  }
  function remember(){
    if(!dialog?.open||restoring||mode==="leaving")return;
    try{sessionStorage.setItem(resumeKey,JSON.stringify({i:index,phase,moves:played,defenses,guardSpent,crew:crewMask,mode,combat:match?null:TempoCombat.snapshot()}));}catch{}
  }
  function pending(){return session()?.i??null;}
  function resume(){const r=session();return r?enter(r.i,r):false;}
  function enter(id,record=null){
    const i=outer(id)?id:ReachProgress.local(id);
    if(!unlocked(i)||typeof ReachPuzzles==="undefined")return false;
    if(outer(i)&&OuterCampaign.local(i)===9&&typeof OuterCrossings!=="undefined"&&CrossingLog.required(OuterCampaign.region(i),saved))return false;
    install();if(dialog.open)return false;
    crewMask=record&&Number.isInteger(record.crew)&&record.crew>=0&&record.crew<=0x7fffffff?record.crew:0;
    guardSpent=!!record?.guardSpent;
    index=i;phase=local(i)===regionCount(i)?(outer(i)?OuterCampaign.value(saved,OuterCampaign.region(i)):ReachProgress.read(saved.reach,saved.expedition))%8:0;
    stage=outer(i)?OuterPuzzles.stage(i):ReachPuzzles.stage(i);mode="ready";afterBack=null;dialog.showModal();
    if(!record||history.state?.reachBattle!==i)history.pushState({...history.state,reachBattle:i},"");
    if(record && (local(i)<regionCount(i)||record.phase===phase))phase=record.phase;
    restoring=!!record;loadPhase();
    if(record?.defenses?.length<=8&&Array.isArray(record.defenses))defenses=record.defenses.map(n=>Number.isInteger(n)&&n>=-1&&n<81?n:null);
    if(record&&!match){
      for(const [i,p] of record.moves.entries()){
        if(mode!=="playing"||!Number.isInteger(p)||p<0||p>=81)break;
        const unresolved=record.mode==="reply"&&i===record.moves.length-1;
        place(p,true,unresolved);
      }
    }
    if(record&&!match&&TempoCombat.restore(record.combat)){if(record.mode==="reply"&&mode==="retry")TempoCombat.hit();scene();}
    restoring=false;remember();element("reachBattleBack").focus({preventScroll:true});return true;
  }
  function leave(){
    epoch++;cancelAnimationFrame(anim);clearTimeout(idleTimer);try{sessionStorage.removeItem(resumeKey);}catch{}
    TempoCombat.leave();if(dialog?.open)dialog.close();mode="closed";match=null;index=-1;
    const next=afterBack;afterBack=null;if(next)next();
  }
  function exit(next){
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
  function loadPhase(restart=false){
    epoch++;cancelAnimationFrame(anim);clearTimeout(idleTimer);played=[];defenses=[];reply=last=hint=null;message="";swing=0;motion="idle";
    if(phase<stage.phases.length){
      match=null;mission=stage.phases[phase];turns=mission.turns;
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
    render();if(mode==="white")think();
  }
  function finishMatch(){
    const result=MatchRules.score(match,bossGame().komi);
    message=pair("黒 ","흑 ")+result.black+pair(" · 白 "," · 백 ")+result.white+pair(" · コミ "," · 덤 ")+bossGame().komi+"　"+(result.margin>0?pair("黒勝ち","흑 승리"):pair("白勝ち","백 승리"))+" +"+Math.abs(result.margin);
    return result.margin>0?"complete":"matchLost";
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
    const ca=element("reachScene"),c=ca.getContext("2d"),age=swing?(now-swing)/650:2,f=Math.max(0,Math.min(1,age));
    c.imageSmoothingEnabled=false;
    const bg=outer(index)?OuterMapArt.battle(index,regionCount(index)):typeof ReachMap!=="undefined"&&ReachMap.battle?ReachMap.battle(index,cleared()):MapArt.battle(0,index);
    c.drawImage(bg,0,0,ca.width,ca.height);
    const heroX=204,base=137,h=64,attack=motion==="hit"||motion==="break";
    const beat=reduceMotion?0:Math.sin(f*Math.PI);
    Crew.draw(c,6,heroX-40,base,h,0,0,3);
    WorldScale.hero(c,heroX+(attack?10:-4)*beat,base,h,age<1?attack?2:3:0);
    const pose=age<1?motion:"idle",spriteBeat=age<1?f:reduceMotion?0:now%1200/1200,enemyX=369+(attack?10:-18)*beat;
    const fauna=outer(index)?OuterFauna:typeof ReachFauna==="undefined"?null:ReachFauna;
    if(!fauna||!fauna.draw(c,index,enemyX,base,94,pose,spriteBeat)){
      const foe=isBoss(index)?ExpeditionCast.guardian:ExpeditionCast.foe;
      foe(c,isBoss(index)?index===9?0:1:stage.species,enemyX,base,94,0,1,age<1?attack?3:2:0);
    }
    if(!match)TempoCombat.render(c,ca.width,ca.height,now,heroX,enemyX);
    checkHintDelay();
    // A waiting reply advances only through the visible turn clock, also with reduced motion.
    cancelAnimationFrame(anim);clearTimeout(idleTimer);
    if(!reduceMotion&&age<1)anim=requestAnimationFrame(scene);
    else if(!match||!reduceMotion)idleTimer=setTimeout(()=>scene(),match?260:80);
  }
  function act(p,removed,side){
    motion=side===2?"strike":removed.length?"break":"hit";swing=performance.now();cancelAnimationFrame(anim);scene();
    if(p>=0)BoardFX.playOn(element("reachFx"),9,p,removed,side,saved.fx);
  }
  function render(){
    const event=outer(index)?OuterStory.event(index):typeof ReachMap!=="undefined"?ReachMap.events?.[index]:null;
    const foeName=outer(index)?OuterFauna.name(index):typeof ReachFauna==="undefined"?null:ReachFauna.name(index);
    element("reachEnemy").textContent=foeName?localizedPair(foeName):event?localizedPair(event.name):pair("水路の遠征","수로 원정");
    const regionLabel=outer(index)?localizedPair(OuterMap.names(OuterCampaign.region(index))):pair("初級 II","초급 II");
    element("reachDepth").textContent=regionLabel+(event&&foeName?" · "+localizedPair(event.name):"")+" · "+(local(index)+1)+"/20 · "+(inMatch()?pair("九路決戦","9줄 결전"):(phase+1)+"/"+stage.phases.length);
    const goal=mission?({liberty:"goalLiberty",link:"goalLink",escape:"goalEscape",capture:"goalCapture",atari:"goalAtari",read:"goalRead"})[mission.kind]:null;
    element("reachGoal").textContent=mission?.kind==="signal"?pair("両岸の黒に二眼ずつ。合図の空点を残そう。","양쪽 흑 무리에 두 눈씩 만들고 신호점은 비워 두세요."):mission?.tactic&&mission.lesson?localizedPair(mission.lesson):goal?t(goal,mission.turns):index===6?(match?.passes===2?pair("双方がパス。石と囲んだ空点を数えた。","양쪽이 패스했어요. 돌과 둘러싼 빈 점을 더해 계가했어요."):localizedPair(EarlyGuardians.game(86).goal)):pair("黒番。終局の面積で白を上回ろう。","흑으로 두어 계가 때 백보다 많은 면적을 확보하세요.");
    element("reachBattleBack").setAttribute("aria-label",pair("地図へ戻る","원정 지도로"));
    element("reachStatus").textContent=message||(mode==="white"?pair("白が応手を読む…","백이 응수를 읽고 있어요…"):inMatch()?pair("二度のパスで終局。コミ ","두 번 연속 패스하면 계가합니다. 덤 ")+bossGame().komi:pair("黒番。","흑 차례."));
    if(outer(index)&&!inMatch()&&mode==="playing"&&mission?.kind==="read"&&!mission.guardian&&turns>1&&!message){
      const cue=OuterDefenseStyle.cue(index);if(cue)element("reachStatus").textContent=localizedPair(cue);
    }
    const show=(id,label,yes)=>{const b=element(id);b.textContent=label;b.hidden=!yes;};
    show("reachHint",mode==="playing"?hintLabel():t("hint"),mode==="playing");show("reachReset",mode==="matchLost"?t("retry"):pair("打ち直す","다시 두기"),["retry","matchLost"].includes(mode));
    show("reachPass",pair("パス","패스"),mode==="match");
    show("reachNext",mode==="complete"?pair("地図へ","지도로"):phase+1===stage.phases.length&&isBoss(index)?pair("決戦へ","결전으로"):pair("次へ","다음"),["phase","complete"].includes(mode));
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
      message=localizedPair(advice[mission.kind]);render();return;
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
    if(mode==="match"){
      const next=MatchRules.move(match,p);if(!next)return;
      const captured=[];for(let i=0;i<81;i++)if(match.board[i]===2&&!next.board[i])captured.push(i);
      match=next;line.push(p);saveLine();last=p;message="";mode=match.passes===2?finishMatch():"white";
      act(p,captured,black);render();if(mode==="white")think();return;
    }
    if(mode!=="playing"||p<0)return;
    const next=play(state,p,black);if(!next){message=pair("そこには打てない。","그 교차점에는 둘 수 없어요.");render();return;}
    const before=state,previousWhite=reply,priorTurns=turns;
    const verdict=mission.guardian?guardianMove(state,mission,turns,p):null;
    const accepted=verdict?verdict.win:goodMove(state,mission,turns,p);
    state=next;last=p;hint=null;reply=null;played.push(p);if(!replaying)act(p,next.captured,black);
    const done=accepted&&(verdict?verdict.done:solved(state.board,mission));
    const event={before:before.board,after:next.board,point:p,mission,remaining:turns,previousWhite,ids:Crew.deployed(),accepted,done};
    const oldCrew=crewMask;
    if(outer(index)&&!replaying)crewMask=CrewTactics.record(event.ids,crewMask,event,saved.roster);
    if(!replaying)TempoCombat.attack(accepted,done);
    if(done){
      mode=phase+1===stage.phases.length&&!isBoss(index)?"complete":"phase";
      message=pair("道が開いた。","길이 열렸어요.");render();return;
    }
    const candidates=outer(index)&&accepted&&!verdict&&["read","capture"].includes(mission.kind)?replies(state,mission,turns-1,p):null;
    let counter=verdict?verdict.reply:(!accepted&&TempoDefense.counter(before,state,mission))||punish(state,p,candidates);
    if(candidates&&!replaying){
      counter=OuterDefenseStyle.respond(index,mission,candidates,counter,state,p);
      if(crewMask!==oldCrew)counter=CrewTactics.redirect(crewMask&~oldCrew,candidates,counter,event);
    }
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
        if(guard){guardSpent=true;played.pop();defenses.pop();state=before;turns=priorTurns;last=reply=previousWhite;mode="playing";
          TempoCombat.newTurn(turns);TempoCombat.block();message=localizedPair(CrewTactics.members[guard.member].name)+pair("が割って入った。この形をもう一度読もう。"," · 반격을 막았어요. 같은 국면에서 다시 둘 수 있어요.");render();return;}
      }
      if(!accepted&&!replaying)TempoCombat.hit();else if(accepted)TempoCombat.newTurn(turns);
      mode=accepted?"playing":"retry";
      message=accepted?pair("次の黒を読もう。","다음 흑 수를 읽어 보세요."):reply===-1?pair("白は手を抜ける。もう一度読もう。","백이 손을 빼도 됩니다. 다시 읽어 보세요."):pair("白に応じられた。印の石を見直そう。","백이 응수했어요. 표시한 무리를 다시 보세요.");
      render();
    };if(replaying)answer();else TempoCombat.prepareReply(reduceMotion?100:330,answer);
  }
  async function think(){
    const token=epoch,game=bossGame();
    const p=await MatchRules.chooseLocally(match,game.rank,game.komi,()=>epoch===token&&dialog.open);
    if(p===null||token!==epoch||!dialog.open)return;
    const next=MatchRules.move(match,p);if(!next)return;
    const removed=[];for(let i=0;i<81;i++)if(match.board[i]===1&&!next.board[i])removed.push(i);
    match=next;line.push(p);saveLine();last=reply=p;mode=match.passes===2?finishMatch():"match";
    if(mode==="match")message=p<0?pair("白はパス。黒番。","백이 패스했어요. 흑 차례."):pair("白の応手。黒番。","백이 응수했어요. 흑 차례.");
    act(p,removed,white);render();
  }
  function advance(){
    if(mode!=="phase"&&mode!=="complete")return;
    const field=outer(index)?"outer":"reach",before=saved[field],oldSentries=saved.sentries;
    if(index===6&&inMatch()&&mode==="complete")saved.sentries|=EarlyGuardians.bit(86);
    const value=outer(index)?OuterCampaign.mark(index,phase,saved):ReachProgress.checkpoint(index,phase,before,saved.expedition);
    let haul=[];
    if(value!==before||saved.sentries!==oldSentries){
      const earnings=saved.work.earned.slice();
      if(outer(index)&&mode==="complete"){
        const resource=[3,2,1,0,0,1,1,2,2,3,4][OuterCampaign.region(index)];
        const totals=[0,0,0,0,0];totals[resource]=isBoss(index)?3:1;
        for(const [material,n] of CrewTactics.materialsFor(crewMask))totals[material]+=n;
        haul=totals.flatMap((n,k)=>n?[[k,n]]:[]);
        for(const [material,n] of haul)Workshop.earn(saved.work,material,n);
      }
      saved[field]=value;if(!save()){saved.work.earned=earnings;saved[field]=before;saved.sentries=oldSentries;message=pair("保存できません。もう一度。","저장할 수 없어요. 다시 눌러 주세요.");render();return;}}
    if(mode==="phase"){phase++;loadPhase();return;}
    const completed=index;mode="leaving";if(inMatch()){line=[];saveLine();}
    exit(()=>outer(completed)?OuterMap.win(completed,haul):ReachMap.win(completed));
  }
  return {enter,close:exit,pending,resume,returnMain,cleared,unlocked,
    inspect:()=>({index,phase,mode,mission,state,turns,last,reply,match}),get active(){return !!dialog?.open;}};
})();
