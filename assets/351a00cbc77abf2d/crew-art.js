"use strict";
// The original seven cells retain their addresses. Two extra cells per member contain
// the incoming guard and its release so an opponent move has its own complete trajectory.
const CrewArt=(()=>{
  const width=204,height=154,nativeHeight=92,ground=132,atlas=new Image();
  const motionFiles={
    0:"./lulu-combat-cels.webp",1:"./moru-combat-cels.webp",2:"./hon-combat-cels.webp",3:"./iseol-combat-cels.webp",4:"./sena-combat-cels.webp",5:"./mio-combat-cels.webp",
    6:"./ren-combat-cels.webp",7:"./bau-combat-cels.webp",8:"./hibaru-combat-cels.webp",9:"./rinne-combat-cels.webp",10:"./shion-combat-cels.webp",11:"./kiseki-combat-cels.webp",
    12:"./towa-combat-cels.webp",13:"./nagi-combat-cels.webp",14:"./kaji-combat-cels.webp",15:"./sagiri-combat-cels.webp",
    16:"./akane-combat-cels.webp",17:"./baku-combat-cels.webp",18:"./asumi-combat-cels.webp",19:"./kuri-combat-cels.webp",
    20:"./watari-combat-cels.webp",21:"./yuki-combat-cels.webp",22:"./sara-combat-cels.webp",23:"./nei-combat-cels.webp",
    24:"./kage-combat-cels.webp",25:"./nebe-combat-cels.webp",26:"./iri-combat-cels.webp",27:"./shiro-combat-cels.webp",
    28:"./haru-combat-cels.webp",29:"./pon-combat-cels.webp"
  };
  const techniques={0:"./lulu-seal-cels.webp",1:"./moru-bridge-cels.webp",2:"./hon-lantern-cels.webp",3:"./iseol-record-cels.webp",
    4:"./sena-shield-line-cels.webp",5:"./mio-bandage-cels.webp",
    6:"./ren-slip-cels.webp",7:"./bau-break-cels.webp",8:"./hibaru-embers-cels.webp",
    9:"./rinne-diagonal-cels.webp",10:"./shion-needle-cels.webp",11:"./kiseki-stonehouse-cels.webp",
    12:"./towa-beam-cels.webp",13:"./nagi-decoy-cels.webp",
    14:"./kaji-shore-cels.webp",15:"./sagiri-post-cels.webp",16:"./akane-vent-cels.webp",17:"./baku-stake-cels.webp",
    18:"./asumi-chart-cels.webp",19:"./kuri-arrow-cels.webp",
    20:"./watari-confluence-cels.webp",21:"./yuki-evacuation-cels.webp",
    22:"./sara-spear-cels.webp",23:"./nei-echo-cels.webp",
    24:"./kage-twin-cels.webp",25:"./nebe-ridge-cels.webp",
    26:"./iri-crossweave-cels.webp",27:"./shiro-tracking-cels.webp",
    28:"./haru-remedy-cels.webp",29:"./pon-finale-cels.webp"},motions=new Map();
  const firstTechnique=60,techniqueFrames=12;
  const ready=new Promise((resolve,reject)=>{
    atlas.onload=()=>resolve(true);
    atlas.onerror=()=>reject(new Error("The companion artwork could not be loaded."));
  });
  atlas.src="./companions-rigged.png";
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
