"use strict";
// Ground contacts in the existing 384 × 652 map. The high-value goods travel
// from the sorting shed by crane past the timber yard, mill and lower signal tower.
const ForestOutposts=(()=>{
  const places=[
    {kind:"sorting",x:99,y:64,w:52,h:40},
    {kind:"crane",x:143,y:88,w:40,h:46},
    {kind:"yard",x:307,y:104,w:50,h:48},
    {kind:"flume",x:24,y:275,w:43,h:34},
    {kind:"signal",x:210,y:554,w:43,h:52}
  ];
  const native=new Map(),boughs=new Map();
  const edge="#414438",shade="#5e4e39",wood="#906c47",amber="#ba925c",light="#e2bd7d",
    stone="#797c69",silver="#b4b39a",red="#a46248",ink="#4b5545",linen="#e7d09d",turq="#607d70";
  function surface(w,h){const ca=document.createElement("canvas");ca.width=w;ca.height=h;return ca;}
  function brushes(c){
    const rect=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
    const poly=(col,pts)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const line=(col,path,n=1)=>{c.strokeStyle=col;c.lineWidth=n;c.lineCap="square";c.lineJoin="bevel";c.beginPath();path.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
    const oval=(col,x,y,w,h)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,w,h,0,0,Math.PI*2);c.fill();};
    return {rect,poly,line,oval};
  }
  function sprite(kind){
    if(native.has(kind))return native.get(kind);
    const site=places.find(p=>p.kind===kind);if(!site)return null;
    const ca=surface(site.w,site.h),c=ca.getContext("2d"),{rect,poly,line,oval}=brushes(c);
    function box(x,y,w,d,h,top,left,right){
      poly(left,[[x,y-h],[x+w,y-h+1],[x+w,y],[x,y-1]]);
      poly(right,[[x+w,y-h+1],[x+w+d,y-h-d*.48],[x+w+d,y-d*.48],[x+w,y]]);
      poly(top,[[x,y-h],[x+d,y-h-d*.48-1],[x+w+d,y-h-d*.48],[x+w,y-h+1]]);
    }
    function roof(x,y,w,h){
      poly(edge,[[x-2,y],[x+8,y-h-2],[x+w+1,y-h-3],[x+w+5,y-2],[x+w,y+3],[x,y+4]]);
      poly("#ae7450",[[x,y],[x+9,y-h],[x+w,y-h-2],[x+w-7,y+1]]);
      poly("#6d5642",[[x+w-7,y+1],[x+w,y-h-2],[x+w+4,y-2],[x+w,y+2]]);
      for(let row=1;row<Math.ceil(h/3);row++){
        const left=x+Math.round(7*(1-row*3/h)),right=x+w-2-Math.round(6*row*3/h),py=y-h+row*3;
        for(let j=left;j<right;j+=4){rect((j+row)%3?"#bf8c5e":"#d0a16c",j,py,3,1);rect("#815b41",j+1,py+1,2,1);}
      }
      line("#e4b77b",[[x+8,y-h-1],[x+w-1,y-h-2]]);line(wood,[[x,y+2],[x+w-7,y+2]]);
    }
    function parcel(x,y,w,h){
      box(x,y,w,3,h,"#e1c894","#b29766","#887553");rect("#a55642",x+w*.45,y-h+1,2,h-1);
      rect("#e9ddbc",x+1,y-h+1,3,2);
    }
    function post(x,y,h){rect(shade,x,y-h,3,h);rect(amber,x,y-h,1,h-1);rect(light,x,y-h,3,1);}
    function wheel(x,y,r){
      oval(edge,x,y,r+1,r+1);oval(amber,x,y,r,r);oval(shade,x,y,r-2,r-2);
      for(let i=0;i<4;i++){let a=i*Math.PI/4;line(wood,[[x-Math.cos(a)*(r-2),y-Math.sin(a)*(r-2)],[x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2)]],2);}
      rect(light,x-1,y-1,2,2);
    }
    if(kind==="sorting"){
      box(4,34,29,11,4,silver,stone,"#626b5b");
      box(6,30,25,10,17,"#cbb582","#c0aa7a","#978866");
      for(const x of [7,20,29])rect(wood,x,14,2,16);rect(wood,6,22,25,2);
      box(11,26,8,2,8,wood,edge,shade);rect("#d0b475",12,19,5,4);line(red,[[12,19],[14,21],[17,19]]);
      roof(3,16,35,9);box(31,28,9,4,6,amber,wood,shade);parcel(31,23,7,4);
      parcel(34,35,9,6);parcel(42,34,5,4);
      post(45,26,22);poly(red,[[47,5],[51,7],[50,11],[47,11]]);rect(light,47,6,2,2);
    }else if(kind==="crane"){
      box(3,41,22,8,3,amber,wood,edge);for(let j=0;j<6;j++)line(shade,[[5+j*4,38],[9+j*4,35]]);
      post(11,37,28);post(15,36,20);line(wood,[[11,34],[4,39]],3);line(amber,[[12,24],[29,10]],3);
      line(shade,[[9,8],[31,3],[34,5]],4);line(light,[[9,7],[32,3]],1);
      const rope="#d0c297";line(rope,[[17,22],[11,10],[32,5],[32,23]]);oval(edge,32,7,2,2);
      poly(turq,[[26,27],[32,22],[37,28],[35,33],[27,33],[24,29]]);line(linen,[[26,28],[32,24],[36,28],[32,31],[26,28]]);
      wheel(12,31,5);parcel(0,35,6,5);
    }else if(kind==="yard"){
      box(4,43,31,10,4,silver,stone,"#626b59");
      post(6,38,18);post(27,39,20);post(37,34,16);
      line(wood,[[8,36],[27,22]],2);line(amber,[[8,22],[26,37]],2);
      box(5,25,23,8,3,"#cab080",wood,shade);roof(1,18,33,9);
      line(shade,[[3,12],[36,7],[46,10]],3);line(light,[[3,11],[36,6],[46,9]]);
      line(linen,[[46,10],[46,25],[37,30]]);line(wood,[[33,29],[46,25]],4);
      for(const [x,y] of [[3,42],[7,45],[12,41],[16,44],[34,36],[34,40]]){
        poly(wood,[[x,y-2],[x+9,y-5],[x+13,y-4],[x+3,y]]);line(amber,[[x+1,y-2],[x+10,y-4]]);rect(light,x,y-2,3,2);
      }
      rect(red,31,13,3,9);rect(linen,32,15,1,3);
    }else if(kind==="flume"){
      for(const [x,y,h] of [[4,26,13],[18,21,11],[32,17,12]]){post(x,y,h);post(x+6,y+2,h-1);}
      poly(edge,[[0,15],[34,3],[42,6],[9,21],[0,19]]);
      poly(wood,[[1,15],[34,4],[40,6],[7,19]]);poly("#72948a",[[6,15],[33,6],[37,7],[8,18]]);
      line(light,[[1,14],[34,3]]);line("#e1d3a4",[[12,14],[30,8]]);
      for(let k=0;k<4;k++){line(k%2?"#b9cbb0":"#84ada0",[[5+k,18],[6+k,24],[4+k,30]],1);}
      wheel(23,22,7);line(amber,[[16,22],[33,21]],2);rect(stone,28,26,9,2);
    }else{
      box(3,48,26,10,5,silver,stone,"#5d6d60");
      for(const [x,y,h] of [[8,42,20],[25,43,23],[32,39,20]])post(x,y,h);
      line(wood,[[10,40],[24,24]],2);line(amber,[[11,24],[25,40]],2);box(5,27,24,7,4,"#ddbe85",wood,shade);
      post(8,24,9);post(26,24,10);poly("#bc8b50",[[15,14],[19,12],[23,15],[24,20],[26,21],[13,22],[14,20]]);
      rect(light,16,16,2,3);rect(wood,18,22,3,3);roof(2,13,30,8);
      rect(shade,29,1,2,8);poly(red,[[31,2],[41,3],[37,6],[31,6]]);rect("#e2c17b",31,3,5,1);
      for(const [x,y] of [[2,48],[5,45],[8,42]]){rect("#a9ad91",x,y,10,2);rect("#6f7968",x,y+2,10,1);}
    }
    native.set(kind,ca);return ca;
  }
  function overlaps(x,y,r){
    return places.some(p=>Math.abs(x-p.x)<p.w/2+r+1&&y>p.y-p.h-3&&y-r*2<p.y+4);
  }
  function ground(c){
    const {poly,line,rect,oval}=brushes(c);
    for(const [n,p] of places.entries()){
      const x=p.x,y=p.y,ww=p.w*.53;
      const yard=[[x-ww,y-4],[x-ww*.64,y-11],[x+ww*.50,y-10],[x+ww,y-5],[x+ww*.90,y+1],[x+ww*.49,y+5],[x-ww*.60,y+4]];
      poly(n===1?"#6f826c":"#929372",yard);
      for(let j=0;j<23;j++){const dx=(j*29+7)%Math.floor(ww*1.55)-ww*.77,dy=(j*11+3)%10-6;
        rect(j%3?"#aaa383":"#817e64",x+dx,y+dy,2+(j%3),1);}
      oval("rgba(52,64,47,.31)",x+3,y-1,ww*.84,4);
    }
    // Worn stone apron connects the annex with the original mail house.
    line("#9b9878",[[62,72],[70,71],[79,67],[91,65]],4);
    for(let i=0;i<7;i++)rect(i%2?"#aea383":"#858b6a",63+i*4,71-i,2,1);
  }
  function grove(c,x,y,s,pine,variant){
    const key=Number(pine)*4+variant;let ca=boughs.get(key);
    if(!ca){
      ca=surface(37,46);const {poly,line,rect,oval}=brushes(ca.getContext("2d"));
      const sets=[["#3e5948","#587459","#7c8a62","#a6a278"],["#3f5344","#607957","#829265","#acaa7c"],["#3a5348","#516e5b","#759078","#a2ab86"],["#524f3b","#74794c","#93935b","#b9ab6d"]];
      const [deep,mid,sun,tip]=sets[variant],cx=17;
      oval("rgba(57,66,48,.25)",20,41,14,3);rect("#5a5340",cx-2,22,5,19);rect("#a08661",cx-2,24,2,16);
      line("#675a43",[[cx,32],[cx-6,22],[cx-10,20]],2);line("#866e50",[[cx,30],[cx+6,23]],2);
      if(pine){
        for(const [yy,r,h] of [[30,14,19],[23,11,16],[16,8,13],[10,5,9]]){
          poly(deep,[[cx,yy-h],[cx+r*.55,yy-5],[cx+r,yy+2],[cx+r*.50,yy+1],[cx+r*.66,yy+4],[cx+1,yy+2],[cx-3,yy+4],[cx-r,yy+2],[cx-r*.66,yy-1]]);
          poly(mid,[[cx,yy-h+1],[cx+1,yy-5],[cx-3,yy],[cx-r*.46,yy-1],[cx-r*.85,yy+1],[cx-r*.43,yy-4]]);
          line(sun,[[cx-1,yy-h+4],[cx-r*.48,yy-3],[cx-r*.60,yy-2]]);rect(tip,cx-r*.4,yy-3,2,1);
        }
      }else{
        const clumps=[[12,21,10,7],[22,20,10,8],[10,14,8,7],[19,11,10,9],[26,17,8,6],[16,23,9,6]];
        for(const [xx,yy,rx,ry] of clumps){
          const pts=[[xx-rx,yy],[xx-rx+2,yy-ry+2],[xx-3,yy-ry],[xx,yy-ry-1],[xx+rx-3,yy-ry+1],[xx+rx,yy-2],[xx+rx-1,yy+3],[xx+4,yy+ry],[xx-3,yy+ry],[xx-rx+1,yy+4]];
          poly(deep,pts);poly(mid,[[xx-rx+1,yy],[xx-rx+3,yy-ry+2],[xx-2,yy-ry+1],[xx+rx-4,yy-ry+2],[xx+2,yy-1],[xx-4,yy+2],[xx-rx+2,yy+2]]);
          rect(sun,xx-rx+3,yy-ry+3,4,2);rect(tip,xx-rx+4,yy-ry+2,2,1);rect(sun,xx-1,yy-ry+2,3,1);
        }
      }
      boughs.set(key,ca);
    }
    c.drawImage(ca,Math.round(x-18*s),Math.round(y-42*s),Math.round(37*s),Math.round(46*s));
  }
  function draw(c,p){const art=sprite(p.kind);c.drawImage(art,Math.round(p.x-art.width/2),p.y-art.height);}
  return {places,sprite,ground,grove,overlaps,draw};
})();
