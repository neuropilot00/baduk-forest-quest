"use strict";
// Rare fully populated saves exceed the original JSON budget because each byte
// string is base64-encoded twice. A masked binary tuple removes field-name and
// padding overhead. The original four progress fields remain at their old slots.
const CampaignBackup=(()=>{
  const fields=[
    ["p","base64",17],["r","base64",18],["w","base64",16],["marks","base64",66],
    ["l","lamp",-33],["u","lamp",10],["h","lamp",-91],["o","hex",-11],
    ["q","number",1],["fr","number",1],["tb","number",4],["c","number",4],["g","number",2],["e","number",1],["k","number",2],["gp","number",1]
  ];
  function compact(extra){
    const packed=[1,0,0];
    for(let i=0;i<fields.length;i++){
      const [key,type,size]=fields[i],value=extra[key];if(value===undefined||key==="marks"&&value==="")continue;
      let bytes;
      if(type==="number")bytes=Array.from({length:size},(_,n)=>value>>>(8*n)&255);
      else if(type==="hex"){
        if(typeof value!=="string"||!/^([\da-f]{2})+$/i.test(value))throw Error("Invalid region progress");
        bytes=value.match(/../g).map(n=>parseInt(n,16));
      }else bytes=Array.from(atob(value),c=>c.charCodeAt(0));
      if(size>0&&bytes.length!==size||size<0&&bytes.length>-size)throw Error("Invalid campaign field "+key);
      packed[1+(i>>3)]|=1<<(i%8);if(size<0)packed.push(bytes.length);packed.push(...bytes);delete extra[key];
    }
    extra.b=btoa(String.fromCharCode(...packed));
  }
  function expand(extra){
    if(extra.b===undefined)return;
    if(typeof extra.b!=="string")throw Error("Invalid compact backup");
    const packed=Uint8Array.from(atob(extra.b),c=>c.charCodeAt(0)),mask=packed[1]|packed[2]<<8;
    if(packed[0]!==1||mask>=2**fields.length)throw Error("Unsupported compact backup");
    let pos=3;
    for(let i=0;i<fields.length;i++)if(mask&(1<<i)){
      const [key,type,size]=fields[i],n=size<0?packed[pos++]:size;
      if(!Number.isInteger(n)||n>Math.abs(size)||pos+n>packed.length||extra[key]!==undefined)throw Error("Overlapping backup fields");
      const bytes=packed.slice(pos,pos+n);pos+=n;
      if(type==="number")extra[key]=bytes.reduce((total,byte,k)=>total+byte*(256**k),0);
      else if(type==="hex")extra[key]=Array.from(bytes,v=>v.toString(16).padStart(2,"0")).join("");
      else{const str=btoa(String.fromCharCode(...bytes));extra[key]=type==="lamp"?str.replace(/=+$/,""):str;}
    }
    if(pos!==packed.length)throw Error("Trailing backup bytes");delete extra.b;
  }
  function encodeCore(data){
    if(JSON.stringify(data).length>378){data=data.slice();data[4]={...data[4]};compact(data[4]);}
    return btoa(JSON.stringify(data));
  }
  function envelope(body){
    if(body.length>1018)throw Error("Campaign backup exceeds format");
    return (body.length<=507?"IGO1.":"IGO2.")+body;
  }
  function format(data){
    if(data[4]?.reading){
      const extra={...data[4]},reading=extra.reading;delete extra.reading;
      // Small ledgers fit the old envelope. Older games ignore their optional field.
      if(!reading.core&&!reading.regions.length&&reading.book[0].length+reading.book[1].length<=8){
        const small=btoa(JSON.stringify(data));if(small.length<=1018)return envelope(small);
      }
      const core=envelope(encodeCore([...data.slice(0,4),extra]));
      const suffix=btoa(JSON.stringify(reading));
      if(suffix.length>4800000)throw Error("Reading history exceeds format");
      return "IGO3."+core+"."+suffix;
    }
    return envelope(encodeCore(data));
  }
  function parse(code){
    if(code.startsWith("IGO3.")){
      if(code.length>4801040)throw Error("backup length");
      const fields=code.split(".");
      if(fields.length!==4||!["IGO1","IGO2"].includes(fields[1]))throw Error("backup envelope");
      const data=parse(fields[1]+"."+fields[2]);
      if(!data[4]||data[4].reading!==undefined)throw Error("invalid campaign");
      data[4].reading=JSON.parse(atob(fields[3]));return data;
    }
    const valid=code.startsWith("IGO1.")&&code.length<=512||code.startsWith("IGO2.")&&code.length<=1024;
    if(!valid)throw Error("format");const data=JSON.parse(atob(code.slice(5)));
    if(Array.isArray(data)&&data[4]&&typeof data[4]==="object")expand(data[4]);return data;
  }
  return {format,parse};
})();
