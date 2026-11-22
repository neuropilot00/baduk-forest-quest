"use strict";
// Explain board facts from the settled move. The cursor only marks a move the
// player or White has already made. Coaching never contributes to validation.
const FieldCoaching=(()=>{
  const errors=new Map(),receipts=new Map();
  const word=(ja,ko)=>localizedPair([ja,ko]);
  const pref="bfq-post-move-coach";
  let suppressed=false;
  try{suppressed=localStorage.getItem(pref)==="off";}catch{}
  function relayLesson(reply,retaliation){
    const {normal,actual,defaultReply}=reply.relay;
    const from=MatchRules.coordinate(9,defaultReply.point),to=MatchRules.coordinate(9,reply.point);
    const effect=actual.captured<normal.captured?
      word(`黒の損は${normal.captured}子から${actual.captured}子に減ったよ。`,`잃을 흑돌이 ${normal.captured}점에서 ${actual.captured}점으로 줄었어.`):
      word(`印の白の呼吸点は${normal.liberties}から${actual.liberties}に減ったよ。`,`표시한 백의 활로가 ${normal.liberties}개에서 ${actual.liberties}개로 줄었어.`);
    const cost=retaliation?.amount?
      word(` 二人の支援を使い、反撃でHPを${retaliation.amount}失ったよ。`,` 두 동료의 지원 기회를 썼고, 반격으로 HP를 ${retaliation.amount} 잃었어.`):
      word(" 二人の支援を使ったよ。"," 두 동료의 지원 기회를 썼어.");
    return word(`連携で白は${from}から${to}へ。 `,`연계로 백이 ${from} 대신 ${to}에 뒀어. `)+effect+cost;
  }
  function describe({before,after,blackPoint,whiteReply,mission,accepted,retaliation,lure}){
    const target=mission.targets[0];
    const anchor=target??blackPoint;
    const liberties=s=>s.board[anchor]?group(s.board,anchor).liberties.size:0;
    const old=liberties(before),now=liberties(after);
    if(!accepted){
      if(whiteReply?.point>=0){
        const lost=whiteReply.state.captured.length,left=liberties(whiteReply.state);
        if(lost)return word(`白の返しで黒が${lost}子取られたよ。この白と黒の呼吸点を数え直そう。`,`백이 응수해서 흑 ${lost}점을 따냈어. 백이 놓인 자리와 흑의 활로를 다시 세어 봐.`);
        const cut=mission.kind==="link"?play(before,whiteReply.point,1):null;
        if(cut?.board[anchor]===1&&mission.targets.every(q=>group(cut.board,anchor).stones.has(q)))return word("白がこの継ぎ目に入ったよ。先にここを押さえると、二つの黒がつながる形だったね。","백이 이 이음새에 들어왔어. 흑이 여기 먼저 두면 두 무리가 이어질 수 있었어.");
        if(before.board[anchor]===2&&left>now)return word(`白の呼吸点が${now}から${left}に戻ったよ。どっちへ伸びられるか見てごらん。`,`백 활로가 ${now}개에서 ${left}개로 다시 늘었어. 어느 쪽으로 뻗었는지 봐.`);
        return word("白にはここに返す手が残っていたよ。取る前に、この応手を一つ先まで読もう。","백이 여기로 받을 수 있었어. 따내기 전에 이 응수 뒤에 한 수를 더 읽어 봐.");
      }
      return word("この形では黒の目標がまだ残ってるよ。印の石と空いてる交点を見直そう。","이 수로는 목표가 남아 있어. 표시한 돌과 비어 있는 교차점을 다시 보자.");
    }
    if(whiteReply?.relay)return relayLesson(whiteReply,retaliation);
    if(mission.lureCapture&&whiteReply?.point===-1)return word(
      "ここを先にふさいだら白は手を抜いたよ。逃げる白を追う必要も、反撃のダメージもなかったね。",
      "여길 먼저 막자 백이 패스했어. 달아나는 백을 쫓을 필요도, 반격 피해도 없었지.");
    const taken=before.board[anchor]===2&&!after.board[anchor]?group(before.board,anchor).stones.size:0;
    if(taken&&lure?.lureBonus)return word(
      `逃げて来た白も${lure.lured}子、一緒に取ったね。伸びた先の最後の呼吸点をふさいで追加${lure.lureBonus}ダメージ。`,
      `도망쳐 온 백 ${lure.lured}점도 함께 땄어. 늘어난 무리의 마지막 활로를 막아서 ${lure.lureBonus} 피해를 더 줬어.`);
    if(taken)return word(`つながった白が${taken}子消えたよ。最後の呼吸点がふさがったからだね。`,`이어져 있던 백 ${taken}점이 없어졌어. 마지막 활로를 막았거든.`);
    if(mission.kind==="link"&&after.board[anchor]===1&&mission.targets.every(q=>group(after.board,anchor).stones.has(q))){
      return word("この黒で、印の石が一つの連になったよ。つながった石は呼吸点を共有するんだ。","이 흑돌로 표시한 돌들이 한 무리가 됐어. 이어진 돌은 활로를 같이 써.");
    }
    if(mission.kind==="liberty"&&before.board[anchor]===2&&now<old){
      return word(`ここも白の呼吸点だったよ。黒を置くと、空いた点が${old}から${now}に減ったね。`,`여기도 백의 활로였어. 흑을 두니까 백의 활로가 ${old}개에서 ${now}개로 줄었지.`);
    }
    if(mission.kind==="escape"&&now>old){
      return word(`印の黒の呼吸点が${old}から${now}に増えた。石の上下左右に空いた点を数えてみて。`,`표시한 흑의 활로가 ${old}개에서 ${now}개가 됐어. 돌의 상하좌우에 빈 점을 세어 봐.`);
    }
    if(mission.kind==="atari"&&now===1){
      const chains=new Set(mission.targets.filter(q=>after.board[q]===2&&group(after.board,q).liberties.size===1)
        .map(q=>Math.min(...group(after.board,q).stones)));
      if(chains.size>=2)return word("白の連が二つ、どちらも呼吸点は一つだけ。これが両アタリだよ。","백 두 무리에 활로가 하나씩 남았어. 한 수로 두 무리를 단수에 몰았지.");
      return word("白の呼吸点が一つ。今はアタリだよ。白が伸びるなら、その先を読もう。","백의 활로가 하나야. 지금은 단수야. 백이 뻗으면 그다음 수를 읽어 봐.");
    }
    if(mission.kind==="signal"){
      const result=LastSignal.inspect(after.board,mission);
      if(result.won)return word("黒は二組とも二眼になったね。相手は二つの眼を一手ではふさげない。合図の点も空いてるよ。","흑 두 무리 모두 눈이 둘이야. 상대는 한 수로 두 눈을 다 막을 수 없어. 신호를 보낼 자리도 남았어.");
    }
    if(whiteReply?.point>=0)return word("白はここに返したよ。さっきの形と見比べると、次に残った仕事が分かる。","백이 여기로 받았어. 방금 모양과 비교하면 다음에 할 일이 보여.");
    return word("この手は目標につながるよ。別の候補なら、白が返したあとも同じ形を作れるかな？","이 수는 목표로 이어져. 다른 후보도 백이 받은 뒤에 같은 모양을 만들 수 있을까?");
  }
  function koReason(state,point,side){
    if(!state.previous||state.board[point])return "";
    const withoutKo=play({board:state.board,previous:null},point,side);
    if(!withoutKo||withoutKo.board.join("")!==state.previous)return "";
    return word("今すぐ取ると直前の形に戻るよ。コウだから、先に別の所へ一手打とう。","지금 되따내면 직전 모양이 돌아와. 패니까 먼저 다른 곳에 한 수 두어야 해.");
  }
  function cutout(canvas,member){
    canvas.width=canvas.height=144;
    canvas.className="coach-cutout";
    canvas.setAttribute("aria-hidden","true");
    if(member!==null){CrewArt.portrait(canvas,member);return;}
    const poses=CastMotion.poses;
    function paint(){
      if(poses.naturalWidth)canvas.getContext("2d").drawImage(poses,58,65,62,65,3,0,138,144);
    }
    if(poses.naturalWidth)paint();else poses.addEventListener("load",paint,{once:true});
  }
  function boardDiagram(title,state,targets,point,taken){
    const figure=document.createElement("figure"),canvas=document.createElement("canvas"),caption=document.createElement("figcaption");
    canvas.width=canvas.height=180;
    const n=Math.sqrt(state.board.length),u=canvas.width/(n+1),ctx=canvas.getContext("2d");
    canvas.setAttribute("role","img");
    const played=point<0?"":word("、着手 "+MatchRules.coordinate(n,point)," · 착점 "+MatchRules.coordinate(n,point));
    const captured=taken.size?word("、取られた石 "+taken.size+"子"," · 따낸 돌 "+taken.size+"점"):"";
    canvas.setAttribute("aria-label",title+played+captured);
    canvas.dataset.position=state.board.join("");canvas.dataset.placed=String(point);
    canvas.dataset.captures=[...taken].join(",");
    Wardrobe.surface(ctx,canvas.width,canvas.height,0);
    ctx.strokeStyle="#614b30";ctx.lineWidth=1.25;ctx.beginPath();
    for(let j=1;j<=n;j++){
      const t=j*u;
      ctx.moveTo(t,u);ctx.lineTo(t,n*u);ctx.moveTo(u,t);ctx.lineTo(n*u,t);
    }
    ctx.stroke();
    for(const [p,side] of state.board.entries()){
      const x=(p%n+1)*u,y=(Math.floor(p/n)+1)*u;
      if(side)Wardrobe.stone(ctx,x,y,u*.395,side===2,0);
      if(taken.has(p)){
        ctx.lineCap="round";ctx.beginPath();
        ctx.moveTo(x-u*.20,y-u*.20);ctx.lineTo(x+u*.20,y+u*.20);
        ctx.moveTo(x+u*.20,y-u*.20);ctx.lineTo(x-u*.20,y+u*.20);
        ctx.strokeStyle="#3c1911";ctx.lineWidth=5;ctx.stroke();
        ctx.strokeStyle="#ffd197";ctx.lineWidth=2.5;ctx.stroke();
      }else if(p===point||targets.has(p)&&side){
        ctx.beginPath();ctx.arc(x,y,u*(p===point?.31:.46),0,Math.PI*2);
        ctx.setLineDash(p===point?[]:[2,2]);
        ctx.strokeStyle="#203732";ctx.lineWidth=4;ctx.stroke();
        ctx.strokeStyle=p===point?"#7ef6e3":"#fff2c2";ctx.lineWidth=2;ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    caption.textContent=title;figure.append(canvas,caption);
    return figure;
  }
  function comparison({before,after,blackPoint,whiteReply,mission},counter){
    const area=document.createElement("section"),frames=document.createElement("div"),legend=document.createElement("p"),label=document.createElement("strong");
    const targets=new Set(mission.targets);
    area.className="coach-comparison";frames.className="coach-diagrams";legend.className="coach-legend";
    area.setAttribute("aria-label",word("着手の比較","착수 비교"));
    label.className="coach-diagram-label";label.textContent=word("前の局面 · 閲覧のみ","직전 국면 · 보기 전용");
    if(whiteReply?.relay){
      const expected=whiteReply.relay.defaultReply;
      frames.append(boardDiagram(word("連携なし","연계 미사용"),expected.state,targets,expected.point,new Set()),
        boardDiagram(word("実際の応手","실제 응수"),whiteReply.state,targets,whiteReply.point,new Set()));
      legend.textContent=word("○ 白が打つ点","○ 백의 착점");
    }else{
      const takeBlack=new Set(after.captured),takeWhite=new Set(counter?whiteReply.state.captured:[]);
      frames.append(boardDiagram(word("黒の着手前","흑 두기 전"),before,targets,-1,takeBlack),
        boardDiagram(word("黒の着手後","흑 둔 뒤"),after,targets,blackPoint,takeWhite));
      if(counter)frames.append(boardDiagram(word("白の応手後","백 응수 뒤"),whiteReply.state,targets,whiteReply.point,new Set()));
      legend.textContent=takeBlack.size||takeWhite.size?word("○ 着手　× 次の図で取られた石","○ 착점 · × 다음 그림에서 빠진 돌"):word("○ 着手","○ 착점");
    }
    area.append(label,frames,legend);
    return area;
  }
  function marks(board,classes,cells){
    const grid=document.getElementById(board);
    for(const [name,points] of classes)for(const point of points)grid?.children[point]?.classList.toggle(name,cells);
  }
  function dismiss(panel){
    const old=receipts.get(panel);
    if(old){
      marks(old.board,old.classes,false);
      old.note.remove();receipts.delete(panel);
    }
  }
  function afterAdvance(panel,advance){
    const prior=receipts.get(panel);
    dismiss(panel);
    advance();
    if(!prior||prior.note.dataset.replay)return;
    prior.note.dataset.replay="true";prior.note.open=false;
    prior.note.querySelector("summary").textContent=word("前の一手を振り返る","직전 수 다시 보기");
    document.getElementById(prior.board)?.closest(".board-panel,.reach-goban")?.before(prior.note);
    receipts.set(panel,prior);
  }
  function record(move,{stage,host,board}){
    dismiss(host);
    if(!move.mission||!Number.isInteger(move.blackPoint))return false;
    const slot=document.getElementById(board)?.closest(".board-panel,.reach-goban");
    if(!slot?.parentElement)return false;
    const relay=!!move.whiteReply?.relay;
    const lesson=relay?"formation-relay":move.lure?.lureBonus?"tide-lure":move.mission.kind,key=CampaignSlots.id+":"+stage+":"+lesson;
    const seenKey=CampaignSlots.session("bfq-coach-seen."+CampaignSlots.id);
    let previous=[];
    try{const known=JSON.parse(localStorage.getItem(seenKey));if(Array.isArray(known))previous=known;}catch{}
    const times=move.accepted?0:(errors.get(key)||0)+1;errors.set(key,times);
    const auto=!suppressed&&(move.accepted?!previous.includes(lesson):times===2);
    if(auto&&move.accepted){
      try{localStorage.setItem(seenKey,JSON.stringify([...previous.slice(-11),lesson]));}catch{}
    }
    const counter=move.whiteReply?.point>=0;
    const member=counter?null:Crew.deployed()[0]??null;
    const label=word("この一手の解説","이번 수 해설");
    const note=document.createElement("details"),summary=document.createElement("summary"),card=document.createElement("div");
    note.className="field-coach";note.dataset.side=counter?"reply":"ally";note.dataset.settled=String(move.accepted&&!counter);note.open=auto;
    summary.textContent=label;
    if(relay)note.dataset.relay="true";
    if(move.after.captured?.length||counter&&move.whiteReply.state.captured?.length)note.dataset.capture="true";
    const portrait=document.createElement("canvas"),voice=document.createElement("div"),name=document.createElement("strong");
    const body=document.createElement("p"),controls=document.createElement("div"),close=document.createElement("button"),disable=document.createElement("button");
    card.className="coach-card";voice.className="coach-voice";controls.className="coach-controls";
    name.textContent=BattleActions.allyName(member)+(counter?word(" · 白の応手"," · 백의 응수"):"");
    body.setAttribute("role","status");body.textContent=describe(move);
    close.type=disable.type="button";
    close.textContent=word("閉じる","닫기");
    disable.textContent=relay?word("自動表示を切る","자동 열기 끄기"):word("次から自動で開かない","다음부터 자동으로 열지 않기");
    close.onclick=()=>{note.open=false;marks(board,classes,false);summary.focus({preventScroll:true});};
    disable.onclick=()=>{suppress(true);close.click();};
    controls.append(close,disable);voice.append(name,body,controls);card.append(portrait,voice,comparison(move,counter));note.append(summary,card);slot.before(note);
    cutout(portrait,member);
    const witness=counter?move.whiteReply.point:move.blackPoint,position=counter?move.whiteReply.state:move.after;
    const anchors=move.mission.targets.filter(q=>q!==witness&&position.board[q]).slice(0,4);
    const classes=[["coach-witness",[witness]],["coach-target",anchors]];
    marks(board,classes,auto);
    note.ontoggle=()=>{if(note.isConnected)marks(board,classes,note.open&&!note.dataset.replay);};
    receipts.set(host,{board,note,classes});return auto;
  }
  function suppress(value){
    suppressed=value;
    try{localStorage.setItem(pref,value?"off":"on");}catch{}
    preferences();
  }
  function preferences(){
    const label=document.getElementById("coachSetting"),b=document.getElementById("coachPreference");
    if(!b)return;
    label.textContent=word("着手後の解説","착수 후 해설");
    b.textContent=suppressed?word("オフ","끔"):word("オン","켬");
    b.setAttribute("aria-pressed",String(!suppressed));
    b.onclick=()=>suppress(!suppressed);
  }
  return Object.freeze({describe,koReason,record,dismiss,afterAdvance,preferences});
})();
