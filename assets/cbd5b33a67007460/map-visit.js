"use strict";
const MapPlaceArt=(()=>{
  const wideArrivals=new Set([87,89,93]);
  const states=["before","restored","blocked","approach"];
  function paint(button,id,open,done,branch=0){
    const region=Math.floor(id/20),area=MapPlaceAssets[region];
    if(!area)return;
    const stride=region<4?20:24;
    const state=done?1:!open?2:button.getAttribute("aria-pressed")==="true"?3:0;
    const index=branch?19+branch:id%20;
    const slot=state*stride+index;
    button.dataset.placePortrait=states[state];
    button.style.setProperty("--place-sheet",`url("${area.sheet}")`);
    button.style.setProperty("--place-height",stride*100+"%");
    button.style.setProperty("--place-x",slot%4*100/3+"%");
    button.style.setProperty("--place-y",Math.floor(slot/4)*100/(stride-1)+"%");
  }
  function arrival(id,branch=0){
    if(!Number.isInteger(id)||id<0)return null;
    const area=MapPlaceAssets[Math.floor(id/20)];
    const url=branch?area?.forks?.[branch-1]:area?.arrivals[id%20];
    if(!url)return null;
    const wide=!branch&&wideArrivals.has(id);
    return {url,width:wide?1110:768,height:wide?370:384};
  }
  function showArrival(image,id,branch=0){
    const art=arrival(id,branch);
    image.hidden=!art;
    if(!art){image.removeAttribute("src");return;}
    image.width=art.width;image.height=art.height;
    if(image.getAttribute("src")!==art.url)image.src=art.url;
  }
  return {paint,arrival,showArrival};
})();

// Map focus is transient. Selecting a pin never advances an expedition save.
const SiteVisit=(()=>{
  const tr=(ja,ko)=>localizedPair([ja,ko]),by=id=>document.getElementById(id);
  const pinSelector="[data-site],[data-reach-site],[data-reach-fork],[data-outer-id],[data-outer-path]";
  let armed="",notice=null,marker=null,departure=null;
  function reset(){
    armed="";notice?.remove();notice=null;
    if(marker){
      marker.classList.remove("visit-focus");
      marker.removeAttribute("aria-describedby");
      marker.querySelector(".waymark-enter")?.remove();marker=null;
    }
  }
  function tap(button,preview,proceed,blocked){
    const attr=["data-site","data-reach-site","data-reach-fork","data-outer-id","data-outer-path"].find(k=>button.hasAttribute(k));
    const key=attr+"="+button.getAttribute(attr);
    if(armed===key&&proceed){reset();proceed();return;}
    reset();
    const panel=button.closest(".route-panel");
    const name=attr==="data-site"?localizedPair(Voyage.places[Number(button.dataset.site)]):
      button.getAttribute("aria-label")?.split(" · ")[0]||"";
    preview();
    if(!panel)return;
    const selected=panel.querySelector("["+attr+'="'+button.getAttribute(attr)+'"]');
    if(!selected)return;
    marker=selected;marker.classList.add("visit-focus");
    armed=proceed?key:"";
    if(proceed){
      const arrow=document.createElement("span");
      arrow.className="waymark-enter";arrow.textContent="›";arrow.setAttribute("aria-hidden","true");marker.append(arrow);
    }
    notice=document.createElement("div");notice.id="waymarkStatus";notice.className="waymark-note";notice.setAttribute("role","status");
    if(!proceed&&blocked)notice.dataset.reason="";
    panel.append(notice);
    notice.textContent=!proceed&&blocked?blocked:name+" · "+(proceed?tr("もう一度タップして進む","한 번 더 눌러 이동"):tr("一つ前の場所をクリアしよう","앞 장소를 먼저 클리어하세요"));
    marker.setAttribute("aria-describedby",notice.id);marker.focus({preventScroll:true});
  }
  document.addEventListener("click",event=>{if(!event.target.closest(pinSelector))reset();},true);
  function lines(id){
    const book=[BriefRoad,BriefUpriver,BriefTide,BriefDownriver][Math.floor(id/80)];
    return book[id%80];
  }
  function actionFor(id){
    if(id<80)return !by("voyage").hidden&&!ReachMap.active&&!OuterMap.active&&!FrontDoor.active&&mapStage===id&&!mapOutcome?by("voyGo"):null;
    if(id<100)return ReachMap.active&&Number(by("reachMap").dataset.stageId)===id?by("reachAction"):null;
    return OuterMap.active&&by("outerStops").querySelector('[data-outer-id="'+id+'"][aria-pressed=true]')?by("outerAction"):null;
  }
  function speechFor(id,heard,step){
    const panel=by("briefSpeech"),dialog=by("siteBrief");
    panel.replaceChildren();panel.hidden=heard;
    if(heard)return;
    const quotes=lines(id);
    const artwork=quotes.map((_,n)=>OriginalStoryPlates.get("brief-"+id+"-"+n));
    const illustrated=artwork.every(Boolean);
    if(illustrated)dialog.dataset.illustrated="true";
    const rows=quotes.map((line,index)=>{
      const row=document.createElement("div"),speaker=document.createElement("strong"),words=document.createElement("p");
      const actor=index===0?1:0;
      const key="brief-"+id+"-"+index;
      const lead=StoryDialogue.write(key,speaker,words,actor,line);
      if(illustrated){
        const art=document.createElement("img"),caption=document.createElement("div");
        art.alt="";art.decoding="async";
        row.hidden=true;
        row.dataset.originalCut=key;
        art.style.objectPosition=Math.round(EventPlates.horizontalFocus(row.dataset.originalCut)*100)+"% center";
        caption.className="brief-caption";caption.append(speaker,words);row.append(art,caption);
        row.onclick=()=>{if(index+1<rows.length)show(index+1,true);};
      }else{
        row.append(speaker,words);StoryFrame.portrait(row,lead.speaker,lead.line,"brief/"+id+"/"+index);
      }
      panel.append(row);return row;
    });
    if(!illustrated)return;
    const flip=document.createElement("button");
    flip.className="control brief-page";flip.type="button";panel.append(flip);
    let pending=false;
    async function show(index,remember,retry=false){
      if(pending)return;
      pending=true;flip.disabled=true;panel.setAttribute("aria-busy","true");
      const source=artwork[index],image=rows[index].firstElementChild;
      if(retry)image.removeAttribute("src");
      if(image.getAttribute("src")!==source)image.src=source;
      const loaded=await image.decode().then(()=>true,()=>false);
      if(!image.isConnected)return;
      pending=false;flip.disabled=false;panel.setAttribute("aria-busy","false");
      if(!loaded){
        flip.textContent="↻";flip.setAttribute("aria-label",tr("画像を再読み込み","그림 다시 불러오기"));
        flip.onclick=()=>show(index,remember,true);return;
      }
      for(const [n,row] of rows.entries())row.hidden=n!==index;
      dialog.style.setProperty("--brief-scene",`url("${source}")`);
      const advance=index+1<rows.length;
      flip.textContent=advance?"›":"‹";
      flip.setAttribute("aria-label",advance?tr("次の台詞","다음 대사"):tr("前の台詞","이전 대사"));
      flip.onclick=()=>show(advance?index+1:index-1,true);
      if(remember&&history.state?.siteBrief===id)history.replaceState({...history.state,briefBeat:index},"");
    }
    show(Math.min(rows.length-1,Math.max(0,step||0)),false);
  }
  function prepare(id,heard=false,restore=false){
    reset();const action=actionFor(id),dialog=by("siteBrief");
    if(!action||action.disabled||action.hidden||dialog.open||document.querySelector("dialog[open]"))return;
    const place=id<80?Voyage.places[id]:id<100?ReachMap.events[id-80].name:OuterStory.event(id).name;
    const goal=id<80?by("voyEncounter").textContent:localizedPair(id<100?ReachMap.events[id-80].goal:OuterStory.event(id).goal);
    by("briefTitle").textContent=localizedPair(place);
    by("briefGoal").textContent=goal;
    const image=by("briefApproach");
    MapPlaceArt.showArrival(image,id);
    dialog.toggleAttribute("data-illustrated",!image.hidden);
    dialog.style.removeProperty("--brief-scene");
    if(!image.hidden)dialog.style.setProperty("--brief-scene",`url("${image.getAttribute("src")}")`);
    speechFor(id,heard,restore?history.state?.briefBeat:0);
    by("briefStay").textContent=tr("地図に残る","지도에 머물기");
    by("briefStart").textContent=tr("戦闘開始","전투 시작");
    dialog.dataset.stage=id;
    departure=null;
    if(!restore)history.pushState({...history.state,siteBrief:id,heardBrief:heard},"");
    dialog.showModal();by("briefStart").focus({preventScroll:true});
  }
  function finish(enter){
    const d=by("siteBrief");if(!d.open||d.dataset.leaving)return;
    d.dataset.leaving="true";departure=enter?Number(d.dataset.stage):null;
    if(history.state?.siteBrief!==undefined)history.back();else settle();
  }
  function settle(){
    const dialog=by("siteBrief"),id=departure;departure=null;
    delete dialog.dataset.leaving;dialog.close();
    if(id!==null){const action=actionFor(id);if(action&&!action.disabled&&!action.hidden)action.click();}
  }
  addEventListener("popstate",e=>{
    reset();
    if(by("siteBrief").open&&e.state?.siteBrief===undefined){
      e.stopImmediatePropagation();settle();
    }else if(e.state?.siteBrief!==undefined&&!by("siteBrief").open){
      setTimeout(restoreBrief,0);
    }
  },true);
  function restoreBrief(){
    const entry=history.state,id=entry?.siteBrief;
    if(!Number.isInteger(id)||id<0||id>=320||by("siteBrief").open||FrontDoor.active)return;
    if(id<80&&id<=saved.expedition&&!by("voyage").hidden)openMap(id,false,true);
    prepare(id,!!entry.heardBrief,true);
  }
  document.addEventListener("DOMContentLoaded",()=>setTimeout(restoreBrief,0),{once:true});
  by("briefStay").onclick=()=>finish(false);by("briefStart").onclick=()=>finish(true);
  by("siteBrief").oncancel=e=>{e.preventDefault();finish(false);};
  function afterStory(id,advance,start=false){
    const proceed=()=>{
      const action=start&&actionFor(id);
      if(action&&!action.disabled&&!action.hidden)action.click();
      else prepare(id,true);
    };
    const back=!!history.state?.mapJourney||history.state?.view?.modal==="roadDialog";
    if(back)addEventListener("popstate",()=>setTimeout(proceed,0),{once:true});
    advance();
    if(!back)setTimeout(proceed,0);
  }
  return {tap,reset,prepare,afterStory,lines};
})();
