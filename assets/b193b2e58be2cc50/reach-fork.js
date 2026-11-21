"use strict";

// Bits 0–1 retain the first confirmed route, two bits per route store its two
// solved positions, and bit 6 preserves an existing player's original boss match.
const ReachFork=(()=>{
  const routes=[
    {id:1,name:["避難桟橋","끊긴 피난교"],before:["ソルビ「船が流される！ 二本の板をつないで、最後の渡し守を迎えよう」","솔비 “배가 떠내려가! 널판 둘을 잇고 마지막 뱃사공을 데려오자.”"],
      goal:["黒をつなぎ、アタリの舟守を救う。","흑을 연결한 뒤 단수에 몰린 뱃사공을 구하세요."],after:["舟守は綱を西岸に結んだ。番人は南の岸から割り込む。","뱃사공이 밧줄을 서쪽 둑에 묶었다. 수문장은 남쪽 둑으로 파고든다."],reward:["救助綱","구조 밧줄"],foe:2,
      objectives:[["印の黒二つを一手でつなぐ。","표시한 흑 두 무리를 한 수로 이으세요."],["白に迫られた舟守を、呼吸点三つ以上へ逃がす。","백이 막아선 뱃사공을 활로 세 개 이상으로 구하세요."]]},
    {id:2,name:["東の放水戸","동쪽 배수문"],before:["ソルビ「水が目盛りを越えた。白い歯車を追い詰めて、水を東へ逃がそう」","솔비 “물이 눈금을 넘었어. 흰 톱니를 몰아붙여 동쪽으로 물을 빼자.”"],
      goal:["印の白をアタリにし、水門の留め金を取る。","표시한 백을 단수로 몰고 수문의 빗장을 따내세요."],after:["放水戸が開き、西岸に白が入り込んだ。番人は北岸へ援軍を回す。","배수문이 열리자 백이 서쪽 둑에 들어섰다. 수문장은 북쪽으로 지원을 보낸다."],reward:["青銅の留め金","청동 빗장"],foe:0,
      objectives:[["印の白を逃げられないアタリに。","표시한 백을 빠져나올 수 없는 단수로 모세요."],["水門の印を取る。上の白は囮だ。","수문 표식이 있는 백을 따세요. 위쪽 백은 미끼예요."]]}
  ];
  const chooseName=(id)=>routes[id-1],pair=(ja,ko)=>localizedPair([ja,ko]);
  const shift=id=>2*id;
  function valid(v,q){
    if(!Number.isInteger(q)||q<72||!Number.isInteger(v)||v<0||v>127)return 0;
    const first=v&3;
    if(first!==1&&first!==2 || (v>>(shift(first))&3)>2 || (v>>(shift(3-first))&3)!==0)return 0;
    if((v&64)&&q<=72)return 0;
    return v;
  }
  function merge(local,incoming,q){
    const a=valid(local,q),b=valid(incoming,q);
    if(!a)return b;
    if(!b||(a&3)!==(b&3))return a;
    const mask=shift(a&3);
    return (a&67)|(Math.max(a>>mask&3,b>>mask&3)<<mask);
  }
  function bossRoute(v){
    const first=v&3;
    return !(v&64)&&(first===1||first===2)&&(v>>shift(first)&3)===2?first:0;
  }
  function bossOpen(v,q){return q>72||q===72&&!!bossRoute(valid(v,q));}
  function match(index,game,v){
    const choice=bossRoute(v);
    if(index!==9||!choice)return game;
    const start=choice===1?game.start.slice(0,-2):[...game.start.slice(0,-6),70,64];
    return {...game,start};
  }
  function status(id){
    const q=ReachProgress.read(saved.reach,saved.expedition),v=valid(saved.reachFork,q),first=v&3;
    const phase=(v>>shift(id))&3,otherLocked=!!first&&first!==id;
    return {unlocked:q>=72&&!otherLocked,phase,complete:phase===2,first,otherLocked};
  }
  // A correct first play and the event's white reply lead directly to the
  // second diagram. Replay both moves when a checkpoint is restored.
  function position(id,phase){
    const bridge=id===1,board=Array(81).fill(0);
    const stones=bridge?[[38,40,42,30,28],[29,47,33,43,57,58]]:[[31,49,32,50,42,61,3,11,13],[40,60,62,70,12]];
    stones.forEach((side,k)=>side.forEach(p=>board[p+(bridge?0:9)]=k+1));
    let state={board,previous:"",captured:[]};
    if(phase)state=play(play(state,bridge?39:48,1),bridge?41:61,2);
    const kind=bridge?(phase?"escape":"link"):(phase?"capture":"atari");
    const targets=bridge?(phase?[42]:[38,40]):[49];
    return {state,mission:{board:state.board.slice(),kind,turns:1,targets,guardian:true}};
  }
  let dialog,id=0,phase=0,mode="closed",state=null,mission=null,last=-1,reply=-1,feedback="",busy=false,afterWin=false,animation=0,frame=0,artPose="idle";
  const by=name=>document.getElementById(name),sessionKey=()=>CampaignSlots.session("bfq-second-reach.fork.acting.v1");
  function pending(){try{const n=Number(sessionStorage.getItem(sessionKey()));return (n===1||n===2)&&status(n).unlocked?n:null;}catch{return null;}}
  function memo(value){try{if(value)sessionStorage.setItem(sessionKey(),String(value));else sessionStorage.removeItem(sessionKey());}catch{}}
  async function persist(change){
    const write=()=>{
      const q=ReachProgress.read(saved.reach,saved.expedition);
      let disk;
      try{disk=JSON.parse(localStorage.getItem(storageKey));}catch{}
      const v=merge(disk?.reachFork,saved.reachFork,q),next=change(v,q);
      saved.reachFork=v;
      if(next===null)return false;
      if(next===v)return true;
      saved.reachFork=next;
      if(save())return (saved.reachFork&3)===(next&3)&&(saved.reachFork>>shift(next&3)&3)>=(next>>shift(next&3)&3);
      saved.reachFork=v;return false;
    };
    return navigator.locks?.request?navigator.locks.request("reach-fork:"+CampaignSlots.id,write):write();
  }
  function install(){
    if(dialog)return;
    dialog=document.createElement("dialog");dialog.id="reachForkDialog";dialog.setAttribute("aria-labelledby","forkTitle");
    dialog.innerHTML='<article><header><button type="button" id="forkBack">‹</button><small id="forkChapter"></small></header><canvas id="forkScene" width="480" height="135" aria-hidden="true"></canvas><div id="forkWords"><h2 id="forkTitle"></h2><b id="forkWho"></b><p id="forkStory" aria-live="polite"></p><div id="forkOptions" role="radiogroup" aria-describedby="forkGoal"></div><p id="forkGoal"></p><div id="forkGoban"><canvas id="forkBoard" width="540" height="540" aria-hidden="true"></canvas><canvas id="forkFX" width="540" height="540" aria-hidden="true"></canvas><div id="forkPoints" role="group"></div></div><p role="status" id="forkStatus"></p><footer><button type="button" id="forkReconsider"></button><button type="button" id="forkConfirm"></button><button type="button" id="forkReset"></button><button type="button" id="forkNext"></button></footer></div></article>';
    document.body.append(dialog);const grid=by("forkPoints");
    for(let p=0;p<81;p++){const b=document.createElement("button");b.type="button";b.dataset.point=p;b.onclick=()=>attempt(p);grid.append(b);}
    const options=by("forkOptions");
    for(const route of routes){
      const b=document.createElement("button");b.type="button";b.dataset.forkOption=route.id;b.setAttribute("role","radio");
      b.innerHTML='<canvas width="43" height="31" aria-hidden="true"></canvas><span></span>';
      const icon=b.firstElementChild,ctx=icon.getContext("2d");ctx.imageSmoothingEnabled=false;
      StoryFrame.emblem(ctx,route.id,icon.width,icon.height);
      b.onclick=()=>preview(route.id);
      b.onkeydown=e=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;e.preventDefault();
        const next=e.key==="Home"?1:e.key==="End"?2:3-route.id;preview(next);options.children[next-1].focus({preventScroll:true});};options.append(b);
    }
    by("forkConfirm").onclick=confirm;by("forkReconsider").onclick=exit;
    new ResizeObserver(()=>{if(dialog.open)scene();}).observe(by("forkScene"));
    document.addEventListener("riverbankartready",()=>{if(dialog.open)scene();});
    by("forkNext").onclick=()=>{if(mode==="phase"){begin(1);render();}else if(mode==="complete"){afterWin=true;exit();}};
    by("forkReset").onclick=()=>{if(mode==="retry"){begin(phase);render();}};
    by("forkBack").onclick=exit;dialog.addEventListener("cancel",e=>{e.preventDefault();exit();});
    addEventListener("popstate",e=>{if(dialog.open&&e.state?.reachForkBattle!==id)leave();});
  }
  function enter(routeId,restoring=false){
    if(!chooseName(routeId)||!status(routeId).unlocked||dialog?.open)return false;
    install();id=routeId;afterWin=false;feedback="";busy=false;
    if(status(id).first){begin(status(id).phase===1?1:0);}else {mode="confirm";state=mission=null;phase=0;last=reply=-1;}
    dialog.showModal();if(!restoring||history.state?.reachForkBattle!==id)history.pushState({...history.state,reachForkBattle:id},"");
    if(mode!=="confirm")memo(id);
    render();(mode==="confirm"?by("forkOptions").children[id-1]:by("forkTitle")).focus({preventScroll:true});return true;
  }
  function preview(next){
    if(mode!=="confirm"||busy||id===next||!status(next).unlocked)return;
    id=next;feedback="";
    if(history.state?.reachForkBattle)history.replaceState({...history.state,reachForkBattle:id},"");
    render();
  }
  function resume(){const choice=pending();return !!choice&&ReachMap.active&&enter(choice,true);}
  function exit(){if(!dialog?.open||busy)return;if(history.state?.reachForkBattle===id)history.back();else leave();}
  function leave(){
    const old=id,done=afterWin;cancelAnimationFrame(frame);animation=0;dialog.close();id=0;mode="closed";memo(0);afterWin=false;
    if(typeof ReachMap!=="undefined"){
      if(done)ReachMap.forkWin(old);else if(status(old).first===old)ReachMap.forkReturn(old);
    }
  }
  function begin(n){
    phase=n;({state,mission}=position(id,phase));last=phase?(id===1?41:61):-1;reply=last;feedback="";mode="playing";artPose="idle";animation=0;
  }
  async function confirm(){
    if(mode!=="confirm"||busy)return;const chosen=id;busy=true;render();
    const ok=await persist((v,q)=>q<72||v&&(v&3)!==chosen?null:v||chosen|(q>72?64:0));
    busy=false;if(id!==chosen||!dialog.open)return;
    if(!ok){feedback=pair("選択を保存できません。地図に戻って確認してください。","선택을 저장할 수 없습니다. 지도로 돌아가 확인해 주세요.");render();return;}
    memo(id);begin(status(id).phase===1?1:0);render();by("forkPoints").querySelector("button:not(:disabled)")?.focus({preventScroll:true});
  }
  function flash(p,removed,color,pose){
    if(p>=0)BoardFX.playOn(by("forkFX"),9,p,removed,color,saved.fx);artPose=pose;animation=performance.now();
  }
  async function attempt(p){
    if(busy||mode!=="playing")return;
    const verdict=guardianMove(state,mission,1,p);
    if(!verdict.legal){feedback=pair("そこには打てない。","그곳에는 둘 수 없어요.");render();return;}
    if(!verdict.win){
      state=verdict.reply?.state??verdict.attack;last=reply=verdict.reply?.point??-1;mode="retry";
      feedback=reply>=0?pair("白の応手が通った。印を守る手を読み直そう。","백의 반격이 통했어요. 표시한 무리의 다음 수를 다시 읽어 보세요."):pair("白は手を抜ける。印を見直そう。","백이 손을 빼도 됩니다. 표식부터 다시 보세요.");
      flash(reply,state.captured,2,"strike");render();return;
    }
    const n=phase,chosen=id;busy=true;render();
    const ok=await persist((v)=>{if((v&3)!==chosen)return null;const count=v>>shift(chosen)&3;if(count<n)return null;return count>n?v:v+(1<<shift(chosen));});
    busy=false;if(id!==chosen||!dialog.open)return;
    if(!ok){feedback=pair("進行を保存できませんでした。もう一度打ってください。","진행을 저장하지 못했습니다. 다시 착수해 주세요.");render();return;}
    state=verdict.attack;last=p;reply=-1;mode=n===0?"phase":"complete";flash(p,state.captured,1,n?"break":"hit");
    feedback=n?"":pair("道がつながった。白の応手を見よう。","길이 열렸어요. 이제 백의 응수를 확인하세요.");
    render();by("forkNext").focus({preventScroll:true});
  }
  function paintBoard(){
    if(!state)return;
    const ca=by("forkBoard"),c=ca.getContext("2d"),u=60;Wardrobe.surface(c,540,540,saved.gear[0]);
    const ink=Wardrobe.boards[saved.gear[0]][5][2];
    for(let n=0;n<9;n++){const d=30+n*u;c.strokeStyle=ink;c.lineWidth=1.8;c.beginPath();c.moveTo(d,30);c.lineTo(d,510);c.moveTo(30,d);c.lineTo(510,d);c.stroke();}
    for(let p=0;p<81;p++){
      const x=(p%9+.5)*u,y=(Math.floor(p/9)+.5)*u,v=state.board[p];
      if(!v&&[20,24,40,56,60].includes(p)){c.fillStyle=ink;c.fillRect(x-2,y-2,4,4);}
      if(v)Wardrobe.stone(c,x,y,27,v===2,saved.gear[1]);
      if(mission.targets.includes(p)){c.strokeStyle=v===1?"#f3d487":"#9c402a";c.lineWidth=3.4;c.strokeRect(x-10,y-10,20,20);}
      if(p===last){c.strokeStyle=v===1?"#f4d48c":"#415166";c.lineWidth=3;c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.stroke();}
      const b=by("forkPoints").children[p];b.disabled=busy||mode!=="playing"||!!v;b.setAttribute("aria-label",MatchRules.coordinate(9,p)+(mission.targets.includes(p)?pair(" 目標"," 목표"):""));
    }
  }
  function scene(now=performance.now()){
    cancelAnimationFrame(frame);if(!id||!dialog?.open)return;
    const ca=by("forkScene"),c=ca.getContext("2d"),r=chooseName(id),age=animation?(now-animation)/720:2;
    const film=mode==="confirm"||mode==="complete",kind=id===1?"bridge":"sluice",land=ReachMap.battle(id===1?8:9,SecondReach.cleared());
    ca.dataset.storyArt=kind;
    if(film){
      const geom=StoryFrame.layout(ca),box=ca.getBoundingClientRect(),panel=by("forkWords").getBoundingClientRect();
      // Keep the standing silhouettes above the decision panel at any text size.
      geom.ground=Math.min(geom.ground,Math.max(geom.h*.24,Math.round((panel.top-box.top)*geom.h/box.height-3)));
      const {w,h,ground}=geom,unit=Math.min(w*.27,h*.29,112);
      c.imageSmoothingEnabled=false;StoryFrame.background(c,land,geom,"reach-fork",id,kind,mode==="complete");
      Crew.draw(c,w*.02,w*.28,ground+1,unit,0,0,3);
      if(!RoadPoses.draw(c,w*.34,ground,unit,mode==="complete"?"offer":"inspect",reduceMotion?0:now))WorldScale.hero(c,w*.34,ground,unit);
      if(typeof ReachFauna!=="undefined")ReachFauna.draw(c,r.foe,w*.87,ground-2,unit*.67,"idle",reduceMotion?0:now%1500/1500);
      if(!reduceMotion&&document.visibilityState!=="hidden")frame=requestAnimationFrame(scene);return;
    }
    if(ca.width!==480)ca.width=480;if(ca.height!==135)ca.height=135;const base=118;
    c.imageSmoothingEnabled=false;c.drawImage(ReachMap.battle(id===1?8:9,SecondReach.cleared()),0,0,480,135);
    const pose=age<1?artPose:"idle",beat=age<1?age:(reduceMotion?0:(now%1200)/1200),swing=age<1?Math.sin(Math.PI*age):0;
    Crew.draw(c,15,111,base-3,66,Math.floor(now/220)%2,pose==="strike"?3:pose==="idle"?0:2,4);
    ExpeditionCast.party(c,0,142+(pose==="hit"?8*swing:0),base,69,0,0,pose==="idle"?0:pose==="strike"?3:2);
    const enemyX=358-(pose==="strike"?11*swing:0);
    if(typeof ReachFauna==="undefined"||!ReachFauna.draw(c,r.foe,enemyX,base,96,pose,beat))ExpeditionCast.foe(c,id===1?14:12,enemyX,base,77,0,1,pose==="idle"?0:2);
    if(!reduceMotion&&document.visibilityState!=="hidden")frame=requestAnimationFrame(scene);
  }
  function render(){
    const r=chooseName(id);if(!r)return;const confirmView=mode==="confirm",won=mode==="complete";
    by("forkChapter").textContent=confirmView?pair("分水路の決断","갈림길의 선택"):pair("分水路","별물 갈림길")+" · "+(phase+1)+"/2";
    by("forkTitle").textContent=localizedPair(r.name);by("forkTitle").tabIndex=-1;
    by("forkBack").setAttribute("aria-label",pair("地図へ戻る","지도로 돌아가기"));
    by("forkStory").textContent=confirmView?localizedPair(r.before):won?localizedPair(r.after):phase===0?localizedPair(r.before):id===1?pair("残った舟守に白が迫る。南の水辺はまだ空いている。","마지막 뱃사공에게 백이 다가왔다. 남쪽 물가는 아직 열려 있다."):pair("白は東で黒を一つ取った。今なら中央の留め金に届く。","백이 동쪽에서 흑 하나를 잡았다. 지금 중앙의 빗장에 손이 닿는다.");
    by("forkGoal").textContent=confirmView?GameLanguage.format("fork.forecloses",saved.locale,localizedPair(chooseName(3-id).name)):won?pair("旅の証 · ","여정의 증표 · ")+localizedPair(r.reward):localizedPair(r.objectives[phase]);
    dialog.dataset.film=String(confirmView||won);
    const speaker=won?pair("舟便の記録","우편선 일지"):pair("ソルビ","솔비");
    by("forkWho").textContent=speaker;
    if(confirmView){const full=by("forkStory").textContent;by("forkStory").textContent=full.replace(/^ソルビ「(.*)」$/,"$1").replace(/^솔비 “(.*)”$/,"$1");}
    if(confirmView||won)StoryFrame.portrait(by("forkWords"),confirmView?"solbi":"",by("forkStory").textContent,"fork/"+id+"/"+mode);
    else by("forkWords").querySelector(".story-head")?.setAttribute("hidden","");
    const opts=by("forkOptions");opts.hidden=!confirmView;opts.setAttribute("aria-label",pair("助ける岸を選ぶ","도울 강가 선택"));
    for(const b of opts.children){const n=Number(b.dataset.forkOption);b.disabled=busy;b.tabIndex=n===id?0:-1;b.setAttribute("aria-checked",String(n===id));b.lastElementChild.textContent=localizedPair(chooseName(n).name);}
    by("forkReconsider").hidden=!confirmView;by("forkReconsider").disabled=busy;
    by("forkReconsider").textContent=pair("地図を見直す","지도를 다시 보기");
    by("forkGoban").hidden=confirmView||won;by("forkStatus").textContent=feedback;by("forkStatus").hidden=!feedback;
    for(const [name,on,txt] of [["forkConfirm",confirmView,pair("この道に決める","이 길로 확정")],["forkReset",mode==="retry",pair("打ち直す","다시 두기")],["forkNext",mode==="phase"||won,won?pair("合流点へ","합류 지점으로"):pair("白の応手へ","백 응수로")]]){
      const b=by(name);b.hidden=!on;b.disabled=busy;b.textContent=txt;
    }
    by("forkPoints").setAttribute("aria-label",pair("九路盤の交点","9줄 바둑판의 교차점"));dialog.dataset.mode=mode;dialog.dataset.fork=id;
    if(!confirmView)paintBoard();scene();
  }
  return {routes,valid,merge,bossRoute,bossOpen,match,position,status,enter,resume,pending,inspect:()=>({id,phase,mode,mission,state,last,reply})};
})();
