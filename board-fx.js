"use strict";
const BoardFX=(()=>{
  const styles=[
    {name:["波紋","물결 파문"],condition:["最初から","처음부터"],colors:["#dcad64","#fff1ce"]},
    {name:["若葉の風","새잎 바람"],condition:["ルルを救出する","루루 구출"],colors:["#69935a","#e6f4a4"]},
    {name:["星の軌跡","별의 궤적"],condition:["二手読みの挑戦を達成","두 수 읽기 도전 완료"],colors:["#837cc6","#f8e5a6"]},
    {name:["鐘の封印陣","새벽종 봉인진"],condition:["水車砦の守り手に勝つ","물레 요새 수문장에게 승리"],colors:["#47a6b0","#f5d389"]}
  ];
  const active=new WeakMap();
  const owns=(id,progress,badges)=>id===0||id===1&&progress>=1||id===2&&!!(badges&1)||id===3&&progress>=10;
  function clear(canvas){const f=active.get(canvas);if(f)cancelAnimationFrame(f);canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);active.delete(canvas);}
  function flourish(c,x,y,u,id,f,capture,color){
    const [ink,light]=styles[id].colors,r=u*(capture?.32:.22)+u*f*(capture?1.12:.60);
    c.save();c.translate(x,y);c.globalAlpha=1-f;c.strokeStyle=ink;c.lineWidth=Math.max(1,u*.065);
    c.beginPath();c.ellipse(0,0,r,r*(id===0?.76:1),0,0,2*Math.PI);c.stroke();
    if(capture&&f<.72){
      // Show the captured stones dissolving only after the rules have removed them.
      c.globalAlpha=(.72-f)*.9;c.fillStyle=color===1?"#f4eedf":"#293938";
      c.beginPath();c.arc(0,-u*f*.23,Math.max(.1,u*.40*(1-f)),0,Math.PI*2);c.fill();c.globalAlpha=1-f;
    }
    for(let i=0;i<(capture?9:5);i++){
      const a=i*2.399+f*(id===3?3:.65),px=Math.cos(a)*r,py=Math.sin(a)*r*(id===0?.68:.92)-u*f*.14;
      c.save();c.translate(px,py);c.rotate(a+f);c.fillStyle=i%2?ink:light;
      if(id===1){c.beginPath();c.ellipse(0,0,u*.13,u*.05,.45,0,Math.PI*2);c.fill();}
      else if(id===2){c.fillRect(-u*.11,-u*.027,u*.22,u*.054);c.fillRect(-u*.027,-u*.11,u*.054,u*.22);}
      else if(id===3){c.strokeStyle=light;c.strokeRect(-u*.055,-u*.055,u*.11,u*.11);}
      else c.fillRect(-u*.035,-u*.035,u*.07,u*.07);
      c.restore();
    }
    if(id===3&&capture){
      // Two contrasting strokes keep the seal readable on light wood and green boards.
      c.globalAlpha=Math.min(1,(1-f)*1.7);c.beginPath();
      for(let i=0;i<7;i++){const a=i*Math.PI/3+f;c[i?"lineTo":"moveTo"](Math.cos(a)*r*.82,Math.sin(a)*r*.82);}
      c.strokeStyle="#345865";c.lineWidth=u*.095;c.stroke();
      c.strokeStyle="#fff2a9";c.lineWidth=u*.045;c.stroke();
      c.strokeStyle="#d0ffef";c.lineWidth=u*.055;
      for(let i=0;i<3;i++){const a=i*Math.PI*2/3-f*1.5;c.beginPath();c.arc(0,0,r*1.02,a,a+1.15);c.stroke();}
      const lift=u*f*.72;c.fillStyle="#fff3bd";
      c.beginPath();c.moveTo(0,-lift-u*.18);c.lineTo(u*.06,-lift);c.lineTo(0,-lift+u*.12);c.lineTo(-u*.06,-lift);c.closePath();c.fill();
    }
    c.restore();
  }
  function playOn(canvas,n,p,taken,color,id,margin=false){
    if(p<0)return;clear(canvas);
    const u=canvas.width/(margin?n+1:n),off=margin?1:.5,ctx=canvas.getContext("2d"),start=performance.now();
    const items=[...taken.map(q=>[q,true]),[p,false]];
    function draw(time){
      const f=Math.min(1,(time-start)/(reduceMotion?180:taken.length?680:410));
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const [q,capture] of items)flourish(ctx,(q%n+off)*u,(Math.floor(q/n)+off)*u,u,id,reduceMotion?.18:f,capture,color);
      if(f<1)active.set(canvas,requestAnimationFrame(draw));else clear(canvas);
    }
    draw(start);
  }
  function cutIn(c,w,h,age,side,kind,foe,title){
    if(reduceMotion||age<.06||age>.74)return;
    const f=(age-.06)/.68,show=Math.min(1,f*5,(1-f)*5),top=h*.30,bottom=h*.79;
    c.save();c.globalAlpha=.92*show;c.beginPath();c.moveTo(0,top+h*.09);c.lineTo(w,top-h*.09);c.lineTo(w,bottom-h*.09);c.lineTo(0,bottom+h*.09);c.closePath();c.clip();
    const effect=side===1&&kind==="capture"?saved.fx:0;
    c.fillStyle=side===2?"#593e47":["#263e43","#29483b","#393551","#24464c"][effect];c.fillRect(0,0,w,h);
    for(let i=0;i<16;i++){const x=(i*w*.097+f*w*(side===1?1:-1)+w*2)%w;c.strokeStyle=i%2?"#d7bf8a":"#96c2b0";c.lineWidth=i%3+1;c.beginPath();c.moveTo(x,top+(i%7)*h*.06);c.lineTo(x+w*.16,top+(i%7)*h*.06-h*.05);c.stroke();}
    if(side===1)ExpeditionCast.party(c,0,w*(.30+f*.08),h*1.23,h*1.12,0,0,2);
    else if((!trial||trial.fortress)&&level%10===9)ExpeditionCast.guardian(c,Math.floor(level/10),w*.72,h*1.08,h*1.08,0,1,2);
    else ExpeditionCast.foe(c,foe,w*.72,h*1.06,h,0,1,2);
    c.font='700 '+Math.round(h*.13)+'px "Dawn Serif '+(saved.locale==="ko"?"KR":"JP")+'", serif';c.textAlign="center";c.strokeStyle="#1b302b";c.lineWidth=5;c.fillStyle="#ffebaf";
    const bossSkill=Fortress.isHere();
    const label=title||(side===2?t("whiteCounter"):effect&&!bossSkill?localizedPair(styles[effect].name):t(["link","atari","capture"].includes(kind)?"art"+kind:kind));
    c.strokeText(label,w*(side===1?.71:.27),h*.63);c.fillText(label,w*(side===1?.71:.27),h*.63);c.restore();
  }
  return {styles,owns,clear,playOn,flourish,cutIn};
})();
