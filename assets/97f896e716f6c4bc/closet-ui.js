"use strict";

let gearPick=[0,0],effectPick=0;
const gearPools=[Wardrobe.boards,Wardrobe.stones];
let settingsTab="basic",settingsOrigin=0,crafting=false;
const prefNames={basic:["基本","기본"],board:["碁盤","바둑판"],stone:["碁石","바둑돌"],fx:["着手演出","착수 효과"]};
function settingsLabels(){
  el("gearHeading").textContent=el("gearDialog").dataset.equipment==="true"?ExpeditionPack.text("equipment"):t("settings");
  for(const [key,pair] of Object.entries(prefNames))el("tab-"+key).textContent=localizedPair(pair);
  el("langLabel").textContent=localizedPair(["言語","언어"]);el("soundLabel").textContent=localizedPair(["効果音","효과음"]);
}
function selectPreference(key){
  settingsTab=key;
  for(const id of Object.keys(prefNames)){el("pane-"+id).hidden=id!==key;el("tab-"+id).setAttribute("aria-selected",String(id===key));el("tab-"+id).tabIndex=id===key?0:-1;}
  el("gearDetail").hidden=key!=="board"&&key!=="stone";
  if(key==="board"||key==="stone"){const category=key==="stone"?1:0;gearPick=[category,saved.gear[category]];renderGear();}
  if(key==="fx")renderEffects();
}
for(const key of Object.keys(prefNames)){
  const tab=el("tab-"+key);tab.onclick=()=>selectPreference(key);
  tab.onkeydown=e=>{
    if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;e.preventDefault();
    const available=Object.keys(prefNames).filter(k=>!el("tab-"+k).hidden),i=available.indexOf(key);
    const next=available[e.key==="Home"?0:e.key==="End"?available.length-1:(i+(e.key==="ArrowRight"?1:available.length-1))%available.length];
    selectPreference(next);el("tab-"+next).focus();
  };
}
function openGear(dedicated=false,pref){
  dedicated=dedicated===true;
  const screen=el("gearDialog");screen.dataset.equipment=String(dedicated);
  el("tab-basic").hidden=dedicated;
  settingsOrigin=window.scrollY;effectPick=saved.fx;el("showCoords").checked=saved.coords;
  const tab=dedicated&&["board","stone","fx"].includes(pref?.tab)?pref.tab:dedicated?"board":"basic";
  settingsLabels();selectPreference(tab);
  if(dedicated&&Number.isInteger(pref?.item)&&pref.item>=0){
    if(tab==="fx"&&pref.item<BoardFX.styles.length){effectPick=pref.item;renderEffects();}
    else if(tab!=="fx"){const k=tab==="stone"?1:0;if(pref.item<gearPools[k].length){gearPick=[k,pref.item];renderGear();}}
  }
  screen.hidden=false;document.body.classList.add("in-settings");
  document.querySelector(".shell").inert=true;el("gearDialog").scrollTop=0;el("closeGear").focus({preventScroll:true});
}
function closeSettings(){
  el("gearDialog").dataset.equipment="false";el("tab-basic").hidden=false;
  el("gearDialog").hidden=true;document.body.classList.remove("in-settings");document.querySelector(".shell").inert=false;
  window.scrollTo({top:settingsOrigin,behavior:"instant"});el("personalSettings").focus({preventScroll:true});
}
el("gearDialog").addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();closeSettings();}});
// Keep the selected object's condition and action above the catalogue on a narrow screen.
el("pane-basic").before(el("gearDetail"));
el("pane-fx").prepend(el("fxPreview").closest(".gear-detail"));
function renderGear(){
  const [type,id]=gearPick, chosen=gearPools[type][id];
  for(const [category,items] of gearPools.entries()){
    el(category?"stonesList":"boardsList").replaceChildren(...items.map((item,i)=>{
      const button=document.createElement("button"),sample=document.createElement("canvas"),label=document.createElement("span");
      sample.width=120;sample.height=64;sample.setAttribute("aria-hidden","true");
      Wardrobe.swatch(sample,category,category?saved.gear[0]:i,category?i:saved.gear[1]);
      const owns=Wardrobe.owns(item,saved.expedition,saved.trials);
      button.type="button";button.dataset.item=i;button.className=owns?"owned":"locked";
      button.setAttribute("aria-pressed",String(category===type && i===id));
      label.textContent=(i===saved.gear[category]?"✓ ":"")+localizedPair(item[3]);
      button.setAttribute("aria-label",label.textContent+" · "+(owns?t("available"):t("locked"))+" · "+localizedPair(item[4]));
      button.append(sample,label);button.onclick=()=>{gearPick=[category,i];renderGear();};return button;
    }));
  }
  Wardrobe.swatch(el("gearSample"),type,type?saved.gear[0]:id,type?id:saved.gear[1]);
  el("gearName").textContent=localizedPair(chosen[3]);el("gearCondition").textContent=localizedPair(chosen[4]);
  const owns=Wardrobe.owns(chosen,saved.expedition,saved.trials),worn=saved.gear[type]===id;
  const recipe=chosen[6],mats=el("gearMaterials"),make=el("makeGear");mats.hidden=!recipe||owns;make.hidden=!recipe||owns;
  if(recipe&&owns)el("gearCondition").textContent=localizedPair(["制作済み","제작 완료"]);
  if(recipe){const available=Workshop.balance(saved.work);mats.textContent=recipe.req.flatMap((n,i)=>n?[localizedPair(Workshop.materials[i])+" "+available[i]+" / "+n]:[]).join(" · ");make.textContent=localizedPair(["制作する","제작하기"]);make.disabled=crafting||!Workshop.canMake(saved.work,recipe);}
  el("wearGear").textContent=t(worn?"equipped":owns?"equip":"locked");el("wearGear").disabled=!owns||worn;
}
function renderEffects(){
  const preview=el("fxPreview"),ctx=preview.getContext("2d");
  Wardrobe.preview(preview,saved.gear[0],saved.gear[1]);BoardFX.flourish(ctx,preview.width*.52,preview.height*.55,28,effectPick,.45,true,1);
  const which=BoardFX.styles[effectPick],owned=BoardFX.owns(effectPick,saved.expedition,saved.trials);
  el("fxName").textContent=localizedPair(which.name);el("fxCondition").textContent=localizedPair(which.condition);
  el("wearFx").textContent=t(saved.fx===effectPick?"equipped":owned?"equip":"locked");el("wearFx").disabled=!owned||saved.fx===effectPick;
  el("fxList").replaceChildren(...BoardFX.styles.map((style,id)=>{
    const b=document.createElement("button"),sample=document.createElement("canvas"),label=document.createElement("span");b.type="button";b.dataset.effect=id;
    const owns=BoardFX.owns(id,saved.expedition,saved.trials);b.className=owns?"owned":"locked";
    b.setAttribute("aria-label",localizedPair(style.name)+" · "+(owns?(saved.fx===id?t("equipped"):t("available")):t("locked"))+" · "+localizedPair(style.condition));
    b.setAttribute("aria-pressed",String(effectPick===id));sample.width=100;sample.height=55;
    Wardrobe.preview(sample,saved.gear[0],saved.gear[1]);BoardFX.flourish(sample.getContext("2d"),51,30,18,id,.42,true,1);
    label.textContent=(saved.fx===id?"✓ ":"")+localizedPair(style.name);b.append(sample,label);b.onclick=()=>{effectPick=id;renderEffects();};return b;
  }));
}
el("makeGear").onclick=async()=>{
  const [kind,id]=gearPick,recipe=gearPools[kind][id]?.[6];
  if(!recipe||crafting)return;crafting=true;el("makeGear").disabled=true;
  let failed=false,made=false;
  try{
    await FinalPost.withLock(CampaignSlots.id,()=>{
      const disk=JSON.parse(localStorage.getItem(storageKey)||"null");
      if(disk?.campaignId&&disk.campaignId!==CampaignSlots.id){failed=true;return;}
      if(disk?.work){
        const current=Workshop.read(disk.work);
        saved.work.earned=saved.work.earned.map((v,i)=>Math.max(v,current.earned[i]));
        saved.work.made=saved.work.made.map((v,i)=>v|current.made[i]);
      }
      const prior=saved.work.made[kind];
      made=Workshop.make(saved.work,recipe);if(made&&!save()){saved.work.made[kind]=prior;failed=true;made=false;}
    });
  }catch{failed=true;}
  finally{
    crafting=false;renderGear();
    if(made&&gearPick[0]===kind&&gearPick[1]===id&&!el("gearDialog").hidden)el("wearGear").focus({preventScroll:true});
    if(failed&&gearPick[0]===kind&&gearPick[1]===id)el("gearCondition").textContent=localizedPair(["保存できませんでした。素材を確認してもう一度。","저장하지 못했어요. 재료를 확인하고 다시 시도하세요."]);
  }
};
el("wearFx").onclick=()=>{
  if(!BoardFX.owns(effectPick,saved.expedition,saved.trials))return;
  const prior=saved.fx;saved.fx=effectPick;const ok=save();if(!ok)saved.fx=prior;
  renderEffects();if(!ok)el("fxCondition").textContent=localizedPair(["保存できませんでした。","저장하지 못했어요."]);
};
el("showCoords").onchange=event=>{saved.coords=event.target.checked;document.body.classList.toggle("with-coords",saved.coords);save();};
el("personalSettings").onclick=openGear;
el("closeGear").onclick=closeSettings;
el("wearGear").onclick=()=>{
  const [category,id]=gearPick;
  if(!Wardrobe.owns(gearPools[category][id],saved.expedition,saved.trials))return;
  const prior=saved.gear[category];saved.gear[category]=id;const ok=save();if(!ok)saved.gear[category]=prior;
  drawWood();boardView();renderGear();if(!ok)el("gearCondition").textContent=localizedPair(["保存できませんでした。","저장하지 못했어요."]);
};
for(const [selector,labels] of [[".x-axis","ABCDEFGHJ"],[".y-axis","987654321"]]){
  document.querySelector(selector).replaceChildren(...[...labels].map(c=>{
    const label=document.createElement("span");label.textContent=c;return label;
  }));
}
function drawForestDepth(w,h,time,zone){
  if(zone!==0)return;
  ctx.save();
  for(let layer=0;layer<2;layer++){
    const speed=layer?32:13,width=layer?17:9;
    ctx.fillStyle=layer?"#18372f94":"#40695055";
    for(let i=0;i<6;i++){
      const x=((i*179+44-time*speed)%(w+200)+w+200)%(w+200)-110;
      ctx.fillRect(x,0,width,h*.8);
      for(let j=0;j<3;j++){ctx.fillRect(x-19+j*5,h*(.14+j*.14),25,5);ctx.fillRect(x+12,h*(.21+j*.12),22,5);}
    }
  }
  ctx.restore();
}
// Props react to the board result. Point coordinates and legal moves stay in the Go engine.
function drawStoryAction(c,site,round,status,age,w,ground){
  const won=status==="phase"||status==="won",t=won?Math.min(1,age/.85):0;
  const counter=status==="retry"?1:0,x=w*.49,y=ground-3;
  c.save();c.translate(x,y);c.lineCap="round";
  const block=(color,x,y,width,height)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),width,height);};
  if(site===0){
    // A pinned mail sack loosens and Lulu emerges after the final capture.
    block("#69513b",-22,-16,43,16);block("#be975e",-19,-19,37,16);block("#dfb772",-15,-16,18,4);
    block("#72533c",-12,-23,22,5);
    for(let i=round;i<3;i++){const fly=i===round?t:0;block("#5d695a",-23+i*15+fly*18,-25+fly*17-Math.sin(fly*Math.PI)*18,12,7);}
    if(round===2&&won)ExpeditionCast.party(c,1,t*17,-4,26*t);
  }else if(site===2){
    // Each connection ties a rope. The rescued sailor rides the skiff to shore.
    const boat=23-Math.round(round===2?t*43:0)+counter*9;
    block("#724f39",boat-18,-5,37,5);block("#caa375",boat-15,-8,29,3);
    for(let i=0;i<2;i++){block("#96744f",-34+i*21,-17,5,18);block("#e3bc7c",-34+i*21,-18,5,3);}
    const ropes=Math.min(2,round+(won?1:0));for(let i=0;i<ropes;i++){
      c.strokeStyle="#e7ca8a";c.lineWidth=2;c.beginPath();c.moveTo(-31+i*21,-13);c.quadraticCurveTo(-4,-2,boat+8,-9);c.stroke();
    }
    if(round===2)ExpeditionCast.party(c,1,boat,-7,26);
  }else{
    const count=round+(won?1:0);
    block("#68533e",-40,-4,82,5);
    for(let i=0;i<4;i++){const down=i===round?Math.round((1-t)*8):0;if(i<count||i===round){block("#ab8254",-37+i*19,-9+down,16,7);block("#e5bc7b",-37+i*19,-9+down,15,2);}}
    if(status==="waiting"||counter){const f=counter?1:Math.min(1,age*1.8);block("#e6e5c8",-17+f*37,-16-Math.sin(f*Math.PI)*12,7,5);}
  }
  c.restore();
}
function drawWaterwheel(x,ground,height,time,clears){
  const radius=height*.59,cy=ground-radius*.94;
  ctx.save();ctx.translate(x+height*.27,cy);ctx.rotate(reduceMotion?0:time*.15);
  for(let k=0;k<2;k++){
    ctx.strokeStyle=k?"#d6a85e":"#483723";ctx.lineWidth=k?5:13;
    ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
  }
  for(let i=0;i<10;i++){
    ctx.rotate(Math.PI/5);ctx.fillStyle="#694e35";ctx.fillRect(-3,-radius,6,radius);
    ctx.fillStyle="#b17a4d";ctx.fillRect(-8,-radius-5,16,11);ctx.fillStyle="#efcf88";ctx.fillRect(-6,-radius-5,12,3);
  }
  ctx.restore();
  if(clears===0){
    const cx=x-height*.72,base=ground-height*.12;
    glow(cx,base-14,22,"#f2cf8055");sprite(5,cx,base,height*.26);
    ctx.save();ctx.strokeStyle="#b7915e";ctx.lineWidth=3;
    ctx.strokeRect(cx-19,base-32,38,35);
    for(let i=-1;i<=1;i++)ctx.strokeRect(cx+i*9,base-31,1,32);ctx.restore();
  }
}
