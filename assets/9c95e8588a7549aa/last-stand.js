const LastStand=(()=>{
  // Only the original chapter's three single-answer lesson fights receive this defense.
  // #7 already continues into its own scored nine-line duel.
  const encounters={
    0: {at:[1,2],shape:[" .    ","..Wo.."],cue:["岩角が土手を駆ける。二股の出口を先に塞ごう。","바위뿔이 둑을 달린다. 두 갈래 출구부터 막자."]},
    1: {at:[2,1],shape:["    ..","    . ",".Wooo ",".     "],cue:["カワセミが葦の陰へ潜る。白の飛び出す先を読もう。","물총새가 갈대 사이로 숨는다. 백이 빠져나올 곳을 읽자."]},
    2: {at:[1,2],shape:[".    ",".Wo..","  o  "],cue:["センザンコウが石垣に沿って丸まった。残る隙間を追おう。","천산갑이 돌담을 따라 몸을 말았다. 남은 틈을 쫓자."]},
    3: {at:[1,1],shape:["  .. ","  .  ","  W  ","  oo.","    ."],cue:["イモリの尾が曲がり角を抜ける。逃げ石の呼吸点を追え。","도롱뇽 꼬리가 굽이를 돈다. 달아나는 백의 활로를 쫓자."]},
    5: {at:[1,3],shape:["    .","..Wo.","   o "],cue:["フクロウが枝を渡る。白が選んだ枝先を押さえよう。","올빼미가 가지를 건넌다. 백이 고른 가지 끝을 막자."]},
    7: {at:[1,2],shape:[".    ",".Wooo","    .","    ."],cue:["祠亀が長い石壁で身を守る。両端の出口を見よう。","사당 거북이 긴 돌담에 몸을 붙인다. 양끝 출구를 살피자."]},
    8: {at:[2,2],shape:["..   "," .W  ","  oo..","   o  ","   o  "],cue:["苔冠の鹿が石段を下る。角の脇の白を追い詰めよう。","이끼관 사슴이 돌계단을 내려간다. 뿔 옆의 백을 몰자."]},
    10:{at:[1,1],shape:["   ..","   . ","..Wo ","   o "],cue:["ヤドカリが殻の下を横切る。二つの窓を順に閉じよう。","소라게가 껍데기 아래로 지난다. 두 창을 차례로 닫자."]},
    11:{at:[1,2],shape:[" .    "," .Wooo"," .   .","     ."],cue:["野ばら兎が抜け道を探す。白石が跳ねる先を読もう。","들장미 토끼가 샛길을 찾는다. 백이 뛰어들 자리를 읽자."]},
    12:{at:[2,1],shape:["    ."," .. .","  W o","  ooo"],cue:["カマキリが葦を折り曲げる。折れた列の端を押さえよう。","사마귀가 갈대를 꺾는다. 꺾인 줄의 끝을 막자."]},
    13:{at:[1,2],shape:[" .    ","..Wooo","     .","     ."],cue:["岩角が曲がった桟道に逃げた。二股を見失わないで。","바위뿔이 굽은 잔도로 달아났다. 갈라지는 틈을 살피자."]}
  };
  const has=id=>Object.hasOwn(encounters,id);
  function mission(id){
    const e=encounters[id],board=Array(81).fill(0),inside=new Set(),targets=[];
    e.shape.forEach((row,y)=>[...row].forEach((c,x)=>{
      if(c===" ")return;
      const p=(y+e.at[1])*9+x+e.at[0];inside.add(p);
      if(c==="W")targets.push(p);
      if(c==="W"||c==="o")board[p]=2;
    }));
    for(const p of inside)for(const q of neighbors[p])if(!inside.has(q))board[q]=1;
    return {kind:"read",turns:2,board,targets,guardian:true,lastStand:true};
  }
  const key=id=>CampaignSlots.key+".last-defense."+CampaignSlots.id+"."+id;
  function load(id){
    try{return JSON.parse(localStorage.getItem(key(id)));}catch{return null;}
  }
  function store(id,record){
    try{if(record)localStorage.setItem(key(id),JSON.stringify(record));else localStorage.removeItem(key(id));}catch{}
  }
  function restoreOpening(m,point){
    if(!Number.isInteger(point)||point<0||point>=81)return null;
    const verdict=guardianMove({board:m.board,previous:null},m,2,point);
    return verdict.win&&!verdict.done?verdict.reply:null;
  }
  return Object.freeze({has,mission,encounters,load,store,restoreOpening});
})();
