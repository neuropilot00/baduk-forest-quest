"use strict";
// Hand-drawn camp signs, provisions and an evening clearing. Draw once per asset.
const CampAtlas=(()=>{
  const cache=new Map(),ink="#263532",pale="#ffdf9b",gold="#c39155",cream="#edd8a7",wood="#795338",dark="#493c32",mint="#84ad94";
  function painter(c){
    const box=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const poly=(color,points)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const line=(color,points,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
    const oval=(color,x,y,rx,ry)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
    return {box,poly,line,oval};
  }
  function icon(c,id){
    const {box,poly,line,oval}=painter(c);
    const sparkle=(x,y,r,color=pale)=>{poly(color,[[x,y-r],[x+1,y-1],[x+r,y],[x+1,y+1],[x,y+r],[x-1,y+1],[x-r,y],[x-1,y-1]]);};
    const woodcut=(x,y,angle)=>{c.save();c.translate(x,y);c.rotate(angle);
      poly(dark,[[-14,-5],[12,-5],[15,-2],[15,4],[12,6],[-14,6],[-17,2],[-17,-2]]);
      box("#a8784d",-14,-4,25,8);line("#d3a26a",[[-13,-2],[-7,-1],[1,-2],[9,-2]]);
      oval("#e3bb7d",11,0,5,4);oval("#ab774b",11,0,3,2);box("#e9c88e",10,-1,2,2);c.restore();};
    const book=(x,y,w,h,cover)=>{poly(ink,[[x-2,y],[x+w,y-3],[x+w+4,y],[x+w+4,y+h],[x+1,y+h+4],[x-2,y+h+2]]);
      poly(cream,[[x+2,y+4],[x+w+2,y+1],[x+w+2,y+h],[x+2,y+h+3]]);for(const j of [3,5,7])line("#b5996a",[[x+3,y+h-j+3],[x+w,y+h-j]]);
      poly(cover,[[x-1,y],[x+w-1,y-3],[x+w+3,y],[x+2,y+4]]);box(gold,x+1,y+3,3,h);};
    const stone=(x,y,r,base,light)=>{oval(ink,x,y+1,r,r*.8);oval(base,x,y,r-1,r*.75);oval(light,x-2,y-2,r*.39,r*.23);};
    const tent=(x,y,w,h,cloth)=>{poly(dark,[[x-w/2-2,y+1],[x-1,y-h-3],[x+w/2+2,y+1]]);poly(cloth,[[x-w/2,y],[x,y-h],[x+w/2,y]]);poly("#725746",[[x,y-h],[x+w*.12,y],[x+w/2,y]]);poly("#354239",[[x-4,y],[x,y-h*.46],[x+5,y]]);line(pale,[[x-1,y-h+2],[x-w*.43,y-1]]);};
    if(id==="party"){
      box(wood,20,5,3,35);box(pale,20,4,2,2);poly("#936846",[[22,7],[39,8],[39,23],[31,20],[23,24]]);poly("#bc7450",[[23,7],[38,8],[38,17],[30,16],[23,19]]);sparkle(29,12,4);
      tent(34,38,32,19,"#537565");tent(18,38,23,15,"#c6ac76");box(wood,43,12,2,27);poly("#d5c080",[[44,13],[54,14],[48,19],[44,18]]);
      woodcut(34,41,-.04);
    }else if(id==="inventory"){
      line(ink,[[18,20],[18,11],[22,7],[35,7],[39,12],[39,21]],4);line(gold,[[18,17],[20,11],[23,9],[34,9],[37,12],[37,17]],2);
      poly(ink,[[11,16],[40,14],[48,19],[48,37],[40,41],[11,40],[7,34],[8,21]]);
      poly("#9a633f",[[10,22],[40,20],[40,38],[12,38],[10,34]]);poly("#684937",[[40,21],[46,18],[46,36],[40,39]]);
      poly("#c38d56",[[9,17],[39,15],[44,18],[40,26],[13,28],[9,25]]);line("#e4b779",[[11,18],[37,17]],2);
      for(const x of [17,33]){box("#6a4734",x,17,4,21);box(gold,x,27,5,5);box(dark,x+1,28,3,2);}
      box("#807b57",23,31,6,6);box(pale,25,32,2,2);
    }else if(id==="equipment"||id==="practice"){
      const a=id==="equipment"?5:9;poly(ink,[[a,18],[33,9],[55,18],[28,31],[a,25]]);
      poly("#bc8b56",[[a,17],[33,8],[55,17],[28,28]]);poly("#ddb681",[[a+3,17],[33,10],[51,17],[28,25]]);
      for(let i=1;i<6;i++){const f=i/6;line("#8e6d44",[[a+3+(33-a-3)*f,17-7*f],[28+23*f,25-8*f]]);line("#8e6d44",[[33+18*f,10+7*f],[a+3+(28-a-3)*f,17+8*f]]);}
      box(dark,a+3,25,4,3);box(dark,27,29,4,4);stone(31,16,3,"#454d4c","#8b9a94");stone(38,17,3,"#eee4c4","#fff8e0");
      if(id==="equipment"){oval(ink,15,34,10,6);oval("#9b764a",15,32,10,5);oval("#624b37",15,31,8,3);stone(14,30,5,"#354540","#83978d");stone(42,32,8,"#d8d2b2","#f7efd9");}
      else{const handle=[[15,32],[24,27],[27,28],[25,32],[18,36],[13,38]];poly("#ae8858",handle);book(25,31,21,4,"#728c75");}
    }else if(id==="records"){
      book(11,29,33,8,"#895644");book(7,17,31,12,"#628270");box(pale,12,21,3,6);line(gold,[[17,22],[31,20]]);
      poly(ink,[[27,34],[33,17],[43,7],[54,5],[51,15],[41,24],[33,27]]);
      poly("#c5ccc0",[[29,30],[36,16],[45,8],[52,7],[48,15],[39,23],[34,24]]);line(pale,[[26,36],[37,21],[49,10]],2);
    }else if(id==="library"){
      poly(ink,[[5,12],[16,9],[29,12],[44,8],[55,10],[57,34],[44,34],[28,39],[18,35],[6,36]]);
      poly("#d1bd89",[[7,13],[18,11],[28,14],[28,35],[18,32],[8,33]]);poly("#eddfac",[[30,14],[45,10],[53,12],[54,31],[44,31],[30,35]]);
      line("#9a865e",[[29,15],[29,35]]);poly("#5d7e61",[[13,26],[14,19],[19,16],[23,17],[21,23],[18,26]]);line("#8e996c",[[12,29],[21,18]]);
      for(const [x,y,l] of [[35,18,12],[36,21,10],[35,24,7],[36,27,11]])line("#a38a63",[[x,y],[x+l,y-2]]);
      poly("#ad654a",[[40,11],[44,10],[45,18],[42,17],[40,19]]);
    }else if(id==="settings"){
      line("#695741",[[17,38],[36,11]],5);line(gold,[[17,38],[36,11]],2);
      oval(ink,35,17,14,13);oval(gold,35,16,12,11);oval("#53695e",35,16,9,8);poly(pale,[[35,8],[38,16],[34,23],[32,16]]);poly("#ba7453",[[35,9],[36,15],[32,17]]);
    }else if(id==="ticket"){
      poly(ink,[[6,16],[43,7],[51,25],[17,38],[9,30],[11,24]]);poly("#c69b64",[[7,17],[42,9],[48,25],[17,35],[11,30],[13,24]]);
      poly("#f2d59a",[[11,18],[40,11],[45,24],[18,31],[15,27],[15,22]]);line(gold,[[14,20],[37,13]]);sparkle(29,22,6,"#996648");line("#b3764c",[[39,12],[44,24]],1);
    }else if(id==="lamp"){
      line(gold,[[23,13],[22,9],[26,5],[32,6],[35,10],[33,13]],2);
      poly(ink,[[19,13],[37,13],[42,19],[38,34],[34,40],[20,38],[17,32],[16,20]]);poly(gold,[[20,16],[36,16],[39,20],[35,33],[22,33],[19,20]]);
      poly("#fac26a",[[22,20],[35,20],[33,31],[24,32]]);poly("#fff0a5",[[26,30],[25,26],[29,21],[32,28],[30,31]]);box(dark,18,17,20,3);box("#736046",25,19,2,13);box("#806348",34,19,2,14);box(gold,22,35,13,3);
    }else if(id==="wood"){woodcut(27,26,-.31);woodcut(34,30,-.12);woodcut(23,20,-.37);}
    else if(id==="pearl"){poly("#506e66",[[10,33],[10,27],[14,18],[22,15],[30,14],[38,19],[46,24],[50,32],[40,37],[19,38]]);for(let i=0;i<6;i++)line("#a6c1ac",[[26,34],[11+i*7,22-Math.sin(i*.65)*4]]);stone(30,25,9,"#ddd7c2","#fff5d8");sparkle(37,19,4);}
    else if(id==="ore"){poly(ink,[[9,34],[12,21],[24,13],[35,15],[44,12],[52,23],[49,34],[29,39]]);poly("#98765a",[[11,32],[15,22],[24,15],[30,18],[25,29],[19,35]]);poly("#d29d63",[[18,23],[27,15],[33,18],[28,25]]);poly("#6d766a",[[27,34],[34,20],[44,14],[49,23],[45,32],[34,36]]);line("#c9b483",[[35,27],[38,23],[45,19]],2);}
    else if(id==="frost"){for(let i=0;i<6;i++){c.save();c.translate(29,23);c.rotate(i*Math.PI/3);line("#66959a",[[0,1],[0,-15]],4);line("#bce3da",[[0,0],[0,-16]],2);line("#c9e7d7",[[-6,-10],[0,-6],[6,-10]],2);c.restore();}sparkle(30,23,4,"#f5efcf");}
    else if(id==="star"){sparkle(29,23,17,"#8b714c");sparkle(29,21,14,"#e1b869");sparkle(29,21,7,"#fff0b7");sparkle(11,15,3,"#c7b99b");sparkle(46,30,4,"#d7c6a2");}
  }
  function paint(canvas,key){
    canvas.width=60;canvas.height=46;
    const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;icon(c,key);return canvas;
  }
  function graphic(key){
    if(!cache.has(key))cache.set(key,"url("+paint(document.createElement("canvas"),key).toDataURL()+")");
    return cache.get(key);
  }
  return {graphic,paint};
})();
