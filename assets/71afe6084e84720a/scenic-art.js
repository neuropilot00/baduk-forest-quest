"use strict";
// Each panorama has a walkable bank at the bottom. Frame a specific landmark
// while keeping this foreground at the same depth as the actual field actors.
const ScenicArt=(()=>{
  function sheet(src){
    const image=new Image(),ready=new Promise(resolve=>{
      image.onload=()=>resolve(true);image.onerror=()=>resolve(false);
    });
    image.src=src;return {image,ready};
  }
  const woods=sheet("./forest-panoramas.webp"),districts=sheet("./district-panoramas.webp"),
    places=sheet("./atlas-landmarks.webp");
  const shots=new Map(),cache=new Map();
  const shot=(id,cell,focus=.5,zoom=1)=>shots.set(id,{cell,focus,zoom});
  // The broken oar points to the skiff, then a wide shot reveals the empty landing.
  // The party approaches the jammed wheel below the rampart before seeing both towers.
  [[0,0],[1,1,.65,1.48],[2,1],[3,5,.16,1.32],[4,2],[5,4,.12,1.38],
    [6,5,.50,1.08],[7,4,.04,1.72],[8,5,.94,1.55],[9,4],[12,5,.24,1.45],
    [14,1,.60,1.18],[15,3],[16,0,.10,1.43],[18,3,.12,1.40],
    [20,6],[24,6,.15,1.26],[25,6,.36,1.42],[29,6,.05,1.6],[33,1,.84,1.42],
    [40,7,.66,1.28],[43,7,.06,1.48],[45,7,.37,1.20],[49,7],[59,7,.84,1.62],
    [60,8],[62,8,.84,1.26],[64,8,.25,1.44],[67,8,.16,1.23],[73,8,.72,1.41],[79,8,.56,1.14]
  ].forEach(row=>shot(...row));
  // One view for each distinct reach and specific approaches to its three wardens.
  const delta=[[0,6,.12,1.18],[2,1,.18,1.26],[5,2,.67,1.24],[6,5,.37,1.44],[7,1,.73,1.33],
    [8,5,.72,1.25],[9,4,.76,1.33],[13,6,.71,1.46],[16,2,.14,1.38],[19,5]];
  for(const [i,...view] of delta)shot(80+i,...view);
  for(const [area,cell] of [[100,9],[120,10],[140,11]]){
    for(const [i,focus,zoom] of [[0,.16,1.21],[3,.79,1.37],[6,.22,1.55],[9,.66,1.22],[14,.82,1.49],[19,.5,1]])
      shot(area+i,cell,focus,zoom);
  }
  // The ferry's narrow side landing recedes to the waterline below the back
  // combat lane. Its near end meets the bank; grounded creatures never stand
  // directly on the reflection at the two depths used by the approach.
  function sideLanding(c,dim){
    const tones=dim?["#293738","#50493c","#6a5c48","#80715a","#ac9573"]:["#343d3a","#685949","#8c7558","#a58a62","#c7ad81"];
    const point=(t,side)=>[285+t*120+side*(16+t*9),89+t*48-side*(3+t*2)];
    function polygon(points,fill){c.fillStyle=fill;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
    function stroke(a,b,fill,width=1){c.strokeStyle=fill;c.lineWidth=width;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();}
    for(const t of [.0,.34,.72]){
      const [x,y]=point(t,-1);
      c.fillStyle=tones[0];c.fillRect(x-1,y-1,3,7+t*5);c.fillStyle=tones[1];c.fillRect(x-1,y,1,7+t*5);
    }
    const lip=point(0,-1),end=point(1,-1);
    polygon([lip,end,[end[0],end[1]+3],[lip[0],lip[1]+2]],tones[0]);
    for(let i=0;i<21;i++){
      const near=i/21,far=(i+.91)/21;
      polygon([point(near,1),point(far,1),point(far,-1),point(near,-1)],tones[i%5===2?3:2]);
      stroke(point(near,.96),point(near,-.96),tones[1],.7);
      if(i%3!==1)stroke(point(near+.018,-.70),point(near+.024,.32+(i%2)*.27),tones[3],.6);
    }
    stroke(point(0,1),point(1,1),tones[4],.8);
    const peg=point(.04,-1);c.fillStyle=tones[0];c.fillRect(peg[0]-1,peg[1]-4,2,5);
    c.fillStyle=tones[4];c.fillRect(peg[0]-1,peg[1]-4,2,1);
  }
  function compose(view,key,prop,stage){
    const source=(view.cell<6?woods:districts).image;
    if(!source.complete||!source.naturalWidth)return null;
    const prior=cache.get(key);if(prior)return prior;
    const w=source.naturalWidth/2,h=source.naturalHeight/3,i=view.cell%6;
    const cutW=Math.floor((w-2)/view.zoom),cutH=Math.floor((h-2)/view.zoom);
    const x=(i%2)*w+1+Math.round((w-2-cutW)*view.focus),y=Math.floor(i/2)*h+1+Math.round((h-2-cutH)*.90);
    const frame=document.createElement("canvas");frame.width=w;frame.height=h;
    const c=frame.getContext("2d");c.imageSmoothingEnabled=false;c.drawImage(source,x,y,cutW,cutH,0,0,w,h);
    if(stage!==undefined&&[1,5,6,11].includes(view.cell)){
      c.save();c.scale(w/384,h/154);sideLanding(c,view.cell===5||view.cell===11);c.restore();
    }
    if(prop){c.save();c.scale(w/384,h/154);prop(c);c.restore();}
    if(cache.size>=10)cache.delete(cache.keys().next().value);cache.set(key,frame);return frame;
  }
  function battle(id,restored=false,prop=null){
    const view=shots.get(id);
    return view?compose(view,"stage:"+id+":"+Number(restored)+":"+Number(!!prop),prop,id):null;
  }
  function landscape(cell,focus=.5,zoom=1){
    if(!Number.isInteger(cell)||cell<0||cell>11)return null;
    focus=Math.max(0,Math.min(1,focus));zoom=Math.max(1,Math.min(2,zoom));
    return compose({cell,focus,zoom},"land:"+[cell,focus,zoom].join("/"),null);
  }
  // The enclosed records desk, casting mold and ice cave have no outdoor view.
  const enclosed=new Set([35,51,61]);
  // Columns are plate, focal point (% across the plate), crop factor (100 = wide).
  // Rows follow the actual site order, starting at the reed beds after the wheel.
  const approaches=new Map();
  const locations=[
    [10,1,94,146],[11,0,14,127],[13,2,81,119],[17,3,84,128],[19,5,11,136],
    [21,6,86,136],[22,5,12,120],[23,5,77,134],[26,6,3,147],[27,1,97,169],
    [28,6,83,157],[30,5,36,125],[31,1,94,135],[32,5,4,152],[34,6,9,131],
    [36,3,86,159],[37,5,87,139],[38,5,71,156],[39,11,19,136],
    [41,7,5,165],[42,7,70,149],[44,7,17,157],[46,7,8,135],[47,7,5,171],
    [48,7,98,158],[50,7,17,174],[52,7,4,154],[53,7,27,147],[54,7,56,143],
    [55,7,94,132],[56,7,49,128],[57,7,28,134],[58,7,10,151],
    [63,8,7,135],[65,8,74,119],[66,8,99,148],[68,8,71,151],[69,8,4,146],
    [70,8,3,170],[71,8,31,142],[72,8,86,149],[74,9,11,147],[75,9,7,126],
    [76,8,16,155],[77,8,95,165],[78,8,88,124],
    // Orchard stakes, tide-line, raft, runoff, salt stores, bell and chart sluice.
    [81,1,97,139],[83,0,75,143],[84,1,76,154],[90,5,69,131],[91,6,11,150],
    [92,6,79,143],[94,6,22,134],[95,5,10,149],[97,6,83,156],[98,5,78,137]
  ];
  for(const [id,cell,focus,zoom] of locations)approaches.set(id,{cell,focus:focus/100,zoom:zoom/100});
  // A measured cliff face behind a pulley is framed differently from a flat
  // reading desk. The camera favors either the workpiece or its distant destination.
  const outerWindows=[
    [[1,86,151],[2,96,141],[4,75,138],[5,91,175],[7,74,162],[8,86,130],[10,60,145],
     [11,13,151],[12,90,139],[13,48,126],[15,10,144],[16,97,157],[17,21,164],[18,10,136]],
    [[1,59,141],[2,30,164],[4,20,128],[5,72,144],[7,25,158],[8,37,167],[10,87,147],
     [11,78,132],[12,51,145],[13,83,153],[15,30,136],[16,78,158],[17,87,126],[18,22,170]],
    [[1,75,135],[2,83,156],[4,18,134],[5,25,152],[7,90,144],[8,33,164],[10,26,141],
     [11,75,154],[12,19,157],[13,68,127],[15,85,162],[16,32,148],[17,12,164],[18,25,130]]
  ];
  outerWindows.forEach((windows,r)=>{for(const [site,focus,zoom] of windows)
    approaches.set(100+20*r+site,{cell:9+r,focus:focus/100,zoom:zoom/100});});
  const approachesCache=new Map();
  // On a wet shoreline the inlet runs behind the actors. An actual piece of
  // painted bank rises to meet the party's rear lane at 75% of viewport width.
  // The cabin, signal, boat or other event object is drawn last in site coordinates.
  function surroundings(id,done,feature){
    const view=approaches.get(id);if(!view||!feature)return null;
    const key=id*2+Number(done);
    if(approachesCache.has(key))return approachesCache.get(key);
    const plate=landscape(view.cell,view.focus,view.zoom);if(!plate)return null;
    const family=Math.floor(id/20),wet=[1,5,6,11].includes(view.cell);
    const floorCell=[0,0,7,8,0,9,10,9][family];
    const floor=landscape(floorCell,view.focus,1);if(!floor)return null;
    const frame=document.createElement('canvas');frame.width=576;frame.height=256;
    const c=frame.getContext('2d');c.imageSmoothingEnabled=false;
    c.drawImage(plate,0,0);
    const dstW=384,dstH=154;
    c.save();c.scale(frame.width/dstW,frame.height/dstH);
    // Shift the near bank in perspective, leaving open water against small boats.
    const edge=[[0,104],[45,100],[94,106],[142,111],[186,104],[220,97],[252,89],[282,80],[313,82],[345,85],[384,88]];
    const shift=(id%4)-2,grade=wet?0:4;
    const boundary=edge.map(([x,y],i)=>[x,y+grade+shift+((i+id)%3-1)*2]);
    c.save();c.beginPath();c.moveTo(0,154);for(const [x,y] of boundary)c.lineTo(x,y);c.lineTo(384,154);c.closePath();c.clip();
    c.drawImage(floor,0,Math.floor(floor.height*.80),floor.width,Math.ceil(floor.height*.20),0,77,dstW,dstH-77);
    if(wet){c.fillStyle=family===7?'#122f497c':'#4e50352e';c.fillRect(0,76,dstW,80);}
    c.restore();
    // Cast a shallow irregular lip onto the lower far bank. Break the contour
    // into pebble-sized intervals rather than outlining the whole stage.
    for(let i=1;i<boundary.length;i++){
      const [x0,y0]=boundary[i-1],[x1,y1]=boundary[i];
      for(let x=x0;x<x1;x+=3){
        const y=Math.round(y0+(y1-y0)*(x-x0)/(x1-x0)),j=(x+id*13)%17;
        if(j<11){c.fillStyle=wet?'#37474091':'#38352973';c.fillRect(x,y-1,j%3+1,1+j%2);}
        if(j>12){c.fillStyle=family===3||family===5?'#e4e9d19c':'#ccb88684';c.fillRect(x,y+1,2,1);}
      }
    }
    feature(c);c.restore();
    if(approachesCache.size>=10)approachesCache.delete(approachesCache.keys().next().value);
    approachesCache.set(key,frame);return frame;
  }
  const atlasWidth=160,atlasHeight=156,icons=new Map();
  function icon(c,i,x,y,w,h=w){
    const image=places.image;if(!image.complete||!image.naturalWidth)return false;
    w=Math.round(w);h=Math.round(h);const key=[i,w,h].join("/");let tile=icons.get(key);
    if(!tile){
      tile=document.createElement("canvas");tile.width=w;tile.height=h;
      const ink=tile.getContext("2d");ink.imageSmoothingQuality="high";
      ink.drawImage(image,(i%3)*atlasWidth,Math.floor(i/3)*atlasHeight,atlasWidth,atlasHeight,0,0,w,h);
      if(icons.size>=48)icons.delete(icons.keys().next().value);icons.set(key,tile);
    }
    c.drawImage(tile,Math.round(x-w*.5),Math.round(y-h));return true;
  }
  function landmark(c,rank,kind,x,y){
    if(rank===0&&kind==="mill")return icon(c,3,x,y+2,62,50);
    if(rank<=1&&["hamlet","post"].includes(kind))return icon(c,0,x,y+2,47,42);
    if(rank<=1&&kind==="dock")return icon(c,1,x,y+6,44,34);
    if(rank===0&&kind==="camp")return icon(c,4,x,y,36,34);
    return false;
  }
  function hills(c,rank){
    if(rank>1)return;
    const w=384,h=652,field=new Float32Array(w*h),out=c.createImageData(w,h);
    const hash=(x,y)=>{
      let n=Math.imul(x+19,374761393)+Math.imul(y+rank*17,668265263);
      n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
    };
    function noise(x,y){
      const xx=Math.floor(x),yy=Math.floor(y),u=x-xx,v=y-yy;
      const a=u*u*(3-2*u),b=v*v*(3-2*v);
      const top=(1-a)*hash(xx,yy)+a*hash(xx+1,yy),bottom=(1-a)*hash(xx,yy+1)+a*hash(xx+1,yy+1);
      return top+(bottom-top)*b;
    }
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const a=noise(x/65,y/88),shift=13*Math.sin(y/59);
      field[x+y*w]=.58*a+.32*noise((x+shift)/26,y/31)+.10*noise(x/8,y/9);
    }
    const deep=rank?[73,99,81]:[74,95,68],sun=rank?[157,166,125]:[173,173,113];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x,n=field[i],elev=field[Math.max(0,y-2)*w+Math.max(0,x-2)]-field[Math.min(h-1,y+2)*w+Math.min(w-1,x+2)];
      const light=Math.max(0,Math.min(1,.07+n*.99+elev*1.7+((hash(x>>1,y>>1)-.5)*.085)));
      for(let k=0;k<3;k++)out.data[i*4+k]=Math.round((deep[k]+(sun[k]-deep[k])*light)/2)*2;
      out.data[i*4+3]=255;
    }
    c.putImageData(out,0,0);
  }
  function shelf(c,x,y,w,h){
    const p=(u,v)=>[Math.round(x+w*u),Math.round(y+h*v)];
    function shape(points,color){
      c.fillStyle=color;c.beginPath();points.forEach(([u,v],i)=>i?c.lineTo(...p(u,v)):c.moveTo(...p(u,v)));c.closePath();c.fill();
    }
    const lip=[[0,.71],[.08,.55],[.22,.48],[.28,.38],[.41,.38],[.48,.28],[.58,.40],[.65,.32],[.83,.46],[1,.56]];
    const foot=[[1,.69],[.84,.72],[.76,.83],[.62,.79],[.55,.86],[.44,.80],[.34,.95],[.16,.88],[.04,.90]];
    shape([...lip,...foot],"#455a48");
    shape([[0,.71],[.08,.55],[.23,.49],[.21,.76],[.16,.82],[.06,.84]],"#827f65");
    shape([[.22,.49],[.37,.42],[.45,.38],[.40,.56],[.37,.70],[.30,.85],[.20,.72]],"#696e58");
    shape([[.45,.36],[.50,.30],[.62,.40],[.60,.64],[.54,.75],[.46,.68]],"#9a9777");
    shape([[.66,.36],[.79,.46],[.86,.48],[.81,.65],[.73,.77],[.64,.69]],"#798068");
    shape([...lip,[.90,.52],[.76,.44],[.66,.36],[.59,.46],[.49,.36],[.40,.45],[.30,.46],[.23,.55],[.11,.61],[.03,.73]],"#a6ab80");
    for(let j=0;j<31;j++){
      const u=((j*71+17)%103)/103,v=.56+((j*13)%11)*.016;
      const [left,top]=p(u,v);c.fillStyle=j%3?"#596651":"#9c9b79";c.fillRect(left,top,1+j%3,1);
    }
  }
  // Work from the original water mask. Highlights follow the channel edge,
  // with dark canopy reflections on the west banks and deep, cool pools.
  function water(c,wet,rank){
    if(rank>1)return;
    const w=384,h=652,im=c.getImageData(0,0,w,h),d=im.data;
    const isWet=(x,y)=>x>=0&&x<w&&y>=0&&y<h&&wet[(x+y*w)*4+3]>145;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      if(!isWet(x,y))continue;
      const i=4*(x+w*y),edge=!isWet(x-2,y-2),shallows=!isWet(x-5,y+3)||!isWet(x+5,y-4);
      const deep=isWet(x-8,y)&&isWet(x+9,y)&&isWet(x,y+6);
      const ripple=Math.sin(x*.079+Math.sin(y*.087)*3+Math.sin((y>>1)*1.12)*1.8);
      const mirror=Math.sin(x*.16+Math.cos(y*.15)*.82)+Math.sin(x*.061-y*.035);
      const glint=(ripple>.91&&((y*37)%17<5)?13:0)+(edge?20:0);
      const shade=(deep?-13:shallows?7:0)+(mirror<-.78?-8:0)+glint;
      d[i]=Math.max(0,d[i]+shade*.92-5);d[i+1]=Math.max(0,d[i+1]+shade*.84);
      d[i+2]=Math.max(0,d[i+2]+shade*.63+5);
    }
    c.putImageData(im,0,0);
  }
  return Object.freeze({battle,surroundings,mode:id=>shots.has(id)?"panorama":approaches.has(id)?"landmark":enclosed.has(id)?"interior":null,landscape,landmark,hills,shelf,water,icon,mapReady:places.ready,ready:Promise.all([woods.ready,districts.ready,places.ready]),has:id=>shots.has(id)});
})();
