"use strict";
// White's displayed response to a correct multi-move capture study. Each form keys
// its ordered tie breakers and readable tell to its actual resident sprite.
const OuterDefenseStyle=(()=>{
  const tells={
    hold:["標的の白の呼吸点を守る構え。","표시된 백의 활로를 지키려 한다."],
    open:["白に新しい逃げ道を作る構え。","백 무리에 새 활로를 내려 한다."],
    help:["アタリの白を助ける構え。","단수에 몰린 백을 구하려 한다."],
    join:["別々の白をつなぐ構え。","떨어진 백 무리를 이으려 한다."],
    firm:["白の仲間に寄る構え。","백이 모인 쪽을 받치려 한다."],
    near:["いま打った黒に寄る構え。","방금 둔 흑 가까이 붙으려 한다."],
    away:["いま打った黒から離れる構え。","방금 둔 흑을 피해 멀어지려 한다."],
    side:["黒の進路を横から回る構え。","흑이 들어온 길을 옆으로 돌아가려 한다."],
    inward:["盤の中央へ出る構え。","판 가운데로 나오려 한다."],
    rim:["盤の縁をたどる構え。","판 가장자리를 따라가려 한다."],
    pinch:["異なる黒の間に入る構え。","서로 다른 흑 무리 사이에 들려 한다."],
    squeeze:["隣の黒の呼吸点を詰める構え。","이웃 흑의 활로를 좁히려 한다."],
    bite:["取れる黒を狙う構え。","따낼 수 있는 흑을 노린다."]
  };
  const profile=(ja,ko,a,b,c)=>({cue:[ja+" "+tells[a][0],ko+" "+tells[a][1]],order:[a,b,c]});
  const forms=[
    // Observation ridge: pika, glider, vane, ibex, bearded vulture.
    profile("石蓋を引き寄せた。","돌뚜껑을 당겼다.","help","firm","hold"),
    profile("飛膜を広げた。","비막을 펼쳤다.","side","inward","away"),
    profile("風見板を傾けた。","풍향판을 기울였다.","open","side","hold"),
    profile("角の分銅が下がる。","뿔의 추가 내려간다.","squeeze","near","hold"),
    profile("尾羽が外へ向く。","꼬리깃이 바깥을 향한다.","away","side","open"),
    // Glass furnace: snail, mole, mantis, armadillo, firebird.
    profile("硝子の殻に潜った。","유리 껍데기에 숨었다.","hold","rim","firm"),
    profile("二本の前爪で掘る。","두 앞발톱으로 파낸다.","open","away","rim"),
    profile("黒刃を立てた。","검은 낫을 세웠다.","bite","near","pinch"),
    profile("背の鞴が縮む。","등의 풀무가 오므라든다.","firm","hold","inward"),
    profile("冠と翼を同時に開く。","관깃과 날개를 함께 펼친다.","inward","side","squeeze"),
    // Tide observatory, followed by three special sentry forms.
    profile("外側の棘を押し出す。","바깥 가시를 밀어낸다.","near","pinch","hold"),
    profile("尾を巻き、羅針を向けた。","꼬리를 말고 나침반을 돌렸다.","side","rim","open"),
    profile("光る腕をほどいた。","빛나는 촉수를 풀었다.","open","inward","join"),
    profile("平たい殻を傾けた。","납작한 방패를 기울였다.","help","hold","side"),
    profile("螺旋の殻を回した。","나선 껍데기를 돌렸다.","side","hold","squeeze"),
    profile("二枚の風見板が交差する。","풍향판 두 장이 교차한다.","pinch","join","side"),
    profile("左右の鎌を斜めに構えた。","양쪽 낫을 엇걸었다.","squeeze","pinch","bite"),
    profile("二本の腕が別々に伸びる。","두 촉수가 따로 뻗는다.","join","open","away"),
    // Mill: grain mouse, chaff sparrow, weevil, crayfish, duck, millstone turtle.
    profile("麦袋を抱き直した。","밀자루를 다시 안았다.","firm","help","rim"),
    profile("短い尾を跳ね上げた。","짧은 꼬리를 세웠다.","away","inward","side"),
    profile("長い吻を差し込む。","긴 주둥이를 밀어 넣는다.","pinch","near","open"),
    profile("大鋏の鉤が返る。","큰 집게의 갈고리가 돌아간다.","bite","side","squeeze"),
    profile("翼の水車を回した。","날개 물레를 돌린다.","side","join","rim"),
    profile("甲の石臼が傾く。","등의 맷돌이 기운다.","hold","firm","near"),
    // Sliding embankment.
    profile("泥の中で髭を振る。","진흙에서 수염을 젓는다.","rim","away","open"),
    profile("葉の翅を閉じ膝を曲げた。","잎날개를 접고 무릎을 굽힌다.","inward","open","away"),
    profile("殻の下に触角を巻く。","패각 아래로 촉각을 감는다.","hold","help","rim"),
    profile("二枚の殻が開く。","두 패각이 벌어진다.","pinch","squeeze","help"),
    profile("尾の二つの蝶番が折れる。","꼬리 경첩 두 개가 꺾인다.","side","away","firm"),
    profile("細長い上下の顎を開けた。","긴 위턱과 아래턱을 벌린다.","squeeze","bite","pinch"),
    // Night lamps.
    profile("腹の灯を翅から出した。","배의 등불을 날개 밖으로 내민다.","open","firm","side"),
    profile("指先の吸盤を広げた。","발가락 흡반을 펼쳤다.","near","rim","join"),
    profile("翼膜を折り、耳を立てた。","날개막을 접고 귀를 세웠다.","side","near","bite"),
    profile("二つの喉袋が浮く。","목주머니 둘이 떠오른다.","help","join","open"),
    profile("外鰓が扇のように開く。","바깥아가미가 부채처럼 열린다.","away","open","hold"),
    profile("六つの灯が弧を描く。","여섯 등불이 호를 그린다.","pinch","side","near"),
    // Boot post.
    profile("印の付いた前足を上げた。","인주 묻은 앞발을 들었다.","near","squeeze","side"),
    profile("翼の消印を裏返した。","날개의 소인을 뒤집었다.","join","firm","inward"),
    profile("小包を締め直して跳ぶ。","소포를 고쳐 메고 뛴다.","away","rim","inward"),
    profile("切手の針が扇状に開く。","우표가시가 부챗살처럼 열린다.","help","rim","pinch"),
    profile("二筋の靴紐が分かれる。","두 줄의 장화끈이 갈라진다.","side","away","join"),
    profile("両方の鞄を振り分ける。","양 가방을 엇갈려 흔든다.","join","help","hold"),
    // Gorge.
    profile("砂穴から一対の顎を出す。","모래구덩이에서 턱 둘을 내민다.","pinch","bite","rim"),
    profile("前足で岩棚を押さえた。","앞발로 바위턱을 받쳤다.","firm","rim","hold"),
    profile("尾針を小さく巻いた。","꼬리침을 바짝 말았다.","bite","squeeze","near"),
    profile("割石の角を持ち上げた。","돌가름뿔을 치켜들었다.","near","bite","inward"),
    profile("外側の牙が上を向く。","바깥 엄니가 위를 향한다.","squeeze","open","near"),
    profile("二つの首が別々に狙う。","두 목이 서로 다른 곳을 겨눈다.","pinch","away","bite"),
    // Ink fields.
    profile("茸の傘の下に伏せた。","버섯 갓 아래 납작 엎드린다.","hold","rim","help"),
    profile("水面に脚を四方へ張る。","수면 위에 다리를 넓게 벌린다.","side","open","away"),
    profile("長い尾で甲を支えた。","긴 꼬리로 등판을 받친다.","rim","hold","join"),
    profile("筆のような嘴を下げる。","붓처럼 생긴 부리를 낮춘다.","near","pinch","bite"),
    profile("外套膜と腕を広げる。","외투막과 촉수 다발을 펼친다.","open","away","squeeze"),
    profile("墨の光る角を横に振る。","먹빛 뿔을 옆으로 휘두른다.","squeeze","side","near"),
    // Weigh-channel.
    profile("背びれと尾が逆に動く。","등지느러미와 꼬리가 반대로 움직인다.","inward","away","hold"),
    profile("左右の鋏で幅を測る。","양 집게로 틈의 너비를 잰다.","pinch","near","rim"),
    profile("岩に足を広げた。","돌에 발바닥을 펼쳤다.","hold","firm","rim"),
    profile("口で支えて石錘を下ろす。","입으로 버티고 돌추를 내린다.","help","near","firm"),
    profile("嘴と尾の皿が釣り合う。","주걱부리와 꼬리의 접시가 균형을 잡는다.","join","side","hold"),
    profile("分銅を揺らして顎を開く。","등의 추를 흔들고 턱을 벌린다.","bite","inward","firm"),
    // Silent lock.
    profile("綿の脚を深く折る。","솜다리를 바짝 접는다.","away","side","rim"),
    profile("背の鰓を花のように畳む。","꽃 모양 등 아가미를 접는다.","help","firm","away"),
    profile("大きな前足で土を押す。","큰 앞발로 흙을 민다.","open","rim","near"),
    profile("四枚の絹翅が重なる。","비단날개 네 장이 포개진다.","firm","join","help"),
    profile("二つの耳鎧を回す。","귀방패 둘을 돌린다.","side","near","hold"),
    profile("背の二つの門が開く。","등의 두 문이 열린다.","pinch","squeeze","inward")
  ];
  const form=id=>typeof OuterFauna==="undefined"?undefined:forms[OuterFauna.resident(id)];
  const cue=id=>form(id)?.cue??null;
  const edge=p=>Math.min(p%9,8-p%9,Math.floor(p/9),8-Math.floor(p/9));
  const distance=(a,b)=>Math.abs(a%9-b%9)+Math.abs(Math.floor(a/9)-Math.floor(b/9));
  function chains(board,points,color){
    const groups=[];
    for(const q of points){
      if(board[q]===color&&!groups.some(g=>g.stones.has(q)))groups.push(group(board,q));
    }
    return groups;
  }
  function measures(before,m,r,blackPoint,targetLiberties){
    const p=r.point,after=r.state.board,adj=neighbors[p],black=chains(before,adj,1),white=chains(before,adj,2);
    const own=group(after,p),targets=chains(after,m.targets,2);
    const liberties=new Set(targets.flatMap(g=>[...g.liberties]));
    // Use the angle relative to the attack, so turning still makes sense on rotated boards.
    const anchor=m.targets.find(q=>before[q]===2),dx=p%9-anchor%9,dy=Math.floor(p/9)-Math.floor(anchor/9);
    const bx=blackPoint%9-anchor%9,by=Math.floor(blackPoint/9)-Math.floor(anchor/9);
    const shared=adj.filter(q=>before[q]===2).length;
    let atari=0,reduced=0;
    for(const g of black){
      const stone=g.stones.values().next().value;
      if(!after[stone])continue;
      const n=group(after,stone).liberties.size;
      if(g.liberties.size>n){reduced++;if(n===1)atari++;}
    }
    return {
      hold:liberties.size,open:[...liberties].filter(q=>!targetLiberties.has(q)).length,
      help:own.liberties.size>1?white.filter(g=>g.liberties.size===1).length:0,
      join:Math.max(0,white.length-1),firm:shared,near:-distance(p,blackPoint),away:distance(p,blackPoint),
      side:Math.abs(dx*by-dy*bx),inward:edge(p),rim:-edge(p),
      pinch:Math.max(0,black.length-1),squeeze:atari*5+reduced,bite:r.state.captured.length
    };
  }
  function prefer(a,b,order){
    for(const key of order){if(a[key]!==b[key])return a[key]>b[key];}
    return false;
  }
  function respond(id,m,candidates,original,state,blackPoint){
    const style=form(id);
    if(!style||m?.kind!=="read"||m.guardian||!Number.isInteger(m.turns)||m.turns<2||m.turns>4||!m.targets?.length||
      state?.board?.length!==81||!Number.isInteger(blackPoint)||state.board[blackPoint]!==1||!m.targets.some(p=>state.board[p]===2)||
      !original||original.point<0||!Array.isArray(candidates)||!candidates.every(r=>r?.canWin===true))return original;
    const choices=candidates.filter(r=>Number.isInteger(r.point)&&r.point>=0&&r.point<81&&r.state?.board?.length===81);
    const baseline=choices.find(r=>r.point===original.point);
    if(!baseline||choices.length<2)return original;
    // The supplied solver list owns both the next board and its ko history.
    // Validate coordinates and provenance before taking any candidate object.
    const boardKey=state.board.join("");
    for(const q of choices){
      const next=play(state,q.point,2);
      if(!next||q.state.previous!==boardKey||q.state.board.some((stone,i)=>stone!==next.board[i])||
        !Array.isArray(q.state.captured)||q.state.captured.length!==next.captured.length||
        q.state.captured.some((p,i)=>p!==next.captured[i]))return original;
    }
    const baseLibs=new Set(chains(state.board,m.targets,2).flatMap(g=>[...g.liberties]));
    let best=baseline,high=measures(state.board,m,baseline,blackPoint,baseLibs),minimum=0;
    for(const candidate of choices){
      if(candidate===baseline)continue;
      const features=measures(state.board,m,candidate,blackPoint,baseLibs);
      if(!prefer(features,high,style.order))continue;
      // Do not turn a three-move reading lesson into a free one-move capture.
      // All candidates already have a winning line within the remaining budget.
      if(!minimum){
        minimum=1;
        while(minimum<m.turns-1&&!canWin(baseline.state,m,minimum))minimum++;
      }
      if(minimum>1&&canWin(candidate.state,m,minimum-1))continue;
      best=candidate;high=features;
    }
    return best===baseline?original:best;
  }
  return Object.freeze({respond,cue});
})();
