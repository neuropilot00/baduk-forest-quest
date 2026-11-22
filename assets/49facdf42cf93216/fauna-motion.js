"use strict";

// Canonical drawing units are hundredths of the actor's height. The contact path follows
// the attacking body part, while the pose itself comes from the articulated sprite sheet.
const FaunaMotion=(()=>{
  const palette={leaf:"#c8da8e",earth:"#e0b477",tide:"#a5e5d9",ice:"#caeeff",coal:"#ed9d70",sun:"#ffdf8b",night:"#c2b2ee"};
  const spec=(organ,movement,mark,hue,points)=>({organ,movement,mark,hue:palette[hue],points});
  const field=[
    spec("horn","drive","chips","earth",[[-19,-76],[-37,-65],[-58,-48],[-64,-42]]),
    spec("bill","spear","splash","tide",[[-10,-74],[-30,-84],[-48,-59],[-54,-34]]),
    spec("armored back","roll","plates","leaf",[[6,-60],[-12,-80],[-46,-63],[-50,-22]]),
    spec("mouth","thrust","flame","coal",[[-20,-52],[-41,-56],[-50,-48],[-68,-56]]),
    spec("wing scales","hover","dust","sun",[[17,-85],[-10,-77],[-26,-55],[-47,-44]]),
    spec("wing feathers","swoop","feathers","ice",[[20,-75],[0,-91],[-31,-81],[-50,-53]]),
    spec("stinger","hook","crystal","night",[[28,-81],[5,-94],[-23,-80],[-40,-48]]),
    spec("shell shrine","brace","seal","sun",[[9,-73],[4,-60],[-17,-47],[-35,-44]]),
    spec("velvet crown","bound","leaves","leaf",[[-7,-91],[-31,-87],[-56,-58],[-42,-48]]),
    spec("stump and claw","clamp","chips","earth",[[-21,-43],[-39,-56],[-53,-49],[-42,-34]]),
    spec("hind paws","hop","petals","leaf",[[17,-15],[6,-44],[-28,-74],[-50,-27]]),
    spec("sickle arms","shear","slashes","leaf",[[-6,-62],[-28,-86],[-62,-45],[-40,-55]]),
    spec("anchor pincer","clamp","link","tide",[[-16,-52],[-36,-82],[-59,-63],[-44,-49]]),
    spec("mantle","pulse","drops","tide",[[0,-50],[-11,-60],[-31,-48],[-48,-26]]),
    spec("reed spear bill","peck","lines","sun",[[-22,-77],[-6,-89],[-51,-72],[-73,-65]]),
    spec("pectoral sail","bank","ribbons","tide",[[19,-64],[-2,-82],[-32,-39],[-58,-49]]),
    spec("dorsal fin","coil","spiral","sun",[[6,-42],[-3,-71],[-31,-75],[-48,-63]]),
    spec("siphon","jet","bubbles","tide",[[-13,-32],[-24,-37],[-41,-20],[-60,-35]]),
    spec("eel spine","coil","current","tide",[[23,-32],[4,-61],[-24,-37],[-60,-54]]),
    spec("bait lure","snap","spark","sun",[[-29,-72],[-35,-88],[-44,-63],[-59,-46]]),
    spec("paddle forepaw","sweep","splash","tide",[[-9,-34],[-29,-19],[-53,-40],[-61,-67]]),
    spec("forewings","dart","veins","tide",[[12,-71],[-15,-89],[-36,-62],[-68,-69]]),
    spec("stone jaw","snap","teeth","tide",[[-22,-64],[-8,-70],[-49,-62],[-64,-52]]),
    spec("hinged valve","brace","pearl","tide",[[3,-39],[-10,-66],[-35,-61],[-53,-43]]),
    spec("chimney back","stamp","smoke","coal",[[13,-79],[-2,-96],[-30,-94],[-49,-79]]),
    spec("scissor mandibles","shear","teeth","earth",[[-14,-57],[-35,-80],[-57,-56],[-42,-43]]),
    spec("upturned tusk","drive","embers","coal",[[-20,-40],[-37,-26],[-60,-41],[-67,-63]]),
    spec("adhesive toes","skitter","footprints","earth",[[11,-20],[-9,-55],[-40,-36],[-55,-51]]),
    spec("soot primaries","swoop","ash","coal",[[15,-82],[-4,-97],[-46,-59],[-56,-35]]),
    spec("hammer beak","peck","chips","earth",[[-19,-76],[-3,-85],[-46,-72],[-59,-66]]),
    spec("iron girdle","roll","hoops","earth",[[18,-54],[4,-82],[-35,-80],[-56,-30]]),
    spec("three throats","fan","flame","coal",[[15,-55],[-4,-70],[-30,-63],[-56,-69]]),
    spec("running foot","kick","embers","earth",[[0,-23],[11,-49],[-23,-44],[-50,-28]]),
    spec("mining claw","burrow","gravel","earth",[[-12,-30],[-31,-11],[-49,-14],[-59,-47]]),
    spec("vent tentacles","pulse","smoke","coal",[[13,-14],[1,-40],[-32,-27],[-50,-41]]),
    spec("quills","brace","spines","earth",[[22,-69],[7,-92],[-24,-87],[-49,-71]]),
    spec("star arms","cartwheel","embers","sun",[[20,-66],[1,-96],[-32,-64],[-51,-29]]),
    spec("flipper and breast","slide","frost","ice",[[0,-39],[-17,-31],[-39,-21],[-60,-17]]),
    spec("ice flukes","sweep","ribbons","ice",[[22,-33],[12,-53],[-25,-24],[-57,-13]]),
    spec("star horn","drive","star","ice",[[-23,-63],[-35,-68],[-58,-57],[-70,-52]]),
    spec("long tusks","stamp","icicles","ice",[[-26,-37],[-32,-56],[-43,-34],[-51,-18]]),
    spec("gliding membrane","bank","stars","night",[[19,-50],[5,-77],[-28,-66],[-59,-40]]),
    spec("candelabra antlers","bound","spark","sun",[[-8,-90],[-37,-96],[-50,-69],[-60,-56]]),
    spec("trunk and tusks","hook","frost","ice",[[-18,-36],[-43,-25],[-53,-45],[-36,-65]]),
    spec("dorsal cerata","pulse","shards","ice",[[21,-61],[3,-81],[-27,-61],[-50,-65]]),
    spec("wing bells","hover","chime","night",[[11,-69],[-6,-86],[-30,-64],[-44,-45]]),
    spec("glass wing and bill","dive","feathers","ice",[[-16,-86],[-38,-97],[-51,-68],[-62,-46]]),
    spec("cephalic fins","bank","aurora","night",[[19,-61],[-6,-86],[-36,-49],[-64,-39]]),
    spec("bell tail","feint","chime","sun",[[25,-63],[11,-84],[-28,-56],[-48,-41]]),
    spec("armored forepaw","swing","plates","ice",[[1,-48],[-19,-70],[-54,-46],[-43,-22]])
  ];
  const guards=[
    {source:7,move:spec("sluice carapace","brace","seal","sun",[[-6,-68],[-20,-71],[-35,-48],[-49,-33]]),crest:"wheel"},
    {source:1,move:spec("mist-skimming bill","dive","ribbons","tide",[[-20,-83],[-39,-97],[-57,-65],[-75,-33]]),crest:"wake"},
    {source:6,move:spec("prismatic stinger","hook","shards","night",[[30,-77],[8,-106],[-28,-91],[-53,-44]]),crest:"prism"},
    {source:5,move:spec("archive wing","fan","feathers","ice",[[24,-79],[0,-105],[-32,-74],[-53,-56]]),crest:"pages"},
    {source:0,move:spec("kiln-melted horns","drive","embers","coal",[[-14,-82],[-39,-76],[-60,-57],[-75,-43]]),crest:"anvil"},
    {source:3,move:spec("crater throat","thrust","flame","coal",[[-17,-43],[-32,-55],[-54,-49],[-78,-68]]),crest:"caldera"},
    {source:4,move:spec("snow-bell wings","hover","chime","ice",[[18,-87],[0,-101],[-32,-80],[-52,-60]]),crest:"bells"},
    {source:null,move:spec("whiskers and claws","coil","aurora","sun",[[-30,-52],[-47,-81],[-75,-62],[-81,-37]]),crest:"twinbanks"}
  ];
  // Each choreography names the mechanics of the body, and deltas for its grounded pivot.
  // Time is shared with board placement. The four rows are rest, preparation, extension and injury.
  const motions={
    spear:[168,279,[.03,8,-4],[-.025,-38,-9]],drive:[126,249,[-.10,3,1],[.12,-14,1]],dive:[104,257,[.11,4,-6],[-.18,-15,5]],
    roll:[140,256,[-.13,3,3],[-.50,-12,-1]],thrust:[98,235,[.09,4,1],[-.11,-13,0]],
    hover:[147,259,[.05,1,-4],[-.09,-8,-8]],swoop:[124,266,[.12,1,-8],[-.15,-13,-1]],
    hook:[150,266,[-.07,3,-1],[.12,-6,2]],brace:[158,249,[-.045,0,3],[.07,-3,1]],
    bound:[115,247,[-.12,3,3],[.10,-12,-8]],clamp:[135,244,[.05,3,1],[-.12,-8,1]],
    hop:[93,242,[-.15,2,3],[.05,-12,-11]],shear:[104,222,[.08,1,-2],[-.16,-10,1]],
    pulse:[157,255,[.04,0,2],[-.04,-5,-5]],peck:[110,224,[.14,4,-3],[-.19,-10,2]],
    bank:[147,276,[.16,2,-4],[-.22,-14,-4]],coil:[157,247,[.14,2,4],[-.12,-9,-4]],
    jet:[130,240,[-.05,-1,1],[.14,6,-4]],snap:[130,225,[.13,3,2],[-.14,-10,-2]],
    sweep:[135,270,[.12,2,0],[-.23,-7,-4]],dart:[98,231,[.07,3,-4],[-.09,-16,-5]],
    stamp:[155,248,[.09,1,-6],[-.11,-4,2]],skitter:[92,237,[-.07,3,2],[.14,-12,-3]],
    fan:[146,277,[.12,0,-1],[-.15,-4,-3]],kick:[122,246,[-.12,1,0],[.19,-9,-4]],
    burrow:[139,250,[.12,0,4],[-.17,-9,3]],cartwheel:[132,272,[.19,3,1],[-.57,-12,-4]],
    slide:[138,266,[.14,3,-2],[-.19,-15,2]],feint:[101,248,[.17,5,-2],[-.13,-10,-3]],
    swing:[142,254,[.17,2,-2],[-.23,-10,2]]
  };
  let side=0,started=-Infinity,gate=-1,round=0,changed=-Infinity;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const now=()=>performance.now();
  function reset(){side=0;started=-Infinity;gate=-1;changed=-Infinity;}
  function strike(color,time=now()){if(color!==1&&color!==2)return;side=color;started=time;}
  function transition(rank,phase,time=now()){gate=rank;round=phase;changed=time;}
  function sample(id,boss,time,reduced=false,requested=0){
    const body=boss?guards[id]?.move:field[id];if(!body)return null;
    const track=motions[body.movement],warm=track[0],impact=warm+track[1],age=time-started;
    const still={body,pose:0,label:"rest",power:0,tilt:0,dx:0,dy:0};
    if(reduced||requested<0)return still;
    if(age<0||age>630||!side){
      // Breathing consists of the atlas's independently articulated wing, tail or leg motion.
      const breathing=requested===1||((time+id*31)%(1150+warm)<warm);
      return {...still,pose:breathing?1:0};
    }
    if(side===1){
      if(age<85)return still;
      if(age<430){const f=Math.sin(Math.PI*clamp((age-85)/345));
        return {...still,pose:3,label:"hit",power:f,tilt:-track[3][0]*f*.6,dx:3*f,dy:!boss&&id===1?-32*f:track[2][2]*f*.3};}
      return {...still,label:"return",pose:age<505?3:0};
    }
    let label,pose,power,data;
    if(age<warm){label="tell";pose=1;power=clamp(age/warm);data=track[2];}
    else if(age<impact){label="execute";pose=2;power=Math.sin(Math.PI*clamp((age-warm)/(impact-warm)));data=track[3];}
    else{label="return";pose=age<impact+106?1:0;power=(1-clamp((age-impact)/155))*.45;data=track[3];}
    return {body,label,pose,power,tilt:data[0]*power,dx:data[1]*power,dy:data[2]*power};
  }
  // Visible height compared with the complete standing Solbi silhouette. The
  // natural alpha extent of each rest frame differs even though all use a 96px tile.
  const fieldRatio=[
    .85,.30,.44,.25,.26,.48,.32,.77,1.02,.32,.34,.27,
    .38,.45,.76,.55,.30,.47,.35,.45,.48,.24,.55,.25,
    .91,.26,.78,.24,.42,.36,.46,1.10,1.13,.27,.48,.30,.28,
    .48,.65,1.08,.90,.30,1.05,1.28,.25,.33,.92,.77,.49,1.10
  ];
  const restExtent=[
    105,100,62,63,78,102,89,90,108,87,104,79,65,108,87,85,111,92,55,77,58,91,87,85,107,
    70,79,73,79,102,65,80,108,74,93,77,101,107,57,93,74,75,108,90,66,64,96,82,71,80
  ];
  function fieldHeight(id,standingHero){
    const silhouette=standingHero*WorldScale.heroBattleNominal/WorldScale.heroBattlePixels;
    return silhouette*(fieldRatio[id]??.65)*100/(restExtent[id]??100);
  }
  const fisher=new Image();fisher.decoding="async";fisher.src="./field-kingfisher.webp";
  function kingfisher(c,m,time,reduced){
    const resting=reduced?0:(time%2350>=1520&&time%2350<1770?6:m.pose===1?1:0);
    const frame=({tell:2,execute:3,hit:4,return:5})[m.label]??resting;
    // 60 visible source pixels when the feet are planted, fixed anchor through all seven poses.
    c.drawImage(fisher,frame*156,0,156,135,-128.75,-190,260,225);
  }
  let reactionSheet,loading;
  // The map and collection use their existing art. Decode this shared sheet at battle entry.
  function prepare(){
    if(loading)return loading;
    reactionSheet=new Image();reactionSheet.decoding="async";reactionSheet.src="./fauna-reactions.webp";
    loading=reactionSheet.decode().then(()=>reactionSheet,()=>null);
    return loading;
  }
  const actionIndex={tell:0,execute:1,hit:2,return:3};
  function stageChange(id,boss,time){
    const age=time-changed;
    return boss&&gate===id&&age>=260&&age<575&&!(side===2&&started>changed);
  }
  const lerp=(a,b,f)=>a+(b-a)*f;
  function point(path,p){
    const q=clamp(p)*(path.length-1),i=Math.min(path.length-2,Math.floor(q)),f=q-i;
    return [lerp(path[i][0],path[i+1][0],f),lerp(path[i][1],path[i+1][1],f)];
  }
  function trace(c,points,closed=false){
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(closed)c.closePath();c.stroke();
  }
  function diamond(c,x,y,r){c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.65,y);c.lineTo(x,y+r);c.lineTo(x-r*.65,y);c.closePath();c.fill();}
  function ring(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.stroke();}
  const flakes=new Set(["dust","embers","ash","smoke","gravel","petals","chips","leaves","stars","spark"]);
  const water=new Set(["splash","current","ribbons","aurora","frost"]);
  const blades=new Set(["slashes","lines","teeth","icicles","spines","shards","crystal","feathers","veins"]);
  function accent(c,m,time){
    const path=m.body.points,mark=m.body.mark,hue=m.body.hue;
    if(m.label!=="execute"&&m.label!=="tell")return;
    c.save();c.strokeStyle=hue;c.fillStyle=hue;c.lineCap="round";c.lineWidth=1.4;
    const [sx,sy]=path[0];
    if(m.label==="tell"){
      c.globalAlpha*=m.power*.7;
      const [x,y]=point(path,.18*m.power);
      trace(c,[[sx-2,sy],[x,y],[x+2,y-3]]);
      c.restore();return;
    }
    const track=motions[m.body.movement],t=clamp((time-started-track[0])/track[1]);
    const [x,y]=point(path,t),[px,py]=point(path,Math.max(0,t-.34));c.globalAlpha*=Math.sin(Math.PI*t)*.82;
    if(flakes.has(mark)){
      for(let k=0;k<4;k++){
        const u=clamp(t-k*.09);const [a,b]=point(path,u),sx=a+(k-1.5)*3.2,sy=b+Math.sin(k*2.2+u*4)*5;
        if(mark==="smoke"){c.globalAlpha*=.79;ring(c,sx,sy,2+k*1.1,2.3+k*.6);}
        else if(mark==="leaves"||mark==="petals"){trace(c,[[sx-3,sy-1],[sx+1,sy-2],[sx+3,sy],[sx-1,sy+2]],true);}
        else if(mark==="spark"||mark==="stars"){diamond(c,sx,sy,2.2+k*.4);}
        else c.fillRect(Math.round(sx),Math.round(sy),k%2?2:3,k%2?3:2);
      }
    }else if(water.has(mark)){
      const waves=mark==="aurora"?3:2;
      for(let k=0;k<waves;k++){c.beginPath();c.moveTo(px,py+k*3);c.quadraticCurveTo((px+x)/2,Math.min(py,y)-5-k*2,x,y+k*2);c.stroke();}
      if(mark==="splash"||mark==="frost"){ring(c,x,y+2,3+4*t,1+2*t);}
    }else if(blades.has(mark)){
      const count=mark==="icicles"||mark==="spines"?4:3;
      for(let k=0;k<count;k++){const [a,b]=point(path,clamp(t-k*.11));const v=(k-1)*3;
        if(mark==="crystal"||mark==="shards"){diamond(c,a+v,b-v,3+k);}
        else if(mark==="feathers"){trace(c,[[a+v,b-v],[a+v+3,b+v-4],[a+v+2,b+v+1]],true);}
        else trace(c,[[a+v+4,b-v-3],[a+v-3,b-v+3]]);
      }
    }else if(mark==="flame"){
      trace(c,[[px,py],[x+7,y-6],[x+4,y-1],[x-3,y-3],[x+1,y+2],[x-5,y+3]]);
    }else if(mark==="spiral"){
      const pts=[];for(let k=0;k<11;k++){const a=k*.59,r=1+k*.39;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}trace(c,pts);
    }else if(mark==="footprints"){for(let k=0;k<3;k++){const [a,b]=point(path,clamp(t-k*.16));c.fillRect(a,b,2,3);c.fillRect(a+2,b-2,2,2);}}
    else if(mark==="chime"){for(let k=0;k<2;k++){c.beginPath();c.arc(x,y,3+3*k+2*t,.5,2.5);c.stroke();}}
    else if(mark==="seal"||mark==="plates"){trace(c,[[px,py-5],[x+2,y-3],[x+2,y+2],[px,py+5],[px-3,py]],true);}
    else if(mark==="star"){for(let k=0;k<4;k++){const a=k*Math.PI/2;trace(c,[[x,y],[x+Math.cos(a)*6,y+Math.sin(a)*6]]);}}
    else if(mark==="pearl"){c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();ring(c,x,y,6,5);}
    else {for(let k=0;k<3;k++){const [a,b]=point(path,clamp(t-k*.16));ring(c,a,b,k+2,k+1.5);}}
    c.restore();
  }
  function crest(c,rank,p){
    const k=guards[rank].crest,x=-8,y=-39;
    c.save();c.translate(x,y);c.rotate((Math.min(4,Math.max(0,round))-2)*.055);c.strokeStyle=guards[rank].move.hue;c.fillStyle=c.strokeStyle;c.lineWidth=1.8;c.globalAlpha*=Math.sin(Math.PI*p)*.83;
    const r=13+17*p;
    if(k==="wheel"){for(let i=0;i<3;i++){const a=(i*2*Math.PI/3)+p*.7;c.beginPath();c.arc(0,5,r,a,a+.75);c.stroke();}}
    else if(k==="wake"){for(let j=0;j<3;j++){trace(c,[[-r,9+j*4],[-r*.43,6+j*4],[0,0+j*4],[r*.5,7+j*4],[r,10+j*4]]);}}
    else if(k==="prism"){for(let j=0;j<3;j++){const a=(j-1)*.7;diamond(c,Math.sin(a)*r,-Math.cos(a)*r,3+j);}}
    else if(k==="pages"){for(let j=-1;j<2;j++){const a=j*11;trace(c,[[a-6,-r+2],[a+3,-r-3],[a+6,3-r],[a-4,7-r]],true);}}
    else if(k==="anvil"){trace(c,[[-r,6],[-r*.4,6],[-r*.2,2],[r*.4,2],[r,6]]);for(let j=0;j<3;j++)diamond(c,-10+j*11,-p*13-3,2);}
    else if(k==="caldera"){for(let j=-1;j<2;j++){const dx=j*12;trace(c,[[dx,9],[dx-4,4],[dx+3,-r*.55],[dx+6,2]]);}}
    else if(k==="bells"){for(let j=-1;j<2;j++){const dx=j*12;trace(c,[[dx-4,-r+5],[dx-3,-r],[dx,-r-3],[dx+3,-r],[dx+4,-r+5]],true);}}
    else{for(const sign of [-1,1]){c.beginPath();c.moveTo(sign*r,3);c.bezierCurveTo(sign*r*.5,-r,sign*r*.2,r,0,-4);c.stroke();}}
    c.restore();
  }
  // Source rectangles never change after decoding; frame selection never allocates a canvas.
  const cells=Array.from({length:50},(_,id)=>Array.from({length:4},(_,p)=>[((id%5)*4+p)*96,Math.floor(id/5)*96,96,96]));
  const dragon=new Image();
  const dragonReady=new Promise(resolve=>{dragon.onload=()=>resolve(true);dragon.onerror=()=>resolve(false);});
  dragon.decoding="async";dragon.src="./dawn-bell-dragon.webp";
  function drawDragon(c,m,poised){
    if(!dragon.naturalWidth)return;
    const frame=m.label==="hit"||m.pose===3?4:m.label==="execute"||m.pose===2?3:
      m.label==="tell"||poised?2:m.pose===1?1:0;
    // Pre-filtered cutouts retain the antlers and the hanging bell on a 19-line
    // phone screen. Their pivot and world-space dimensions are the same.
    const transform=c.getTransform?.();
    const pixels=transform?100*Math.hypot(transform.c,transform.d):100;
    const shrink=pixels<=88?4:pixels<=175?2:1;
    const width=384/shrink,height=304/shrink,top=shrink===4?456:shrink===2?304:0;
    c.imageSmoothingEnabled=false;
    c.drawImage(dragon,width*frame,top,width,height,-77,-117,153,121);
  }
  function drawBody(c,o,m,time){
    const {id,boss,pose=0,reduced=false,sheet,poses}=o;
    if(o.fieldBattle&&!boss&&id===1&&fisher.naturalWidth){
      kingfisher(c,m,time,reduced);return true;
    }
    // On a cold load the original supplied bird may arrive before either atlas.
    if(o.fieldBattle&&!boss&&id===1&&!sheet?.naturalWidth&&o.original?.naturalWidth){
      c.drawImage(o.original,144,0,144,144,-60,-113.1,120,120);return true;
    }
    const high=!!poses?.naturalWidth&&((!boss&&id===0)||(boss&&(id===0||id===4)));
    if(!(boss&&id===7)&&!high&&!sheet?.naturalWidth)return false;
    const change=!reduced&&pose>=0&&stageChange(id,boss,time);
    const key=change?4:actionIndex[m.label];
    if(!reduced&&pose>=0&&!loading)prepare();
    if(boss&&id===7)drawDragon(c,m,change);
    else if(!reduced&&pose>=0&&key!==undefined&&reactionSheet?.complete&&reactionSheet.naturalWidth){
      const actor=boss?50+id:id,dx=((actor%4)*5+key)*176,dy=Math.floor(actor/4)*152;
      c.drawImage(reactionSheet,dx,dy,176,152,-90,-132,176,152);
    }
    else if(high){
      const actor=boss&&id===0?2:1,k=(actor===2?100:105)/(actor===2?118:129);
      c.drawImage(poses,m.pose*202,actor*184,202,184,-99*k,-167*k,202*k,184*k);
    }else{
      const source=boss?guards[id].source:id,sz=boss?124:id<8?112:118;
      c.drawImage(sheet,...cells[source][m.pose],-sz*.5,-sz*93/96,sz,sz);
    }
    return true;
  }
  function draw(c,o){
    const {id,boss,x,y,height,angle=0,alpha=1,pose=0,reduced=false}=o,time=o.time??now();
    const m=sample(id,boss,time,reduced,pose);if(!m)return false;
    c.save();c.globalAlpha*=alpha;c.imageSmoothingEnabled=false;
    c.translate(Math.round(x),Math.round(y));c.rotate(angle+m.tilt);c.scale(height/100,height/100);c.translate(m.dx,m.dy);
    if(!drawBody(c,o,m,time)){c.restore();return false;}
    accent(c,m,time);
    if(!reduced&&pose>=0&&boss&&gate===id&&time>=changed&&time-changed<710){crest(c,id,(time-changed)/710);}
    c.restore();return true;
  }
  return {draw,drawBody,dragonReady,fieldHeight,prepare,strike,reset,transition,sample,field,guards};
})();
