"use strict";
const LastDelivery=(()=>{
  const by=id=>document.getElementById(id),tr=(ja,ko)=>localizedPair([ja,ko]);
  let dialog,page=0,proposed=0,revision=0;
  const script=[
    [["ダム","담"],["返事が来なかったら？　前は待てなくて戸を開けた。あれで一階まで水が入った。","대답이 안 오면? 전엔 못 기다리고 문을 열었어. 그 바람에 집 안까지 물이 찼지."]],
    [["ソルビ","솔비"],["旗が一本でも下りてたら、戸には触らないで。向こうの合図は、私たちで代わりに出せないよ。","깃발 하나라도 내려가 있으면 문에 손대지 마요. 저 사람들 신호를 우리가 대신 올릴 수는 없잖아요."]],
    [["ルル","루루"],["あの手紙、まだ持ってる。うちの舟が来たふりをした印。今度は、向こうの人が受け取ってから押そうよ。","그 편지 아직 갖고 있어요. 우리 배가 도착한 척하던 도장 찍힌 거요. 이번에는 건너편에서 받고 나면 찍어요."]]
  ];
  function scene(){
    if(!dialog?.open)return;
    const canvas=by("letterScene");
    canvas.dataset.storyArt="last-delivery";
    OathPictures.ending(canvas,OuterCampaign.route(saved),page,FinalPost.choice());
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
  function shut(){revision++;if(dialog?.open)dialog.close();OuterMap.refresh();}
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
    document.body.append(dialog);new ResizeObserver(()=>{if(dialog.open)scene();}).observe(by("letterScene"));
    MapJourney.input(dialog,()=>{if(dialog.dataset.page==="line")next();});
    by("leaveBell").onclick=()=>{proposed=1;draw();};by("lowerBell").onclick=()=>{proposed=2;draw();};
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
