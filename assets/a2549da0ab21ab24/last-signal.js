// Two separate marked groups, each with two completely guarded one-point eyes.
// The neutral signal intersection must stay empty throughout the line.
const LastSignal = (() => {
  const points = Array.from({length:81}, (_, p) => p);
  const ring = points.map(p => {
    const result = [], x = p % 9, y = Math.floor(p / 9);
    for (let row = Math.max(0,y-1); row <= Math.min(8,y+1); row++) {
      for (let col = Math.max(0,x-1); col <= Math.min(8,x+1); col++) {
        if (row*9+col !== p) result.push(row*9+col);
      }
    }
    return result;
  });
  // Priority changes the displayed counter and the search order, never the set.
  const blackPoints = [...new Set([2,74,78,...points])];
  const whitePoints = [...new Set([2,74,78,-1,...points])];
  function mission() {
    const rows=[
      "x...x.x..", "xxxxxxx..", ".......x.", "......xo.", ".......x.",
      ".........", ".........", "xxxxxxxxx", "x...x...x"
    ];
    const board=Array.from(rows.join(""),stone => stone==="x"?1:stone==="o"?2:0);
    return {board,targets:[9,63],kind:"signal",tactic:"S",guardian:true,turns:2,signalPoint:5,
      lesson:["二つの黒に二眼ずつ作り、信号点は空けておこう。","두 흑 무리에 두 눈씩 만들고 신호점은 비워 두세요."]};
  }
  function inspect(board,m) {
    const [upper,lower]=m.targets;
    const chains=m.targets.map(p => board[p]===1 ? group(board,p) : null);
    const separate=!!(chains[0] && chains[1] && !chains[0].stones.has(lower) && upper!==lower);
    const eyes=chains.map(chain => chain ? [...chain.liberties].filter(p => ring[p].every(q=>chain.stones.has(q))).sort((a,b)=>a-b) : []);
    const signalOpen=board[m.signalPoint]===0;
    return {eyes,separate,signalOpen,won:separate && signalOpen && eyes.every(groupEyes => groupEyes.length>=2)};
  }
  function hasWin(state,m,turns) {
    if (turns<1 || state.board[m.signalPoint]) return false;
    if (turns===1) return blackPoints.some(p => {
      const next=play(state,p,1);
      return !!next && inspect(next.board,m).won;
    });
    return blackPoints.some(p => move(state,m,turns,p).win);
  }
  function responses(state,m,turns) {
    const result=[];
    for (const point of whitePoints) {
      const next=play(state,point,2);
      if (next) result.push({point,state:next,canWin:hasWin(next,m,turns)});
    }
    return result;
  }
  function move(state,m,turns,point) {
    if (!Number.isInteger(point)||point<0||point>=81||turns<1) return {legal:false,win:false};
    const attack=play(state,point,1);
    if (!attack) return {legal:false,win:false};
    if (!state.board[m.signalPoint] && inspect(attack.board,m).won) return {legal:true,win:true,done:true,attack};
    let reply=null;
    for (const q of whitePoints) {
      const next=play(attack,q,2);
      if (!next) continue;
      const option={point:q,state:next};
      if (turns===1 || state.board[m.signalPoint] || attack.board[m.signalPoint] || !hasWin(next,m,turns-1)) {
        return {legal:true,win:false,done:false,attack,reply:option};
      }
      if (!reply) reply=option;
    }
    return {legal:true,win:true,done:false,attack,reply};
  }
  return Object.freeze({mission,inspect,move,hasWin,replies:responses});
})();
