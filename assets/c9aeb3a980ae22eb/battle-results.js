"use strict";
// Original postal seal and training marks. The two-color stones tie the marks to Go.
const ExpeditionMarks=(()=>{
  const template=document.createElement("template");
  template.innerHTML="<svg></svg>";
  function mark(id) {
    const svg=template.content.firstElementChild.cloneNode(false),ns=svg.namespaceURI;
    svg.setAttribute("viewBox",id==="post"?"0 0 90 68":"0 0 40 40");
    svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");
    svg.dataset.mark=id;svg.classList.add("expedition-mark");
    const path=(fill,d)=>{const p=document.createElementNS(ns,"path");p.setAttribute("fill",fill);p.setAttribute("d",d);svg.append(p);};
    const ink="#293e34",brass="#c89d5e",pale="#f5deb1",light="#ffedc8";
    if(id==="post"){
      // A cut-paper dispatch, its cancellation waves, and the mail skiff's wax seal.
      path("#433d2b","M4 23L60 10L81 36L31 55L9 44Z");
      path("#c5a675","M3 20L61 7L79 33L30 52L7 41Z");
      path("#f3deb0","M6 21L59 9L74 32L30 48L10 39Z");
      path("#b39566","M6 21L37 29L59 9L39 32H35Z M12 37L28 28L30 30L14 39Z M46 24L70 29L70 31L45 27Z");
      path("#6b8576","M9 22L24 19L25 21L10 24Z M10 25L20 23L21 25L11 27Z");
      path("#543d2f","M42 29L47 26L49 23L58 23L64 20L69 23L76 24L78 29L82 32L81 38L84 44L81 50L82 54L74 59L72 63L65 63L60 66L52 63L46 63L44 58L37 55L38 49L35 45L38 39L38 33Z");
      path("#973f35","M42 26L48 25L50 20L58 21L64 18L69 21L75 21L77 27L81 29L80 36L83 41L79 46L79 52L73 55L70 61L63 60L59 63L52 59L46 60L45 54L39 52L40 46L36 42L40 36L39 30Z");
      path("#c2694d","M44 29L50 27L52 23L58 24L65 21L69 24L74 24L76 30L79 32L77 37L79 42L76 47L76 51L70 54L68 57L62 56L58 59L52 56L48 57L47 51L42 49L44 44L40 41L43 35Z");
      path("#743e34","M47 31L52 27L61 26L69 27L75 33L76 43L72 50L66 54L56 54L48 49L45 42L45 36Z");
      path("#a75642","M48 32L54 28L61 27L69 29L74 34L74 42L70 49L65 52L57 52L50 48L47 41L47 36Z");
      path("#f2bb80","M48 41L55 43H67L73 39L69 46L65 48H56L51 45Z M60 30H62V41H60Z M63 31L70 38L63 40Z M58 33V40H52Z");
      path("#e99168","M53 50H58V51H64V50H69L66 52H56Z");
    }else if(id==="attack"){
      path("#263c32","M4 25L11 18L9 12L15 13L17 6L21 10L29 4L31 8L37 3L36 15L20 30L23 34L19 37L13 31L6 38L2 34L9 26Z");
      path("#9a5c41","M4 30L14 19L12 14L17 16L18 8L21 14L29 8L27 16L15 27L8 33Z");
      path(brass,"M7 33L13 26L16 29L9 36H6Z M11 24L13 22L23 31L20 34Z");
      path("#a4b7a4","M14 23L28 9L35 5L33 15L19 28Z");
      path(light,"M16 22L30 9L33 8L31 12L18 25Z");
      path("#55786f","M20 25L33 12V15L20 28Z");
    }else if(id==="guard"){
      path(ink,"M4 8L13 7L19 3L25 7L35 8L34 23L29 31L19 38L10 32L5 25Z");
      path(brass,"M6 10L14 9L19 5L25 9L32 10L31 22L27 29L19 35L12 30L8 23Z");
      path("#446b61","M9 12L15 11L19 8L24 11L29 12L28 21L25 27L19 32L14 28L11 21Z");
      path("#6d9480","M10 13L16 12L18 10V29L14 25L12 20Z");
      path("#e5dbb7","M16 16H22L25 19V22L22 25H17L13 22V19Z");
      path(light,"M16 17H21V19H17V21H14V19Z");
    }else{
      path(ink,"M13 3H28L31 7L28 14L32 30L26 31L21 38L15 32L8 31L12 16L9 8Z");
      path("#ad6a4b","M15 15L20 17L18 31L15 28L11 29Z");
      path("#758d77","M21 17L26 15L30 29L25 28L22 33Z");
      path(brass,"M13 3H27L32 8V17L27 22H13L8 17V8Z");
      path(pale,"M14 5H26L30 9V16L26 20H14L10 16V9Z");
      path("#7b7857","M15 7H25L28 10V15L25 18H15L12 15V10Z");
      path(ink,"M15 10H19L21 12V15L19 17H15L13 15V12Z");
      path(light,"M21 8H24L27 10V12L24 15H21L19 13V10Z");
    }
    return svg;
  }
  function inventory(key){
    const c=document.createElement("canvas");c.setAttribute("aria-hidden","true");c.dataset.inventoryArt=key;
    return CampAtlas.paint(c,key);
  }
  function skin(pair) {
    for(const [category,pool] of [Wardrobe.boards,Wardrobe.stones].entries()){
      const i=pool.findIndex(item=>item[3][0]===pair[0]&&item[3][1]===pair[1]);
      if(i<0)continue;
      const c=document.createElement("canvas");c.width=54;c.height=40;c.setAttribute("aria-hidden","true");c.className="reward-swatch";
      Wardrobe.swatch(c,category,category===0?i:saved.gear[0],category===1?i:saved.gear[1]);return c;
    }
    return inventory("equipment");
  }
  return {mark,inventory,skin};
})();

// Rendering and acknowledging a receipt never awards its contents.
const BattleResults = (() => {
  const L=(ja,ko)=>localizedPair([ja,ko]);
  const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  let queued=null, pendingMark=null, dialog=null, attempt=null, held=null;
  function disk(){
    try{const raw=JSON.parse(localStorage.getItem(CampaignSlots.key));return raw?.campaignId===CampaignSlots.id?raw:null;}catch{return null;}
  }
  function beginAttempt(id,fresh) {
    if(!fresh&&attempt?.id===id&&attempt.campaign===CampaignSlots.id)return;
    const previous=disk()?.fieldGrants?.[id];
    attempt={id,campaign:CampaignSlots.id,revision:Number.isSafeInteger(previous)?previous:0};
  }
  function settle(id,apply){
    const token=attempt;
    const update=()=>{
      const previous=disk();
      if(!token||token.campaign!==CampaignSlots.id||token.id!==id||(previous?.fieldGrants?.[id]||0)!==token.revision)return false;
      if(previous?.work){
        const diskWork=Workshop.read(previous.work);
        saved.work.earned=saved.work.earned.map((n,i)=>Math.max(n,diskWork.earned[i]));
        saved.work.made=saved.work.made.map((n,i)=>n|diskWork.made[i]);
      }
      return apply({id,revision:token.revision+1});
    };
    return navigator.locks?.request?navigator.locks.request(CampaignSlots.key+".field-clear",update):Promise.resolve().then(update);
  }
  function grantMaterials(work, requests) {
    const credited=[];
    for(const [id,amount] of requests){
      const before=work.earned[id];
      Workshop.earn(work,id,amount);
      if(work.earned[id]>before)credited.push([id,work.earned[id]-before]);
    }
    return credited;
  }
  function start(report) {
    queued=report;
    pendingMark=Number.isInteger(report.id)&&report.train!==false?PartyGrowth.award(report.id):Promise.resolve(0);
    // A quota/permission failure leaves ordinary, already-committed loot intact.
    pendingMark=pendingMark.catch(()=>-1);
  }
  function section(title,items,use){
    if(!items.length)return;
    const row=node("section",null,"loot-line"),h=node("h3",title),body=node("ul");
    for(const [name,amount,art] of items){
      const li=node("li");li.append(art,node("span",name));
      if(amount)li.append(node("b","+"+amount));body.append(li);
    }
    row.append(h,body,node("small",use));dialog.querySelector(".loot-lines").append(row);
  }
  function render(report,mark){
    const rows=dialog.querySelector(".loot-lines");rows.replaceChildren();
    dialog.querySelector("h2").textContent=L("戦果報告","전투 결산");
    dialog.querySelector(".loot-place").textContent=localizedPair(report.name);
    const materialUse=L("メニュー → 装備工房で碁盤・碁石を制作","메뉴 → 장비 공방에서 바둑판·돌 제작");
    const materialArt=["wood","pearl","ore","frost","star"];
    const mats=entries=>(entries||[]).filter(([,n])=>n>0).map(([k,n])=>[localizedPair(Workshop.materials[k]),n,ExpeditionMarks.inventory(materialArt[k])]);
    section(L("戦利品","전투 재료"),mats(report.base),materialUse);
    section(L("仲間が採集","동료의 추가 채집"),mats(report.crew),materialUse);
    if(report.ticket)section(L("初回踏破","첫 클리어"),[[L("仲間の招待状","동료 영입권"),report.ticket,ExpeditionMarks.inventory("ticket")]],L("メニュー → 遠征隊で仲間を招待","메뉴 → 원정대에서 동료 영입"));
    if(report.lamp)section(L("初回補給","첫 클리어 보급"),[[L("読みの灯","수읽기 등불"),report.lamp,ExpeditionMarks.inventory("lamp")]],L("遠征の碁盤 → ヒントで候補手を見る","원정 바둑판 → 힌트에서 후보 수 확인"));
    if(report.skins?.length)section(L("外観の解放","새 외형"),report.skins.map(x=>[localizedPair(x),0,ExpeditionMarks.skin(x)]),L("メニュー → 装備工房で試着・装備","메뉴 → 장비 공방에서 미리보기·장착"));
    if(mark>0)section(L("部隊訓練","파티 훈련"),[[L("訓練点","훈련점"),1,ExpeditionMarks.mark("training")]],L("メニュー → 遠征隊 → 部隊情報で配分","메뉴 → 원정대 → 파티 정보에서 배분"));
    if(mark===-1)rows.append(node("p",L("訓練点を保存できませんでした。","훈련점 저장에 실패했습니다.")));
    if(!rows.childElementCount)rows.append(node("p",report.first?L("この地点の道が開いた。","이 지점의 길이 열렸습니다."):L("再踏破。新しい支給品はありません。","재도전을 마쳤습니다. 새 지급품은 없습니다.")));
    dialog.querySelector("button").textContent=report.trial?L("挑戦に戻る","도전으로 돌아가기"):L("地図へ","지도로");
  }
  function install() {
    if(dialog)return;
    dialog=node("dialog",null,"loot-result");dialog.id="battleResult";dialog.setAttribute("aria-labelledby","battleResultTitle");
    const heading=node("h2");heading.id="battleResultTitle";const next=node("button",null,"voyage-action");next.type="button";next.id="battleResultNext";
    const head=node("header",null,"loot-head"),label=node("div"),foot=node("footer");label.append(heading,node("p",null,"loot-place"));
    head.append(label,ExpeditionMarks.mark("post"));foot.append(next);
    dialog.append(head,node("div",null,"loot-lines"),foot);document.body.append(dialog);
    const leave=()=>{if(history.state?.battleReceipt)history.back();else dialog.close();};
    next.onclick=leave;dialog.oncancel=e=>{e.preventDefault();leave();};
    dialog.addEventListener("close",()=>{
      const receipt=held;held=null;
      if(receipt)receipt.leave();
    });
    addEventListener("popstate",e=>{
      // Returning from combat may push its new receipt during this same popstate.
      // Its event still describes the previous map entry. Only dismiss a receipt
      // after traversal has actually left its current history entry.
      if(!dialog.open||e.state?.battleReceipt||history.state?.battleReceipt)return;
      e.stopImmediatePropagation();
      dialog.close();
    },true);
  }
  async function present(id,field=null) {
    if(!queued||queued.id!==id)return;
    const report=queued, mark=pendingMark;
    queued=null;const gained=await mark;
    // The original field returns to its previous map entry with history.go().
    // Open above that entry only after its asynchronous popstate has finished.
    if(!field&&Number.isInteger(id)&&id<80){
      const deadline=performance.now()+2200;
      while(!el("voyage").hidden&&history.state?.bfq===2&&
        (history.state.view.root!=="map"||history.state.view.modal||history.state.depth!==1)&&performance.now()<deadline){
        await new Promise(resolve=>setTimeout(resolve,20));
      }
      if(el("voyage").hidden||mapStage!==id)return;
    }
    install();render(report,gained);
    if(!dialog.open){history.pushState({...history.state,battleReceipt:true},"");dialog.showModal();}
    dialog.scrollTop=0;dialog.querySelector(".loot-lines").scrollTop=0;dialog.querySelector("button").focus({preventScroll:true});
  }
  function holdAtField(id,leave){
    if(held?.id===id)return true;
    if(held||!queued||queued.id!==id)return false;
    held={id,leave};
    present(id,held);
    return true;
  }
  return {start,present,holdAtField,grantMaterials,beginAttempt,settle};
})();

const PartyInfo=(()=>{
  const L=(ja,ko)=>localizedPair([ja,ko]);
  let panel,active=false,err="";
  function install(){
    const host=document.getElementById("camp-party");if(!host||panel)return;
    panel=document.createElement("details");panel.id="partyGrowth";
    panel.innerHTML='<summary><span></span></summary><div class="training-details"><p class="growth-pool"></p><p class="growth-rule"></p><ul class="growth-marks"></ul><div class="growth-choices"></div><p class="growth-when"></p><output role="status"></output></div>';
    panel.querySelector("summary").prepend(ExpeditionMarks.mark("training"));
    host.prepend(panel);panel.addEventListener("toggle",render);
    for(const stat of ["attack","guard"]){
      const row=document.createElement("div");row.className="growth-track";row.dataset.stat=stat;
      row.innerHTML='<div><b></b><small></small></div><button type="button">−</button><output></output><button type="button">＋</button>';
      row.prepend(ExpeditionMarks.mark(stat));
      for(const [i,b] of [...row.querySelectorAll("button")].entries()){
        const delta=i?1:-1;b.dataset.delta=delta;
        b.onclick=async()=>{if(active)return;active=true;err="";try{await PartyGrowth.adjust(stat,delta);}catch{err=L("保存できませんでした。","저장할 수 없습니다.");}finally{active=false;render();}};
      }
      panel.querySelector(".growth-choices").append(row);
    }
    new MutationObserver(()=>{if(!host.hidden)render();}).observe(host,{attributes:true,attributeFilter:["hidden"]});
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    addEventListener("storage",render);render();
  }
  function render(){
    if(!panel)return;
    const data=PartyGrowth.read(PartyGrowth.current(saved.growth)),free=data.total-data.attack-data.guard;
    panel.querySelector("summary span").textContent=L("部隊情報・訓練","파티 정보 · 훈련");
    panel.querySelector(".growth-pool").textContent=L("未配分 ","미배분 ")+free+L(" 点　習得 ","점　획득 ")+data.total+" / 3";
    panel.querySelector(".growth-rule").textContent=L("各地方の2・7・20番目の地点で勝利すると、各印を一度ずつ獲得。全地方共通で合計3点まで。","어느 지역에서든 2·7·20번째 지점에서 승리하면 해당 표식을 한 번씩 얻습니다. 전 지역을 합쳐 최대 3점입니다.");
    const stamps=panel.querySelector(".growth-marks");stamps.replaceChildren();
    [2,7,20].forEach((n,i)=>{const li=document.createElement("li");li.dataset.earned=String(!!(data.marks&(1<<i)));li.textContent=(data.marks&(1<<i)?"✓ ":"○ ")+L(n+"番踏破",n+"번째 승리");stamps.append(li);});
    for(const row of panel.querySelectorAll(".growth-track")){
      const stat=row.dataset.stat,atk=stat==="attack",name=atk?L("攻撃","공격"):L("防御","방어");
      row.querySelector("b").textContent=name;
      row.querySelector("small").textContent=atk?L("正しく解いた時の与ダメージ +","문제를 해결했을 때 피해 +")+2*data.attack:L("正しく防いだ時の被害 −","올바르게 막았을 때 받는 피해 −")+2*data.guard+L("（最低1）"," (최소 1)");
      row.querySelector("output").value=data[stat];
      for(const b of row.querySelectorAll("button")){const add=+b.dataset.delta>0;b.disabled=active||(add?!free:!data[stat]);b.setAttribute("aria-label",name+(add?L(" に1点配分","에 1점 배분"):L(" から1点戻す","에서 1점 회수")));}
    }
    panel.querySelector(".growth-when").textContent=L("配分は何度でも変更できます。次に始める遠征の戦闘から有効です。","배분은 언제든 바꿀 수 있습니다. 다음에 시작하는 원정 전투부터 적용됩니다.");
    panel.querySelector('[role="status"]').textContent=err;
  }
  return {install,render};
})();
