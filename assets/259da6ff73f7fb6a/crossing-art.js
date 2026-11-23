"use strict";
const CrossingArt=(()=>{
  const scenes=[
    ["../eaecd090510d7805/cross-arena-0-west.webp","../eaecd090510d7805/cross-arena-0-east.webp"],
    ["../eaecd090510d7805/cross-arena-1-west.webp","../eaecd090510d7805/cross-arena-1-east.webp"],
    ["../eaecd090510d7805/cross-arena-2-west.webp","../eaecd090510d7805/cross-arena-2-east.webp"],
    ["../eaecd090510d7805/cross-arena-3-west.webp","../eaecd090510d7805/cross-arena-3-east.webp"],
    ["../eaecd090510d7805/cross-arena-4-west.webp","../eaecd090510d7805/cross-arena-4-east.webp"],
    ["../eaecd090510d7805/cross-arena-5-west.webp","../eaecd090510d7805/cross-arena-5-east.webp"],
    ["../eaecd090510d7805/cross-arena-6-west.webp","../eaecd090510d7805/cross-arena-6-east.webp"],
    ["../eaecd090510d7805/cross-arena-7-west.webp","../eaecd090510d7805/cross-arena-7-east.webp"],
    ["../eaecd090510d7805/cross-arena-8-west.webp","../eaecd090510d7805/cross-arena-8-east.webp"],
    ["../eaecd090510d7805/cross-arena-9-west.webp","../eaecd090510d7805/cross-arena-9-east.webp"],
    ["../eaecd090510d7805/cross-arena-10-west.webp","../eaecd090510d7805/cross-arena-10-east.webp"]
  ];
  const reach=["../eaecd090510d7805/cross-arena-reach-west.webp","../eaecd090510d7805/cross-arena-reach-east.webp"];
  const source=(region,route)=>(region===null?reach:scenes[region])?.[route-1];
  function load(region,route,ready){
    const image=new Image();image.decoding="async";image.dataset.crossArena=(region??"reach")+"-"+route;
    image.src=source(region,route);
    image.decode().then(ready,ready);
    return image;
  }
  function paint(canvas,arena,fallback,height){
    const original=!!arena?.naturalWidth;
    if(original)canvas.dataset.crossArena=arena.dataset.crossArena;else delete canvas.dataset.crossArena;
    return drawFieldScenery(canvas,canvas.getContext("2d"),original?arena:fallback(),480,height);
  }
  return {source,load,paint};
})();
