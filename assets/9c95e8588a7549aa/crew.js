"use strict";
const Crew=(()=>{
  const words=(ja,ko)=>localizedPair([ja,ko]);
  const members=()=>CrewTactics.members;
  let rolling=false,storageFailed=false,stale=false;
  function guide(){return saved.roster.guide+1;}
  function deployed(){return [...new Set([saved.roster.guide,...saved.roster.slots].filter(id=>id>=0))];}
  function syncLegacy(){
    saved.partner=guide();saved.work.crew=saved.roster.slots.filter(id=>id>=4&&id<=6).map(id=>id-3);
  }
  let picked=null, replacement=null, notice="";
  const lanes=[["後列","후열"],["中列","중열"],["前列","전열"]];
  const laneRoles=[["先読み","수읽기"],["連携","연계"],["防衛","수비"]];
  const laneHelp=[
    ["候補手に対する白の応手と、その次の黒の一手を先に見られる。","후보 수에 대한 백의 응수와 다음 흑 착수를 미리 볼 수 있습니다."],
    ["同じ正解手で二人の得意技が発動すると、勝利時に読星を一つ獲得。","같은 정답 수에서 두 동료의 전문 기술이 발동하면 승리 후 수읽기 별을 하나 얻습니다."],
    ["白の反撃を受けたら、その直前の局面から一度守り直せる。","백의 반격을 받으면 직전 국면부터 한 번 다시 방어할 수 있습니다."]
  ];
  const columns=[["左","왼쪽"],["中央","가운데"],["右","오른쪽"]];
  const columnName=cell=>localizedPair(lanes[Math.floor(cell/3)])+" "+localizedPair(columns[cell%3]);
  const memberName=id=>localizedPair(members()[id].name);
  const unitAt=cell=>saved.roster.slots[saved.roster.cells.indexOf(cell)];
  function preferredCell(){
    return [4,7,1,3,5,6,8,0,2].find(cell=>!saved.roster.cells.includes(cell));
  }
  function element(tag,cls,id){
    const e=document.createElement(tag);if(cls)e.className=cls;if(id)e.id=id;return e;
  }
  function focusCell(cell,scroll=true){
    const tile=el("formationGrid").querySelector('[data-cell="'+cell+'"]');
    if(!tile)return;
    if(scroll)el("formationGrid").scrollIntoView({block:"center"});
    tile.focus({preventScroll:true});
  }
  function refreshFormation(){
    const r=saved.roster,ids=Roster.ids(r);
    renderFormation(ids);
  }
  function choose(id,source){
    if(!Roster.has(saved.roster,id))return;
    picked=picked===id?null:id;replacement=null;notice="";
    refreshFormation();
    const current=saved.roster.slots.indexOf(id);
    if(source==="bench"&&picked!==null)focusCell(current<0?preferredCell():saved.roster.cells[current]);
    else if(current>=0)focusCell(saved.roster.cells[current],false);
  }
  function commitFormation(change,message){
    const before=Roster.pack(saved.roster);
    if(!change())return false;
    syncLegacy();
    if(!save()){
      saved.roster=Roster.load(before,0);syncLegacy();
      notice=words("編成を保存できませんでした。もう一度お試しください。","편성을 저장하지 못했습니다. 다시 시도해 주세요.");
      refreshFormation();return false;
    }
    picked=null;replacement=null;notice=message;renderMap();return true;
  }
  function placeAt(cell){
    const r=saved.roster,to=unitAt(cell);
    if(picked===null){
      if(to!==undefined)choose(to,"board");return;
    }
    if(to===picked){choose(picked,"board");return;}
    if(picked===replacement&&to!==undefined&&!r.slots.includes(picked)){
      const next=r.slots.map(id=>id===to?picked:id);
      if(commitFormation(()=>Roster.setSlots(r,next,r.cells),memberName(picked)+" · "+columnName(cell)))focusCell(cell,false);
      return;
    }
    if(!r.slots.includes(picked)&&(r.slots.length>=3||to!==undefined)){
      notice=r.slots.length>=3?words("編成は3人まで。配置中の仲間を選んで外してください。","세 명이 편성돼 있습니다. 배치된 동료를 골라 해제하세요."):words("空いている位置を選んでください。","비어 있는 칸을 선택하세요.");
      refreshFormation();focusCell(cell,false);return;
    }
    const moving=picked;
    const message=to===undefined?memberName(moving)+" · "+columnName(cell):words("二人の位置を交換しました。","두 동료의 자리를 바꿨습니다.");
    if(commitFormation(()=>Roster.place(r,moving,cell),message))focusCell(cell,false);
  }
  function quickEquip(id){
    const r=saved.roster,cell=preferredCell();
    if(r.slots.includes(id))return;
    if(r.slots.length>=3){
      picked=id;replacement=id;notice=words("交代する仲間の位置を選択。","교대할 동료의 자리를 선택하세요.");
      refreshFormation();return ()=>focusCell(r.cells[0]);
    }
    if(cell===undefined)return;
    if(commitFormation(()=>Roster.place(r,id,cell),memberName(id)+" · "+columnName(cell)))return ()=>focusCell(cell);
  }
  function portrait(id,size=104){
    const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;canvas.setAttribute("aria-hidden","true");
    CrewArt.portrait(canvas,id);return canvas;
  }
  function card(id,asGuide){
    const member=members()[id],b=document.createElement("button"),copy=document.createElement("span"),name=document.createElement("b"),line=document.createElement("small"),status=document.createElement("em");
    const on=asGuide?saved.roster.guide===id:saved.roster.slots.includes(id);
    b.type="button";b.className="party-card";if(asGuide)b.dataset.member=id+1;else b.dataset.companion=id;
    if(!asGuide){b.dataset.deployed=String(on);b.classList.add("formation-member");}
    b.setAttribute("aria-pressed",String(asGuide?on:picked===id));name.textContent=localizedPair(member.name)+" · "+localizedPair(member.role);
    line.textContent=asGuide?localizedPair(member.technique):localizedPair(member.condition);
    if(asGuide){
      status.textContent=on?words("外す","해제"):words("案内役に","길잡이 선택");
      b.onclick=()=>{commitFormation(()=>Roster.setGuide(saved.roster,on?-1:id),"");};
    }else{
      name.textContent=memberName(id);line.textContent=localizedPair(member.role);
      status.textContent=on?"✓":"";status.hidden=!on;
      b.setAttribute("aria-label",memberName(id)+" · "+localizedPair(member.role)+(on?" · "+words("配置中","배치됨"):""));
      b.onclick=()=>choose(id,"bench");
    }
    copy.append(name,line);b.append(portrait(id),copy,status);return b;
  }
  function formationScaffold(){
    if(el("formationGrid"))return;
    const squad=el("squadSection"),list=el("squadList");
    // Recruitment results stay above the editor; route guides retain their own assignment below it.
    squad.after(el("guideSection"));
    const captain=element("div","formation-captain","formationCaptain");
    const face=element("canvas","","captainFace"),identity=element("div");
    face.width=face.height=112;face.setAttribute("aria-hidden","true");
    identity.append(element("small","","captainRank"),element("strong","","captainName"),element("span","","captainDuty"));
    captain.append(face,identity);squad.before(captain);
    const intro=element("div","formation-intro"),help=element("details","formation-help"),summary=element("summary","","formationHelpTitle");
    help.append(summary,element("dl","","formationHelp"));intro.append(help);
    const grid=element("div","formation-grid","formationGrid");
    grid.setAttribute("role","group");grid.setAttribute("aria-labelledby","squadCaption");
    const detail=element("div","formation-detail","formationDetails"),message=element("p","","formationMessage");
    message.setAttribute("role","status");
    const controls=element("div","formation-actions");
    for(const id of ["formationRemove","formationCancel"]){
      const b=element("button","control",id);b.type="button";controls.append(b);
    }
    el("crewLine").hidden=true;
    const bench=element("h3","","formationBench");
    detail.append(message,controls);list.before(intro,grid,detail,bench);
  }
  function renderFormation(owned){
    formationScaffold();
    const r=saved.roster,section=el("squadSection");section.hidden=!owned.length;
    if(picked!==null&&!Roster.has(r,picked))picked=null;
    el("squadCaption").textContent=words("戦闘陣形","전투 진형")+"  "+r.slots.length+" / 3";
    el("captainRank").textContent=words("遠征隊長","원정대장");
    el("captainName").textContent=words("ソルビ","솔비");
    el("captainDuty").textContent=words("常に出撃","항상 출전");
    if(typeof TalkPortrait!=="undefined")TalkPortrait.show(el("captainFace"),"solbi",{speaking:false,key:"formation"});
    el("formationHelpTitle").textContent=words("陣形の効果","진형 효과");
    const rules=[];
    for(const [index,pair] of lanes.entries()){
      const name=element("dt"),text=element("dd");
      name.textContent=localizedPair(pair)+" · "+localizedPair(laneRoles[index]);
      text.textContent=localizedPair(laneHelp[index]);rules.push(name,text);
    }
    el("formationHelp").replaceChildren(...rules);
    const grid=el("formationGrid"),rows=[];
    for(let lane=0;lane<3;lane++){
      const group=element("div","formation-row"),label=element("span","formation-lane");
      const role=element("small","formation-role");role.textContent=localizedPair(laneRoles[lane]);
      label.append(localizedPair(lanes[lane]),role);group.append(label);
      for(let col=0;col<3;col++){
        const cell=lane*3+col,unit=unitAt(cell),button=element("button","formation-tile");
        button.type="button";button.dataset.cell=cell;button.title=localizedPair(laneHelp[lane]);
        const occupant=unit===undefined?words("空き","빈칸"):memberName(unit);
        button.setAttribute("aria-label",columnName(cell)+" · "+localizedPair(laneRoles[lane])+" · "+occupant);
        button.setAttribute("aria-pressed",String(unit!==undefined&&picked===unit));
        if(unit!==undefined){
          button.dataset.unit=unit;
          const name=element("span","formation-name"),job=element("small","tile-job");
          name.textContent=occupant;job.textContent=localizedPair(members()[unit].role);button.append(portrait(unit),name,job);
          button.setAttribute("aria-label",button.getAttribute("aria-label")+" · "+job.textContent);
        }else{
          button.append(element("i","formation-socket"));button.setAttribute("aria-disabled",String(picked===null));
        }
        button.onclick=()=>placeAt(cell);
        button.onkeydown=e=>{
          const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3}[e.key];
          if(!delta)return;e.preventDefault();const next=cell+delta;
          if(next>=0&&next<9&&(Math.abs(delta)===3||Math.floor(cell/3)===Math.floor(next/3)))focusCell(next,false);
        };
        group.append(button);
      }
      rows.push(group);
    }
    grid.replaceChildren(...rows);
    const remove=el("formationRemove"),cancel=el("formationCancel"),info=el("formationMessage");
    remove.hidden=picked===null||!r.slots.includes(picked);cancel.hidden=picked===null;
    remove.textContent=words("編成から外す","편성 해제");cancel.textContent=words("選択をやめる","선택 취소");
    if(!remove.hidden)remove.onclick=()=>{
      const id=picked,from=r.cells[r.slots.indexOf(id)];
      if(commitFormation(()=>Roster.remove(r,id),memberName(id)+" · "+words("待機","대기")))focusCell(from,false);
    };
    cancel.onclick=()=>{picked=null;replacement=null;notice="";refreshFormation();focusCell(4,false);};
    const selection=picked===null?null:members()[picked];
    info.replaceChildren();
    if(selection){const b=element("b");b.textContent=memberName(picked)+" · "+localizedPair(selection.technique);info.append(b,document.createTextNode(localizedPair(selection.condition)));}
    const line=element("span");line.textContent=notice||(picked===null?words("仲間を選び、置きたい位置をタップ。","동료를 고른 뒤 배치할 칸을 누르세요."):r.slots.includes(picked)?words("移動先を選択。仲間のいる位置なら入れ替え。","이동할 칸을 고르세요. 동료가 있는 칸은 서로 자리를 바꿉니다."):words("置きたい空き位置を選択。","배치할 빈칸을 고르세요."));
    info.append(line);el("formationBench").textContent=words("仲間を選ぶ","동료 선택");
    el("squadList").replaceChildren(...owned.map(id=>card(id,false)));
    const heading=el("squadCaption");heading.setAttribute("tabindex","-1");
  }
  function render(){
    const roster=saved.roster,owned=Roster.ids(roster),tickets=Roster.balance(roster,saved.expedition),poolDone=owned.length===Roster.size;
    el("partyHeading").textContent=words("遠征隊","원정대");el("ticketCount").textContent=words("仲間の招待状","동료 영입권")+" × "+tickets;
    const draw=el("recruitDraw"),observed=roster.owned;
    const pending=RecruitPost.pending();
    draw.disabled=rolling||RecruitPost.active||(pending===null&&(!tickets||poolDone));
    draw.textContent=pending!==null?words("仲間の返書を読む","동료의 답장 읽기"):poolDone?words("全員が合流した","모두 합류했다"):words("招待状を送る","초대장 보내기");
    el("ticketRule").textContent=poolDone?words("遠征隊の仲間が全員そろいました。","원정대 동료가 모두 모였습니다."):words("本編の各地点を初めて踏破すると一通。招くと新しい仲間が一人合流します。","본편의 각 지점을 처음 깨면 영입권 한 장을 얻습니다. 초대장을 보내면 새로운 동료가 합류합니다.");
    if(storageFailed)el("ticketRule").textContent=words("保存できませんでした。招待状は手元にあります。","저장할 수 없어 영입권을 그대로 두었습니다.");
    if(stale)el("ticketRule").textContent=words("他のタブで旅が進みました。再読み込みしてください。","다른 탭에서 진행이 바뀌었습니다. 새로고침해 주세요.");
    draw.onclick=async()=>{
      if(rolling||RecruitPost.active)return;
      const unread=RecruitPost.pending();
      if(unread!==null){RecruitPost.open(unread,quickEquip);return;}
      rolling=true;storageFailed=false;stale=false;draw.disabled=true;
      let opened=null;
      try{
        await FinalPost.withLock(CampaignSlots.id,()=>{
          let current=null;try{current=JSON.parse(localStorage.getItem(storageKey));}catch{}
          if(current?.roster){
            const latest=Roster.load(current.roster,0);
            if(latest.seed!==roster.seed||current.expedition!==saved.expedition){stale=true;return;}
            Roster.restore(roster,current.roster,saved.expedition);
          }
          const before=Roster.pack(roster),id=Roster.draw(roster,saved.expedition,observed);
          if(id===null)return;
          syncLegacy();
          if(save()){opened=id;RecruitPost.remember(id);}
          else{saved.roster=Roster.load(before,0);syncLegacy();storageFailed=true;}
        });
      }catch{storageFailed=true;}finally{
        rolling=false;renderMap();
        if(opened!==null&&el("campMenu")?.open&&!el("camp-party").hidden)RecruitPost.open(opened,quickEquip);
      }
    };
    const guides=owned.filter(id=>id<4);el("guideSection").hidden=!guides.length;
    el("guideCaption").textContent=words("道案内 · 一人","길잡이 · 한 명");el("partyList").replaceChildren(...guides.map(id=>card(id,true)));
    renderFormation(owned);
    const mascot=el("mascotToggle");mascot.hidden=!Roster.has(roster,0)||roster.guide<=0||roster.slots.includes(0);
    mascot.textContent=words("ルルも一緒に歩く","루루도 함께 걷기")+(saved.work.mascot?" ✓":"");mascot.setAttribute("aria-pressed",String(saved.work.mascot));
    mascot.onclick=()=>{saved.work.mascot=!saved.work.mascot;save();renderMap();};
  }
  function travelers(){
    const roster=saved.roster;
    const ids=[...new Set(roster.slots.filter(id=>Roster.has(roster,id)))];
    if(ids.length<3 && roster.guide>=0 && Roster.has(roster,roster.guide) && !ids.includes(roster.guide))ids.push(roster.guide);
    if(ids.length<3 && roster.guide>0 && saved.work.mascot && Roster.has(roster,0) && !ids.includes(0))ids.push(0);
    return ids.slice(0,3);
  }
  function formation(left,right,ground,depth){
    return WorldScale.formation(travelers(),(id,i)=>typeof Roster.cell==="function"?Roster.cell(saved.roster,id):i+3,left,right,ground,depth);
  }
  function draw(c,left,right,ground,heroPx,beat=0,pose=0,depth=0){
    const actors=formation(left,right,ground,depth);
    for(const actor of actors)WorldScale.draw(c,actor.id,actor.x,actor.ground,heroPx,pose,beat);
    return actors;
  }
  return {render,draw,travelers,formation,guide,deployed,syncLegacy,clearReveal(){RecruitPost.clear();picked=null;replacement=null;notice="";}};
})();
