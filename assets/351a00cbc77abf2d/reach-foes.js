"use strict";
const ReachFauna=(()=>{
  const names=[
    ["片鋏の水門ガニ","외집게 수문게"],["灯口ヤツメ","등불흡착어"],["葦嘴の沼鳥","갈대부리 물새"],
    ["睡蓮グモ","수련그물거미"],["潮秤の甲将","물저울 갑장"],["沈鐘の守り鷺","수몰종의 왜가리"],["双糸の睡蓮グモ","두실 수련거미"]
  ];
  // Four visitors from the existing fauna share the route with the six residents.
  const species=[0,1,2,3,-1,1,6,0,3,4,-1,3,0,1,2,-1,0,2,3,5];
  const cellWidth=204,cellHeight=154,ground=132,atlas=new Image();
  const native=[67,88,90,90,90,90,90];
  const heights=[.49,.48,.68,.45,.88,1.13,.59];
  const painted={
    0:{source:"./sluice-crab-combat-cels.webp",rest:66,cell:41},
    1:{source:"./lantern-lamprey-combat-cels.webp",rest:88,cell:55.5},
    2:{source:"./reed-bill-wader-combat-cels.webp",rest:90,cell:90},
    3:{source:"./waterlily-spinner-combat-cels.webp",rest:90,cell:74.5},
    4:{source:"./tide-scale-warden-combat-cels.webp",rest:90,cell:88,stillCel:37},
    5:{source:"./sunken-bell-heron-combat-cels.webp",rest:90,cell:88.5,stillCel:37},
    6:{source:"./twin-thread-spider-combat-cels.webp",rest:90,cell:80,stillCel:37}
  };
  // A lifted wing or hanging jaw occupies a different moment on each animal's timeline.
  const windup=[.30,.40,.24,.33,.45,.43,.39],follow=[.63,.78,.54,.72,.71,.73,.77];
  const ready=new Promise((ok,no)=>{atlas.onload=()=>ok();atlas.onerror=()=>no(new Error("Missing flooded reach creatures"));});
  let requested=false;
  function load(){
    if(!requested){requested=true;ready.catch(()=>{});atlas.src="./reach-foes.webp";}
    return ready;
  }
  const local=index=>index>=80&&index<100?index-80:index;
  function resident(index){const i=local(index);return Number.isInteger(i)&&i>=0&&i<20?species[i]:-1;}
  function name(index){return names[resident(index)]||null;}
  function frame(id,pose,beat,still){
    if(pose==="contact")return 3;
    if(still)return pose==="strike"?3:pose==="hit"?4:pose==="break"?8:0;
    if(pose==="idle")return Math.floor(beat*2)%2;
    if(pose==="tell")return 2;
    if(pose==="recover")return 5;
    if(pose==="strike")return beat<windup[id]?2:beat<follow[id]?3:5;
    if(pose==="hit"||pose==="break")return beat<.15?6:beat<.63?(pose==="break"?8:4):7;
    return 0;
  }
  function pulse(c,x,y,r,color){
    c.strokeStyle=color;c.lineWidth=1.3;c.beginPath();c.ellipse(x,y,r,r*.58,0,-2.45,.9);c.stroke();
  }
  function effect(c,id,x,y,scale,t){
    c.save();c.translate(x,y);c.scale(scale,scale);
    const span=Math.sin(Math.PI*t),tip=-48-span*10;
    c.globalAlpha*=Math.min(1,(1-t)*3);
    if(id===0){
      c.fillStyle="#f2c181";for(let j=0;j<3;j++)c.fillRect(tip-j*4*t,-25-(j-1)*9*t,3,2);
    }else if(id===1){
      pulse(c,tip,-42,4+t*14,"#a1ded7");pulse(c,tip-5,-42,2+t*7,"#ffd489");
    }else if(id===2){
      c.fillStyle="#ebd59c";for(let j=0;j<3;j++)c.fillRect(tip-4*j*t,-54+j*2,4+3*(1-t),1);
    }else if(id===3){
      c.strokeStyle="#cbe5c4";c.lineWidth=1;c.beginPath();
      c.moveTo(-44,-23);c.quadraticCurveTo(tip-10*t,-19,tip-13*t,-12+t*6);
      c.moveTo(-41,-16);c.lineTo(tip-13*t,-12+t*6);c.stroke();
    }else if(id===4){
      c.fillStyle="#d1b07a";for(const sign of [-1,1])for(let j=0;j<3;j++)c.fillRect(sign*(28+7*j+12*t),-6-j*6*span,3,3);
    }else if(id===6){
      c.strokeStyle="#e6efc1";c.lineWidth=1.2;c.beginPath();
      c.moveTo(-28,-42);c.lineTo(tip-span*11,-11);c.moveTo(-29,-15);c.lineTo(tip-span*9,-43);c.stroke();
    }else if(id===5){
      for(let j=0;j<2;j++)pulse(c,-8+j*28,-42+j*2,4+span*(11+j*3),j?"#ddbd71":"#d5e1db");
    }
    c.restore();
  }
  function draw(c,index,x,y,height,pose="idle",beat=0,step,cel){
    const id=resident(index);
    if(id<0||!(height>0))return false;
    const still=typeof reduceMotion!=="undefined"&&reduceMotion;
    const art=painted[id];
    if(art&&FaunaMotion.drawAtlas(c,art.source,x,y,height*heights[id]/native[id]*art.rest/art.cell,{pose,beat,step,cel},still))return true;
    if(!atlas.naturalWidth){load();return false;}
    const t=Math.max(0,Math.min(1,beat)),phase=frame(id,pose,t,still);
    const scale=height*heights[id]/native[id],left=Math.round(x-cellWidth*scale/2),top=Math.round(y-ground*scale);
    c.save();c.imageSmoothingEnabled=false;
    c.drawImage(atlas,phase*cellWidth,id*cellHeight,cellWidth,cellHeight,left,top,cellWidth*scale,cellHeight*scale);
    if(!still&&(pose==="contact"||pose==="strike"&&t>=windup[id]&&t<follow[id])){
      effect(c,id,x,y,scale,pose==="contact"?t:(t-windup[id])/(follow[id]-windup[id]));
    }
    c.restore();return true;
  }
  function transitionCel(index,started,now,still){
    const motion=painted[resident(index)];
    if(motion?.stillCel!==undefined)return FaunaMotion.phaseCel(started,now,still,motion.stillCel);
  }
  return Object.freeze({draw,get ready(){return load();},resident,name,transitionCel,
    motionReady:index=>FaunaMotion.atlasReady(painted[resident(index)]?.source)});
})();
