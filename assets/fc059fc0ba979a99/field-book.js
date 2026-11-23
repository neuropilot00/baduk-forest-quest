"use strict";
// One slot owns a disjoint lane in the immutable v4 bank. A round's reservation and
// each successful reading have independent storage keys; two tabs cannot overwrite an
// unrelated stage's record. The portable book uses the same canonical board identities.
const FieldBook=(()=>{
  const alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
  const kinds=["liberty","capture","link","escape","atari","signal"];
  const memory=new Map(),knownBoards=new Map(),trainingKeys=new Map();
  let fixedShapes=null, consent=null, heldPrefix=null, heldCodes=null;
  // Other tabs can reserve rounds for this campaign while this tab is open.
  addEventListener("storage",e=>{if(e.key===null||heldPrefix&&e.key.startsWith(heldPrefix+"p"))heldPrefix=null;});
  const prefix=()=>CampaignSlots.key+".reading.v1."+CampaignSlots.id+".";
  function read(k){const p=prefix()+k;try{return localStorage.getItem(p)??memory.get(p)??null;}catch{return memory.get(p)??null;}}
  function put(k,v){const p=prefix()+k;try{localStorage.setItem(p,v);}catch{/* Keep the current game playable when browser storage is unavailable. */}memory.set(p,v);
    if(k[0]==="p"&&heldPrefix===prefix())heldCodes.add(rawCode(Number(v)));
  }
  function entries(){
    const start=prefix(),all=new Map();
    for(const [k,v] of memory)if(k.startsWith(start))all.set(k.slice(start.length),v);
    try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(start))all.set(k.slice(start.length),localStorage.getItem(k));}}catch{}
    return all;
  }
  function canonical(m,side=m.side??1){
    const kind=m.kind==="read"?"capture":m.kind,anchor=["escape","liberty","atari"].includes(kind);
    const target=new Set(m.targets),points=[];
    m.board.forEach((stone,p)=>{
      const mark=(target.has(p)?4:0)+(anchor&&m.targets.length>1&&p===m.targets[0]?8:0)+(m.signalPoint===p?16:0);
      if(stone||mark)points.push([p%9,p/9|0,stone,stone+mark]);
    });
    let shape=null,diagram=null;
    for(let t=0;t<8;t++){
      const cells=points.map(([x,y,col,mark])=>{
        if(t&1)[x,y]=[y,x];return [t&2?-x:x,t&4?-y:y,col,mark];
      });
      const xmin=Math.min(...cells.map(p=>p[0])),ymin=Math.min(...cells.map(p=>p[1]));
      const xstone=Math.min(...cells.filter(p=>p[2]).map(p=>p[0])),ystone=Math.min(...cells.filter(p=>p[2]).map(p=>p[1]));
      function pack(originX,originY,at){
        // Each occupied or marked point uses one coordinate byte and one color/mark byte.
        return cells.filter(p=>p[at]).map(p=>{
          const point=(p[1]-originY)*9+p[0]-originX;
          return String.fromCharCode(65+point)+alphabet[p[at]];
        }).sort().join("");
      }
      const s=pack(xstone,ystone,2),d=pack(xmin,ymin,3);
      if(shape===null||s<shape)shape=s;if(diagram===null||d<diagram)diagram=d;
    }
    const guard=!!m.guardian&&!(kind==="capture"&&m.turns===1);
    return {shape, key:side+":"+kinds.indexOf(kind)+":"+m.turns+":"+Number(guard)+Number(!!m.fortressRead)+(m.requiresCapture?"r":"")+":"+btoa(diagram)};
  }
  function exclusions(){
    if(fixedShapes)return fixedShapes;
    const set=new Set(),add=m=>set.add(canonical(m).shape);
    for(let id=0;id<320;id++){
      const stage=id<80?Expedition.stage(id,exercise):id<100?ReachPuzzles.stage(id-80):OuterPuzzles.stage(id);
      stage.phases.forEach(add);
      if(LastStand.has(id))add(LastStand.mission(id));
      if(id>=20&&id<40)Expedition.stage(id,exercise,true).phases.forEach(add);
      if(id>=80&&id<100)ReachPuzzles.stage(id-80,true).phases.forEach(add);
    }
    Fortress.stage(exercise,false,1).phases.forEach(add);
    for(const route of [1,2]){
      for(const phase of [0,1])add(ReachFork.position(route,phase).mission);
      for(let r=0;r<11;r++)add(OuterCrossings.position(r,route).mission);
    }
    fixedShapes=set;return set;
  }
  const radix=4096,libertyFlag=32768;
  function decode(code){
    const n=code%libertyFlag,course=Math.floor(n/radix),serial=n%radix;
    if(!Number.isInteger(code)||code<0||code>=2*libertyFlag||course<1||course>=courseLimits.length||serial>=courseLimits[course]||(code>=libertyFlag&&course!==4))return null;
    return {course,serial,liberty:code>=libertyFlag};
  }
  function item(code){
    const {course,serial,liberty}=decode(code),m=exercise(course,serial);
    return liberty?{...m,kind:"liberty"}:m;
  }
  function identity(code){
    if(!knownBoards.has(code))knownBoards.set(code,canonical(item(code)));
    return knownBoards.get(code);
  }
  function completed(m){return read("s"+canonical(m).key)!==null;}
  function trainedKey(course,row,key){
    if(!row.solved)return false;
    const bitmap=saved.trainingSkips[course];
    let known=trainingKeys.get(course);
    if(!known||known.campaign!==CampaignSlots.id||known.bitmap!==bitmap||known.cursor>row.cursor){
      known={campaign:CampaignSlots.id,bitmap,cursor:0,keys:new Set()};
      trainingKeys.set(course,known);
    }
    for(;known.cursor<row.cursor;known.cursor++){
      if(!row.gap.has(known.cursor))known.keys.add(identity(packed(course,known.cursor,false)).key);
    }
    return known.keys.has(key);
  }
  function plan(id,round,phases){
    const offset=round-phases.length,model=phases[offset%phases.length];
    const course=offset%2===1?1:({liberty:4,capture:1,link:2,escape:3,atari:4,read:Math.min(7,3+model.turns)}[model.kind]||1);
    const serial=(1200+id*43+round*101)%courseLimits[course];
    return {course,serial,liberty:model.kind==="liberty"&&course===4};
  }
  const address=(id,round)=>id*4096+round;
  const pickKey=(id,round)=>"p"+address(id,round);
  const packed=(course,serial,liberty)=>course*radix+serial+(liberty?libertyFlag:0);
  const rawCode=value=>(value<0?-value-1:value)%libertyFlag;
  function held(){
    if(heldPrefix!==prefix()){
      heldCodes=new Set();
      for(const [k,v] of entries())if(k[0]==="p")heldCodes.add(rawCode(Number(v)));
      heldPrefix=prefix();
    }
    return heldCodes;
  }
  function search(id,round,phases,replay){
    const desired=plan(id,round,phases),fixed=exclusions(),reserved=replay?new Set():held();
    // Prefer the authored skill. If that lane has no unused examples, retain attacking
    // pressure with another capture or reading exercise instead of postponing the fight.
    const defensive=desired.course===2||desired.course===3;
    // A mandatory attack round must still be able to remove enemy HP even when
    // every unused example left in the other books is a defensive response.
    const substitutes=defensive?[2,3,1,4,5,6,7]:desired.course>=5?[6,5,7,1,4]:[1,4,5,6,7];
    const courses=[...new Set([desired.course,...substitutes])];
    for(const course of courses){
      const count=1+Math.floor((courseLimits[course]-1-id)/320);
      const training=replay?null:trainingRow(course);
      for(let j=0;j<count;j++){
        const serial=id+320*((Math.floor(desired.serial/320)+round+j)%count);
        const liberty=course===desired.course&&desired.liberty;
        const code=packed(course,serial,liberty);
        if(!replay&&(reserved.has(code%libertyFlag)||!liberty&&serial<training.cursor&&!training.gap.has(serial)))continue;
        const sig=identity(code);
        if(!fixed.has(sig.shape)&&(replay||read("s"+sig.key)===null&&(liberty||!trainedKey(course,training,sig.key))))return code;
      }
    }
    return null;
  }
  function select(id,round,phases,{replay=false,legacy=false}={}){
    const k=pickKey(id,round),stored=read(k);
    if(stored!==null){
      const value=Number(stored),code=value<0?-value-1:value;
      if(decode(code))return {...item(code),bookCode:value};
    }
    const old=plan(id,round,phases),oldCode=packed(old.course,old.serial,old.liberty);
    const code=legacy?oldCode:search(id,round,phases,replay);
    if(code!==null){if(!replay)put(k,String(code));return {...item(code),bookCode:code};}
    // A saturated skill bank never silently reissues a solved puzzle. The player may
    // opt into a labelled practice round, or leave with current expedition progress.
    const fallback=search(id,round,phases,true)??oldCode;
    return {...item(fallback),reviewOffer:{key:k,code:fallback,replay}};
  }
  function solved(m){
    if(m.reviewOffer||m.bookCode<0)return;
    const k="s"+canonical(m).key;if(read(k)===null)put(k,"1");
  }
  const waiting=m=>!!m?.reviewOffer&&consent!==m;
  addEventListener("popstate",()=>{
    const offer=document.getElementById("fieldReviewOffer");
    if(offer?.open)offer.close();
  });
  function offer(m,back,visible){
    if(waiting(m))requestAnimationFrame(()=>{if(waiting(m)&&visible()===m)allow(m,back);});
  }
  function allow(m,back){
    const pending=m?.reviewOffer;if(!pending||consent===m)return true;
    const dlg=document.getElementById("fieldReviewOffer");
    if(!dlg.open){
      const tr=pair=>GameLanguage.pair(pair,saved.locale);
      dlg.querySelector("h2").textContent=tr(["この局面の新しい問題はありません","이 국면에 남은 새 문제가 없어요"]);
      dlg.querySelector("p").textContent=tr(["復習を選ぶと、以前の問題で今の戦闘を続けられます。","복습을 선택하면 이전 문제를 풀어 지금 전투를 이어갈 수 있어요."]);
      const [leave,start]=dlg.querySelectorAll("button");leave.textContent=tr(["地図へ","지도로"]);start.textContent=tr(["復習して戦う","복습으로 전투 계속"]);
      leave.onclick=()=>{dlg.close();back();};
      start.onclick=()=>{
        consent=m;m.bookCode=-pending.code-1;
        if(!pending.replay)put(pending.key,String(m.bookCode));
        dlg.close();
      };dlg.oncancel=e=>{e.preventDefault();leave.click();};dlg.showModal();
    }
    return false;
  }
  function snapshot(){
    const seen=[],picks=[];
    for(const [k,v] of entries()){
      if(k[0]==="s")seen.push(k.slice(1));else if(k[0]==="p")picks.push([Number(k.slice(1)),Number(v)]);
    }
    return seen.length||picks.length?[seen.sort(),picks.sort((a,b)=>a[0]-b[0])]:null;
  }
  function valid(book){
    return Array.isArray(book)&&book.length===2&&Array.isArray(book[0])&&book[0].length<=16000&&
      book[0].every(k=>typeof k==="string"&&/^[12]:[0-5]:[1-4]:[01][01]r?:[A-Za-z0-9+/]{2,220}={0,2}$/.test(k))&&
      Array.isArray(book[1])&&book[1].length<=12000&&book[1].every(pair=>Array.isArray(pair)&&pair.length===2&&
        Number.isInteger(pair[0])&&pair[0]>=0&&pair[0]<320*4096&&pair[0]%4096>=3&&Number.isInteger(pair[1])&&!!decode(pair[1]<0?-pair[1]-1:pair[1]));
  }
  function currentPick(id,round){const value=read(pickKey(id,round));return value===null?null:Number(value);}
  function continuesLine(before=[],after=[]){
    return Array.isArray(before)&&Array.isArray(after)&&before.length<after.length&&
      before.every((move,i)=>JSON.stringify(move)===JSON.stringify(after[i]));
  }
  function restore(book){
    for(const k of book[0])put("s"+k,"1");
    for(const [addr,code] of book[1])if(read("p"+addr)===null)put("p"+addr,String(code));
  }
  return Object.freeze({canonical,completed,plan,select,solved,waiting,offer,allow,snapshot,valid,restore,currentPick,continuesLine});
})();
