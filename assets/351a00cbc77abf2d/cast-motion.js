"use strict";
const CastMotion=(()=>{
  const poses=new Image(),trail=new Image(),combat=new Image();
  poses.src="./battle-poses.png";trail.src="./trail-solbi.png";combat.src="./solbi-combat-cels.webp";
  const restHeights=[93,129,118],ground=[157,167,167];
  let side=0,start=-Infinity;
  function strike(color,time=performance.now()){side=color;start=time;FaunaMotion.strike(color,time);}
  function reset(){side=0;start=-Infinity;FaunaMotion.reset();}
  function phase(actor,time=performance.now()){
    if(reduceMotion||!side)return 0;
    const ms=time-start;
    if(ms<0||ms>620)return 0;
    if(actor===side)return ms<115?1:ms<455?2:1;
    return ms>=135&&ms<510?3:0;
  }
  function crewPhase(time=performance.now()){
    const age=time-start;if(reduceMotion||!side||age<0||age>810)return 0;
    if(side===1)return age<115?1:age<485?2:4;
    return age<115?5:age<485?3:6;
  }
  function draw(ctx,actor,x,y,height,pose=0,alpha=1){
    if(!poses.naturalWidth)return false;
    const scale=height/restHeights[actor];ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(poses,pose*202,actor*184,202,184,Math.round(x-99*scale),Math.round(y-ground[actor]*scale),202*scale,184*scale);
    ctx.restore();return true;
  }
  function drawCombat(ctx,x,y,heroPx,keyframe){
    if(!combat.naturalWidth)return false;
    const scale=heroPx/84,cellW=192,cellH=152;
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.drawImage(combat,keyframe%8*cellW,Math.floor(keyframe/8)*cellH,cellW,cellH,
      Math.round(x-96*scale),Math.round(y-122*scale),cellW*scale,cellH*scale);
    ctx.restore();return true;
  }
  const direction=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?dx>0?3:1:dy<0?2:0;
  function hiker(ctx,x,y,heading,beat){
    if(!trail.naturalWidth)return;
    // Map art has its own camera. A single fixed zoom applies to all directions
    // and beats, with the pixel boundary under the planted boot as its pivot.
    const zoom=36/34;
    ctx.imageSmoothingEnabled=false;ctx.drawImage(trail,(beat%4)*26,heading*34,26,34,Math.round(x-13*zoom),Math.round(y-31*zoom),26*zoom,34*zoom);
  }
  return {poses,trail,strike,reset,phase,crewPhase,draw,drawCombat,hiker,direction,get remainingBlackLead(){return reduceMotion||side!==1?0:Math.max(0,365-(performance.now()-start));}};
})();
