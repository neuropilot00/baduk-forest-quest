"use strict";
const ExpeditionCast=(()=>{
  const sheet=new Image();sheet.src="./forest-cast.png";
  const fauna=new Image();fauna.src="./field-fauna.png";
  const partnerFrames=[null,4,5,1,7];
  function frame(c,id,x,y,height,angle=0,alpha=1,flip=false){
    if(!sheet.naturalWidth)return;
    c.save();c.translate(Math.round(x),Math.round(y));c.rotate(angle);c.scale(flip?-1:1,1);
    c.globalAlpha=alpha;c.imageSmoothingEnabled=false;
    c.drawImage(sheet,id%3*144,Math.floor(id/3)*144,144,144,-height/2,-height*.958,height,height);c.restore();
  }
  function foe(c,id,x,y,height,angle=0,alpha=1,pose=0){
    if(id===0&&CastMotion.draw(c,1,x,y,height*1.05,pose,alpha))return;
    if(!fauna.naturalWidth)return;
    const step=pose||(!reduceMotion&&Math.floor(performance.now()/(310+id%7*29))%4===1?1:0);
    const scale=height*(id<8?1.12:1.18);
    c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));c.rotate(angle);c.globalAlpha=alpha;
    c.drawImage(fauna,((id%5)*4+step)*96,Math.floor(id/5)*96,96,96,-scale/2,-scale*93/96,scale,scale);c.restore();
  }
  function guardian(c,rank,x,y,height,angle=0,alpha=1,pose=0){
    if(rank===0&&CastMotion.draw(c,2,x,y,height,pose,alpha))return;
    if(rank<7){frame(c,[8,1,6,7,0,2,3][rank],x,y,height*1.23,angle,alpha);return;}
    // The final bell dragon is drawn segment by segment; its tail and whiskers move independently.
    c.save();c.translate(x,y);c.rotate(angle);c.scale(height/85,height/85);c.globalAlpha=alpha;
    const clock=reduceMotion?0:performance.now()/850;
    for(let i=13;i>=0;i--){const t=i/13,px=-12+t*55,py=-38+Math.sin(t*7+clock*.8)*13+t*16,r=13*(1-t)+3;
      c.fillStyle="#344e59";c.fillRect(px-r,py-r,2*r,2*r);c.fillStyle="#769a96";c.fillRect(px-r+2,py-r+1,r*1.5,r);
      c.fillStyle="#d2c08a";c.fillRect(px-r,py-r-3,4,5);}
    c.fillStyle="#485b68";c.fillRect(-35,-55,25,24);c.fillRect(-43,-42,18,12);
    c.fillStyle="#aac4ac";c.fillRect(-34,-53,22,12);c.fillRect(-42,-41,21,6);
    c.fillStyle="#f6d280";c.fillRect(-31,-46,5,3);c.fillRect(-24,-68,4,17);c.fillRect(-24,-66,10,3);c.fillRect(-10,-66,3,14);
    c.strokeStyle="#edce93";c.lineWidth=1.4;for(let j=0;j<2;j++){c.beginPath();c.moveTo(-39,-36+j*3);c.quadraticCurveTo(-55,-42+j*17,-61,-35+j*8+Math.sin(clock)*4);c.stroke();}
    c.restore();
  }
  function party(c,id,x,y,size,angle=0,step=0,pose=0){
    if(id){const nativeHeights=[0,102,82,121,129];frame(c,partnerFrames[id],x,y,size*144/nativeHeights[id],angle,1,true);return;}
    if(CastMotion.draw(c,0,x,y,size,pose))return;
    if(!cast[0].naturalWidth)return;
    c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));c.rotate(angle);
    c.drawImage(cast[0],(step%8)*144,0,144,136,-size*.53,-size*.94,size*1.06,size);c.restore();
  }
  function companion(c,id,x,y,heroHeight,angle=0){if(id)party(c,id,x,y,heroHeight*(id===1?.50:.62),angle);}
  return {sheet,fauna,foe,guardian,party,companion};
})();
const WorldMap=(()=>{
  const cache=new Map(),viewport=el("mapViewport"),world=el("mapWorld");
  let shown=-1,trip=null,physical=null,focusId=null,frameId=0,heading=0;
  function paintGround(rank){
    if(shown===rank)return;
    shown=rank;
    if(!cache.has(rank))cache.set(rank,MapArt.terrain(rank));
    el("worldLand").getContext("2d").drawImage(cache.get(rank),0,0);
  }
  function camera(y){viewport.scrollTop=Math.max(0,y/652*world.clientHeight-viewport.clientHeight*.43);}
  function targets(rank,selected,here){
    const ch=Atlas.chapters[rank];
    el("waypoints").replaceChildren(...ch.sites.map(([x,y],n)=>{
      const id=rank*20+n,b=document.createElement("button"),pin=document.createElement("i");
      b.type="button";b.dataset.site=id;b.style.left=x/384*100+"%";b.style.top=y/652*100+"%";
      const locked=id>saved.expedition,done=id<saved.expedition;
      b.className="map-stop "+(locked?"closed":done?"cleared":"open")+(id===here?" here":"");
      b.setAttribute("aria-current",id===here?"location":"false");b.setAttribute("aria-pressed",String(id===selected));
      b.setAttribute("aria-label",campaignTitle(id)+" · "+localizedPair(Voyage.places[id])+" · "+t(locked?"locked":done?"cleared":"available"));
      pin.setAttribute("aria-hidden","true");pin.textContent=locked?"":done?"✓":"◆";b.append(pin);
      b.onclick=()=>{if(!trip)openMap(id);};return b;
    }));
    el("worldLabels").replaceChildren(...ch.landmarks.filter(p=>p[3]).map(([x,y,,pair])=>{
      const label=document.createElement("span");label.textContent=localizedPair(pair);
      label.style.left=x/384*100+"%";label.style.top=Math.max(11,y-36)/652*100+"%";return label;
    }));
  }
  function actors(rank,point,walking=false,tick=0){
    let beat=0;
    if(walking&&trip){
      const before=Atlas.position(trip.from,Math.max(0,trip.f-.012)),after=Atlas.position(trip.from,Math.min(1,trip.f+.012));
      if(before.rank===after.rank)heading=CastMotion.direction(after.point[0]-before.point[0],after.point[1]-before.point[1]);
      if(!reduceMotion)beat=Math.floor(tick/118)%4;
    }
    physical={rank,point:[...point],heading,beat};const c=el("worldActors").getContext("2d");
    c.clearRect(0,0,384,652);
    const [x,y]=point,bob=walking&&!reduceMotion?Math.abs(Math.sin(tick/95)):0;
    function shadow(a,b,w){c.fillStyle="#293a32aa";c.fillRect(a-w,b-2,w*2,3);}
    let partner=[x-15,y+2];
    if(walking&&saved.partner){const lag=Atlas.position(trip.from,Math.max(0,trip.f-.18));if(lag.rank===rank)partner=[lag.point[0]-5,lag.point[1]+2];}
    Crew.draw(c,x-26,y+1,21,beat,.53);
    if(Crew.guide()){shadow(...partner,6);ExpeditionCast.companion(c,Crew.guide(),partner[0],partner[1]-bob,29,walking?Math.sin(tick/95)*.05:0);}
    shadow(x,y-1,7);CastMotion.hiker(c,x,y-1,heading,beat);
    if(!walking){c.fillStyle="#394a39";c.fillRect(x-3,y-40,7,3);c.fillStyle="#ffde8a";c.fillRect(x-3,y-41,7,2);c.fillRect(x-1,y-39,3,2);}
  }
  function render(selected,outcome,center=true){
    if(trip)return;
    const rank=Expedition.rankOf(selected),here=outcome?selected:mapLocation();
    paintGround(rank);targets(rank,selected,here);const point=Atlas.chapters[rank].sites[selected%20];
    if(Expedition.rankOf(here)===rank)actors(rank,Atlas.chapters[rank].sites[here%20]);
    else{physical=null;el("worldActors").getContext("2d").clearRect(0,0,384,652);}
    if(center && (focusId!==selected||el("mapViewport").scrollTop===0))camera(point[1]);
    focusId=selected;el("mapSkip").hidden=true;el("locateParty").hidden=false;
  }
  function cancel(){
    if(frameId)cancelAnimationFrame(frameId);frameId=0;trip=null;world.classList.remove("traveling");
    el("mapSkip").hidden=true;el("locateParty").hidden=false;
  }
  function walk(from,arrived){
    cancel();trip={from,f:0};world.classList.add("traveling");
    el("mapSkip").hidden=false;el("locateParty").hidden=true;
    const start=performance.now(),duration=reduceMotion?420:2600;
    const animate=time=>{
      if(!trip)return;trip.f=Math.min(1,(time-start)/duration);
      const {rank,point}=Atlas.position(from,trip.f);
      if(rank!==shown){paintGround(rank);targets(rank,from+1,-1);el("mapRegion").textContent=localizedPair(Atlas.chapters[rank].name);}
      actors(rank,point,true,time);camera(point[1]);
      if(trip.f>=1){cancel();arrived();}else frameId=requestAnimationFrame(animate);
    };
    frameId=requestAnimationFrame(animate);
  }
  el("locateParty").onclick=()=>openMap(mapLocation());
  el("mapSkip").onclick=()=>{if(trip){cancel();arrive();}};
  function repaint(){if(!el("voyage").hidden&&!trip&&shown>=0)render(mapStage,mapOutcome,false);}
  CastMotion.trail.addEventListener("load",repaint);ExpeditionCast.sheet.addEventListener("load",repaint);cast[0].addEventListener("load",repaint);
  return {render,walk,cancel,get physical(){return physical;},get travel(){return trip;}};
})();
