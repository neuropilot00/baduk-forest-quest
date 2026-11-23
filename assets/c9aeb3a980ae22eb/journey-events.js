"use strict";
const RoadTalk=(()=>{
  const dialog=el("roadDialog"),canvas=el("roadIllustration");
  let from=0,dest=0,beat=0,pages=[],pending=false,retry=null,epoch=0;
  const local=(ja,ko)=>localizedPair([ja,ko]);
  function draw(){
    if(dialog.open&&dialog.dataset.beat!==undefined)StoryPanels.draw(canvas,from,beat);
  }
  function render(){
    window.StoryPanels?.warm(from,beat);
    MapJourney.write("talk",{from,dest,beat});
    const page=pages[beat],id=pages[beat].arrival||beat===pages.length-3?dest:from,rank=Expedition.rankOf(id);
    el("roadChapter").textContent=t("chapterLabel",rank+1)+" · "+localizedPair(Atlas.chapters[rank].name);
    el("roadPlace").textContent=localizedPair(Voyage.places[id]);el("roadWho").textContent=localizedPair(Voyage.cast[page.speaker].name);
    el("roadLine").textContent=localizedPair(page.line);
    StoryFrame.portrait(dialog.querySelector(".road-words"),page.speaker,el("roadLine").textContent,from+"/"+beat);
    canvas.dataset.storyArt="road-"+id;
    el("roadSkip").textContent=local("会話をスキップ","대화 건너뛰기");
    el("roadLine").scrollTop=0;
    el("roadNext").textContent=beat===pages.length-1?local("戦闘開始","전투 시작"):local("つづき　›","계속　›");
    dialog.dataset.pose=page.pose;dialog.dataset.beat=beat;dialog.dataset.pages=pages.length;
    draw();
  }
  async function show(next,again=false){
    const ticket=++epoch;pending=true;retry=null;
    const control=el("roadNext");control.disabled=true;dialog.setAttribute("aria-busy","true");
    const ready=await (again?EventPlates.retry:EventPlates.ready)("road",from,dest,next);
    if(ticket!==epoch||!dialog.open)return;
    pending=false;control.disabled=false;dialog.setAttribute("aria-busy","false");
    if(!ready){retry=next;control.textContent=local("画像を再読み込み","그림 다시 불러오기");return;}
    beat=next;render();
  }
  function close(){epoch++;pending=false;retry=null;MapJourney.write("talk",null);if(dialog.open)dialog.close();}
  new ResizeObserver(draw).observe(canvas);
  StoryPanels.warm(mapLocation());
  function next(allowBattle){
    if(pending)return;
    if(retry!==null){show(retry,true);return;}
    if(beat<pages.length-1)show(beat+1);
    else if(allowBattle)SiteVisit.afterStory(dest,close,true);
  }
  MapJourney.input(dialog,()=>next(false));
  dialog.addEventListener("close",()=>{if(!dialog.open)MapJourney.write("talk",null);});
  addEventListener("pagehide",()=>{if(!dialog.open)MapJourney.write("talk",null);});
  el("roadSkip").onclick=()=>SiteVisit.afterStory(dest,close);el("roadNext").onclick=()=>next(true);
  document.addEventListener("DOMContentLoaded",()=>{
    const memo=MapJourney.read("talk");
    if(!FrontDoor.active&&memo&&Number.isInteger(memo.from)&&memo.from>=0&&memo.from<79&&memo.dest===memo.from+1&&memo.dest===mapLocation())RoadTalk.open(memo.from,memo.dest,memo.beat);
  },{once:true});
  return {open(a,b,resumeBeat=0){
    from=a;dest=b;beat=0;
    pages=from<19?RoadForest.lines(from):RoadChapters.lines(from);
    if(!pages.length){
      const origin=Voyage.scene(from),arrival=Voyage.scene(dest);
      pages=[{speaker:origin.speaker,pose:"inspect",line:origin.after},{speaker:arrival.speaker,pose:"walk",line:arrival.before}];
    }
    pages=pages.concat(SiteVisit.lines(dest).map((line,i)=>({speaker:i?0:1,pose:i?"inspect":"offer",line,arrival:true})));
    delete dialog.dataset.beat;
    el("roadPlace").textContent=localizedPair(Voyage.places[dest]);
    el("roadChapter").textContent=t("chapterLabel",Expedition.rankOf(dest)+1);
    el("roadWho").textContent=el("roadLine").textContent="";
    const head=dialog.querySelector(".story-head");if(head)head.hidden=true;
    EventPlates.clear(canvas);
    if(!dialog.open)dialog.showModal();
    show(Math.min(pages.length-1,Math.max(0,resumeBeat|0)));
  },close};
})();
const BossMatch=(()=>{
  const panel=el("matchDialog"),native=!!document.querySelector('meta[name="local-go-engine"]');
  const local=(ja,ko)=>localizedPair([ja,ko]);
  let rank,early=null,entryDepth=0,practice,position,line=[],pending=false,token=0,abort=null,useNative=false,finished=false,result=null,zoom=false,notice="",picked=null,focusedPoint=-1;
  const reading=DuelReading.mount(el("matchScene"),el("matchPoints"));
  const compactBoard=matchMedia("(max-width:480px) and (orientation:portrait)");
  const requiresConfirmation=()=>position?.n===19&&compactBoard.matches;
  el("matchPlacement").before(el("matchStatus"));
  panel.querySelector(".buttons").after(el("matchHint"));
  const profile=()=>early===null?null:EarlyGuardians.game(early);
  const entryGame=()=>profile()||MatchRules.entry(MatchPositions[rank],entryDepth);
  const komi=()=>profile()?.komi??MatchRules.komi[rank];
  const stageId=()=>early??rank*10+9;
  const key=()=>early!==null?storageKey+".early-match."+early:storageKey+".match."+rank+(practice?".practice."+entryDepth:".route");
  const persistent=()=>{try{localStorage.setItem(key(),JSON.stringify(line));}catch{}};
  function cancelReply(){token++;abort?.abort();abort=null;pending=false;}
  function stop(){cancelAnimationFrame(sceneFrame);clearTimeout(sceneIdle);strike=0;duelCapture=null;cancelReply();}
  function load(restart){
    const entry=entryGame();line=[];
    if(!restart)try{const raw=JSON.parse(localStorage.getItem(key()));if(Array.isArray(raw)&&raw.length<=1250&&raw.every(Number.isInteger))line=raw;}catch{}
    try{position=MatchRules.replay(entry.size,[...entry.start,...line]);}catch{line=[];position=MatchRules.replay(entry.size,entry.start);}
    finished=position.passes===2;result=finished?MatchRules.score(position,komi()):null;notice="";picked=null;
  }
  const name=()=>early===null?localizedPair(Voyage.guardians[rank]):localizedPair(Expedition.names[Math.floor(early/20)][early%20])+local("・斥候長"," · 정예대장");
  function paint(){
    const canvas=el("matchBoard"),fx=el("matchFx");
    const w=Math.min(1620,Math.max(720,Math.round(canvas.getBoundingClientRect().width*Math.min(3,window.devicePixelRatio||1))));
    if(canvas.width!==w){canvas.width=canvas.height=w;fx.width=fx.height=w;}
    const c=canvas.getContext("2d"),n=position.n,u=w/(n+1),g=position.board,density=w/720;
    Wardrobe.surface(c,w,w,saved.gear[0]);c.strokeStyle=Wardrobe.boards[saved.gear[0]][5][2];c.lineWidth=1.6*density;
    c.font="bold "+Math.round(u*.30)+"px system-ui";c.textAlign="center";c.textBaseline="middle";
    for(let j=0;j<n;j++){
      const a=(j+1)*u;c.beginPath();c.moveTo(u,a);c.lineTo(n*u,a);c.moveTo(a,u);c.lineTo(a,n*u);c.stroke();
      if(saved.coords){c.fillStyle="#433a2a";c.fillText("ABCDEFGHJKLMNOPQRST"[j],a,u*.38);c.fillText(n-j,u*.36,a);}
    }
    const stars=n===9?[2,6]:n===13?[3,9]:[3,9,15];c.fillStyle="#52412d";
    for(const x of stars)for(const y of stars){c.beginPath();c.arc((x+1)*u,(y+1)*u,u*.09,0,Math.PI*2);c.fill();}
    for(let p=0;p<g.length;p++){
      const x=(p%n+1)*u,y=(Math.floor(p/n)+1)*u;
      if(g[p])Wardrobe.stone(c,x,y,u*.45,g[p]===2,saved.gear[1]);
      else if(result?.area[p]){c.fillStyle=result.area[p]===1?"#252e29":"#faf6e5";c.fillRect(x-u*.12,y-u*.12,u*.24,u*.24);}
      if(p===picked){
        c.save();c.globalAlpha=.54;Wardrobe.stone(c,x,y,u*.43,false,saved.gear[1]);c.restore();
        c.strokeStyle="#116761";c.lineWidth=3*density;c.setLineDash([5*density,3*density]);
        c.beginPath();c.arc(x,y,u*.51,0,Math.PI*2);c.stroke();c.setLineDash([]);
      }
      if(p===position.last){
        c.strokeStyle=g[p]===2?"#894c3d":"#f7c374";c.lineWidth=2*density;
        c.beginPath();c.arc(x,y,u*.18,0,Math.PI*2);c.stroke();
      }
    }
  }
  let strike=0,striker=0,captures=0,duelCapture=null,sceneFrame=0,sceneIdle=0;
  function scenePaint(time){
    const scene=el("matchScene"),ink=scene.getContext("2d"),age=reduceMotion||!strike?2:(time-strike)/1000;
    const active=age>=0&&age<.64,push=active?Math.sin(Math.PI*Math.min(1,age/.38)):0;
    const hit=active?Math.sin(Math.PI*Math.max(0,Math.min(1,(age-.2)/.4))):0;
    const id=stageId(),frame=MapArt.battle(Math.floor(id/20),id%20,true);
    if(frame.dataset?.arena!==String(id)&&ArenaArt.describe(id)?.source&&scene.dataset.waiting!==String(id)){
      scene.dataset.waiting=String(id);
      ArenaArt.ready(id).then(()=>{if(panel.open&&id===stageId())scenePaint(performance.now());},()=>{});
    }
    const height=drawFieldScenery(scene,ink,frame,320,104);
    const ground=height*.90;
    const count=Crew.travelers().length,heroPx=Math.min(61,320/(count+4.8));
    const species=early===null?null:Expedition.species(early);
    const painted=species===null?FaunaMotion.hasGuardianFrames(rank):FaunaMotion.hasFieldFrames(species);
    const receipt=!finished&&duelCapture&&time-strike<BattleActions.duration?duelCapture:null;
    if(receipt&&!receipt.heard)BattleActions.contactSound(receipt,time,reduceMotion,!document.hidden);
    const hero=painted?BattleActions.hero(receipt,time,heroPx,false):null;
    const boss=painted?BattleActions.foe(receipt,time):null;
    const hx=74+count*16+(hero?.x??(striker===1?18*push:-6*hit));
    const ex=242+(painted?(boss?.shift??0)*78:(striker===2?-20*push:7*hit));
    Crew.draw(ink,4,74+count*16-heroPx*.53,ground,heroPx,reduceMotion?0:Math.floor(time/165)%4,0,2,receipt,time);
    WorldScale.hero(ink,hx,ground,heroPx,hero?.pose??(finished?0:CastMotion.phase(1,time)),hero?.cel);
    const bossPose=finished?0:CastMotion.phase(2,time);
    if(early===null)ExpeditionCast.guardian(ink,rank,ex,ground,78,painted?0:(striker===2?-.11:.14)*push,1,bossPose,painted,boss??undefined);
    else ExpeditionCast.foe(ink,species,ex,ground,72,painted?0:(striker===2?-.11:.14)*push,1,bossPose,painted,boss??undefined);
    if(active){
      const f=Math.min(1,age/.39),a=striker===1?hx+16:ex-16,b=striker===1?ex-13:hx+11;
      const x=a+(b-a)*f,y=ground-29-Math.sin(f*Math.PI)*14;
      ink.strokeStyle=striker===1?"#f9ce74":"#a6e2dd";ink.lineWidth=captures?4:2;ink.beginPath();ink.moveTo(x-(b-a)*.13,y+2);ink.lineTo(x,y);ink.stroke();
      for(let i=0;hit>0&&i<(captures?14:6);i++){const angle=i*2.4,r=hit*(captures?30:14);ink.fillStyle=i%2?"#fff5cb":"#e8ac55";ink.fillRect(b+Math.cos(angle)*r,ground-29+Math.sin(angle)*r,2+i%2,2);}
    }
  }
  function animateMove(side,taken){
    strike=performance.now();striker=side;captures=taken;CastMotion.strike(side,strike);
    duelCapture=BattleActions.duelCapture(side,strike);
  }
  function sceneTick(time){
    if(!panel.open||document.hidden)return;
    scenePaint(time);
    if(reduceMotion)return;
    if(strike&&time-strike<BattleActions.duration)sceneFrame=requestAnimationFrame(sceneTick);
    else sceneIdle=setTimeout(()=>sceneTick(performance.now()),165);
  }
  function resumeScene(){cancelAnimationFrame(sceneFrame);clearTimeout(sceneIdle);sceneTick(performance.now());}
  document.addEventListener("visibilitychange",resumeScene);
  function render(){
    const entry=entryGame(),n=entry.size,confirming=requiresConfirmation();
    el("matchName").textContent=name();el("matchProfile").textContent=n+local("路","줄")+" · "+local("第","제")+(entry.start.length+line.length+(finished?0:1))+local("手","수")+" · "+(useNative?"KataGo "+MatchRules.budget(rank,entryDepth)+local("探索","탐색"):local("端末AI ","기기 AI ")+(Math.min(7,rank+entryDepth)+1)+"/8");
    const margin=result?.margin;
    const point=MatchRules.coordinate(n,position.last);
    let turn;
    if(finished)turn=local("双方がパス。四角は今の盤で数えた空点。","양쪽이 연달아 패스했어요. 네모는 현재 판에서 센 빈 점이에요.");
    else if(notice)turn=notice;
    else if(position.side===2){
      const black=position.last<0?local("黒パス","흑 패스"):local("黒 ","흑 ")+point;
      turn=black+" · "+(useNative?local("KataGo が白の手を読んでいます…","KataGo가 백의 수를 읽고 있어요…"):local("白が考えています…","백이 응수를 읽고 있어요…"));
    }else if(line.length&&position.last<0){
      turn=local("白はパスして終局を提案。黒番。打つか、パスして仮に数えます。","백이 패스했어요. 흑 차례예요. 계속 두거나 패스해서 잠정 계가를 보세요.");
    }else if(line.length){
      turn=local("白 ","백 ")+point+local(" に着手。黒番です。"," 착수 · 흑 차례예요.");
    }else turn=confirming?local("黒番。空点を選んでから着手を確定。","흑 차례. 빈 점을 고른 다음 착수를 확정하세요."):local("黒番。空点をタップして打とう。","흑 차례. 빈 교차점을 누르면 둡니다.");
    el("matchStatus").textContent=turn;
    const passedOpening=finished&&line.length===2&&line.every(p=>p===-1);
    el("matchHint").hidden=finished&&!(passedOpening&&margin<0);
    el("matchHint").textContent=passedOpening&&margin<0?local("初手で双方がパスしました。局面を変えるなら、ここから続けましょう。","첫 수부터 양쪽이 패스했어요. 판을 바꾸려면 여기서 계속 두세요."):localizedPair(profile()?.goal||Voyage.matchGoals[rank]);
    reading.show(position,result,komi(),early!==null||rank%2===0);
    el("matchPass").textContent=DuelReading.passLabel(position);el("matchPass").hidden=finished;el("matchPass").disabled=pending||position.side!==1||picked!==null;
    el("matchPlacement").hidden=!confirming||finished;
    el("matchPick").textContent=picked===null?local("空点を選ぶ","빈 점 선택"):MatchRules.coordinate(n,picked);
    el("matchPlace").textContent=local("着手を確定","착수 확정");
    el("matchCancelPlacement").textContent=local("取消","취소");
    el("matchPlace").disabled=el("matchCancelPlacement").disabled=picked===null||pending||position.side!==1;
    el("matchContinue").textContent=local("対局を続ける","대국 계속 두기");
    el("matchContinue").hidden=!finished||!MatchRules.resumeLine(position,line);
    el("matchAgain").hidden=!finished||margin>0;el("matchAgain").textContent=local("この局面から再戦","이 국면부터 재대결");
    el("matchDone").hidden=!finished||margin<=0;el("matchDone").disabled=false;
    el("matchDone").textContent=local("この数え方で勝利を記録","이 점수로 승리 기록");
    el("matchRepeat").hidden=finished||position.side!==2||pending&&!useNative;
    el("matchRepeat").textContent=pending?local("端末AIですぐに応手","기기 AI로 지금 응수"):t("retryAI");
    el("matchZoom").hidden=n===9;el("matchZoom").setAttribute("aria-pressed",String(zoom));el("matchPaper").classList.toggle("zoom",zoom);
    el("matchBack").textContent=practice?local("戻る","돌아가기"):t("storyMap");
    resumeScene();
    paint();
    el("matchPoints").setAttribute("aria-busy",String(pending));
    const anchor=position.board[focusedPoint]===0?focusedPoint:position.board.indexOf(0);
    for(const b of el("matchPoints").children){
      const p=Number(b.dataset.p),v=position.board[p];b.setAttribute("aria-label",MatchRules.coordinate(n,p)+" "+(v===1?local("黒","흑"):v===2?local("白","백"):local("空点","빈 점")));
      b.disabled=finished||pending||position.side!==1||!!v;
      b.tabIndex=!b.disabled&&p===anchor?0:-1;
      if(confirming)b.setAttribute("aria-pressed",String(p===picked));else b.removeAttribute("aria-pressed");
    }
  }
  function commit(p){
    const next=MatchRules.move(position,p);if(!next)return false;
    if(p>=0){
      const taken=[];for(let q=0;q<next.board.length;q++)if(position.board[q]&&!next.board[q])taken.push(q);
      BoardFX.playOn(el("matchFx"),position.n,p,taken,position.side,saved.fx,true);
    }
    if(position.side===1)reading.afterBlack(next.taken);
    line.push(p);position=next;picked=null;notice="";persistent();sound(p<0?"reply":"tap");
    finished=position.passes===2;result=finished?MatchRules.score(position,komi()):null;
    if(p>=0&&next.taken)animateMove(3-next.side,next.taken);
    render();
    if(finished)panel.querySelector(".duel-reading strong").focus({preventScroll:true});
    return true;
  }
  new ResizeObserver(()=>{if(panel.open&&position)scenePaint(performance.now());}).observe(el("matchScene"));
  new ResizeObserver(()=>{if(panel.open&&position)paint();}).observe(el("matchBoard"));
  let workerEnabled=true;
  function askWorker(state,strength,extra,signal){
    // file:// and offline WebKit can block blob workers. Keep the URL alive until
    // the worker has replied, and release everything even on Back or timeout.
    const src=makeMatchRules.toString()+"\nonmessage=e=>{const x=e.data;postMessage(makeMatchRules().choose(x.state,x.rank,x.komi));};";
    const url=URL.createObjectURL(new Blob([src],{type:"text/javascript"}));
    let worker,timer,onAbort;
    return new Promise((resolve,reject)=>{
      onAbort=()=>reject(Error("Match closed"));
      signal.addEventListener("abort",onAbort,{once:true});
      timer=setTimeout(()=>reject(Error("Worker timed out")),3500);
      worker=new Worker(url);
      worker.onmessage=e=>resolve(e.data);
      worker.onerror=e=>{e.preventDefault();reject(Error("Worker unavailable"));};
      worker.onmessageerror=()=>reject(Error("Invalid worker message"));
      worker.postMessage({state,rank:strength,komi:extra});
    }).finally(()=>{
      signal.removeEventListener("abort",onAbort);clearTimeout(timer);worker?.terminate();URL.revokeObjectURL(url);
    });
  }
  async function localReply(state,signal){
    const strength=Math.min(7,rank+entryDepth),extra=komi();
    if(workerEnabled){
      try{
        const point=await askWorker(state,strength,extra,signal);
        if(!MatchRules.move(state,point))throw Error("Illegal worker move");
        return point;
      }catch(error){if(signal.aborted)throw error;workerEnabled=false;}
    }
    return MatchRules.chooseLocally(state,strength,extra,()=>!signal.aborted);
  }
  async function nativeReply(signal){
    const request=new AbortController(),cancel=()=>request.abort();
    signal.addEventListener("abort",cancel,{once:true});
    // The local engine allows 90 seconds for a full 1600-visit 19x19 turn.
    // The player may switch immediately while a long query is running.
    const deadline=setTimeout(cancel,92000);
    try{
      const response=await fetch("/api/move",{method:"POST",signal:request.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({rank,entryDepth,moves:line})});
      if(!response.ok)throw Error("Engine unavailable");
      return (await response.json()).point;
    }finally{clearTimeout(deadline);signal.removeEventListener("abort",cancel);}
  }
  async function whiteMove(){
    if(pending||finished||!panel.open||position.side!==2)return;
    const stamp=++token,state=position,controller=new AbortController(),signal=controller.signal;
    abort=controller;pending=true;notice="";render();
    try{
      let p;
      if(useNative){
        try{
          p=await nativeReply(signal);
          if(!MatchRules.move(state,p))throw Error("Illegal engine move");
        }catch(error){
          if(signal.aborted)throw error;
          useNative=false;render();
        }
      }
      if(signal.aborted)return;
      if(!useNative)p=await localReply(state,signal);
      const lead=CastMotion.remainingBlackLead;if(lead)await new Promise(done=>setTimeout(done,lead));
      if(token!==stamp||!panel.open||position!==state)return;
      pending=false;if(!commit(p))throw Error("Illegal reply");
    }catch{
      if(token===stamp&&panel.open){
        pending=false;notice=local("白番のままです。応手をもう一度試せます。","아직 백 차례예요. 응수를 다시 요청할 수 있어요.");render();
      }
    }finally{if(token===stamp)abort=null;}
  }
  function blackMove(p){
    if(finished||pending||position.side!==1)return;
    if(!commit(p)){notice=local("そこには打てません。","그곳에는 둘 수 없어요.");render();return;}
    if(!finished)whiteMove();
  }
  function selectPoint(p){
    if(!requiresConfirmation()){blackMove(p);return;}
    if(finished||pending||position.side!==1)return;
    if(!MatchRules.move(position,p)){
      picked=null;notice=local("そこには打てません。","그곳에는 둘 수 없어요.");render();return;
    }
    picked=p;notice="";render();
  }
  function cancelPlacement(){
    picked=null;notice="";render();
  }
  function continueMatch(){
    if(!finished)return;
    const continuation=MatchRules.resumeLine(position,line);
    if(!continuation)return;
    const entry=entryGame();
    position=MatchRules.replay(entry.size,[...entry.start,...continuation]);
    line=continuation;finished=false;result=null;persistent();reading.reset();
    notice=local("同じ盤から黒番を再開。残った石を確かめよう。","같은 판에서 흑 차례로 이어 둡니다. 남은 돌을 확인하세요.");
    render();el("matchStatus").focus({preventScroll:true});
  }
  function open(id,practiceOnly,restart=false,earlyStage=null,fromDepth=Number(el("matchEntry").value)){
    stop();reading.reset();CastMotion.reset();early=!practiceOnly&&Number.isInteger(earlyStage)&&earlyStage<80&&EarlyGuardians.is(earlyStage)?earlyStage:null;rank=early===null?id:EarlyGuardians.game(early).rank;practice=practiceOnly;useNative=native&&early===null;
    entryDepth=practice&&[0,1,2].includes(fromDepth)?fromDepth:0;focusedPoint=-1;zoom=false;BoardFX.clear(el("matchFx"));load(restart);
    const n=position.n,points=el("matchPoints");panel.dataset.boardSize=String(n);points.style.gridTemplateColumns="repeat("+n+",1fr)";
    points.style.gridTemplateRows="repeat("+n+",1fr)";points.style.inset=(50/(n+1))+"%";
    points.replaceChildren(...Array.from({length:n*n},(_,p)=>{
      const b=document.createElement("button");b.type="button";b.dataset.p=p;
      b.onclick=()=>selectPoint(p);return b;
    }));
    if(!panel.open)panel.showModal();panel.scrollTop=0;render();if(position.side===2&&!finished)whiteMove();
    if(early===null){
      const redraw=ready=>{
        if(ready&&panel.open&&early===null&&rank===id)scenePaint(performance.now());
      };
      FaunaMotion.guardianReady(id)?.then(redraw);
      if(id===7)FaunaMotion.dragonReady.then(redraw);
    }else FaunaMotion.fieldReady(Expedition.species(early))?.then(ready=>{
      if(ready&&panel.open&&early===earlyStage)scenePaint(performance.now());
    });
  }
  const grid=el("matchPoints");
  grid.addEventListener("focusin",event=>{
    if(!event.target.matches("button[data-p]"))return;
    focusedPoint=Number(event.target.dataset.p);
    for(const point of grid.children)point.tabIndex=point===event.target?0:-1;
  });
  grid.addEventListener("keydown",event=>{
    const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if(!delta||!event.target.matches("button[data-p]"))return;
    event.preventDefault();
    const n=position.n,point=Number(event.target.dataset.p);
    let x=point%n+delta[0],y=Math.floor(point/n)+delta[1];
    for(;x>=0&&x<n&&y>=0&&y<n;x+=delta[0],y+=delta[1]){
      const next=grid.children[y*n+x];
      if(!next.disabled){next.focus();return;}
    }
  });
  function leave(){stop();panel.close();if(!practice)openMap(stageId());}
  el("matchBack").onclick=leave;
  panel.oncancel=e=>{e.preventDefault();if(picked!==null)cancelPlacement();else leave();};
  compactBoard.addEventListener("change",()=>{if(panel.open)cancelPlacement();});
  el("matchPlace").onclick=()=>{if(picked!==null&&requiresConfirmation())blackMove(picked);};
  el("matchCancelPlacement").onclick=cancelPlacement;
  el("matchContinue").onclick=continueMatch;
  el("matchStatus").tabIndex=-1;
  panel.addEventListener("close",()=>{if(!panel.open)stop();});
  el("matchPass").onclick=()=>blackMove(-1);
  el("matchAgain").onclick=()=>{line=[];persistent();open(rank,practice,true,early,entryDepth);};
  el("matchRepeat").onclick=()=>{
    if(pending&&useNative){useNative=false;cancelReply();}
    whiteMove();
  };el("matchZoom").onclick=()=>{zoom=!zoom;render();};
  el("matchDone").onclick=()=>{
    if(!finished||result.margin<=0)return;
    try{localStorage.removeItem(key());}catch{}
    sound("win");
    if(practice){saved.matchWins|=1<<rank;save();leave();return;}
    el("matchDone").disabled=true;
    stop();finishDuel(stageId(),()=>panel.close());
  };
  return {open,get early(){return early;},get active(){return panel.open;},get position(){return position;},get rank(){return rank;},get practice(){return !!practice;},get entryDepth(){return entryDepth;},get result(){return result;},get line(){return line;}};
})();
