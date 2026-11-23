"use strict";
// The original seven cells retain their addresses. Two extra cells per member contain
// the incoming guard and its release so an opponent move has its own complete trajectory.
const CrewArt=(()=>{
  const width=204,height=154,nativeHeight=92,ground=132,atlas=new Image();
  const motionFiles={
    0:"../eaecd090510d7805/lulu-combat-cels.webp",1:"../eaecd090510d7805/moru-combat-cels.webp",2:"../eaecd090510d7805/hon-combat-cels.webp",3:"../eaecd090510d7805/iseol-combat-cels.webp",4:"../eaecd090510d7805/sena-combat-cels.webp",5:"../eaecd090510d7805/mio-combat-cels.webp",
    6:"../eaecd090510d7805/ren-combat-cels.webp",7:"../eaecd090510d7805/bau-combat-cels.webp",8:"../eaecd090510d7805/hibaru-combat-cels.webp",9:"../eaecd090510d7805/rinne-combat-cels.webp",10:"../eaecd090510d7805/shion-combat-cels.webp",11:"../eaecd090510d7805/kiseki-combat-cels.webp",
    12:"../eaecd090510d7805/towa-combat-cels.webp",13:"../eaecd090510d7805/nagi-combat-cels.webp",14:"../eaecd090510d7805/kaji-combat-cels.webp",15:"../eaecd090510d7805/sagiri-combat-cels.webp",
    16:"../eaecd090510d7805/akane-combat-cels.webp",17:"../eaecd090510d7805/baku-combat-cels.webp",18:"../eaecd090510d7805/asumi-combat-cels.webp",19:"../eaecd090510d7805/kuri-combat-cels.webp",
    20:"../eaecd090510d7805/watari-combat-cels.webp",21:"../eaecd090510d7805/yuki-combat-cels.webp",22:"../eaecd090510d7805/sara-combat-cels.webp",23:"../eaecd090510d7805/nei-combat-cels.webp",
    24:"../eaecd090510d7805/kage-combat-cels.webp",25:"../eaecd090510d7805/nebe-combat-cels.webp",26:"../eaecd090510d7805/iri-combat-cels.webp",27:"../eaecd090510d7805/shiro-combat-cels.webp",
    28:"../eaecd090510d7805/haru-combat-cels.webp",29:"../eaecd090510d7805/pon-combat-cels.webp"
  };
  const techniques={0:"../eaecd090510d7805/lulu-seal-cels.webp",1:"../eaecd090510d7805/moru-bridge-cels.webp",2:"../eaecd090510d7805/hon-lantern-cels.webp",3:"../eaecd090510d7805/iseol-record-cels.webp",
    4:"../eaecd090510d7805/sena-shield-line-cels.webp",5:"../eaecd090510d7805/mio-bandage-cels.webp",
    6:"../eaecd090510d7805/ren-slip-cels.webp",7:"../eaecd090510d7805/bau-break-cels.webp",8:"../eaecd090510d7805/hibaru-embers-cels.webp",
    9:"../eaecd090510d7805/rinne-diagonal-cels.webp",10:"../eaecd090510d7805/shion-needle-cels.webp",11:"../eaecd090510d7805/kiseki-stonehouse-cels.webp",
    12:"../eaecd090510d7805/towa-beam-cels.webp",13:"../eaecd090510d7805/nagi-decoy-cels.webp",
    14:"../eaecd090510d7805/kaji-shore-cels.webp",15:"../eaecd090510d7805/sagiri-post-cels.webp",16:"../eaecd090510d7805/akane-vent-cels.webp",17:"../eaecd090510d7805/baku-stake-cels.webp",
    18:"../eaecd090510d7805/asumi-chart-cels.webp",19:"../eaecd090510d7805/kuri-arrow-cels.webp",
    20:"../eaecd090510d7805/watari-confluence-cels.webp",21:"../eaecd090510d7805/yuki-evacuation-cels.webp",
    22:"../eaecd090510d7805/sara-spear-cels.webp",23:"../eaecd090510d7805/nei-echo-cels.webp",
    24:"../eaecd090510d7805/kage-twin-cels.webp",25:"../eaecd090510d7805/nebe-ridge-cels.webp",
    26:"../eaecd090510d7805/iri-crossweave-cels.webp",27:"../eaecd090510d7805/shiro-tracking-cels.webp",
    28:"../eaecd090510d7805/haru-remedy-cels.webp",29:"../eaecd090510d7805/pon-finale-cels.webp"},motions=new Map();
  const firstTechnique=60,techniqueFrames=12;
  const ready=new Promise((resolve,reject)=>{
    atlas.onload=()=>resolve(true);
    atlas.onerror=()=>reject(new Error("The companion artwork could not be loaded."));
  });
  atlas.src="../eaecd090510d7805/companions-rigged.png";
  const valid=id=>Number.isInteger(id)&&id>=0&&id<30;
  const hasMotion=id=>!!motionFiles[id];
  const hasTechnique=id=>!!techniques[id];
  function motionImage(file){
    if(!file)return null;
    if(!motions.has(file)){
      const image=new Image();image.src=file;motions.set(file,image);
    }
    return motions.get(file);
  }
  const basicMotion=id=>hasMotion(id)?motionImage(motionFiles[id]):null;
  const techniqueCel=(id,at,now,reduced)=>{
    const elapsed=now-at;
    if(!hasTechnique(id)||!Number.isFinite(elapsed)||elapsed<0||elapsed>=BattleActions.duration)return undefined;
    return firstTechnique+(reduced?6:Math.floor(techniqueFrames*elapsed/BattleActions.duration));
  };
  function cell(id,frame){
    if(frame<=6)return [((id%2)*7+frame)*width,Math.floor(id/2)*height];
    const alternate=id*2+frame-7;
    return [alternate%14*width,(15+Math.floor(alternate/14))*height];
  }
  function draw(context,id,x,baseline,visibleHeight,pose=0,beat=0,cel){
    if(!valid(id)||!atlas.naturalWidth||visibleHeight<=0)return false;
    const frame=pose===5?7:pose===6?8:pose>=1&&pose<=4?pose+1:Math.abs(Math.floor(beat))%2;
    let image=null,index=cel;
    if(Number.isInteger(cel)&&cel>=0&&cel<firstTechnique)image=basicMotion(id);
    if(Number.isInteger(cel)&&cel>=firstTechnique&&cel<firstTechnique+techniqueFrames){
      image=motionImage(techniques[id]);index=cel-firstTechnique;
      if(!image?.naturalWidth){image=basicMotion(id);index=0;}
    }
    const painted=image?.naturalWidth;
    const [sx,sy]=painted?[index%8*width,Math.floor(index/8)*height]:cell(id,frame),scale=visibleHeight/nativeHeight;
    context.save();context.imageSmoothingEnabled=false;
    context.drawImage(painted?image:atlas,sx,sy,width,height,Math.round(x-width*scale/2),Math.round(baseline-ground*scale),width*scale,height*scale);
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
  return {draw,portrait,ready,hasMotion,hasTechnique,techniqueCel,
    preload(ids){for(const id of ids){basicMotion(id);motionImage(techniques[id]);}}};
})();
