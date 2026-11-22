"use strict";
// Obsidian altar, bronze corner fittings and the equipped goban. Input uses the same 5×5 coordinate space.
const BurstAltar=(()=>{
  const size=440,edge=44,extent=size-edge*2;
  function polygon(c,points,fill){
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();
  }
  function plate(c,x,y,w,h,cut,tone){
    polygon(c,[[x+cut,y],[x+w-cut,y],[x+w,y+cut],[x+w,y+h-cut],[x+w-cut,y+h],[x+cut,y+h],[x,y+h-cut],[x,y+cut]],tone);
  }
  function star(c,x,y,r){
    polygon(c,[[x,y-r],[x+r*.22,y-r*.22],[x+r,y],[x+r*.22,y+r*.22],[x,y+r],[x-r*.22,y+r*.22],[x-r,y],[x-r*.22,y-r*.22]],"#f5db91");
  }
  function corner(c){
    // Drawn as one fitting. The pin and inset rivet cast separate shadows on the frame.
    polygon(c,[[6,46],[6,25],[24,7],[79,7],[69,14],[38,14],[23,28],[23,62],[13,74],[13,42]],"#352d25");
    polygon(c,[[6,43],[6,24],[24,6],[79,6],[69,12],[37,12],[20,28],[20,61],[11,70],[11,39]],"#bf8d51");
    polygon(c,[[7,28],[7,23],[24,6],[69,6],[66,9],[25,9]],"#fae1a1");
    polygon(c,[[13,39],[13,25],[26,13],[56,13],[52,16],[28,16],[17,28],[17,48]],"#4e493a");
    polygon(c,[[23,31],[30,24],[45,24],[41,28],[31,28],[28,31],[28,44],[24,48]],"#c5a262");
    c.fillStyle="#040e14";c.fillRect(21,19,9,9);c.fillStyle="#70817a";c.fillRect(22,19,6,6);c.fillStyle="#e0cd94";c.fillRect(22,19,3,2);
  }
  function draw(canvas,q,boardId,stoneId){
    const c=canvas.getContext("2d");c.clearRect(0,0,size,size);c.imageSmoothingEnabled=false;
    plate(c,5,10,430,426,23,"#080e13");plate(c,5,5,430,426,23,"#7d7453");plate(c,7,8,426,421,21,"#23383e");
    plate(c,12,12,416,410,17,"#14272b");plate(c,17,17,406,400,11,"#5f543c");
    plate(c,19,19,402,396,10,"#342c25");plate(c,23,22,394,388,8,"#8b6c44");
    c.save();c.translate(28,26);Wardrobe.surface(c,size-56,size-56,boardId);c.restore();
    const corners=[[0,0,0],[size,0,1],[size,size,2],[0,size,3]];
    for(const [x,y,k] of corners){c.save();c.translate(x,y);c.rotate(k*Math.PI/2);corner(c);c.restore();}
    for(const x of [size*.28,size*.72]){
      polygon(c,[[x-12,420],[x+12,420],[x+8,431],[x-9,431]],"#92784e");
      c.fillStyle="#d8b573";c.fillRect(x-10,420,20,2);
    }
    const u=extent/5,first=edge+u/2,last=size-first;
    const ink=Wardrobe.boards[boardId][5][2];
    c.strokeStyle=ink;c.lineWidth=1.8;
    for(let i=0;i<5;i++){
      const v=first+i*u;c.beginPath();c.moveTo(first,v);c.lineTo(last,v);c.moveTo(v,first);c.lineTo(v,last);c.stroke();
    }
    for(const p of [6,8,16,18]){
      c.fillStyle=ink;c.beginPath();c.arc(first+(p%5)*u,first+Math.floor(p/5)*u,2.6,0,Math.PI*2);c.fill();
    }
    for(const x of [90,size-90]){c.fillStyle="#a18a5e";c.fillRect(x-15,13,30,1);star(c,x,13,3);}
    for(let p=0;p<25;p++){
      const stone=q.state.board[p];if(!stone)continue;
      const x=first+(p%5)*u,y=first+Math.floor(p/5)*u,r=u*.42;
      c.fillStyle="#452c1640";c.beginPath();c.ellipse(x+2,y+4,r*1.03,r*.97,0,0,Math.PI*2);c.fill();
      Wardrobe.stone(c,x,y,r,stone===2,stoneId);
      if(q.target.includes(p)){
        c.strokeStyle=stone===2?"#8c5122":"#eec87c";c.lineWidth=2.6;c.beginPath();
        c.moveTo(x,y-7);c.lineTo(x+6,y);c.lineTo(x,y+7);c.lineTo(x-6,y);c.closePath();c.stroke();
        for(let i=0;i<4;i++){c.save();c.translate(x,y);c.rotate((i+.5)*Math.PI/2);c.strokeStyle="#644223";c.lineWidth=4;c.beginPath();c.arc(0,0,r+3,-.13,.13);c.stroke();c.strokeStyle="#ffe3a1";c.lineWidth=1.7;c.stroke();c.restore();}
      }
    }
  }
  return {draw};
})();
