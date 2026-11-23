"use strict";
const ReachArt=(()=>{
  const w=384,h=748,ink="#2c4546",timber="#755746",lightWood="#bea774",metal="#63827a",gold="#ecbf72";
  const rect=(c,x,y,a,b,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(a),Math.round(b));};
  function poly(c,pts,color){
    c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
  }
  function line(c,pts,color,size=1){
    c.strokeStyle=color;c.lineWidth=size;c.lineJoin="round";c.lineCap="round";c.beginPath();
    pts.forEach(([x,y],i)=>i?c.lineTo(Math.round(x)+.5,Math.round(y)+.5):c.moveTo(Math.round(x)+.5,Math.round(y)+.5));c.stroke();
  }
  function hash(x){return (Math.imul(x^0x9e3779b9,1597334677)>>>0)/4294967296;}
  const canvas=(a,b)=>{const s=document.createElement("canvas");s.width=a;s.height=b;return s;};
  function posts(c,list,high){
    for(const [x,y] of list){rect(c,x-1,y-high,3,high,ink);rect(c,x-1,y-high,1,high-1,lightWood);rect(c,x-2,y-high,4,2,"#d6ba89");}
  }
  function roof(c,x,y,s,eave="#6a7976",wall="#9f9474"){
    c.save();c.translate(x,y);c.scale(s,s);
    poly(c,[[-9,-11],[8,-13],[8,-1],[-7,2]],ink);
    poly(c,[[-7,-10],[1,-8],[1,1],[-7,-1]],wall);poly(c,[[1,-8],[7,-11],[7,-2],[1,1]],"#6c7160");
    poly(c,[[-11,-10],[-5,-19],[2,-21],[10,-13],[2,-7]],ink);poly(c,[[-10,-11],[-4,-18],[2,-19],[7,-13],[1,-9]],eave);
    line(c,[[-9,-11],[0,-9],[8,-13]],"#bba77c");
    rect(c,-5,-7,3,5,timber);rect(c,3,-7,2,3,"#eac880");c.restore();
  }
  function boat(c,x,y,s,col="#925b47"){
    c.save();c.translate(x,y);c.scale(s,s);
    poly(c,[[-12,-3],[-8,2],[-1,4],[7,1],[12,-6],[4,-4],[-4,-2]],ink);
    poly(c,[[-10,-3],[-5,0],[1,1],[9,-4],[3,0],[-3,2]],col);
    line(c,[[-10,-3],[-3,-1],[4,-2],[10,-5]],lightWood);
    strokeOar(c,0,-2);c.restore();
  }
  function strokeOar(c,x,y){line(c,[[x-3,y-6],[x+5,y+3]],timber,2);rect(c,x+4,y+2,3,2,lightWood);}
  function wheel(c,x,y,r){
    c.strokeStyle=ink;c.lineWidth=3;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();
    for(let k=0;k<6;k++){const a=k*Math.PI/3;line(c,[[x,y],[x+Math.cos(a)*r,y+Math.sin(a)*r]],lightWood,1.5);}
    rect(c,x-1,y-1,3,3,gold);
  }
  function lamp(c,x,y,on){
    rect(c,x-2,y-13,5,10,ink);rect(c,x-1,y-11,3,5,on?"#ffdb82":"#69928a");
    poly(c,[[x-4,y-12],[x,y-17],[x+5,y-12]],"#5c7168");rect(c,x-1,y-3,2,4,timber);
  }
  function reed(c,x,y,s=1){
    c.save();c.translate(x,y);c.scale(s,s);
    for(const [q,n] of [[-5,4],[-2,8],[1,5],[4,9]]){
      line(c,[[q,0],[q-2,-n]],"#687b52");rect(c,q-3,-n-2,2,3,"#bba66a");
    }c.restore();
  }
  const props=[
    (c,on)=>{posts(c,[[0,1]],28);line(c,[[0,-25],[11,-25]],ink,2);poly(c,on?[[1,-24],[14,-26],[12,-21],[5,-19],[1,-20]]:[[1,-23],[6,-21],[5,-13],[1,-17]],on?"#db8358":"#957f65");rect(c,-9,-3,7,4,timber);rect(c,-9,-4,7,2,"#c5a476");},
    (c,on)=>{posts(c,[[-13,1],[12,-2]],19);line(c,[[-13,-16],[0,-13],[12,-19]],timber,2);line(c,[[-13,-11],[0,-9],[12,-14]],lightWood);for(let j=0;j<(on?4:1);j++){const x=-10+j*5;poly(c,[[x,-15],[x+4,-14],[x+3,-7],[x,-8]],on?"#eee0ae":"#8f9a80");rect(c,x+1,-12,2,1,metal);}},
    (c,on)=>{posts(c,[[-11,2],[9,-3]],6);for(const a of [-12,-7,3,8,...(on?[-2]:[])]){poly(c,[[a,-2],[a+4,-3],[a+5,-8],[a+1,-8]],a===-2?"#dfbf83":lightWood);}wheel(c,-10,-9,4);rect(c,-16,-15,10,5,"#96664d");},
    (c,on)=>{posts(c,[[0,2]],22);line(c,[[-9,-19],[9,-21]],timber,2);c.save();c.translate(0,-21);if(!on)c.rotate(.9);poly(c,[[-11,1],[-4,-3],[1,-4],[2,-9],[5,-9],[4,-4],[11,-3],[11,-1],[3,0],[-1,2]],on?"#c7b88b":"#7c8a79");c.restore();},
    (c,on)=>{posts(c,[[-12,1],[11,-3]],14);if(on){rect(c,-11,-13,6,8,timber);for(let k=0;k<4;k++)line(c,[[-11,-11+k*2],[-5,-10+k*2]],lightWood);boat(c,6,1,.62);}else{for(let k=0;k<6;k++){line(c,[[-11+k*4,-12],[Math.min(11,-7+k*4),-1]],"#baa477");line(c,[[-10+k*3,-2],[-4+k*3,-12]],"#8b8572");}}},
    (c,on)=>{poly(c,[[-17,2],[-10,-3],[0,-4],[7,1],[-4,4]],"#9c9a78");boat(c,on?5:-5,on?1:-2,.92);if(!on){line(c,[[-11,-8],[-6,1]],ink,2);}else line(c,[[-12,3],[-4,3]],"#bdd4b7");},
    (c,on)=>{for(const [dx,dy] of [[-8,0],[on?3:8,on?-2:-7]]){for(let j=0;j<4;j++)line(c,[[dx-4+j*2,dy+1],[dx+2+j*2,dy-9]],"#92784c",2);line(c,[[dx-2,dy-2],[dx+6,dy-2]],lightWood);}if(on)line(c,[[-4,-4],[5,-8],[6,-5],[-3,-2]],"#d98956",2);},
    (c,on)=>{posts(c,[[-11,1],[11,-2]],13);for(let j=0;j<7;j++){const x=-9+j*3;line(c,[[x,-2],[on?x+1:x+7,on?-11:-4]],on?"#ab9b61":"#758456",2);}line(c,[[-12,-12],[11,-14]],timber,2);if(on)poly(c,[[7,4],[12,3],[17,0],[13,4]],"#b2cbbc");},
    (c,on)=>{roof(c,-2,0,1.08,"#67817a");posts(c,[[11,1]],17);rect(c,8,-15,7,8,ink);rect(c,9,-14,5,6,on?"#72b6b3":"#968168");if(on){line(c,[[10,-11],[12,-10],[14,-13]],"#f0deac");}else line(c,[[9,-12],[13,-9]],timber);},
    (c,on)=>{posts(c,[[-17,2],[16,-1]],22);const end=on?[-1,-4]:[-8,-17];line(c,[[-16,-3],end],ink,5);line(c,[[-16,-4],end],lightWood,3);const other=on?[0,-4]:[7,-18];line(c,[[15,-6],other],timber,4);line(c,[[15,-7],other],lightWood,2);line(c,[[-17,-21],[-1,-24],[16,-23]],ink,3);wheel(c,-15,-16,4);rect(c,12,on?-18:-11,5,6,metal);line(c,[[14,-22],[14,on?-18:-11]],timber);},
    (c,on)=>{for(let j=0;j<4;j++){const x=-12+j*5,y=-j*3;poly(c,[[x,y],[x+11,y-2],[x+14,y],[x+3,y+3]],j%2?"#9d9e80":"#829181");line(c,[[x+3,y+3],[x+13,y]],ink);}posts(c,[[-11,1]],18);for(let j=0;j<4;j++)rect(c,-10,-15+j*4,3,1,on?gold:"#7a8270");if(on)line(c,[[-9,-2],[9,-10]],lightWood,3);},
    (c,on)=>{poly(c,[[-13,-13],[-5,-15],[0,-7],[13,-3],[8,2],[-3,-2]],ink);line(c,[[-12,-13],[-4,-11],[0,-5],[11,-1]],on?"#9ed4bc":"#968269",3);if(on){line(c,[[10,-1],[14,3],[19,3]],"#c5e1c2",2);}else rect(c,-1,-7,7,4,timber);},
    (c,on)=>{roof(c,-4,-4,.94,"#8f8484","#b3a58a");rect(c,2,-5,11,6,timber);if(on){line(c,[[1,-7],[8,-12],[14,-10]],lightWood,3);rect(c,4,-6,8,3,"#d7d1a5");rect(c,6,-6,2,1,metal);}else{rect(c,2,-7,11,4,"#c7ac79");line(c,[[6,-7],[6,0]],"#765749");}},
    (c,on)=>{for(const [x,y] of [[-9,0],[9,-3]]){posts(c,[[x,y]],12);poly(c,on?[[x-5,y-16],[x+2,y-19],[x+5,y-11],[x-2,y-8]]:[[x-5,y-10],[x+4,y-11],[x+5,y-9],[x-4,y-7]],on?"#c8d2a4":"#708477");}if(on)line(c,[[-6,-15],[8,-18]],"#d8c88e");},
    (c,on)=>{for(const [x,y] of [[-12,1],[-1,-12],[1,1],[12,-3]]){rect(c,x-2,y-2,5,4,timber);rect(c,x,y-6,2,4,on?gold:metal);}line(c,[[-12,0],[1,0],[12,-4]],on?gold:timber);line(c,[[0,-10],[1,0]],on?gold:timber);},
    (c,on)=>{roof(c,-9,2,.77,"#768788");roof(c,10,-3,.87,"#9b7d6e");if(on){line(c,[[-7,-9],[10,-15]],lightWood,3);for(let j=0;j<6;j++)rect(c,-6+j*3,-10-j,1,3,timber);}else line(c,[[-5,-10],[0,-4]],timber,2);},
    (c,on)=>{for(const [x,lift] of [[-9,false],[7,on]]){posts(c,[[x-5,0],[x+5,-1]],18);rect(c,x-5,-17,13,3,lightWood);rect(c,x-3,lift?-17:-10,8,10,metal);line(c,[[x-3,lift?-13:-6],[x+4,lift?-15:-9]],ink);}if(on)line(c,[[4,1],[12,1],[15,-1]],"#c2d8b8");},
    (c,on)=>{wheel(c,-1,0,4);c.save();c.translate(-1,-2);c.rotate(on?-.38:.65);rect(c,-13,-3,27,5,timber);rect(c,-13,-3,27,2,lightWood);for(let j=0;j<5;j++)rect(c,-8+j*4,-3,1,4,ink);c.restore();posts(c,[[13,0]],8);},
    (c,on)=>{for(let j=0;j<3;j++){const x=on?[-13,4,12][j]:-7+j*6,y=on?[-1,-7,0][j]:-j*2;poly(c,[[x-4,y],[x-3,y-8],[x+1,y-12],[x+5,y-7],[x+6,y]],ink);poly(c,[[x-3,y-7],[x,y-10],[x+3,y-7],[x+1,y-2]],"#9b9f8c");}if(on)line(c,[[-8,1],[-2,-2],[3,-1]],gold,2);},
    (c,on)=>{
      // The lower floor has gone under water. Only its wet pilings and ragged floor survive.
      for(const x of [-16,-8,9,17]){rect(c,x,-3,4,10,ink);rect(c,x,-3,1,7,"#a59475");}
      poly(c,[[-22,-3],[0,-9],[21,-5],[21,-1],[-1,5],[-22,1]],"#455b58");
      line(c,[[-20,-3],[0,-8],[20,-5]],"#aeb19a",2);
      for(const x of [-13,11]){rect(c,x,-28,5,27,"#433f37");rect(c,x+1,-27,2,24,"#b19565");rect(c,x-1,-6,7,3,metal);}
      poly(c,[[-23,-26],[-16,-30],[-10,-33],[-1,-38],[9,-33],[17,-30],[24,-28],[20,-24],[8,-27],[0,-30],[-12,-25],[-18,-23]],ink);
      line(c,[[-22,-27],[-13,-30],[-1,-37],[9,-32],[21,-28]],"#bca77f",2);
      for(const x of [-14,-10,-6,6,10,14])line(c,[[0,-36],[x,-29]],"#6e807a");
      rect(c,-7,-39,13,5,timber);rect(c,-5,-38,2,3,gold);rect(c,1,-38,2,3,gold);
      poly(c,[[-14,-39],[-8,-43],[-2,-49],[1,-52],[6,-46],[14,-40],[10,-37],[0,-42],[-10,-37]],"#425d5c");
      line(c,[[-13,-40],[-6,-43],[0,-51],[7,-44],[13,-40]],lightWood,2);
      rect(c,-1,-55,2,6,metal);rect(c,-2,-56,4,2,gold);
      line(c,[[0,-28],[0,on?-20:-2]],metal,2);
      if(on){poly(c,[[-6,-17],[-3,-22],[2,-22],[5,-18],[6,-12],[9,-9],[-8,-9]],"#966d45");line(c,[[-5,-17],[-3,-21],[1,-21]],"#f0d39a",2);line(c,[[-7,-10],[7,-10]],gold,2);rect(c,-1,-8,2,2,gold);}
      else{line(c,[[-7,1],[-2,-2],[5,0],[8,1]],gold,2);line(c,[[-13,3],[-6,3],[-2,4],[9,2]],"#96bcac");}
      lamp(c,20,0,on);
    }
  ];
  const sprites=new Map();
  function prop(i,on){
    const key=i*2+Number(on);if(sprites.has(key))return sprites.get(key);
    const large=i===19,im=canvas(large?58:46,large?68:45),c=im.getContext("2d");c.translate(im.width/2,im.height-6);c.imageSmoothingEnabled=false;
    props[i](c,on);sprites.set(key,im);return im;
  }
  function use(c,i,x,y,on,scale=1){
    const image=prop(i,on);c.drawImage(image,Math.round(x-image.width*scale/2),Math.round(y-(image.height-6)*scale),Math.round(image.width*scale),Math.round(image.height*scale));
  }
  const lands=[
    [[-8,-8],[390,-8],[388,57],[317,52],[292,67],[253,65],[229,85],[223,124],[186,139],[186,170],[135,177],[109,193],[55,196],[40,213],[11,213],[-8,223]],
    [[-8,207],[42,195],[72,197],[86,221],[118,216],[147,200],[181,198],[191,218],[176,240],[152,246],[132,259],[111,261],[82,278],[45,269],[14,284],[-8,286]],
    [[201,227],[218,205],[255,197],[272,179],[304,174],[323,149],[390,145],[391,363],[351,359],[328,342],[293,333],[273,314],[250,310],[241,295],[207,288],[193,263]],
    [[-8,331],[32,335],[51,320],[94,323],[111,342],[151,344],[164,359],[197,358],[213,356],[225,364],[267,366],[274,382],[250,397],[224,398],[211,415],[173,427],[152,419],[121,420],[100,442],[70,441],[40,454],[-8,445]],
    [[-8,433],[56,426],[69,441],[87,446],[81,472],[105,477],[122,499],[143,498],[148,523],[131,530],[101,521],[82,527],[61,510],[41,507],[29,491],[-8,493]],
    [[153,503],[171,497],[187,509],[203,501],[212,481],[238,475],[253,459],[289,461],[309,441],[388,436],[393,550],[336,541],[317,553],[291,552],[269,537],[241,534],[219,545],[190,540],[170,554],[148,534]],
    [[265,552],[290,545],[314,546],[332,555],[349,557],[384,550],[390,615],[366,620],[345,609],[326,620],[292,616],[271,601],[253,597],[255,570]],
    [[120,682],[130,658],[154,649],[182,646],[207,632],[223,612],[252,610],[266,620],[274,643],[252,655],[226,654],[207,675],[182,691],[157,705],[136,702]]
  ];
  const edgesOfLand=["#979b70","#8c9a6d","#849775","#aaa17d","#b6aa85","#8d9b8c","#81978b","#929c87"];
  function tree(c,x,y,n){
    const tint=["#64865e","#728d5d","#658171"][(n>>>0)%3];
    rect(c,x-1,y-5,3,7,timber);
    poly(c,[[x-9,y-8],[x-8,y-15],[x-4,y-17],[x-2,y-22],[x+4,y-21],[x+6,y-17],[x+10,y-13],[x+8,y-7],[x+3,y-5]],"#365749");
    poly(c,[[x-8,y-11],[x-6,y-16],[x-2,y-17],[x,y-21],[x+4,y-19],[x+7,y-15],[x+5,y-10],[x-2,y-8]],tint);
    rect(c,x-4,y-17,4,2,"#a0ab7f");
  }
  function ruins(c,x,y,n){
    for(let j=0;j<n;j++){
      const xx=x+j*6,yy=y-Math.abs(j-1)%3*2;
      rect(c,xx,yy-6,6,6,"#556e69");rect(c,xx,yy-7,5,3,"#a3aa8f");rect(c,xx+1,yy,6,2,"#536c68");
    }
  }
  function tide(c,completed=0){
    const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,"#86a3a0");g.addColorStop(.32,"#5d938f");g.addColorStop(.66,"#608884");g.addColorStop(1,"#456e77");c.fillStyle=g;c.fillRect(0,0,w,h);
    for(let i=0;i<610;i++){
      const x=Math.floor(hash(i*3+5)*w),y=Math.floor(hash(i*7+18)*h),l=4+Math.floor(hash(i+15)*16);
      rect(c,x,y,l,1,i%4?"#91b2a140":"#bac7a66e");if(i%7===0)rect(c,x+6,y+2,l/2,1,"#d7d2ab83");
    }
    lands.forEach((p,i)=>{
      poly(c,p.map(([x,y])=>[x,y+5]),"#3f6e69");poly(c,p.map(([x,y])=>[x,y+2]),"#c0b696");poly(c,p,edgesOfLand[i]);
      c.save();c.beginPath();p.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
      for(let j=0;j<380;j++){const x=Math.floor(hash(i*400+j)*w),y=Math.floor(hash(i*250-j)*h);
        rect(c,x,y,3+hash(j+10)*13,1+(j%3===0),j%2?"#7b856850":"#d5c79a75");}
      c.restore();
    });
    // Contours are fields in the west, exposed mud and sluice wall farther down, roofs in the flooded basin.
    for(const [x,y,rows] of [[4,14,5],[109,15,4],[184,30,3],[3,123,4]]){
      for(let j=0;j<rows;j++){
        const yy=y+j*5;poly(c,[[x,yy],[x+18,yy-7],[x+40,yy-5],[x+28,yy-1]],j%2?"#c4ad75":"#a0a078");
        line(c,[[x,yy],[x+18,yy-7],[x+39,yy-5]],"#dad09f");
      }
    }
    for(const [cx,cy,n] of [[21,61,4],[132,35,3],[335,38,5],[63,152,3],[337,175,6],[22,356,3],[57,464,3],[330,492,4]]){
      for(let j=0;j<n;j++)tree(c,cx+(j%3)*10,cy+Math.floor(j/3)*11+j%2*4,j);
    }
    for(const [cx,cy,n] of [[46,207,4],[115,257,7],[253,219,6],[331,278,7],[255,304,3],[53,314,7],[158,388,4],[28,467,5],[139,567,4],[293,564,5],[195,713,5]]){
      for(let j=0;j<n;j++)reed(c,cx+j%4*7,cy+Math.floor(j/4)*6+j%2*2,.9);
    }
    for(const [x,y,s] of [[20,103,.89],[33,110,.72],[103,49,.66],[343,224,.88],[357,235,.73],[290,381,.65],[154,514,.8],[188,524,1],[208,557,.7],[336,586,.9],[347,582,.56]])roof(c,x,y,s);
    for(const [x,y,n] of [[24,396,5],[278,354,5],[114,442,3],[222,477,3],[280,592,4],[177,669,5],[117,702,4],[202,705,2]])ruins(c,x,y,n);
    for(const [x,y] of [[24,241],[211,192],[281,431],[111,592],[298,667]]){boat(c,x,y,.58,"#78735c");}
    if(completed===20){for(const [x,y] of [[58,61],[132,140],[312,302],[91,486],[242,620],[161,676]])lamp(c,x,y,true);}
  }
  function road(c,edge,i){
    const planks=[4,5,6,8,9,10,12,14,15,16,17,18].includes(i),stone=[10,12,17,18].includes(i);
    line(c,edge,planks?"#48665f":"#7c815f",planks?9:13);line(c,edge,planks?(stone?"#a2a58d":"#af9269"):"#d3bf8a",planks?6:9);
    for(let j=1;j<edge.length;j++){
      const [a,b]=[edge[j-1],edge[j]],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
      for(let d=7;d<length-1;d+=planks?7:11){const x=a[0]+dx*d/length,y=a[1]+dy*d/length;
        if(planks){line(c,[[x-2.6*nx,y-2.6*ny],[x+2.6*nx,y+2.6*ny]],stone?"#828f80":"#796f56");if((d-7)%21===0)rect(c,x+nx*4,y+ny*4,2,3,ink);}
        else rect(c,x,y,2,1,"#b1956d");
      }
    }
  }
  const forks=[
    {site:[246,324],mark:[230,318],in:[[294,245],[271,253],[259,276],[243,298],[246,324]],out:[[246,324],[258,337],[278,335],[293,325],[308,323]]},
    {site:[351,277],mark:[359,262],in:[[294,245],[310,231],[330,237],[345,251],[351,277]],out:[[351,277],[355,292],[342,309],[327,317],[308,323]]}
  ];
  function forkLand(c,i,done){
    const f=forks[i],x=f.mark[0],y=f.mark[1];c.save();c.translate(x,y);
    if(i===0){
      poly(c,[[-16,-2],[-3,-6],[10,-1],[-2,4]],"#5b776e");
      posts(c,[[-13,2],[10,-2]],17);
      line(c,[[-13,-12],[-3,done?-9:-3],[10,-15]],done?gold:"#685948",2);
      for(let j=0;j<5;j++){
        const a=-10+j*4;
        if(!done&&j===2)continue;
        line(c,[[a,-3-j%2],[a+3,-6-j%2]],lightWood,3);
      }
      if(done)boat(c,-4,5,.52);
      else{rect(c,-14,-18,6,3,"#bb7658");line(c,[[3,2],[7,5],[10,5]],"#e3c4a0");}
    }else{
      poly(c,[[-11,0],[-11,-14],[7,-16],[13,-11],[13,0],[4,4]],"#5f756e");
      posts(c,[[-9,0],[7,-2]],21);line(c,[[-11,-19],[10,-22]],lightWood,4);
      rect(c,-7,done?-18:-12,14,11,metal);line(c,[[-7,done?-11:-5],[6,done?-14:-8]],"#bbab79",2);
      wheel(c,8,-17,4);
      if(done){line(c,[[-6,0],[0,3],[11,1]],"#b9d7ba",2);line(c,[[-6,3],[2,6],[12,4]],"#93c4b8");}
      else{rect(c,-2,-5,6,4,"#71634d");rect(c,-2,-6,5,2,gold);}
    }
    c.restore();
  }
  let base=null,mapImage=null,lastCompleted="";
  function map(sites,edges,landmarks,completed,completedForks=0,sealedFork=0,painting=null){
    if(!painting&&!base){base=canvas(w,h);const c=base.getContext("2d");tide(c);edges.forEach((e,i)=>{if(i!==8)road(c,e,i);});
      for(const [j,f] of forks.entries()){road(c,f.in,j===0?8:3);road(c,f.out,j===0?8:3);}}
    const key=completed+"-"+completedForks+"-"+sealedFork+"-"+!!painting;if(lastCompleted===key&&mapImage)return mapImage;
    lastCompleted=key;mapImage=painting?canvas(painting.naturalWidth,painting.naturalHeight):canvas(w,h);
    const c=mapImage.getContext("2d");c.imageSmoothingEnabled=false;c.drawImage(painting||base,0,0);
    if(painting)c.scale(mapImage.width/w,mapImage.height/h);
    if(completed===20){for(const [x,y] of [[37,61],[142,145],[312,302],[81,486],[243,613],[149,685]])lamp(c,x,y,true);}
    landmarks.forEach(({propX,propY},i)=>{if(!painting||i<completed)use(c,i,propX,propY,i<completed,i%10===9?1.32:1);});
    forks.forEach((_,i)=>{const done=!!(completedForks&(1<<i));if(!painting||done)forkLand(c,i,done);});
    if(sealedFork){
      const [x,y]=forks[sealedFork-1].in[2];posts(c,[[x-5,y+2],[x+5,y-1]],6);
      line(c,[[x-7,y-5],[x+6,y+1]],ink,4);line(c,[[x-7,y-6],[x+6,y]],lightWood,2);
      line(c,[[x-6,y],[x+6,y-7]],timber,3);rect(c,x-1,y-5,2,2,gold);
    }
    return mapImage;
  }
  // Five shoreline profiles. The cropped composition, orientation and material of the fighting bank
  // vary by site; its own repairable landmark remains in the background throughout the encounter.
  const scenes=[
    ["#e7d3a0","#a3b8a1","#748f78","#839663","#aba374","#757e59"],
    ["#c9d6b2","#85b4ad","#5e9088","#688b6e","#a3a074","#617b60"],
    ["#e1c19a","#a8b2a3","#768579","#758b81","#ad9c77","#77765b"],
    ["#d6c0ac","#9cb1af","#707f86","#8f9280","#bcad89","#817c72"],
    ["#d0c6b8","#8ca8b0","#667f89","#768d92","#a1a397","#737e78"]
  ];
  const layouts=[[96,269,1.48],[82,112,1.64],[91,284,1.56],[70,130,1.49],[91,302,1.8],[66,82,1.62],[82,266,1.78],[63,153,1.75],[77,287,1.77],[91,197,2.38],[80,284,1.63],[67,114,1.75],[78,246,1.91],[71,143,1.72],[77,289,1.76],[89,113,1.94],[68,270,1.75],[74,133,1.78],[85,307,1.72],[89,226,2.35]];
  const stages=new Map();
  function battle(i,completed=0,arena=false){
    i=Math.max(0,Math.min(19,Math.trunc(i)||0));const repaired=i<completed,key=i+20*Number(repaired);
    if(typeof ScenicArt!=="undefined"){
      const [h,x,scale]=layouts[i];
      const feature=c=>use(c,i,x,h+13,repaired,scale*.77);
      if(arena){const frame=typeof ArenaArt!=="undefined"&&ArenaArt.battle(80+i,repaired,feature);if(frame)return frame;}
      const view=ScenicArt.battle(80+i,repaired,feature);
      if(view)return view;
      const surroundings=ScenicArt.surroundings(80+i,repaired,c=>{
        const district=Math.floor(i/4);
        // The far bank retains its own settlement type on the way from
        // the orchard through the reed gulf to the flooded rooftops.
        if(district===0){tree(c,38,h-9,1);roof(c,65,h-8,.65);}
        if(district===1){reed(c,38,h-5,1);boat(c,56,h-2,.62);}
        if(district===2){ruins(c,53,h-9,4);wheel(c,86,h-12,4);}
        if(district===3){ruins(c,48,h-8,3);roof(c,78,h-9,.65,"#827273");}
        if(district===4){roof(c,37,h-8,.63,"#65717c");roof(c,65,h-10,.52,"#75818a");}
        use(c,i,x,h+13,repaired,scale*.87);
      });
      if(surroundings)return surroundings;
    }
    if(stages.has(key))return stages.get(key);
    const s=canvas(384,154),c=s.getContext("2d"),district=Math.min(4,Math.floor(i/4)),p=scenes[district];
    const [horizon,feature,scale]=layouts[i];c.imageSmoothingEnabled=false;
    const g=c.createLinearGradient(0,0,0,horizon+16);g.addColorStop(0,p[1]);g.addColorStop(1,p[0]);c.fillStyle=g;c.fillRect(0,0,384,154);
    for(let j=0;j<7;j++){const x=Math.floor(hash(i*43+j)*384),y=10+Math.floor(hash(i*17+j)*22);rect(c,x,y,20+j*3,2,"#eee1bd7c");}
    const ridge=[[-4,horizon],[-4,horizon-22]];
    for(let j=0;j<18;j++)ridge.push([j*24,horizon-23-Math.floor(hash(i*57+j)*22)]);
    ridge.push([392,horizon]);poly(c,ridge,p[2]);
    // The western orchards, reed gulf, walled weigh basin, spired salt store and drowned rooftops
    // have distinct silhouettes; the tower gradually grows as the party reaches the last basin.
    for(let j=0;j<10;j++){const x=(j*49+i*17)%401-8,y=horizon-8-Math.round(hash(j+i)*8);
      if(district===0){tree(c,x,y,j);if(j%4===0)roof(c,x+14,y+1,1.1);}
      else if(district===1){reed(c,x,y,1.4);if(j%4===1)boat(c,x+13,y+4,.7);}
      else if(district===2){ruins(c,x,y,5);if(j%4===0){posts(c,[[x+10,y]],18);wheel(c,x+10,y-9,5);}}
      else if(district===3){if(j%3===0)roof(c,x,y,.85,"#847775");else ruins(c,x,y,3);}
      else {if(j%3!==0)roof(c,x,y,.66,"#6a7780");else ruins(c,x,y,3);}
    }
    rect(c,0,horizon,384,154-horizon,p[3]);for(let k=0;k<66;k++){
      const x=Math.floor(hash(k+i*83)*384),y=horizon+Math.floor(hash(k*7+i*19)*34);
      rect(c,x,y,4+Math.floor(hash(k)*15),1,"#d4cda480");
    }
    const bank=[[0,154],[0,116+i%7],[49,110+i%5],[99,113],[151,118-i%7],[210,111+i%9],[267,116],[321,112+i%6],[384,110],[384,154]];
    poly(c,bank,p[5]);poly(c,bank.map(([x,y])=>[x,y===154?y:y+3]),p[4]);
    for(let j=0;j<50;j++){const x=Math.floor(hash(i*16+j)*384),y=124+Math.floor(hash(i+j*13)*30);rect(c,x,y,2+j%6,1,"#716f5b58");}
    use(c,i,feature,horizon+13,repaired,scale);
    if(district===1||district===4){reed(c,7,124,1.25);reed(c,375,122,1.5);}
    stages.set(key,s);return s;
  }
  return {map,battle,prop,forks};
})();
