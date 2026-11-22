"use strict";

const CampMenu=(()=>{
  const localized=key=>key==="inventory"||key==="equipment"?ExpeditionPack.text(key):GameLanguage.menu(key,saved.locale);
  const create=(tag,cls,id)=>{
    const node=document.createElement(tag);if(cls)node.className=cls;if(id)node.id=id;return node;
  };
  const btn=(id,key,action)=>{
    const b=create("button","camp-choice",id);b.type="button";b.dataset.menuLabel=key;b.onclick=action;return b;
  };
  const menu=create("dialog","camp-screen","campMenu");
  menu.setAttribute("aria-labelledby","campHeading");
  const inner=create("div","camp-inner"),header=create("header","camp-head");
  const back=btn("menuBack","back",()=>history.back());back.className="camp-back";back.textContent="‹";
  const title=create("h2","","campHeading");header.append(back,title);inner.append(header);menu.append(inner);document.body.append(menu);
  const pages=Object.fromEntries(["home","party","inventory","practice","records","library"].map(id=>{
    const section=create("section","camp-pane","camp-"+id);section.hidden=true;inner.append(section);return [id,section];
  }));
  const nav=create("nav","camp-choices");pages.home.append(nav);
  const campVista="./camp-riverside-vista.webp";
  menu.style.setProperty("--camp-vista",`url("${campVista}")`);
  for(const key of ["party","inventory","equipment","practice","records","library"]){
    const action=btn("menu"+key[0].toUpperCase()+key.slice(1),key,()=>select(key));
    action.style.setProperty("--camp-sign",CampAtlas.graphic(key));nav.append(action);
  }
  const settings=el("personalSettings");settings.className="camp-settings";header.append(settings);
  settings.style.setProperty("--camp-sign",CampAtlas.graphic("settings"));
  const renderInventory=ExpeditionPack.setup(pages.inventory,(page,pref)=>select(page,pref));
  const partyCard=el("partyList").closest("section");
  pages.party.append(partyCard);
  const practiceLinks=create("div","camp-action-list");practiceLinks.append(el("campTrain"),el("campLegacy"),el("voyReview"));
  const regionLinks=create("section","camp-locations"),regionTitle=create("h3");
  regionTitle.dataset.menuLabel="regions";regionLinks.append(regionTitle,el("chapterTabs"));
  const curriculum=create("section","camp-courses"),courseTitle=create("h3");courseTitle.dataset.menuLabel="courses";
  curriculum.append(courseTitle,el("stages"));
  pages.practice.append(practiceLinks,el("trialMenu"),regionLinks,curriculum);
  pages.records.append(el("study"),el("journalButton"),el("campBackup"));
  pages.library.append(document.querySelector(".home-book"),el("fieldGuide"),el("techbook").closest("section"));
  const oldRail=document.querySelector("#battleLayout .rail");
  oldRail.hidden=true;
  const mapLinks=el("voyage").querySelector("nav.camp-links");if(mapLinks)mapLinks.hidden=true;
  // The original track controls remain available to old callbacks, while the menu presents one route to each activity.
  const legacy=create("div");legacy.hidden=true;legacy.append(el("rankRow"),el("quickTrials"));inner.append(legacy);
  const mapOpen=btn("mapMenuOpen","home",()=>open("home"));el("voyage").querySelector(".atlas-head").append(mapOpen);
  const titleOpen=btn("titleMenuOpen","home",()=>open("home"));el("titleScene").append(titleOpen);
  const fieldOpen=btn("fieldMenuOpen","home",()=>open("home"));el("mapButton").after(fieldOpen);
  for(const entry of [mapOpen,titleOpen,fieldOpen]){entry.className="camp-open";entry.setAttribute("aria-haspopup","dialog");entry.setAttribute("aria-controls","campMenu");}
  // Existing forms keep their original owners and rows. The settings section lives in this dialog's top layer.
  menu.append(el("gearDialog"));
  let current=null,basis=null,launch=null,restoring=false,focusOrigin=null,scrollOrigin=0,backgroundTrack=null;
  const screens={settings:"gearDialog",equipment:"gearDialog",backup:"trainingBackup",journal:"journalDialog"};
  const isNested=p=>Object.hasOwn(screens,p);
  const route=()=>history.state?.campRoute;
  const managesHistory=()=>!!current||restoring||!!route();
  function labels(){
    menu.querySelectorAll("[data-menu-label]").forEach(e=>{
      if(e===back){back.setAttribute("aria-label",localized("back"));return;}
      e.textContent=localized(e.dataset.menuLabel);
    });
    for(const b of [mapOpen,titleOpen,fieldOpen]){
      b.textContent=localized("menu");b.setAttribute("aria-label",localized("home"));
    }
    if(current)title.textContent=localized(current.page==="journal"?"records":current.page);
  }
  function syncControls(){
    const field=current?.origin==="field";settings.hidden=field||current?.page!=="home";
    for(const key of ["menuInventory","menuEquipment"])el(key).hidden=field;
    if(current?.page==="inventory")renderInventory();
    curriculum.hidden=journey()||!el("stages").childElementCount;
    for(const button of el("chapterTabs").children){
      const rank=Array.prototype.indexOf.call(el("chapterTabs").children,button);
      button.textContent=localizedPair(Atlas.chapters[rank].name);
    }
    if(current?.page==="library"){
      renderGuide();FieldBestiary.render(el("fieldGuide"),saved);el("fieldGuide").hidden=false;
    }
    labels();
  }
  function applyView(r){
    current=r;menu.dataset.page=r.page;
    menu.style.setProperty("--camp-current-sign",CampAtlas.graphic(({backup:"records",journal:"records"})[r.page]||r.page));
    if(!menu.open){menu.showModal();document.body.classList.add("camp-visible");}
    const gear=screens[r.page]==="gearDialog";
    inner.inert=gear;menu.setAttribute("aria-labelledby",gear?"gearHeading":"campHeading");
    const page=isNested(r.page)?r.parent:r.page;
    for(const [key,section] of Object.entries(pages))section.hidden=key!==page;
    for(const [key,id] of Object.entries(screens)){
      if(id===screens[r.page])continue;
      if(id==="gearDialog"){if(!el(id).hidden)closeSettings();}
      else if(el(id).open)el(id).close();
    }
    if(isNested(r.page)){
      if(r.page==="settings"||r.page==="equipment"){
        const dedicated=r.page==="equipment";
        if(el("gearDialog").hidden||el("gearDialog").dataset.equipment!==String(dedicated))openGear(dedicated,r.pref);
      }
      if(r.page==="backup"&&!el("trainingBackup").open)el("backup").onclick();
      if(r.page==="journal"&&!el("journalDialog").open)showJournal();
    }else{
      menu.scrollTop=0;back.focus({preventScroll:true});
    }
    syncControls();
  }
  function drop(){
    restoring=true;inner.inert=false;
    for(const [key,id] of Object.entries(screens)){
      if(id==="gearDialog"){if(!el(id).hidden)closeSettings();}
      else if(el(id).open)el(id).close();
    }
    if(menu.open)menu.close();current=null;document.body.classList.remove("camp-visible");
    if(!el("titleScene").hidden)document.querySelector(".shell").inert=true;
    if(backgroundTrack!==null){el("fieldGuide").hidden=backgroundTrack; backgroundTrack=null;}
    window.scrollTo({top:scrollOrigin,behavior:"instant"});focusOrigin?.focus({preventScroll:true});restoring=false;
  }
  function push(r){history.pushState({...basis,campRoute:r},"");applyView(r);}
  function open(page="home"){
    if(current){select(page);return;}
    if(!Object.hasOwn(pages,page)&&page!=="settings"&&page!=="equipment")return;
    basis=history.state;focusOrigin=document.activeElement;scrollOrigin=window.scrollY;backgroundTrack=el("fieldGuide").hidden;
    const activeField=el("voyage").hidden||document.querySelector("#reachBattleDialog[open],#matchDialog[open],#reachForkDialog[open],#burstDialog[open]");
    const origin=!el("titleScene").hidden?"title":activeField?"field":"map";
    if(origin==="field"&&["equipment","inventory","settings"].includes(page))return;
    if(page==="settings"||page==="equipment"){push({page,parent:"home",origin,steps:1});return;}
    push({page:"home",origin,steps:1});if(page!=="home")select(page);
  }
  function select(page,pref){
    if(!current||current.page===page||(!Object.hasOwn(pages,page)&&!isNested(page)))return;
    if(current.origin==="field"&&["equipment","inventory","settings"].includes(page))return;
    push({page,pref,parent:current.page,origin:current.origin,steps:current.steps+1});
  }
  // An activity changes the board only after the menu's entries have been removed. A close merely resumes the previous board.
  function afterClose(fn){if(!current)return;launch=fn;history.go(-current.steps);}
  function close(){if(current)history.go(-current.steps);}
  window.addEventListener("popstate",e=>{
    if(e.state?.campRoute){
      e.stopImmediatePropagation();basis={...e.state};delete basis.campRoute;
      if(!current){scrollOrigin=window.scrollY;focusOrigin=document.activeElement;backgroundTrack=el("fieldGuide").hidden;}
      restoring=true;applyView(e.state.campRoute);restoring=false;return;
    }
    if(!current)return;
    const sameBase=e.state?.id===basis?.id,action=launch;
    if(sameBase)e.stopImmediatePropagation();
    launch=null;drop();
    if(action)queueMicrotask(action);
  },true);
  menu.addEventListener("cancel",e=>{e.preventDefault();if(current)history.back();});
  function exitTo(fn){
    const atTitle=current.origin==="title";afterClose(()=>{
      if(atTitle){FrontDoor.enter();queueMicrotask(fn);}
      else fn();
    });
  }
  menu.addEventListener("click",e=>{
    const button=e.target.closest("button");if(!button||!current||button.disabled)return;
    let fn=null;
    if(button===settings){e.stopImmediatePropagation();select("settings");return;}
    if(button===el("campBackup")){e.stopImmediatePropagation();select("backup");return;}
    if(button===el("journalButton")){e.stopImmediatePropagation();select("journal");return;}
    if(button===el("campTrain"))fn=()=>enterTrack("training");
    else if(button===el("campLegacy"))fn=()=>enterTrack("story");
    else if(button===el("voyReview")||button===el("bossPractice")||el("trialChoices").contains(button))fn=()=>button.onclick();
    else if(el("chapterTabs").contains(button))fn=()=>button.onclick();
    else if(el("stages").contains(button))fn=()=>{showField();button.onclick();};
    if(fn){e.preventDefault();e.stopImmediatePropagation();exitTo(fn);}
  },true);
  // A journal is a native dialog and a sibling of this menu.
  el("enterStory").addEventListener("click",e=>{
    if(current?.page!=="journal")return;e.stopImmediatePropagation();exitTo(()=>enterTrack("story"));
  },true);
  // Keyboard Escape, browser Back and the existing forms' close buttons converge on the same history entry.
  for(const [page,id] of Object.entries(screens)){
    const target=el(id);
    const closed=()=>{if(!restoring&&current?.page===page&&(id==="gearDialog"?target.hidden:!target.open))history.back();};
    new MutationObserver(closed).observe(target,{attributes:true,attributeFilter:[id==="gearDialog"?"hidden":"open"]});
  }
  new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  labels();
  return {open,close,refresh:syncControls,managesHistory,get page(){return current?.page||null;}};
})();
