"use strict";
// Cosmetic ownership is derived from existing achievements. Drawing never changes intersections.
const Wardrobe=(()=>{
  const boards=[
    ["wood",0,0,["榧の木盤","기본 나무판"],["最初から所持","처음부터 보유"],["#edc78a","#cd914e","#68441d"]],
    ["forest",10,0,["木漏れ日の盤","햇살숲 목판"],["初級10の水車の番人を突破","초급 10 물레 수문장 돌파"],["#e1d49e","#aeba83","#455038"]],
    ["river",20,0,["水紋の青磁盤","물결 청자판"],["第1章をクリア","제1장 완료"],["#cde4d9","#9ebdaf","#33564e"]],
    ["ember",40,0,["灰桜の寄木盤","잿빛 벚나무판"],["第2章をクリア","제2장 완료"],["#efd3b6","#c49d90","#614b46"]]
  ];
  const stones=[
    ["classic",0,0,["黒石と白石","기본 흑백돌"],["最初から所持","처음부터 보유"],["#58645e","#242e2a","#111815","#ffffff","#fffdf4","#e4ddd0"]],
    ["lunar",0,1,["黒曜石と月真珠","흑요석과 달진주"],["二手読みの挑戦を達成","두 수 읽기 도전 성공"],["#57758f","#253645","#0a1825","#ffffff","#f9f6e6","#d9d0b7"]],
    ["copper",5,0,["煤黒と象牙色の石","먹빛돌과 상아빛돌"],["モルを仲間にする","모루 영입"],["#74594b","#382a28","#201c20","#fff7e9","#f3e4ce","#d3bfa3"]],
    ["aurora",0,8,["極夜と極光の石","극야와 극광의 돌"],["天竜の五番勝負を達成","천룡 5연전 성공"],["#45547d","#25263e","#121b2b","#ffffff","#e4f4eb","#c3dbd6"]]
  ];
  boards.push(...Workshop.additions(0));stones.push(...Workshop.additions(1));
  // Append campaign rewards after all sixteen recipes; existing wardrobe IDs stay stable.
  const reachReady=typeof ReachPuzzles!=="undefined"&&typeof SecondReach!=="undefined";
  const dockBoard=boards.length,shellStones=stones.length;
  if(reachReady){
    boards.push(["postDock",null,0,["修復した郵便桟橋の盤","복원한 우편 선착장 목판"],["初級2の20番目の水門を修復","초급 2의 스무 번째 수문 복구"],["#e5c691","#c69b69","#574027"],null,20]);
    stones.push(["waterScale",null,0,["水秤の甲殻石","물저울 갑각돌"],["初級2の10番目の水門を修復","초급 2의 열 번째 수문 복구"],["#4e6769","#293a3d","#101a1d","#fffbea","#f1ead6","#d8cfbc"],null,10]);
  }
  function owns(item,progress,badges){
    if(!item)return false;
    if(item[7])return reachReady&&progress>=20&&SecondReach.cleared()>=item[7];
    return item[6]?Workshop.owns(saved.work,item[6]):progress>=item[1]&&(badges&item[2])===item[2];
  }
  function repairedDock(c){
    const bands=[0,73,162,256,346,441,540];
    for(let i=0;i<bands.length-1;i++){
      const top=bands[i],bottom=bands[i+1],joint=[104,373,214,455,159,316][i];
      c.fillStyle=i%2?"#fff5d51d":"#8755260c";c.fillRect(0,top,540,bottom-top);
      c.strokeStyle="#70543642";c.lineWidth=2;c.beginPath();
      c.moveTo(0,top);c.lineTo(540,top);c.moveTo(joint,top);c.lineTo(joint,bottom);c.stroke();
      c.lineWidth=1.25;c.strokeStyle="#855d3633";
      for(let n=1;n<=4;n++){
        const y=top+(bottom-top)*n/5;
        c.beginPath();c.moveTo(0,y);c.bezierCurveTo(joint*.48,y-5,joint*.76,y+8,joint-3,y);c.stroke();
        c.beginPath();c.moveTo(joint+3,y+5);c.bezierCurveTo(joint+52,y-7,482,y+4,540,y-3);c.stroke();
      }
      // A shallow bow-tie key physically bridges each staggered joint.
      const y=top+(bottom-top)*.53;
      c.fillStyle="#967351";c.beginPath();c.moveTo(joint-8,y-5);c.lineTo(joint,y-2);c.lineTo(joint+8,y-5);c.lineTo(joint+8,y+5);c.lineTo(joint,y+2);c.lineTo(joint-8,y+5);c.closePath();c.fill();
    }
    c.save();c.translate(46,486);c.rotate(-.26);c.strokeStyle="#77564480";c.lineWidth=2.2;
    c.beginPath();c.arc(0,0,18,0,Math.PI*2);c.moveTo(12,0);c.arc(0,0,12,0,Math.PI*2);c.stroke();
    for(const y of [-7,0,7]){c.beginPath();c.moveTo(15,y);c.bezierCurveTo(22,y-4,30,y+4,40,y);c.stroke();}
    c.restore();
  }
  function shellPlates(c,x,y,r,white){
    c.save();c.translate(x,y);c.scale(r,r);c.rotate(-.26);
    const ridges=[[-.88,-.48,-.36,-.22,0,-.48],[0,-.48,.42,-.18,.92,-.42],
      [-.98,.02,-.48,.28,0,.02],[0,.02,.44,.29,.96,.08],
      [-.81,.48,-.39,.73,0,.49],[0,.49,.4,.73,.81,.51]];
    c.lineJoin="round";c.lineWidth=.07;c.strokeStyle=white?"#9d957c":"#111f26";
    for(const [a,b,m,n,e,f] of ridges){
      c.beginPath();c.moveTo(a,b);c.quadraticCurveTo(m,n+.13,e,f);c.stroke();
    }
    c.lineWidth=.032;c.strokeStyle=white?"#fffef5":"#a5bab366";
    for(const [a,b,m,n,e,f] of ridges){
      c.beginPath();c.moveTo(a,b-.045);c.quadraticCurveTo(m,n+.085,e,f-.045);c.stroke();
    }
    c.lineWidth=.052;c.strokeStyle=white?"#84938899":"#101e24cc";
    c.beginPath();c.moveTo(.03,-.91);c.quadraticCurveTo(-.08,-.36,0,.02);c.quadraticCurveTo(.07,.51,-.02,.88);c.stroke();
    c.restore();
  }
  function surface(c,w,h,id){
    const colors=boards[id][5],gradient=c.createLinearGradient(0,0,w,h);
    gradient.addColorStop(0,colors[0]);gradient.addColorStop(1,colors[1]);c.fillStyle=gradient;c.fillRect(0,0,w,h);
    c.save();c.scale(w/540,h/540);c.lineWidth=1.4;
    if(reachReady&&id===dockBoard){repairedDock(c);c.restore();return;}
    if(id>=4){
      c.strokeStyle=colors[2];c.globalAlpha=.13;c.lineWidth=.07;
      for(let row=0;row<7;row++)for(let col=0;col<7;col++)Workshop.motif(c,id-4,15+col*88+(row%2)*22,18+row*86,26);
      c.restore();return;
    }
    for(let i=0;i<42;i++){
      const y=i*14;c.beginPath();c.strokeStyle=i%3===0?"#fff6c955":"#4e5b4d25";
      if(id===2){c.ellipse((i*89)%570,y,35+i%7*16,5+i%5,0,.1,Math.PI*1.84);}
      else if(id===3){const x=(i*47)%540;c.moveTo(x,0);c.lineTo(x+65,270);c.lineTo(x,540);}
      else{c.moveTo(0,y);c.bezierCurveTo(110,y+8+(i%3)*5,290,y-11,550,y+4);}
      c.stroke();
    }
    c.restore();
  }
  function stone(c,x,y,r,white,id){
    const tone=stones[id][5],start=white?3:0;
    c.save();c.fillStyle="#533e2755";c.beginPath();c.ellipse(x+1,y+2,r*1.03,r,0,0,Math.PI*2);c.fill();
    const g=c.createRadialGradient(x-r*.34,y-r*.43,r*.06,x+r*.2,y+r*.27,r*1.2);
    g.addColorStop(0,tone[start]);g.addColorStop(.73,tone[start+1]);g.addColorStop(1,tone[start+2]);c.fillStyle=g;
    c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.strokeStyle=white?"#70695e":"#101614";c.lineWidth=Math.max(1,r*.07);c.stroke();c.clip();
    c.strokeStyle=white?"#a08c6e60":"#c9d3db66";c.lineWidth=r*.075;
    if(reachReady&&id===shellStones){shellPlates(c,x,y,r,white);c.restore();return;}
    if(id>=4){c.strokeStyle=white?"#7c827b89":"#ced4c68c";c.lineWidth=.093;Workshop.motif(c,id-4,x-r*.05,y+r*.07,r*.61);}
    if(id===1){c.beginPath();if(white)c.arc(x,y-r*.05,r*.72,.3,1.63);else{c.moveTo(x-r*.68,y-r*.12);c.lineTo(x-r*.18,y-r*.7);c.lineTo(x+r*.31,y-r*.47);}c.stroke();}
    if(id===2){for(let j=0;j<3;j++){c.beginPath();c.ellipse(x-r*.3,y+r*(.34+j*.19),r,r*.21,-.35,3.4,5.9);c.stroke();}}
    if(id===3){c.strokeStyle=white?"#6aa89c77":"#aaa2fa77";for(let j=0;j<2;j++){c.beginPath();c.moveTo(x-r*.78,y+r*(.1+j*.2));c.bezierCurveTo(x-r*.15,y-r,x+r*.1,y+r*.7,x+r*.83,y-r*.14);c.stroke();}}
    c.restore();
  }
  function preview(canvas,board,stoneSet){
    const c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;surface(c,w,h,board);
    c.lineWidth=1.6;c.strokeStyle=boards[board][5][2];
    for(let i=0;i<3;i++){const x=w*(i+.5)/3;c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let i=0;i<2;i++){const y=h*(i+.5)/2;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    stone(c,w*.5,h*.72,h*.21,false,stoneSet);stone(c,w*5/6,h*.26,h*.21,true,stoneSet);
  }
  return {boards,stones,owns,surface,stone,preview};
})();
