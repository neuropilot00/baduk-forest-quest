"use strict";
// Give the player time to see the exchange. Only time spent on this battlefield counts.
function boardTransition() {
  let timer=0, current=null;
  function cancel() { clearTimeout(timer);current=null; }
  function schedule(key,owner,valid,advance) {
    if(current===key)return;
    cancel();current=key;
    let remaining=matchMedia("(prefers-reduced-motion: reduce)").matches?1000:1550;
    let last=performance.now(), wasVisible=false;
    function tick(){
      if(!valid()||!owner.isConnected){cancel();return;}
      const now=performance.now();
      const visible=!document.hidden && !owner.hidden && document.getElementById("titleScene").hidden &&
        document.getElementById("gearDialog").hidden && !document.querySelector(owner.tagName==="DIALOG"?
          "dialog[open]:not(#reachBattleDialog):not(#reachMap)":"dialog[open]");
      if(visible&&wasVisible)remaining-=Math.min(160,now-last);
      wasVisible=visible;last=now;
      if(remaining<=0){cancel();advance();}else timer=setTimeout(tick,100);
    }
    tick();
  }
  return {schedule,cancel};
}


// Only scenery is softened. Sprites, targeting marks and HUD are drawn afterwards
// at native resolution. Cache by painted source, including restored stage variants.
const fieldPlates=new Map();
function drawBattleBackdrop(ctx,picture,width,height){
  let plate=fieldPlates.get(picture);
  if(!plate){
    const w=picture.naturalWidth||picture.width,h=picture.naturalHeight||picture.height;
    if(!w||!h)return;
    plate=document.createElement("canvas");plate.width=w;plate.height=h;
    const ink=plate.getContext("2d"),soft=document.createElement("canvas");
    soft.width=Math.max(1,Math.round(w*.35));soft.height=Math.max(1,Math.round(h*.35));
    soft.getContext("2d").drawImage(picture,0,0,soft.width,soft.height);
    ink.drawImage(picture,0,0,w,h);ink.globalAlpha=.4;
    ink.drawImage(soft,0,0,w,h);ink.globalAlpha=1;
    const air=ink.createLinearGradient(0,0,0,h);
    air.addColorStop(0,"#bfccc80e");air.addColorStop(.55,"#bacbc13c");air.addColorStop(.88,"#c7c3ae32");air.addColorStop(1,"#344c452a");
    ink.fillStyle=air;ink.fillRect(0,0,w,h);
    // Keep the active backdrop and one adjacent scene during a transition.
    if(fieldPlates.size===2)fieldPlates.delete(fieldPlates.keys().next().value);
    fieldPlates.set(picture,plate);
  }
  const arena=picture.dataset?.arena;
  if(ctx.canvas?.dataset&&ctx.canvas.dataset.arena!==arena){
    if(arena===undefined)delete ctx.canvas.dataset.arena;else ctx.canvas.dataset.arena=arena;
  }
  const scale=Math.max(width/plate.width,height/plate.height);
  const w=plate.width*scale,h=plate.height*scale;
  ctx.drawImage(plate,(width-w)/2,(height-h)*(arena!==undefined?.79:.52),w,h);
}

function portraitArenaHeight(worldWidth,cssWidth,minimum,viewportShare,maximum){
  if(!cssWidth||!matchMedia("(max-width:700px) and (orientation:portrait)").matches)return 0;
  const layoutHeight=document.documentElement.clientHeight;
  return worldWidth*Math.max(minimum,Math.min(maximum,layoutHeight*viewportShare))/cssWidth;
}

function sceneLayer(canvas,width,height,density=Math.min(3,globalThis.devicePixelRatio||1)) {
  const pixelsWide=Math.round(width*density),pixelsHigh=Math.round(height*density);
  if(canvas.width!==pixelsWide)canvas.width=pixelsWide;
  if(canvas.height!==pixelsHigh)canvas.height=pixelsHigh;
  const ctx=canvas.getContext("2d");
  ctx.setTransform(pixelsWide/width,0,0,pixelsHigh/height,0,0);
  return ctx;
}

function drawFieldScenery(canvas,ctx,picture,width,defaultHeight) {
  const rect=canvas.getBoundingClientRect();
  const height=rect.width&&rect.height?Math.max(1,Math.round(width*rect.height/rect.width)):defaultHeight;
  const density=rect.width?Math.min(3,Math.max(1,rect.width*(globalThis.devicePixelRatio||1)/width)):1;
  sceneLayer(canvas,width,height,density);
  ctx.imageSmoothingEnabled=false;
  drawBattleBackdrop(ctx,picture,width,height);
  return height;
}
