"use strict";
const Fortress=(()=>{
  const wording={
    rehearsal:["砦の戦術を試す","요새 전술 재연"],
    fork:["黒二つをつなぐ。南は盾へ、東は逃げ道へ。","두 흑돌을 잇자. 남쪽은 방패, 동쪽은 탈출로로 이어진다."],
    southAtari:["南の水門 · 印の白を逃げられないアタリに。","남쪽 수문 · 표시한 백을 빠져나올 수 없는 단수로."],
    eastAtari:["東の水路 · 逃げ道が二つ。印の白をアタリに。","동쪽 수로 · 두 갈래 탈출로에서 표시한 백을 단수로."],
    shield:["盾の留め金 · 印の白を一手で取る。","방패 빗장 · 표시한 백을 한 수에 따내자."],
    chase:["逃げる盾 · 白の応手を読み、二手で印の白を取る。","달아나는 방패 · 백의 응수를 읽고 두 수 안에 표시한 백을 따자."],
    last:["残り一手 · 印の白を取り、盾を割る。","남은 한 수 · 표시한 백을 따서 방패를 깨자."],
    escaped:["白が水門を抜けた。反撃の地点を確かめよう。","백이 수문을 빠져나갔다. 반격한 자리를 확인하자."],
    shattered:["留め金が外れ、盾が割れた。","빗장이 풀리고 방패가 갈라졌다."]
  };
  let route=0;
  const isHere=()=>level===9&&journey()&&(!trial||trial.fortress);
  function stage(exercise,practice){
    const s=Expedition.stage(9,exercise);
    if(route===1){s.phases[1]={...exercise(5,7),kind:"atari",turns:1,guardian:true};
      s.phases[2]={...exercise(5,9),kind:"capture",turns:2,guardian:true,fortressRead:true};}
    if(practice)s.phases=s.phases.slice(0,3);
    return s;
  }
  function begin(round,practice){
    if(round===0)route=0;
    else if(!practice&&saved.expedition===9)route=saved.fortRoute===1?1:0;
  }
  function connection(p){
    route=p===41?1:0;
    if(!trial&&saved.expedition===9)saved.fortRoute=route;
  }
  function objective(){
    if(!isHere()||phase>2)return "";
    return localizedPair(wording[phase===0?"fork":phase===1?route?"eastAtari":"southAtari":!route?"shield":turns===1?"last":"chase"]);
  }
  function story(){
    if(!isHere()||phase>2)return null;
    if(mode==="retry")return wording.escaped;
    if(phase===2&&(mode==="phase"||mode==="won"))return wording.shattered;
    if(phase===0&&mode!=="phase")return ["精霊が水門の間にいる。どちらの岸へ渡す？","정령이 두 수문 사이에 갇혔다. 어느 강가로 건너게 할까?"];
    if(phase===0)return route?["東の鎖が外れた。番人は逃げ込む水路を探す。","동쪽 사슬이 풀렸다. 수문장이 빠져나갈 물길을 찾는다."]:["南の渡し板が降りた。盾の留め金がこちらを向いた。","남쪽 널판이 내려왔다. 방패의 빗장이 이쪽을 향했다."];
    if(phase===1)return route?["東の排水路は二股だ。白は空いた方へ走る。","동쪽 배수로는 두 갈래다. 백은 열린 쪽으로 달아난다."]:["南の水車が止まった。鈴の鎖で白を足止めしよう。","남쪽 물레가 멈췄다. 종사슬로 백의 발을 묶자."];
    return route?["番人は盾を滑らせた。追い込んで最後の留め金を外そう。","수문장이 방패를 밀어냈다. 몰아붙여 마지막 빗장을 빼자."]:["盾の要は一つ。離れた白石は囮だ。","방패의 빗장은 하나. 멀리 떨어진 백돌은 미끼다."];
  }
  const ownsShield=()=>isHere()&&phase>=0&&phase<=2;
  const shieldTile={width:72,height:88};
  let shieldArt;
  function shieldImage(){
    if(!shieldArt){
      shieldArt=new Image();
      shieldArt.src="./fortress-shield.png";
    }
    return shieldArt;
  }
  function shieldState(){
    if(!ownsShield())return null;
    const success=mode==="phase"||mode==="won"||mode==="matchReady";
    const cracked=success&&phase<2&&solved(state.board,mission);
    const marked=mission.targets;
    // The last black play must actually have removed the marked white group.
    // A remote capture or a white counter can also remove a stone during this phase.
    const broken=phase===2&&success&&mission.kind==="capture"&&marked.length>0&&
      marked.every(p=>mission.board[p]===white&&state.board[p]!==white)&&
      marked.some(p=>state.captured?.includes(p));
    return {damage:Math.min(2,phase+Number(cracked)),cracked,broken,
      brace:mode==="waiting"||mode==="retry"||(mode==="playing"&&animation.type==="bad")};
  }
  function drawHeld(c,x,base,height,canvasHeight,damage,opacity){
    const art=shieldImage();
    if(!art.complete||!art.naturalWidth)return false;
    const {width,height:tileHeight}=shieldTile,scale=Math.min(height*.58,canvasHeight*.45)/tileHeight;
    c.save();c.imageSmoothingEnabled=false;c.globalAlpha*=opacity;
    c.translate(x,base-height*.345);c.rotate(-.055);c.scale(scale,scale);
    c.drawImage(art,damage*width,0,width,tileHeight,-width/2,-tileHeight/2,width,tileHeight);
    c.restore();return true;
  }
  return {wording,isHere,stage,begin,connection,objective,story,drawHeld,ownsShield,shieldState,get route(){return route;}};
})();
