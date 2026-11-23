"use strict";
// Old counts represent a consecutive run of real training solves. A skip is an
// exception to that run. The compact exception bitmap travels with the count.
const TrainingProgress=(()=>{
  function read(solved,skips="",limit){
    if(!Number.isInteger(solved)||solved<0||solved>limit||
       typeof skips!=="string"||skips.length>4*Math.ceil(Math.ceil(limit/8)/3))return null;
    let bytes;
    try{bytes=atob(skips);}catch{return null;}
    if(btoa(bytes)!==skips||bytes.length&&!bytes.charCodeAt(bytes.length-1))return null;
    const gap=new Set();
    for(let i=0;i<bytes.length;i++){
      const byte=bytes.charCodeAt(i);
      for(let bit=0;bit<8;bit++)if(byte&(1<<bit))gap.add(i*8+bit);
    }
    const cursor=solved+gap.size;
    if(cursor>limit||[...gap].some(serial=>serial>=cursor))return null;
    return {solved,cursor,gap};
  }
  function valid(skips,counts,limits){
    return Array.isArray(skips)&&skips.length===limits.length&&skips[0]===""&&
      skips.every((row,course)=>!!read(counts[course],row,limits[course]));
  }
  function encode(gap){
    if(!gap.size)return "";
    const bytes=new Uint8Array(Math.floor(Math.max(...gap)/8)+1);
    for(const serial of gap)bytes[serial>>3]|=1<<(serial%8);
    return btoa(String.fromCharCode(...bytes));
  }
  function merge(local,incoming){
    // An actual solve takes precedence over a skip. Only an explicit result in
    // the other history can replace it. A later cursor does not imply a solve.
    const gap=new Set();
    for(const i of local.gap)if(i>=incoming.cursor||incoming.gap.has(i))gap.add(i);
    for(const i of incoming.gap)if(i>=local.cursor)gap.add(i);
    const cursor=Math.max(local.cursor,incoming.cursor);
    return {solved:cursor-gap.size,cursor,gap};
  }
  function solve(row,serial){
    if(serial<0||serial>row.cursor||serial<row.cursor&&!row.gap.delete(serial))return;
    row.solved++;
    row.cursor=Math.max(row.cursor,serial+1);
  }
  return Object.freeze({read,valid,encode,merge,solve});
})();
