"use strict";
const LastDelivery=(()=>{
  const by=id=>document.getElementById(id),tr=(ja,ko)=>localizedPair([ja,ko]);
  let dialog,page=0,proposed=0,revision=0;
  const script=[
    [["ダム","담"],["向こうが返事をしなかったら？","저쪽에서 대답 안 하면?"]],
    [["ソルビ","솔비"],["待つよ。両方の岸が、自分たちで合図するまで。","기다려요. 두 강가가 자기 손으로 신호를 올릴 때까지."]],
    [["ルル","루루"],["まだ届いてないのに、先に配達印を押すのはやめようよ。","배달 안 됐는데 도장부터 찍진 말자고요."]]
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
