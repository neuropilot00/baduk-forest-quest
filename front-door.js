"use strict";
const FrontDoor=(()=>{
  const cover=el("titleScene"),shell=document.querySelector(".shell"),canvas=el("titleArt"),ctx=canvas.getContext("2d");
  let active=false;
  const local=(ja,ko)=>localizedPair([ja,ko]);
  function paint(){
    const w=384,h=640,c=ctx;
    c.imageSmoothingEnabled=false;
    const fill=(color,x,y,sw,sh)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(sw),Math.round(sh));};
    const polygon=(color,points)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    const sky=c.createLinearGradient(0,0,0,460);sky.addColorStop(0,"#123635");sky.addColorStop(.46,"#59817b");sky.addColorStop(.79,"#e0b880");sky.addColorStop(1,"#efdca4");c.fillStyle=sky;c.fillRect(0,0,w,h);
    for(let j=-36;j<=36;j+=2){const width=Math.sqrt(36*36-j*j);fill("#ffdf91",256-width,290+j,width*2,2);}
    for(let i=0;i<18;i++)fill(i%2?"#84a198":"#d4cda4",(i*53)%410-18,221+i*7,i%5*11+11,2);
    function ridge(y,a,seed,color){const pts=[[-4,h],[-4,y]];for(let x=0;x<=388;x+=4)pts.push([x,y+Math.round((Math.sin(x/58+seed)+.61*Math.sin(x/24+seed*.7)+.25*Math.sin(x/10))*a/2)*2]);pts.push([388,h]);polygon(color,pts);}
    ridge(330,25,2,"#8d9c84");ridge(355,26,5,"#738e7f");ridge(379,29,8,"#4b756b");
    fill("#56877b",0,403,w,160);
    for(let i=0;i<180;i++){const y=406+(i*43)%140;fill(i%4?"#74a394":"#d2c58f",(i*89+(y%9)*8)%390,y,2+(i%7)*3,1+i%2);}
    const pine=(x,y,s,color)=>{for(let k=0;k<3;k++)polygon(color,[[x,y-(34+k*17)*s],[x+(19-k*4)*s,y-k*15*s],[x-(18-k*4)*s,y-k*15*s]]);fill(color,x-3*s,y-4*s,6*s,13*s);};
    for(let i=0;i<21;i++)pine(i*23-15,401+Math.sin(i)*7,0.3+(i%4)*.06,"#3f655a");
    // A bronze bell hangs between the two roofs across the river.
    fill("#3d5047",249,337,5,63);fill("#405446",281,337,5,63);
    polygon("#3f5550",[[238,344],[256,328],[265,316],[276,329],[297,342],[291,347],[241,347]]);
    polygon("#a2875a",[[247,339],[264,319],[261,333]]);fill("#e3c07a",239,342,56,2);
    fill("#d7aa67",259,346,13,13);fill("#e1bc74",256,356,19,4);fill("#5c6555",238,399,61,3);
    ridge(507,28,3,"#335c4e");ridge(531,30,7,"#294b3f");
    polygon("#a39a69",[[37,527],[121,503],[181,519],[244,514],[277,525],[211,532],[150,532],[63,560],[0,568]]);
    pine(2,547,1.82,"#203f36");pine(368,537,1.37,"#28483b");pine(388,566,2.4,"#18372f");
    for(let i=0;i<60;i++)fill(i%2?"#668360":"#78926a",(i*71)%386,518+(i*13)%20,1+i%4,2);
    ExpeditionCast.party(c,0,128,524,101);ExpeditionCast.companion(c,1,58,526,101);
    ridge(574,15,4,"#203e34");ridge(606,19,8,"#17352c");
    for(let i=0;i<32;i++)fill(i%3?"#d9bf7380":"#e8d59d",(i*83)%384,444+(i*29)%98,2,i%3?1:2);
    el("titleName").textContent=t("title");el("titlePrompt").textContent=local("タップして冒険へ","탭하여 원정 시작");
    el("titleStory").textContent=local("消えた朝の鐘","사라진 새벽종");
  }
  function show(visible){
    active=visible;cover.hidden=!visible;shell.inert=visible;document.body.classList.toggle("at-title",visible);
    if(visible){paint();el("enterGame").focus({preventScroll:true});}
    try{if(visible)sessionStorage.removeItem("bfq-entered");else sessionStorage.setItem("bfq-entered","1");}catch{}
  }
  function enter(){show(false);openMap(mapLocation());el("voyGo").focus({preventScroll:true});}
  el("enterGame").onclick=enter;
  for(const image of [CastMotion.poses,ExpeditionCast.sheet])image.addEventListener("load",()=>{if(active)paint();});
  let entered=false;try{entered=sessionStorage.getItem("bfq-entered")==="1";}catch{}
  show(!entered);
  return {show,enter,get active(){return active;}};
})();

const GameNavigation=(()=>{
  const dialogs=["gearDialog","roadDialog","matchDialog","journalDialog","trainingBackup"];
  let applying=false,returning=null,serial=0;
  const ids=s=>s?.bfq===2;
  function snapshot(){
    const root=FrontDoor.active?"title":el("voyage").hidden?"field":"map";
    const modal=FrontDoor.active?null:dialogs.find(id=>id==="gearDialog"?!el(id).hidden:el(id).open)||null;
    return {root,modal,stage:root==="field"?level:mapStage||0,track:saved.track,trial:trial?.id??-1,rank:BossMatch.rank||0,practice:!!modal&&root==="map"};
  }
  const key=s=>s.root+"-"+(s.modal||"");
  const state=(view,depth)=>({bfq:2,view,depth,id:++serial});
  let view=snapshot(),depth=view.root==="title"?0:1;
  const title=state({...view,root:"title",modal:null},0);
  if(!ids(history.state)){history.replaceState(title,"");if(depth)history.pushState(state(view,depth),"");}
  else {depth=history.state.depth;history.replaceState(state(view,depth),"");}
  function sync(){
    if(applying||returning)return;const next=snapshot(),current=history.state;
    if(!ids(current)||key(view)===key(next)){view=next;if(ids(current))history.replaceState({...current,view:next},"");return;}
    const nextDepth=next.root==="title"?0:next.root==="map"?(next.modal?2:1):(next.modal?3:2);
    if(nextDepth<depth){returning={key:key(next)};view=next;history.go(nextDepth-depth);return;}
    const entry=state(next,nextDepth);
    if(nextDepth===depth)history.replaceState(entry,"");else history.pushState(entry,"");
    depth=nextDepth;view=next;
  }
  function restore(target){
    if(BossMatch.active&&target.modal!=="matchDialog")el("matchBack").click();
    for(const id of dialogs){if(id===target.modal)continue;if(id==="gearDialog"){if(!el(id).hidden)closeSettings();}else if(el(id).open)el(id).close();}
    if(target.root==="title"){if(el("voyage").hidden)openMap(mapLocation());FrontDoor.show(true);return;}
    FrontDoor.show(false);
    if(target.root==="map"){if(el("voyage").hidden||target.stage!==mapStage)openMap(Math.min(79,target.stage));}
    else if(!el("voyage").hidden){
      if(target.trial>=0)startTrial(target.trial);
      else if(target.track==="expedition"){showField();trial=null;saved.track="expedition";startExpedition(Math.min(target.stage,saved.expedition));}
      else enterTrack(target.track);
    }
    if(!target.modal)return;
    if(target.modal==="gearDialog"){if(el("gearDialog").hidden)openGear();return;}
    if(el(target.modal).open)return;
    if(target.modal==="roadDialog")RoadTalk.open(Math.max(0,target.stage-1),target.stage);
    if(target.modal==="matchDialog")BossMatch.open(target.rank,target.practice);
    if(target.modal==="journalDialog")el("journalButton").click();
    if(target.modal==="trainingBackup")el("backup").click();
  }
  addEventListener("popstate",event=>{
    if(!ids(event.state))return;
    const target=event.state.view,now=snapshot();depth=event.state.depth;
    applying=true;
    if(!returning||key(now)===returning.key){if(key(now)!==key(target)||!returning)restore(target);}
    returning=null;view=snapshot();history.replaceState(state(view,depth),"");applying=false;
  });
  const observer=new MutationObserver(sync);
  for(const id of [...dialogs,"voyage","titleScene"])observer.observe(el(id),{attributes:true,attributeFilter:["hidden","open"]});
  return {sync};
})();
