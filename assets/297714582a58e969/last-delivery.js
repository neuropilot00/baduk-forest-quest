"use strict";
const LastDelivery=(()=>{
  const by=id=>document.getElementById(id),tr=(ja,ko)=>localizedPair([ja,ko]);
  let dialog,page=0,proposed=0,revision=0,frame=0;
  const script=[
    [["ダム","담"],["向こうが返事をしなかったら？","저쪽에서 대답 안 하면?"]],
    [["ソルビ","솔비"],["待つよ。両方の岸が、自分たちで合図するまで。","기다려요. 두 강가가 자기 손으로 신호를 올릴 때까지."]],
    [["ルル","루루"],["まだ届いてないのに、先に配達印を押すのはやめようよ。","배달 안 됐는데 도장부터 찍진 말자고요."]]
  ];
  function flag(c,x,ground,high,west){
    const top=ground-32+(high?0:16),dir=west?1:-1;
    c.fillStyle="#302c30";c.fillRect(x-1,ground-35,3,35);c.fillStyle="#d8aa71";c.fillRect(x,ground-35,1,33);
    c.fillStyle=west?"#e1bc78":"#a7d2c6";c.fillRect(x+(dir<0?-14:1),top+1,14,5);c.fillRect(x+(dir<0?-10:1),top+6,10,3);
    c.fillStyle=west?"#9b594d":"#507b85";c.fillRect(x+(dir<0?-15:1),top,15,2);
    c.fillStyle="#f9df9b";c.fillRect(x-1,ground-37,3,2);
  }
  function drawSignal(c,base,bell){
    const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,base+y,w,h);};
    if(bell===1){
      // A bronze bell hangs over the empty channel, between the two people's flags.
      for(const x of [149,202]){rect(x,-66,5,59,"#342e2b");rect(x+1,-63,2,53,"#ae815a");rect(x-2,-9,9,4,"#775b43");}
      rect(145,-70,66,6,"#3a3430");rect(147,-70,62,2,"#cc9b68");
      rect(176,-64,4,8,"#d4aa69");rect(172,-57,12,4,"#e6c888");
      rect(169,-53,18,7,"#a78856");rect(167,-46,22,9,"#a58654");rect(165,-37,26,4,"#574735");
      rect(166,-37,24,2,"#f4d28c");rect(171,-51,2,10,"#ebcc8f");rect(181,-53,4,15,"#80683f");
      rect(176,-32,4,5,"#e4bd77");
    }else{
      // Each bank now signals from its own door knocker; their bronze hoops have different sizes.
      for(const [x,width] of [[12,23],[319,27]]){
        rect(x-2,-39,width+5,4,"#b48c66");rect(x,-35,width,32,"#593f34");rect(x+2,-32,width-4,26,"#815d42");
        for(let p=5;p<width-2;p+=5)rect(x+p,-31,1,25,"#614734");
        const center=x+Math.floor(width/2),r=width===23?3:4;
        rect(center-1,-26,3,4,"#e4c184");rect(center-r,-23,2,7,"#e1b570");rect(center+r,-23,2,7,"#a28661");
        rect(center-r+1,-17,r*2,2,"#efcc82");rect(x-2,-3,width+4,3,"#bea480");
      }
    }
  }
  function scene(now=performance.now()){
    if(!dialog?.open)return;cancelAnimationFrame(frame);
    const ca=by("letterScene"),c=ca.getContext("2d"),w=ca.width,h=ca.height;
    c.imageSmoothingEnabled=false;c.drawImage(OuterMapArt.battle(319,20),0,0,w,h);
    const shade=c.createLinearGradient(0,0,0,h);
    shade.addColorStop(0,"#172f4340");shade.addColorStop(.65,"#0c1a2820");shade.addColorStop(1,"#162630cc");c.fillStyle=shade;c.fillRect(0,0,w,h);
    const west=OuterCampaign.route(saved)===1,base=h-21;
    flag(c,57,base-7,page>0||FinalPost.choice(),true);flag(c,w-59,base-9,page>=3||FinalPost.choice(),false);
    if(page>=4&&FinalPost.choice())drawSignal(c,base,FinalPost.choice());
    WorldScale.hero(c,west?111:235,base,61,page===1?1:0);
    WorldScale.draw(c,0,west?77:265,base,61,0,0);
    if(page>=3){
      const at=(now%1600)/1600,pulse=reduceMotion?.55:Math.sin(at*Math.PI);
      c.fillStyle="rgba(254,203,114,"+(.35+.5*pulse)+")";c.fillRect(51,base-40,3,3);c.fillRect(w-57,base-42,3,3);
      if(!reduceMotion)frame=requestAnimationFrame(scene);
    }
  }
  function draw(){
    const choice=FinalPost.choice(),isDecision=page===3&&!choice,isConfirm=isDecision&&proposed>0,isEnd=page>=4||!!choice;
    by("letterNumber").textContent=tr("無音閘門 · 最後の配達","무음갑문 · 마지막 배달");
    by("letterTitle").textContent=isEnd?(choice===1?tr("一つの鐘、二つの返事","한 번의 종, 두 강가의 응답"):tr("二つの戸口の朝","두 문고리의 새벽")):tr("対岸からの返事","건너편의 대답");
    by("letterVoice").textContent=isEnd?tr("帰り便","돌아오는 우편선"):isDecision?tr("ソルビ","솔비"):localizedPair(script[page][0]);
    let line;
    if(isEnd)line=localizedPair(OuterStory.ending(319,OuterCampaign.route(saved)).after)+" "+(choice===1?tr("両岸の旗が揚がってから、鐘が一度だけ鳴った。","두 기슭의 깃발이 모두 오른 뒤 종이 한 번 울렸다."):tr("鐘を下ろした朝、違う戸口から、二つの音が帰ってきた。","종을 내린 새벽, 서로 다른 두 문에서 문고리 소리가 돌아왔다."));
    else if(isDecision)line=isConfirm?tr("この旅では決め直せない。もう一方の合図を手放す。","이 원정에서는 다시 정할 수 없습니다. 다른 신호 방식은 이 회차에서 닫힙니다."):tr("両方の旗が見える。次の便には、どの合図を残そう？","두 깃발이 다 보여. 다음 배에는 어떤 신호를 남길까?");
    else line=localizedPair(script[page][1]);
    by("letterLine").textContent=line;
    by("letterChoice").hidden=!isDecision||isConfirm;
    by("leaveBell").textContent=tr("鐘を残す","종을 남긴다");by("lowerBell").textContent=tr("鐘を下ろす","종을 내린다");
    by("letterReturn").hidden=isEnd;
    by("letterReturn").textContent=isConfirm?tr("選び直す","결정 전으로"):tr("閉じる","닫기");
    by("letterNext").hidden=isDecision&&!isConfirm;
    by("letterNext").textContent=isEnd?tr("地図へ","지도로"):isConfirm?(proposed===1?tr("鐘を残すと決める","종 남기기 확정"):tr("鐘を下ろすと決める","종 내리기 확정")):tr("つづき","계속");
    dialog.dataset.page=isEnd?"ending":isConfirm?"confirm":isDecision?"choice":"line";dialog.dataset.bell=choice;scene();
  }
  function close(){if(history.state?.lastDelivery)history.back();else shut();}
  function shut(){cancelAnimationFrame(frame);revision++;if(dialog?.open)dialog.close();OuterMap.refresh();}
  async function next(){
    if(FinalPost.choice()){close();return;}
    if(page===3){
      if(!proposed)return;const token=revision;by("letterNext").disabled=true;
      try{if(!await FinalPost.choose(proposed)||token!==revision)return;
        page=4;if(proposed===1)sound("bell");else{sound("doorWest");setTimeout(()=>{if(dialog.open&&revision===token)sound("doorEast");},460);}
      }finally{by("letterNext").disabled=false;}
    }else page++;
    draw();
  }
  function install(){
    if(dialog)return;dialog=document.createElement("dialog");dialog.id="lastDeliveryDialog";dialog.setAttribute("aria-labelledby","letterTitle");
    dialog.innerHTML='<article><div class="letter-scene"><canvas id="letterScene" width="360" height="185" aria-hidden="true"></canvas></div><section><small id="letterNumber"></small><h2 id="letterTitle"></h2><b id="letterVoice"></b><p id="letterLine" aria-live="polite"></p><div id="letterChoice"><button id="leaveBell" type="button"></button><button id="lowerBell" type="button"></button></div><footer><button id="letterReturn" type="button"></button><button id="letterNext" type="button"></button></footer></section></article>';
    document.body.append(dialog);by("leaveBell").onclick=()=>{proposed=1;draw();};by("lowerBell").onclick=()=>{proposed=2;draw();};
    by("letterReturn").onclick=()=>{if(page===3&&proposed&&!FinalPost.choice()){proposed=0;draw();}else close();};by("letterNext").onclick=next;
    dialog.addEventListener("cancel",e=>{e.preventDefault();close();});
    addEventListener("popstate",e=>{if(dialog.open&&!e.state?.lastDelivery)shut();else if(!dialog.open&&e.state?.lastDelivery)open();});
  }
  function open(){
    if(!FinalPost.ready())return false;install();if(dialog.open)return true;
    if(!history.state?.lastDelivery)history.pushState({...history.state,lastDelivery:true},"");
    revision++;proposed=0;page=FinalPost.choice()?4:0;dialog.showModal();draw();return true;
  }
  return {open};
})();
