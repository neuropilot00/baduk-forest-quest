"use strict";
const ExpeditionPack=(()=>{
  const labels={inventory:["道具袋","인벤토리"],equipment:["装備工房","장비 공방"],supply:["道具・素材","보급품"],board:["碁盤","바둑판"],stone:["碁石","바둑돌"],fx:["着手演出","착수 효과"],
    ticket:["仲間の招待状","영입권"],lamp:["読みの灯","수읽기 등불"],source:["入手","획득처"],use:["使い道","사용처"],equipped:["装備中","장착 중"],party:["遠征隊へ","원정대로"],inspect:["工房で見る","공방에서 보기"],kit:["現在の装備","현재 장비"]};
  const text=k=>localizedPair(labels[k]);
  const kinds=["supply","board","stone","fx"];
  const keys=["wood","pearl","ore","frost","star"],regional=[["森の地方","숲 지역"],["川の地方","강 지역"],["炉の地方","화로 지역"],["雪の地方","서리 지역"]];
  const read=(ja,ko)=>localizedPair([ja,ko]);
  function supplies(){
    const mats=Workshop.balance(saved.work);
    const tickets=Roster.balance(saved.roster,saved.expedition),lamps=ReachJournal.balance(saved.expedition,saved.lamps,saved.reachLamps,saved.outerLamp);
    const result=[
      {key:"ticket",name:text("ticket"),qty:tickets,from:read("本街道の各地点を初めて突破すると1枚。","본 원정길의 각 지점을 처음 돌파하면 한 장."),use:read("遠征隊で1枚使い、まだ加わっていない仲間を1人招く。","원정대에서 한 장을 사용해 아직 합류하지 않은 동료 한 명을 영입해요."),button:"party",page:"party"},
      {key:"lamp",name:text("lamp"),qty:lamps,from:read("出発時に1灯。本街道の初突破ごとに1灯増える。","처음에 한 개. 본 원정길의 각 지점을 처음 돌파할 때 한 개씩 얻어요."),use:read("遠征の局面でヒントを開き、次の候補を照らす。同じ局面を再び見るときは消費しない。","원정에서 힌트를 연 뒤 다음 수의 후보를 밝힐 때 써요. 이미 밝힌 국면은 다시 볼 수 있어요.")}
    ];
    keys.forEach((key,i)=>{
      const route=i<4?localizedPair(regional[i]):"";
      const recipe=Workshop.recipes.flat().find(r=>r.req[i]&&!Workshop.owns(saved.work,r))||Workshop.recipes.flat().find(r=>r.req[i]);
      result.push({key,name:localizedPair(Workshop.materials[i]),qty:mats[i],
        from:i<4?read(route+"で勝利。再挑戦でも入手できる。",route+"에서 승리하면 얻어요. 재도전으로도 획득해요."):read("読みの挑戦を達成。","수읽기 도전을 완료하면 얻어요."),
        use:read("工房で碁盤や碁石を作る。","공방에서 바둑판과 바둑돌을 만드는 데 써요."),button:"inspect",page:"equipment",pref:{tab:recipe.type?"stone":"board",item:gearPools[recipe.type].findIndex(x=>x[6]===recipe)}});
    });return result;
  }
  function equipment(kind){
    const k=kinds.indexOf(kind)-1;
    if(k<0)return [];
    const use=kind==="fx"?read("着手と取り上げの演出に使う。","착수하거나 돌을 따낼 때 보이는 연출이에요."):kind==="board"?read("対局と稽古の盤面に使う。","대국과 훈련의 바둑판에 사용해요."):read("対局と稽古で、黒石と白石を一組で使う。","대국과 훈련에서 흑돌·백돌 한 쌍으로 사용해요.");
    return (kind==="fx"?BoardFX.styles:gearPools[k]).flatMap((item,i)=>{
      const own=kind==="fx"?BoardFX.owns(i,saved.expedition,saved.trials):Wardrobe.owns(item,saved.expedition,saved.trials);if(!own)return [];
      return [{key:kind+"-"+i,name:localizedPair(kind==="fx"?item.name:item[3]),qty:1,
        from:localizedPair(kind==="fx"?item.condition:item[4]),use,worn:(kind==="fx"?saved.fx:saved.gear[k])===i,button:"inspect",page:"equipment",pref:{tab:kind,item:i}}];
    });
  }
  function preview(c,kind,item){
    c.width=96;c.height=52;Wardrobe.swatch(c,kind==="stone",kind==="board"?item:saved.gear[0],kind==="stone"?item:saved.gear[1]);
    if(kind==="fx")BoardFX.flourish(c.getContext("2d"),48,28,16,item,.42,true,1);
  }
  function setup(panel,go){
    let tab="supply",selected=null;
    panel.innerHTML='<div class="pack-kit"><canvas id="packKitArt" width="132" height="75" aria-hidden="true"></canvas><div><h3 id="packKitTitle"></h3><p id="packKitNames"></p></div></div><div id="packTabs" role="tablist"></div><div id="packShelf" role="tabpanel"><div id="packItems"></div><section id="packInspect" aria-live="polite"><h3></h3><dl><dt></dt><dd></dd><dt></dt><dd></dd></dl><button type="button" id="packUse"></button></section></div>';
    const by=id=>panel.querySelector("#"+id),tabs=by("packTabs"),items=by("packItems"),detail=by("packInspect");
    for(const [i,kind] of kinds.entries()){
      const b=document.createElement("button");b.type="button";b.id="packTab-"+kind;b.dataset.packTab=kind;b.setAttribute("role","tab");b.setAttribute("aria-controls","packShelf");
      b.onclick=()=>{tab=kind;selected=null;render();};
      b.onkeydown=e=>{if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;e.preventDefault();
        const n=e.key==="Home"?0:e.key==="End"?kinds.length-1:(i+(e.key==="ArrowRight"?1:kinds.length-1))%kinds.length;tabs.children[n].click();tabs.children[n].focus();};tabs.append(b);
    }
    function selectEntry(row){
      selected=row.key;
      for(const b of items.children)b.setAttribute("aria-pressed",String(b.dataset.packItem===row.key));
      detail.querySelector("h3").textContent=row.name+" · "+(row.worn?text("equipped"):"×"+row.qty);
      const [dt1,dt2]=detail.querySelectorAll("dt"),[dd1,dd2]=detail.querySelectorAll("dd");
      dt1.textContent=text("source");dd1.textContent=row.from;dt2.textContent=text("use");dd2.textContent=row.use;
      const action=by("packUse");action.hidden=!row.button;action.textContent=row.button?text(row.button):"";
      action.onclick=row.button?()=>go(row.page,row.pref):null;
    }
    function render(){
      by("packKitTitle").textContent=text("kit");Wardrobe.preview(by("packKitArt"),saved.gear[0],saved.gear[1]);
      BoardFX.flourish(by("packKitArt").getContext("2d"),70,40,21,saved.fx,.45,true,1);
      by("packKitNames").textContent=[localizedPair(Wardrobe.boards[saved.gear[0]][3]),localizedPair(Wardrobe.stones[saved.gear[1]][3]),localizedPair(BoardFX.styles[saved.fx].name)].join(" · ");
      tabs.setAttribute("aria-label",text("inventory"));for(const b of tabs.children){const on=b.dataset.packTab===tab;b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;b.textContent=text(b.dataset.packTab);}
      by("packShelf").setAttribute("aria-labelledby","packTab-"+tab);
      const rows=tab==="supply"?supplies():equipment(tab);
      items.replaceChildren(...rows.map(row=>{
        const b=document.createElement("button"),pic=document.createElement("canvas"),name=document.createElement("span"),qty=document.createElement("small");
        pic.setAttribute("aria-hidden","true");b.type="button";b.dataset.packItem=row.key;b.dataset.quantity=row.qty;
        if(tab==="supply")CampAtlas.paint(pic,row.key);else preview(pic,tab,row.pref.item);
        name.textContent=row.name;qty.textContent=row.worn?"✓":"×"+row.qty;b.append(pic,name,qty);b.setAttribute("aria-label",row.name+" · "+(row.worn?text("equipped"):"×"+row.qty));b.onclick=()=>selectEntry(row);return b;
      }));
      selectEntry(rows.find(x=>x.key===selected)||rows.find(x=>tab==="supply"?x.qty>0:x.worn)||rows[0]);
    }
    return render;
  }
  return {setup,text};
})();
