"use strict";
// Optional reading aid for the scored duel. A marked liberty must really capture on this board, including ko.
const DuelReading=(()=>{
  const L=(ja,ko)=>localizedPair([ja,ko]);
  function captures(position){
    const board=position.board,adj=MatchRules.near(position.n),seen=new Set(),choices=new Map();
    for(let p=0;p<board.length;p++){
      if(board[p]!==2||seen.has(p))continue;
      const stones=new Set([p]),liberties=new Set();
      for(const stone of stones){
        seen.add(stone);
        for(const q of adj[stone]){
          if(board[q]===2)stones.add(q);
          else if(!board[q])liberties.add(q);
        }
      }
      if(liberties.size!==1)continue;
      const [q]=liberties,next=MatchRules.move(position,q);
      if(next&&next.board[p]===0)choices.set(q,[...(choices.get(q)||[]),...stones]);
    }
    return choices;
  }
  function passLabel(position){
    return position.passes===1?L("パスして終局","패스하고 계가"):L("一手休む（パス）","한 수 쉬기 (패스)");
  }
  function mount(host,grid){
    const box=document.createElement("section");box.className="duel-reading";box.hidden=true;
    const heading=document.createElement("strong"),lesson=document.createElement("button"),line=document.createElement("p");
    heading.tabIndex=-1;lesson.className="control";lesson.type="button";line.setAttribute("aria-live","polite");
    box.append(heading,lesson,line);host.after(box);
    let current=null,active=false,choices=null,taken=0;
    function reset(){
      active=false;choices=null;current=null;taken=0;box.hidden=true;
      for(const b of grid.querySelectorAll("[data-duel-mark]"))delete b.dataset.duelMark;
    }
    function paint(){
      const {position,result,komi,mid}=current,black=position.side===1;
      const title=mid?L("中ボス戦","중간보스전"):L("守り手との決戦","수문장 결전");
      const win=result&&result.margin>0;
      box.dataset.outcome=result?(win?"win":"loss"):"playing";
      heading.textContent=result?title+(win?L(" 勝利"," 승리"):L(" 敗北"," 패배")):title+L("　あなたは黒"," · 내가 흑");
      lesson.textContent=active?L("印を消す","표시 끄기"):L("アタリを読む","단수 읽기");
      lesson.setAttribute("aria-pressed",String(active));lesson.hidden=!!result||!black;
      for(const b of grid.querySelectorAll("[data-duel-mark]"))delete b.dataset.duelMark;
      if(result){
        line.textContent=L("黒 ","흑 ")+result.black+L(" 対 白 "," 대 백 ")+(result.white+komi)+L("（コミ "," (덤 ")+komi+L("込み）。"," 포함). ")+
          (win?L("黒が","흑이 "):L("白が","백이 "))+Math.abs(result.margin)+L("目上回った。","집 앞섰어요.");
      }else if(active&&black){
        choices??=captures(position);
        for(const [q,stones] of choices){
          grid.children[q].dataset.duelMark="liberty";
          for(const p of stones)grid.children[p].dataset.duelMark="group";
        }
        line.textContent=choices.size?L("印の白は呼吸点が一つ。輪の空点を黒で塞ぐと取れる。","표시한 백 무리의 활로는 하나예요. 고리가 있는 빈 점을 흑으로 막으면 따냅니다."):
          L("今は一手で取れる白がない。自分の石をつなぐか、境界を詰めよう。","지금 한 수에 잡을 백은 없어요. 내 돌을 잇거나 집의 경계를 좁혀 보세요.");
      }else if(black&&position.passes===1){
        const preview=MatchRules.score(position,komi).margin;
        line.textContent=L("白がパス。今パスすると","백이 패스했어요. 지금 패스하면 ")+(preview>0?L("黒の勝ち","흑 승리"):L("白の勝ち","백 승리"))+
          L("。続けるなら空点に打とう。",". 계속 두려면 빈 점을 누르세요.");
      }else if(taken){
        line.textContent=L("アタリから白","단수에 몰린 백 ")+taken+L("子を取り上げた。開いた境界に気を配ろう。","점을 따냈어요. 이제 열린 경계를 지키세요.");
      }else line.textContent=L("黒石と囲んだ空点の合計で白を上回ろう。双方が続けてパスすると勝敗が決まる。","흑돌과 둘러싼 빈 점을 합쳐 백을 앞서세요. 양쪽이 연달아 패스하면 승패를 가립니다.");
    }
    function show(position,result,komi,mid){
      if(current?.position!==position){choices=null;active=false;}
      current={position,result,komi,mid};box.hidden=false;paint();
    }
    lesson.onclick=()=>{if(!current)return;active=!active;paint();};
    return {show,reset,afterBlack(count){taken=count;}};
  }
  return {mount,passLabel};
})();
