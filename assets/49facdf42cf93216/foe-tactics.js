"use strict";

// Only ordinary expedition encounters call this policy. The rule engine supplies every state.
const FoeTactics=(()=>{
  // Species order matches Expedition.names.flat(). Each row is an ordered series of
  // board-shape decisions. The final criterion only resolves genuine tactical ties.
  const rows=[
    ["charge","snap atari contact edge",540,"角で当たり返す","뿔로 맞단수"],
    ["dive","snatch snap cut jump",330,"逃げ口に飛び込む","탈출구로 급강하"],
    ["scale","join rescue wall anchor",610,"隣の鎖と組む","옆 무리에 합류"],
    ["flare","atari snap flank center",350,"脇から火を回す","옆구리 맞단수"],
    ["wing","diagonal cut escape flank",470,"斜めの切れ目を狙う","대각선 절단"],
    ["watch","net cut contact center",600,"二つの出口をにらむ","두 출구 포위"],
    ["sting","fork snatch snap flank",370,"二つの連を同時に刺す","두 무리 동시 단수"],
    ["shrine","rescue eye join anchor",680,"祠の足元を固める","발밑 집 모양 보강"],
    ["antler","fork join escape center",520,"枝分かれした連に迫る","갈라진 무리 압박"],
    ["shelter","eye corner rescue wall",610,"隅の殻へ潜る","귀에서 집 모양 지키기"],
    ["leap","jump escape diagonal center",300,"追手から二間離れる","추격수에서 뜀뛰기"],
    ["shear","cut atari contact flank",360,"つなぎ目を刈る","이음새 끊기"],
    ["pincer","cut fork snatch flank",460,"両側からはさむ","양옆 협공"],
    ["drift","loose escape eye anchor",620,"石の薄い方へ漂う","성긴 쪽 탈출"],
    ["pierce","snap snatch wall center",350,"伸びた黒の先を突く","뻗은 흑 끝 공격"],
    ["fan","flank net cut edge",410,"外から出口を覆う","바깥쪽 출구 덮기"],
    ["sail","escape join diagonal center",530,"味方の連へ泳ぐ","아군 쪽으로 헤엄치기"],
    ["coil","eye rescue anchor corner",690,"殻の内側に眼を囲う","껍질 안쪽 눈 모양"],
    ["slip","contact escape loose center",320,"石の間を抜ける","돌 사이 비집기"],
    ["lure","snatch eye atari edge",570,"弱い黒を誘い取る","약한 흑 유인"],
    ["raft","join wall escape edge",490,"二つの足場を結ぶ","두 발판 이어받기"],
    ["hover","jump flank snap diagonal",310,"側面へ跳んで待つ","옆에서 뛰어들기"],
    ["crevice","corner cut atari anchor",550,"隅の割れ目に入る","귀 이음새 파고들기"],
    ["clam","wall eye edge rescue",660,"縁に厚みを積む","변에 두터움 쌓기"],
    ["ram","contact snap cut center",520,"接触して押し返す","붙여서 밀어내기"],
    ["jaw","fork cut atari contact",400,"二本の鎖をはさむ","두 무리를 집게로 압박"],
    ["root","atari wall snap contact",450,"壁を背に押す","벽을 등진 단수"],
    ["cling","wall escape edge corner",470,"壁沿いに回り込む","벽을 따라 돌기"],
    ["pluck","snatch flank cut center",340,"孤立した石を拾う","고립된 돌 낚아채기"],
    ["peck","snap attach atari anchor",380,"直前の一石を突く","방금 둔 흑돌 쪼기"],
    ["roll","rescue wall corner join",610,"弱い連を壁で包む","약한 무리를 벽으로 감싸기"],
    ["heads","fork net join diagonal",570,"二つの筋を封じる","두 갈래 수 봉쇄"],
    ["stride","jump edge escape contact",335,"縁をまたいで走る","변을 따라 도약"],
    ["burrow","cut corner snatch edge",560,"下からつなぎを掘る","아래쪽 연결 파기"],
    ["tentacle","screen net fork contact",500,"空点を取り巻く","주변 활로 에워싸기"],
    ["quill","wall atari contact eye",600,"厚みに寄せて刺す","두터움을 이용해 찌르기"],
    ["star","diagonal fork join center",480,"斜めから二方を利かす","대각선 양방향 압박"],
    ["slide","edge escape join wall",355,"辺を滑って逃げる","변을 타고 탈출"],
    ["surface","loose center escape rescue",520,"開いた中央に浮上する","열린 중앙으로 떠오르기"],
    ["horn","atari cut snap edge",480,"切れ目に角を差す","끊김에 뿔 들이밀기"],
    ["tusk","snatch join contact edge",610,"取り跡につながる","따낸 자리에 이어가기"],
    ["glide","diagonal jump loose flank",340,"斜めの空き地へ飛ぶ","빈 대각선으로 활강"],
    ["branch","join fork wall center",540,"枝を合わせ両方利かす","이어 양쪽에 힘 싣기"],
    ["bulwark","rescue anchor wall corner",690,"もっとも弱い味方を守る","가장 약한 아군 구출"],
    ["ribbon","flank loose diagonal edge",580,"石の外縁をたどる","성긴 돌 바깥 돌아가기"],
    ["echo","cut flank snap diagonal",370,"脇の切れ目を探る","옆쪽 끊는 자리 탐색"],
    ["crane","escape jump center diagonal",420,"中央へ長く伸びる","중앙으로 길게 탈출"],
    ["sweep","net flank jump center",490,"出口を広く覆う","밖에서 출구 포위"],
    ["feint","eye cut flank snatch",440,"眼形から切り違う","눈 모양에서 비껴 끊기"],
    ["bear","contact wall snatch anchor",680,"厚みをまとって圧迫する","벽에 붙여 압박"]
  ];
  const profiles=rows.map(([id,keys,delay,ja,ko])=>({id,keys:keys.split(" "),delay,cue:[ja,ko]}));
  const width=9,black=1,white=2;
  const distance=(a,b)=>Math.abs(a%width-b%width)+Math.abs(Math.floor(a/width)-Math.floor(b/width));
  const edge=p=>Math.min(p%width,8-p%width,Math.floor(p/width),8-Math.floor(p/width));

  // The same chain must count once when a move touches it from two directions.
  function chains(board,points,color,group){
    const found=[],visited=new Set();
    for(const p of points){
      if(board[p]!==color||visited.has(p))continue;
      const chain=group(board,p);
      for(const stone of chain.stones)visited.add(stone);
      found.push({p,...chain});
    }
    return found;
  }
  function localReplies(state,mission,justPlayed,engine){
    const {neighbors,group,play}=engine,near=new Set();
    // Include both walls around the marked chains, their tactical intersections
    // and any immediately capturable adjacent attacker. Ignore far-away noise.
    for(const target of mission.targets){
      const targetGroup=group(state.board,target);
      for(const stone of targetGroup.stones){
        near.add(stone);
        for(const n of neighbors[stone]){
          near.add(n);for(const q of neighbors[n])near.add(q);
          if(state.board[n]===black){
            const attacker=group(state.board,n);
            if(attacker.liberties.size===1)near.add([...attacker.liberties][0]);
          }
        }
      }
    }
    const out=[];
    for(const point of near){
      const next=play(state,point,white);
      if(next)out.push({point,state:next});
    }
    return out;
  }
  function features(from,after,p,mission,justPlayed,engine){
    const {neighbors,group,play,solved}=engine;
    const target=mission.targets[0],board=from.board,next=after.board;
    const friendly=chains(board,neighbors[p],white,group),enemy=chains(board,neighbors[p],black,group);
    const own=group(next,p);
    const anchor=next[target]===white?group(next,target):null;
    const endangered=enemy.filter(c=>next[c.p]===black&&group(next,c.p).liberties.size===1&&c.liberties.size>1);
    const rescued=friendly.filter(c=>c.liberties.size===1&&own.liberties.size>=2);
    const nearTarget=anchor&&anchor.stones.has(p);
    const prior=board[target]===white?group(board,target):null;
    const dx=p%width-target%width,dy=Math.floor(p/width)-Math.floor(target/width);
    const ax=justPlayed%width-target%width,ay=Math.floor(justPlayed/width)-Math.floor(target/width);
    const enclosure=neighbors[p].filter(q=>board[q]===white).length;
    const cut=mission.kind==="link"&&board[target]===black?play(from,p,black):null;
    const marked=group(board,target);
    const screened=[...marked.liberties].filter(q=>q!==p&&distance(q,p)<=1).length;
    // Eye counts local support around an intersection. It requires no life/death search.
    return {
      snatch:after.captured.length,snap:Number(after.captured.includes(justPlayed)),attach:Number(distance(p,justPlayed)===1),screen:screened,
      fork:Number(endangered.length>=2)*endangered.length,atari:endangered.reduce((a,c)=>a+c.stones.size,0),
      cut:((cut&&solved(cut.board,mission))?10:0)+Math.max(0,enemy.length-1),
      join:Math.max(0,friendly.length-1),rescue:rescued.reduce((a,c)=>a+c.stones.size,0),
      anchor:Number(nearTarget),escape:anchor?anchor.liberties.size-(prior?.liberties.size||0):own.liberties.size,
      wall:friendly.reduce((a,c)=>Math.max(a,c.stones.size),0),eye:enclosure>=2?enclosure:0,
      net:endangered.length+enemy.filter(c=>c.liberties.size===2).length,contact:enemy.length,
      jump:Number(distance(p,target)===2&&distance(p,justPlayed)>=2),loose:neighbors[p].filter(q=>!next[q]).length,
      diagonal:Number(Math.abs(dx)===1&&Math.abs(dy)===1),flank:Math.abs(dx*ay-dy*ax),
      center:edge(p),edge:-edge(p),corner:-Math.min(distance(p,0),distance(p,8),distance(p,72),distance(p,80)),
      safe:Number(own.liberties.size>1),targetCapture:Number(mission.targets.some(q=>board[q]===black&&after.captured.includes(q)))
    };
  }
  function plan(species,state,mission,justPlayed,turns,engine){
    const profile=profiles[species];
    if(!profile)throw new RangeError("Unknown expedition species");
    if(mission.guardian)throw new Error("Guardians use the guardian rules");
    const tactical=mission.kind==="capture"||mission.kind==="read";
    const all=tactical?engine.replies(state,mission,turns,justPlayed):localReplies(state,mission,justPlayed,engine);
    const holds=tactical&&turns>0&&all.every(r=>r.canWin);
    const result={holds,delay:profile.delay,profile};
    if(holds)result.defenses=all;
    // Always select a refutation when one exists, even if pass is the sole refutation.
    const refutations=tactical?all.filter(r=>!r.canWin):[];
    const pool=refutations.length?refutations:all;
    const placed=pool.filter(r=>r.point>=0);
    if(!placed.length)return {...result,reply:pool[0]};
    const scored=placed.map(r=>({r,f:features(state,r.state,r.point,mission,justPlayed,engine)}));
    // A demonstrable counter to the failed objective takes precedence over flavor.
    function priority(f){
      if(mission.kind==="escape")return [f.targetCapture];
      if(mission.kind==="link")return [Number(f.cut>=10),f.targetCapture];
      if(mission.kind==="liberty"||mission.kind==="atari")return [Number(f.escape>0)];
      return [];
    }
    const vector=o=>[...priority(o.f),...profile.keys.map(k=>o.f[k]),o.f.safe,-distance(o.r.point,mission.targets[0]),-o.r.point];
    const best=scored.map(o=>({r:o.r,v:vector(o)})).sort((a,b)=>{
      for(let i=0;i<a.v.length;i++)if(a.v[i]!==b.v[i])return b.v[i]-a.v[i];
      return 0;
    })[0];
    return {...result,reply:best.r};
  }
  return {profiles,plan};
})();
