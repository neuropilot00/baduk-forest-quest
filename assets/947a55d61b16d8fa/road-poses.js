"use strict";
// Solbi on the road. The same painted hood, leather, linen, cloak and boots used
// in battle are cut at the joints. None of the field poses uses the casting arm
// or the burning staff tip as a whole. Coordinates use original character pixels.
const RoadPoses=(()=>{
  const source=typeof CastMotion==="undefined"?new Image():CastMotion.poses;
  if(!source.src)source.src="./battle-poses.png";
  const reduced=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
  const sourceX=27,sourceY=30,frameW=144,frameH=128,groundY=126,anchorX=62,bodyHeight=83;
  const parts={},frames=new Map();
  const outlines={
    hood:[[31,47],[36,41],[40,39],[51,42],[60,39],[69,42],[76,47],[78,53],[77,57],[75,62],[71,64],[67,66],[61,69],[56,67],[52,67],[48,65],[43,65],[41,62],[43,59],[39,55],[39,51]],
    mantle:[[38,71],[45,69],[50,65],[54,64],[62,68],[68,63],[72,63],[72,69],[69,75],[65,77],[56,75],[51,73],[48,77],[39,77]],
    torso:[[44,73],[52,69],[58,70],[65,69],[70,66],[72,72],[70,78],[73,84],[73,88],[79,91],[76,94],[73,97],[68,100],[62,102],[53,103],[51,100],[47,100],[43,98],[40,95],[42,89],[46,84],[45,78]],
    cloth:[[74,79],[78,75],[83,77],[88,80],[92,84],[96,88],[98,94],[97,98],[93,99],[92,105],[90,104],[89,96],[85,94],[81,91],[78,92],[76,88]],
    rearThigh:[[43,95],[51,90],[56,93],[56,98],[52,103],[45,109],[40,112],[35,111],[34,107],[38,102]],
    frontThigh:[[67,92],[72,90],[77,93],[81,98],[84,101],[86,105],[84,109],[80,112],[76,108],[71,105],[68,101],[65,97]],
    rearShin:[[35,106],[42,106],[44,109],[40,114],[37,118],[34,122],[29,124],[27,120],[29,116],[31,111]],
    frontShin:[[79,105],[84,102],[88,104],[89,109],[93,116],[94,120],[90,123],[84,123],[82,119],[81,114],[78,109]],
    rearBoot:[[28,118],[33,118],[36,121],[36,125],[34,126],[26,126],[25,124],[26,120]],
    frontBoot:[[84,117],[90,116],[93,119],[98,119],[101,121],[101,125],[99,126],[83,126],[82,123]],
    rearSleeve:[[42,73],[48,72],[51,75],[50,80],[46,85],[42,88],[39,88],[36,84],[37,80],[39,77]],
    rearGlove:[[37,79],[41,80],[42,84],[39,87],[34,91],[31,91],[32,94],[29,94],[28,91],[25,94],[23,93],[26,90],[22,90],[22,88],[26,88],[24,85],[25,83],[29,86],[32,84]],
    frontSleeve:[[67,69],[73,66],[77,65],[79,68],[79,72],[75,76],[74,79],[70,82],[66,81],[65,77],[65,73]],
    frontGlove:[[73,71],[79,67],[83,65],[86,64],[89,63],[91,64],[92,67],[90,69],[86,70],[83,72],[79,76],[76,77],[73,76]]
  };
  function canvas(w,h){const tile=document.createElement("canvas");tile.width=w;tile.height=h;return tile;}
  function cut(name){
    if(parts[name])return parts[name];
    const path=outlines[name],left=Math.min(...path.map(p=>p[0])),top=Math.min(...path.map(p=>p[1]));
    const tile=canvas(Math.max(...path.map(p=>p[0]))-left+1,Math.max(...path.map(p=>p[1]))-top+1),c=tile.getContext("2d");
    c.translate(-left,-top);c.beginPath();path.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
    c.drawImage(source,sourceX,sourceY,144,144,0,0,144,144);
    return parts[name]={tile,left,top};
  }
  function place(c,name,src,target,angle=0,sx=1,sy=sx){
    const p=cut(name);c.save();c.translate(...target);c.rotate(angle);c.scale(sx,sy);
    c.drawImage(p.tile,p.left-src[0],p.top-src[1]);c.restore();
  }
  function vector(a,b){return [b[0]-a[0],b[1]-a[1]];}
  function segment(c,name,src,srcEnd,start,end){
    const u=vector(src,srcEnd),v=vector(start,end),angle=Math.atan2(v[1],v[0])-Math.atan2(u[1],u[0]);
    // Length along the joint-to-joint axis is allowed to foreshorten. Its
    // perpendicular width and all of the face keep their original proportions.
    const p=cut(name),sa=Math.atan2(u[1],u[0]),ta=sa+angle,ratio=Math.hypot(...v)/Math.hypot(...u);
    c.save();c.translate(...start);c.rotate(ta);c.scale(ratio,1);c.rotate(-sa);
    c.drawImage(p.tile,p.left-src[0],p.top-src[1]);c.restore();
  }
  function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  function stitch(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
  function carriedStaff(c,hip,neck,swing){
    const x=hip[0]-12,y=hip[1]+2,xx=neck[0]-21+swing,yy=neck[1]-18;
    poly(c,[[x-1,y+1],[x+2,y+1],[xx+2,yy],[xx-1,yy]],"#543b25");
    poly(c,[[x,y-4],[x+1,y-4],[xx+1,yy+1],[xx,yy]],"#a48042");
    stitch(c,xx-1,yy,3,5,"#73664a");stitch(c,xx,yy-1,2,3,"#c5b17a");
  }
  function backCloak(c,shoulder,pose,beat){
    // The attack arm covers the middle of the original cloak. The road cut
    // restores those occluded inner folds, then overlays the painted outer hem.
    c.save();c.translate(shoulder[0],shoulder[1]);const bend=pose==="kneel"?5:0,wave=pose==="walk"?[1,3,0,-2][beat]:[0,1,0,-1][beat];
    const tip=-18-bend+wave,h=34-bend;
    poly(c,[[1,-4],[-5,0],[-10,8],[-11,16],[tip+3,h-9],[tip,h-1],[tip+1,h+2],[tip+7,h-2],[-5,h-6],[1,h-7],[7,h-12],[11,-1]],"#2f4944");
    poly(c,[[0,-2],[-5,3],[-8,12],[tip+6,h-7],[tip+3,h-1],[-5,h-8],[4,h-13],[8,1]],"#3c6265");
    poly(c,[[-1,1],[-5,11],[tip+8,h-9],[-6,h-8],[3,h-15],[6,2]],"#233e42");
    poly(c,[[-6,5],[-10,16],[tip+4,h-5],[tip+7,h-9],[-8,13]],"#4e7970");
    poly(c,[[tip,h],[tip+6,h-4],[-3,h-10],[tip+7,h-2],[tip+1,h+2]],"#91845c");
    for(const [x,y] of [[-6,5],[-10,15],[-9,18],[tip+3,h-4],[tip+5,h-5]])stitch(c,x,y,2,1,"#78937b");
    c.restore();
  }
  const rigs={
    // Hips, collar, head tilt, rear knee/boot, forward knee/boot, elbows
    // and fingertips. All points refer to local stage space, never screen px.
    wait:{hip:[61,96],neck:[60,65],head:-7,backK:[51,109],backFoot:[48,125],frontK:[69,109],frontFoot:[75,125],backE:[47,85],backHand:[53,91],frontE:[76,76],frontHand:[72,60]},
    kneel:{hip:[62,108],neck:[78,87],head:15,backK:[47,118],backFoot:[31,125],frontK:[86,100],frontFoot:[90,125],backE:[64,101],backHand:[77,104],frontE:[98,102],frontHand:[108,117]},
    inspect:{hip:[62,96],neck:[66,65],head:10,backK:[51,110],backFoot:[46,125],frontK:[72,110],frontFoot:[77,125],backE:[52,87],backHand:[68,79],frontE:[78,87],frontHand:[85,75]},
    offer:{hip:[62,95],neck:[70,66],head:1,backK:[51,109],backFoot:[40,125],frontK:[78,107],frontFoot:[84,125],backE:[56,85],backHand:[64,90],frontE:[85,79],frontHand:[104,72]},
    walk:{hip:[61,95],neck:[65,65],head:0,backK:[50,107],backFoot:[42,125],frontK:[73,108],frontFoot:[83,125],backE:[47,84],backHand:[46,96],frontE:[79,81],frontHand:[89,79]}
  };
  const steps=[
    {backK:[48,108],backFoot:[39,125],frontK:[76,109],frontFoot:[86,125],backE:[47,84],backHand:[43,93],frontE:[79,80],frontHand:[88,75],lift:0},
    {backK:[58,108],backFoot:[49,119],frontK:[67,111],frontFoot:[72,125],backE:[50,83],backHand:[49,94],frontE:[79,82],frontHand:[84,81],lift:-2},
    {backK:[71,108],backFoot:[79,125],frontK:[52,109],frontFoot:[40,125],backE:[58,84],backHand:[68,89],frontE:[66,84],frontHand:[62,98],lift:0},
    {backK:[64,109],backFoot:[63,125],frontK:[69,105],frontFoot:[56,119],backE:[54,83],backHand:[58,93],frontE:[72,85],frontHand:[73,97],lift:-2}
  ];
  function add([x,y],dx,dy){return [x+dx,y+dy];}
  function torsoPoint(src,hip,neck){
    const dx=neck[0]-hip[0],dy=neck[1]-hip[1],height=Math.hypot(dx,dy),t=(95-src[1])/31,w=src[0]-62;
    return [hip[0]+dx*t-dy/height*w,hip[1]+dy*t+dx/height*w];
  }
  function leg(c,front,hip,knee,foot){
    const ankle=add(foot,front?-3:0,-6);
    const src=front?[[71,94],[82,107],[88,120],[90,125]]:[[49,96],[40,108],[32,120],[31,125]];
    segment(c,front?"frontThigh":"rearThigh",src[0],src[1],hip,knee);
    segment(c,front?"frontShin":"rearShin",src[1],src[2],knee,ankle);
    place(c,front?"frontBoot":"rearBoot",src[3],foot);
  }
  function arm(c,front,shoulder,elbow,hand){
    const src=front?[[68,77],[77,72],[89,66]]:[[47,76],[39,82],[27,89]];
    segment(c,front?"frontSleeve":"rearSleeve",src[0],src[1],shoulder,elbow);
    segment(c,front?"frontGlove":"rearGlove",src[1],src[2],elbow,hand);
  }
  function phase(pose,time){
    const speed=pose==="walk"?140:pose==="kneel"?260:pose==="offer"?300:440;
    return reduced?.matches?0:Math.floor(Math.max(0,time||0)/speed)%4;
  }
  function handPixel(pose,beat){
    const t=[0,1,0,-1][beat],p=rigs[pose].frontHand;
    if(pose==="walk")return add(steps[beat].frontHand,0,steps[beat].lift);
    if(pose==="kneel")return add(p,2*t,-Math.max(0,t)*3);
    return add(p,pose==="offer"?2*t:0,t);
  }
  function grip(pose="wait",time=0){
    if(!Object.hasOwn(rigs,pose))pose="wait";
    const hand=handPixel(pose,phase(pose,time));return [(hand[0]-anchorX)/bodyHeight,(hand[1]-groundY)/bodyHeight];
  }
  function makeFrame(pose,beat){
    const r=rigs[pose],walk=pose==="walk",s=walk?steps[beat]:r,t=[0,1,0,-1][beat];
    const lift=walk?s.lift:0,hip=add(r.hip,0,lift),neck=add(r.neck,0,lift+(walk?0:t));
    const tile=canvas(frameW,frameH),c=tile.getContext("2d");c.imageSmoothingEnabled=false;
    const shoulder=torsoPoint([69,74],hip,neck),backShoulder=torsoPoint([48,76],hip,neck);
    const head=r.head+(walk?0:t*(pose==="wait"?3:2));
    const frontHand=handPixel(pose,beat),backHand=add(s.backHand,0,walk?lift:-t);
    const cape=torsoPoint([57,71],hip,neck);
    carriedStaff(c,hip,neck,walk?t:0);
    backCloak(c,backShoulder,pose,beat);
    place(c,"cloth",[78,77],add(backShoulder,1,-2),.06+t*.03,-1.12,1.15);
    place(c,"cloth",[80,79],add(cape,7,3),.14-t*.035,.76,1.15);
    leg(c,false,torsoPoint([55,96],hip,neck),s.backK,s.backFoot);
    leg(c,true,torsoPoint([69,95],hip,neck),s.frontK,s.frontFoot);
    arm(c,false,backShoulder,add(s.backE,0,lift),backHand);
    segment(c,"torso",[62,95],[62,64],hip,neck);
    const angle=Math.atan2(neck[1]-hip[1],neck[0]-hip[0])+Math.PI/2;
    place(c,"mantle",[60,68],add(neck,-1,4),angle,1);
    place(c,"hood",[60,67],add(neck,0,2),head*Math.PI/180);
    arm(c,true,shoulder,add(s.frontE,0,lift),frontHand);
    return tile;
  }
  function draw(ctx,x,ground,heroPx,pose="wait",time=0){
    if(!source.naturalWidth||!Number.isFinite(heroPx)||heroPx<=0)return false;
    if(!Object.hasOwn(rigs,pose))pose="wait";
    const beat=phase(pose,time),key=pose+"/"+beat;
    if(!frames.has(key))frames.set(key,makeFrame(pose,beat));
    const scale=heroPx/bodyHeight;ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.drawImage(frames.get(key),Math.round(x-anchorX*scale),Math.round(ground-groundY*scale),Math.round(frameW*scale),Math.round(frameH*scale));ctx.restore();return true;
  }
  return {draw,grip};
})();
