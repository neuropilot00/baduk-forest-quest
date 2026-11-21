"use strict";

// 220 × 105 transparent drawing. ageSeconds is elapsed time since the last correct move.
const BellSigil = (() => {
  const width = 220, height = 105;
  const stars = [[120,66,5], [140,37,6], [168,45,7]];
  const outline = [[33,17],[43,16],[50,18],[51,20],[56,21],[57,25],[61,27],[61,31],[59,33],[60,40],[64,53],[68,59],[67,62],[64,62],[62,60],[59,64],[55,62],[57,67],[54,68],[54,71],[49,74],[43,75],[36,76],[30,77],[18,76],[11,73],[7,72],[3,69],[3,65],[7,62],[10,60],[13,52],[16,42],[18,31],[15,29],[16,25],[21,23],[24,20],[29,20]];
  const dark = "#263639";
  const bronze = {
    shadow:"#423e38", dark:"#5d4a3d", low:"#806248", body:"#a58359",
    side:"#bf9e6c", high:"#d7bc83", gleam:"#e5d7a3",
    green:"#526e64", sea:"#89a496", deep:"#354e4a"
  };
  const dawn = {
    shadow:"#514237", dark:"#79563d", low:"#a37043", body:"#c99554",
    side:"#dfad65", high:"#f6cf83", gleam:"#fff1ba",
    green:"#647b68", sea:"#a4b997", deep:"#415850"
  };
  let metal;

  // Integer scan lines and Bresenham strokes keep the artwork on the same pixel grid
  // as the map sprites. The detailed bell is rasterized once for each metal finish.
  function polygon(c, points, color) {
    c.fillStyle=color;
    const min=Math.min(...points.map(p=>p[1])), max=Math.max(...points.map(p=>p[1]));
    for(let y=min;y<max;y++){
      const scan=y+.5, edges=[];
      for(let i=0,j=points.length-1;i<points.length;j=i++){
        const [x0,y0]=points[j], [x1,y1]=points[i];
        if((y0>scan)!==(y1>scan))edges.push(x0+(x1-x0)*(scan-y0)/(y1-y0));
      }
      edges.sort((a,b)=>a-b);
      for(let i=0;i+1<edges.length;i+=2){
        const lo=Math.ceil(edges[i]-.5), hi=Math.ceil(edges[i+1]-.5);
        c.fillRect(lo,y,hi-lo,1);
      }
    }
  }
  function stroke(c, points, color, thick=1) {
    c.fillStyle=color;
    for(let i=1;i<points.length;i++){
      let [x,y]=points[i-1];const [toX,toY]=points[i];
      const dx=Math.abs(toX-x),dy=-Math.abs(toY-y),sx=x<toX?1:-1,sy=y<toY?1:-1;
      let err=dx+dy;
      while(true){
        c.fillRect(x,y,thick,thick);
        if(x===toX&&y===toY)break;
        const twice=err*2;
        if(twice>=dy){err+=dy;x+=sx;}
        if(twice<=dx){err+=dx;y+=sy;}
      }
    }
  }
  function dots(c, color, points) {
    c.fillStyle=color;
    for(const [x,y,w=1,h=1] of points)c.fillRect(x,y,w,h);
  }
  function cast(awake) {
    const tile=document.createElement("canvas");tile.width=74;tile.height=85;
    const c=tile.getContext("2d"),p=awake?dawn:bronze;
    // The clapper hangs below the left-heavy mouth; the missing right rim exposes it.
    stroke(c,[[32,67],[34,73],[33,80]],dark,3);
    polygon(c,[[30,78],[34,77],[37,79],[36,83],[33,84],[29,82]],p.dark);
    dots(c,p.high,[[31,79,3,1],[30,80],[33,77,1,2]]);
    // A woven bronze suspension loop and dragon-shaped crown. Both spaces in the loop are clear.
    stroke(c,[[29,20],[26,17],[24,12],[26,8],[30,7],[34,10],[36,16],[41,16],[46,12],[45,8],[41,7],[38,10]],dark,3);
    stroke(c,[[27,16],[25,12],[27,9],[30,8],[33,10],[35,14]],p.high);
    stroke(c,[[38,16],[43,14],[46,10],[44,8],[41,8]],p.sea);
    polygon(c,[[29,19],[31,14],[34,13],[37,15],[41,14],[45,11],[50,11],[50,13],[46,14],[46,17],[42,20]],p.low);
    dots(c,p.gleam,[[30,8,2,1],[41,15,3,1],[46,12,2,1]]);
    polygon(c,outline,dark);
    // Cast shoulders, patinated tail plane and an oval cross-section in warm directional light.
    polygon(c,[[19,27],[24,23],[34,19],[44,18],[53,22],[59,28],[58,34],[60,45],[64,56],[66,59],[61,58],[58,61],[54,60],[52,66],[47,70],[36,73],[20,72],[10,68],[9,65],[15,56],[18,44],[20,32]],p.low);
    polygon(c,[[19,30],[25,24],[37,21],[42,21],[42,37],[39,55],[39,68],[26,71],[15,68],[12,65],[16,57],[20,43]],p.body);
    polygon(c,[[22,30],[27,26],[31,25],[30,37],[27,46],[25,59],[23,65],[18,66],[20,55],[23,43]],p.side);
    polygon(c,[[47,20],[53,23],[56,26],[56,37],[58,48],[62,57],[55,57],[53,50],[51,37]],p.green);
    polygon(c,[[53,28],[58,29],[58,39],[60,49],[65,58],[61,58],[57,51],[55,40]],p.deep);
    // Glancing light sits on two beaded rings. Their curved bands also describe the bell in silhouette.
    stroke(c,[[17,27],[23,28],[30,28],[41,25],[49,24],[57,25]],p.dark,3);
    stroke(c,[[17,25],[24,26],[31,26],[41,23],[48,22],[54,23]],p.high,2);
    stroke(c,[[18,31],[26,32],[34,31],[43,28],[51,27],[58,29]],dark,2);
    stroke(c,[[21,30],[27,30],[35,29],[43,27],[48,26]],p.sea);
    dots(c,p.gleam,[[21,25,5,1],[34,25],[43,23,3,1],[25,33,1,2],[28,27,2,1]]);
    // Individual casting studs, worn flutes, and a raised round sunrise above two water lines.
    dots(c,p.dark,[[21,35,2,2],[25,35,2,2],[29,34,2,2],[21,39,2,2],[25,39,2,2],[29,38,2,2],[47,31,2,2],[51,31,2,2],[47,35,2,2],[52,35,2,2]]);
    dots(c,p.high,[[21,35],[25,35],[29,34],[21,39],[25,39],[29,38],[47,31],[51,31],[47,35]]);
    stroke(c,[[19,49],[18,55],[15,60]],p.high);
    stroke(c,[[22,46],[20,53],[19,58]],p.low);
    stroke(c,[[43,34],[42,42],[43,45]],p.dark);
    polygon(c,[[32,45],[36,43],[40,44],[42,47],[41,51],[38,53],[34,52],[31,49]],p.low);
    stroke(c,[[32,48],[34,45],[38,44],[40,45]],p.high);
    stroke(c,[[29,53],[33,53],[37,51],[41,51],[44,52]],p.green,2);
    stroke(c,[[29,55],[34,55],[38,53],[42,53]],p.high);
    // Mouth interior and folded lower lip. The terminating outlines define a jagged break to the right.
    polygon(c,[[5,65],[13,63],[24,65],[33,66],[43,63],[49,61],[54,62],[52,67],[49,71],[40,74],[30,76],[18,74],[9,71],[5,69]],p.shadow);
    stroke(c,[[7,64],[13,62],[22,63],[30,64],[38,63],[45,60],[50,59],[55,60]],p.dark,3);
    stroke(c,[[7,64],[13,63],[21,64],[30,65],[37,64],[46,61],[50,60]],p.high,2);
    stroke(c,[[6,69],[13,71],[22,73],[31,73],[40,71],[48,68]],p.green,2);
    stroke(c,[[9,69],[16,71],[25,72]],p.sea);
    // The break enters through the missing right lip, then branches through the cast wall.
    stroke(c,[[66,60],[61,58],[58,62],[53,60],[55,66],[51,68],[52,71]],dark,2);
    stroke(c,[[57,61],[55,55],[52,53],[53,50],[49,47],[48,43]],p.shadow,2);
    stroke(c,[[53,51],[56,48],[57,44]],p.deep);
    stroke(c,[[51,67],[53,64],[51,60],[54,58]],p.gleam);
    stroke(c,[[49,45],[50,48],[54,50],[53,53]],awake?p.gleam:p.side);
    dots(c,p.sea,[[55,34,2,1],[55,38],[57,42],[17,57,2,1],[44,69],[39,72,2,1],[35,70],[51,40]]);
    if(awake){
      stroke(c,[[30,51],[32,47],[34,45],[37,44]],p.gleam);
      stroke(c,[[38,66],[43,64],[46,63]],p.gleam);
      dots(c,"#fff7d3",[[24,25,3,1],[49,49],[54,51],[53,64],[15,64,3,1],[35,45],[32,79,2,1]]);
    }
    return tile;
  }

  const clamp=n=>Math.max(0,Math.min(1,n));
  function birth(age) {
    return age<1.05?Math.sin(Math.PI*clamp(age/.64))*Math.exp(-age*2.5):0;
  }
  function constellation(c,count,age,moving) {
    const marks=[[100,71],...stars];
    for(let i=0;i<stars.length;i++){
      const [x,y,r]=stars[i], [ax,ay]=marks[i], steps=Math.ceil(Math.hypot(x-ax,y-ay)/4);
      const lit=i<count, waking=moving&&i===count-1;
      const growth=waking?clamp(age/.23):1;
      for(let j=1;j<steps;j++){
        const f=j/steps,px=Math.round(ax+(x-ax)*f),py=Math.round(ay+(y-ay)*f);
        c.fillStyle="#203c40";c.fillRect(px-1,py-1,3,3);
        c.fillStyle=lit&&f<=growth?"#c0a674":"#68847d";c.fillRect(px,py,1,1);
      }
      // A hollow diamond reads as an empty socket on both dark and sunlit backgrounds.
      stroke(c,[[x,y-r],[x+r,y],[x,y+r],[x-r,y],[x,y-r]],dark,2);
      stroke(c,[[x,y-r],[x+r,y],[x,y+r],[x-r,y],[x,y-r]],lit?"#d8b979":"#8daba1");
      if(!lit){dots(c,"#344c4a",[[x-1,y-1,2,2]]);continue;}
      const extra=waking?Math.round(birth(age)*4):0, arm=r+extra;
      c.fillStyle="#594b39";c.fillRect(x-1,y-arm-1,3,arm*2+3);c.fillRect(x-arm-1,y-1,arm*2+3,3);
      polygon(c,[[x,y-arm],[x+2,y-2],[x+arm,y],[x+2,y+2],[x,y+arm+1],[x-2,y+2],[x-arm,y],[x-2,y-2]],"#d5a763");
      stroke(c,[[x,y-arm+1],[x,y+arm-1]],"#ffe9a2");
      stroke(c,[[x-arm+1,y],[x+arm-1,y]],"#edca7e");
      dots(c,"#fff8d9",[[x-1,y-1,3,3]]);
    }
  }
  function draw(canvas, solvedCount, ageSeconds, reduceMotion=false){
    if(!canvas)return;
    const c=canvas.getContext("2d");if(!c)return;
    const count=Math.max(0,Math.min(3,Math.trunc(Number(solvedCount))||0));
    const age=Number.isFinite(ageSeconds)?Math.max(0,ageSeconds):2;
    const moving=count>0&&!reduceMotion&&age<1.35;
    if(!metal)metal=[cast(false),cast(true)];
    c.save();c.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    c.clearRect(0,0,width,height);c.imageSmoothingEnabled=false;
    if(count===3){
      // Small reflection under the casting; the transparent corners and the painting remain clear.
      const glint=moving?birth(age):0;
      c.globalAlpha=.20+glint*.12;
      stroke(c,[[50,88],[59,88],[65,90],[80,90],[86,88]],"#ffe5a0");
      stroke(c,[[65,93],[83,93],[91,91]],"#b4c7a4");
      c.globalAlpha=1;
    }
    constellation(c,count,age,moving);
    // The hanger is the pivot. The scene, board and constellation stay still.
    c.save();c.translate(78,15);
    if(moving)c.rotate(Math.sin(age*18)*Math.exp(-age*4.1)*(count===3?.115:.084));
    c.drawImage(metal[Number(count===3)],-34,-9);c.restore();
    if(count===3&&moving&&age>.12&&age<.86){
      const k=clamp((age-.12)/.74);c.globalAlpha=Math.sin(Math.PI*k)*.72;
      dots(c,"#ffeab0",[[108+Math.round(k*4),66-Math.round(k*6),2,1],[80+Math.round(k*3),50-Math.round(k*4)],[62,73-Math.round(k*3)]]);
    }
    c.restore();
  }
  return {draw};
})();
