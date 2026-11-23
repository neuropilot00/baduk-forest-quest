"use strict";
const RecruitPost=(()=>{
  for(const [key,url] of Object.entries({"field-post-camp":"../eaecd090510d7805/field-post-camp.png","field-war-table":"../eaecd090510d7805/field-war-table.png","field-post-sealed":"../eaecd090510d7805/field-post-sealed.png"})){
    document.documentElement.style.setProperty("--"+key,'url("'+url+'")');
  }
  const word=(ja,ko)=>localizedPair([ja,ko]);
  const receiptKey=()=>CampaignSlots.session("bfq-camp-invitation.v1");
  let active=null,receipt=null,pulse=0,frame=0,afterClose=null,closing=false;
  function pending(){
    if(!receipt){try{receipt=JSON.parse(sessionStorage.getItem(receiptKey()));}catch{}}
    return receipt?.seed===saved.roster.seed && Roster.has(saved.roster,receipt.id)?receipt.id:null;
  }
  function remember(id){
    receipt={seed:saved.roster.seed,id};
    try{sessionStorage.setItem(receiptKey(),JSON.stringify(receipt));}catch{}
  }
  function forget(){
    receipt=null;try{sessionStorage.removeItem(receiptKey());}catch{}
  }
  function timers(){clearTimeout(pulse);clearTimeout(frame);}
  function clear(){
    timers();active=null;afterClose=null;closing=false;forget();
    if(el("recruitDialog")?.open)el("recruitDialog").close();
  }
  function closeNow(){
    if(active===null)return;
    const done=afterClose;clear();renderMap();
    if(done)done();else el("recruitDraw").focus({preventScroll:true});
  }
  function leave(then=null){
    if(active===null||closing)return;
    closing=true;afterClose=then?then():null;
    if(history.state?.campInvite!==undefined)history.back();else closeNow();
  }
  function setup(){
    if(el("recruitDialog"))return;
    const dlg=document.createElement("dialog");dlg.id="recruitDialog";dlg.setAttribute("aria-labelledby","postHeading");
    dlg.innerHTML='<div class="post-top"><h2 id="postHeading"></h2><button type="button" id="postClose">×</button></div><div class="post-stage"><img id="postLetter" alt=""><canvas id="postActor" width="272" height="148" aria-hidden="true"></canvas></div><div id="postBody"><button id="postSkip" type="button" class="control"></button></div>';
    document.body.append(dlg);
    const result=el("recruitResult"),role=document.createElement("small");role.id="recruitRole";
    const dismiss=document.createElement("button");dismiss.type="button";dismiss.className="post-later";dismiss.id="postLater";
    el("recruitName").before(role);el("recruitEquip").after(dismiss);
    el("postBody").append(result);el("recruitPic").remove();
    dlg.addEventListener("cancel",event=>{event.preventDefault();leave();});
    dlg.addEventListener("click",event=>{if(event.target===dlg)leave();});
    el("postClose").onclick=()=>leave();dismiss.onclick=()=>leave();

  }
  // Register before the camp router, which owns the next history entry.
  window.addEventListener("popstate",event=>{
    if(active===null||event.state?.campInvite===active)return;
    if(event.state?.campRoute?.page==="party")event.stopImmediatePropagation();
    closeNow();
  },true);
  function arrived(id,onEquip){
    if(active!==id)return;
    timers();
    const dialog=el("recruitDialog"),member=CrewTactics.members[id];
    dialog.dataset.phase="joined";el("postHeading").textContent=word("新しい仲間","새 동료 합류");
    const skipFocused=document.activeElement===el("postSkip");
    el("postLetter").hidden=true;el("postSkip").hidden=true;el("postActor").hidden=false;
    function paint(pose,beat=0){
      if(active!==id||!dialog.open)return;
      const c=el("postActor").getContext("2d");c.clearRect(0,0,272,148);
      CrewArt.draw(c,id,136,128,91,pose,beat);
    }
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    CrewArt.ready.then(()=>{
      if(active!==id)return;
      paint(reduced?0:2);
      if(!reduced) frame=setTimeout(()=>paint(0,1),480);
    },()=>{});
    el("recruitRole").textContent=localizedPair(member.role);
    el("recruitName").textContent=localizedPair(member.name);
    el("recruitText").textContent=localizedPair(member.technique)+" · "+localizedPair(member.condition);
    const placed=saved.roster.slots.includes(id),full=saved.roster.slots.length>=3;
    const equip=el("recruitEquip");
    equip.disabled=placed;
    equip.textContent=placed?word("編成中","편성 중"):full?word("仲間と入れ替える","동료와 교대"):word("すぐに編成","바로 편성");
    equip.onclick=()=>leave(()=>onEquip(id));
    el("postLater").textContent=word("閉じる","닫기");el("recruitResult").hidden=false;
    if(skipFocused)(placed?el("postLater"):equip).focus({preventScroll:true});
  }
  function open(id,onEquip){
    if(active!==null||!Roster.has(saved.roster,id))return;
    setup();active=id;const dlg=el("recruitDialog");
    const result=el("recruitResult"),skip=el("postSkip"),letter=el("postLetter");
    el("postActor").hidden=true;letter.hidden=false;letter.src="../eaecd090510d7805/field-post-sealed.png";
    el("recruitName").textContent="";el("recruitText").textContent="";el("recruitRole").textContent="";result.hidden=true;
    el("postClose").setAttribute("aria-label",word("閉じる","닫기"));
    skip.hidden=false;skip.textContent=word("すぐに開く","바로 열기");skip.onclick=()=>arrived(id,onEquip);
    dlg.dataset.phase="sealed";el("postHeading").textContent=word("遠征隊への返書","원정대에 온 답장");
    dlg.showModal();skip.focus({preventScroll:true});
    if(history.state?.campInvite!==id)history.pushState({...history.state,campInvite:id},"");
    if(matchMedia("(prefers-reduced-motion: reduce)").matches){arrived(id,onEquip);return;}
    pulse=setTimeout(()=>{
      if(active!==id)return;
      dlg.dataset.phase="open";letter.src="../eaecd090510d7805/field-post-open.png";
      pulse=setTimeout(()=>arrived(id,onEquip),460);
    },620);
  }
  return {get active(){return active!==null;},open,pending,remember,clear};
})();
