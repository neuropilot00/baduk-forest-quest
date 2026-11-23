"use strict";
// The first encounter teaches with its own real stones. Inspecting a white
// group never counts as a move, a hint purchase, or a change to the Go board.
const FirstLesson=(()=>{
  const button=document.getElementById("lessonTrace");
  let expanded=false;
  const copy=(ja,ko)=>GameLanguage.pair([ja,ko],saved.locale);
  const eligible=()=>journey()&&!trial&&level===0&&fieldRound<3&&["liberty","capture"].includes(mission?.kind);
  function toggle(){
    if(!eligible()||mode!=="playing"||BattleEntrance.blocking)return;
    expanded=!expanded;boardView();
  }
  function inspect(p){
    if(!eligible()||mode!=="playing"||state.board[p]!==white)return false;
    const target=mission.targets[0];
    if(state.board[target]!==white||!group(state.board,target).stones.has(p))return false;
    toggle();return true;
  }
  function update(){
    const playing=eligible()&&mode==="playing";
    button.hidden=!playing;
    if(!eligible())return;
    const objective=document.getElementById("objective");
    if(!playing){
      if(mode==="phase"||mode==="won"){
        const target=mission.targets[0];
        if(state.board[target]===white){
          const before=group(mission.board,target).liberties.size,after=group(state.board,target).liberties.size;
          objective.textContent=copy("白の呼吸点が "+before+" → "+after+"。まだ石は盤上に残る。",
            "백의 활로가 "+before+"곳에서 "+after+"곳으로 줄었어요. 활로가 남아 있어 백돌은 살아 있어요.");
        }else if(state.captured?.length)objective.textContent=copy("最後の呼吸点が埋まり、白石を取った。","마지막 활로를 막아 백돌을 따냈어요.");
      }
      return;
    }
    const p=mission.targets[0];if(state.board[p]!==white)return;
    const chain=group(state.board,p),breaths=chain.liberties.size;
    button.setAttribute("aria-pressed",String(expanded));
    button.textContent=expanded?copy("印を閉じる","표시 닫기"):copy("呼吸点を見る","활로 보기");
    for(const stone of chain.stones){
      const b=pointButtons[stone];b.setAttribute("aria-disabled","false");
      b.setAttribute("aria-label",b.getAttribute("aria-label")+", "+copy("白の呼吸点を調べる","백돌의 활로 살펴보기"));
    }
    if(!expanded){
      const prompts=[
        ["黒は線が交わる空点に打つ。白石のすぐ隣の空点を一つふさごう。","흑돌은 선이 만나는 빈 곳에 둬요. 표시한 백돌 바로 옆의 빈자리 한 곳을 막아 보세요."],
        ["隣り合う白石は呼吸点を共有する。つながった白の呼吸点を一つふさごう。","붙어 있는 백돌은 활로를 함께 써요. 이어진 백돌 무리의 활로 한 곳을 막아 보세요."],
        ["白の一団をたどって、残った呼吸点を自分で探そう。","이번엔 직접 찾아봐요. 이어진 백돌 무리의 마지막 활로는 어디일까요?"]
      ];
      objective.textContent=copy(...prompts[fieldRound]);return;
    }
    for(const liberty of chain.liberties){
      const [x,y]=coordinates(liberty);
      ring("#173e36",center(x),center(y),cell*.26,6);ring("#bdf9cc",center(x),center(y),cell*.26,3);
      const b=pointButtons[liberty];b.classList.add("lesson-air");
      b.setAttribute("aria-label",b.getAttribute("aria-label")+", "+copy("白の呼吸点","백돌의 활로"));
    }
    objective.textContent=copy("白から上下左右につながる空点は "+breaths+" か所。輪の交点に黒を打とう。",
      "백돌에서 선을 따라 상하좌우로 맞닿은 빈자리 "+breaths+"곳이 활로예요. 동그라미에 흑을 두세요.");
  }
  button.addEventListener("click",toggle);
  return {update,inspect,reset(){expanded=false;}};
})();
