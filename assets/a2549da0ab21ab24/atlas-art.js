"use strict";
const MapArt=(()=>{
  const palettes=[
    ["#738d58","#8da565","#a7b975","#526d50","#304f46","#426752","#618258","#86a462","#a1b577","#406967","#54877d","#78a697","#c3c9a0"],
    ["#77957b","#95ae8b","#b2bd91","#536f69","#354f52","#4a726a","#719982","#9ab68a","#c4c897","#426f7a","#5b939a","#80b1ac","#cdd5b2"],
    ["#8f705a","#a58363","#b49571","#6d5552","#503e48","#74594f","#90704f","#b29662","#d0a46d","#784849","#be6644","#e99e58","#fbd68a"],
    ["#95afaf","#aec4bb","#c6d5c3","#657e89","#465c70","#5d7984","#88a2a1","#b0c4b7","#d5dfcb","#608596","#80a8b2","#a7c9c9","#e2eacf"]
  ];
  const canvas=(w,h)=>Object.assign(document.createElement("canvas"),{width:w,height:h});
  function random(seed){let n=seed;return ()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296);}
  function rect(c,k,x,y,w,h){c.fillStyle=k;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function poly(c,k,points){
    c.fillStyle=k;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();
  }
  function oval(c,k,x,y,rx,ry){
    // Stepped contour, sampled in horizontal two-pixel slices.
    for(let j=-ry;j<ry;j+=2){const w=Math.sqrt(Math.max(0,1-Math.pow((j+1)/ry,2)))*rx;rect(c,k,x-w,y+j,w*2,2);}
  }
  function line(c,points,color,w){c.beginPath();c.strokeStyle=color;c.lineCap="round";c.lineJoin="round";c.lineWidth=w;points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
  function tree(c,x,y,s,p,pine=false){
    c.save();c.translate(x|0,y|0);c.scale(s,s);
    oval(c,p[3],3,0,10,3);rect(c,"#4f4937",-2,-8,4,8);rect(c,"#937957",-2,-8,1,7);
    if(pine){
      for(const [yy,r] of [[-7,10],[-13,8],[-19,5]]){
        poly(c,p[4],[[0,yy-13],[r,yy],[r,yy+2],[-r,yy+2],[-r,yy]]);
        poly(c,p[6],[[-1,yy-12],[2,yy-3],[-3,yy-3],[-4,yy],[-r,yy]]);
        rect(c,p[7],-r+2,yy-1,3,1);
      }
    }else{
      const crown=[[-10,-10],[-13,-14],[-13,-20],[-10,-20],[-10,-24],[-5,-25],[-4,-28],[3,-28],[4,-25],[9,-24],[10,-20],[13,-18],[12,-11],[7,-8],[2,-8],[0,-6],[-5,-7]];
      poly(c,p[4],crown);oval(c,p[5],-1,-18,11,9);oval(c,p[6],-5,-21,7,5);oval(c,p[6],3,-16,5,4);
      rect(c,p[7],-8,-23,5,2);rect(c,p[7],-10,-20,3,2);rect(c,p[7],1,-18,3,1);rect(c,p[5],-8,-11,4,2);
    }
    c.restore();
  }
  function mountain(c,x,y,w,h,p,snow){
    poly(c,p[3],[[x-w,y],[x-w*.75,y-h*.26],[x-w*.53,y-h*.42],[x-w*.23,y-h*.71],[x,y-h],[x+w*.23,y-h*.67],[x+w*.45,y-h*.52],[x+w,y]]);
    poly(c,p[5],[[x-w,y-2],[x,y-h],[x-w*.1,y-h*.54],[x-w*.32,y-h*.38],[x-w*.41,y-h*.2]]);
    poly(c,snow?"#dee2cd":p[8],[[x-w*.43,y-h*.46],[x,y-h],[x+w*.31,y-h*.6],[x+w*.12,y-h*.66],[x+w*.13,y-h*.56],[x-.5,y-h*.66],[x-w*.15,y-h*.6]]);
    rect(c,p[6],x-w*.26,y-h*.27,w*.12,2);
  }
  function house(c,x,y,scale,roof="#9f5741"){
    c.save();c.translate(x,y);c.scale(scale,scale);
    oval(c,"#52634a",3,1,15,4);rect(c,"#574d3e",-11,-16,23,17);rect(c,"#d6b982",-10,-15,16,15);rect(c,"#ab9062",6,-15,5,15);
    rect(c,"#574b3d",-6,-8,5,8);rect(c,"#755d43",2,-10,3,5);rect(c,"#f7d58e",2,-9,2,2);
    rect(c,"#776b59",5,-25,4,9);rect(c,"#c1a680",5,-25,2,8);
    poly(c,"#553f38",[[-15,-14],[-6,-25],[5,-25],[14,-14],[13,-12],[-15,-12]]);
    poly(c,roof,[[-14,-15],[-6,-24],[4,-24],[10,-15]]);rect(c,"#db9965",-8,-21,9,2);rect(c,"#be7650",-10,-17,11,1);
    rect(c,"#68533f",-10,-2,21,2);c.restore();
  }
  function tower(c,x,y,s,banner=true){
    c.save();c.translate(x,y);c.scale(s,s);oval(c,"#556552",3,0,13,4);
    rect(c,"#59564a",-7,-28,14,29);rect(c,"#b5b199",-6,-27,9,27);rect(c,"#8d8c78",3,-27,4,27);
    for(let i=0;i<4;i++){rect(c,"#91917d",-6+(i%2)*3,-5-i*5,4,2);}
    rect(c,"#f1bb71",-4,-21,3,6);rect(c,"#4d5d56",-1,-8,4,8);
    poly(c,"#3c4c46",[[-11,-26],[0,-38],[11,-26],[10,-24],[-10,-24]]);
    poly(c,"#94634a",[[-10,-27],[0,-37],[3,-27]]);
    if(banner){rect(c,"#594a39",0,-45,1,9);poly(c,"#d38058",[[1,-45],[9,-44],[5,-40],[1,-40]]);}
    c.restore();
  }
  function landmark(c,type,x,y,p){
    c.save();c.translate(x,y);
    const wood="#795d42",light="#c4a16c",dark="#4a4f41";
    if(type==="hamlet"||type==="post"){house(c,8,-4,.9);house(c,-9,4,.85);rect(c,wood,15,-6,2,11);rect(c,light,10,-7,11,4);}
    else if(type==="dock"){
      for(let i=0;i<7;i++){rect(c,wood,-10+i*3,-3,3,10);rect(c,light,-10+i*3,-3,2,7);}
      for(const dx of [-10,9]){rect(c,dark,dx,-6,2,15);rect(c,light,dx,-6,2,2);}
      poly(c,wood,[[11,5],[24,-2],[30,-2],[26,5],[14,11],[10,10]]);poly(c,"#dfbf84",[[13,6],[25,0],[22,5],[13,9]]);
      rect(c,wood,-7,-14,2,13);poly(c,"#e6c48d",[[-5,-14],[4,-13],[-5,-9]]);
    }else if(type==="mill"||type==="vault"||type==="crater"){
      rect(c,dark,-19,-21,37,23);rect(c,"#a99e7e",-18,-20,34,21);rect(c,"#767965",5,-20,11,21);
      for(let i=0;i<5;i++)rect(c,"#8b8770",-17+i*7,-24,4,6);
      tower(c,-15,-1,.7);tower(c,14,-3,.84);
      if(type==="mill"){
        oval(c,dark,4,0,10,10);oval(c,"#bf8f54",4,0,8,8);oval(c,"#655a46",4,0,6,6);
        for(let i=0;i<4;i++){const a=i*Math.PI/4;line(c,[[4-Math.cos(a)*8,-Math.sin(a)*8],[4+Math.cos(a)*8,Math.sin(a)*8]],light,1.5);}
      }else{rect(c,dark,-4,-12,8,12);rect(c,type==="crater"?"#fac67e":"#85b7b1",-2,-9,4,8);}
    }else if(type==="forge"||type==="kiln"||type==="mine"){house(c,-4,1,1,"#745e58");rect(c,dark,8,-24,9,26);rect(c,"#b68d6b",9,-25,4,23);rect(c,"#f1b16d",-8,-8,5,7);rect(c,"#b4a28d",11,-30,5,2);}
    else if(type==="camp"){poly(c,dark,[[-16,2],[-3,-18],[1,-19],[14,2]]);poly(c,"#ddaa6d",[[-15,0],[-3,-17],[-1,0]]);poly(c,"#937650",[[-1,0],[0,-17],[12,0]]);rect(c,wood,15,0,6,2);rect(c,"#edb568",17,-4,2,4);}
    else if(type==="arch"){rect(c,dark,-12,-18,6,19);rect(c,light,-11,-17,3,17);rect(c,dark,7,-18,6,19);rect(c,light,8,-17,3,17);rect(c,dark,-16,-22,32,6);rect(c,light,-16,-23,32,3);}
    else if(type==="reed"){for(let i=0;i<8;i++){rect(c,wood,-10+i*3,-7-i%3,1,8);rect(c,"#b39766",-10+i*3,-11-i%3,2,4);}}
    else{tower(c,0,0,type==="observatory"?1.12:.85,type!=="spire");if(type==="observatory"||type==="spire"){oval(c,"#526979",0,-39,8,6);rect(c,"#e5c586",-2,-43,4,6);}}
    c.restore();
  }
  // Ground anchors in the first forest. The two lamps flank the waterwheel approach.
  const forestProps=[["moss",120,111],["cedar",48,160],["lantern",44,310],["lantern",106,310]];
  const propProfiles={
    moss:{width:35,height:24,layers:14,colors:["#4c5f53","#657365","#83927a","#a5ae8d","#78915e","#a0b675"]},
    cedar:{width:37,height:45,layers:37,colors:["#494f3b","#866947","#314f43","#41644d","#608051","#89a067"]},
    lantern:{width:25,height:34,layers:26,colors:["#525d54","#7b8473","#a1a68d","#c3c2a3","#b08a53","#efc875"]}
  };
  const propCache=new Map();
  function sliceColor(kind,x,y,z){
    if(kind==="moss"){
      const t=z/13,dx=x-2*t,dy=y+t,r=14*Math.pow(Math.max(.012,1-Math.pow(t,1.65)),.62);
      const edge=Math.max(Math.abs(dx)*.96,Math.abs(dy)*1.13,(Math.abs(dx)+Math.abs(dy))*.70,(-dx+dy)*.78);
      if(edge>r)return -1;
      const face=dx*.91-dy*.43;
      if(z>=8&&face<1+(z-8)*1.5&&Math.sin(dx*.75+dy*.45)+z*.29>2.7)return face<0?5:4;
      if(z===4&&face>0&&face<7&&dy>1)return 0;
      return z<2?1:face<-4||z>11?3:face>4?1:2;
    }
    if(kind==="cedar"){
      if(z<8)return Math.max(Math.abs(x),Math.abs(y)*1.15)<3.7?(x+y<0?1:0):-1;
      let radius;
      if(z<17)radius=15.5-(z-8)*.94;
      else if(z<25)radius=12-(z-17)*.83;
      else radius=8.6-(z-25)*.72;
      const angle=Math.atan2(y,x),distance=Math.hypot(x,y*1.09);
      if(distance>radius*(.93+.09*Math.cos(angle*5+z*.045)))return -1;
      const face=(x*.91-y*.43)/Math.max(radius,1);
      const tier=z<17?z-8:z<25?z-17:z-25;
      if(z>=34)return 5;
      if(tier<2)return face<.15?5:3;
      const folded=Math.cos(angle*5+.42)>.24;
      return face<-.34?folded?5:4:face<.31?folded?4:3:folded?3:2;
    }
    // Stone foot, narrow shaft, lit four-sided chamber and stepped bronze cap.
    const ax=Math.abs(x),ay=Math.abs(y);
    const r=z<3?7:z<5?5.8:z<13?3.4:z<15?6:z<20?4.7:z<22?7.4:z<24?5.3:2.3;
    if(Math.max(ax,ay)>r||ax+ay>r*1.55)return -1;
    if(z>=15&&z<20)return ax>3.6&&ay>2.1?0:x+y<.5?5:4;
    if(z>=20)return z===21||z>=24?4:x+y<0?2:0;
    if(z===2||z===4||z===14)return 3;
    return x+y<-1?2:x+y>2?0:1;
  }
  function stackedProp(kind){
    if(propCache.has(kind))return propCache.get(kind);
    const {width,height,layers,colors}=propProfiles[kind],sprite=canvas(width,height),ctx=sprite.getContext("2d");
    const pixels=ctx.createImageData(width,height),cx=Math.floor(width/2),base=height-7;
    const rgb=colors.map(s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)));
    const angle=.44,co=Math.cos(angle),si=Math.sin(angle),squash=.62;
    // Rasterize horizontal ground-plane sections at one integer pixel per unit of height.
    for(let z=0;z<layers;z++){
      for(let sy=Math.max(0,base-z-11);sy<=Math.min(height-1,base-z+11);sy++){
        const depth=(sy-base+z)/squash;
        for(let sx=0;sx<width;sx++){
          const local=sx-cx,x=local*co+depth*si,y=-local*si+depth*co,index=sliceColor(kind,x,y,z);
          if(index<0)continue;
          const offset=4*(sy*width+sx);
          pixels.data[offset]=rgb[index][0];pixels.data[offset+1]=rgb[index][1];pixels.data[offset+2]=rgb[index][2];pixels.data[offset+3]=255;
        }
      }
    }
    ctx.putImageData(pixels,0,0);propCache.set(kind,sprite);return sprite;
  }
  function drawForestProp(c,kind,x,y){
    const sprite=stackedProp(kind);
    oval(c,"#5f7257",x+3,y+1,kind==="cedar"?12:kind==="moss"?14:8,3);
    c.drawImage(sprite,x-Math.floor(sprite.width/2),y-sprite.height+7);
  }
  const storyProps=[["mail",98,88],["moor",186,98],["tools",273,156],["banner",34,283]];
  const storyCache=new Map();
  function storyProp(kind){
    if(storyCache.has(kind))return storyCache.get(kind);
    const im=canvas(32,30),c=im.getContext("2d"),wood="#73543f",rim="#493e35",gold="#e3bd79",linen="#d9bc83";
    if(kind==="mail"){
      rect(c,wood,9,8,3,19);rect(c,"#ac8b61",9,9,1,16);
      poly(c,rim,[[4,7],[18,7],[23,10],[18,13],[4,13]]);rect(c,linen,6,8,12,3);
      poly(c,rim,[[19,18],[21,15],[25,15],[24,18],[29,22],[28,26],[17,26],[16,23]]);
      poly(c,"#b9915b",[[20,19],[24,19],[27,23],[26,25],[18,25],[17,23]]);
      rect(c,"#8d4d39",19,18,6,2);rect(c,"#f3d69e",20,20,4,3);
    }else if(kind==="moor"){
      poly(c,rim,[[1,21],[8,17],[25,14],[30,14],[26,20],[10,25],[3,24]]);
      poly(c,"#bc8758",[[4,21],[12,18],[27,15],[24,19],[9,23],[5,23]]);
      line(c,[[8,21],[22,17]],wood,2);line(c,[[13,17],[16,21]],gold,2);
      rect(c,wood,3,11,3,12);rect(c,linen,3,11,3,2);line(c,[[4,15],[7,18],[10,18],[13,17]],"#f5d49a",1);
    }else if(kind==="tools"){
      for(const [x,y] of [[2,20],[4,23],[5,17]]){poly(c,wood,[[x,y],[x+17,y-3],[x+20,y-1],[x+3,y+3]]);line(c,[[x+2,y],[x+16,y-2]],linen,2);}
      line(c,[[22,13],[25,24]],wood,3);line(c,[[20,14],[27,12]],"#56686a",4);line(c,[[20,12],[26,11]],"#bdc4ad",1);
      rect(c,"#815b3e",2,23,5,2);
    }else{
      rect(c,rim,12,2,3,24);rect(c,gold,12,1,3,3);
      poly(c,"#693f38",[[15,4],[26,5],[27,16],[22,13],[16,16]]);
      poly(c,"#ad6546",[[15,4],[24,5],[25,12],[20,10],[16,13]]);
      rect(c,gold,17,6,5,2);rect(c,gold,18,8,2,3);rect(c,"#a48d65",10,25,8,2);
    }
    storyCache.set(kind,im);return im;
  }
  function terrain(rank){
    const ch=Atlas.chapters[rank],p=palettes[rank],out=canvas(384,652),c=out.getContext("2d"),rnd=random(1949+rank*99);
    const postal=rank===0&&typeof ForestOutposts!=="undefined"?ForestOutposts:null;
    const grass=(x,y)=>Math.sin(x/39+y/73)+.7*Math.cos(y/26-x/91)+Math.sin((x+y)/63)*.7;
    if(rank<2)ScenicArt.hills(c,rank);
    else{
      rect(c,p[0],0,0,384,652);
      for(let y=-2;y<652;y+=3)for(let x=-2;x<384;x+=4){
        const v=grass(x,y)+rnd()*.22;
        if(v>.15)rect(c,v>1.25?p[2]:p[1],x,y,5,3);
      }
      for(let i=0;i<5400;i++){const x=rnd()*384,y=rnd()*652;c.globalAlpha=.27;rect(c,rnd()>.48?p[8]:p[3],x,y,2+rnd()*3,1);}c.globalAlpha=1;
    }
    ch.ranges.forEach(([x,y,w,h])=>{if(rank<2){ScenicArt.shelf(c,x,y,w,h);return;}for(let i=0;i<4;i++){const xx=x+i*w/3;mountain(c,xx,y+h*.9+(i%2)*5,w*.32,h*(.8+.18*(i%2)),p,rank===3);}});
    const mask=canvas(384,652),m=mask.getContext("2d",{willReadFrequently:true});
    for(const [x,y,rx,ry] of ch.banks){oval(c,p[3],x,y,rx+3,ry+3);oval(c,p[11],x,y-1,rx,ry);oval(c,p[10],x,y-1,rx-3,ry-2);oval(m,"white",x,y,rx,ry);}
    for(const s of ch.streams){line(c,s.line,p[3],s.w+7);line(c,s.line,p[12],s.w+3);line(c,s.line,p[11],s.w);line(c,s.line,p[10],s.w-5);line(c,s.line,p[9],Math.max(3,s.w*.47));line(m,s.line,"white",s.w);}
    const wet=m.getImageData(0,0,384,652).data;const test=(a,x,y)=>x>=0&&x<384&&y>=0&&y<652&&a[4*((x|0)+(y|0)*384)+3]>80;
    for(let i=0;i<7200;i++){const x=rnd()*382,y=rnd()*651;if(test(wet,x,y))rect(c,rnd()>.23?p[11]:p[12],x,y,2+rnd()*5,1);}
    ScenicArt.water(c,wet,rank);if(postal)postal.ground(c);
    const roads=[ch.arrival,...ch.edges,ch.departure];m.clearRect(0,0,384,652);
    for(const road of roads){line(c,road.points,"#5e654e",10);line(c,road.points,"#bda77b",8);line(c,road.points,"#dec79a",5);line(m,road.points,"white",22);}
    const occupied=m.getImageData(0,0,384,652).data;
    for(const road of roads){for(let i=1;i<road.points.length-1;i++){
      const [x,y]=road.points[i];if(test(wet,x,y)){if(i%2)continue;
        const [nx,ny]=road.points[i+1],d=Math.hypot(nx-x,ny-y)||1,dx=(ny-y)/d,dy=(x-nx)/d;
        line(c,[[x-6*dx,y-6*dy],[x+6*dx,y+6*dy]],"#795f46",3.6);
        line(c,[[x-5*dx,y-5*dy],[x+5*dx,y+5*dy]],"#c2a376",2.4);
        if(i%6===0){rect(c,"#534e3e",x-6*dx,y-6*dy-2,2,4);rect(c,"#e0bc87",x-6*dx,y-6*dy-2,2,1);}
      }else if(i%4===0){rect(c,"#b7a780",x-2+rnd()*4,y-2+rnd()*4,2,1);}
    }}
    if(rank===0)ScenicArt.icon(c,2,248,239,45,27);
    const decor=[];
    for(let i=0;i<(postal?1130:1350);i++){const x=rnd()*398-7,y=rnd()*674-5,s=.42+rnd()*.62;
      if(test(wet,x,y)||test(wet,x,y-7)||test(occupied,x,y)||test(occupied,x,y-10*s)||ch.landmarks.some(([lx,ly])=>Math.abs(lx-x)<24&&Math.abs(ly-y)<27))continue;
      if(postal&&(postal.overlaps(x,y,13*s)||[-8,8].some(dx=>test(occupied,x+dx*s,y-21*s))))continue;
      if(grass(x,y)>.55 && rnd()>.08)continue;
      const rock=rank===2?rnd()>.18:rnd()<.09;
      decor.push([y,()=>{
        const pine=!rock&&(rank===3||rnd()<.32);
        if(rank===0&&forestProps.some(([kind,px,py])=>
          Math.abs(x-px)<propProfiles[kind].width/2+12*s&&y>=py-5&&y-32*s<py+7))return;
        if(rank===0&&storyProps.some(([,px,py])=>Math.abs(x-px)<14+10*s&&y>=py-3&&y-30*s<py+2))return;
        if(rock&&rank<2)ScenicArt.shelf(c,x-7*s,y-10*s,14*s,10*s);
        else if(rock)mountain(c,x,y,7*s,9*s,p,rank===3);
        else if(rank===0&&!pine&&Math.floor(x+y)%6===0&&ScenicArt.icon(c,5,x,y,29*s,27*s))return;
        else if(postal)postal.grove(c,x,y,s*.85,pine,Math.floor(x*3+y/7)&3);
        else tree(c,x,y,s,p,pine);
      }]);
    }
    if(rank===0)for(const [kind,x,y] of storyProps)decor.push([y,()=>c.drawImage(storyProp(kind),x-16,y-26)]);
    if(rank===0)for(const [kind,x,y] of forestProps)decor.push([y,()=>drawForestProp(c,kind,x,y)]);
    if(postal)for(const place of postal.places)decor.push([place.y,()=>postal.draw(c,place)]);
    for(const [x,y,type] of ch.landmarks){
      if(postal&&(type==="watch"||type==="beacon"))continue;
      decor.push([y,()=>ScenicArt.landmark(c,rank,type,x,y)||landmark(c,type,x,y,p)]);
    }
    decor.sort((a,b)=>a[0]-b[0]).forEach(([,draw])=>draw());
    return out;
  }
  const scenes=new Map();
  const settings=[
    "hamlet boat dock mud bridge mill fork gear arch keep reeds post shadow rope dock beacon roots camp lantern ship",
    "post wall arch gate hamlet vault steps log crate hall mirror reeds lens beacon spire desk spring clock seal observatory",
    "tracks mine chisel chimney forge kiln thread pipe ridge spire furnace mold glove forge key bell gate pendulum chain crater",
    "snow cave mile arch beacon boat ice rope cable dock hall pendulum flag ridge watch spire bell channel dawn observatory"
  ].map(s=>s.split(" "));
  function sceneLandmark(c,kind,x,p,rnd){
    const architecture={keep:"mill",vault:"vault",crater:"crater",observatory:"observatory",hamlet:"hamlet",post:"post",forge:"forge",kiln:"kiln",beacon:"beacon",spire:"spire",dock:"dock",camp:"camp",watch:"watch",mine:"mine",arch:"arch",mill:"mill",reeds:"reed"};
    if(architecture[kind]){c.save();c.translate(x,78);c.scale(1.2,1.2);landmark(c,architecture[kind],0,0,p);c.restore();return;}
    const timber="#685c47",stone=p[3],bright=p[12],metal="#b69665";
    if(["bridge","rope","cable","thread","channel","steps"].includes(kind)){
      const slope=kind==="steps"?-.22:0;
      for(let j=-60;j<60;j+=5){const y=72+slope*j;rect(c,timber,x+j,y,6,7);rect(c,"#dcbd87",x+j,y,4,3);if(j%15===0)rect(c,"#675c49",x+j,y-7,2,18);}
      line(c,[[x-60,66-slope*60],[x,69],[x+57,65+slope*57]],metal,2);
    }else if(["gear","clock","pendulum","bell","lens","mirror","key","seal","lantern"].includes(kind)){
      rect(c,stone,x-15,29,4,50);rect(c,stone,x+12,29,4,50);rect(c,timber,x-19,28,40,5);
      rect(c,metal,x-1,32,2,17);oval(c,stone,x,57,13,12);oval(c,metal,x,55,12,10);oval(c,kind==="lens"||kind==="mirror"?p[11]:"#93744d",x,55,9,8);rect(c,bright,x-6,50,6,2);
    }else if(["boat","ship","shadow","log"].includes(kind)){
      poly(c,timber,[[x-31,70],[x-19,79],[x+20,79],[x+33,69],[x+12,73],[x-17,73]]);rect(c,"#c4a778",x-25,70,50,3);
      if(kind!=="log"){rect(c,timber,x,41,2,31);poly(c,kind==="shadow"?p[5]:"#d4be8d",[[x-1,42],[x-18,64],[x-1,64]]);}
    }else if(["wall","gate","hall","desk","crate","furnace","mold","glove","chisel","chimney","pipe","chain"].includes(kind)){
      rect(c,stone,x-25,47,50,32);rect(c,p[6],x-24,48,47,29);rect(c,timber,x-12,53,23,25);
      for(let j=0;j<4;j++)rect(c,p[8],x-23+j*13,45,9,5);
      if(["furnace","chimney","pipe","mold"].includes(kind)){rect(c,"#634e49",x+12,25,10,24);rect(c,"#eeb46d",x-8,58,12,16);}
      else{rect(c,metal,x-6,57,11,16);rect(c,bright,x-4,59,5,3);}
    }else if(["ice","cave","ridge","roots","tracks","mile","snow"].includes(kind)){
      for(let i=0;i<5;i++)mountain(c,x-48+i*21,79,10+rnd()*9,13+rnd()*23,p,["ice","snow","cave"].includes(kind));
    }else if(kind==="flag"){for(let i=0;i<3;i++){rect(c,timber,x+i*16,44-i*3,2,37);poly(c,bright,[[x+i*16,44-i*3],[x+12+i*16,46-i*3],[x+i*16,53-i*3]]);}}
    else{for(let i=0;i<8;i++){const a=x-50+rnd()*100;oval(c,kind==="mud"?p[3]:p[10],a,77+rnd()*4,12,3);rect(c,bright,a-5,76,5,1);}}
  }
  function battle(rank,site,arena=false){
    const id=rank*20+site;
    if(!arena){const painted=ScenicArt.battle(id);if(painted)return painted;}
    const detail=c=>{
      const kind=settings[rank][site],p=palettes[rank],rnd=random(1728+rank*31+site*19);
      const watercraft=["boat","ship","log"].includes(kind),high=["beacon","spire","watch","flag","bell"].includes(kind);
      const firstForest={reeds:[95,103],post:[102,98],rope:[199,99],camp:[117,105],ship:[202,85]};
      const [x,y]=rank===0&&firstForest[kind]||[watercraft?189:74+((site*7+rank*3)%13)*15,watercraft?87:high?89:101];
      if(["clock","mirror","bell","dawn","observatory","lens"].includes(kind)){
        c.fillStyle=kind==="dawn"?"#e2a57b28":"#26374f50";c.fillRect(0,0,384,154);
      }
      const interior=["furnace","chimney","hall","mine"].includes(kind);
      if(interior){
        // Read a landscape through a passage. The local lintels and windows
        // remain nearer and darker than the outdoor workshop seen through them.
        poly(c,p[4],[[0,0],[93,0],[48,8],[24,23],[13,41],[9,88],[0,93]]);
        poly(c,p[3],[[0,5],[67,0],[43,9],[26,17],[16,34],[11,64],[7,64]]);
        poly(c,p[4],[[315,0],[384,0],[384,97],[372,89],[365,26],[351,12]]);
        for(const [xx,yy] of [[20,21],[31,13],[46,7],[370,38],[372,61]])rect(c,p[6],xx,yy,6,2);
      }
      c.save();c.translate(x,y);c.scale(1.03,1.03);
      if(!watercraft)oval(c,"#383c3752",3,1,["bridge","rope","cable","steps"].includes(kind)?45:19,3);
      c.translate(0,-78);sceneLandmark(c,kind,0,p,rnd);
      if(["wall","gate","hall","crate","chisel","pipe","chimney","furnace","glove","chain"].includes(kind)){
        // Mortar is confined to the existing front face. Iron straps follow
        // the jambs rather than covering the workpiece in the opening.
        for(let course=0;course<5;course++)for(const edge of [-23,13]){
          const yy=50+course*5,seam=edge+2+(course%2)*4;
          rect(c,"#4c463b86",edge,yy,10,1);rect(c,"#564d427e",seam,yy,1,4);
          rect(c,"#e0cba580",edge+1,yy+1,3+course%3,1);
        }
        for(const edge of [-13,10])for(const yy of [57,69]){
          rect(c,"#49453f",edge,yy,4,2);rect(c,"#d8b887",edge+1,yy,1,1);
        }
        if(["furnace","pipe","chimney"].includes(kind)){
          for(const dx of [14,18])rect(c,"#d09162",dx,27,1,18);
          rect(c,"#4a403a",11,39,12,2);rect(c,"#d6a77c",11,40,10,1);
        }
      }
      if(["ship","boat"].includes(kind)){
        line(c,[[-24,70],[-1,43],[21,71]],"#8e7958",.9);
        line(c,[[-3,48],[-14,63],[-2,64]],"#9c896c",.8);
        for(let plank=0;plank<3;plank++)rect(c,"#a38b67",-13+plank*9,74+plank%2,7,1);
      }
      c.restore();
      if(rank===0&&kind==="reeds"){
        for(const xx of [78,93,118])landmark(c,"reed",xx,y+(xx%4)-1,p);
        line(c,[[68,104],[88,107],[102,106]],"#b5b885",1);
      }
      if(rank===0&&kind==="post")c.drawImage(storyProp("mail"),x+14,y-22,26,25);
      if(rank===0&&kind==="camp"){rect(c,"#70422e",x+18,y-4,4,5);rect(c,"#ffc664",x+19,y-6,2,5);}
      if(rank===0&&kind==="ship"){
        line(c,[[x+31,y-7],[x+45,y-1],[x+58,y-3]],"#c8a575",1.5);
        for(let k=0;k<4;k++)rect(c,"#b0b3a3",x-26+k*12,y+3+k%2,7,1);
      }
    };
    if(arena){
      const painted=typeof ArenaArt!=="undefined"&&ArenaArt.battle(id,false,detail);if(painted)return painted;
      const fallback=ScenicArt.encounterPlate(id)||ScenicArt.battle(id);if(fallback)return fallback;
    }
    const paintedSite=ScenicArt.surroundings(id,false,detail);if(paintedSite)return paintedSite;
    const key=rank+":"+site;if(scenes.has(key))return scenes.get(key);
    const b=canvas(320,122),c=b.getContext("2d"),p=palettes[rank],rnd=random(1728+rank*31+site*19),kind=settings[rank][site];
    const skies=[["#a4beb4","#d5d6b6"],["#8db6bd","#d8dfbe"],["#a0827b","#e0b389"],["#8aa6b3","#d7ddd0"]];
    rect(c,skies[rank][0],0,0,320,70);rect(c,skies[rank][1],0,34,320,36);
    const night=["lantern","shadow","lens","clock","bell","observatory","dawn"].includes(kind);
    if(night){rect(c,"#435866",0,0,320,34);rect(c,"#788a91",0,34,320,37);oval(c,"#e7d8a3",60+rnd()*180,19,7,7);}
    for(let i=0;i<15;i++){const x=rnd()*320,y=8+rnd()*34;rect(c,night?"#cfceb0":"#e4e1c5",x,y,night?1+rnd()*5:14+rnd()*30,night?1:2);}
    for(let i=-1;i<10;i++)mountain(c,i*43,70,48,19+rnd()*29,rank===2?p:[0,0,0,"#96aaa0",0,"#a7b8a6","#9ab0a0",0,"#cad1b5"],rank===3);
    if(rank===2){for(let i=-1;i<23;i++)mountain(c,i*16,75,16,9+rnd()*14,p,false);}
    else for(let i=0;i<53;i++){const x=rnd()*329;tree(c,x,66+rnd()*7,.4+rnd()*.4,p,rank===3||site%3!==1);}
    rect(c,p[1],0,72,320,50);const river=rank===1?13+site%5:4+(site*7)%11;
    rect(c,p[10],0,73,320,river);rect(c,p[12],0,73+river,320,2);
    for(let i=0;i<90;i++)rect(c,p[11],rnd()*320,73+rnd()*river,3+rnd()*13,1);
    const inside=["vault","hall","mine","furnace","mold","cave","desk","chimney"].includes(kind);
    if(inside){
      for(let i=0;i<7;i++){const x=i*59-20;rect(c,p[4],x,0,10,79);rect(c,p[6],x+2,0,3,78);poly(c,p[4],[[x,0],[x+50,0],[x+17,15],[x+10,33]]);}
      rect(c,p[3],0,78,320,10);rect(c,p[8],0,78,320,2);
    }
    sceneLandmark(c,kind,157+rnd()*57,p,rnd);
    poly(c,rank===3?"#cbd2bd":rank===2?"#ac856b":"#b7a57a",[[0,94],[60,89],[160,91],[221,85],[320,89],[320,111],[250,103],[146,107],[68,99],[0,105]]);
    for(let i=0;i<300;i++){const y=85+rnd()*37;rect(c,y<102?p[8]:p[6],rnd()*320,y,1+rnd()*4,1);}
    for(const [x,y,s] of [[-2,87,2.4],[14,75,1.25],[310,80,1.6],[320,92,2.2]]){
      if(rank===2||inside)mountain(c,x,y,10*s,22*s,p,rank===3);else tree(c,x,y,s,p,rank===3);
    }
    scenes.set(key,b);return b;
  }
  // A successful link/rescue posts one sealed dispatch. No mark is drawn in an
  // unsolved position, after the short delivery, or during reduced-motion play.
  function deliverySeal(c,heroX,enemyX,ground,heroPx,kind,age){
    if((kind!=="link"&&kind!=="escape")||!Number.isFinite(age)||age<0||age>=.78)return false;
    const t=age/.78,ease=1-(1-t)*(1-t),arc=Math.sin(t*Math.PI);
    const near=heroX+heroPx*.18,far=heroX+(enemyX-heroX)*.69;
    const x=far+(near-far)*ease,y=ground-heroPx*(.42+.23*ease+.20*arc),u=Math.max(1.1,Math.min(2,heroPx/85));
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(u,u);c.globalAlpha=Math.min(1,age/.08,(.78-age)/.16);
    c.rotate(-.16+.22*t);
    line(c,[[12,0],[19,1],[23,0]],"#edc983",1);line(c,[[14,3],[20,4]],"#a9d5bd",1);
    poly(c,"#684e3e",[[-8,-4],[6,-5],[9,-3],[8,5],[-7,6],[-9,3]]);
    poly(c,"#f5dfac",[[-7,-3],[7,-4],[7,3],[-7,4]]);
    line(c,[[-6,-3],[0,1],[6,-3]],"#997148",1);
    rect(c,"#9b5742",-2,0,4,3);rect(c,"#ecb977",-1,0,2,1);c.restore();return true;
  }
  return {terrain,battle,forestProps,stackedProp,storyProps,storyProp,deliverySeal};
})();
