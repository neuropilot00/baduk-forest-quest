"use strict";
// Both plates share the same two cameras. The western bridge and eastern gate
// only switch to the repaired plate once the corresponding field event is won.
window.EventLandscapes=(()=>{
  const pictures=new Map(),frames=new Map();
  function picture(restored){
    if(pictures.has(restored))return pictures.get(restored);
    const img=new Image();pictures.set(restored,img);
    img.addEventListener("load",()=>document.dispatchEvent(new Event("riverbankartready")),{once:true});
    img.src=restored?"./riverbanks-restored.webp":"./riverbanks-before.webp";
    return img;
  }
  function compose(img,geom,kind){
    const {w,h,ground}=geom,bank=kind==="bridge"?0:1;
    const out=document.createElement("canvas");out.width=w;out.height=h;
    const ink=out.getContext("2d");ink.imageSmoothingEnabled=false;
    const sw=img.naturalWidth/2,sh=img.naturalHeight,src=sw*bank;
    // Align the walking ensemble with the dry path painted at this depth.
    const scale=w/h>1.05?Math.max(ground/(sh*.66),Math.min(w/sw,h*1.25/sh),w/(sw*1.85)):
      Math.max(w/sw,ground/(sh*.66));
    const dw=Math.ceil(sw*scale),dh=Math.ceil(sh*scale);
    const left=Math.round((w-dw)/2),top=Math.round(ground-sh*.66*scale);
    ink.fillStyle="#192826";ink.fillRect(0,0,w,h);
    if(left>0){
      // The side wings continue the near-bank foliage on very wide screens.
      ink.save();ink.translate(left,0);ink.scale(-1,1);ink.drawImage(img,src,0,sw,sh,0,top,dw,dh);ink.restore();
      ink.save();ink.translate(left+dw*2,0);ink.scale(-1,1);ink.drawImage(img,src,0,sw,sh,0,top,dw,dh);ink.restore();
    }
    ink.drawImage(img,src,0,sw,sh,left,top,dw,dh);
    const floor=top+dh;
    if(floor<h){
      ink.drawImage(out,0,floor-7,w,7,0,floor,w,h-floor);
      const shade=ink.createLinearGradient(0,floor,0,h);shade.addColorStop(0,"#10221c00");shade.addColorStop(.45,"#10221cda");shade.addColorStop(1,"#10221c");ink.fillStyle=shade;ink.fillRect(0,floor,w,h-floor);
    }
    return out;
  }
  function draw(c,geom,kind,restored){
    if(kind!=="bridge"&&kind!=="sluice")return false;
    const img=picture(restored);if(!img.complete||!img.naturalWidth)return false;
    const key=[kind,restored,geom.w,geom.h,geom.ground].join("/");
    if(!frames.has(key)){
      if(frames.size>=6)frames.delete(frames.keys().next().value);
      frames.set(key,compose(img,geom,kind));
    }
    c.drawImage(frames.get(key),0,0);
    c.canvas.dataset.bankIllustration=kind+(restored?"-restored":"-arrival");
    return true;
  }
  return {draw};
})();
