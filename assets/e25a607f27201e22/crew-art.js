"use strict";
// The original seven cells retain their addresses. Two extra cells per member contain
// the incoming guard and its release so an opponent move has its own complete trajectory.
const CrewArt=(()=>{
  const width=204,height=154,nativeHeight=92,ground=132,atlas=new Image();
  const ready=new Promise((resolve,reject)=>{
    atlas.onload=()=>resolve(true);
    atlas.onerror=()=>reject(new Error("The companion artwork could not be loaded."));
  });
  atlas.src="./companions-rigged.png";
  const valid=id=>Number.isInteger(id)&&id>=0&&id<30;
  function cell(id,frame){
    if(frame<=6)return [((id%2)*7+frame)*width,Math.floor(id/2)*height];
    const alternate=id*2+frame-7;
    return [alternate%14*width,(15+Math.floor(alternate/14))*height];
  }
  function draw(context,id,x,baseline,visibleHeight,pose=0,beat=0){
    if(!valid(id)||!atlas.naturalWidth||visibleHeight<=0)return false;
    const frame=pose===5?7:pose===6?8:pose>=1&&pose<=4?pose+1:Math.abs(Math.floor(beat))%2;
    const [sx,sy]=cell(id,frame),scale=visibleHeight/nativeHeight;
    context.save();context.imageSmoothingEnabled=false;
    context.drawImage(atlas,sx,sy,width,height,Math.round(x-width*scale/2),Math.round(baseline-ground*scale),width*scale,height*scale);
    context.restore();return true;
  }
  function portrait(canvas,id){
    if(!valid(id))return;
    canvas.dataset.crewArt=String(id);
    const paint=()=>{
      if(canvas.dataset.crewArt!==String(id))return;
      const c=canvas.getContext("2d"),[left,top]=cell(id,6),size=Math.min(canvas.width,canvas.height);
      c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;
      c.drawImage(atlas,left+(width-height)/2,top,height,height,(canvas.width-size)/2,canvas.height-size,size,size);
    };
    if(atlas.naturalWidth)paint();
    else ready.then(paint,()=>{});
  }
  return {draw,portrait,ready};
})();
