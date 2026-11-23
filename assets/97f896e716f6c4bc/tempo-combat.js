"use strict";
const TempoCombat=(()=>{
  const burstMs=15000;
  const text=(ja,ko)=>GameLanguage.pair([ja,ko],saved.locale);
  const by=id=>document.getElementById(id);
  let run=null,checkpoint=null,spent=0,previous=null,impact=null,critical=null,burst=null;
  let timeBudget=18000,turnLive=false,span=-1,spentBurst=false,activeClock="",replyClock=null;
  const hud=by("tempoHud"),home=document.createComment("expedition turn display");
  hud.before(home);
  let fieldView=null,guardImpact=null,scripted=false;
  let formation=[],memberCache=null,partyHit=null,action=null,guarded=false;
  const techniques=new Map();

  function foes(){
    if(!run||!formation.length)return [];
    if(!memberCache||memberCache.hp!==run.hp||memberCache.max!==run.max)
      memberCache={hp:run.hp,max:run.max,members:FoeParty.distribute(formation,run.hp,run.max)};
    return memberCache.members;
  }
  function focus(){return foes().find(m=>m.active);}
  function shownFoes(time){return partyHit&&time<partyHit.at?partyHit.before:foes();}
  function shownHealth(time){
    if(!run)return null;
    const incoming=impact?.side===2?impact:guardImpact;
    const pendingHeal=impact?.side===1&&time<impact.at?impact.heal||0:0;
    const ally=incoming&&time<incoming.at?incoming.before:run.ally-pendingHeal;
    const hp=impact?.side===1&&time<impact.at?impact.before:run.hp;
    return {hp,ally,max:run.max};
  }
  function targetSlot(now){
    if(partyHit&&now-partyHit.at<BattleActions.fallDuration)return partyHit.slots[0];
    return focus()?.slot??partyHit?.slots.at(-1)??0;
  }
  function report(receipt){
    if(!partyHit?.fallen.length)return receipt;
    const gone=partyHit.fallen.map(i=>localizedPair(foes()[i].name)).join(" · ");
    return receipt+" · "+gone+text(" 撃破"," 격파");
  }
  const position=()=>fieldView?SecondReach.inspect():{mission,state};
  const incoming=()=>run.hp<=run.max*.33?8:18;
  const foeName=()=>focus()?localizedPair(focus().name):fieldView?.enemyName()??by("enemyName").textContent;
  function acted(kind,side,helper=null,aid=0,recipient=null,foe=foeName(),silent=false){
    if(silent)return;
    action={kind,side,helper,aid,recipient,foe,at:performance.now()};
  }
  function damagePlan(amount,protector){
    const exposed=Math.min(run.ally,amount);
    const covered=protector===null?exposed:Math.min(run.ally,Math.max(1,amount-4));
    const mitigate=Math.max(0,exposed-covered);
    return {amount:exposed-mitigate,helper:mitigate?protector:null,mitigate};
  }
  function takeDamage(amount,kind,helper=null){
    const available=helper!==null&&!(run.aids&(1<<helper))?helper:null;
    const protector=kind==="counter"?(BattleActions.member(2,run.aids)??available):available;
    const hit=damagePlan(amount,protector);
    if(hit.helper!==null)run.aids|=1<<hit.helper;
    run.ally-=hit.amount;
    return hit;
  }
  const resultingMode=()=>fieldView?fieldView.mode():mode;
  function earnedTechniques(gained,now=performance.now()){
    for(const id of Crew.deployed()){
      if(!(gained&(1<<id))||!CrewArt.hasTechnique(id))continue;
      const busy=action&&(action.helper===id||action.recipient===id||action.cover===id);
      techniques.set(id,busy?Math.max(now,action.at+BattleActions.duration):now);
    }
  }
  function begin(id,round,count,reading,view=null){
    techniques.clear();
    fieldView=view;scripted=view?view.boss():EarlyGuardians.is(id)||id%10===9;
    if(view)view.mount(hud);else home.after(hud);
    const advancing=run?.id===id && round===run.round+1, retry=run?.id===id && run.round===round && checkpoint;
    const max=32*count;
    formation=FoeParty.plan(id,scripted,view?.species());memberCache=null;
    if(!advancing)partyHit=null;
    if(retry)run={...checkpoint,hp:run.hp,ally:run.ally||100,aids:run.aids||0,used:spentBurst||checkpoint.used};
    else if(!advancing){run={id,round,growth:PartyGrowth.current(saved.growth),hp:Math.max(16,max-32*round),max,ally:100,charge:round?1:0,streak:0,used:false,crit:false,clear:false};}
    run.round=round;run.count=count;if(!retry)run.aids=0;checkpoint={...run};spentBurst=run.used;
    by("tempoNotice").textContent="";impact=critical=guardImpact=action=null;guarded=false;burst=null;if(!retry)spent=0;timeBudget=18000+4000*Math.max(0,reading-1);newTurn();
  }
  function leave(){
    techniques.clear();
    if(run?.clear)BattleEntrance.forget(run.id);BattleEntrance.cancel();FieldCoaching.dismiss("feedback");FieldCoaching.dismiss("reachStatus");
    if(burst){burst=null;if(by("burstDialog").open)by("burstDialog").close();}
    formation=[];memberCache=partyHit=action=null;guarded=false;TempoDefense.clear();guardImpact=null;hud.hidden=true;home.after(hud);fieldView=null;run=null;checkpoint=burst=impact=critical=replyClock=null;resetClock();}
  function resetClock(){previous=null;activeClock="";}
  function newTurn(){guarded=false;if(run)TempoDefense.arm(run.id,run.round,position());replyClock=null;turnLive=true;span=-1;resetClock();}
  function eligible(){return !!run && (typeof FieldBook==="undefined"||!FieldBook.waiting(position().mission)) && (fieldView?fieldView.active():!trial && journey() && by("voyage").hidden && !by("battleLayout").hidden);}
  function pass(now=performance.now()){
    const blocking=fieldView?"dialog[open]:not(#burstDialog):not(#reachBattleDialog):not(#reachMap)":"dialog[open]:not(#burstDialog)";
    const field=!BattleEntrance.blocking && eligible() && by("titleScene").hidden && document.readyState==="complete" && !document.hidden && !document.querySelector(blocking) && by("gearDialog").hidden;
    const mode=resultingMode();
    const kind=field && burst && by("burstDialog").open?"burst":field && !burst && mode==="playing" && turnLive?"turn":field && replyClock && mode==="waiting"?"reply":"";
    TempoDefense.clock(kind==="turn",now);
    if(kind && kind===activeClock && previous!==null){
      const duration=Math.max(0,now-previous);
      if(kind==="turn")spent+=duration;else if(kind==="reply")replyClock.elapsed+=duration;else burst.elapsed+=duration;
    }
    previous=now;activeClock=kind;
  }
  function replyDamage(reply){
    return Math.min(reply?.state?.captured?.length?10:5,incoming());
  }
  function prepareReply(duration,callback,acceptedReply=null){
    const pending=acceptedReply?.point>=0&&!guarded?replyDamage(acceptedReply):0;
    replyClock={duration,elapsed:0,callback,pending};resetClock();pass();
  }
  // Time is measured over the entire puzzle, including each Black decision, excluding White's turn.
  function speedDamage(ms,windowMs){return 16+Math.round(34*Math.max(0,1-Math.max(0,ms)/windowMs));}
  function extraProblem(id,round,phases){
    // Read-only reconstruction for older checkpoints and release comparison tools.
    const {course,serial,liberty}=FieldBook.plan(id,round,phases),board=exercise(course,serial);
    return liberty?{...board,kind:"liberty"}:board;
  }
  function reserveFor(final){return scripted?5*Math.max(0,run.count-run.round-(final?1:0)):0;}
  function creditedDamage(amount,final){return Math.min(amount,Math.max(0,run.hp-reserveFor(final)));}
  function deal(amount,final,finisher){
    const actual=creditedDamage(amount,final);
    const before=foes(),hp=run.hp;
    const at=action.at+BattleActions.impactDelay(reduceMotion);
    run.hp-=actual;impact={at,amount:actual,side:1,kind:finisher,before:hp,synchronized:true};
    if(actual&&before.length){
      const after=foes(),slots=before.filter(m=>after[m.slot].hp<m.hp).map(m=>m.slot);
      partyHit={at,before,round:run.round,slots,fallen:slots.filter(i=>after[i].hp===0)};
    }
    if(finisher)critical={at:impact.at,kind:finisher};
    run.clear=scripted?final&&run.round===run.count-1:run.hp===0;
    return actual;
  }
  function attackPlan(kind,captured=false){
    const quick=spent<=timeBudget*.32;
    const critical=quick&&run.streak>=2&&!run.crit;
    const base=PartyGrowth.offense(run.growth,speedDamage(spent,timeBudget)+(critical?12:0));
    const support=["escape","link","liberty"].includes(kind)&&run.ally<100?BattleActions.member(0,run.aids):null;
    if(support!==null)return {quick,critical,base,aid:Math.min(6,100-run.ally),helper:support,kind:"remedy"};
    const striker=["atari","read","capture"].includes(kind)||captured?BattleActions.member(1,run.aids):null;
    const extra=striker===null?0:Math.min(6,creditedDamage(base+6,true)-creditedDamage(base,true));
    return {quick,critical,base,aid:extra,helper:extra?striker:null,kind:extra?"follow":"attack"};
  }
  function forecast(){
    const raw=TempoDefense.preview(incoming());
    if(raw!==null){
      const hit=damagePlan(PartyGrowth.block(run.growth,raw),BattleActions.member(2,run.aids));
      return text("防御で "+hit.amount+" ダメージ","지금 막으면 "+hit.amount+" 피해")+
        (hit.mitigate?text(" · かばう −"," · 가로막기 −")+hit.mitigate:"");
    }
    const mission=position().mission,plan=attackPlan(mission.kind);
    const damage=creditedDamage(plan.base+(plan.kind==="follow"?plan.aid:0),true);
    let result=text("今なら"+damage+"ダメージ","지금 풀면 "+damage+" 피해");
    if(plan.kind==="follow")result+=text(" · 追撃"+plan.aid+"込み"," · 추격 "+plan.aid+" 포함");
    if(plan.kind==="remedy")result+=text(" · 回復 HP＋"," · 회복 HP +")+plan.aid;
    if(mission.lureCapture)result+=text(" · 誘い取りあり"," · 유인 포획 보너스");
    return result;
  }
  function attack(accepted,done,receipt){
    if(!eligible())return;
    pass();turnLive=false;
    const defending=!!TempoDefense.status;
    const defended=TempoDefense.resolve(accepted,position().state,incoming());
    if(defended){
      const before=run.ally;
      const loss=takeDamage(PartyGrowth.block(run.growth,defended.amount),"counter");
      defended.amount=loss.amount;guarded=true;
      acted(loss.helper===null?"guard":"protect",2,loss.helper,loss.mitigate,loss.helper);
      guardImpact={...defended,before,at:action.at+BattleActions.impactDelay(reduceMotion),synchronized:true};
      if(fieldView)fieldView.guard();else CastMotion.strike(white);
      by("tempoNotice").textContent=TempoDefense.resultText(saved.locale==="ko",guardImpact);
    }else if(by("tempoNotice").dataset.guard==="cue")by("tempoNotice").textContent="";
    by("tempoNotice").dataset.guard="";
    if(!accepted){run.streak=0;return;}
    if(defending&&defended){
      impact=null;critical=null;
      run.clear=scripted&&done&&run.round===run.count-1&&run.ally>0;
      return;
    }
    if(!done)return;
    const mission=position().mission;
    const captured=receipt?.before?.some((stone,i)=>stone===2&&!receipt.after[i]);
    const plan=attackPlan(mission.kind,captured),foe=foeName();
    run.streak=plan.quick?run.streak+1:0;
    if(plan.critical)run.crit=true;
    run.charge=Math.min(2,run.charge+1);loadSanctum();
    if(plan.kind==="remedy")run.ally+=plan.aid;
    if(plan.helper!==null)run.aids|=1<<plan.helper;
    const base=plan.base+(plan.kind==="follow"?plan.aid:0);
    const lured=mission.lureCapture&&receipt?.before?
      receipt.before.filter((stone,p)=>stone===2&&mission.board[p]!==2&&!receipt.after[p]).length:0;
    const lureDamage=Math.min(lured,2)*(mission.lureCapture??0);
    const lureBonus=creditedDamage(base+lureDamage,done)-creditedDamage(base,done);
    acted(plan.kind,1,plan.helper,plan.aid,null,foe);
    const damage=deal(base+lureBonus,done,plan.critical?"critical":"");
    if(plan.kind==="remedy")impact.heal=plan.aid;
    const result=by("tempoNotice");
    const seconds=(spent/1000).toFixed(1);
    const outgoing=text(seconds+"秒 · "+damage+"ダメージ",seconds+"초 · "+damage+" 피해");
    const lure=lureBonus?text(" · 誘い取り＋"," · 유인 포획 +")+lureBonus:"";
    result.textContent=report(outgoing+lure);
    return {lured,lureBonus};
  }
  function relay(current,mission,move,candidates){
    if(!eligible()||guarded)return current;
    const strategy=BattleActions.relay(saved.roster,run.aids,current,mission,move,candidates);
    if(!strategy)return current;
    run.aids|=(1<<strategy.front)|(1<<strategy.middle);
    acted("relay",1,strategy.middle);
    action.cover=strategy.front;action.previous=strategy.defaultReply.point;action.reply=strategy.reply.point;
    by("tempoNotice").textContent=BattleActions.allyName(strategy.front)+text(" と ","·")+BattleActions.allyName(strategy.middle)+
      text("が白の応手をずらした。","가 백의 응수를 돌렸어.");
    return {...strategy.reply,relay:{front:strategy.front,middle:strategy.middle,
      defaultReply:strategy.defaultReply,normal:strategy.normal,actual:strategy.actual}};
  }
  function mark(){return run?{streak:run.streak}:null;}
  function rewind(mark,reading){
    if(!mark||!run)return;
    techniques.clear();
    run.streak=mark.streak;impact=critical=null;newTurn(reading);
  }
  function block(helper=null){
    if(!eligible())return;
    if(helper!==null)run.aids|=1<<helper;
    acted(helper===null?"guard":"protect",2,helper,0,helper);
    impact={at:action.at+BattleActions.impactDelay(reduceMotion),amount:0,side:2,kind:"guard",before:run.ally,synchronized:true};
  }
  function hit(reply=null,{continued=false,silent=false,protector=null}={}){
    if(!eligible()||guarded||!run.ally)return;
    const before=run.ally;
    const loss=takeDamage(continued?replyDamage(reply):incoming(),"counter",protector);
    acted(loss.helper===null?"counter":"protect",2,loss.helper,loss.mitigate,loss.helper,foeName(),silent);
    impact={at:silent?performance.now():action.at+BattleActions.impactDelay(reduceMotion),
      amount:loss.amount,side:2,kind:loss.helper===null?"":"guard",before,synchronized:true};
    return loss;
  }
  function tick(now){
    const hud=by("tempoHud");hud.hidden=BattleEntrance.blocking||!eligible();if(hud.hidden){resetClock();TempoDefense.pause();return;}
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
    let label;
    if(playing)label=cue?text("防御の番","방어 차례"):text("味方のターン","우리 턴!");
    else if(mode==="waiting")label=text("白の応手","백 응수 준비");
    else if(mode==="phase"&&run.hp>0)label=text("敵が構え直す","적이 자세를 고쳐 잡는다");
    else if(run.clear)label=scripted?text("決戦へ","결전으로"):text("撃破","격파");
    else if(mode==="retry")label=run.ally?text("反撃","반격"):text("再起を待つ","재정비");
    else label=text("次の局面へ","다음 국면으로");
    const targets=shownFoes(now),attacker=targets.find(m=>m.active);
    if(attacker&&mode==="retry"&&run.ally>0)label=text("反撃 · ","반격 · ")+localizedPair(attacker.name);
    if(attacker&&mode==="phase"&&partyHit?.round===run.round&&partyHit.fallen.length)label=text("次 · ","다음 · ")+localizedPair(attacker.name);
    if(attacker&&(playing||mode==="waiting"))label=(mode==="waiting"||cue?text("攻勢 · ","공격 · "):text("標的 · ","표적 · "))+localizedPair(attacker.name);
    const roster=targets.map(m=>localizedPair(m.name)+" "+m.hp+"/"+m.max).join(", ");
    const description=targets.length?label+" · "+roster:label;
    if(by("tempoTurn").getAttribute("aria-label")!==description)by("tempoTurn").setAttribute("aria-label",description);
    if(by("tempoTurn").textContent!==label)by("tempoTurn").textContent=label;
    const focused=BattleActions.phase(action,now,reduceMotion),actor=by("battleActor");
    if(focused&&!action.heard)BattleActions.contactSound(action,now,reduceMotion,
      !document.hidden&&!document.querySelector("dialog[open]:not(#reachBattleDialog)"));
    const actionLabel=focused?BattleActions.announcement(action):"";
    if(actor.textContent!==actionLabel)actor.textContent=actionLabel;
    actor.toggleAttribute("data-illustrated-status",!!focused&&action.helper===null);
    const seconds=playing?forecast():"";
    if(by("tempoSeconds").textContent!==seconds)by("tempoSeconds").textContent=seconds;
    const b=by("burstOpen");b.hidden=run.charge<2||run.used||!playing||run.hp<=reserveFor(false);
    if(!b.hidden)b.textContent=text("奥義 · 3問","필살기 · 3문제");
    const health=shownHealth(now),{hp:visibleEnemy,ally:visibleAlly}=health;
    const hp=visibleEnemy+"/"+run.max;
    if(fieldView){fieldView.health(health);return;}
    showPartyHealth(by("allyVital"),visibleAlly);
    if(by("guardHP").textContent!==hp){
      by("guardHP").textContent=hp;by("enemyHP").parentElement.setAttribute("aria-valuetext",hp);
    }
    const enemy=Math.round(100*visibleEnemy/run.max);
    if(by("enemyHP").style.width!==enemy+"%")meter("enemyHP",enemy);
    if(by("allyHP").style.width!==visibleAlly+"%")meter("allyHP",visibleAlly);
  }
  function render(c,w,h,time,hx,ex,actors=[],allyGround=h*.84,enemyGround=h*.84,scale=h*.50){
    tick(time);
    if(!eligible())return;
    const shattering=!fieldView&&Fortress.isHere()&&phase===2&&mission.kind==="capture"&&mission.targets.every(p=>!state.board[p]);
    if(critical&&!shattering){
      const age=(time-critical.at)/1000;
      if(typeof BattlePixelFX!=="undefined")BattlePixelFX.finisher(c,critical.kind,age,ex,enemyGround-scale*.43,scale,reduceMotion);
      if(age>=0&&age<.74)BoardFX.cutIn(c,w,h,age,1,fieldView?fieldView.kind():mission.kind,fieldView?fieldView.species():encounter().species,critical.kind==="burst"?text("暁の三連星","새벽의 삼연성"):text("会心の一手","크리티컬"));
    }
    BattleActions.effects(c,time,action,actors,hx,allyGround,ex,enemyGround,scale);
    const recipient=actors.find(m=>m.id===action?.recipient)?.x??hx;
    if(impact)ImpactArt.number(c,w,h,(time-impact.at)/1000,impact,recipient,ex);
    if(guardImpact)ImpactArt.number(c,w,h,(time-guardImpact.at)/1000,guardImpact,recipient,ex);
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
    const image=by("sanctumArt");if(!image.getAttribute("src"))image.src="../eaecd090510d7805/dawn-sanctum.webp";
  }
  function openBurst(){
    if(!eligible()||resultingMode()!=="playing"||run.used||run.charge<2||burst||run.hp<=reserveFor(false))return;
    pass();run.used=spentBurst=true;run.charge=0;
    burst={seed:(run.id*5+run.round*3)%24,index:0,elapsed:0,struck:-100000};
    by("burstDialog").dataset.result="";
    loadSanctum();
    by("burstType").textContent=text("鐘守の奥義","종지기의 필살기");
    by("burstTitle").textContent=text("暁の三連星","새벽의 삼연성");by("burstRule").textContent=text("十五秒で三問。最初の着手前なら溜めは戻る。","15초에 세 문제. 첫 착수 전에 닫으면 충전을 돌려받아요.");
    by("burstBack").textContent=text("溜めを戻して中止","충전 돌려받고 닫기");
    board();by("burstDialog").showModal();if(fieldView){fieldView.openRite();fieldView.persist();}else checkpointStand();span=-1;resetClock();pass();tick(performance.now());
  }
  function endBurst(result){
    if(!burst)return;
    pass();
    if(burst.index===3)result="win";
    else if(burst.elapsed>=burstMs)result="timeout";
    const refund=result==="cancel"&&burst.index===0;
    if(refund){run.charge=2;run.used=spentBurst=false;}
    burst=null;
    const dialog=by("burstDialog");if(dialog.open)dialog.close();
    if(result==="win"){
      run.crit=true;acted("attack",1);deal(52,false,"burst");if(fieldView)fieldView.strike();else CastMotion.strike(black);sound("bell");
    }else if(result!=="cancel")sound("bad");
    const status=by("tempoNotice");
    status.textContent=result==="win"?report(text("奥義発動","필살기 발동")):result==="timeout"?text("時間切れ","시간 종료"):result==="wrong"?text("不発","발동 실패"):refund?text("奥義の溜めが戻ったよ。","필살기 충전을 돌려받았어요."):text("奥義を中断。溜めは使いました。","필살기를 중단해 충전량을 썼어요.");
    if(fieldView)fieldView.closeRite();
    if(result==="win"&&run.clear&&!scripted){
      if(fieldView)fieldView.knockout();else finish(false);
    }
    if(fieldView)fieldView.persist();else checkpointStand();
    resetClock();tick(performance.now());
  }
  function answer(p){
    if(!burst||burst.index===3)return;pass();
    if(burst.elapsed>=burstMs){endBurst("timeout");return;}
    if(!solves(burst.puzzle,p)){endBurst("wrong");return;}
    burst.struck=performance.now();burst.index++;
    by("burstBack").textContent=text("溜めを消費して中止","충전 소모하고 중단");
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
  function nextSnapshot(){
    if(!run)return null;
    const next={...run,round:run.round+1,aids:0};
    return {run:next,checkpoint:{...next},spent:0};
  }
  function snapshot(){return run?{run:{...run},checkpoint:{...checkpoint},spent,pendingReply:replyClock?.pending??0}:null;}
  function restore(data){
    if(!run||!data||!data.run||!data.checkpoint)return false;
    const valid=r=>r.id===run.id&&r.round===run.round&&r.count===run.count&&r.max===run.max&&
      ["hp","ally","charge","streak"].every(k=>Number.isInteger(r[k])&&r[k]>=0)&&r.hp<=r.max&&r.ally<=100&&r.charge<=2&&
      ["crit","used","clear"].every(k=>typeof r[k]==="boolean");
    if(!valid(data.run)||!valid(data.checkpoint)||!Number.isFinite(data.spent)||data.spent<0)return false;
    for(const k of ["hp","ally","charge","streak","crit","used","clear"]){run[k]=data.run[k];checkpoint[k]=data.checkpoint[k];}
    run.growth=PartyGrowth.pack(PartyGrowth.read(data.run.growth));checkpoint.growth=run.growth;
    run.aids=Number.isInteger(data.run.aids)&&data.run.aids>=0&&data.run.aids<2**30?data.run.aids:0;checkpoint.aids=run.aids;
    if(run.ally&&[5,8,10].includes(data.pendingReply))takeDamage(data.pendingReply,"counter");
    spentBurst=run.used;spent=data.spent;memberCache=partyHit=null;resetClock();return true;
  }
  document.addEventListener("visibilitychange",resetClock);
  by("burstOpen").onclick=openBurst;by("burstBack").onclick=()=>endBurst("cancel");
  by("burstDialog").addEventListener("close",()=>{if(burst)endBurst("cancel");});
  return {begin,leave,newTurn,targetSlot,shownFoes,shownHealth,extraProblem,prepareReply,attack,hit,block,relay,mark,rewind,render,tick,snapshot,nextSnapshot,restore,shape,solves,speedDamage,openBurst,earnedTechniques,
    get foes(){return foes();},get focus(){return focus();},get partyHit(){return partyHit;},get action(){return action;},get techniques(){return techniques;},
    get status(){return run?{...run,spent,replyProgress:replyClock?replyClock.elapsed/replyClock.duration:null,impact:impact&&{...impact},guard:guardImpact&&{...guardImpact},defense:TempoDefense.status,burst:burst&&{...burst}}:null;}};
})();
