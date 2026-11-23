"use strict";
function makeMatchRules(){
  const letters="ABCDEFGHJKLMNOPQRST",cache=new Map();
  const visits=[2,4,8,16,48,128,512,1600];
  const komi=[.5,2.5,4.5,6.5,6.5,7.5,7.5,7.5];
  function near(n){
    if(!cache.has(n))cache.set(n,Array.from({length:n*n},(_,p)=>[p-n,p+n,p%n?p-1:-1,(p+1)%n?p+1:-1].filter(i=>i>=0&&i<n*n)));
    return cache.get(n);
  }
  const coordinate=(n,p)=>p<0?"pass":letters[p%n]+(n-Math.floor(p/n));
  function point(n,coord){
    if(coord==="pass")return -1;
    const m=/^([A-HJ-T])([1-9]|1[0-9])$/.exec(coord);
    if(!m||letters.indexOf(m[1])>=n||Number(m[2])>n)return -2;
    return (n-Number(m[2]))*n+letters.indexOf(m[1]);
  }
  function chain(board,p,adj){
    const cells=new Set([p]),libs=new Set();
    for(const i of cells)for(const q of adj[i]){
      if(board[q]===board[p])cells.add(q);else if(!board[q])libs.add(q);
    }
    return {cells,libs};
  }
  function empty(n){
    const board=new Uint8Array(n*n);
    return {n,board,side:1,history:new Set([board.join("")]),passes:0,last:-1,taken:0};
  }
  function move(state,p){
    if(state.passes===2)return null;
    if(p===-1)return {...state,side:3-state.side,passes:state.passes+1,last:p,taken:0};
    if(!Number.isInteger(p)||p<0||p>=state.board.length||state.board[p])return null;
    const board=state.board.slice(),side=state.side,adj=near(state.n);
    board[p]=side;let taken=0;
    for(const q of adj[p])if(board[q]===3-side){
      const g=chain(board,q,adj);
      if(!g.libs.size){for(const i of g.cells)board[i]=0;taken+=g.cells.size;}
    }
    if(!chain(board,p,adj).libs.size)return null;
    const key=board.join("");if(state.history.has(key))return null;
    const history=new Set(state.history);history.add(key);
    return {n:state.n,board,side:3-side,passes:0,last:p,taken,history};
  }
  function replay(n,sequence){
    let state=empty(n);
    for(const item of sequence){
      const p=typeof item==="string"?point(n,item):item,next=move(state,p);
      if(!next)throw Error("Illegal move "+item);state=next;
    }
    return state;
  }
  // Reopen the count without changing stones or the repetition history.
  // Keep White's offer if Black was the second player to pass.
  function resumeLine(state,line){
    if(state.passes!==2||line.at(-1)!==-1)return null;
    const passes=state.side===1?2:1;
    if(passes===2&&line.at(-2)!==-1)return null;
    return line.slice(0,-passes);
  }
  function territory(state){
    const board=state.board,adj=near(state.n),seen=new Set(),area=new Uint8Array(board.length),counts=[0,0,0];
    for(let p=0;p<board.length;p++){
      if(board[p]){counts[board[p]]++;continue;}
      if(seen.has(p))continue;
      const region=new Set([p]),border=new Set();seen.add(p);
      for(const i of region){for(const q of adj[i])if(board[q])border.add(board[q]);else if(!seen.has(q)){seen.add(q);region.add(q);}}
      const owner=border.size===1?[...border][0]:0;
      for(const i of region)area[i]=owner;
      counts[owner]+=region.size;
    }
    return {area,black:counts[1],white:counts[2],neutral:counts[0]};
  }
  function score(state,extra){
    const result=territory(state);return {...result,margin:result.black-result.white-extra};
  }
  // Offline opponent ranks legal moves by local capture, connection, territory and a bounded reply search.
  function options(state,rank){
    const adj=near(state.n),side=state.side,b=state.board,areas=territory(state).area,picks=[];
    const groups=new Map();
    for(let p=0;p<b.length;p++)if(b[p]&&!groups.has(p)){const g=chain(b,p,adj);for(const i of g.cells)groups.set(i,g);}
    for(let p=0;p<b.length;p++){
      if(b[p])continue;
      const ally=new Set(),foe=new Set();
      for(const q of adj[p])if(b[q]){(b[q]===side?ally:foe).add(groups.get(q));}
      if(!ally.size&&!foe.size&&areas[p]!==0)continue;
      const escape=[...ally].filter(g=>g.libs.size===1).reduce((s,g)=>s+g.cells.size,0);
      const take=[...foe].filter(g=>g.libs.size===1).reduce((s,g)=>s+g.cells.size,0);
      if(areas[p]===side&&!escape&&!take)continue;
      const next=move(state,p);if(!next)continue;
      const shape=chain(next.board,p,adj);
      const attack=[...foe].reduce((s,g)=>s+(g.libs.size===2?Math.min(4,g.cells.size):0),0);
      const edge=Math.min(p%state.n,state.n-1-p%state.n,Math.floor(p/state.n),state.n-1-Math.floor(p/state.n));
      let value=take*11+escape*(shape.libs.size>1?7:0)+attack*2+(ally.size>1?2:0)+(areas[p]===0?3:0);
      value+=Math.min(4,shape.libs.size)*.32+Math.min(3,edge)*.35;
      if(areas[p]===3-side)value-=4;
      if(shape.libs.size===1&&!take)value-=7+shape.cells.size*4;
      if(!ally.size&&!foe.size)value-=1.5;
      if(value>.15)picks.push({p,value,next});
    }
    picks.sort((a,b)=>b.value-a.value||a.p-b.p);
    return picks.slice(0,2+rank);
  }
  function* searchSteps(state,rank,extra){
    if(state.passes===1&&score(state,extra).margin*(state.side===1?1:-1)>0)return -1;
    const moves=options(state,rank);if(!moves.length)return -1;
    if(rank<2)return moves[0].p;
    for(const item of moves){
      yield;
      const replies=options(item.next,Math.min(3,rank));
      if(replies.length)item.value-=.7*replies[0].value;
      if(rank>=5&&replies[0]){
        const counter=options(replies[0].next,1)[0];
        if(counter)item.value+=.35*counter.value;
      }
    }
    moves.sort((a,b)=>b.value-a.value);
    return moves[0].value<-.5?-1:moves[0].p;
  }
  function choose(state,rank,extra){
    const search=searchSteps(state,rank,extra);
    let step=search.next();
    while(!step.done)step=search.next();
    return step.value;
  }
  async function chooseLocally(state,rank,extra,active){
    const search=searchSteps(state,rank,extra);
    while(active()){
      await new Promise(resolve=>setTimeout(resolve,0));
      if(!active())return null;
      const step=search.next();
      if(step.done)return step.value;
    }
    return null;
  }
  function entry(game,depth){
    const cut=[0,8,20][depth];if(cut===undefined)throw Error("Unknown entry");
    return {...game,start:game.start.slice(0,Math.max(2,game.start.length-cut))};
  }
  const budget=(rank,depth)=>Math.min(1600,visits[rank]*(depth+1));
  return {visits,komi,budget,entry,coordinate,point,near,move,replay,score,resumeLine,choose,chooseLocally};
}
const MatchRules=makeMatchRules();
if(typeof module!=="undefined")module.exports=MatchRules;
