"use strict";
// Original, painted event plates. Each row is tied to one exact walking conversation.
// fx chooses the focal point when the portrait screen trims the left or right edge.
window.StoryPanels=(()=>{
  const plates={
    sack:["./story-panel-mail-sack.webp","#3d493b"],oar:["./story-panel-broken-oar.jpg","#374c50"],
    ferry:["./story-panel-ferry-line.jpg","#455751"],joint:["./story-panel-bridge-joint.jpg","#594b38"],
    seal:["./story-panel-wax-letter.jpg","#4e4436"],paint:["./story-panel-oar-paint.jpg","#524636"],
    tracks:["./story-panel-mud-tracks.jpg","#414e4d"],wheel:["./story-panel-waterwheel.jpg","#534e3c"],
    tooth:["./story-panel-gate-tooth.jpg","#464e42"],post:["./story-panel-flooded-post.jpg","#324b50"],
    quarry:["./story-panel-ash-quarry.jpg","#5d4c45"],snow:["./story-panel-snow-lantern.jpg","#283954"]
  };
  const shot=(plate,x=.5,zoom=1,y=.5)=>({plate,x,y,zoom});
  const events={
    0:[shot("sack",.53),shot("seal",.47),shot("seal",.55,1.19,.72),shot("oar",.53)],
    1:[shot("oar",.64,1.04),shot("oar",.49,1.16,.59),shot("paint",.59,1.12),
       shot("paint",.64),shot("ferry",.58)],
    2:[shot("ferry",.57),shot("ferry",.42,1.25,.79),shot("tracks",.51)],
    3:[shot("tracks",.59,1.11,.62),shot("tracks",.42,1.13,.57),shot("joint",.45)],
    4:[shot("joint",.57),shot("joint",.53,1.22,.77),shot("wheel",.59)],
    9:[shot("tooth",.56),shot("tooth",.48,1.25,.62)],
    27:[shot("post",.54),shot("post",.62,1.12,.57)],
    40:[shot("quarry",.52,1.15,.72),shot("quarry",.57)],
    59:[null,shot("snow",.52)],
    60:[shot("snow",.55,1.07,.55),shot("snow",.55)],
    62:[null,shot("snow",.46,1.05)],
    63:[null,shot("snow",.53,1.15,.58)]
  };
  const pictures=new Map();
  function get(plate){
    if(pictures.has(plate))return pictures.get(plate);
    const img=new Image();pictures.set(plate,img);
    img.onload=()=>document.dispatchEvent(new CustomEvent("storypanelready",{detail:plate}));
    img.src=plates[plate][0];return img;
  }
  const selection=(from,beat)=>events[from]?.[beat]||null;
  function warm(from,beat=0){
    const row=events[from];if(!row)return;
    const wanted=new Set(row.slice(beat,beat+2).filter(Boolean).map(s=>s.plate));
    for(const key of wanted)get(key);
  }
  function draw(canvas,from,beat){
    const s=selection(from,beat);
    if(!s){delete canvas.dataset.panel;canvas.closest("dialog")?.classList.remove("painted-road");return false;}
    const art=get(s.plate);if(!art.naturalWidth){delete canvas.dataset.panel;canvas.closest("dialog")?.classList.remove("painted-road");return false;}
    const host=canvas.closest("dialog"),box=canvas.getBoundingClientRect();
    if(!box.width||!box.height)return false;
    if(!host.classList.contains("painted-road"))host.classList.add("painted-road");
    const scale=Math.min(1.5,window.devicePixelRatio||1,1600/box.width,1700/box.height);
    const w=Math.round(box.width*scale),h=Math.round(box.height*scale);
    if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
    const wide=box.width>=600&&box.width/box.height>=1.26;
    const caption=host.querySelector(".road-words").getBoundingClientRect();
    const visibleH=wide?h:Math.min(h,Math.max(h*.52,(caption.top-box.top)*scale+24*scale));
    const visibleW=wide?Math.min(w*(box.width<800?.60:.70),h*1.24):w;
    // Keep both the character and the object of their gesture. Shorter/squarer
    // screens reveal more of the composition; extremely tall phones get a matte
    // below the painting rather than cropping both participants out.
    const side=wide?Math.max(visibleW,h)*s.zoom:Math.max(w,Math.min(visibleH,w*1.48))*s.zoom;
    const offsetX=(visibleW-side)*s.x,offsetY=(Math.min(wide?h:visibleH,side)-side)*s.y;
    const key=[from,beat,w,h,Math.round(visibleH),wide].join("/");
    if(canvas.dataset.panelFrame===key&&canvas.dataset.panel===s.plate)return true;
    const c=canvas.getContext("2d");c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
    c.fillStyle=plates[s.plate][1];c.fillRect(0,0,w,h);
    c.save();c.beginPath();c.rect(0,0,visibleW,h);c.clip();
    c.drawImage(art,offsetX,offsetY,side,side);c.restore();
    const threshold=wide?visibleW:Math.min(h,offsetY+side);
    const fade=wide?c.createLinearGradient(threshold*.90,0,w,0):c.createLinearGradient(0,threshold*.89,0,Math.max(threshold+1,h));
    fade.addColorStop(0,"#15252800");fade.addColorStop(wide?.23:.36,plates[s.plate][1]);fade.addColorStop(1,"#122627");
    if(wide){c.fillStyle=fade;c.fillRect(threshold*.9,0,w-threshold*.9,h);}
    else{c.fillStyle=fade;c.fillRect(0,threshold*.89,w,h-threshold*.89);}
    delete canvas.dataset.roadHabitat;canvas.dataset.panel=s.plate;canvas.dataset.panelFrame=key;
    return true;
  }
  // Habitats follow the original route by geography. An unillustrated line retains
  // its speaking actor, scene prop and gestures on the painted regional terrain.
  const terrain=[
    [0,1,1,2,2,4,5,4,3,4,1,1,1,1,5,5,3,3,1,6],
    [0,0,1,2,6,6,6,6,6,6,5,5,5,1,1,6,6,3,3,3],
    [7,7,7,7,7,3,3,7,2,7,7,7,7,7,7,3,7,7,7,7],
    [8,8,8,8,8,8,8,8,8,8,8,8,8,3,3,8,8,8,8,8]
  ];
  function setting(c,geom,id,beat,shot){
    if(id<0||id>79||typeof ScenicArt==="undefined"||!ScenicArt.landscape)return false;
    const cell=terrain[Math.floor(id/20)][id%20],focus=shot.pose==="inspect"?.60:shot.pose==="offer"?.42:.5;
    const land=ScenicArt.landscape(cell,focus,shot.pose==="inspect"?1.12:1);
    if(!land)return false;
    const {w,h,ground}=geom,scale=Math.max(w/land.width,h*.76/land.height);
    const dw=scale*land.width,dh=scale*land.height,left=(w-dw)*focus,top=ground-dh*.72;
    c.save();c.imageSmoothingEnabled=true;
    c.drawImage(land,0,0,land.width,5,left,0,dw,Math.max(1,top+1));
    c.drawImage(land,left,top,dw,dh);
    const bottom=Math.max(0,top+dh-1);
    if(bottom<h){c.drawImage(land,0,land.height-7,land.width,7,left,bottom,dw,h-bottom);}
    const fade=c.createLinearGradient(0,ground,0,h);
    fade.addColorStop(0,"#14252900");fade.addColorStop(1,"#142529e8");c.fillStyle=fade;c.fillRect(0,ground,w,h-ground);
    c.restore();c.canvas.dataset.roadHabitat=String(cell);return true;
  }
  return {draw,warm,selection,setting};
})();
