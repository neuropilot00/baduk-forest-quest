"use strict";
const RoadTalk=(()=>{
  let from=0,dest=0,beat=0;
  const local=(ja,ko)=>localizedPair([ja,ko]);
  function render(){
    const arrival=Voyage.scene(dest),origin=Voyage.scene(from);
    const id=beat?dest:from,rank=Expedition.rankOf(id),who=beat?arrival.speaker:(Voyage.cast.findIndex(c=>c.gate===from+1)>0?Voyage.cast.findIndex(c=>c.gate===from+1):origin.speaker);
    el("roadChapter").textContent=t("chapterLabel",rank+1)+" · "+localizedPair(Atlas.chapters[rank].name);
    el("roadPlace").textContent=localizedPair(Voyage.places[id]);el("roadWho").textContent=localizedPair(Voyage.cast[who].name);
    const destination=localizedPair(arrival.title);
    const goal=localizedPair(Voyage.goals[Expedition.rankOf(dest)]);
    const first=localizedPair(origin.after);
    el("roadLine").textContent=beat?(first===localizedPair(arrival.before)?goal:localizedPair(arrival.before)):first;
    el("roadNext").textContent=beat?local(destination+"へ",destination+" 도착"):local("話を聞く　›","이야기 듣기　›");
    const canvas=el("roadIllustration"),c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;
    c.imageSmoothingEnabled=false;c.drawImage(MapArt.battle(rank,id%20),0,0,w,h);
    const party=Crew.travelers(),guests=who>0&&!party.includes(who-1);
    const heroX=party.length?w*.47:w*.30,ground=h*.92,heroPx=Math.min(h*.62,w/(party.length+2.7));
    Crew.draw(c,w*.035,heroX-w*.074,ground,heroPx,0,0,3);
    WorldScale.hero(c,heroX,ground,heroPx);
    if(guests)WorldScale.draw(c,who-1,w*.75,ground,heroPx);
  }
  function close(){if(el("roadDialog").open)el("roadDialog").close();}
  el("roadSkip").onclick=close;el("roadNext").onclick=()=>{if(beat)close();else{beat++;render();}};
  return {open(a,b){from=a;dest=b;beat=0;render();el("roadDialog").showModal();},close};
})();
const BossMatch=(()=>{
  const panel=el("matchDialog"),native=!!document.querySelector('meta[name="local-go-engine"]');
  const local=(ja,ko)=>localizedPair([ja,ko]);
  let rank,early=null,entryDepth=0,practice,position,line=[],selected=null,pending=false,token=0,worker=null,abort=null,finished=false,result=null,zoom=false,notice="";
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
    ink.imageSmoothingEnabled=false;ink.drawImage(MapArt.battle(Math.floor(stageId()/20),stageId()%20),0,0,scene.width,scene.height);
    const count=Crew.travelers().length,heroPx=Math.min(61,scene.width/(count+4.8));
    const hx=74+count*16+(striker===1?18*push:-6*hit),ex=242+(striker===2?-20*push:7*hit);
    Crew.draw(ink,4,hx-heroPx*.53,94,heroPx,reduceMotion?0:Math.floor(time/165)%4,CastMotion.crewPhase(time),2);
    WorldScale.hero(ink,hx,94,heroPx,CastMotion.phase(1,time));
    if(early===null)ExpeditionCast.guardian(ink,rank,ex,94,78,(striker===2?-.11:.14)*push,1,CastMotion.phase(2,time));
    else ExpeditionCast.foe(ink,Expedition.species(early),ex,94,72,(striker===2?-.11:.14)*push,1,CastMotion.phase(2,time));
    if(active){
      const f=Math.min(1,age/.39),a=striker===1?hx+16:ex-16,b=striker===1?ex-13:hx+11;
      const x=a+(b-a)*f,y=65-Math.sin(f*Math.PI)*14;
      ink.strokeStyle=striker===1?"#f9ce74":"#a6e2dd";ink.lineWidth=captures?4:2;ink.beginPath();ink.moveTo(x-(b-a)*.13,y+2);ink.lineTo(x,y);ink.stroke();
      for(let i=0;hit>0&&i<(captures?14:6);i++){const angle=i*2.4,r=hit*(captures?30:14);ink.fillStyle=i%2?"#fff5cb":"#e8ac55";ink.fillRect(b+Math.cos(angle)*r,65+Math.sin(angle)*r,2+i%2,2);}
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
    el("matchStatus").textContent=finished?local("黒面積 ","흑 면적 ")+result.black+local(" · 白面積 "," · 백 면적 ")+result.white+local(" · コミ "," · 덤 ")+komi()+"　"+(margin>0?local("黒","흑"):local("白","백"))+" +"+Math.abs(margin):notice||(
      position.side===2?local("白が考えています…","백이 응수를 읽고 있어요…"):selected!==null?MatchRules.coordinate(n,selected)+" · "+local("ここに打つ？","여기에 둘까요?"):local("黒番。取り残した死石は終局前に取ろう。","흑 차례. 잡을 돌은 끝내기 전에 따내세요."));
    el("matchHint").textContent=finished&&early!==null?local("双方がパス。石と囲んだ空点を数えた。","양쪽이 패스했어요. 돌과 둘러싼 빈 점을 더해 계가했어요."):localizedPair(profile()?.goal||Voyage.matchGoals[rank]);
    el("matchPass").textContent=local("パス","패스");el("matchPass").hidden=finished;el("matchPass").disabled=pending||position.side!==1;
    el("matchPlace").hidden=n===9||finished||position.side!==1;el("matchPlace").disabled=selected===null;el("matchPlace").textContent=local("着手","착수");
    el("matchAgain").hidden=!finished||margin>0;el("matchAgain").textContent=local("もう一局","재대국");
    el("matchDone").hidden=!finished||margin<=0;el("matchDone").textContent=practice?local("地図へ","지도로"):local("道を開く","길 열기");
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
    line.push(p);position=next;selected=null;notice="";persistent();sound(p<0?"reply":"tap");
    finished=position.passes===2;result=finished?MatchRules.score(position,komi()):null;
    if(finished&&result.margin>0&&practice){saved.matchWins|=1<<rank;save();}
    if(p>=0)animateMove(3-next.side,next.taken);
    render();return true;
  }
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
    stop();CastMotion.reset();early=!practiceOnly&&Number.isInteger(earlyStage)&&earlyStage<80&&EarlyGuardians.is(earlyStage)?earlyStage:null;rank=early===null?id:EarlyGuardians.game(early).rank;practice=practiceOnly;entryDepth=practice?Number(el("matchEntry").value)||0:0;zoom=false;BoardFX.clear(el("matchFx"));load(restart);
    const n=position.n,points=el("matchPoints");points.style.gridTemplateColumns="repeat("+n+",1fr)";
    points.style.gridTemplateRows="repeat("+n+",1fr)";points.style.inset=(50/(n+1))+"%";
    points.replaceChildren(...Array.from({length:n*n},(_,p)=>{
      const b=document.createElement("button");b.type="button";b.dataset.p=p;
      b.onclick=()=>{if(finished||pending||position.side!==1)return;if(n===9||selected===p)blackMove(p);
        else if(!position.board[p]){selected=p;notice="";render();}};return b;
    }));
    if(!panel.open)panel.showModal();render();if(position.side===2&&!finished)whiteMove();
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
