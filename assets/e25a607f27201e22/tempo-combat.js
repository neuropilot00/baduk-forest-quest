"use strict";
const TempoCombat=(()=>{
  const burstMs=15000;
  const text=(ja,ko)=>GameLanguage.pair([ja,ko],saved.locale);
  const by=id=>document.getElementById(id);
  let run=null,checkpoint=null,spent=0,previous=null,impact=null,critical=null,burst=null;
  let timeBudget=18000,turnLive=false,span=-1,spentBurst=false,activeClock="",replyClock=null;
  const hud=by("tempoHud"),home=document.createComment("expedition turn display");
  hud.before(home);
  let fieldView=null,guardImpact=null;
  const position=()=>fieldView?SecondReach.inspect():{mission,state};
  const incoming=()=>run.hp<=run.max*.33?8:18;
  const resultingMode=()=>fieldView?fieldView.mode():mode;
  function begin(id,round,count,reading,view=null){
    fieldView=view;
    if(view)view.mount(hud);else home.after(hud);
    const advancing=run?.id===id && round===run.round+1, retry=run?.id===id && run.round===round && checkpoint;
    const max=32*count;
    if(retry)run={...checkpoint,ally:run.ally||100,used:spentBurst||checkpoint.used};
    else if(!advancing){run={id,round,hp:max-32*round,max,ally:100,charge:round?1:0,streak:0,used:false,crit:false,clear:false};}
    run.round=round;run.count=count;checkpoint={...run};spentBurst=run.used;
    by("tempoNotice").textContent="";impact=critical=guardImpact=null;burst=null;newTurn(reading);
  }
  function leave(){
    if(burst){burst=null;if(by("burstDialog").open)by("burstDialog").close();}
    TempoDefense.clear();guardImpact=null;hud.hidden=true;home.after(hud);fieldView=null;run=null;checkpoint=burst=impact=critical=replyClock=null;resetClock();}
  function resetClock(){previous=null;activeClock="";}
  function newTurn(reading){if(run)TempoDefense.arm(run.id,run.round,position());replyClock=null;spent=0;timeBudget=18000+4000*Math.max(0,reading-1);turnLive=true;span=-1;resetClock();}
  function eligible(){return !!run && (fieldView?fieldView.active():!trial && journey() && by("voyage").hidden && !by("battleLayout").hidden);}
  function pass(now=performance.now()){
    const blocking=fieldView?"dialog[open]:not(#burstDialog):not(#reachBattleDialog):not(#reachMap)":"dialog[open]:not(#burstDialog)";
    const field=eligible() && !document.hidden && !document.querySelector(blocking) && by("gearDialog").hidden;
    const mode=resultingMode();
    const kind=field && burst && by("burstDialog").open?"burst":field && !burst && mode==="playing" && turnLive?"turn":field && replyClock && mode==="waiting"?"reply":"";
    TempoDefense.clock(kind==="turn"&&by("titleScene").hidden,now);
    if(kind && kind===activeClock && previous!==null){
      const duration=Math.max(0,now-previous);
      if(kind==="turn")spent+=duration;else if(kind==="reply")replyClock.elapsed+=duration;else burst.elapsed+=duration;
    }
    previous=now;activeClock=kind;
  }
  function prepareReply(duration,callback){
    replyClock={duration,elapsed:0,callback};resetClock();pass();
  }
  function speedDamage(ms,windowMs){return 12+Math.round(22*Math.max(0,1-ms/windowMs));}
  function deal(amount,final,finisher){
    const reserve=5*Math.max(0,run.count-run.round-(final?1:0));
    const actual=Math.min(amount,Math.max(0,run.hp-reserve));
    run.hp-=actual;impact={at:performance.now(),amount:actual,side:1,kind:finisher};
    if(finisher)critical={at:impact.at,kind:finisher};
    return actual;
  }
  function attack(accepted,done){
    if(!eligible())return;
    pass();turnLive=false;
    const defended=TempoDefense.resolve(accepted,position().state,incoming());
    if(defended){
      defended.amount=Math.min(run.ally,defended.amount);run.ally-=defended.amount;
      guardImpact={...defended,at:performance.now()};
      by("tempoNotice").textContent=TempoDefense.resultText(saved.locale==="ko",guardImpact);
    }else if(by("tempoNotice").dataset.guard==="cue")by("tempoNotice").textContent="";
    by("tempoNotice").dataset.guard="";
    if(!accepted){run.streak=0;return;}
    const quick=spent<=timeBudget*.32;
    run.streak=quick?run.streak+1:0;
    const crit=run.streak>=3&&!run.crit;
    if(crit)run.crit=true;
    run.charge=Math.min(2,run.charge+1);loadSanctum();
    deal(speedDamage(spent,timeBudget)+(crit?12:0),done,crit?"critical":"");
    if(done&&run.round===run.count-1)run.clear=true;
  }
  function mark(){return run?{hp:run.hp,charge:run.charge,streak:run.streak,crit:run.crit}:null;}
  function rewind(mark,reading){
    if(!mark||!run)return;
    Object.assign(run,mark);impact=critical=null;newTurn(reading);
  }
  function block(){
    if(!eligible())return;
    impact={at:performance.now(),amount:0,side:2,kind:"guard"};
  }
  function hit(){
    if(!eligible())return;
    const amount=Math.min(run.ally,incoming());
    run.ally-=amount;impact={at:performance.now(),amount,side:2,kind:""};
  }
  function tick(now){
    const hud=by("tempoHud");hud.hidden=!eligible();if(hud.hidden){resetClock();TempoDefense.pause();return;}
    const mode=resultingMode();pass(now);
    if(burst){
      const ratio=Math.max(0,1-burst.elapsed/burstMs);
      by("burstTime").value=ratio*burstMs;
      by("burstFuse").style.transform="scaleX("+ratio+")";
      BellSigil.draw(by("burstSigil"),burst.index,(now-burst.struck)/1000,reduceMotion);
      if(burst.index===3)return;
      const seconds=Math.max(0,Math.ceil((burstMs-burst.elapsed)/1000));
      if(span!==seconds){by("burstSeconds").textContent=seconds+"s";span=seconds;}
      if(burst.elapsed>=burstMs){endBurst("timeout");return;}
    }
    if(replyClock&&replyClock.elapsed>=replyClock.duration){
      const ready=replyClock;replyClock=null;
      // Consume before calling into the board. A second paint or input cannot replay the white move.
      if(mode==="waiting")ready.callback();
      return;
    }
    const playing=mode==="playing" && !burst;
    const notice=by("tempoNotice"),cue=playing?TempoDefense.cueText(saved.locale==="ko",incoming()):"";
    if(cue){if(notice.textContent!==cue)notice.textContent=cue;notice.dataset.guard="cue";}
    else if(notice.dataset.guard==="cue"){notice.textContent="";notice.dataset.guard="";}
    const percent=Math.max(0,1-spent/timeBudget);
    hud.dataset.side=mode==="waiting"?"white":"black";
    by("tempoBar").style.transform="scaleX("+(replyClock?Math.min(1,replyClock.elapsed/replyClock.duration):percent)+")";
    const label=playing?text("味方のターン","우리 턴!"):mode==="waiting"?text("白の応手","백 응수 준비"):run.clear?(run.hp?text("目標達成 · 敵が撤退","목표 달성 · 적 퇴각"):text("撃破","격파")):mode==="retry"?(run.ally?text("反撃","반격"):text("再起を待つ","재정비")):text("決着","결착");
    if(by("tempoTurn").textContent!==label)by("tempoTurn").textContent=label;
    const seconds=playing?Math.ceil(timeBudget*percent/1000)+"s":"";
    if(by("tempoSeconds").textContent!==seconds)by("tempoSeconds").textContent=seconds;
    const b=by("burstOpen");b.hidden=run.charge<2||run.used||!playing;
    if(!b.hidden)b.textContent=text("奥義 · 3問","필살기 · 3문제");
    const hp=run.hp+"/"+run.max;
    if(fieldView){fieldView.health(run);return;}
    if(by("guardHP").textContent!==hp)by("guardHP").textContent=hp;
    const enemy=Math.round(100*run.hp/run.max);
    if(by("enemyHP").style.width!==enemy+"%")meter("enemyHP",enemy);
    if(by("allyHP").style.width!==run.ally+"%")meter("allyHP",run.ally);
  }
  function render(c,w,h,time,hx,ex){
    tick(time);
    if(!eligible())return;
    const shattering=!fieldView&&Fortress.isHere()&&phase===2&&mission.kind==="capture"&&mission.targets.every(p=>!state.board[p]);
    if(critical&&!shattering){
      const age=(time-critical.at)/1000;
      if(age>=0&&age<.74)BoardFX.cutIn(c,w,h,age,1,fieldView?fieldView.kind():mission.kind,fieldView?fieldView.species():encounter().species,critical.kind==="burst"?text("暁の三連星","새벽의 삼연성"):text("会心の一手","크리티컬"));
    }
    if(impact)ImpactArt.number(c,w,h,(time-impact.at)/1000,impact,hx,ex);
    if(guardImpact)ImpactArt.number(c,w,h,(time-guardImpact.at-(reduceMotion?0:TempoDefense.delayMs))/1000,guardImpact,hx,ex);
  }
  // The three small-board skills have explicit goals. Every legal move meeting that goal is accepted.
  const templates=[
    {black:[7,11,17],white:[12,0],target:[12],kind:"capture"},
    {black:[6,8],white:[11,13],target:[6,8],kind:"link"},
    {black:[7,17],white:[12,24],target:[12],kind:"atari"}
  ];
  function shape(i,seed){
    const t=templates[(i+seed)%3],n=5,xf=p=>{
      let x=p%n,y=Math.floor(p/n);if(seed&4)x=n-1-x;
      for(let j=0;j<((seed+i)%4);j++)[x,y]=[n-1-y,x];
      return y*n+x;
    };
    const s=MatchRules.replay(n,[]);
    for(const p of t.black)s.board[xf(p)]=1;
    for(const p of t.white)s.board[xf(p)]=2;
    s.history=new Set([s.board.join("")]);return {state:s,kind:t.kind,target:t.target.map(xf)};
  }
  function solves(q,p){
    const after=MatchRules.move(q.state,p);if(!after||p<0)return false;
    const b=after.board,t=q.target[0];
    if(q.kind==="capture")return b[t]===0;
    if(b[t]===0)return false;
    const group=new Set([t]),libs=new Set();
    for(const stone of group)for(const n of MatchRules.near(5)[stone]){
      if(b[n]===b[t])group.add(n);else if(!b[n])libs.add(n);
    }
    return q.kind==="link"?group.has(q.target[1]):libs.size===1;
  }
  function board(){
    const q=burst.puzzle=shape(burst.index,burst.seed), btns=[];
    by("burstCount").textContent=(burst.index+1)+" / 3";by("burstCount").setAttribute("aria-label",text("封印","봉인")+" "+(burst.index+1)+" / 3");
    const goal={capture:text("印の白石を取る","표시한 백돌 따내기"),link:text("印の黒石をつなぐ","표시한 흑돌 연결"),atari:text("印の白石をアタリに","표시한 백돌 단수")};
    by("burstGoal").textContent=goal[q.kind];
    for(let p=0;p<25;p++){
      const b=document.createElement("button");b.type="button";b.dataset.point=p;b.dataset.stone=q.state.board[p];
      if(q.target.includes(p))b.dataset.target="true";
      b.setAttribute("aria-label",MatchRules.coordinate(5,p)+" "+[text("空点","빈 점"),text("黒","흑"),text("白","백")][q.state.board[p]]+(q.target.includes(p)?text(" 目標"," 목표"):""));
      b.disabled=!!q.state.board[p];b.onclick=()=>answer(p);btns.push(b);
    }
    by("burstPoints").replaceChildren(...btns);
    BurstAltar.draw(by("burstArt"),q,saved.gear[0],saved.gear[1]);
  }
  function loadSanctum(){
    const image=by("sanctumArt");if(!image.getAttribute("src"))image.src="./dawn-sanctum.webp";
  }
  function openBurst(){
    if(!eligible()||resultingMode()!=="playing"||run.used||run.charge<2||burst)return;
    pass();run.used=spentBurst=true;run.charge=0;
    burst={seed:(run.id*5+run.round*3)%24,index:0,elapsed:0,struck:-100000};
    by("burstDialog").dataset.result="";
    loadSanctum();
    by("burstType").textContent=text("鐘守の奥義","종지기의 필살기");
    by("burstTitle").textContent=text("暁の三連星","새벽의 삼연성");by("burstRule").textContent=text("十五秒。三つの正着で、暁の鐘を鳴らせ。","15초, 세 번의 정답으로 새벽종을 울려라.");
    by("burstBack").textContent=text("戦闘に戻る","전투로 돌아가기");
    board();by("burstDialog").showModal();if(fieldView){fieldView.openRite();fieldView.persist();}span=-1;resetClock();pass();tick(performance.now());
  }
  function endBurst(result){
    if(!burst)return;
    if(burst.index===3)result="win";
    burst=null;
    const dialog=by("burstDialog");if(dialog.open)dialog.close();
    if(result==="win"){
      run.crit=true;deal(52,false,"burst");if(fieldView)fieldView.strike();else CastMotion.strike(black);sound("bell");
    }else if(result!=="cancel")sound("bad");
    const status=by("tempoNotice");
    status.textContent=result==="win"?text("奥義発動","필살기 발동"):result==="timeout"?text("時間切れ","시간 종료"):result==="wrong"?text("不発","발동 실패"):"";
    if(fieldView){fieldView.closeRite();fieldView.persist();}resetClock();tick(performance.now());
  }
  function answer(p){
    if(!burst||burst.index===3)return;pass();
    if(burst.elapsed>=burstMs){endBurst("timeout");return;}
    if(!solves(burst.puzzle,p)){endBurst("wrong");return;}
    burst.struck=performance.now();burst.index++;
    BellSigil.draw(by("burstSigil"),burst.index,0,reduceMotion);
    if(burst.index===3){
      const completed=burst;by("burstDialog").dataset.result="win";by("burstCount").textContent="3 / 3";
      by("burstGoal").textContent=text("暁の鐘が響く","새벽종이 울린다");
      for(const b of by("burstPoints").children)b.disabled=true;
      setTimeout(()=>{if(burst===completed)endBurst("win");},reduceMotion?160:630);
      return;
    }
    sound(burst.index===1?"starOne":"starTwo");board();
  }
  // Session-only field health. The board owns its legal move history and validates it separately.
  function snapshot(){return run?{run:{...run},checkpoint:{...checkpoint},spent}:null;}
  function restore(data){
    if(!run||!data||!data.run||!data.checkpoint)return false;
    const valid=r=>r.id===run.id&&r.round===run.round&&r.count===run.count&&r.max===run.max&&
      ["hp","ally","charge","streak"].every(k=>Number.isInteger(r[k])&&r[k]>=0)&&r.hp<=r.max&&r.ally<=100&&r.charge<=2&&
      ["crit","used","clear"].every(k=>typeof r[k]==="boolean");
    if(!valid(data.run)||!valid(data.checkpoint)||!Number.isFinite(data.spent)||data.spent<0)return false;
    for(const k of ["hp","ally","charge","streak","crit","used","clear"]){run[k]=data.run[k];checkpoint[k]=data.checkpoint[k];}
    spentBurst=run.used;spent=data.spent;resetClock();return true;
  }
  document.addEventListener("visibilitychange",resetClock);
  by("burstOpen").onclick=openBurst;by("burstBack").onclick=()=>endBurst("cancel");
  by("burstDialog").addEventListener("close",()=>{if(burst)endBurst("cancel");});
  return {begin,leave,newTurn,prepareReply,attack,hit,block,mark,rewind,render,tick,snapshot,restore,shape,solves,speedDamage,openBurst,
    get status(){return run?{...run,spent,replyProgress:replyClock?replyClock.elapsed/replyClock.duration:null,impact:impact&&{...impact},guard:guardImpact&&{...guardImpact},defense:TempoDefense.status,burst:burst&&{...burst}}:null;}};
})();
