"use strict";
// Map focus is transient. Selecting a pin never advances an expedition save.
const SiteVisit=(()=>{
  const tr=(ja,ko)=>localizedPair([ja,ko]),by=id=>document.getElementById(id);
  const pinSelector="[data-site],[data-reach-site],[data-reach-fork],[data-outer-id],[data-outer-path]";
  let armed="",notice=null,marker=null,departure=null;
  function reset(){
    armed="";notice?.remove();notice=null;marker?.classList.remove("visit-focus");marker=null;
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
    marker=selected;marker.classList.add("visit-focus");selected.focus({preventScroll:true});
    armed=proceed?key:"";
    notice=document.createElement("div");notice.className="waymark-note";notice.setAttribute("role","status");
    notice.textContent=name+" · "+(proceed?tr("もう一度タップして進む","한 번 더 눌러 이동"):blocked||tr("一つ前の場所をクリアしよう","앞 장소를 먼저 클리어하세요"));
    panel.append(notice);
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
    delete dialog.dataset.illustrated;dialog.style.removeProperty("--brief-scene");
    if(heard)return;
    const quotes=lines(id);
    const artwork=quotes.map((_,n)=>OriginalStoryPlates.get("brief-"+id+"-"+n));
    const illustrated=artwork.every(Boolean);
    if(illustrated)dialog.dataset.illustrated="true";
    const rows=quotes.map((line,index)=>{
      const row=document.createElement("div"),speaker=document.createElement("strong"),words=document.createElement("p");
      const actor=index===0?1:0;
      speaker.textContent=localizedPair(Voyage.cast[actor].name);words.textContent=localizedPair(line);
      if(illustrated){
        const art=document.createElement("img"),caption=document.createElement("div");
        art.alt="";art.src=artwork[index];art.decoding="async";
        row.dataset.originalCut="brief-"+id+"-"+index;
        art.style.objectPosition=Math.round(EventPlates.horizontalFocus(row.dataset.originalCut)*100)+"% center";
        caption.className="brief-caption";caption.append(speaker,words);row.append(art,caption);
        row.onclick=()=>{if(index+1<rows.length)show(index+1,true);};
      }else{
        row.append(speaker,words);StoryFrame.portrait(row,actor,words.textContent,"brief/"+id+"/"+index);
      }
      panel.append(row);return row;
    });
    if(!illustrated)return;
    const flip=document.createElement("button");
    flip.className="control brief-page";flip.type="button";panel.append(flip);
    function show(index,remember){
      for(const [n,row] of rows.entries())row.hidden=n!==index;
      dialog.style.setProperty("--brief-scene",`url("${artwork[index]}")`);
      const advance=index+1<rows.length;
      flip.textContent=advance?tr("次の台詞 ›","다음 대사 ›"):tr("‹ 前の台詞","‹ 이전 대사");
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
    by("briefQuestion").textContent=tr("戦いの準備はいい？","전투를 준비할까요?");
    by("briefGoal").textContent=goal;
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
  function afterStory(id,advance){
    const back=!!history.state?.mapJourney||history.state?.view?.modal==="roadDialog";
    if(back)addEventListener("popstate",()=>setTimeout(()=>prepare(id,true),0),{once:true});
    advance();
    if(!back)setTimeout(()=>prepare(id,true),0);
  }
  return {tap,reset,prepare,afterStory,lines};
})();
