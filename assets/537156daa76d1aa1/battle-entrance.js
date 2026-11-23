"use strict";
// Field encounters share a short approach along the ground plane. The board and
// its clocks remain untouched until both sides have planted their feet.
const BattleEntrance=(()=>{
  const duration=1320,plant=975;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const by=id=>document.getElementById(id);
  let shot=null;
  const sessionKey=()=>CampaignSlots.session("bfq-entrance.v1");
  const token=id=>CampaignSlots.id+"/"+id;
  function cancel(){
    if(!shot)return;
    for(const node of shot.locks)node.inert=false;
    shot.board.removeAttribute("aria-busy");
    delete shot.board.parentElement.dataset.arrival;delete shot.canvas.dataset.entrance;
    shot.caption.remove();shot=null;
  }
  function forget(id){
    try{if(sessionStorage.getItem(sessionKey())===token(id))sessionStorage.removeItem(sessionKey());}catch{}
  }
  function begin(id,field,resumed=false){
    cancel();
    CrewArt.preload(Crew.travelers());
    const owner=token(id);
    let seen=false;
    try{seen=sessionStorage.getItem(sessionKey())===owner;sessionStorage.setItem(sessionKey(),owner);}catch{}
    if(seen||resumed||reduceMotion)return;
    const ids=field?["reachPoints","reachHint","reachReset","reachPass"]:["points","hint","reset","fieldTools"];
    const board=by(ids[0]),canvas=by(field?"reachScene":"battle"),locks=ids.map(by).filter(n=>n&&!n.inert);
    for(const n of locks)n.inert=true;
    const caption=document.createElement("span");caption.className="arrival-caption";caption.setAttribute("role","status");
    board.after(caption);caption.textContent=localizedPair(["隊列を整えています…","대형을 갖추는 중…"]);
    board.parentElement.dataset.arrival="walking";
    board.setAttribute("aria-busy","true");canvas.dataset.entrance="walk";by("tempoHud").hidden=true;
    shot={canvas,board,caption,locks,elapsed:0,previous:performance.now(),field};
  }
  document.addEventListener("visibilitychange",()=>{if(shot)shot.previous=null;});
  // World-space locomotion, based on the kind of animal. Birds fly down to
  // their perch and swimmers propel from the tail. Grounded feet swing in opposition.
  function gait(name,kind=""){
    if(/wing|bird|bat|날개|수리|올빼미|새|나방|나비|가마우지|날다람쥐|왜가리|잠자리|제비|박쥐|벌$|날치/.test(kind+" "+name))return "wing";
    if(/fin|coil|jet|bank|pulse|해마|메기|해파리|야츠메|흡착어|물고기|뱀장어|오징어|장어|잉어|송어|고래|물뱀|가오리|앵무조개/.test(kind+" "+name))return "swim";
    return "foot";
  }
  function travel(ms,delay,w,ground,height,side,kind){
    const t=clamp((ms-delay)/(plant-delay));
    // Enter on a diagonal; the near boot follows the same baseline as the idle sprite.
    const path=t*(1.65-.65*t),cycles=t*2.75+delay*.002;
    const lift=kind==="wing"?Math.sin(Math.PI*t)*height*.19:kind==="swim"?Math.sin(cycles*Math.PI*2)*height*.033*Math.sin(Math.PI*t):Math.abs(Math.sin(cycles*Math.PI*2))*height*.027;
    const ready=t>=1;
    return {dx:(1-path)*w*side,ground:ground-(1-path)*height*.16-(ready?0:lift),
      cycles,ready,progress:t};
  }
  function shade(c,x,y,r){
    c.fillStyle="#152c2a60";c.beginPath();c.ellipse(x,y,r,Math.max(1,r*.15),0,0,2*Math.PI);c.fill();
  }
  function draw(c,canvas,w,h,ground,heroX,heroH,left,right,depth,foe,time){
    if(!shot||shot.canvas!==canvas)return false;
    const modal=Boolean(document.querySelector(shot.field?"dialog[open]:not(#reachMap):not(#reachBattleDialog)":"dialog[open]"));
    const paused=document.hidden||modal||!by("gearDialog").hidden;
    if(!paused&&shot.previous!==null)shot.elapsed+=Math.max(0,time-shot.previous);
    shot.previous=paused?null:time;
    const elapsed=shot.elapsed;
    if(elapsed>=duration){cancel();return false;}
    canvas.dataset.entrance=elapsed<plant?"walk":"ready";
    // Formation uses the same screen-safe contact points as the standing actors.
    const crew=Crew.formation(left,right,ground,depth);
    crew.push({id:-1,x:heroX,ground});
    for(const [n,actor] of crew.sort((a,b)=>a.ground-b.ground||a.x-b.x).entries()){
      const leader=actor.id===-1,metric=leader?null:CrewMetrics.rows[actor.id],kind=leader?"foot":gait(metric.species,metric.kind);
      const pos=travel(elapsed,leader?0:70+n*36,w*.72,actor.ground,heroH,-1,kind);
      const x=actor.x+pos.dx,y=pos.ground;
      if(leader){
        shade(c,x,y,heroH*.23);
        const cel=pos.ready?6:26+Math.floor(pos.cycles*8)%8;
        WorldScale.hero(c,x,y,heroH,pos.ready?1:0,cel);
      }else{
        const body=metric.bodyHeight*WorldScale.geometry(actor.id,0,0,heroH).scale;
        shade(c,x,y,Math.max(2,body*.23));
        const cel=CrewArt.hasMotion(actor.id)?(pos.ready?17:8+Math.floor(pos.cycles*8)%8):undefined;
        WorldScale.draw(c,actor.id,x,y,heroH,pos.ready?5:0,Math.floor(pos.cycles*2),cel);
      }
    }
    const pack=typeof FoeParty!=="undefined"&&TempoCombat.foes?.length?TempoCombat.foes:null;
    const slots=pack?FoeParty.layout(w,h,ground,pack.length):[{x:foe.x,y:ground,height:foe.height}];
    for(const [i,slot] of slots.entries()){
      const member=pack?.[i],kind=gait(member?.name?.[1]||foe.name,member?"":foe.kind);
      const pos=travel(elapsed,55+i*95,w*.66,slot.y,slot.height,1,kind),x=slot.x+pos.dx,y=pos.ground;
      const beat=pos.cycles%1;
      const cel=pos.ready?6:pos.progress<.72?26+Math.floor(beat*4):30+Math.min(3,Math.floor((pos.progress-.72)/.28*4));
      shade(c,x,y,slot.height*.24);
      if(member)FoeParty.drawActor(c,member,x,y,slot.height,pos.ready?"tell":"idle",beat,undefined,cel);
      else foe.paint(c,x,y,slot.height,pos.ready?2:Math.floor(beat*2),cel);
    }
    return true;
  }
  return {begin,draw,cancel,forget,get blocking(){return !!shot;}};
})();
