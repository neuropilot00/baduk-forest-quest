"use strict";
// Small story objects share the environment's sunlight and nearest-neighbour pixels.
const RoadObjects=(()=>{
  function draw(c,kind,x,y,s,pose){
    if(!kind)return;
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);c.imageSmoothingEnabled=false;
    const ink="#302d29",wood="#9c6640",light="#dcaf72",gold="#e9c475",red="#a44330";
    function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
    function poly(pts,color){c.beginPath();pts.forEach(([a,b],n)=>n?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fillStyle=color;c.fill();}
    if(kind==="oar"||kind==="paint"){
      c.rotate(pose==="inspect"?-.6:pose==="offer"?-.27:-.08);
      poly([[-27,-2],[3,-2],[12,-6],[26,-6],[30,-3],[30,1],[24,5],[10,4],[3,1],[-27,1]],ink);
      box(-25,-1,33,2,wood);box(-21,-1,24,1,light);
      poly([[6,-1],[13,-5],[25,-5],[28,-2],[26,1],[19,3],[10,2]],light);
      poly([[17,-4],[25,-5],[28,-2],[25,0],[21,-1],[19,1]],red);
      if(kind==="paint"){box(16,-3,3,1,"#faac70");box(20,4,2,1,red);}
    }else if(kind==="rope"){
      const ends=[[24,-9],[16,-11],[8,-6],[10,-1],[17,-3],[20,-8],[13,-12],[4,-10],[-6,-3],[-20,0]];
      for(const [width,col] of [[4,ink],[2,light]]){c.lineWidth=width;c.strokeStyle=col;c.beginPath();ends.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.stroke();}
    }else if(kind==="sack"){
      poly([[-11,0],[-14,-5],[-10,-14],[-4,-17],[-7,-22],[2,-22],[4,-17],[10,-14],[14,-4],[10,0]],ink);
      poly([[-9,-1],[-12,-5],[-8,-13],[0,-16],[8,-12],[11,-4],[8,-2]],wood);box(-6,-17,12,3,gold);box(-7,-10,4,6,light);
    }else if(kind==="letter"){
      c.rotate(-.14);box(-12,-15,25,15,ink);box(-11,-14,23,12,"#dfc89b");poly([[-10,-13],[11,-13],[1,-5]],"#b29b77");box(-1,-8,4,4,red);box(0,-7,1,1,gold);
    }else if(kind==="wheel"){
      for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);box(-2,-17,5,9,ink);box(-1,-16,3,5,wood);c.restore();}
      for(const [r,col] of [[12,ink],[10,wood],[7,light],[4,ink]]){c.fillStyle=col;c.beginPath();c.arc(0,-1,r,0,7);c.fill();}
    }else if(kind==="lamp"){
      box(-8,-18,16,19,ink);box(-5,-15,10,13,"#ad713b");box(-3,-12,6,8,"#ffe296");box(-9,-19,18,3,gold);box(-7,-1,14,3,wood);box(-2,-24,4,5,ink);
    }else if(kind==="whistle"){
      poly([[-11,-2],[-3,-11],[8,-12],[12,-8],[6,-1],[-2,2]],ink);box(-3,-8,11,5,gold);box(-1,-8,4,2,wood);
    }else if(kind==="wood"){
      poly([[-22,-3],[14,-9],[23,-5],[-18,2]],ink);poly([[-19,-3],[13,-7],[19,-5],[-17,0]],light);box(0,-5,8,1,wood);
    }
    c.restore();
  }
  return {draw};
})();
