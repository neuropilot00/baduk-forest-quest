"use strict";
const RoadTalk=(()=>{
  const dialog=el("roadDialog"),canvas=el("roadIllustration");
  let from=0,dest=0,beat=0,pages=[],frame=0,lastPaint=0,started=0;
  const local=(ja,ko)=>localizedPair([ja,ko]);
  function draw(now){
    if(!dialog.open)return;
    if(window.StoryPanels?.draw(canvas,from,beat))return;
    const shot=pages[beat],id=beat===pages.length-1?dest:from,rank=Expedition.rankOf(id);
    const c=canvas.getContext("2d"),geom=StoryFrame.layout(canvas),{w,h,ground}=geom;
    const land=MapArt.battle(rank,id%20);c.imageSmoothingEnabled=false;
    if(!window.StoryPanels?.setting(c,geom,id,beat,shot))StoryFrame.background(c,land,geom,"road",id,"",false);
    const party=Crew.travelers(),guest=shot.speaker>0&&!party.includes(shot.speaker-1);
    const heroPx=Math.min(h*.3,120,w/(party.length+2.6));
    const t=reduceMotion?0:Math.max(0,now-started);
    const walking=shot.pose==="walk",heroX=(party.length?w*.45:w*.34)+(walking?Math.min(20,t*.016):0);
    const stride=walking&&!reduceMotion?Math.floor(t/160)%4:0;
    Crew.draw(c,w*.025,heroX-w*.085,ground,heroPx,stride,0,3);
    if(guest)WorldScale.draw(c,shot.speaker-1,w*.76,ground,heroPx,shot.pose==="offer"?1:0,stride);
    if(!RoadPoses.draw(c,heroX,ground,heroPx,shot.pose,t))WorldScale.hero(c,heroX,ground,heroPx);
    if(shot.prop){
      const [dx,dy]=shot.pose==="wait"?[.54,-.06]:RoadPoses.grip(shot.pose,t);
      RoadObjects.draw(c,shot.prop,heroX+heroPx*dx,ground+heroPx*dy,heroPx/100,shot.pose);
    }
  }
  function animate(now){
    if(!dialog.open)return;
    if(!document.hidden&&now-lastPaint>=110){draw(now);lastPaint=now;}
    if(!reduceMotion&&now-started<3200)frame=requestAnimationFrame(animate);
  }
  function render(){
    window.StoryPanels?.warm(from,beat);
    MapJourney.write("talk",{from,dest,beat});
    const page=pages[beat],id=beat===pages.length-1?dest:from,rank=Expedition.rankOf(id);
    el("roadChapter").textContent=t("chapterLabel",rank+1)+" · "+localizedPair(Atlas.chapters[rank].name);
    el("roadPlace").textContent=localizedPair(Voyage.places[id]);el("roadWho").textContent=localizedPair(Voyage.cast[page.speaker].name);
    el("roadLine").textContent=localizedPair(page.line);
    StoryFrame.portrait(dialog.querySelector(".road-words"),page.speaker,el("roadLine").textContent,from+"/"+beat);
    canvas.dataset.storyArt="road-"+id;
    el("roadNext").textContent=beat===pages.length-1?local("地図へ","지도로"):local("つづき　›","계속　›");
    dialog.dataset.pose=page.pose;dialog.dataset.beat=beat;dialog.dataset.pages=pages.length;
    cancelAnimationFrame(frame);started=performance.now();lastPaint=0;draw(started);
    if(!reduceMotion)frame=requestAnimationFrame(animate);
  }
  function close(){MapJourney.write("talk",null);if(dialog.open)dialog.close();}
  new ResizeObserver(()=>{if(dialog.open)draw(performance.now());}).observe(canvas);
  document.addEventListener("storypanelready",event=>{
    if(dialog.open&&window.StoryPanels.selection(from,beat)?.plate===event.detail)draw(performance.now());
  });
  window.StoryPanels?.warm(mapLocation());
  if(typeof ScenicArt!=="undefined")ScenicArt.ready.then(()=>{if(dialog.open)draw(performance.now());});
  MapJourney.input(dialog,()=>el("roadNext").click());
  dialog.addEventListener("close",()=>{if(!dialog.open){cancelAnimationFrame(frame);MapJourney.write("talk",null);}});
  addEventListener("pagehide",()=>{if(!dialog.open)MapJourney.write("talk",null);});
  el("roadSkip").onclick=close;el("roadNext").onclick=()=>{if(beat===pages.length-1)close();else{beat++;render();}};
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
    beat=Math.min(pages.length-1,Math.max(0,resumeBeat|0));if(!dialog.open)dialog.showModal();render();
  },close};
})();
const BossMatch=(()=>{
  const panel=el("matchDialog"),native=!!document.querySelector('meta[name="local-go-engine"]');
  const local=(ja,ko)=>localizedPair([ja,ko]);
  let rank,early=null,entryDepth=0,practice,position,line=[],selected=null,pending=false,token=0,worker=null,abort=null,finished=false,result=null,zoom=false,notice="";
  const reading=DuelReading.mount(el("matchScene"),el("matchPoints"));
  const profile=()=>early===null?null:EarlyGuardians.game(early);
  const entryGame=()=>profile()||MatchRules.entry(MatchPositions[rank],entryDepth);
  const komi=()=>profile()?.komi??MatchRules.komi[rank];
  const stageId=()=>early??rank*10+9;
  const key=()=>early!==null?storageKey+".early-match."+early:storageKey+".match."+rank+(practice?".practice."+entryDepth:".route");
  const persistent=()=>{try{localStorage.setItem(key(),JSON.stringify(line));}catch{}};
  function stop(){cancelAnimationFrame(sceneFrame);token++;abort?.abort();abort=null;worker?.terminate();worker=null;pending=false;}
  function load(restart){
    const entry=entryGame();line=[];
    if(!restart)try{const raw=JSON.parse(localStorage.getItem(key()));if(Array.isArray(raw)&&raw.length<=1250&&raw.every(Number.isInteger))line=raw;}catch{}
    try{position=MatchRules.replay(entry.size,[...entry.start,...line]);}catch{line=[];position=MatchRules.replay(entry.size,entry.start);}
    selected=null;finished=position.passes===2;result=finished?MatchRules.score(position,komi()):null;notice="";
  }
  const name=()=>early===null?localizedPair(Voyage.guardians[rank]):localizedPair(Expedition.names[Math.floor(early/20)][early%20])+local("・斥候長"," · 정예대장");
  function paint(){
    const canvas=el("matchBoard"),c=canvas.getContext("2d"),n=position.n,w=canvas.width,u=w/(n+1),g=position.board;
    Wardrobe.surface(c,w,w,saved.gear[0]);c.strokeStyle=Wardrobe.boards[saved.gear[0]][5][2];c.lineWidth=1.6;
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
      if(p===position.last||p===selected){
        c.strokeStyle=p===selected?"#215e80":g[p]===2?"#894c3d":"#f7c374";c.lineWidth=p===selected?3:2;
        c.beginPath();c.arc(x,y,p===selected?u*.42:u*.15,0,Math.PI*2);c.stroke();
      }
    }
  }
  let strike=0,striker=0,captures=0,sceneFrame=0;
  function scenePaint(time){
    const scene=el("matchScene"),ink=scene.getContext("2d"),age=reduceMotion?2:(time-strike)/1000;
    const active=age>=0&&age<.64,push=active?Math.sin(Math.PI*Math.min(1,age/.38)):0;
    const hit=active?Math.sin(Math.PI*Math.max(0,Math.min(1,(age-.2)/.4))):0;
    const height=drawFieldScenery(scene,ink,MapArt.battle(Math.floor(stageId()/20),stageId()%20),320,104);
    const ground=height*.90;
    const count=Crew.travelers().length,heroPx=Math.min(61,scene.width/(count+4.8));
    const hx=74+count*16+(striker===1?18*push:-6*hit),ex=242+(striker===2?-20*push:7*hit);
    Crew.draw(ink,4,hx-heroPx*.53,ground,heroPx,reduceMotion?0:Math.floor(time/165)%4,CastMotion.crewPhase(time),2);
    WorldScale.hero(ink,hx,ground,heroPx,finished?(result.margin>0?1:3):CastMotion.phase(1,time));
    const bossPose=finished?(result.margin>0?3:1):CastMotion.phase(2,time);
    if(early===null)ExpeditionCast.guardian(ink,rank,ex,ground,78,(striker===2?-.11:.14)*push,1,bossPose);
    else ExpeditionCast.foe(ink,Expedition.species(early),ex,ground,72,(striker===2?-.11:.14)*push,1,bossPose);
    if(active){
      const f=Math.min(1,age/.39),a=striker===1?hx+16:ex-16,b=striker===1?ex-13:hx+11;
      const x=a+(b-a)*f,y=ground-29-Math.sin(f*Math.PI)*14;
      ink.strokeStyle=striker===1?"#f9ce74":"#a6e2dd";ink.lineWidth=captures?4:2;ink.beginPath();ink.moveTo(x-(b-a)*.13,y+2);ink.lineTo(x,y);ink.stroke();
      for(let i=0;hit>0&&i<(captures?14:6);i++){const angle=i*2.4,r=hit*(captures?30:14);ink.fillStyle=i%2?"#fff5cb":"#e8ac55";ink.fillRect(b+Math.cos(angle)*r,ground-29+Math.sin(angle)*r,2+i%2,2);}
    }
  }
  function animateMove(side,taken){
    cancelAnimationFrame(sceneFrame);strike=performance.now();striker=side;captures=taken;CastMotion.strike(side,strike);
    const frame=time=>{if(!panel.open)return;scenePaint(time);if(!reduceMotion&&time-strike<680)sceneFrame=requestAnimationFrame(frame);};
    sceneFrame=requestAnimationFrame(frame);
  }
  function render(){
    const entry=entryGame(),n=entry.size;
    el("matchName").textContent=name();el("matchProfile").textContent=n+local("路","줄")+" · "+local("第","제")+(entry.start.length+line.length+1)+local("手","수")+" · "+(native&&early===null?"KataGo "+MatchRules.budget(rank,entryDepth)+local("探索","탐색"):local("端末AI ","기기 AI ")+(Math.min(7,rank+entryDepth)+1)+"/8");
    const margin=result?.margin;
    el("matchStatus").textContent=finished?local("双方がパス。盤上の四角は数えた地。","양쪽이 패스했어요. 판의 네모는 계가에 넣은 집이에요."):notice||(
      position.side===2?local("白が考えています…","백이 응수를 읽고 있어요…"):selected!==null?MatchRules.coordinate(n,selected)+" · "+local("ここに打つ？","여기에 둘까요?"):local("黒番。取り残した死石は終局前に取ろう。","흑 차례. 잡을 돌은 끝내기 전에 따내세요."));
    const passedOpening=finished&&line.length===2&&line.every(p=>p===-1);
    el("matchHint").hidden=finished&&!(passedOpening&&margin<0);
    el("matchHint").textContent=passedOpening&&margin<0?local("初手を休み、白もパスして終局。再戦では空点を選んで形を変えよう。","첫 수를 쉬자 백도 패스해 그대로 끝났어요. 재대결에서는 빈 점에 두어 판을 바꿔 보세요."):localizedPair(profile()?.goal||Voyage.matchGoals[rank]);
    reading.show(position,result,komi(),early!==null||rank%2===0);
    el("matchPass").textContent=DuelReading.passLabel(position);el("matchPass").hidden=finished;el("matchPass").disabled=pending||position.side!==1;
    el("matchPlace").hidden=n===9||finished||position.side!==1;el("matchPlace").disabled=selected===null;el("matchPlace").textContent=local("着手","착수");
    el("matchAgain").hidden=!finished||margin>0;el("matchAgain").textContent=local("この局面から再戦","이 국면부터 재대결");
    el("matchDone").hidden=!finished||margin<=0;el("matchDone").textContent=practice?local("地図へ","지도로"):local("勝利を記録して地図へ","승리 기록 후 지도로");
    el("matchRepeat").hidden=finished||pending||position.side!==2;
    el("matchZoom").hidden=n===9;el("matchZoom").setAttribute("aria-pressed",String(zoom));el("matchPaper").classList.toggle("zoom",zoom);
    scenePaint(performance.now());
    paint();
    for(const b of el("matchPoints").children){
      const p=Number(b.dataset.p),v=position.board[p];b.setAttribute("aria-label",MatchRules.coordinate(n,p)+" "+(v===1?local("黒","흑"):v===2?local("白","백"):local("空点","빈 점")));
      b.setAttribute("aria-disabled",String(finished||pending||position.side!==1||!!v));
    }
  }
  function commit(p){
    const next=MatchRules.move(position,p);if(!next)return false;
    if(p>=0){
      const taken=[];for(let q=0;q<next.board.length;q++)if(position.board[q]&&!next.board[q])taken.push(q);
      BoardFX.playOn(el("matchFx"),position.n,p,taken,position.side,saved.fx,true);
    }
    if(position.side===1)reading.afterBlack(next.taken);
    line.push(p);position=next;selected=null;notice="";persistent();sound(p<0?"reply":"tap");
    finished=position.passes===2;result=finished?MatchRules.score(position,komi()):null;
    if(finished)sound(result.margin>0?"win":"bad");
    if(finished&&result.margin>0&&practice){saved.matchWins|=1<<rank;save();}
    if(p>=0)animateMove(3-next.side,next.taken);
    render();
    if(finished){panel.scrollTop=0;panel.querySelector(".duel-reading strong").focus({preventScroll:true});}
    return true;
  }
  new ResizeObserver(()=>{if(panel.open&&position)scenePaint(performance.now());}).observe(el("matchScene"));
  let workerEnabled=true;
  async function fallback(stamp){
    const state=position,strength=Math.min(7,rank+entryDepth),extra=komi();
    if(workerEnabled)try{
      return await new Promise((resolve,reject)=>{
        const src=makeMatchRules.toString()+"\nonmessage=e=>{const x=e.data;postMessage(makeMatchRules().choose(x.state,x.rank,x.komi));};";
        const blob=URL.createObjectURL(new Blob([src],{type:"text/javascript"}));
        try{worker=new Worker(blob);}finally{URL.revokeObjectURL(blob);}
        const running=worker;
        running.onmessage=e=>resolve(e.data);
        running.onerror=e=>{e.preventDefault();reject(Error("Worker unavailable"));};
        running.onmessageerror=()=>reject(Error("Worker message unavailable"));
        running.postMessage({state,rank:strength,komi:extra});
      });
    }catch{
      if(stamp===token)workerEnabled=false;
    }finally{
      if(stamp===token){worker?.terminate();worker=null;}
    }
    return MatchRules.chooseLocally(state,strength,extra,()=>stamp===token);
  }
  async function whiteMove(){
    if(pending||finished||position.side!==2)return;
    const stamp=++token;pending=true;notice="";render();
    try{
      let p;
      if(native&&early===null){
        abort=new AbortController();
        const response=await fetch("/api/move",{method:"POST",signal:abort.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({rank,entryDepth,moves:line})});
        if(!response.ok)throw Error("engine");
        const answer=await response.json();p=answer.point;
      }else p=await fallback(stamp);
      const lead=CastMotion.remainingBlackLead;if(lead)await new Promise(done=>setTimeout(done,lead));
      if(token!==stamp)return;pending=false;if(!commit(p))throw Error("Illegal engine move");
    }catch{if(token!==stamp)return;pending=false;notice=local("白の応手を取得できません。もう一度試せます。","백의 응수를 받지 못했어요. 다시 시도할 수 있어요.");render();}
  }
  function blackMove(p){
    if(finished||pending||position.side!==1)return;
    if(!commit(p)){notice=local("そこには打てません。","그곳에는 둘 수 없어요.");render();return;}
    if(!finished)whiteMove();
  }
  function open(id,practiceOnly,restart=false,earlyStage=null){
    stop();reading.reset();CastMotion.reset();early=!practiceOnly&&Number.isInteger(earlyStage)&&earlyStage<80&&EarlyGuardians.is(earlyStage)?earlyStage:null;rank=early===null?id:EarlyGuardians.game(early).rank;practice=practiceOnly;entryDepth=practice?Number(el("matchEntry").value)||0:0;zoom=false;BoardFX.clear(el("matchFx"));load(restart);
    const n=position.n,points=el("matchPoints");points.style.gridTemplateColumns="repeat("+n+",1fr)";
    points.style.gridTemplateRows="repeat("+n+",1fr)";points.style.inset=(50/(n+1))+"%";
    points.replaceChildren(...Array.from({length:n*n},(_,p)=>{
      const b=document.createElement("button");b.type="button";b.dataset.p=p;
      b.onclick=()=>{if(finished||pending||position.side!==1)return;if(n===9||selected===p)blackMove(p);
        else if(!position.board[p]){selected=p;notice="";render();}};return b;
    }));
    if(!panel.open)panel.showModal();panel.scrollTop=0;render();if(position.side===2&&!finished)whiteMove();
  }
  function leave(){stop();panel.close();openMap(practice?mapLocation():stageId());}
  el("matchBack").onclick=leave;panel.oncancel=e=>{e.preventDefault();leave();};
  el("matchPlace").onclick=()=>{if(selected!==null)blackMove(selected);};el("matchPass").onclick=()=>blackMove(-1);
  el("matchAgain").onclick=()=>{line=[];persistent();open(rank,practice,true,early);};
  el("matchRepeat").onclick=whiteMove;el("matchZoom").onclick=()=>{zoom=!zoom;render();};
  el("matchDone").onclick=()=>{
    if(!finished||result.margin<=0)return;
    try{localStorage.removeItem(key());}catch{}
    if(practice){leave();return;}
    stop();panel.close();finishDuel(stageId());
  };
  return {open,get early(){return early;},get active(){return panel.open;},get position(){return position;},get rank(){return rank;},get result(){return result;},get line(){return line;}};
})();
