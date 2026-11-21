"use strict";
// Each key is one finished illustration or one bounded panel of a painted atlas.
// The camera can reframe an existing panel without creating a new artwork.
window.EventPlates=(()=>{
  const files={},images=new Map(),frames=new WeakMap();
  function atlas(file,cols,rows,keys){
    keys.forEach((key,i)=>{files[key]={file,cols,rows,i};});
  }
  const paintings={sack:"./story-panel-mail-sack.webp",oar:"./story-panel-broken-oar.jpg",ferry:"./story-panel-ferry-line.jpg",joint:"./story-panel-bridge-joint.jpg",
    seal:"./story-panel-wax-letter.jpg",paint:"./story-panel-oar-paint.jpg",tracks:"./story-panel-mud-tracks.jpg",wheel:"./story-panel-waterwheel.jpg",tooth:"./story-panel-gate-tooth.jpg",
    post:"./story-panel-flooded-post.jpg",quarry:"./story-panel-ash-quarry.jpg",snow:"./story-panel-snow-lantern.jpg"};
  for(const [key,name] of Object.entries(paintings))atlas(name,1,1,[key]);
  atlas("./event-river-crafts.webp",2,2,["tide-dial","inkstone","scale-dock","winter-ferry"]);
  atlas("./event-name-tags.webp",2,2,["drying-bank","wet-tags","tag-light","postmarks"]);
  atlas("./forest-panoramas.webp",2,3,["forest","landing","timber","fort","mill","creek"]);
  atlas("./district-panoramas.webp",2,3,["posthouse","furnace","snowpass","summit","glass","orrery"]);
  atlas("./event-trade-routes.webp",3,3,["ledger","kiln-test","snow-survey","mill-repair","levee-badge","lampwatch","boot-shelf","gorge-post","quiet-levers"]);
  atlas("./event-waterways.webp",2,4,["flour","levee","nightlamp","bootpost","gorge","inkfield","balance","silent"]);
  atlas("./riverbanks-restored.webp",2,1,["west-bridge","east-gate"]);

  // Source establishing shots follow the actual object at every original location.
  // The six tags appear both as they are discovered (9→10) and laid out to dry (10→11).
  const main=[
    "sack oar ferry tracks joint wheel creek tooth fort tooth wet-tags wet-tags landing ferry creek fort forest timber fort landing",
    "seal posthouse posthouse timber posthouse post posthouse post post seal landing creek landing creek landing seal posthouse seal seal quarry",
    "quarry quarry quarry furnace furnace furnace furnace furnace quarry furnace furnace furnace quarry furnace tooth tooth east-gate creek furnace furnace",
    "snow snowpass snowpass snow snow snowpass snowpass snowpass snowpass snowpass fort snowpass snow snowpass snowpass snowpass snowpass snowpass snowpass snow"
  ].flatMap(row=>row.split(" "));
  const reach="sack creek landing timber landing west-bridge creek timber west-bridge east-gate mill posthouse post creek creek posthouse timber east-gate fort posthouse".split(" ");
  const outerPrimary=["summit","glass","orrery","flour","levee","nightlamp","bootpost","gorge","inkfield","balance","silent"];
  // Visual anchors in the scene, left-to-right. These are photographic camera
  // choices for the actual district plates, not generated actors or floating props.
  const personnel=["snow-survey","kiln-test","tide-dial","mill-repair","levee-badge","lampwatch","boot-shelf","gorge-post","inkstone","scale-dock","quiet-levers"];
  const visits=[
    [0,2,3,5,6,7,10,11,13,14,17,19], [0,2,3,6,9,11,12,13,15,16,18,19], [0,1,3,5,7,9,10,12,13,14,15,16,18,19],
    [0,1,2,3,5,6,7,9,12,13,14,15,17,19], [0,1,2,3,4,6,8,10,11,12,13,17,19],
    [0,1,3,4,5,6,7,8,10,11,13,14,15,16,18,19], [0,1,3,4,6,8,9,10,11,12,13,14,15,16,17,18,19],
    [0,2,4,6,7,8,9,10,12,13,16,17,18,19], [0,1,3,4,5,6,8,9,10,11,12,13,15,16,17,18,19],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19], [0,1,2,3,4,6,7,8,9,10,11,12,13,14,15,17,18,19]
  ];
  const roadInsert={
    20:"ledger",22:"ledger",24:"ledger",25:"ledger",27:"ledger",28:"ledger",29:"ledger",
    30:"lampwatch",31:"lampwatch",32:"lampwatch",34:"ledger",35:"ledger",36:"ledger",37:"ledger",38:"ledger",39:"kiln-test",
    43:"kiln-test",44:"kiln-test",45:"kiln-test",47:"kiln-test",48:"quarry",49:"kiln-test",50:"kiln-test",51:"kiln-test",52:"kiln-test",53:"kiln-test",
    55:"quiet-levers",56:"quiet-levers",57:"kiln-test",60:"snow-survey",61:"snow-survey",62:"snow-survey",63:"snow-survey",64:"snow-survey",
    65:"winter-ferry",66:"winter-ferry",67:"winter-ferry",68:"winter-ferry",69:"winter-ferry",70:"ledger",71:"snow-survey",72:"snow-survey",73:"winter-ferry",74:"snow-survey",76:"winter-ferry",77:"winter-ferry",78:"ledger"
  };
  const focal=[
    [26,67,19,45,74,35,58,73,26,50,72,43,31,67,74,51,25,46,70,51],
    [12,28,52,70,80,61,73,47,27,50,41,39,24,68,73,68,51,29,74,48],
    [74,48,28,33,57,69,42,24,70,50,21,56,76,34,68,30,44,62,79,54],
    [42,58,36,76,49,30,65,56,73,46,42,34,68,44,26,73,55,43,63,45],
    [27,58,43,70,34,78,51,64,45,53,25,37,64,74,52,32,57,78,51,43],
    [72,38,24,51,76,47,69,32,51,66,28,76,60,49,37,29,70,57,35,62],
    [31,52,68,37,75,42,26,65,51,39,62,78,43,29,67,36,72,57,31,49],
    [25,47,74,36,66,53,72,31,42,61,76,37,51,67,35,52,71,36,64,48],
    [67,49,29,73,42,62,35,56,74,39,64,28,72,51,46,73,28,65,40,53],
    [31,67,41,76,53,39,65,32,48,71,38,60,77,39,53,68,30,42,72,48],
    [56,27,71,43,65,38,73,43,29,55,74,39,66,27,51,77,43,64,38,53]
  ];
  const shot=(plate,x=.5,zoom=1,y=.5)=>({plate,x,y,zoom});
  // A close detail of a tool can follow its district's establishing shot.
  // Tight crops keep incidental actors or an unrelated skyline outside the frame.
  const details={
    rope:shot("ferry",.40,2.45,.99),timber:shot("joint",.52,1.75,.88),
    ink:shot("seal",.48,2.05,.73),gear:shot("wheel",.52,1.72,.45),
    rock:shot("quarry",.44,1.85,.77),iron:shot("tooth",.55,2.12,.51),
    sack:shot("sack",.52,1.52,.65),tracks:shot("tracks",.48,1.95,.98),
    wax:shot("wet-tags",.92,2.3,.83),water:shot("post",.55,1.72,.51)
  };
  const deltaDetails="sack rope - timber rope timber - - rope iron gear water wax rope - ink timber - iron water".split(" ");
  const districtDetails=[
    "sack rope rock - timber rope - - - iron - - timber - - - rock - - -",
    "- iron - - - rock timber - - gear - - timber - - - rock - ink -",
    "wax rope - rock timber rock rope - - iron - rope ink - - - - water - -",
    "- sack gear rock - timber gear rope wax - - - iron gear - timber - sack - gear",
    "timber iron - iron iron tracks rock timber ink gear timber iron timber iron - timber rock timber timber iron",
    "- - timber timber - rock - - rope - - - timber - - - rope rope - iron",
    "tracks rope tracks sack iron tracks ink - - - - wax - ink sack - wax timber ink sack",
    "rock rope - rock rope timber rock rock rope timber - rock rock - - - tracks rope - rock",
    "ink timber - - - rock - - ink - wax - timber - - rock ink ink - -",
    "rope rope - - timber gear rock - iron iron timber water timber - - - ink water - -",
    "- rope iron - timber rock - - - iron - rope iron - timber - ink timber - iron"
  ].map(s=>s.split(" "));
  function detailFor(row,n,beat){
    return beat===2?details[row[n]]:null;
  }
  function select(owner,from,to,beat=0){
    if(!Number.isInteger(from)||!Number.isInteger(to)||!Number.isInteger(beat)||beat<0)return null;
    if(owner==="road"){
      if(from<0||from>=79||to!==from+1)return null;
      const fixed=window.StoryPanels?.authored(from,beat);if(fixed)return fixed;
      const count=from<19?RoadForest.lines(from).length:RoadChapters.lines(from).length;
      // Later dialogue pages belong to the destination, independently of speakers.
      const id=beat>=count?to:from,near=beat%2===1;
      if(from===9&&id===10)return near?shot("wet-tags",.5,1):shot("drying-bank",.48,1,.59);
      if(from===10){
        if(beat===0)return shot("tag-light",.56,1,.45);
        if(beat===1)return shot("wet-tags",.5,1);
        return shot("postmarks",near?.64:.51,near?1.09:1,.68);
      }
      if(from===11&&beat===0)return shot("postmarks",.53,1.08,.69);
      if(from===11&&beat===1)return shot("landing",.63,1.12);
      if(!near&&roadInsert[id])return shot(roadInsert[id],.50,1,.53);
      return shot(main[id],near?.62:.43,near?1.13:1,.5);
    }
    if(owner==="reach"){
      const id=beat===0?from:to;
      if(id===-1||id===-2)return shot(id===-1?"west-bridge":"east-gate",.52);
      if(id<0||id>=20)return null;
      if(beat===0||beat===3){
        const action={2:"mill-repair",5:"levee-badge",7:"levee-badge",9:"quiet-levers",10:"mill-repair",11:"ledger",12:"ledger",14:"levee-badge",16:"levee-badge",17:"quiet-levers",19:"ledger"}[id];
        if(action)return shot(action,.5,1,.55);
      }
      return detailFor(deltaDetails,id,beat)||shot(reach[id],beat===1?.65:beat===3?.35:.48,beat===3?1.2:1,.52);
    }
    if(owner==="outer"){
      const id=beat===0?from:to,r=Math.floor((id-100)/20),n=(id-100)%20;
      if(!outerPrimary[r]||n<0)return null;
      const center=focal[r][n]/100;
      if((beat===0||beat===3)&&visits[r].includes(n)&&personnel[r])return shot(personnel[r],beat?.59:.5,beat?1.08:1,.53);
      return detailFor(districtDetails[r],n,beat)||shot(outerPrimary[r],beat===2?1-center:center,beat===3?1.20:beat===1&&n%3?1.08:1,.54);
    }
    return null;
  }
  function picture(file){
    if(images.has(file))return images.get(file);
    const image=new Image();
    const rec={image,loaded:false,failed:false};
    rec.promise=new Promise(resolve=>{
      image.onload=()=>{rec.loaded=true;resolve(true);};
      image.onerror=()=>{rec.failed=true;resolve(false);};
    });
    images.set(file,rec);image.src=file;return rec;
  }
  function ready(owner,from,to,beat){
    const view=select(owner,from,to,beat);return view?picture(files[view.plate].file).promise:Promise.resolve(false);
  }
  function warm(owner,from,to,beat=0){ready(owner,from,to,beat);ready(owner,from,to,beat+1);}
  function draw(canvas,owner,from,to,beat=0){
    const view=select(owner,from,to,beat);if(!view)return false;
    const host=canvas.closest("dialog"),box=canvas.getBoundingClientRect();if(!host||!box.width||!box.height)return true;
    const art=files[view.plate],rec=picture(art.file);
    host.classList.add("painted-road");canvas.style.imageRendering="auto";
    const caption=host.querySelector(".road-words,.reach-journey-copy,.outer-journey-copy");
    const scale=Math.min(devicePixelRatio||1,1.5,1920/box.width,1920/box.height);
    const w=Math.round(box.width*scale),h=Math.round(box.height*scale);
    const wide=owner==="road"&&box.width>=600&&box.width/box.height>=1.26;
    const outside=caption?.getBoundingClientRect();
    const contentWidth=wide?Math.round((outside?outside.left-box.left:w*.67/scale)*scale):w;
    const contentHeight=wide?h:Math.min(h,Math.max(h*.48,Math.round((outside?outside.top-box.top:box.height*.73)*scale+20*scale)));
    const stamp=[owner,from,to,beat,w,h,wide,contentWidth,contentHeight].join("/");
    const expected=rec.loaded?"ready":rec.failed?"error":"loading";
    if(frames.get(canvas)===stamp&&canvas.dataset.plateState===expected)return true;
    frames.set(canvas,stamp);
    if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
    canvas.dataset.plateKey=view.plate;canvas.dataset.plateState=expected;
    if(owner==="reach")canvas.dataset.deltaPicture=(beat?to:from)+(beat?"-approach":"-repaired");
    delete canvas.dataset.roadHabitat;
    const c=canvas.getContext("2d");c.fillStyle="#192b2a";c.fillRect(0,0,w,h);
    if(!rec.loaded){
      delete canvas.dataset.panel;
      if(!rec.failed)rec.promise.then(()=>{if(host.open&&frames.get(canvas)===stamp)draw(canvas,owner,from,to,beat);});
      return true;
    }
    const sizeX=rec.image.naturalWidth/art.cols,sizeY=rec.image.naturalHeight/art.rows;
    const sx=art.i%art.cols*sizeX+1,sy=Math.floor(art.i/art.cols)*sizeY+1,sw=sizeX-2,sh=sizeY-2;
    const aspect=sw/sh;
    const cw=Math.max(1,contentWidth),ch=Math.max(1,contentHeight);
    // On a portrait phone, do not blow an ultrawide regional panorama up to
    // the eye of a keyhole. A near-square crop keeps the landmark and its setting.
    const minAspect=view.plate==="wet-tags"?.94:aspect>1.7?.77:.73;
    const visibleH=Math.min(ch,cw/minAspect);
    const magnify=Math.max(cw/sw,visibleH/sh)*view.zoom;
    const dw=sw*magnify,dh=sh*magnify;
    const left=(cw-dw)*view.x,top=(visibleH-dh)*view.y+(ch-visibleH)*.16;
    const paint=(x,y,width,height)=>c.drawImage(rec.image,sx,sy,sw,sh,x,y,width,height);
    c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
    // Behind the uncropped evidence, extend its ink and light as a subdued matte.
    if(top>0){
      c.drawImage(rec.image,sx,sy,sw,Math.max(1,sh*.012),left,0,dw,top+1);
      const sky=c.createLinearGradient(0,0,0,top);sky.addColorStop(0,"#142424b3");sky.addColorStop(1,"#14242400");
      c.fillStyle=sky;c.fillRect(0,0,w,top);
    }
    c.save();c.beginPath();c.rect(0,Math.max(0,top),cw,Math.max(1,Math.min(h,top+dh)-Math.max(0,top)));c.clip();paint(left,top,dw,dh);c.restore();
    if(wide){
      const shade=c.createLinearGradient(cw*.90,0,Math.min(w,cw+38*scale),0);shade.addColorStop(0,"#192b2a00");shade.addColorStop(1,"#192b2a");
      c.fillStyle=shade;c.fillRect(cw*.9,0,w-cw*.9,h);
    }else{
      const bottom=Math.min(h,top+dh);
      const start=Math.max(0,bottom-62*scale);
      const shade=c.createLinearGradient(0,start,0,Math.max(start+1,bottom+9*scale));
      shade.addColorStop(0,"#18292800");shade.addColorStop(.55,"#18292875");shade.addColorStop(.85,"#172927e8");shade.addColorStop(1,"#162827");
      c.fillStyle=shade;c.fillRect(0,start,w,h);
    }
    canvas.dataset.panel=view.plate;return true;
  }
  return Object.freeze({select,ready,warm,draw});
})();
