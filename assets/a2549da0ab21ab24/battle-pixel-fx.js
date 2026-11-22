"use strict";
const BattlePixelFX=(()=>{
  const atlas=new Image();
  atlas.dataset.pixelCombat="";
  atlas.src="./pixel-combat-atlas.webp";
  const ready=()=>atlas.complete&&atlas.naturalWidth>0;

  function draw(c,kind,f,x,y,scale,mirror=false,reduced=false){
    if(f<0||f>=1)return;
    const frames=PixelCombatFrames[kind];
    const still={slash:.18,claw:.31,hit:.15,shield:.2,thrust:.19,link:.35,heal:.39,critical:.14,burst:.28};
    const frame=frames[Math.floor((reduced?still[kind]:f)*(frames.length-1))];
    if(!frame)return;
    const [sx,sy,sw,sh,dx,dy]=frame;
    c.save();
    c.imageSmoothingEnabled=false;
    // Leave the health and name banners readable and confine particles to the arena.
    c.beginPath();
    c.rect(0,Math.round(c.canvas.height*.18),c.canvas.width,Math.round(c.canvas.height*.82));
    c.clip();
    c.globalAlpha=reduced?Math.min(.74,(1-f)*2.4):Math.min(1,(1-f)*5);
    c.translate(Math.round(x),Math.round(y));
    if(mirror)c.scale(-1,1);
    c.drawImage(atlas,sx,sy,sw,sh,Math.round(dx*scale),Math.round(dy*scale),
      Math.max(1,Math.round(sw*scale)),Math.max(1,Math.round(sh*scale)));
    c.restore();
  }

  function action(c,frame,kind,points,scale){
    if(!ready())return false;
    const {p,reduced}=frame;
    const {source,target,enemy}=points;
    const u=Math.min(1.25,scale/68);
    if(kind==="protect"||kind==="guard"){
      draw(c,"shield",(p-.35)/.65,target.x,target.ground,u,false,reduced);
    }else if(kind==="remedy"){
      draw(c,"heal",(p-.32)/.68,target.x,target.ground,u*.84,false,reduced);
    }else if(kind==="relay"){
      const mid=(source.x+enemy.x)/2;
      draw(c,"link",(p-.22)/.78,mid,(source.y+enemy.y)/2,u*.83,false,reduced);
    }else{
      const counter=kind==="counter",point=counter?target:enemy;
      const swing=counter?"claw":kind==="follow"?"thrust":"slash";
      draw(c,swing,(p-.27)/.69,point.x,point.y,u*.85,counter,reduced);
      draw(c,"hit",(p-.40)/.56,point.x,point.y,u*.58,counter,reduced);
    }
    return true;
  }

  function finisher(c,kind,age,x,y,scale,reduced){
    if(!ready())return;
    const name=kind==="burst"?"burst":"critical";
    draw(c,name,age/(kind==="burst"?.96:.58),x,y,Math.min(1.1,scale/85),false,reduced);
  }
  return Object.freeze({action,finisher});
})();
