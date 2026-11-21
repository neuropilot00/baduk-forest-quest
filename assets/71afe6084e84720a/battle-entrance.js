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
    shot={canvas,board,caption,locks,elapsed:0,previous:performance.now(),field,images:new Map()};
  }
  document.addEventListener("visibilitychange",()=>{if(shot)shot.previous=null;});
  // World-space locomotion, based on the kind of animal. Birds fly down to
  // their perch and swimmers propel from the tail. Grounded feet swing in opposition.
  function gait(name,kind=""){
    if(/wing|bird|bat|날개|수리|올빼미|새|나방|나비|가마우지|날다람쥐|왜가리|잠자리|제비|박쥐|벌$|날치/.test(kind+" "+name))return "wing";
    if(/fin|coil|jet|bank|pulse|해마|메기|해파리|야츠메|흡착어|물고기|뱀장어|오징어|장어|잉어|송어|고래|물뱀|가오리|앵무조개/.test(kind+" "+name))return "swim";
    return "foot";
  }
  // Warp only the articulated bands around the hip, wing root or spine. The
  // original face, clothing, palette and contact scale come from the native art.
  const unit=92,cx=142,sole=160,W=284,H=182;
  function sprite(c,key,draw,x,y,size,body,kind,cycles,ready){
    const frame=ready?2:Math.floor(cycles*2)%2;
    const cacheKey=key+"/"+frame;
    let tile=shot.images.get(cacheKey);
    if(!tile){
      tile=document.createElement("canvas");tile.width=W;tile.height=H;
      const ink=tile.getContext("2d");ink.imageSmoothingEnabled=false;
      if(draw(ink,cx,sole,unit,frame) === false)return;
      shot.images.set(cacheKey,tile);
    }
    const a=Math.sin(cycles*Math.PI*2),s=size/unit;
    c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));c.scale(s,s);c.translate(-cx,-sole);
    if(ready){c.drawImage(tile,0,0);c.restore();return;}
    if(kind==="swim"){
      const hinge=cx+body*.13;
      c.drawImage(tile,0,0,hinge,H,0,0,hinge,H);
      c.transform(1,.16*a,0,1,0,-hinge*.16*a);
      c.drawImage(tile,hinge,0,W-hinge,H,hinge,0,W-hinge,H);
    }else if(kind==="wing"){
      const mid=sole-body*.60,lean=.23*a;
      c.drawImage(tile,0,mid,W,H-mid,0,mid,W,H-mid);
      // The two wing tips fold toward the breast on opposite slopes.
      for(const half of [0,1]){
        const left=half*cx,dir=half?1:-1;
        c.save();c.transform(1,0,dir*lean,1+.15*a,-dir*lean*mid,-.15*a*mid);
        c.drawImage(tile,left,0,cx,mid,left,0,cx,mid);c.restore();
      }
    }else{
      const hip=Math.round(sole-body*.38),length=H-hip;
      c.drawImage(tile,0,0,W,hip,0,0,W,hip);
      for(const half of [0,1]){
        const left=half*cx,step=(half?1:-1)*a,lean=step*.39,lift=Math.max(0,step)*.19;
        c.save();c.transform(1,0,lean,1-lift,-lean*hip,lift*hip);
        c.drawImage(tile,left,hip,cx,length,left,hip,cx,length);c.restore();
      }
    }
    c.restore();
  }
  function travel(ms,delay,w,ground,height,side,kind){
    const t=clamp((ms-delay)/(plant-delay));
    // Enter on a diagonal; the near boot follows the same baseline as the idle sprite.
    const path=t*(1.65-.65*t),cycles=t*2.75+delay*.002;
    const lift=kind==="wing"?Math.sin(Math.PI*t)*height*.19:kind==="swim"?Math.sin(cycles*Math.PI*2)*height*.033*Math.sin(Math.PI*t):Math.abs(Math.sin(cycles*Math.PI*2))*height*.027;
    const ready=t>=1;
    return {dx:(1-path)*w*side,ground:ground-(1-path)*height*.16-(ready?0:lift),
      cycles,ready};
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
        if(pos.ready)WorldScale.hero(c,x,y,heroH,1);
        else RoadPoses.draw(c,x,y,heroH,"walk",pos.cycles*560);
      }else{
        const geometry=WorldScale.geometry(actor.id,0,0,unit);
        const body=metric.bodyHeight*geometry.scale;
        shade(c,x,y,Math.max(2,body*heroH/unit*.23));
        sprite(c,"crew"+actor.id,(ink,xx,yy,hh,frame)=>{
          const g=WorldScale.geometry(actor.id,xx,yy,hh);
          return CrewArt.draw(ink,actor.id,xx,g.baseline,g.nominal,frame===2?5:0,frame);
        },x,y,heroH,body,kind,pos.cycles,pos.ready);
      }
    }
    const pack=typeof FoeParty!=="undefined"&&TempoCombat.foes?.length?TempoCombat.foes:null;
    const slots=pack?FoeParty.layout(w,h,ground,pack.length):[{x:foe.x,y:ground,height:foe.height}];
    for(const [i,slot] of slots.entries()){
      const member=pack?.[i],kind=gait(member?.name?.[1]||foe.name,member?"":foe.kind);
      const pos=travel(elapsed,55+i*95,w*.66,slot.y,slot.height,1,kind),x=slot.x+pos.dx,y=pos.ground;
      const paint=member?(ink,xx,yy,hh,frame)=>FoeParty.drawActor(ink,member,xx,yy,hh,frame===2?"tell":"idle",frame===1?.72:.12):foe.paint;
      shade(c,x,y,slot.height*.24);
      sprite(c,"foe"+i,paint,x,y,slot.height,unit*(foe.body||.75),kind,pos.cycles,pos.ready);
    }
    return true;
  }
  return {begin,draw,cancel,forget,get blocking(){return !!shot;}};
})();
