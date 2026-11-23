"use strict";
const ExpeditionCast=(()=>{
  const sheet=new Image();sheet.src="../eaecd090510d7805/forest-cast.png";
  const fauna=new Image();fauna.src="../eaecd090510d7805/field-fauna.png";
  const partnerFrames=[null,4,5,1,7];
  function frame(c,id,x,y,height,angle=0,alpha=1,flip=false){
    if(!sheet.naturalWidth)return;
    c.save();c.translate(Math.round(x),Math.round(y));c.rotate(angle);c.scale(flip?-1:1,1);
    c.globalAlpha=alpha;c.imageSmoothingEnabled=false;
    c.drawImage(sheet,id%3*144,Math.floor(id/3)*144,144,144,-height/2,-height*.958,height,height);c.restore();
  }
  function foe(c,id,x,y,height,angle=0,alpha=1,pose=0,fieldBattle=false,command){
    if(FaunaMotion.draw(c,{id,boss:false,fieldBattle,original:sheet,x,y,height,angle,alpha,pose,command,reduced:reduceMotion,sheet:fauna,poses:CastMotion.poses}))return;
    if(id===0&&CastMotion.draw(c,1,x,y,height*1.05,pose,alpha))return;
    if(!fauna.naturalWidth)return;
    const step=pose||(!reduceMotion&&Math.floor(performance.now()/(310+id%7*29))%4===1?1:0);
    const scale=height*(id<8?1.12:1.18);
    c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));c.rotate(angle);c.globalAlpha=alpha;
    c.drawImage(fauna,((id%5)*4+step)*96,Math.floor(id/5)*96,96,96,-scale/2,-scale*93/96,scale,scale);c.restore();
  }
  function guardian(c,rank,x,y,height,angle=0,alpha=1,pose=0,fieldBattle=false,command){
    if(FaunaMotion.draw(c,{id:rank,boss:true,fieldBattle,x,y,height,angle,alpha,pose,command,reduced:reduceMotion,sheet:fauna,poses:CastMotion.poses}))return;
    if(rank===0&&CastMotion.draw(c,2,x,y,height,pose,alpha))return;
    if(rank<7){frame(c,[8,1,6,7,0,2,3][rank],x,y,height*1.23,angle,alpha);return;}
    // The final guardian has its own pose atlas in FaunaMotion.
  }
  function party(c,id,x,y,size,angle=0,step=0,pose=0){
    if(id){const nativeHeights=[0,102,82,121,129];frame(c,partnerFrames[id],x,y,size*144/nativeHeights[id],angle,1,true);return;}
    if(CastMotion.draw(c,0,x,y,size,pose))return;
    if(!cast[0].naturalWidth)return;
    c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));c.rotate(angle);
    c.drawImage(cast[0],(step%8)*144,0,144,136,-size*.53,-size*.94,size*1.06,size);c.restore();
  }
  function companion(c,id,x,y,heroHeight,angle=0){
    if(!id)return;
    const pose=CastMotion.crewPhase(),beat=reduceMotion?0:Math.floor(performance.now()/240)%2;
    return WorldScale.draw(c,id-1,x,y,heroHeight,pose,beat);
  }
  return {sheet,fauna,foe,guardian,party,companion};
})();
const WorldMap=(()=>{
  const cache=new Map(),viewport=el("mapViewport"),world=el("mapWorld");
  let parked=null,shown=-1,trip=null,physical=null,focusId=null,frameId=0,heading=0;
  function paintGround(rank){
    if(shown===rank)return;
    shown=rank;
    const painting=MapArt.illustration(rank);
    if(!painting.naturalWidth&&!cache.has(rank)){
      cache.set(rank,MapArt.terrain(rank));
      if(!painting.complete)painting.addEventListener("load",()=>{
        if(shown===rank){shown=-1;paintGround(rank);}
      },{once:true});
    }
    const art=painting.naturalWidth?painting:cache.get(rank),land=el("worldLand");
    land.width=art.width;land.height=art.height;
    if(art===painting)land.dataset.illustrated=Atlas.chapters[rank].land;
    else delete land.dataset.illustrated;
    land.getContext("2d").drawImage(art,0,0);
  }
  ScenicArt.mapReady.then(loaded=>{
    if(!loaded)return;
    cache.clear();if(shown>=0){const rank=shown;shown=-1;paintGround(rank);}
  });
  function camera(y){viewport.scrollTop=Math.max(0,y/652*world.clientHeight-viewport.clientHeight*.43);}
  function targets(rank,selected,here){
    const ch=Atlas.chapters[rank],pending=MapJourney.pending();
    el("waypoints").replaceChildren(...ch.sites.map(([x,y],n)=>{
      const id=rank*20+n,b=document.createElement("button"),pin=document.createElement("i");
      b.type="button";b.dataset.site=id;b.style.left=x/384*100+"%";b.style.top=y/652*100+"%";
      const locked=id>saved.expedition,done=id<saved.expedition;
      b.className="map-stop "+(locked?"closed":done?"cleared":"open")+(id===here?" here":"");
      b.setAttribute("aria-current",id===here?"location":"false");b.setAttribute("aria-pressed",String(id===selected));
      b.setAttribute("aria-label",campaignTitle(id)+" · "+localizedPair(Voyage.places[id])+(EarlyGuardians.is(id)?localizedPair([" · 精鋭戦"," · 정예전"]):"")+" · "+t(locked?"locked":done?"cleared":"available"));
      const gate=n===6||n===9||n===19;
      if(gate){const sign=document.createElement("span");sign.className=n===19?"gate-sign keep":"gate-sign";sign.setAttribute("aria-hidden","true");b.append(sign);
        b.setAttribute("aria-label",b.getAttribute("aria-label")+" · "+localizedPair(n===19?["地方の主","지역 보스"]:["中ボス","중간 보스"]));}
      if(locked===false&&!done)b.classList.add("route-destination");
      pin.setAttribute("aria-hidden","true");pin.textContent=locked?"":done?"✓":EarlyGuardians.is(id)?"✦":"◆";b.append(pin);
      MapPlaceArt.paint(b,id,!locked,done);
      if(pending!==null&&id===pending+1)MapJourney.mark(b);
      b.onclick=()=>pick(b,id,locked);return b;
    }));
    el("worldLabels").replaceChildren(...ch.landmarks.filter(p=>p[3]).map(([x,y,,pair])=>{
      const label=document.createElement("span");label.textContent=localizedPair(pair);
      label.style.left=x/384*100+"%";label.style.top=Math.max(11,y-36)/652*100+"%";return label;
    }));
  }
  function pick(button,id,locked){
    if(trip)return;
    const next=button.hasAttribute("data-travel-next");
    SiteVisit.tap(button,()=>{
      // Keep the physical chapter exit under the finger until the second tap.
      if(!(next&&id%20===0))openMap(id,false,true);
    },locked?null:()=>{
      if(next){depart();return;}
      const start=parked??MapJourney.pending()??mapLocation();
      const arrive=()=>{parked=id;openMap(id,false,true);SiteVisit.prepare(id);};
      if(start===id)arrive();else walk(start,arrive,id);
    });
  }
  function actors(rank,point,walking=false,tick=0){
    let beat=0;
    if(walking&&trip){
      const before=locate(trip,Math.max(0,trip.f-.012)),after=locate(trip,Math.min(1,trip.f+.012));
      if(before.rank===after.rank)heading=CastMotion.direction(after.point[0]-before.point[0],after.point[1]-before.point[1]);
      if(!reduceMotion)beat=Math.floor(tick/118)%4;
    }
    physical={rank,point:[...point],heading,beat};const c=sceneLayer(el("worldActors"),384,652);
    c.clearRect(0,0,384,652);
    const [x,y]=point;
    function shadow(a,b,w){c.fillStyle="#293a32aa";c.fillRect(a-w,b-2,w*2,3);}
    const from=trip?.from??MapJourney.pending();
    if(from!==null&&Math.floor(from/20)===rank){const ch=Atlas.chapters[rank];
      MapJourney.trace(c,from%20===19?ch.departure.points:ch.edges[from%20].points);
    }else if(from!==null&&from%20===19&&rank===Math.floor(from/20)+1)MapJourney.trace(c,Atlas.chapters[rank].arrival.points);
    shadow(x,y,7);CastMotion.hiker(c,x,y,heading,beat,walking&&!reduceMotion);
    if(!walking){c.fillStyle="#394a39";c.fillRect(x-3,y-40,7,3);c.fillStyle="#ffde8a";c.fillRect(x-3,y-41,7,2);c.fillRect(x-1,y-39,3,2);}
  }
  function render(selected,outcome,center=true){
    if(trip)return;
    const rank=Expedition.rankOf(selected),pending=MapJourney.pending(),here=parked??pending??(outcome?selected:mapLocation());
    paintGround(rank);targets(rank,selected,here);const point=Atlas.chapters[rank].sites[selected%20];
    if(Expedition.rankOf(here)===rank)actors(rank,Atlas.chapters[rank].sites[here%20]);
    else{physical=null;sceneLayer(el("worldActors"),384,652).clearRect(0,0,384,652);}
    if(pending!==null&&pending%20===19&&rank===Math.floor(pending/20)){
      const hereChapter=Atlas.chapters[rank],[x,y]=hereChapter.exit,next=pending+1;
      const exit=document.createElement("button");exit.type="button";exit.className="map-stop open road-exit";
      exit.dataset.site=next;exit.style.left=Math.max(22,Math.min(362,x))/384*100+"%";exit.style.top=Math.max(22,Math.min(630,y))/652*100+"%";
      const tip=document.createElement("i");tip.textContent="➜";tip.setAttribute("aria-hidden","true");exit.append(tip);
      exit.setAttribute("aria-label",localizedPair(Atlas.chapters[rank+1].name));MapJourney.mark(exit);exit.onclick=()=>pick(exit,next,false);el("waypoints").append(exit);
    }
    if(center && (focusId!==selected||el("mapViewport").scrollTop===0)){
      const dest=pending===selected?(selected%20===19?Atlas.chapters[rank].exit:Atlas.chapters[rank].sites[selected%20+1]):point;
      camera((point[1]+dest[1])/2);
    }
    focusId=selected;el("mapSkip").hidden=true;el("locateParty").hidden=false;
  }
  function cancel(){
    if(frameId)cancelAnimationFrame(frameId);frameId=0;trip=null;world.classList.remove("traveling");
    el("mapSkip").hidden=true;el("locateParty").hidden=false;
  }
  function locate(route,f){
    const span=Math.abs(route.to-route.from),forward=route.to>route.from;
    const distance=Math.min(span,f*span),step=Math.min(span-1,Math.floor(distance));
    return Atlas.position(forward?route.from+step:route.from-step-1,forward?distance-step:1-distance+step);
  }
  function walk(from,arrived,to=from+1){
    if(from===to){arrived();return;}
    cancel();trip={from,to,f:0,arrived};world.classList.add("traveling");
    el("mapSkip").hidden=false;el("locateParty").hidden=true;
    const start=performance.now(),duration=reduceMotion?420:2600;
    const animate=time=>{
      if(!trip)return;trip.f=Math.min(1,(time-start)/duration);
      const {rank,point}=locate(trip,trip.f);
      if(rank!==shown){paintGround(rank);targets(rank,from+1,-1);el("mapRegion").textContent=localizedPair(Atlas.chapters[rank].name);}
      actors(rank,point,true,time);camera(point[1]);
      if(trip.f>=1){cancel();arrived();}else frameId=requestAnimationFrame(animate);
    };
    frameId=requestAnimationFrame(animate);
  }
  function depart(){
    const from=MapJourney.pending();
    if(from===null||trip||!el("battleLayout").hidden)return;
    walk(parked??from,()=>{
      parked=null;const dest=from+1;MapJourney.write("road",null);
      saved.location=dest;save();openMap(dest);RoadTalk.open(from,dest);
    },from+1);
  }
  function interruptWalk(){
    if(!trip)return;
    cancel();if(!el("voyage").hidden)renderMap();
  }
  addEventListener("popstate",interruptWalk,true);
  document.addEventListener("click",e=>{if(e.target.closest("#mapMenuOpen,#personalSettings"))interruptWalk();},true);
  el("locateParty").onclick=()=>openMap(parked??mapLocation());
  el("mapSkip").onclick=()=>{if(trip){const finish=trip.arrived;cancel();finish();}};
  function repaint(){if(!el("voyage").hidden&&!trip&&shown>=0)render(mapStage,mapOutcome,false);}
  CastMotion.trail.addEventListener("load",repaint);ExpeditionCast.sheet.addEventListener("load",repaint);cast[0].addEventListener("load",repaint);
  return {render,walk,cancel,resetParty(){parked=null;},get physical(){return physical;},get travel(){return trip;}};
})();
