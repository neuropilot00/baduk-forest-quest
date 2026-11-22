"use strict";
const MapJourney=(()=>{
  const tr=(ja,ko)=>localizedPair([ja,ko]),by=id=>document.getElementById(id);
  const key=()=>CampaignSlots.session("bfq-travel."+CampaignSlots.id);
  function read(k){
    try{return JSON.parse(sessionStorage.getItem(key()+k));}catch{return null;}
  }
  function write(k,v){
    try{if(v===null)sessionStorage.removeItem(key()+k);else sessionStorage.setItem(key()+k,JSON.stringify(v));}catch{}
  }
  function rememberView(field,data){
    const state=history.state,prior=state?.[field];
    // A map can repaint on focus, popstate or language changes without moving.
    if(!prior||Object.keys(data).every(key=>prior[key]===data[key]))return;
    history.replaceState({...state,[field]:data},"");
  }
  function mark(button,enabled=true){
    if(!enabled){delete button.dataset.travelNext;return;}
    button.dataset.travelNext="";
    button.setAttribute("aria-label",button.getAttribute("aria-label")+" · "+tr("ここへ進む","이곳으로 이동"));
  }
  function input(dialog,next){
    let press=null,dragged=false;
    const control=target=>target.closest("button,a,input,label,select,textarea,[role=button],[role=radio]");
    dialog.addEventListener("pointerdown",e=>{
      dragged=!e.isPrimary||e.button!==0;press={x:e.clientX,y:e.clientY,id:e.pointerId};
    });
    dialog.addEventListener("pointermove",e=>{
      if(press?.id===e.pointerId&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10)dragged=true;
    });
    dialog.addEventListener("pointercancel",()=>{dragged=true;press=null;});
    dialog.addEventListener("click",e=>{
      if(!dialog.open||control(e.target)||e.defaultPrevented||dragged)return;
      if(e.target===dialog){const r=dialog.getBoundingClientRect();
        if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;}
      if(window.getSelection()?.toString())return;
      next();
    });
    dialog.addEventListener("keydown",e=>{
      if(e.defaultPrevented||![" ","Enter"].includes(e.key))return;
      if(e.repeat){e.preventDefault();return;}
      if(control(e.target))return;
      e.preventDefault();next();
    });
  }
  let active=null;
  function dismiss(){
    if(!active)return;
    const {dialog,resize}=active;active=null;resize.disconnect();
    if(dialog.open)dialog.close();dialog.remove();
  }
  function story(owner,from,to,title,lines,restored=false,variant=0){
    if(active)return;
    const outer=owner==="outer",dialog=document.createElement("dialog");
    const arriving=SiteVisit.lines(outer?to:80+to);
    lines=[...lines,...arriving.map((line,i)=>[localizedPair(Voyage.cast[i?0:1].name),localizedPair(line)])];
    dialog.dataset.pages=lines.length;
    dialog.id=outer?"outerJourney":"reachJourney";
    dialog.setAttribute("aria-labelledby",outer?"outerJourneyTitle":"reachJourneyTitle");
    dialog.innerHTML='<canvas class="event-land" aria-hidden="true"></canvas><section><h3></h3><b></b><p aria-live="polite"></p><button type="button" autofocus></button></section>';
    const box=dialog.querySelector("section"),canvas=dialog.querySelector("canvas"),button=box.querySelector("button");
    box.className=outer?"outer-journey-copy":"reach-journey-copy";
    canvas.dataset.storyArt=owner+"-"+from;
    box.querySelector("h3").id=outer?"outerJourneyTitle":"reachJourneyTitle";
    box.querySelector("h3").textContent=title;
    if(outer){button.id="outerJourneySkip";box.querySelector("b").id="outerJourneySpeaker";box.querySelector("p").id="outerJourneyClue";}
    by(outer?"outerMap":"reachMap").append(dialog);
    const previous=history.state?.mapJourney,cursorKey="conversation."+owner;
    const cursor=read(cursorKey),matches=v=>v?.owner===owner&&v.from===from&&v.to===to;
    const savedPage=matches(cursor)?cursor:previous;
    let beat=restored&&matches(savedPage)?Math.min(lines.length-1,Math.max(0,savedPage.beat|0)):0;
    function nav(){return {owner,from,to,beat};}
    if(!previous)history.pushState({...history.state,mapJourney:nav()},"");
    function next(){
      if(!dialog.open)return;
      if(beat+1<lines.length){beat++;render();}
      else SiteVisit.afterStory(outer?to:80+to,()=>{dismiss();if(history.state?.mapJourney)history.back();});
    }
    function render(){
      const [speaker,line]=lines[beat];dialog.dataset.beat=beat;
      box.querySelector("b").textContent=speaker;box.querySelector("p").textContent=line;
      button.textContent=beat+1===lines.length?tr("戦闘準備へ","전투 준비로"):tr("つづき　›","계속　›");
      StoryFrame.portrait(box,speaker,line,owner+"/"+from+"/"+beat);
      // The dialog is one history entry. Paging it should not spend WebKit's
      // navigation quota while a player taps through a conversation.
      write(cursorKey,nav());
      if(dialog.open)paint();
    }
    const paint=StoryFrame.travel(dialog,canvas,{from,to,theme:owner,variant});
    const repaint=()=>{if(dialog.open)paint();};
    const resize=new ResizeObserver(repaint);
    active={dialog,resize,repaint};button.onclick=next;
    dialog.oncancel=e=>{e.preventDefault();dismiss();if(history.state?.mapJourney)history.back();};
    input(dialog,next);dialog.showModal();resize.observe(canvas);render();
  }
  addEventListener("tailwaterwaysready",()=>active?.repaint(),true);
  addEventListener("popstate",e=>{if(active&&!e.state?.mapJourney)dismiss();},true);
  // On the main road there is a physical exit from each chapter and an entrance in the next.
  function pending(){
    const id=read("road");
    return Number.isInteger(id)&&id>=0&&id<79&&id<saved.expedition&&id===saved.location?id:null;
  }
  function shelf(viewport,nodes){
    const group=document.createElement("div"),dock=document.createElement("div");
    group.className="route-panel";dock.className="route-dock";viewport.before(group);
    group.append(viewport,dock);dock.append(...nodes);return dock;
  }
  function trace(c,points){
    if(!points||points.length<2)return;
    c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    c.lineJoin="round";c.lineWidth=3;c.strokeStyle="#876f49";c.stroke();
    c.setLineDash([3,4]);c.lineWidth=2;c.strokeStyle="#fff1a9";c.stroke();c.restore();
  }
  function restored(){
    for(const k of ["road","talk","conversation.reach","conversation.outer","delta",...Array.from({length:11},(_,i)=>"outer"+i)])write(k,null);
  }
  return {read,write,rememberView,mark,input,story,pending,shelf,trace,restored};
})();
