"use strict";

// Render at a fixed logical pixel density. The original regional panorama stays
// proportional in the middle distance; sky and terrain extend to the screen edges.
const StoryFrame=(()=>{
  const cache=new Map();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const palettes=[
    ["#263d43","#8eac94","#e1cc94","#506b51","#354d41","#333f35","#c5a77a"],
    ["#263e50","#7d9eae","#e0d0a4","#52655e","#354f52","#2b3b3b","#bba789"],
    ["#41394a","#ab857b","#e6bd8b","#7b5d55","#523e45","#36303a","#d1a371"],
    ["#263345","#768fa9","#c3c6b8","#586578","#354958","#273748","#b8bdbc"]
  ];
  const bankPalette=["#263c49","#789f9e","#e8c98d","#668378","#3d625f","#304d4b","#cfb788"];
  function poly(c,color,points){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
  function color(c,x,y,fallback){
    try{const a=c.getImageData(x,y,1,1).data;return "rgb("+a[0]+","+a[1]+","+a[2]+")";}
    catch(error){if(error.name==="SecurityError")return fallback;throw error;}
  }
  function layout(canvas){
    const box=canvas.getBoundingClientRect(),aspect=box.width/Math.max(1,box.height);
    const w=clamp(Math.round(box.width*.65),240,640),h=clamp(Math.round(w/aspect),100,760);
    if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
    return {w,h,ground:Math.round(h*(aspect>1.6?.61:.56))};
  }
  function prop(c,kind,w,g,done){
    const u=Math.min(1.5,w/320),x=w*(kind==="bridge"?.64:.68);
    c.save();c.translate(Math.round(x),g);c.scale(u,u);
    const fill=(x,y,w,h,t)=>{c.fillStyle=t;c.fillRect(x,y,w,h);};
    if(kind==="bridge"){
      // Western pier. A break in the planks closes after the ferryman is rescued.
      for(let i=0;i<12;i++){
        const px=-70+i*7,py=-6-i*2;
        if(!done&&i===7)continue;
        fill(px,py,8,4,"#493d33");fill(px,py,7,2,i%3?"#a77a50":"#cfa46d");
      }
      for(const i of [0,4,9,11]){const px=-68+i*7,py=-6-i*2;fill(px,py-13,3,22,"#503e36");fill(px-1,py-14,5,3,"#b59060");}
      c.strokeStyle="#e1c18b";c.lineWidth=1.5;c.beginPath();c.moveTo(-66,-20);c.lineTo(-52,-19);c.lineTo(-37,-28);if(done)c.lineTo(-3,-38);else c.moveTo(-6,-37);c.lineTo(11,-42);c.stroke();
      poly(c,"#263e3d",[[17,-3],[61,-5],[54,4],[28,6]]);poly(c,"#ad8258",[[19,-4],[61,-6],[54,0],[27,3]]);
      fill(37,-18,2,16,"#6e563c");poly(c,"#d7c394",[[40,-20],[52,-10],[39,-8]]);
    }else if(kind==="sluice"){
      // A two-pier wooden headgate and a geared wheel, visible before and after release.
      for(const px of [-32,22]){
        fill(px,-41,13,47,"#384547");for(let j=0;j<5;j++){fill(px+1,-40+j*9,10,6,j%2?"#7d8173":"#92927d");fill(px+3,-39+j*9,7,1,"#b4aa8a");}
      }
      fill(-38,-46,79,8,"#4b413c");fill(-37,-48,79,3,"#ba9369");fill(-34,-43,74,2,"#927454");
      const lift=done?13:0;
      for(let j=0;j<6;j++){fill(-19,-36+j*5-lift,41,5,"#594a3f");fill(-18,-36+j*5-lift,39,2,j%2?"#a18761":"#947958");}
      fill(-42,-25,24,4,"#534536");fill(-35,-36,4,24,"#564634");
      c.strokeStyle="#4d4338";c.lineWidth=5;c.beginPath();c.arc(-32,-24,12,0,Math.PI*2);c.stroke();
      c.strokeStyle="#b68c55";c.lineWidth=2;c.stroke();fill(-35,-26,6,5,"#d5ae71");
      for(let i=0;i<7;i++){fill(-16+i*5,-1-(done?3:0),3,done?11+i%4:3,i%2?"#c3d9c4":"#79ada8");}
    }
    c.restore();
  }
  function emblem(c,id,w,h){
    c.clearRect(0,0,w,h);c.save();c.scale(w/43,h/31);
    const box=(x,y,w,h,ink)=>{c.fillStyle=ink;c.fillRect(x,y,w,h);};
    if(id===1){
      for(let i=0;i<5;i++){box(3+i*7,20-i*2,8,4,"#694c36");box(3+i*7,20-i*2,6,2,"#e1bf88");}
      for(const [x,y] of [[4,10],[18,7],[35,2]]){box(x,y,3,15,"#bba274");box(x-1,y-1,5,2,"#f4d191");}
      poly(c,"#c0ad81",[[6,11],[12,13],[20,9],[27,10],[36,4],[36,6],[28,12],[21,11],[12,15],[6,13]]);
      box(0,27,12,1,"#8caa9c");box(21,23,16,1,"#92b2a5");
    }else{
      for(const x of [7,31]){box(x,7,6,21,"#798c80");for(let n=0;n<4;n++)box(x,8+5*n,5,2,"#ccbc96");}
      box(3,3,37,4,"#d5bb90");box(11,9,21,12,"#6b5743");for(let y=10;y<20;y+=4)box(12,y,18,2,"#bd9461");
      for(const [x,y] of [[4,11],[1,14],[1,17],[4,20],[7,17],[7,14]])box(x,y,3,3,"#dfb277");
      for(let x=14;x<30;x+=4)box(x,21,2,4+x%3,"#b0d2c5");
    }
    c.restore();
  }
  function background(c,land,{w,h,ground},theme,seed,kind,done){
    if(kind&&window.EventLandscapes?.draw(c,{w,h,ground},kind,done))return;
    const key=[theme,seed,kind,done,w,h,ground,land.dataset.plateReady||0].join("/");
    if(cache.has(key)){c.drawImage(cache.get(key),0,0);return;}
    const off=document.createElement("canvas");off.width=w;off.height=h;const a=off.getContext("2d");a.imageSmoothingEnabled=false;
    const pal=kind==="bridge"||kind==="sluice"||theme==="reach"?bankPalette:palettes[Math.abs(seed+({road:0,outer:1,ending:3}[theme]||0))%palettes.length];
    const originalW=land.width,originalH=land.height,ratio=Math.max(w/originalW,Math.min(h*.53/originalH,w*1.8/originalW));
    const lh=Math.min(h*.63,originalH*ratio),lw=lh/originalH*originalW;
    const y=Math.round(ground-lh*.76),landTop=Math.max(0,y),landEnd=Math.min(h,Math.ceil(y+lh));
    a.fillStyle=pal[0];a.fillRect(0,0,w,h);
    const thumb=document.createElement("canvas");thumb.width=3;thumb.height=3;const ink=thumb.getContext("2d",{willReadFrequently:true});ink.drawImage(land,0,0,3,3);
    const sky=color(ink,1,0,pal[1]),soil=color(ink,1,2,pal[4]),grad=a.createLinearGradient(0,0,0,Math.max(1,landTop+2));
    grad.addColorStop(0,pal[0]);grad.addColorStop(.55,pal[1]);grad.addColorStop(1,sky);a.fillStyle=grad;a.fillRect(0,0,w,h);
    let r=(seed+53)*7369;const random=n=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return (r>>>8)%Math.max(1,n);};
    a.fillStyle=pal[2];a.globalAlpha=.48;
    const sunX=w*(kind==="sluice"?.30:.73),sunY=Math.max(8,landTop*.56),radius=clamp(w*.044,8,18);
    for(let j=-radius|0;j<=radius;j++){const dx=Math.floor(Math.sqrt(Math.max(0,radius*radius-j*j)));a.fillRect(Math.round(sunX)-dx,Math.round(sunY)+j,dx*2,1);}
    a.globalAlpha=.3;for(let i=0;i<12;i++){const x=random(w),cy=random(Math.ceil(Math.max(2,landTop))),n=10+random(Math.floor(w/6));a.fillRect(x,cy,n,1);a.fillRect(x+4,cy-1,n/2|0,1);}a.globalAlpha=1;
    const tall=landTop>h*.16;
    if(tall){
      // Carry the regional horizon up into the portrait composition. Near-side
      // cliffs frame the distant settlement and leave the party's path clear.
      const level=Math.floor((seed+(theme==="outer"?0:3))/20);
      for(let layer=0;layer<3;layer++){
        a.globalAlpha=.20+layer*.10;const points=[[0,landTop+lh*.39]];
        const n=15+layer*4,base=landTop*(.66+.11*layer),slope=landTop*(.10+.035*layer);
        for(let i=0;i<=n;i++){
          const x=i*w/n,edge=Math.pow(Math.abs(2*i/n-1),1.4);
          const ridge=base+slope*(Math.sin(i*.91+level)+.48*Math.cos(i*.5+seed*.23)-edge*1.65);
          points.push([x,ridge],[x+w/n*.24,ridge]);
        }
        points.push([w,landTop+lh*.39]);poly(a,pal[layer===2?4:3],points);
      }a.globalAlpha=1;
      if(theme==="road"&&seed<20){
        for(const side of [0,1]){
          a.save();a.translate(side?w:0,0);if(side)a.scale(-1,1);
          const d=side?1:.8;poly(a,pal[4],[[0,0],[w*.27*d,0],[w*.22*d,h*.02],[w*.24*d,h*.038],[w*.12*d,h*.071],[w*.089*d,h*.06],[w*.07*d,h*.105],[0,h*.13]]);
          poly(a,pal[3],[[0,0],[w*.23*d,0],[w*.19*d,h*.016],[w*.14*d,h*.021],[w*.10*d,h*.05],[w*.053*d,h*.043],[0,h*.095]]);a.restore();
        }
      }
      const blend=Math.max(1,Math.ceil(lh*.31)),left=Math.round((w-lw)/2);
      for(let dy=0;dy<blend;dy+=2){
        const dyh=Math.min(2,blend-dy);a.globalAlpha=(dy+dyh)/blend;
        a.drawImage(land,0,dy*originalH/lh,originalW,dyh*originalH/lh,left,y+dy,Math.ceil(lw),dyh);
      }
      a.globalAlpha=1;a.drawImage(land,0,blend*originalH/lh,originalW,originalH-blend*originalH/lh,left,y+blend,Math.ceil(lw),Math.ceil(lh)-blend);
    }else a.drawImage(land,Math.round((w-lw)/2),y,Math.ceil(lw),Math.ceil(lh));
    const floor=a.createLinearGradient(0,landEnd,0,h);floor.addColorStop(0,soil);floor.addColorStop(.46,pal[4]);floor.addColorStop(1,pal[5]);
    a.fillStyle=floor;a.fillRect(0,landEnd,w,h-landEnd);
    if(kind||theme==="reach"||theme==="ending"){
      poly(a,pal[4],[[0,ground+6],[w*.36,ground-1],[w*.76,ground-7],[w*.97,ground+3],[w*.73,ground+24],[w*.38,h],[0,h]]);
      for(let i=0;i<108;i++){const px=random(w),py=ground+random(h-ground);if(px<w*(.84-.42*(py-ground)/(h-ground))){a.globalAlpha=.18+random(3)*.06;a.fillStyle=i%3?pal[2]:pal[1];a.fillRect(px,py,3+random(15),1);}}
      a.globalAlpha=1;
    }else{
      poly(a,pal[3],[[w*.53,landEnd-1],[w*.64,landEnd-1],[w*.41,h],[w*.04,h]]);
      for(let i=0;i<86;i++){a.globalAlpha=.20;a.fillStyle=i%3?pal[6]:pal[5];const px=random(w),py=landEnd+random(h-landEnd);a.fillRect(px,py,2+random(6),1);}a.globalAlpha=1;
    }
    if(kind)prop(a,kind,w,ground,done);
    c.drawImage(off,0,0);if(cache.size>=6)cache.delete(cache.keys().next().value);cache.set(key,off);
  }
  function portrait(host,actor,line,key){
    if(!host||typeof TalkPortrait==="undefined")return;
    let image=host.querySelector(".story-head");
    if(!image){image=document.createElement("canvas");image.className="story-head";image.setAttribute("aria-hidden","true");host.prepend(image);}
    const ok=window.TalkPortrait.show(image,actor,{speaking:true,line,key});image.hidden=!ok;
  }
  function travel(dialog,canvas,opt){
    EventPlates.warm(opt.theme,opt.from,opt.to,Number(dialog.dataset.beat)||0);
    return function paint(){
      if(dialog.open&&canvas.clientWidth)EventPlates.draw(canvas,opt.theme,opt.from,opt.to,Number(dialog.dataset.beat)||0);
    };
  }
  return {layout,background,portrait,travel,emblem};
})();
