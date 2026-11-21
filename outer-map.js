"use strict";
const OuterMap=(()=>{
  const words=(ja,ko)=>localizedPair([ja,ko]),by=id=>document.getElementById(id);
  const regions=[...OuterCampaign.first,["逆巻く水車小屋","거꾸로 도는 방앗간"],["引き戸の堤防","미닫이 둑"],["夜灯の水門","야등수문"],["長靴郵便局","장화우체국"],["双口峡谷","두 입의 협곡"],["漆黒の硯田","칠흑 먹물밭"],["秤の水路","저울물길"],["無音閘門","무음갑문"]];
  const names=r=>regions[r],dots=[[115,122],[235,193],[115,276],[78,53],[148,48],[248,99],[303,140],[162,177],[86,196],[201,244],[286,266]];
  const eligible=r=>!!OuterMapArt.sites(r)&&!!OuterStory.event(100+r*20)&&OuterCampaign.districtOpen(r,saved);
  const memo=CampaignSlots.session("bfq-outer-atlas.v1");
  let received=[];
  let panel=null,region=0,id=100,outcome=false,onChart=true,selectedBranch=0,frame=0,walkLine=null;
  function historyView(){return {region,id,outcome,onChart};}
  function keep(){
    if(!active())return;const v=historyView();
    try{sessionStorage.setItem(memo,JSON.stringify(v));}catch{}
    if(history.state?.outerArea&&history.state.reachBattle===undefined&&!history.state.campRoute)history.replaceState({...history.state,outerArea:v},"");
  }
  function active(){return !!panel&&!panel.hidden;}
  function camera(x,y){const v=by("outerViewport");v.scrollTop=Math.max(0,y*v.scrollHeight/748-v.clientHeight*.52);}
  function stop(){
    if(frame)cancelAnimationFrame(frame);frame=0;walkLine=null;
    const journey=by("outerJourney");
    if(journey){
      const viewport=by("outerViewport");by("outerLocal").prepend(viewport);
      viewport.removeAttribute("inert");journey.close();journey.remove();
    }
  }
  function hide(){stop();panel.hidden=true;by("voyage").classList.remove("in-outer");try{sessionStorage.removeItem(memo);}catch{}}
  function close(){if(history.state?.outerArea)history.back();else hide();}
  function bgChart(){
    const ca=by("outerWorldArt"),c=ca.getContext("2d");c.imageSmoothingEnabled=false;
    c.fillStyle="#122d31";c.fillRect(0,0,360,319);
    const land=[[0,0],[318,0],[310,23],[330,34],[312,51],[325,63],[301,81],[346,101],[331,117],[349,139],[328,146],[335,159],[306,170],[317,188],[299,201],[341,213],[317,220],[333,239],[318,253],[331,269],[304,275],[316,292],[299,311],[312,320],[0,320]];
    function polygon(pts,fill){c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();}
    function line(pts,color,width){c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.strokeStyle=color;c.stroke();}
    polygon(land.map(([x,y])=>[x+4,y+3]),"#77908a");polygon(land,"#335248");
    const river=[[215,0],[201,21],[206,49],[183,70],[173,89],[198,108],[180,134],[216,150],[190,177],[212,196],[198,217],[219,236],[209,255],[236,274],[222,290],[243,319]];
    line(river,"#607c64",17);line(river,"#193e42",12);line(river,"#426c68",4);
    for(let k=0;k<88;k++){
      const x=12+(k*71)%291,y=9+(k*97)%300;if(Math.abs(x-207)<19)continue;
      if(y<160&&x<155){const h=4+k%8;polygon([[x-h,y+3],[x,y-h],[x+h,y+3]],"#233c37");polygon([[x-h,y+3],[x,y-h],[x-1,y+1]],"#74836a");}
      else if(y>152&&y<237&&x>178){polygon([[x-4,y+3],[x-1,y-5],[x+2,y-3],[x+6,y+3]],"#774f3f");c.fillStyle="#a48057";c.fillRect(x-1,y-4,2,2);}
      else{c.fillStyle="#54705a";c.fillRect(x,y,2,2);}
    }
    for(const chain of [[3,4,0,5,6,1,7,8,2,9,10]])line(chain.map(i=>dots[i]),"#b19869",1);
    const cx=32,cy=269;for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
      polygon([[cx,cy],[cx+dx*17+dy*3,cy+dy*17+dx*3],[cx+dx*25,cy+dy*25]],"#d2bb81");
    }
  }
  function pin(container,x,y,w,h,fn,tag){
    const b=document.createElement("button");b.type="button";b.className="reach-stop";b.style.left=x/w*100+"%";b.style.top=y/h*100+"%";b.onclick=event=>{
      fn();if(event.detail!==0)return;
      const action=by(tag[0]==="outerRegion"?"outerEnterRegion":"outerAction");
      const selected=[...container.children].find(n=>n.dataset[tag[0]]===String(tag[1]));
      (action.disabled?selected:action)?.focus({preventScroll:true});
    };b.dataset[tag[0]]=tag[1];const i=document.createElement("i");i.setAttribute("aria-hidden","true");b.append(i);container.append(b);return b;
  }
  function statePin(b,name,selected,open,done,here,boss){
    b.className="reach-stop "+(open?done?"cleared":"open":"closed")+(boss?" sentinel":"");
    b.firstChild.textContent=done?"✓":open?boss?"♜":"◆":"";
    b.setAttribute("aria-pressed",String(selected));b.setAttribute("aria-label",name+" · "+(done?t("cleared"):open?t("available"):t("locked")));
    if(here)b.setAttribute("aria-current","location");else b.removeAttribute("aria-current");
  }
  function chart(){
    by("outerChart").hidden=false;by("outerLocal").hidden=true;by("outerTitle").textContent=words("流域図","유역 지도");
    const pins=by("outerChartPins");pins.replaceChildren();bgChart();
    for(let r=0;r<regions.length;r++){
      if(!OuterMapArt.sites(r)||!OuterStory.event(100+r*20))continue;
      const [x,y]=dots[r],ok=eligible(r),name=localizedPair(names(r));
      const b=pin(pins,x,y,360,319,()=>{region=r;render();keep();},["outerRegion",r]);
      statePin(b,name,r===region,ok,OuterCampaign.cleared(saved,r)===20,false,false);
      const label=document.createElement("span");label.className="outer-region-label";label.textContent=name;b.append(label);
    }
    const entry=by("outerEnterRegion");entry.disabled=!eligible(region);entry.textContent=eligible(region)?words("この地方へ","이 지역으로"):t("locked");
    const rank=OuterCampaign.rankOf[region],ranks=[["初級","초급"],["中級","중급"],["上級","상급"],["最上級","최상급"]];
    by("outerChartName").textContent=localizedPair(names(region));by("outerRank").textContent=localizedPair(ranks[rank])+" · "+OuterCampaign.cleared(saved,region)+" / 20";
    by("outerChartClue").textContent=eligible(region)?localizedPair(OuterStory.event(100+region*20).before):words("同じ段位の前の地方を踏破しよう。","이 기력의 앞 지역을 먼저 완주하세요.");
  }
  function party(x,y,dir=0,time=0){
    const c=by("outerParty").getContext("2d");c.clearRect(0,0,384,748);c.imageSmoothingEnabled=false;
    const step=time&&!reduceMotion?Math.floor(time/120)%4:0,sign=x>116?-1:1;
    const band=Crew.formation(x+sign*64,x+sign*14,y,3);
    band.push({id:-1,x,ground:y});
    for(const a of band.sort((a,b)=>a.ground-b.ground)){
      if(a.id===-1)CastMotion.hiker(c,x,y,dir,step);else WorldScale.draw(c,a.id,a.x,a.ground,WorldScale.mapHeroPixels,0,step);
    }
  }
  function localMap(center){
    const r=region,n=OuterCampaign.local(id),finished=OuterCampaign.cleared(saved,r),route=OuterCampaign.route(saved);
    const sites=OuterMapArt.sites(r),forks=OuterMapArt.forks(r)||[],s=OuterStory.event(id);
    by("outerChart").hidden=true;by("outerLocal").hidden=false;by("outerTitle").textContent=localizedPair(names(r));
    by("outerLand").getContext("2d").drawImage(OuterMapArt.map(r,finished,route),0,0);
    if(route&&typeof OuterCrossings!=="undefined"&&OuterCrossings.done(r,saved)){
      const [x,y]=forks[route-1].mark;OuterCrossings.stamp(by("outerLand").getContext("2d"),r,route,x+4,y-14,11);
    }
    const pins=by("outerStops");pins.replaceChildren();const base=100+r*20;
    sites.forEach(([x,y],i)=>{const k=base+i,node=pin(pins,x,y,384,748,()=>{if(walkLine)return;id=k;outcome=false;selectedBranch=0;render();keep();},["outerId",k]);
      statePin(node,localizedPair(OuterStory.event(k).name),k===id&&!selectedBranch,OuterCampaign.allowed(k,saved),i<finished,i===Math.min(19,finished),OuterCampaign.boss(k));});
    (finished>=8?forks:[]).forEach((f,i)=>{const name=OuterStory.forks(r)[i].name;
      const b=pin(pins,...f.site,384,748,()=>{if(walkLine)return;selectedBranch=i+1;id=base+9;outcome=false;render();keep();},["outerPath",i+1]);
      statePin(b,localizedPair(name),selectedBranch===i+1,route===i+1,route===i+1&&typeof OuterCrossings!=="undefined"&&OuterCrossings.done(r,saved),false,false);});
    const available=OuterCampaign.allowed(id,saved),needsDecision=!route&&finished===9&&n===9;
    const branch=selectedBranch?OuterStory.forks(r)[selectedBranch-1]:null;
    const ending=outcome&&route&&OuterCampaign.boss(id)?OuterStory.ending(id,route):null;
    by("outerName").textContent=localizedPair((branch||ending||s).name);
    by("outerCount").textContent=(n+1)+" / 20"+(n<finished?"　✓":"");
    by("outerStory").textContent=branch?localizedPair(branch.before):outcome?localizedPair((ending||s).after)+" "+localizedPair((ending||s).clue):available?localizedPair(s.before):
      needsDecision?words("星水の渡しでどちらの岸を助けたか、ここまで道が続く。","별물 나루에서 도운 강가가 이곳까지 이어집니다. 우선 두 강가 중 하나를 선택하세요."):words("一つ前の場所に、続きを示す手紙がある。","바로 앞 장소에 다음 길을 여는 편지가 있습니다.");
    if(branch&&route===selectedBranch&&typeof OuterCrossings!=="undefined"&&OuterCrossings.done(r,saved)){
      by("outerStory").textContent=localizedPair(branch.after)+" "+localizedPair(branch.clue)+"　"+localizedPair(OuterCrossings.reward(r,route));
    }
    if(outcome&&received.length)by("outerStory").append("　"+received.map(([m,n])=>localizedPair(Workshop.materials[m])+" +"+n).join(" · "));
    const goal=by("outerGoal");goal.textContent=localizedPair((branch||s).goal);goal.hidden=outcome||!available;
    const letter=by("outerLetter");
    letter.hidden=id!==319||!FinalPost.ready()||outcome;
    letter.textContent=FinalPost.choice()?words("帰り便を読む","돌아오는 편지 읽기"):words("最後の配達","마지막 배달");
    const a=by("outerAction");
    a.disabled=branch?route!==selectedBranch||!available:!outcome&&!available&&!needsDecision;
    a.textContent=branch&&route!==selectedBranch?words("この便では閉鎖","이 원정에서 닫힌 길"):needsDecision?words("星水の渡しへ","별물 나루로"):outcome?id===319?words("最後の配達","마지막 배달"):n===19?words("流域図へ","유역 지도로"):words("次の場所へ歩く","다음 장소로 걷기"):n<finished?words("再挑戦","재도전"):words("現地へ入る","현장에 들어가기");
    const here=sites[outcome?n:Math.min(19,finished)];party(...here);if(center)camera(...sites[n]);
  }
  function render(center=false){
    by("outerBack").textContent=onChart?words("‹ 本街道","‹ 본 원정길"):words("‹ 流域図","‹ 유역 지도");by("outerSettings").textContent=words("設定","설정");
    if(onChart)chart();else localMap(center);
  }
  function activate(v){
    stop();region=Number.isInteger(v?.region)&&OuterMapArt.sites(v.region)?v.region:0;
    id=OuterCampaign.region(v?.id)===region?v.id:100+20*region;
    onChart=v?.onChart!==false||!eligible(region);outcome=!!v?.outcome&&OuterCampaign.local(id)<OuterCampaign.cleared(saved,region);selectedBranch=0;
    panel.hidden=false;by("voyage").classList.add("in-outer");render(true);keep();return true;
  }
  function open(event){
    if(!history.state?.outerArea)history.pushState({...history.state,outerArea:{region,onChart:true}},"");
    const shown=activate({region,onChart:true});
    if(event?.detail===0)by("outerChartPins").querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
    return shown;
  }
  function enterRegion(event){
    if(!eligible(region))return;const v={region,id:100+20*region+Math.min(19,OuterCampaign.cleared(saved,region)),onChart:false};
    history.pushState({...history.state,outerArea:v},"");activate(v);
    if(event?.detail===0)by("outerLocal").querySelector('[data-outer-id][aria-pressed="true"]')?.focus({preventScroll:true});
  }
  function win(k,haul=[]){received=haul;const r=OuterCampaign.region(k);if(r>=0)activate({region:r,id:k,outcome:true,onChart:false});}
  function walk(){
    const r=region,n=OuterCampaign.local(id);if(n===19){history.back();return;}
    const chosen=OuterCampaign.route(saved),fork=n===8&&chosen?OuterMapArt.forks(r)[chosen-1]:null;
    const line=fork?[...fork.in,...fork.out.slice(1)]:OuterMapArt.edges(r)[n];
    const e=OuterStory.event(id),ending=chosen&&OuterCampaign.boss(id)?OuterStory.ending(id,chosen):null;
    const travelStory=(fork&&OuterStory.forks(r)[chosen-1])||ending||e;
    const after=localizedPair(travelStory.after),clue=localizedPair(travelStory.clue);
    const title=localizedPair(travelStory.name)+" → "+localizedPair(OuterStory.event(id+1).name);
    const lengths=line.slice(1).map(([x,y],i)=>Math.hypot(x-line[i][0],y-line[i][1])),total=lengths.reduce((a,b)=>a+b,0);
    const time=performance.now(),duration=Math.min(8800,Math.max(4600,1900+(after.length+clue.length)*85));
    const journey=document.createElement("dialog");journey.id="outerJourney";journey.setAttribute("aria-labelledby","outerJourneyTitle");
    journey.innerHTML='<div class="outer-journey-map"></div><section class="outer-journey-copy"><div><h3 id="outerJourneyTitle"></h3><p id="outerJourneyAfter"></p><p class="outer-journey-words"><b id="outerJourneySpeaker"></b><span id="outerJourneyClue"></span></p></div><button type="button" id="outerJourneySkip" autofocus></button></section>';
    panel.append(journey);
    const viewport=by("outerViewport");journey.firstElementChild.append(viewport);viewport.setAttribute("inert","");
    by("outerJourneyTitle").textContent=title;by("outerJourneyAfter").textContent=after;
    by("outerJourneySpeaker").textContent=words("ソルビ","솔비");by("outerJourneyClue").textContent=clue;
    const skip=by("outerJourneySkip");skip.textContent=words("移動をスキップ","이동 건너뛰기");
    walkLine=line;by("outerAction").disabled=true;journey.showModal();camera(...line[0]);
    function arrive(){
      if(walkLine!==line)return;
      stop();id++;outcome=false;selectedBranch=0;render(true);keep();
      by("outerAction").focus({preventScroll:true});
    }
    skip.onclick=arrive;journey.oncancel=event=>{event.preventDefault();arrive();};
    function paint(now){
      if(walkLine!==line)return;
      const elapsed=now-time;if(elapsed>=duration){arrive();return;}
      const f=Math.min(1,elapsed/(duration*.88));let distance=f*total,i=0;
      while(i<lengths.length-1&&distance>lengths[i])distance-=lengths[i++];
      const [x,y]=line[i],[xx,yy]=line[i+1],q=lengths[i]?Math.min(1,distance/lengths[i]):1;
      const px=x+(xx-x)*q,py=y+(yy-y)*q;party(px,py,CastMotion.direction(xx-x,yy-y),f===1?0:now);camera(px,py);
      frame=requestAnimationFrame(paint);
    }
    if(reduceMotion){
      const timer=setTimeout(arrive,duration);
      journey.addEventListener("close",()=>clearTimeout(timer),{once:true});
    }else frame=requestAnimationFrame(paint);
  }
  function action(){
    if(walkLine)return;if(outcome){if(id===319&&FinalPost.ready())LastDelivery.open();else walk();return;}
    if(!OuterCampaign.route(saved)&&OuterCampaign.local(id)===9&&OuterCampaign.cleared(saved,region)===9){
      // Collapse the two cartography entries before opening the delta. Back returns to the main map.
      const rendezvous=()=>{if(history.state?.outerArea){addEventListener("popstate",rendezvous,{once:true});history.back();}else ReachMap.open();};
      rendezvous();return;
    }
    if(typeof OuterCrossings!=="undefined"&&OuterCampaign.local(id)===9&&
      (selectedBranch||OuterCrossings.required(region,saved))){
      if(!selectedBranch||selectedBranch===OuterCampaign.route(saved))OuterCrossings.enter(region,crossingReturn);
      return;
    }
    if(OuterCampaign.allowed(id,saved))SecondReach.enter(id);
  }
  function crossingReturn(r){
    if(region!==r||!active())return;selectedBranch=0;id=109+20*r;outcome=false;render(true);keep();by("outerAction").focus({preventScroll:true});
  }
  function install(){
    if(panel||typeof OuterStory==="undefined"||typeof OuterMapArt==="undefined")return;
    const e=document.createElement("button");e.id="outerAtlasOpen";e.type="button";e.onclick=open;
    const label=()=>{e.textContent=words("流域図","유역 지도");e.hidden=saved.expedition<20;};label();
    by("voyage").querySelector(".atlas-head").insertBefore(e,by("mapMenuOpen"));
    panel=document.createElement("section");panel.id="outerMap";panel.hidden=true;panel.setAttribute("aria-labelledby","outerTitle");
    panel.innerHTML='<header class="reach-top"><button type="button" id="outerBack"></button><h2 id="outerTitle"></h2><button type="button" id="outerSettings"></button></header><div id="outerChart"><div class="outer-paper"><canvas width="360" height="319" id="outerWorldArt" aria-hidden="true"></canvas><div id="outerChartPins"></div></div><section class="reach-detail"><small id="outerRank"></small><h3 id="outerChartName"></h3><p id="outerChartClue"></p><button type="button" id="outerEnterRegion"></button></section></div><div id="outerLocal" class="reach-spread" hidden><div id="outerViewport" tabindex="0"><div id="outerStageWorld"><canvas id="outerLand" width="384" height="748" aria-hidden="true"></canvas><div id="outerStops"></div><canvas id="outerParty" width="384" height="748" aria-hidden="true"></canvas></div></div><section class="reach-detail"><small id="outerCount"></small><h3 id="outerName" aria-live="polite"></h3><p id="outerStory"></p><p id="outerGoal"></p><button type="button" id="outerAction"></button><button type="button" id="outerLetter" hidden></button></section></div>';
    by("voyage").append(panel);by("outerBack").onclick=close;by("outerSettings").onclick=()=>CampMenu.open("settings");
    by("outerEnterRegion").onclick=enterRegion;by("outerAction").onclick=action;by("outerLetter").onclick=()=>LastDelivery.open();
    new MutationObserver(()=>{label();if(active()&&!walkLine)render();}).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    new MutationObserver(label).observe(by("mapCount"),{childList:true});
    addEventListener("popstate",e=>{if(e.state?.campRoute||e.state?.reachBattle!==undefined||e.state?.outerCross!==undefined)return;
      if(e.state?.outerArea)activate(e.state.outerArea);else if(active())hide();},true);
    let prior;try{prior=JSON.parse(sessionStorage.getItem(memo));}catch{}
    const pending=SecondReach.pending();
    if(!FrontDoor.active&&(prior||OuterCampaign.abs(pending))){
      const v=history.state?.outerArea||prior||{region:OuterCampaign.region(pending),id:pending,onChart:false};
      if(!history.state?.outerArea)history.replaceState({...history.state,outerArea:v},"");activate(v);
      if(history.state?.lastDelivery&&FinalPost.ready())LastDelivery.open();
      else if(OuterCampaign.abs(pending))SecondReach.resume();
      else if(typeof OuterCrossings!=="undefined"&&OuterCrossings.pending()?.region===region)OuterCrossings.resume(region,crossingReturn);
    }
  }
  document.addEventListener("DOMContentLoaded",install,{once:true});return {open,win,names,refresh:()=>{if(active())render();},get active(){return active();}};
})();
