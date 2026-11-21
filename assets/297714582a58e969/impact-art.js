"use strict";
const ImpactArt=(()=>{
  // Five-by-seven digits remain legible when the battle canvas is scaled to a phone.
  const digits=[
    [14,19,21,21,25,17,14], [4,12,4,4,4,4,14], [14,17,1,2,4,8,31],
    [30,1,1,14,1,1,30], [2,6,10,18,31,2,2], [31,16,16,30,1,1,30],
    [6,8,16,30,17,17,14], [31,1,2,4,4,8,8], [14,17,17,14,17,17,14],
    [14,17,17,15,1,2,12]
  ];
  const palettes={
    attack:["#fff7d7","#ffe6a5","#e4a05c","#392738"],
    counter:["#fff3df","#ffb1a1","#eb726a","#41263b"],
    guard:["#efffff","#b4e4e1","#68aaa8","#273a4a"],
    critical:["#fffbea","#ffda70","#ec8747","#4a2a3e"],
    burst:["#fffeed","#bdf7e9","#69cbbc","#263d50"]
  };
  const stampCache=new Map();
  const arcs=[[-.96,.16],[-.70,-.60],[-.18,-.98],[.49,-.82],[.94,-.31],[.75,.38],[.21,.77],[-.46,.66]];
  const accents={
    attack:[0,2,4],counter:[1,3,6],guard:[1,4],
    critical:[0,1,2,3,4,6],burst:[0,1,2,3,4,5,6,7]
  };
  function stamp(amount,style){
    const key=style+amount;
    if(stampCache.has(key))return stampCache.get(key);
    const glyphs=String(amount).split("").map(d=>digits[Number(d)]);
    const mark=style==="guard"?[14,17,17,17,10,4,0]:[0,0,0,14,0,0,0];
    const cells=[];
    for(const [i,rows] of [mark,...glyphs].entries()){
      for(let row=0;row<7;row++)for(let col=0;col<5;col++){
        if(rows[row]&(16>>col))cells.push([2+i*6+col,row+2]);
      }
    }
    const bitmap=document.createElement("canvas");
    bitmap.width=6*(glyphs.length+1)+3;bitmap.height=12;
    const ctx=bitmap.getContext("2d"),[light,main,low,ink]=palettes[style];
    ctx.fillStyle=ink;
    for(const [x,y] of cells){ctx.fillRect(x-1,y-1,3,3);ctx.fillRect(x,y+2,2,1);}
    for(const [x,y] of cells){ctx.fillStyle=y<=3?light:y>=7?low:main;ctx.fillRect(x,y,1,1);}
    if(stampCache.size>=160)stampCache.clear();
    stampCache.set(key,bitmap);return bitmap;
  }
  function spark(c,x,y,age,style,pixel,direction){
    if(age<0||age>.28)return;
    const t=age/.28,[light,main,low]=palettes[style];
    c.globalAlpha*=Math.min(1,(1-t)*2.4);
    for(const i of accents[style]){
      const [vx,vy]=arcs[i],distance=(1+t*(style==="burst"?10:style==="critical"?8:5))*pixel;
      const cx=Math.round(x+vx*distance*direction),cy=Math.round(y+vy*distance);
      const length=t<.57&&i%2===0?2:1;
      c.fillStyle=t>.70?low:main;
      c.fillRect(cx,cy,length*pixel,pixel);
      if(t<.57){c.fillStyle=light;c.fillRect(cx+Math.round(vx*pixel),cy+Math.round(vy*pixel),pixel,pixel);}
    }
  }
  function number(c,w,h,age,impact,hx,ex){
    if(!impact||!Number.isFinite(age)||!Number.isFinite(impact.amount)||impact.amount<0||impact.amount>999)return;
    const incoming=impact.side===2;
    const style=impact.kind==="critical"||impact.kind==="burst"?impact.kind:
      ["guard","blocked","defense"].includes(impact.kind)?"guard":incoming?"counter":"attack";
    const special=style==="critical"||style==="burst";
    const still=typeof reduceMotion!=="undefined"&&reduceMotion;
    // Finishers already have a portrait cut-in through .74s. Let the panel clear first.
    const lead=still?0:special?.74:.12,elapsed=age-lead,hold=special?.91:.86;
    if(elapsed<0||elapsed>=hold)return;
    const glyph=stamp(Math.round(impact.amount),style);
    const unit=Math.max(1,Math.round(h/(special?74:89)));
    const width=glyph.width*unit,height=glyph.height*unit;
    const target=incoming?hx:ex,direction=incoming?1:-1;
    // The inner flank is beyond the face and below the top HUD.
    const left=Math.max(2,Math.min(w-width-2,target+direction*w*.115-width/2));
    const rise=still?0:h*.052*(1-Math.pow(1-Math.min(1,elapsed/.60),2));
    const top=Math.round(h*.495-height/2-rise);
    c.save();c.imageSmoothingEnabled=false;
    c.globalAlpha*=Math.min(1,(hold-elapsed)/.14);
    if(!still&&(impact.amount>0||style==="guard")){
      c.save();
      spark(c,target+direction*w*.053,h*.63,elapsed,style,Math.max(1,Math.round(h/125)),direction);
      c.restore();
    }
    c.drawImage(glyph,Math.round(left),top,width,height);
    c.restore();
  }
  return Object.freeze({number});
})();
