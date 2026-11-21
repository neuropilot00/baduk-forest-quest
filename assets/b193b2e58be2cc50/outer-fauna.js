"use strict";
const OuterFauna=(()=>{
  // Authored elements, tell length, contact end, size compared with the reference warden.
  const actors=[
    [["岩蓋ナキウサギ","너덜우는쥐"],.31,.62,.50], [["風膜トカゲ","바람막도마뱀"],.43,.73,.55], [["風見オサムシ","풍향딱정벌레"],.36,.63,.46],
    [["分銅角のアイベックス","추뿔 아이벡스"],.46,.73,.93], [["子午線のヒゲワシ","자오선 수염수리"],.38,.77,1.12],
    [["硝子マイマイ","유리고둥"],.44,.74,.47], [["炭掘りモグラ","숯삽두더지"],.32,.61,.55], [["黒刃カマキリ","흑요날사마귀"],.24,.55,.65],
    [["鞴背の犰狳","풀무등 아르마딜로"],.48,.76,.89], [["黒曜の火冠鳥","흑요석 불관새"],.37,.74,1.05],
    [["星棘ウニ","별가시성게"],.29,.63,.46], [["海図タツノオトシゴ","해도해마"],.41,.74,.58], [["潮灯イカ","조수발광오징어"],.35,.66,.62],
    [["潮盤のカシパン","조석판 모래달러"],.47,.75,.84], [["月蝕のオウム貝","월식 앵무조개"],.44,.79,1.02],
    [["双針の風見オサムシ","두바늘 풍향딱정벌레"],.50,.68,.62], [["両鎌の黒刃カマキリ","쌍날 흑요날사마귀"],.46,.65,.77],
    [["双腕の潮灯イカ","두팔 조수발광오징어"],.43,.76,.74]
  ];
  const routes=[
    [0,1,2,0,1,2,15,1,0,3,1,0,2,1,2,0,1,2,0,4],
    [5,6,7,6,5,7,16,5,6,8,7,6,5,7,6,5,7,5,6,9],
    [10,11,12,11,12,10,17,12,11,13,12,10,11,12,10,11,10,12,11,14]
  ];
  const native=[90,90,90,90,90,90,90,90,90,90,90,90,69,90,90,90,90,69];
  const art=new Image(),ready=new Promise((ok,no)=>{art.onload=ok;art.onerror=()=>no(new Error("Outer creature atlas unavailable"));});
  art.src="./outer-foes.webp";
  function resident(id){
    if(id>=160&&typeof FurtherFauna!=="undefined"){
      const form=FurtherFauna.formIndex(id);return form<0?-1:actors.length+form;
    }
    if(!Number.isInteger(id)||id<100||id>=160)return -1;
    return routes[Math.floor((id-100)/20)][(id-100)%20];
  }
  function name(id){
    if(id>=160&&typeof FurtherFauna!=="undefined")return FurtherFauna.name(id);
    return actors[resident(id)]?.[0]||null;
  }
  function choose(pose,t,wind,finish,still){
    if(still)return pose==="strike"?3:pose==="hit"?4:pose==="break"?8:0;
    if(pose==="idle")return Math.floor(2*t)%2;
    if(pose==="tell")return 2;if(pose==="recover")return 5;
    if(pose==="hit"||pose==="break")return t<.15?6:t<.63?(pose==="break"?8:4):7;
    if(pose==="strike")return t<wind?2:t<finish?3:5;
    return 0;
  }
  function draw(c,id,x,y,height,pose="idle",beat=0){
    if(id>=160&&typeof FurtherFauna!=="undefined")return FurtherFauna.draw(c,id,x,y,height,pose,beat);
    const row=resident(id);if(row<0||!art.naturalWidth||height<=0)return false;
    const [,wind,finish,size]=actors[row],t=Math.max(0,Math.min(1,beat)),still=typeof reduceMotion!=="undefined"&&reduceMotion;
    const phase=choose(pose,t,wind,finish,still),s=height*size/native[row];
    c.save();c.imageSmoothingEnabled=false;c.drawImage(art,phase*204,row*154,204,154,Math.round(x-102*s),Math.round(y-132*s),204*s,154*s);c.restore();
    return true;
  }
  return Object.freeze({draw,ready,name,resident});
})();
