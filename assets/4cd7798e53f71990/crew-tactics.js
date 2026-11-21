"use strict";
// A technique banks one crafting material on a move already accepted by the expedition.
// The caller settles that bank together with the stage victory; no routine here plays a move.
const CrewTactics=(()=>{
  const steering={
    2:{text:["白を岸から内側へ向かわせる。","백의 응수를 강가에서 안쪽으로 유도한다."],score:r=>edge(r.point)},
    18:{text:["最初の印から最も遠い白の逃げ道を読む。","첫 표식에서 가장 먼 백의 탈출로를 읽는다."],score:(r,e)=>distance(r.point,e.mission.targets[0])},
    24:{text:["黒と接触する応手を誘い、取れる黒があればそちらを優先する。","백이 흑과 맞붙는 응수를 유도하며, 흑을 되잡는 수가 있으면 우선한다."],score:(r,e)=>r.state.captured.length*5+neighbors[r.point].filter(p=>e.after[p]===1).length}
  };
  const members=[],relayBit=0x40000000;
  function companion(name,role,technique,condition,material,when){
    const id=members.length;
    members.push(Object.freeze({id,name,role,technique,condition,material,when,influence:steering[id]?.text??null}));
  }
  companion(["ルル","루루"],["森の配達人","숲 배달부"],["封を押す","소인 찍기"],
    ["印の白の呼吸点を一つふさぎ、白を盤に残す。","표시한 백의 활로를 하나 메우고 판에 남긴다."],0,f=>f.restricted&&f.targetAfter>0);
  companion(["モル","모루"],["水門の大工","수문 목수"],["縦の渡し板","세로 널다리"],
    ["最初の印と同じ縦線で、離れた黒二組をつなぐ。","첫 표식과 같은 세로줄에서 떨어진 흑 두 무리를 잇는다."],0,f=>f.joined&&f.dx===0);
  companion(["ホン","혼"],["霧の灯台守","안개 등대지기"],["岸の灯","강가의 등불"],
    ["盤端に一番近い呼吸点から印の白を詰める。","판 가장자리에 가장 가까운 활로부터 표시한 백을 조인다."],1,f=>f.restricted&&f.nearestShore);
  companion(["イソル","이솔"],["こだまの記録係","메아리 기록관"],["応手の記録","응수 기록"],
    ["白の応手の後、その手に隣り合う点で印の白を取る。","백이 응수한 뒤 그 수에 붙여 표시한 백을 따낸다."],4,f=>f.caught&&f.answered&&f.replyDistance===1);
  companion(["セナ","세나"],["盾の勇者","방패 용사"],["横陣","횡대 돌파"],
    ["最初の印と同じ横線で、離れた黒二組をつなぐ。","첫 표식과 같은 가로줄에서 떨어진 흑 두 무리를 잇는다."],2,f=>f.joined&&f.dy===0);
  companion(["ミオ","미오"],["川の司祭","강의 성직자"],["手当て","응급 치유"],
    ["アタリの黒を呼吸点三つ以上に戻す。","단수인 흑을 활로 셋 이상으로 구한다."],1,f=>f.savedAtari&&f.own.liberties.size>=3);
  companion(["レン","렌"],["鍵開けの盗賊","자물쇠 도적"],["すり抜け","틈새 탈출"],
    ["窮地の黒を、白に触れず、印から斜めの方向へ逃がす。","백에 붙지 않고 첫 표식의 가로·세로줄을 벗어나 흑을 탈출시킨다."],3,f=>f.rescue&&f.whiteNeighbors===0&&f.dx!==0&&f.dy!==0);
  companion(["ガン","바우"],["岩角の破城役","바위뿔 돌격수"],["岩崩し","바위 허물기"],
    ["印を含む二子以上の白の連をまとめて取る。","표시한 돌을 포함해 두 점 이상인 백 무리를 한꺼번에 딴다."],2,f=>f.caught&&f.targetSize>=2);
  companion(["ヒバ","화루"],["火花イモリ","불씨 도롱뇽"],["火移り","옮겨붙는 불"],
    ["味方に接して打ち、印の白を新しくアタリにする。","아군과 붙여 두어 표시한 백을 새로 단수로 만든다."],2,f=>f.atari&&f.friends.length>0);
  companion(["リンネ","방울이"],["鈴羽の案内蛾","방울날개 길잡이"],["斜めの便り","대각선 소식"],
    ["斜めに向かい合う二つの黒の印を一手でつなぐ。","서로 대각선에 있는 두 흑 표식을 한 수로 잇는다."],4,f=>f.link&&f.diagonalMarks);
  companion(["シオン","시온"],["晶尾の刺突役","수정꼬리 척후"],["一針","한 점 찌르기"],
    ["周囲の黒に頼らず単独で打ち、印の白を取る。","주변 아군과 붙지 않는 단독 착수로 표시한 백을 딴다."],3,f=>f.caught&&f.friends.length===0);
  companion(["キセキ","기석"],["祠の守り亀","사당 수호거북"],["岩屋の構え","돌집 지키기"],
    ["黒が三方を囲む点に打ち、城壁の連を完成させる。","주변 세 방향 이상에 아군이 있는 곳에 두어 흑의 성벽을 연결한다."],3,f=>f.link&&f.friendlyNeighbors>=3);
  companion(["トワ","토와"],["橋梁大工","교량 목수"],["継ぎ梁","가로지른 들보"],
    ["石と石の間に入り、一直線に黒の連をつなぐ。","두 흑돌 사이에 들어가 일직선으로 끊긴 무리를 잇는다."],0,f=>f.joined&&f.straightBridge);
  companion(["ナギ","나기"],["川笛の奏者","강피리 연주자"],["誘いの音","유인 선율"],
    ["読みの初手で印の白をアタリにし、白番に渡す。","수읽기 첫 수에 표시한 백을 단수로 몰고 백의 응수를 맞는다."],1,f=>f.reading&&f.first&&!f.done&&f.atari);
  companion(["カジ","카지"],["鯰の航海士","메기 항해사"],["岸渡り","강가로"],
    ["中央の印から盤端に近づき、第二線以下へ逃げる。","안쪽의 표시한 흑을 판 가장자리 쪽 두 번째 줄 안으로 탈출시킨다."],1,f=>f.rescue&&f.shore<=1&&f.shore<f.anchorShore);
  companion(["サギリ","사기리"],["白鷺の郵便飛脚","백로 우편부"],["渡り便","물 건너 배달"],
    ["印の白の連を、その印に直接接しない場所から取る。","첫 표식에 직접 붙지 않은 지점에서 표시한 백 무리를 딴다."],0,f=>f.caught&&f.targetDistance>1);
  companion(["アカネ","아카네"],["炉の技師","화로 기술자"],["圧抜き","압력 빼기"],
    ["白を取り、取った跡に自分の連の呼吸点を二つ作る。","백을 따낸 자리에 내 무리의 새 활로를 둘 이상 만든다."],2,f=>f.caught&&f.opened>=2);
  companion(["バク","보리"],["ビーバーの水工","비버 수리공"],["分水杭","물막이 말뚝"],
    ["離れた黒をつなぎ、両組が持っていた別の共通の呼吸点も守る。","떨어진 흑을 잇고, 두 무리가 이미 공유하던 다른 활로도 남긴다."],0,f=>f.joined&&f.spareJoint);
  companion(["アスミ","아스미"],["星読み","별점술사"],["星図","별자리 도면"],
    ["三手以上の読みで、白の全応手に続きがある初手を打つ。","세 수 이상 읽는 국면에서 백의 모든 검증 응수에 후속 수가 있는 첫 수를 둔다."],4,f=>f.reading&&f.first&&!f.done&&f.mission.turns>=3);
  companion(["クリ","단비"],["木の実の射手","도토리 사수"],["独り矢","외톨이 화살"],
    ["隣に黒のない点から、印の白をアタリにする。","아군이 붙어 있지 않은 지점에서 표시한 백을 단수로 만든다."],0,f=>f.atari&&!f.friends.length);
  companion(["ワタリ","건우"],["渡し守","나루 뱃사공"],["合流","물길 합류"],
    ["孤立した黒一子を別の黒二子以上につなぎ渡す。","외따로 있던 흑 한 점을 두 점 이상인 다른 흑 무리에 연결한다."],1,f=>f.joined&&f.friends.some(g=>g.stones.size===1)&&f.friends.some(g=>g.stones.size>=2));
  companion(["ユキ","유키"],["雪狼の衛生兵","설원 늑대 의무병"],["雪中搬送","눈길 후송"],
    ["複数の黒を含む印の連をまとめて逃がす。","표시한 흑 무리에 원래 있던 두 점 이상을 함께 탈출시킨다."],3,f=>f.rescue&&f.targetSize>=2);
  companion(["サラ","사라"],["長槍兵","장창병"],["押し槍","밀어붙이는 창"],
    ["背に黒、前に白を置く一直線の押しで印の呼吸点を詰める。","뒤에 흑, 앞에 백을 둔 일직선 밀기로 표시한 백의 활로를 줄인다."],2,f=>f.restricted&&f.straightPush);
  companion(["ネイ","네이"],["蝙蝠の音響師","박쥐 음향사"],["反響","반향 추적"],
    ["白の応手に接して次の黒を打ち、まだ続く読みをつなぐ。","방금 둔 백에 붙여 다음 흑을 두고 수읽기를 계속 잇는다."],4,f=>f.reading&&f.answered&&f.replyDistance===1&&!f.done);
  companion(["カゲ","카게"],["仮面の剣舞士","가면 검무가"],["両刃","양날 검무"],
    ["白の同じ連の二面に触れ、印の呼吸点を詰めるか取る。","같은 백 무리의 두 면에 동시에 붙여 표시한 백을 조이거나 딴다."],3,f=>(f.restricted||f.caught)&&f.enemies.length===1&&f.whiteNeighbors>=2);
  companion(["ネベ","네베"],["雪山羊の郵便夫","눈산양 우편부"],["尾根道","능선 길"],
    ["支えの黒と接し、盤端から二線以内に正しく打つ。","아군에 기대어 판 가장자리에서 두 번째 줄 안에 정답 수를 둔다."],0,f=>f.shore<=1&&f.friends.length>0);
  companion(["イリ","이리"],["雲織り","구름 직조사"],["交差織り","교차 짜기"],
    ["縦と横の黒を一つの連につなぐ折れ曲がった継ぎ目を作る。","세로와 가로 방향의 흑을 꺾어 한 무리로 잇는다."],3,f=>f.joined&&f.elbowBridge);
  companion(["シロ","시로"],["銀鼬の斥候","은담비 정찰병"],["追跡","꼬리 밟기"],
    ["直前に逃げた白石も印と一緒に取る。","직전 응수로 도망친 백돌까지 표시한 무리와 함께 따낸다."],1,f=>f.caught&&f.answered&&f.after[f.previousWhite]===0);
  companion(["ハル","하루"],["薬師","물약사"],["守りの調合","방비 조제"],
    ["包囲した白を取りながら、アタリだった隣の黒も救う。","둘러싼 백을 따면서 단수였던 인접 아군까지 구한다."],2,f=>f.caught&&f.savedAtari);
  companion(["ポン","포니"],["白兎の太鼓方","흰토끼 북잡이"],["終幕の拍","끝맺는 박자"],
    ["四手読みで白の応手を受け、最後に印を取り切る。","네 수 읽기에서 백의 응수를 거쳐 마지막에 표시한 백을 전부 딴다."],4,f=>f.reading&&f.caught&&f.mission.turns===4&&!f.first);

  function adjacentGroups(board,point,color){
    const list=[];
    for(const n of neighbors[point]){
      if(board[n]===color&&!list.some(g=>g.stones.has(n)))list.push(group(board,n));
    }
    return list;
  }
  const distance=(a,b)=>Math.abs(a%9-b%9)+Math.abs(Math.floor(a/9)-Math.floor(b/9));
  const edge=p=>Math.min(p%9,8-p%9,Math.floor(p/9),8-Math.floor(p/9));
  function observe(event){
    const {before,after,point,mission,remaining,previousWhite,done}=event;
    const anchor=mission.targets[0],target=group(before,anchor),targetAfter=after[anchor]?group(after,anchor).liberties.size:0;
    const own=group(after,point),friends=adjacentGroups(before,point,1),enemies=adjacentGroups(before,point,2);
    const markedWhite=before[anchor]===2,restricted=markedWhite&&targetAfter>0&&targetAfter<target.liberties.size;
    const caught=markedWhite&&mission.targets.every(p=>after[p]===0);
    const joined=friends.length>=2,savedAtari=friends.some(g=>g.liberties.size===1)&&own.liberties.size>=2;
    const caughtPoints=[...own.liberties].filter(p=>before[p]===2);
    const dx=point%9-anchor%9,dy=Math.floor(point/9)-Math.floor(anchor/9),shore=edge(point);
    const answered=Number.isInteger(previousWhite)&&previousWhite>=0&&before[previousWhite]===2&&remaining<mission.turns-1;
    const around=neighbors[point],horizontal=around.filter(p=>Math.floor(p/9)===Math.floor(point/9));
    const vertical=around.filter(p=>Math.floor(p/9)!==Math.floor(point/9));
    const opposes=(row,a,b)=>row.length===2&&((before[row[0]]===a&&before[row[1]]===b)||(before[row[1]]===a&&before[row[0]]===b));
    const spareJoint=joined&&friends.some((a,i)=>friends.slice(i+1).some(b=>[...a.liberties].some(p=>p!==point&&b.liberties.has(p)&&own.liberties.has(p))));
    const separated=(a,b)=>before[a]===1&&before[b]===1&&!friends.some(g=>g.stones.has(a)&&g.stones.has(b));
    const straightBridge=joined&&[horizontal,vertical].some(a=>a.length===2&&separated(...a));
    const elbowBridge=joined&&horizontal.some(a=>vertical.some(b=>separated(a,b)));
    return {mission,before,after,point,anchor,target,remaining,done,dx,dy,shore,anchorShore:edge(anchor),targetDistance:distance(point,anchor),
      own,friends,enemies,targetAfter,targetSize:target.stones.size,restricted,caught,joined,savedAtari,straightBridge,elbowBridge,spareJoint,
      friendlyNeighbors:around.filter(p=>before[p]===1).length,whiteNeighbors:around.filter(p=>before[p]===2).length,opened:caughtPoints.length,answered,previousWhite,
      replyDistance:answered?distance(previousWhite,point):Infinity,atari:restricted&&targetAfter===1,
      reading:mission.kind==="read"||mission.fortressRead===true,first:remaining===mission.turns-1,
      link:mission.kind==="link"&&done,rescue:mission.kind==="escape"&&done,
      diagonalMarks:mission.targets.some(p=>Math.abs(p%9-anchor%9)===1&&Math.abs(Math.floor(p/9)-Math.floor(anchor/9))===1),
      straightPush:opposes(horizontal,1,2)||opposes(vertical,1,2),
      nearestShore:target.liberties.has(point)&&![...target.liberties].some(p=>edge(p)<shore)};
  }
  function record(ids,pending,event,roster){
    if(!Number.isInteger(pending)||pending<0||pending>0x7fffffff)pending=0;
    if(!event?.accepted||!Array.isArray(ids)||!ids.length)return pending;
    const {before,after,point,mission}=event;
    if(before?.length!==81||after?.length!==81||!Number.isInteger(point)||before[point]!==0||after[point]!==1||!mission?.targets?.length||!before[mission.targets[0]])return pending;
    const facts=observe(event);
    const triggered=members.filter(m=>ids.includes(m.id)&&m.when(facts)).map(m=>m.id);
    for(const id of triggered)pending|=1<<id;
    const squad=triggered.filter(id=>CrewFormation.row(roster,id)>=0);
    if(squad.length>=2&&squad.some(id=>CrewFormation.row(roster,id)===1))pending|=relayBit;
    return pending;
  }
  function redirect(gainedMask,candidates,suggested,event){
    if(!gainedMask||!event?.accepted||event.done||event.mission?.guardian||
       !["read","capture"].includes(event.mission?.kind)||!suggested||suggested.point<0)return suggested;
    if(!Array.isArray(candidates)||!candidates.every(r=>r.canWin===true))return suggested;
    const choices=candidates.filter(r=>r.point>=0&&r.state?.board?.length===81&&r.state.board[r.point]===2);
    if(choices.length<2||!choices.includes(suggested))return suggested;
    const active=Array.isArray(event.ids)?event.ids:members.map(m=>m.id);
    for(const id of active){
      const policy=steering[id];
      if(!policy||!(gainedMask&(1<<id)))continue;
      let best=suggested,bestScore=policy.score(best,event);
      for(const r of choices){
        const score=policy.score(r,event);
        if(score>bestScore){best=r;bestScore=score;}
      }
      if(best!==suggested)return best;
    }
    return suggested;
  }
  function payout(mask,stage){
    if(!Number.isInteger(stage)||stage<0||stage>=80||!Number.isInteger(mask)||mask<0||mask>0x7fffffff)return [];
    return materialsFor(mask);
  }
  function materialsFor(mask){
    if(!Number.isInteger(mask)||mask<0||mask>0x7fffffff)return [];
    const totals=[0,0,0,0,(mask&relayBit)?1:0];
    for(const member of members)if(mask&(1<<member.id))totals[member.material]++;
    return totals.flatMap((n,i)=>n?[[i,n]]:[]);
  }
  return Object.freeze({members:Object.freeze(members),record,payout,materialsFor,redirect,observe,relayBit});
})();

// Build hypothetical examples on demand using the same immutable move/ko state as the live position.
// A line is explanatory only. Its black and white moves are never committed by this module.
const CrewCoach=(()=>{
  const all=(s)=>Array.from(s);
  const near=(p)=>neighbors[p];
  const row=p=>Math.floor(p/9);
  const span=(a,b)=>Math.abs(a%9-b%9)+Math.abs(row(a)-row(b));
  const rim=p=>Math.min(p%9,8-p%9,row(p),8-row(p));
  const uniq=ps=>[...new Set(ps)];
  const first=g=>g.stones.values().next().value;
  const along=(p,n)=>row(p)===row(n)?"h":"v";
  const filterAround=(f,fn)=>near(f.point).filter(q=>fn(q,f.before[q]));
  const targetLibs=f=>f.after[f.anchor]?all(group(f.after,f.anchor).liberties):[];
  const afterGroup=f=>all(f.own.liberties);
  const taken=f=>all(f.target.stones).filter(q=>f.after[q]===0);
  const saved=f=>f.friends.filter(g=>g.liberties.size===1).map(first);
  const support=(f,axis)=>filterAround(f,(q,c)=>c===1&&along(f.point,q)===axis);
  const pairOnAxis=(f,axis)=>{
    const stones=support(f,axis);
    return stones.length===2&&!f.friends.some(g=>stones.every(q=>g.stones.has(q)))?stones:[];
  };
  function elbow(f){
    for(const q of support(f,"h"))for(const v of support(f,"v")){
      if(!f.friends.some(g=>g.stones.has(q)&&g.stones.has(v)))return [q,v];
    }
    return [];
  }
  const coast=ps=>ps.filter(p=>rim(p)===Math.min(...ps.map(rim)));
  const shelter=f=>afterGroup(f).filter(q=>near(q).every(n=>f.after[n]!==2));
  const contact=f=>filterAround(f,(_,c)=>c===2);
  const soundPair=f=>[f.previousWhite,...targetLibs(f)];
  // Each explanation identifies particular intersections or stones, not just a technique name.
  const profiles=[
    [["白に残る呼吸点","백에 남는 활로"],targetLibs],
    [["縦線で結ぶ黒の印","세로줄로 이을 흑 표식"],f=>[f.anchor,...f.friends.map(first)].filter(q=>q%9===f.point%9)],
    [["岸に最も近い白の呼吸点","가장자리 쪽 백 활로"],f=>coast(all(f.target.liberties))],
    [["直前の白とその連","직전 백 착수와 그 무리"],f=>[f.previousWhite,...taken(f)]],
    [["横線で結ぶ黒の印","가로줄로 이을 흑 표식"],f=>[f.anchor,...f.friends.map(first)].filter(q=>row(q)===row(f.point))],
    [["アタリから救う黒","단수에서 구할 흑"],saved],
    [["脱出後、白に接しない呼吸点","탈출 후 백과 맞닿지 않은 활로"],shelter],
    [["一度に取れる白の連","한꺼번에 따낼 백 무리"],taken],
    [["支えの黒と、白の最後の呼吸点","받치는 흑과 백의 마지막 활로"],f=>[...f.friends.map(first),...targetLibs(f)]],
    [["斜めにつなぐ二つの印","대각선으로 이을 두 표식"],f=>f.mission.targets],
    [["単独の黒で取る隣の白","홀로 흑을 두어 따낼 옆의 백"],contact],
    [["継ぎ目を囲む黒","이음새를 둘러싼 흑"],f=>filterAround(f,(_,c)=>c===1)],
    [["継ぎ目を挟む黒二子","이음새 양쪽의 흑 두 점"],f=>[...pairOnAxis(f,"h"),...pairOnAxis(f,"v")]],
    [["白の最後の呼吸点","백의 마지막 활로"],targetLibs],
    [["脱出後、盤端に近い呼吸点","탈출 후 가장자리 쪽 활로"],f=>coast(afterGroup(f))],
    [["印から離れた、同じ白の連","표식에서 떨어진 같은 백 무리"],f=>taken(f).filter(q=>q!==f.anchor).sort((a,b)=>span(b,f.anchor)-span(a,f.anchor))],
    [["取った跡に開く黒の呼吸点","따낸 자리에 생긴 흑 활로"],f=>afterGroup(f).filter(q=>f.before[q]===2)],
    [["別に残る共通の継ぎ目","두 흑 무리에 남는 다른 이음점"],f=>afterGroup(f).filter(q=>f.friends.filter(g=>g.liberties.has(q)).length>=2)],
    [["白の次の応手を読む、印の連の呼吸点","백 응수를 읽을 때 볼 표식 무리의 활로"],targetLibs],
    [["単独の利かしで残す白の呼吸点","흑 한 점으로 조인 뒤 남는 백 활로"],targetLibs],
    [["孤立した黒と、合流する大きな連","외따로 있던 흑과 이어지는 큰 무리"],f=>[...f.friends.filter(g=>g.stones.size===1).map(first),...f.friends.filter(g=>g.stones.size>1).flatMap(g=>all(g.stones))]],
    [["一緒に脱出する黒の連","함께 탈출하는 흑 무리"],f=>all(f.target.stones)],
    [["押す黒と正面の白","뒤를 받치는 흑과 앞의 백"],f=>{for(const axis of ["h","v"]){const line=near(f.point).filter(q=>along(f.point,q)===axis);if(line.some(q=>f.before[q]===1)&&line.some(q=>f.before[q]===2))return line;}return [];}],
    [["直前の白と次に狙う呼吸点","직전 백 응수와 다음에 노릴 활로"],soundPair],
    [["両側から接する同じ白の連","두 면으로 맞닿는 같은 백 무리"],contact],
    [["盤端で支える黒","가장자리에서 받쳐 주는 흑"],f=>coast(filterAround(f,(_,c)=>c===1))],
    [["折れ曲がって結ぶ二つの黒","꺾어 이어지는 두 흑돌"],elbow],
    [["追い詰めて取る直前の白","뒤쫓아 따내는 직전 백돌"],f=>[f.previousWhite]],
    [["取り返して救う黒と、空く呼吸点","백을 따서 구할 흑과 열리는 활로"],f=>[...saved(f),...afterGroup(f).filter(q=>f.before[q]===2)]],
    [["読みの終わりに消える白の連","마지막 수에 따내는 백 무리"],taken]
  ];
  function winning(state,m,turns){
    const choices=[];
    const reading=m.kind==="read"||m.fortressRead;
    // For reading, these are the attacking intersections used by the expedition's hint curriculum.
    const points=reading?attackingPoints(state.board,m):state.board.keys();
    for(const p of points){
      if(state.board[p])continue;
      const attack=play(state,p,1);
      if(!attack)continue;
      const finished=solved(attack.board,m);
      if(!finished&&!reading)continue;
      const g=m.guardian?guardianMove(state,m,turns,p):null;
      if(g?!g.win:!finished&&!goodMove(state,m,turns,p))continue;
      choices.push({point:p,attack,done:g?g.done:finished,guardian:g});
    }
    return choices;
  }
  function recommend(ids,state,m,turns,previousWhite,prepared){
    if(!ids?.length||!m?.targets?.length||!state.board[m.targets[0]])return null;
    const choices=prepared??winning(state,m,turns);
    if(!choices.length)return null;
    for(const c of choices){
      const event={before:state.board,after:c.attack.board,mission:m,point:c.point,remaining:turns-1,previousWhite,done:c.done};
      c.facts=CrewTactics.observe(event);
    }
    let best=choices[0],owner=null,marked=[];
    for(const id of ids){
      if(!profiles[id])continue;
      for(const c of choices){
        if(!CrewTactics.members[id].when(c.facts))continue;
        const sites=uniq(profiles[id][1](c.facts)).filter(p=>Number.isInteger(p)&&p>=0&&p<81);
        if(!sites.length)continue;
        if(owner===null||sites.length>marked.length){owner=id;best=c;marked=sites;}
      }
      if(owner!==null)break;
    }
    return {state,mission:m,turns,owner,point:best.point,attack:best.attack,done:best.done,guardian:best.guardian,marked,label:owner===null?null:profiles[owner][0]};
  }
  function line(plan){
    const frames=[{state:plan.attack,point:plan.point,side:1}];
    if(plan.done||plan.turns<2)return frames;
    let response=plan.guardian?.reply;
    if(!response){
      const verified=replies(plan.attack,plan.mission,plan.turns-1,plan.point);
      if(!verified.length||!verified.every(r=>r.canWin))return frames;
      const playable=verified.filter(r=>r.point>=0);
      const available=playable.length?playable:verified;
      const relevance=r=>r.point<0?-100:
        plan.owner===18?span(r.point,plan.mission.targets[0]):
        r.state.captured.length*10+(r.state.board[plan.mission.targets[0]]?group(r.state.board,plan.mission.targets[0]).liberties.size:0);
      response=available.reduce((best,r)=>relevance(r)>relevance(best)?r:best);
    }
    if(!response)return frames;
    frames.push({state:response.state,point:response.point,side:2});
    const next=winning(response.state,plan.mission,plan.turns-1)[0];
    if(next)frames.push({state:next.attack,point:next.point,side:1});
    return frames;
  }
  return Object.freeze({recommend,line,winning});
})();

// Physical cells belong to field members. The guide retains their technique separately.
const CrewFormation=(()=>{
  function row(roster,id){
    if(!roster?.cells||!roster?.slots)return -1;
    const cell=Roster.cell(roster,id);
    return Number.isInteger(cell)&&cell>=0&&cell<9?Math.floor(cell/3):-1;
  }
  function first(roster,r){return roster?.slots?.find(id=>row(roster,id)===r)??null;}
  function intercept(roster,prior,mission,turns,reply){
    const member=first(roster,2);
    if(member===null||!prior||!reply?.state||reply.point<0||reply.state.board[reply.point]!==2)return null;
    // The reply must actually remove a pre-existing friendly stone or occupy the very point
    // which could have joined the marked groups / stopped the marked white extension.
    const lost=reply.state.captured.filter(p=>prior.board[p]===1);
    const q=reply.point,anchor=mission.targets[0];
    const cut=mission.kind==="link"&&prior.board[anchor]===1;
    const escape=prior.board[anchor]===2&&reply.state.board[anchor]===2&&group(reply.state.board,anchor).stones.has(q);
    if(!lost.length&&!cut&&!escape)return null;
    for(const candidate of CrewCoach.winning(prior,mission,turns)){
      const sameReply=lost.length?play(candidate.attack,q,2):null;
      if(lost.length&&lost.every(p=>candidate.attack.board[p]===1&&group(candidate.attack.board,p).liberties.size>=2&&(!sameReply||sameReply.board[p]===1))){
        return {member,point:candidate.point,threat:q,kind:"capture",affected:lost};
      }
      if(candidate.point===q&&(cut||escape))return {member,point:q,threat:q,kind:cut?"cut":"escape",affected:mission.targets};
    }
    return null;
  }
  function forecast(roster,plan){
    const member=first(roster,0);
    if(member===null||!plan||plan.done||plan.turns<2)return null;
    const frames=CrewCoach.line(plan).slice(1);
    return frames.length?{member,plan,frames,index:0,survey:true}:null;
  }
  return Object.freeze({row,first,intercept,forecast});
})();

// One lamp lights one numbered campaign position for its lifetime, including alternate continuations.
const Lanterns=(()=>{
  const bytesFor=33;
  function bytes(raw){
    if(typeof raw!=="string"||raw.length>44||raw.length%4===1||!/^[A-Za-z0-9+/]*$/.test(raw))return new Uint8Array();
    return Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
  }
  function encode(arr){
    let n=arr.length;while(n&&!arr[n-1])n--;
    return btoa(String.fromCharCode(...arr.slice(0,n))).replace(/=+$/,"");
  }
  function merge(a,b){
    const left=bytes(a),right=bytes(b);
    return encode(Uint8Array.from({length:Math.max(left.length,right.length)},(_,i)=>(left[i]||0)|(right[i]||0)));
  }
  function balance(frontier,raw){
    let used=0;for(let b of bytes(raw))for(;b;b&=b-1)used++;
    return Math.max(0,1+Math.max(0,Math.min(80,frontier))-used);
  }
  function lit(raw,n){return !!(bytes(raw)[n>>3]&(1<<(n%8)));}
  function light(raw,n,frontier){
    if(!Number.isInteger(n)||n<0||n>=bytesFor*8)return null;
    if(lit(raw,n))return raw;
    if(!balance(frontier,raw))return null;
    const data=new Uint8Array(bytesFor);data.set(bytes(raw));data[n>>3]|=1<<(n%8);
    return encode(data);
  }
  return Object.freeze({merge,balance,lit,light});
})();
