"use strict";
const Workshop=(()=>{
  const materials=[["森の木片","숲 나뭇결"],["川の真珠","나루 진주"],["炉の鉱石","화로 광석"],["雪の結晶","서리 결정"],["読みの星","수읽기 별"]];
  // Stored totals only grow. Costs are derived from unique crafted items, so a backup cannot refund the same recipe.
  const blank=()=>({earned:[0,0,0,0,0],made:[0,0],crew:[],mascot:true});
  function packed(w){
    const bytes=new Uint8Array(16),v=new DataView(bytes.buffer);
    w.earned.forEach((n,i)=>v.setUint16(i*2,n));w.made.forEach((n,i)=>v.setUint16(10+i*2,n));bytes[14]=(w.crew[0]||0)|((w.crew[1]||0)<<2);bytes[15]=w.mascot?1:0;
    return btoa(String.fromCharCode(...bytes));
  }
  function read(raw){
    const w=blank();if(typeof raw!=="string"||!/^[A-Za-z0-9+/]{22}==$/.test(raw))return w;
    const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0)),v=new DataView(bytes.buffer);
    w.earned=w.earned.map((_,i)=>v.getUint16(i*2));w.made=w.made.map((_,i)=>v.getUint16(10+i*2));w.crew=[bytes[14]&3,(bytes[14]>>2)&3].filter((id,i,a)=>id&&a.indexOf(id)===i);w.mascot=!!bytes[15];return w;
  }
  function merge(local,raw){if(typeof raw!=="string"||!/^[A-Za-z0-9+/]{22}==$/.test(raw))return;const r=read(raw);local.earned=local.earned.map((n,i)=>Math.max(n,r.earned[i]));local.made=local.made.map((n,i)=>n|r.made[i]);local.crew=r.crew;local.mascot=r.mascot;}
  const boardNames=[
    ["杉の年輪","삼나무 나이테"],["編み竹","대나무 엮음"],["銀杏の葉脈","은행잎 맥"],["郵便の寄木","우편숲 쪽매"],
    ["潮の扇","밀물 부채"],["帆布の綾","돛천 능직"],["蓮の水庭","연꽃 물정원"],["青砂の砂紋","푸른 모래 물결"],
    ["玄武岩の層","현무암 지층"],["銅の継ぎ目","구리 상감"],["琥珀の窓","호박색 창"],["炉端の煉瓦","화롯가 벽돌"],
    ["霜の針葉","서리 솔잎"],["天球図","별자리 지도"],["薄氷の花","살얼음 꽃"],["鐘楼の格天井","종루 격자천장"]];
  const stoneNames=[
    ["種と白樺","씨앗과 자작"],["松脂と乳白","송진과 유백"],["木の葉と綿","잎맥과 목화"],["角笛と骨笛","뿔피리와 뼈피리"],
    ["渦潮と真珠","소용돌이와 진주"],["帆影と貝","돛그늘과 조개"],["夜蓮と朝蓮","밤연꽃과 아침연꽃"],["藍玉と砂玉","쪽빛과 모래알"],
    ["黒曜と霞石","화산유리와 안개석"],["鉄と白銀","흑철과 백은"],["熔岩と雪花石","용암과 설화석"],["墨陶と白磁","먹도기와 백자"],
    ["夜松と霜松","밤솔과 서리솔"],["新月と満月","그믐과 보름"],["夜雪と朝雪","밤눈과 새벽눈"],["影鐘と光鐘","그늘종과 빛종"]];
  const tints=[
    ["#e5ca99","#be9f71","#5e4935"],["#e4dcb2","#bdb68a","#4c5140"],["#e4d69d","#bdc68d","#4b5031"],["#e8c8a1","#cb9e78","#61482f"],
    ["#c9ded3","#97b9ad","#344f4c"],["#dbd7c0","#b6b69b","#515447"],["#d2d9b1","#a9c6aa","#3e5549"],["#d1e1de","#a8c0bc","#40565a"],
    ["#d8ceba","#b5ad9e","#4c4848"],["#e6c5a3","#cba77f","#5b4839"],["#eed2a1","#caa976","#5b4a38"],["#e0c4ad","#c19f90","#594645"],
    ["#d4e3d2","#a8c7b8","#40564f"],["#d6dcdf","#b4bcce","#454d63"],["#e0e3d3","#b9cfd1","#445662"],["#e7d5ba","#bcc2ae","#4f5042"]];
  function recipe(type,index){const region=Math.floor(index/4),quality=index%4,req=Array(5).fill(0);req[region]=(type?2:3)+quality;if(region&&quality%2)req[region-1]=2;if(quality>=2)req[4]=quality-1;return {type,index,req};}
  const recipes=[0,1].map(type=>Array.from({length:16},(_,i)=>recipe(type,i)));
  function additions(type){return (type?stoneNames:boardNames).map((name,i)=>{
    const hue=tints[i];const black=["#3f564d","#514840","#384c58","#4b4054"][i%4],white=["#fff7de","#f1f4e6","#eef5f7","#f6eaf1"][i%4];
    return ["craft"+type+"-"+i,0,0,name,["工房で制作","공방 제작"],type?[black,"#202a2b","#131a1b","#ffffff",white,"#d9d6c9"]:hue,recipes[type][i]];
  });}
  const owns=(w,r)=>!!(w.made[r.type]&(1<<r.index));
  function balance(w){
    const left=w.earned.slice();for(const r of recipes.flat())if(owns(w,r))r.req.forEach((n,i)=>left[i]-=n);
    return left.map(n=>Math.max(0,n));
  }
  const canMake=(w,r)=>!owns(w,r)&&balance(w).every((n,i)=>n>=r.req[i]);
  function make(w,r){if(!canMake(w,r))return false;w.made[r.type]|=1<<r.index;return true;}
  function earn(w,id,n){w.earned[id]=Math.min(65535,w.earned[id]+n);}
  function reward(w,stage){const region=Math.floor(stage/20),n=stage%10===9?4:stage%5===4?2:1;earn(w,region,n);return [region,n];}
  function motif(c,style,x,y,u){
    c.save();c.translate(x,y);c.scale(u,u);c.beginPath();
    switch(style){
      case 0:for(const r of [.4,.72,1]){c.moveTo(r,0);c.ellipse(0,0,r,r*.62,.16,0,Math.PI*2);}break;
      case 1:for(let j=-1;j<=1;j+=.5){c.moveTo(-1,j);c.lineTo(1,j+.45);c.moveTo(j,-1);c.lineTo(j-.45,1);}break;
      case 2:c.moveTo(-.9,.8);c.lineTo(.9,-.8);for(let j=-.5;j<.6;j+=.5){c.moveTo(j,-j);c.lineTo(j-.6,-j-.2);c.moveTo(j,-j);c.lineTo(j+.18,-j+.52);}break;
      case 3:for(const r of [.42,.84])c.rect(-r,-r*.7,r*2,r*1.4);break;
      case 4:for(let i=0;i<4;i++){c.moveTo(-1,-.6+i*.35);c.quadraticCurveTo(0,-1+i*.4,1,-.45+i*.32);}break;
      case 5:c.moveTo(-.9,.65);c.lineTo(.32,-.95);c.lineTo(.19,.65);c.closePath();c.moveTo(.49,-.3);c.lineTo(1,.65);c.lineTo(.48,.65);break;
      case 6:for(const a of [-.72,0,.72]){c.moveTo(0,.6);c.bezierCurveTo(a-1,-.1,a,-1.1,a+.15,-.7);c.quadraticCurveTo(a+.7,0,0,.6);}break;
      case 7:for(let j=0;j<3;j++){c.moveTo(-1,j*.38-.5);c.bezierCurveTo(-.4,-1+j*.38,.4,.35+j*.38,1,-.3+j*.38);}break;
      case 8:for(let j=-1;j<=1;j+=.55){c.moveTo(-1,j);c.lineTo(-.15,j+.23);c.lineTo(.6,j-.12);c.lineTo(1,j);}break;
      case 9:c.moveTo(-1,-.45);c.lineTo(-.2,-.45);c.lineTo(-.2,.44);c.lineTo(.72,.44);c.rect(.72,.31,.25,.26);break;
      case 10:for(const r of [.5,1]){c.moveTo(-r,0);c.lineTo(0,-r*.7);c.lineTo(r,0);c.lineTo(0,r*.7);c.closePath();}break;
      case 11:c.rect(-1,-.7,1.4,.68);c.rect(-.32,0,1.32,.68);break;
      case 12:for(const a of [-.7,0,.7]){c.moveTo(0,.8);c.lineTo(a,-.8);c.moveTo(a*.5,0);c.lineTo(a*.5-.28,-.36);}break;
      case 13:c.moveTo(-.85,.37);c.lineTo(-.35,-.55);c.lineTo(.3,-.12);c.lineTo(.9,-.85);for(const [a,b] of [[-.85,.37],[-.35,-.55],[.3,-.12],[.9,-.85]])c.rect(a-.08,b-.08,.16,.16);break;
      case 14:for(let j=0;j<6;j++){const a=j*Math.PI/3;c.moveTo(0,0);c.lineTo(Math.cos(a),Math.sin(a));c.moveTo(Math.cos(a)*.67,Math.sin(a)*.67);c.lineTo(Math.cos(a+.4)*.86,Math.sin(a+.4)*.86);}break;
      case 15:c.moveTo(-.7,.36);c.lineTo(-.47,-.57);c.quadraticCurveTo(0,-1,.47,-.57);c.lineTo(.7,.36);c.closePath();c.moveTo(-.28,.55);c.quadraticCurveTo(0,1,.28,.55);break;
    }
    c.stroke();c.restore();
  }
  return {materials,blank,packed,read,merge,recipes,additions,owns,balance,canMake,make,earn,reward,motif};
})();
