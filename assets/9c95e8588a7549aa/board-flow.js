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


function drawFieldScenery(canvas,ctx,picture,width,defaultHeight) {
  const rect=canvas.getBoundingClientRect();
  const height=rect.width&&rect.height?Math.max(1,Math.round(width*rect.height/rect.width)):defaultHeight;
  if(canvas.height!==height)canvas.height=height;
  ctx.imageSmoothingEnabled=false;
  const scale=Math.max(width/picture.width,height/picture.height);
  const w=picture.width*scale,h=picture.height*scale;
  ctx.drawImage(picture,(width-w)/2,(height-h)*.6,w,h);
  return height;
}
