"use strict";
// One original plate per registered stage. Missing art never borrows another
// stage's new plate. The existing renderer remains playable while art is made.
const ArenaArt=(()=>{
  const images=new Map(),frames=new Map(),w=768,h=512;
  function describe(id){
    if(!Number.isInteger(id)||id<0||id>=320)return null;
    const region=Math.floor(id/20),site=id%20,second=region<8?9:13;
    const encounter=site===6?"first-guardian":site===second?"second-guardian":site===19?"final-guardian":"field";
    return {id,region,site,encounter,source:ArenaPlates.get(id)??null};
  }
  function request(source){
    let image=images.get(source);
    if(!image){
      image=new Image();image.decoding="async";image.src=source;
      if(images.size>=6)images.delete(images.keys().next().value);
      images.set(source,image);
    }
    return image;
  }
  async function ready(id){
    const source=describe(id)?.source;
    if(!source)return false;
    const image=request(source);
    await image.decode();
    if(!image.naturalWidth||!image.naturalHeight)throw new Error("Arena image unavailable for "+id);
    return true;
  }
  function battle(id,done=false,landmark=null){
    const job=describe(id);
    if(!job?.source)return null;
    const key=id*2+Number(done);
    if(frames.has(key))return frames.get(key);
    const art=request(job.source);if(!art.complete||!art.naturalWidth)return null;
    const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;canvas.dataset.arena=String(id);
    const c=canvas.getContext("2d");
    c.imageSmoothingEnabled=true;c.drawImage(art,0,0,w,h);
    // The local mechanism is still connected to the repair state.
    if(landmark){
      c.save();c.scale(2,h/154);c.globalAlpha=job.encounter==="field"?.56:.34;
      c.imageSmoothingEnabled=false;landmark(c);c.restore();
    }
    if(frames.size>=5)frames.delete(frames.keys().next().value);
    frames.set(key,canvas);
    return canvas;
  }
  return Object.freeze({describe,ready,battle});
})();
