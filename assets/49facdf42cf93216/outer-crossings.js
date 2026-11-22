"use strict";
// Two physical routes share one irreversible campaign oath. A crossing is a
// separate encounter between posts 9 and 10 and never increments a stage ID.
const OuterCrossings=(()=>{
  const routes=[
    {kind:"link",foe:101,reward:["緋色の避難吹流し","붉은 구조 바람자루"],stamp:"...22/..212/..222/...1./...1.",target:[60,62],black:[32,33,40,58,60,62],white:[31,34,41,42,44,49,50,51,53,59]},
    {kind:"capture",foe:100,reward:["真鍮の測角標","황동 측각표"],stamp:"..2../.212./22222/.212./..2..",target:[4],black:[6,13,14,16,22,23,32,33,42,43],white:[4,5,15,41]},
    {kind:"rescue",foe:121,reward:["断熱布の留輪","내열포 고리"],stamp:"..22./.2112/21112/21212/.222.",target:[25],black:[13,14,15,22,25,26,32,35,41,42,43],white:[16,17,23,24,31,34]},
    {kind:"atari",foe:120,reward:["焼印の母型","각인 원형틀"],stamp:"22222/21112/21212/21112/22222",target:[23],black:[12,13,14,29,31,32,41,48],white:[20,23,30,39,40,49]},
    {kind:"escape",foe:140,reward:["浮標の小鐘","구명부표 종"],stamp:"..1../..2../.222./21112/..2..",target:[32],black:[19,20,21,28,30,32,40,46,48,49],white:[22,23,37,39,41,47,50]},
    {kind:"read",foe:141,reward:["潮印の封筒","물때 소인 봉투"],stamp:"22222/21112/.212./..2../.222.",target:[21],black:[2,3,4,11,12,13,20,23,31,38,39,40],white:[5,21,29,30]},
    {kind:"link",foe:160,reward:["避難所の穀札","피난소 곡물표"],stamp:"..22./.2112/.2122/.2112/.2222",target:[21,39],black:[21,22,31,39],white:[11,12,18,20,28]},
    {kind:"capture",foe:162,reward:["秤屋の桝","우편 됫박"],stamp:"2...2/22222/21112/21112/.222.",target:[49],black:[32,34,40,50,51,58,59,70],white:[31,41,42,43,49,52,60,61,67]},
    {kind:"escape",foe:181,reward:["楡杭の銘板","느릅 말뚝표"],stamp:"..2../.222./.212./.212./.212.",target:[41],black:[41,49,59,65,67,69],white:[38,40,47,50,51,60,66,68]},
    {kind:"atari",foe:182,reward:["桟橋の戸鍵","우편 잔교 열쇠"],stamp:"22.../212../.2222/...2./...22",target:[40],black:[29,30,31,32,38,39,48,49,57,58,59],white:[40,41,47,55,56]},
    {kind:"link",foe:200,reward:["渡し守の灯罩","나루 등갓"],stamp:"..2../.212./21112/22222/..2..",target:[12,23],black:[12,19,23,30,31,32],white:[2,3,4,5,11,20,22,28]},
    {kind:"read",foe:201,reward:["油紙の灯窓","기름종이 등창"],stamp:"22222/21212/21112/22122/..2..",target:[32],black:[13,14,23,24,30,40,42,50],white:[12,15,16,21,32,33,41,48,49]},
    {kind:"rescue",foe:220,reward:["対の靴札","한 쌍 장화표"],stamp:"...../.2.2./.2.2./22.22/22.22",target:[41],black:[41,49,50,57,60,61,70,77,78],white:[40,42,43,48,51,58,59,68,69,76]},
    {kind:"capture",foe:221,reward:["水色の消印","물빛 소인"],stamp:".222./.212./..2../22222/.222.",target:[50],black:[42,49,52,58,59,60,67,70],white:[39,43,48,50,51,75,77,79]},
    {kind:"link",foe:241,reward:["山綱の笛","구조줄 호각"],stamp:"...2./..212/.222./.22../22...",target:[33,43],black:[33,40,41,43,44,52,60,69,70],white:[31,32,35,49,50,51,53,59,62]},
    {kind:"read",foe:242,reward:["速達の竹樋","급송 대홈통"],stamp:"...22/..212/.212./212../22...",target:[49],black:[47,48,50,51,57,59,60,65,66,75,76,78],white:[49,67,74]},
    {kind:"escape",foe:260,reward:["名簿の刷毛","명부용 솔"],stamp:"...1./...1./..21./.222./2222.",target:[48],black:[32,33,48,50,58],white:[30,31,42,49,52,57,59]},
    {kind:"atari",foe:261,reward:["滲み止めの紙押え","번짐막이 문진"],stamp:"...../..2../.212./21112/22222",target:[75],black:[41,42,43,49,50,52,59,66,67,68],white:[39,58,60,61,69,70,75,76]},
    {kind:"rescue",foe:280,reward:["渡舟の一人錘","나룻배 인원추"],stamp:"..2../.212./..2../.212./22222",target:[70],black:[41,44,50,60,68,70,79],white:[52,61,62,69,78,80]},
    {kind:"read",foe:281,reward:["郵袋の検量札","우편 검량표"],stamp:"22222/21.12/2.212/21112/.222.",target:[3],black:[12,13,14],white:[3,4,15,21,23,31]},
    {kind:"link",foe:302,reward:["帰岸の灯芯","귀향 등심지"],stamp:"..2../.212./.212./..1../.222.",target:[10,18],black:[10,18,29,30,39],white:[12,21,28,36,38]},
    {kind:"read",foe:301,reward:["手渡しの戸環","손편지 문고리"],stamp:"..2../.222./21.12/21.12/.222.",target:[75],black:[47,48,55,66,67,73],white:[38,39,40,46,56,75,76]}
  ];
  const descriptions={
    link:["印の黒を一手でつなぐ。白の返しにも切られない形へ。","표시한 흑을 한 수로 이으세요. 백이 응수해도 연결이 남아야 해요."],
    escape:["印の黒を呼吸点三つ以上へ。白の応手の後も二つ守る。","표식 흑의 활로를 세 개 이상으로 늘리세요. 백의 응수 뒤에도 두 개가 남아야 해요."],
    rescue:["白を取り、同じ一手で印の黒を呼吸点三つ以上へ逃がす。","백을 따내는 바로 그 수로 표시한 흑의 활로를 세 개 이상 만드세요."],
    capture:["印の白い一団をこの一手で取る。","표시한 흰 무리를 이 한 수로 따내세요."],
    atari:["印の白をアタリに。白のどの返しにも次に取れる形へ。","표식 백을 단수로 모세요. 백이 어느 곳에 받아도 다음에 딸 수 있어야 해요."],
    read:["白の返しを読んで、黒二手以内に印の白を取る。","백의 반격을 읽고 흑 두 수 안에 표시한 백을 따내세요."]
  };
  const card=(region,route)=>Number.isInteger(region)&&region>=0&&region<11&&(route===1||route===2)?routes[2*region+route-1]:null;
  const reward=(region,route)=>card(region,route)?.reward||null;
  const required=(region,s)=>CrossingLog.required(region,s),done=(region,s)=>CrossingLog.cleared(region,s);
  function position(region,route){
    const spec=card(region,route);if(!spec)return null;
    const board=Array(81).fill(0);
    for(const p of spec.black)board[p]=1;for(const p of spec.white)board[p]=2;
    const mission={kind:spec.kind==="rescue"?"escape":spec.kind,turns:spec.kind==="read"?2:1,targets:spec.target.slice(),board:board.slice(),guardian:true,requiresCapture:spec.kind==="rescue"};
    return {state:{board,previous:"",captured:[]},mission,turns:mission.turns};
  }
  function judge(region,route,field,p){
    const spec=card(region,route),v=guardianMove(field.state,field.mission,field.turns,p);
    if(v.win&&spec.kind==="rescue"&&!v.attack.captured.length)return {...v,win:false,done:false,needsCapture:true};
    return v;
  }
  function stamp(c,region,route,x,y,size){
    const spec=card(region,route);if(!spec)return;
    const rows=spec.stamp.split("/"),unit=size/5,ink=route===1?"#633c29":"#254e63",face=route===1?"#ffc77d":"#bde1e7";
    c.save();for(let j=0;j<5;j++)for(let i=0;i<5;i++)if(rows[j][i]!=="."){
      c.fillStyle=rows[j][i]==="1"?ink:face;c.fillRect(x+i*unit,y+j*unit,unit+.2,unit+.2);
    }c.restore();
  }
  const by=id=>document.getElementById(id),say=(ja,ko)=>localizedPair([ja,ko]);
  let dialog,ctx=null,after=null,timer=0,idle=0,raf=0,epoch=0;
  const key=()=>CampaignSlots.session("bfq-outer-crossing");
  function pending(){
    try{const q=JSON.parse(sessionStorage.getItem(key()));return q&&q.c===CampaignSlots.id&&card(q.region,q.route)&&Array.isArray(q.moves)&&q.moves.length<=2?q:null;}catch{return null;}
  }
  function remember(){
    if(!ctx)return;
    try{sessionStorage.setItem(key(),JSON.stringify({c:CampaignSlots.id,region:ctx.region,route:ctx.route,moves:ctx.moves}));}catch{}
  }
  function activate(region,route,cb,moves=[]){
    if(!card(region,route)||!CrossingLog.eligible(region,saved)||OuterCampaign.route(saved)!==route||dialog?.open)return false;
    install();const f=position(region,route);
    ctx={...f,region,route,moves:[],mode:"playing",last:null,reply:null,pose:"idle",at:0,message:""};after=typeof cb==="function"?cb:null;epoch++;
    dialog.showModal();if(history.state?.outerCross!==region)history.pushState({...history.state,outerCross:region},"");
    // A suspended turn is replayed through the rules. Inventory is only settled by the winning action.
    for(const p of moves){if(ctx.mode!=="playing"||!Number.isInteger(p)||p<0||p>=81)break;const v=judge(region,route,ctx,p);if(!v.legal)break;
      ctx.moves.push(p);settleBoard(v,p);if(ctx.mode==="earned"&&!done(region,saved))ctx.mode="claim";}
    if(ctx.mode==="earned")ctx.message=localizedPair(OuterStory.forks(region)[route-1].after);
    remember();render();by("crossBack").focus({preventScroll:true});return true;
  }
  function enter(region,onWin,requested=OuterCampaign.route(saved)){return activate(region,requested,onWin);}
  function resume(region,onWin){const a=pending();return a?.region===region&&activate(region,a.route,onWin,a.moves);}
  function leave(){
    if(!dialog?.open)return;
    epoch++;clearTimeout(timer);clearTimeout(idle);cancelAnimationFrame(raf);const old=ctx,callback=after;
    dialog.close();ctx=null;after=null;try{sessionStorage.removeItem(key());}catch{}
    if(old?.mode==="earned"&&callback)callback(old.region,old.route);
  }
  function close(){if(!dialog?.open||ctx.mode==="saving")return;if(history.state?.outerCross===ctx.region)history.back();else leave();}
  function install(){
    if(dialog)return;
    dialog=document.createElement("dialog");dialog.id="outerCrossingDialog";dialog.setAttribute("aria-labelledby","crossName");
    dialog.innerHTML='<article><header><button type="button" id="crossBack">‹</button><div><small id="crossPlace"></small><h2 id="crossName"></h2></div></header><canvas id="crossScene" width="480" height="126" aria-hidden="true"></canvas><p id="crossGoal"></p><div id="crossBoardFrame"><canvas id="crossBoard" width="540" height="540" aria-hidden="true"></canvas><canvas id="crossFX" width="540" height="540" aria-hidden="true"></canvas><div id="crossPoints" role="group"></div></div><p id="crossMessage" role="status"></p><p id="crossReward" hidden><canvas id="crossStamp" width="25" height="25" aria-hidden="true"></canvas><b></b></p><button type="button" id="crossAction" hidden></button></article>';
    document.body.append(dialog);const grid=by("crossPoints");
    for(let p=0;p<81;p++){const b=document.createElement("button");b.type="button";b.dataset.point=p;b.onclick=()=>attempt(p);grid.append(b);}
    document.addEventListener("visibilitychange",()=>{if(ctx&&!document.hidden)scene();});
    OuterFauna.ready.then(()=>{if(ctx&&dialog.open)scene();}).catch(()=>{});
    new ResizeObserver(()=>{if(dialog.open&&ctx?.mode==="earned")scene();}).observe(by("crossScene"));
    grid.addEventListener("focusin",e=>{const p=Number(e.target.dataset.point);if(!ctx||!Number.isInteger(p))return;ctx.focus=p;
      for(const b of grid.children)b.tabIndex=Number(b.dataset.point)===p?0:-1;
    });
    by("crossBack").onclick=close;by("crossAction").onclick=()=>{
      if(ctx.mode==="earned")close();else if(ctx.mode==="claim")claim();else if(ctx.mode==="retry"){
        Object.assign(ctx,position(ctx.region,ctx.route),{mode:"playing",last:null,reply:null,moves:[],message:"",pose:"idle",at:0});
        remember();render();focusBoard();
      }
    };
    grid.addEventListener("keydown",e=>{
      const d={ArrowUp:-9,ArrowDown:9,ArrowLeft:-1,ArrowRight:1}[e.key],p=Number(e.target.dataset.point);
      if(!d||!Number.isInteger(p))return;e.preventDefault();let q=p+d;
      while(q>=0&&q<81&&(Math.abs(d)===9||Math.floor(p/9)===Math.floor(q/9))){if(!grid.children[q].disabled){grid.children[q].focus();return;}q+=d;}
    });
    dialog.addEventListener("cancel",e=>{e.preventDefault();close();});
    addEventListener("popstate",e=>{if(dialog.open&&e.state?.outerCross!==ctx.region)leave();});
  }
  function focusBoard(){by("crossPoints").querySelector("button:not(:disabled)")?.focus({preventScroll:true});}
  function settleBoard(v,p){
    if(!v.win){
      ctx.state=v.reply?.state??v.attack;ctx.last=v.reply?.point??p;ctx.reply=v.reply?.point??null;ctx.mode="retry";
      ctx.message=v.needsCapture?say("黒は助かった。今度は白を取る一手で救おう。","흑은 살았어요. 이번엔 백을 따내는 수로 구해 보세요."):
        v.reply?.point>=0?say("白が応じた。印の一団の呼吸点を見直そう。","백이 응수했어요. 표시한 무리의 활로를 다시 보세요."):say("白は手を抜いても守れる。印はどこ？","백이 손을 빼도 버팁니다. 표식의 위치를 보세요.");
    }else if(v.done){ctx.state=v.attack;ctx.last=p;ctx.reply=null;ctx.mode="earned";}
    else{ctx.state=v.reply.state;ctx.reply=ctx.last=v.reply.point;ctx.turns--;ctx.mode="playing";ctx.message=say("白が抵抗した。印の白を取りきろう。","백이 버텼어요. 표시한 흰 무리를 마저 따내세요.");}
  }
  async function claim(){
    const current=ctx,serial=epoch;current.mode="saving";render();
    let owned=false;
    try{owned=await FinalPost.withLock(CampaignSlots.id,()=>CrossingLog.complete(current.region,current.route,saved)||CrossingLog.cleared(current.region,saved));}catch{}
    if(serial!==epoch||ctx!==current)return;
    current.mode=owned?"earned":"claim";current.message=owned?localizedPair(OuterStory.forks(current.region)[current.route-1].after):
      say("記録できません。もう一度受け取ってください。","결과가 저장되지 않았어요. 다시 받아 주세요.");
    remember();render();
  }
  function attempt(p){
    if(ctx?.mode!=="playing")return;const v=judge(ctx.region,ctx.route,ctx,p);if(!v.legal)return;
    ctx.moves.push(p);remember();const serial=epoch;
    ctx.state=v.attack;ctx.last=p;ctx.reply=null;ctx.pose=v.attack.captured.length?"break":"hit";ctx.at=performance.now();
    BoardFX.playOn(by("crossFX"),9,p,v.attack.captured,1,saved.fx);
    if(v.win&&v.done){
      if(!CrossingLog.cleared(ctx.region,saved))FieldBook.solved(ctx.mission);
      settleBoard(v,p);claim();return;
    }
    ctx.mode="reply";render();
    timer=setTimeout(()=>{
      if(epoch!==serial||!ctx)return;settleBoard(v,p);ctx.pose="strike";ctx.at=performance.now();if(v.reply?.point>=0)BoardFX.playOn(by("crossFX"),9,v.reply.point,v.reply.state.captured,2,saved.fx);
      remember();render();
    },reduceMotion?60:320);
  }
  function paint(){
    const canvas=by("crossBoard"),c=canvas.getContext("2d"),u=60,b=ctx.state.board;
    const ink=Wardrobe.boards[saved.gear[0]][5][2];Wardrobe.surface(c,540,540,saved.gear[0]);c.strokeStyle=ink;c.lineWidth=1.7;
    for(let n=0;n<9;n++){const x=(n+.5)*u;c.beginPath();c.moveTo(30,x);c.lineTo(510,x);c.moveTo(x,30);c.lineTo(x,510);c.stroke();}
    const buttons=by("crossPoints").children,focus=Number.isInteger(ctx.focus)&&!b[ctx.focus]?ctx.focus:b.indexOf(0);
    for(let p=0;p<81;p++){
      const x=(p%9+.5)*u,y=(Math.floor(p/9)+.5)*u,v=b[p];if(!v&&[20,24,40,56,60].includes(p)){c.fillStyle=ink;c.fillRect(x-2,y-2,4,4);}
      if(v)Wardrobe.stone(c,x,y,27,v===2,saved.gear[1]);
      const marked=ctx.mission.targets.includes(p);if(marked){c.strokeStyle=v===1?"#ffdf98":"#96401f";c.lineWidth=3;c.strokeRect(x-9,y-9,18,18);}
      if(p===ctx.last){c.beginPath();c.strokeStyle=v===2?"#35454d":"#ffdc75";c.lineWidth=3;c.arc(x,y,6,0,Math.PI*2);c.stroke();}
      const btn=buttons[p];btn.disabled=ctx.mode!=="playing"||!!v;btn.tabIndex=!btn.disabled&&p===focus?0:-1;btn.setAttribute("aria-label",MatchRules.coordinate(9,p)+(v===2?say(" 白"," 백"):v===1?say(" 黒"," 흑"):"")+(marked?say(" 目印"," 목표"):""));
    }
  }
  function scene(now=performance.now()){
    if(!ctx||!dialog.open)return;cancelAnimationFrame(raf);clearTimeout(idle);const canvas=by("crossScene"),c=canvas.getContext("2d"),spec=card(ctx.region,ctx.route);
    if(ctx.mode==="earned"){
      OathPictures.crossing(canvas,ctx.region,ctx.route);
      return;
    }
    OathPictures.release(canvas);
    if(canvas.width!==480)canvas.width=480;if(canvas.height!==126)canvas.height=126;
    c.imageSmoothingEnabled=false;c.drawImage(OuterMapArt.battle(CrossingLog.stage(ctx.region),OuterCampaign.cleared(saved,ctx.region)),0,0,480,126);
    const dt=(now-ctx.at)/680,pose=ctx.at&&dt<1?ctx.pose:"idle",beat=pose==="idle"?reduceMotion?0:(now%1200)/1200:Math.min(1,dt);
    Crew.draw(c,9,134,116,58,0,0,3);WorldScale.hero(c,174,116,58,pose==="strike"?3:pose==="idle"?0:2);
    OuterFauna.draw(c,spec.foe,348,117,98,pose,beat);
    if(!reduceMotion&&!document.hidden){
      if(pose==="idle")idle=setTimeout(()=>scene(),240);else raf=requestAnimationFrame(scene);
    }
  }
  function render(){
    const spec=card(ctx.region,ctx.route),event=OuterStory.forks(ctx.region)[ctx.route-1],won=ctx.mode==="earned";
    dialog.dataset.region=ctx.region;dialog.dataset.route=ctx.route;dialog.dataset.mode=ctx.mode;dialog.dataset.foe=spec.foe;
    by("crossBack").setAttribute("aria-label",say("地図へ戻る","지도로 돌아가기"));by("crossPlace").textContent=localizedPair(event.name);
    by("crossName").textContent=localizedPair(OuterFauna.name(spec.foe)||event.opponent);
    if(won){
      by("crossPlace").textContent=ctx.route===1?say("西岸の帰り便","서쪽 강가의 돌아오는 배"):say("東岸の帰り便","동쪽 강가의 돌아오는 배");
      by("crossName").textContent=localizedPair(event.name);
    }
    by("crossGoal").textContent=localizedPair(descriptions[spec.kind]);by("crossMessage").textContent=ctx.message||localizedPair(event.before);
    const token=by("crossReward");token.hidden=!won;
    if(won){token.querySelector("b").textContent=localizedPair(spec.reward);const c=by("crossStamp").getContext("2d");c.clearRect(0,0,25,25);stamp(c,ctx.region,ctx.route,0,0,25);}
    const action=by("crossAction");action.hidden=!["earned","retry","claim"].includes(ctx.mode);
    action.textContent=won?say("合流点へ","합류 지점으로"):ctx.mode==="claim"?say("受け取る","받기"):say("打ち直す","다시 두기");
    by("crossPoints").setAttribute("aria-label",say("九路盤の交点","9줄 바둑판 교차점"));paint();scene();
  }
  return Object.freeze({required,done,reward,stamp,card,position,judge,pending,enter,resume,close,
    get active(){return !!dialog?.open;},inspect:()=>ctx?{...ctx,moves:ctx.moves.slice()}:null});
})();
