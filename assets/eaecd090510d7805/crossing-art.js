"use strict";
const CrossingArt=(()=>{
  const scenes=[
    ["./cross-arena-0-west.webp","./cross-arena-0-east.webp"],
    ["./cross-arena-1-west.webp","./cross-arena-1-east.webp"],
    ["./cross-arena-2-west.webp","./cross-arena-2-east.webp"],
    ["./cross-arena-3-west.webp","./cross-arena-3-east.webp"],
    ["./cross-arena-4-west.webp","./cross-arena-4-east.webp"],
    ["./cross-arena-5-west.webp","./cross-arena-5-east.webp"],
    ["./cross-arena-6-west.webp","./cross-arena-6-east.webp"],
    ["./cross-arena-7-west.webp","./cross-arena-7-east.webp"],
    ["./cross-arena-8-west.webp","./cross-arena-8-east.webp"],
    ["./cross-arena-9-west.webp","./cross-arena-9-east.webp"],
    ["./cross-arena-10-west.webp","./cross-arena-10-east.webp"]
  ];
  const reach=["./cross-arena-reach-west.webp","./cross-arena-reach-east.webp"];
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
