"use strict";
// Outside the old four chapter maps. Coordinates are shared by navigation, hit testing and terrain.
const OuterMapArt=(()=>{
  const width=384,height=748;
  const points=[
    [[47,669],[102,630],[160,662],[208,602],[149,566],[81,530],[118,476],[196,491],[235,433],[300,390],[249,326],[189,352],[123,312],[72,255],[133,222],[194,259],[238,191],[301,170],[255,111],[185,62]],
    [[42,118],[109,75],[182,64],[254,93],[327,131],[342,208],[278,242],[307,309],[337,384],[297,450],[335,515],[285,589],[214,650],[128,671],[61,624],[69,550],[119,487],[111,418],[165,373],[197,304]],
    [[48,579],[83,649],[152,688],[237,675],[306,615],[331,545],[276,477],[309,401],[337,325],[287,250],[323,178],[264,115],[183,77],[103,114],[63,183],[97,244],[152,283],[132,357],[183,409],[225,354]]
  ];
  const knots=[
    [[[72,665],[80,642]],[[124,646]],[[191,654],[215,626]],[[188,590],[169,590]],[[112,560],[108,544]],[[72,505],[99,497]],[[142,465],[168,481]],[[222,477],[242,456]],[],[[306,364],[280,351]],[[232,336],[204,343]],[[157,343],[153,323]],[[94,301],[88,272]],[[82,232],[109,231]],[[151,242],[174,239]],[[202,228],[220,216]],[[273,195],[281,178]],[[305,140],[277,134]],[[226,103],[217,80]]],
    [[[55,98],[92,90]],[[132,62]],[[212,61],[223,78]],[[284,95],[298,117]],[[339,160],[332,181]],[[312,221]],[[280,275],[297,290]],[[327,332],[320,359]],[],[[318,471],[317,489]],[[332,554],[300,564]],[[259,600],[245,633]],[[180,674]],[[98,658],[74,652]],[[52,588]],[[91,526],[89,507]],[[133,460],[122,431]],[[130,390]],[[179,344],[193,335]]],
    [[[51,611],[69,623]],[[103,667],[125,665]],[[180,693],[209,684]],[[268,661],[279,636]],[[330,594],[321,572]],[[308,524],[297,496]],[[280,440],[296,428]],[[315,372],[336,357]],[],[[300,217],[319,209]],[[306,153],[278,150]],[[239,95],[217,99]],[[155,78],[130,102]],[[81,132],[85,155]],[[57,210],[80,223]],[[119,255],[126,276]],[[156,316],[139,329]],[[148,389]],[[205,403],[202,379]]]
  ];
  const branchCoords=[
    [[179,409],[166,405],[306,450],[319,442],[216,414],[235,373],[284,457],[312,418]],
    [[277,381],[259,373],[361,443],[369,430],[304,366],[272,417],[358,389],[334,446]],
    [[267,326],[252,314],[355,277],[365,266],[307,338],[271,289],[355,307],[330,256]]
  ];
  const portals=branchCoords.map((f,r)=>[0,1].map(j=>({site:f[j*2],mark:f[j*2+1],in:[points[r][8],f[4+j*2],f[j*2]],out:[f[j*2],f[5+j*2],points[r][9]]})));
  const legs=knots.map((ks,r)=>ks.map((k,i)=>[points[r][i],...k,points[r][i+1]]));
  const marks=points.map((p,r)=>p.map(([x,y],i)=>{
    const dir=(i+r)%3===0?-1:1;return {x,y,propX:x+dir*(i%10===9?20:16),propY:y-11-(i%3)*2};
  }));
  const swatches=[
    ["#30474b","#6b7d76","#b1afa0","#dbcdac","#775f48","#d6ab6c","#af7958","#8baea0"],
    ["#382f42","#6e5661","#aa7971","#dec49c","#815842","#ffb366","#c66d52","#8dc1b0"],
    ["#2f465e","#557d89","#96aba6","#e6d4a5","#786657","#eac888","#ac807a","#80bcc0"]
  ];
  const cv=(w,h)=>{const a=document.createElement("canvas");a.width=w;a.height=h;return a;};
  const prng=(i)=>((Math.imul(i^0x853c491d,0x621fd5b9)>>>0)/4294967296);
  function brush(c,p){
    const b=(x,y,w,h,col)=>{c.fillStyle=p[col]||col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const l=(pts,col,size=1)=>{
      const width=Math.max(1,Math.round(size)),off=Math.floor(width/2);c.fillStyle=p[col]||col;
      for(let j=1;j<pts.length;j++){
        let [x,y]=pts[j-1].map(Math.round);const [toX,toY]=pts[j].map(Math.round);
        const dx=Math.abs(toX-x),dy=-Math.abs(toY-y),sx=x<toX?1:-1,sy=y<toY?1:-1;
        let err=dx+dy;
        while(true){c.fillRect(x-off,y-off,width,width);if(x===toX&&y===toY)break;
          const t=2*err;if(t>=dy){err+=dy;x+=sx;}if(t<=dx){err+=dx;y+=sy;}}
      }
    };
    const a=(pts,col)=>{
      c.fillStyle=p[col]||col;const ys=pts.map(v=>Math.round(v[1]));
      for(let y=Math.min(...ys);y<Math.max(...ys);y++){
        const scan=y+.5,xs=[];
        for(let i=0,j=pts.length-1;i<pts.length;j=i++){
          const [x0,y0]=pts[j],[x1,y1]=pts[i];
          if((y0>scan)!==(y1>scan))xs.push(x0+(x1-x0)*(scan-y0)/(y1-y0));
        }
        xs.sort((a,b)=>a-b);
        for(let i=0;i+1<xs.length;i+=2){const lo=Math.ceil(xs[i]-.5);c.fillRect(lo,y,Math.ceil(xs[i+1]-.5)-lo,1);}
      }
    };
    const ring=(x,y,r,col,thick=2)=>{
      const contour=[],n=Math.max(12,Math.round(r*4));
      for(let k=0;k<=n;k++)contour.push([Math.round(x+r*Math.cos(k*Math.PI*2/n)),Math.round(y+r*Math.sin(k*Math.PI*2/n))]);
      l(contour,col,thick);
    };
    const post=(x,y,h)=>{b(x-1,y-h,3,h,0);b(x-1,y-h,1,h-1,3);b(x-2,y-h,4,2,2);};
    const crate=(x,y,w=8,h=7,col=4)=>{b(x,y-h,w,h,0);b(x+1,y-h+1,w-2,h-2,col);l([[x+1,y-1],[x+w-2,y-h+1]],3);};
    const axle=(x,y,r)=>{ring(x,y,r,0,3);for(let j=0;j<5;j++){const t=j*Math.PI*2/5;l([[x,y],[x+Math.cos(t)*r,y+Math.sin(t)*r]],2);}b(x-1,y-1,3,3,5);};
    const gem=(x,y,r,col=7)=>{a([[x,y-r],[x+r,y-2],[x+2,y+r],[x-r,y+1]],0);a([[x,y-r+2],[x+1,y+3],[x-r+2,y]],col);l([[x,y-r+1],[x+r-1,y-2]],3);};
    const lamp=(x,y,on)=>{b(x-3,y-8,6,7,0);b(x-2,y-7,4,4,on?5:1);a([[x-5,y-8],[x,y-12],[x+5,y-8]],4);post(x,y+1,3);};
    const slab=(x,y,w=12)=>{a([[x-w/2,y-2],[x+w/3,y-5],[x+w/2,y-3],[x+w/2,y],[x-w/4,y+3],[x-w/2,y+1]],0);l([[x-w/2+1,y-2],[x+w/3,y-4],[x+w/2-1,y-3]],2,2);};
    const frame=(x,y,w,h)=>{post(x,y,h);post(x+w,y-2,h);l([[x-2,y-h],[x+w+2,y-h-2]],4,4);l([[x-2,y-h-1],[x+w+2,y-h-3]],3);};
    return {b,l,a,ring,post,crate,axle,gem,lamp,slab,frame};
  }
  // Each object has its own damaged and resolved construction. Coordinates are around the object's feet.
  const objects=[
    [
      ({post,l,crate,axle},o)=>{post(-6,0,27);l([[-7,-26],[8,-29]],4,3);axle(7,-26,3);l([[8,-24],[8,o?-15:0]],3);crate(4,o?-9:3,10,8,6);},
      ({post,l,b},o)=>{post(-12,0,19);post(12,-2,20);l([[-12,-15],[-3,-10],[o?3:-3,o?-12:-6]],3,2);l([[12,-19],[5,-13],[o?0:5,o?-11:-8]],3,2);if(o)b(-1,-12,4,4,6);},
      ({slab,post,l},o)=>{slab(-9,0);slab(10,-2);post(-12,-2,10);post(12,-4,10);l([[-11,-12],[-2,-10]],1,3);if(o){l([[11,-14],[12,-24],[9,-27]],4,4);l([[10,-23],[10,-16]],3,2);slab(0,-1,9);}else{l([[11,-14],[-2,-9]],4,5);l([[8,-14],[-2,-11]],3,2);}},
      ({post,b,l,slab},o)=>{slab(-5,1,20);if(o){post(1,0,27);for(let j=0;j<5;j++)b(1,-23+4*j,4,1,j%2?5:0);}else l([[-11,0],[6,-4],[10,-5]],2,3);},
      ({post,l,b,crate},o)=>{post(-11,0,17);post(10,-2,19);for(let j=0;j<5;j++)l([[-10+j*4,-2],[-7+j*4,-6]],2,3);l([[-10,-16],[0,o?-12:-7],[10,-19]],4);b(7,o?-11:-3,4,4,o?5:6);},
      ({frame,axle,crate,l},o)=>{frame(-14,0,26,27);axle(-7,-24,5);axle(9,-26,4);l([[-7,-19],[-7,o?-14:0]],4);crate(-11,o?-8:4,8,7);l([[9,-22],[9,o?-4:-15]],3);},
      ({slab,post,l,b},o)=>{slab(-11,1);slab(13,-1);l([[-13,-4],[10,-8]],4,3);const x=o?5:-10;l([[x-5,-7],[x+7,-11]],3,4);b(x-1,-11,6,2,6);},
      ({a,slab,l},o)=>{a([[-13,-2],[-6,-17],[1,-22],[0,-8],[-4,-1]],2);a([[0,1],[4,-15],[10,-19],[8,-4],[11,-2]],1);if(o){slab(5,-3,13);l([[-3,-1],[-1,-7],[0,-12]],7,2);}else l([[4,-5],[7,-11]],3);},
      ({post,l,a,ring},o)=>{post(0,1,23);const v=o?1:-1;l([[0,-22],[v*12,-25]],4,2);a([[0,-23],[v*7,-28],[v*11,-24],[v*5,-20]],o?6:2);ring(0,-22,2,5,1);},
      ({post,l,axle,crate,slab},o)=>{slab(0,2,29);post(0,-1,29);const d=o?0:5;l([[-14,-24+d],[14,-24-d]],3,3);for(const x of [-12,12]){l([[x,-24+Math.sign(-x)*d],[x,-11+Math.sign(-x)*d]],4);crate(x-4,-7+Math.sign(-x)*d,8,5,1);}axle(0,-24,4);},
      ({frame,l,a,b},o)=>{frame(-9,0,17,23);a([[-6,-9],[-4,-15],[1,-15],[3,-9],[5,-7],[-7,-7]],5);l([[0,-7],[o?12:1,o?-2:1]],3,2);b(o?10:0,o?-4:-1,3,3,6);},
      ({post,l,a},o)=>{post(-10,1,15);post(9,-2,19);for(let k=0;k<2;k++){const y=-12-k*7;a([[-14,y],[-7,y-5],[9,y-8],[15,y-5],[2,y+1]],4);if(!o)l([[-12,y-2],[-5,y-6],[9,y-8]],3,3);}if(o)l([[-14,1],[-8,-1],[-4,0]],3,3);},
      ({slab,l,post},o)=>{slab(-8,0,17);post(-8,0,12);for(let j=0;j<5;j++)l([[-5+j*(o?3:1),-2-j*(o?1:3)],[-2+j*(o?3:1),-5-j*(o?1:3)]],j%2?3:4,3);},
      ({post,a,l},o)=>{post(0,2,13);const dir=o?1:-1;const x=dir*6;a([[-11,-14],[x,-23],[11,-17],[-x,-8]],0);a([[-8,-14],[x,-21],[8,-17],[-x,-10]],o?7:1);if(o)l([[1,-17],[7,-20]],3,2);},
      ({post,a,l},o)=>{for(const x of [-8,9]){post(x,1,22);a([[x,-20],[x+(o&&x<0?4:9),-19],[x+3,o&&x<0?-12:-15]],x<0?6:5);}if(o){l([[-8,-9],[9,-10]],3);a([[1,-9],[6,-9],[4,-4]],5);}},
      ({frame,lamp,b},o)=>{frame(-13,1,24,17);lamp(-8,-1,o);lamp(o?11:0,o?-11:-1,true);if(o)b(2,-9,4,1,7);},
      ({slab,b,crate},o)=>{slab(-7,1,17);crate(3,-1,11,7);for(let j=0;j<3;j++){const x=o?5:-11+j*4,y=o?-5-j*2:-j*3;b(x,y,6,2,2);b(x+1,y,2,1,3);}},
      ({frame,l,crate},o)=>{frame(-13,0,26,26);const y=o?-16:-2;l([[-9,-25],[-4,y], [4,y],[10,-27]],3);crate(-4,y+3,9,4,6);},
      ({slab,ring,post,l},o)=>{slab(0,1,22);post(0,0,13);ring(-4,-14,7,4,3);ring(o?0:7,o?-17:-12,6,7,2);l([[-7,-16],[o?4:9,o?-20:-11]],3);},
      ({slab,post,ring,axle,l,gem},o)=>{slab(0,2,30);post(0,0,23);ring(0,-24,13,0,3);ring(0,-24,11,3);l([[-14,-13],[o?14:6,o?-33:-39]],5,3);axle(0,-24,4);gem(o?10:-9,o?-32:-15,4,7);}
    ],
    [
      ({frame,l,gem,slab},o)=>{frame(-12,1,23,25);slab(-4,0);if(o)gem(0,-16,6,7);else l([[-6,-9],[-1,-15],[6,-12]],1,5);},
      ({b,l,ring},o)=>{l([[-14,-4],[-10,-14],[-2,-16]],0,6);l([[o?-2:3,-16],[8,-18],[12,-11]],4,6);ring(o?-1:3,-16,4,7,2);b(-14,-6,4,3,6);},
      ({a,b,l},o)=>{a([[-12,2],[-11,-15],[-4,-20],[8,-20],[14,-9],[13,0]],1);a([[-7,0],[-7,-11],[-2,-15],[4,-14],[7,-2]],0);b(-7,o?-17:-10,14,10,4);l([[-7,o?-17:-10],[7,o?-18:-11]],5);},
      ({a,l,b,post},o)=>{a([[-15,-8],[-5,-11],[6,-7],[14,-8],[12,-1],[2,-1]],0);l([[-12,-8],[-3,-7],[9,-3]],6,3);post(10,-3,15);b(6,o?-10:-18,8,9,1);},
      ({slab,gem,l},o)=>{slab(-13,1);slab(12,-3);for(let j=0;j<4;j++){if(!o&&j===2)continue;gem(-9+j*6,-3-j,4,7);}if(o)l([[-10,-8],[9,-12]],3);},
      ({b,l,crate,axle},o)=>{b(-9,-24,6,25,1);for(let j=0;j<5;j++)l([[-13+j%2*2,-j*4],[-3,-j*4-3]],2,3);axle(8,-22,5);l([[8,-18],[8,o?-15:-2]],4);crate(4,o?-11:2,9,7,6);},
      ({slab,l,b},o)=>{for(const [x,y] of [[-11,0],[0,-5],[11,-1]])slab(x,y);l([[-12,-6],[0,-12],[12,-7]],4);b(o?3:-12,o?-9:-5,9,4,6);l([[o?4:-11,-5],[o?10:-5,-8]],3);},
      ({a,l,b},o)=>{for(const x of [-8,8]){a([[x-6,0],[x-5,-10],[x+1,-18],[x+6,-8],[x+6,0]],1);b(x-2,-7,5,7,0);if(!o||x>0)l([[x,-16],[x+2,-22],[x-1,-27]],2,3);}if(o)b(-12,-5,7,4,4);},
      ({frame,l,b,a},o)=>{frame(-11,0,22,21);for(let j=0;j<4;j++)b(-9,-16+j*4,o?5:18,2,1);a([[0,-2],[-3,-6],[1,o?-16:-9],[2,-8],[5,-4]],o?5:6);},
      ({axle,l,a,b},o)=>{b(-15,-3,29,5,0);axle(-8,-10,6);const x=o?13:6;a([[-4,-12],[x,-18],[x,-4],[-4,-7]],6);for(let j=0;j<3;j++)l([[-2+j*3,-11-j],[-2+j*3,-7]],4,2);l([[x,-12],[16,-14]],3,3);},
      ({b,l,crate},o)=>{b(-9,-4,19,5,1);crate(-11,-1,6,5);const u=o?1:-1;l([[-1,-14],[u*12,-5]],2,5);l([[-1,-16],[u*13,-7]],3,2);},
      ({frame,gem,l},o)=>{frame(-14,0,26,17);for(const x of [-7,2,9])gem(x,-8,4,7);for(const x of [-6,7])l([[x,-2],[o?x+6:x,-14+(o?12:0)]],4,2);},
      ({slab,b,l},o)=>{slab(-10,1);slab(11,-2);b(-13,-10,10,6,1);b(o?-1:3,-12,11,6,1);l([[-9,-9],[-5,-8],[o?2:0,-9]],o?7:4,2);},
      ({frame,a,l},o)=>{frame(-13,1,26,25);for(const x of [-6,7]){a([[x-4,-7],[x-2,-15],[x+2,-15],[x+4,-7]],x<0?1:5);l([[x,-15],[x,-24]],4);}l([[o?8:-5,-7],[o?12:-8,-1]],3,2);},
      ({a,l,b},o)=>{a([[-13,-3],[-7,-13],[-1,-16],[3,-13],[11,-19],[13,-15],[7,-6],[-2,-4]],0);l([[-8,-5],[-2,-10],[4,-8],[10,-16]],6,3);b(o?6:-2,o?-17:-12,7,5,4);},
      ({b,ring,slab},o)=>{slab(0,1,22);b(-7,-22,14,23,0);b(-5,-19,10,18,1);for(const [x,y,r] of [[0,0,3],[2,-6,2],[-2,-11,2]])ring(x,y+(o?-11:-2),r,7,1);},
      ({crate,gem,b},o)=>{crate(-13,0,10,7);crate(4,-2,10,7);for(let j=0;j<4;j++)gem(o?(j%2?-8:10):-4+j*3,o?-5-j%3:-6-j%2,3,j%2?6:7);if(o)b(-1,-4,7,1,3);},
      ({frame,crate,l,gem},o)=>{frame(-14,2,27,21);gem(-9,-12,5,6);crate(o?7:-4,-2,8,6);l([[-9,-4],[o?10:2,-8]],3,2);},
      ({gem,slab,l,b},o)=>{slab(0,0,25);gem(-5,-12,9,7);gem(o?5:9,o?-12:-7,7,6);if(o)l([[-6,-15],[1,-13],[5,-17]],5,2);else b(-1,-4,5,2,0);},
      ({slab,a,l,gem,ring},o)=>{slab(0,2,30);a([[-13,-1],[-14,-15],[-6,-24],[1,-30],[9,-23],[15,-9],[12,0]],0);a([[-8,-4],[-6,-15],[1,-20],[8,-12],[8,-3]],6);ring(0,-12,5,o?5:1,2);if(o)gem(0,-20,7,7);for(const x of [-12,12])l([[x,-7],[x*1.2,-19],[x,-23]],2,3);}
    ],
    [
      ({slab,b,l},o)=>{slab(0,1,26);b(-8,-9,16,6,o?3:1);for(let j=0;j<3;j++)b(-5+j*4,-7,2,2,0);l([[-12,o?1:-7],[-4,o?2:-6],[7,o?1:-8]],7,2);},
      ({post,l,b},o)=>{for(const [x,y] of [[-12,0],[1,-15],[12,0]]){post(x,y,5);b(x-2,y-6,4,3,6);}l([[-12,-3],[1,-18],[12,-3],[o?-12:4,o?-3:-2]],o?5:2);},
      ({a,l,gem},o)=>{for(const [x,d] of [[-8,-1],[7,1]]){a([[x-5,1],[x-6,-8],[x-1,-16],[x+4,-8],[x+5,0]],1);for(let j=0;j<3;j++)l([[x,-6],[x+d*(o?7:2),-12-j*2]],7);}if(o)gem(0,-1,3,5);},
      ({slab,post,b,l},o)=>{for(const x of [-12,-2,8])slab(x,-2);post(10,-2,17);b(3,o?-8:-17,10,9,2);l([[-10,-8],[-4,-7],[0,-9]],7);},
      ({post,l},o)=>{post(-13,1,11);post(11,0,16);for(let j=0;j<6;j++){if(!o&&j===3)continue;const x=-12+j*4;l([[x,-3-j*.3],[x+5,-6-j*.3]],3,3);}if(o)l([[-12,-10],[11,-16]],5);},
      ({slab,l},o)=>{for(let j=0;j<5;j++)slab(-9+j*4,-j*3,14);l([[-15,o?2:-7],[-6,o?1:-7],[0,o?3:-5],[12,o?1:-8]],7,2);},
      ({frame,ring,l},o)=>{frame(-12,1,24,18);const x=o?7:-8;l([[-10,-17],[x,-10]],3);ring(x,-7,5,6,3);l([[x-4,-9],[x-2,-11]],3,2);},
      ({a,l,slab},o)=>{a([[-14,1],[-9,-13],[-1,-20],[1,-8],[8,-17],[14,-13],[10,1]],1);l([[-9,-1],[-6,-11]],7,2);if(o)slab(5,-4,11);else l([[4,-1],[10,-12]],7,2);},
      ({post,l,b},o)=>{post(-8,1,15);l([[-9,-14],[-2,-20],[6,-18],[9,-12]],1,5);b(5,-16,6,3,o?7:4);if(o){l([[10,-15],[13,-17],[16,-16]],3,2);l([[11,-12],[15,-13],[18,-12]],7,2);}else b(8,-16,4,6,4);},
      ({slab,ring,l,gem},o)=>{slab(0,1,29);ring(0,-12,12,0,4);ring(0,-12,9,7,2);for(let j=0;j<5;j++){const a=j*Math.PI*.4-.7;l([[0,-12],[Math.cos(a)*7,-12+Math.sin(a)*7]],o?5:2,2);}gem(o?7:0,o?-19:-12,3);},
      ({frame,b,l},o)=>{frame(-12,0,24,23);for(let j=0;j<6;j++)b(-9,-4-j*3,5,1,2);l([[-2,-4],[0,o?-20:-11],[9,o?-17:-8]],5,2);b(-1,o?-21:-12,3,3,7);},
      ({post,l,ring},o)=>{for(const x of [-8,8]){post(x,0,19);const y=o?-13:-3;ring(x,y,3,3,1);l([[x,y],[x,y+6],[x-4,y+3]],2,2);l([[x,y+6],[x+4,y+2]],2,2);}},
      ({frame,b,l},o)=>{frame(-13,1,26,15);b(-10,-12,10,8,3);b(o?0:4,-13,10,8,2);l([[-7,-8],[-3,-10],[o?5:0,-7]],7,2);},
      ({post,lamp,l},o)=>{post(-9,0,13);post(9,-2,18);lamp(-9,-11,!o);lamp(9,-17,o);l([[o?12:-7,o?-23:-16],[o?18:-1,o?-25:-18]],3,2);},
      ({frame,b,l},o)=>{frame(-13,1,26,17);for(const [x,y] of [[-9,o?-5:-12],[3,-11]]){b(x,y,8,6,1);l([[x+1,y+2],[x+6,y+2]],7);}b(-2,-17,4,5,5);},
      ({ring,post,a,l},o)=>{post(0,0,23);ring(-5,-16,6,3,2);l([[-5,-16],[o?-4:-9,o?-21:-13]],5,2);a([[4,-7],[5,-14],[9,-15],[12,-9],[13,-7]],6);l([[8,-15],[o?10:6,o?-23:-20]],3,2);if(o){l([[6,-21],[10,-24],[15,-22]],5,2);l([[2,-22],[4,-25]],3);}},
      ({slab,b,gem,l},o)=>{slab(0,0,26);b(-10,-10,20,9,3);for(let j=0;j<4;j++)gem(-5+j*3,-6-j%3,2,j%2?6:7);if(o){l([[1,-7],[5,-10],[9,-5],[4,-2],[1,-7]],0,2);l([[6,-8],[12,-14]],6,2);b(9,-16,6,4,5);}},
      ({post,crate,l,ring},o)=>{post(-11,0,19);crate(o?2:-4,o?-2:2,12,10,4);ring(5,o?-15:-3,4,6,2);l([[-11,-17],[3,o?-13:-3]],3);},
      ({slab,ring,l,gem},o)=>{slab(0,2,28);ring(-4,-13,10,2,2);ring(4,-14,9,7,2);l([[-4,-13],[o?1:-10,-20]],5,2);l([[4,-14],[o?1:9,-20]],3,2);gem(1,o?-20:-7,2,6);},
      ({slab,a,ring,l,b},o)=>{slab(0,2,30);a([[-15,-3],[-15,-14],[-10,-23],[-4,-27],[5,-28],[12,-21],[16,-11],[16,-3]],0);a([[-12,-12],[-9,-20],[-2,-25],[4,-25],[1,-20],[-2,-12]],7);l([[-13,-11],[o?-4:3,-13],[13,-12]],3,2);ring(2,-19,6,o?5:2,2);if(o){l([[4,-19],[9,-27],[14,-29]],3,2);b(13,-30,3,2,5);}}
    ]
  ];
  const baseCache=new Map(),propCache=new Map(),sceneCache=new Map(),mapCache=new Map();
  function prop(region,i,done){
    const key=region*40+i*2+Number(done);
    if(!propCache.has(key)){
      const s=cv(44,48),c=s.getContext("2d");c.translate(22,38);c.imageSmoothingEnabled=false;
      objects[region][i](brush(c,swatches[region]),done);
      propCache.set(key,s);
    }
    return propCache.get(key);
  }
  function paintProp(c,r,i,x,y,done,scale=1){const s=prop(r,i,done);c.drawImage(s,Math.round(x-22*scale),Math.round(y-38*scale),Math.round(44*scale),Math.round(48*scale));}
  function ridge(c,p,x,y,size,snow=true){
    const {a,l}=brush(c,p),s=size;
    a([[x-s,y],[x-s*.7,y-s*.49],[x-s*.48,y-s*.48],[x-s*.15,y-s*1.02],[x,y-s*1.2],[x+s*.28,y-s*.7],[x+s*.42,y-s*.63],[x+s,y]],1);
    a([[x,y-s*1.17],[x+s*.3,y-s*.7],[x+s*.43,y-s*.62],[x+s,y],[x+s*.1,y+s*.1],[x-s*.14,y-s*.35]],0);
    if(snow)a([[x-s*.3,y-s*.77],[x,y-s*1.2],[x+s*.32,y-s*.68],[x+s*.12,y-s*.81],[x+s*.08,y-s*.72],[x-s*.02,y-s*.91],[x-s*.12,y-s*.77]],3);
    for(const k of [.23,.39,.58])l([[x-s*k,y-s*(.88-k)],[x-s*(k+.12),y-s*(.67-k)]],2);
  }
  function terrace(c,p,x,y,rx,ry,depth){
    const {a,l}=brush(c,p);
    const shape=[[x-rx,y],[x-rx*.68,y-ry*.72],[x-rx*.14,y-ry],[x+rx*.38,y-ry*.71],[x+rx,y-ry*.2],[x+rx*.73,y+ry*.1],[x+rx*.18,y+ry*.4],[x-rx*.62,y+ry*.23]];
    a(shape.map(([a,b])=>[a,b+depth]),0);a(shape.map(([a,b])=>[a,b+depth*.5]),1);a(shape,2);
    l(shape.slice(4),3);for(let i=0;i<6;i++){const u=x-rx*.5+i*rx*.22;l([[u,y+ry*.23],[u-2,y+ry*.25+depth*.45]],1);}
  }
  function mountain(c){
    const p=swatches[0],g=brush(c,p);g.b(0,0,width,height,"#84999a");
    for(let i=0;i<60;i++){const x=Math.floor(prng(i*5)*width),y=Math.floor(prng(5+i)*height);g.l([[x,y],[x+11,y+2],[x+28,y+1]],"#acb7ae",3);}
    for(const [x,y,s] of [[-12,112,95],[95,132,96],[270,101,86],[371,133,105],[10,253,103],[345,346,114],[6,496,105],[346,611,89],[85,790,118]])ridge(c,p,x,y,s);
    for(const [x,y,a,b,z] of [[82,675,113,65,27],[142,629,99,38,23],[153,547,115,47,39],[156,474,104,45,26],[260,425,111,56,29],[255,350,105,45,37],[118,293,99,74,30],[137,239,107,50,28],[255,180,98,45,31],[235,116,98,62,27],[174,72,56,35,27]])terrace(c,p,x,y,a,b,z);
    for(const [x,y] of [[30,694],[27,675],[98,585],[148,605],[74,496],[191,442],[317,404],[78,310],[67,275],[153,210],[237,148],[309,172],[132,82]]){
      for(let j=0;j<3;j++){const xx=x+j*7,yy=y+j%2*7;g.b(xx,yy-7,2,9,4);g.a([[xx-5,yy-4],[xx-2,yy-11],[xx,yy-17],[xx+6,yy-4]],j%2?"#587564":"#526b60");}
    }
  }
  function kiln(c,p,x,y,s){
    const g=brush(c,p);c.save();c.translate(x,y);c.scale(s,s);
    g.a([[-13,1],[-13,-9],[-9,-18],[-5,-21],[-5,-27],[3,-27],[3,-21],[9,-19],[14,-9],[14,1]],0);
    g.a([[-11,-9],[-7,-18],[-2,-22],[5,-19],[10,-13],[8,-4]],1);g.b(-5,-8,9,9,0);g.b(-3,-5,5,4,6);
    g.l([[-6,-25],[2,-25]],3,2);g.l([[-9,-10],[-7,-15],[-4,-17]],2,2);c.restore();
  }
  function glass(c){
    const p=swatches[1],g=brush(c,p);
    g.b(0,0,width,height,"#665b68");
    // Long glasshouse walls surround an open molten channel. They remain readable as city blocks.
    for(const [x,y,wide,high] of [[14,40,90,82],[122,23,120,72],[267,34,89,115],[273,169,104,106],[257,320,117,99],[276,460,81,105],[211,565,131,104],[68,586,100,105],[23,448,93,95],[54,308,89,91],[84,167,92,87],[158,278,84,89]]){
      const shape=[[x,y+11],[x+wide-11,y],[x+wide,y+high-13],[x+12,y+high]];
      g.a(shape.map(([a,b])=>[a,b+7]),0);g.a(shape,"#9c7a73");g.l(shape.slice(1),2,3);
      for(let j=12;j<high-8;j+=11){g.l([[x+6,y+j+10],[x+wide-6,y+j]],"#896b69");}
    }
    const channel=[[-3,93],[59,148],[196,137],[240,176],[221,249],[264,288],[215,378],[214,426],[169,484],[180,559],[126,586],[148,744]];
    for(const [n,color] of [[28,0],[18,4],[12,6],[3,5]])g.l(channel,color,n);
    for(const [x,y,s] of [[31,194,.9],[78,217,1],[194,121,.8],[308,186,1.2],[342,282,.8],[59,372,.8],[300,497,1],[247,621,1.2],[104,654,.9],[186,329,1.4]])kiln(c,p,x,y,s);
    for(const [x,y] of [[198,70],[247,248],[314,351],[223,474],[58,554],[149,399],[167,590],[88,80]]){g.gem(x,y,7,7);g.gem(x+7,y+2,4,2);}
  }
  function isle(c,g,x,y,rx,ry){
    const pts=[];for(let i=0;i<12;i++){const a=i*Math.PI/6,rad=1+(i%3-.9)*.12;pts.push([Math.round(x+Math.cos(a)*rx*rad),Math.round(y+Math.sin(a)*ry*rad)]);}
    g.a(pts.map(([a,b])=>[a,b+6]),0);g.a(pts.map(([a,b])=>[a,b+2]),3);g.a(pts,2);
  }
  function sea(c){
    const p=swatches[2],g=brush(c,p);g.b(0,0,width,height,"#497b88");
    for(let i=0;i<350;i++){const x=Math.floor(prng(i*3+41)*width),y=Math.floor(prng(i+90)*height);
      g.l([[x,y+2],[x+5,y],[x+10,y+1],[x+18+i%15,y+1]],i%6?"#6b969c":"#a5b7a4",1);}
    for(const [x,y,rx,ry] of [[42,595,58,62],[118,661,91,46],[231,672,87,49],[319,572,55,96],[298,440,53,57],[329,321,57,89],[303,216,52,69],[265,132,56,44],[163,79,87,38],[80,153,44,62],[98,234,57,43],[147,304,45,41],[149,378,51,48],[218,358,66,52]])isle(c,g,x,y,rx,ry);
    // Incomplete rings are tidal terraces running around a lagoon. The central dome sits on a separate islet.
    for(const [x,y,r] of [[181,470,59],[191,509,51],[208,224,43],[27,342,36],[213,78,27],[340,689,50]]){
      for(let j=0;j<10;j++){const a=j*.27+.36,xx=x+r*Math.cos(a),yy=y+r*Math.sin(a)*.38;
        g.l([[xx,yy],[xx+4,yy-1]],"#a3b8a7",2);if(j%4===0)g.slab(xx,yy,7);}
    }
    for(const [x,y] of [[57,550],[108,625],[209,657],[324,522],[359,369],[334,142],[244,91],[71,173],[113,324],[185,435]]){g.post(x,y,9);g.b(x-3,y-11,6,3,6);}
    for(const [x,y,r] of [[116,174,13],[256,527,17],[44,432,13],[259,80,12],[201,685,10]]){g.ring(x,y,r,1,2);g.l([[x-r,y],[x+r,y-2]],2);}
  }
  function pathPaint(c,r,pts,branch=0){
    const g=brush(c,swatches[r]);const kind=branch?branch:0;
    for(const [size,color] of [[10,0],[7,r===0?4:r===1?1:4],[4,r===0?3:r===1?2:3]])g.l(pts,color,size);
    for(let j=0;j<pts.length-1;j++){const [x,y]=pts[j],[xe,ye]=pts[j+1],dx=xe-x,dy=ye-y,d=Math.hypot(dx,dy);
      for(let k=7;k<d-1;k+=r===0?8:r===1?11:7){const xx=x+dx*k/d,yy=y+dy*k/d;
        if(r===0)g.b(xx,yy,2,1,2);
        else g.l([[xx+dy/d*2,yy-dx/d*2],[xx-dy/d*2,yy+dx/d*2]],r===1?4:2);
        if(kind&&k%3===1)g.b(xx+dy/d*5,yy-dx/d*5,2,3,0);
      }
    }
  }
  function junction(c,r,i,mask){
    const f=portals[r][i],g=brush(c,swatches[r]),[x,y]=f.mark;
    c.save();c.translate(x,y);
    if(r===0){if(i===0){g.frame(-10,0,20,18);g.crate(-5,mask===1?-9:1,9,6,6);}else{g.post(-8,1,22);g.l([[-8,-20],[7,-24]],3,2);g.axle(6,-22,4);}}
    if(r===1){if(i===0){g.gem(0,-8,9,7);g.frame(-10,2,20,12);}else{g.axle(0,-10,7);g.b(-11,-3,22,4,4);g.l([[2,-13],[11,-17]],6,3);}}
    if(r===2){if(i===0){g.post(-7,0,18);g.ring(-7,-13,4,6,2);g.l([[-7,-17],[9,-8]],3);}else{g.slab(0,1,22);g.ring(0,-10,8,7,2);g.l([[-6,-9],[5,-13]],5);}}
    if(mask&&mask!==i+1){g.l([[-9,1],[6,-6]],0,4);g.l([[-8,-4],[6,1]],6,3);}
    c.restore();
  }
  function map(r,completed=0,routeMask=0){
    if(!points[r])return typeof OuterDistrictArt==="undefined"?null:OuterDistrictArt.map(r,completed,routeMask);
    if(!baseCache.has(r)){const s=cv(width,height),c=s.getContext("2d");c.imageSmoothingEnabled=false;
      [mountain,glass,sea][r](c);legs[r].forEach((l,i)=>{if(i!==8)pathPaint(c,r,l);});
      portals[r].forEach((f,i)=>{pathPaint(c,r,f.in,i+1);pathPaint(c,r,f.out,i+1);});baseCache.set(r,s);}
    const key=completed+"/"+routeMask,cached=mapCache.get(r);if(cached?.key===key)return cached.image;
    const image=cv(width,height),c=image.getContext("2d");c.imageSmoothingEnabled=false;c.drawImage(baseCache.get(r),0,0);
    marks[r].forEach(({propX,propY},i)=>paintProp(c,r,i,propX,propY,i<completed,i%10===9?1.55:1));
    portals[r].forEach((_,i)=>junction(c,r,i,routeMask));mapCache.set(r,{key,image});return image;
  }
  const horizons=[[83,63,91,72,85,63,86,73,66,85,72,87,62,79,73,61,83,66,81,93],[63,88,74,67,91,78,64,76,84,68,94,74,88,67,77,94,68,76,83,91],[90,71,63,85,74,61,84,75,91,77,63,82,72,64,88,75,66,79,84,91]];
  const propsX=[[75,230,134,304,190,100,268,154,296,218,89,240,130,281,164,106,251,143,283,194],[264,112,215,80,298,140,268,183,89,228,151,279,115,264,185,96,229,148,283,187],[111,273,172,82,241,132,288,205,93,267,158,291,124,246,80,233,160,283,130,211]];
  function battle(id,completed=0,arena=false){
    const r=Math.floor((id-100)/20),i=(id-100)%20;if(!objects[r]||i<0)return typeof OuterDistrictArt==="undefined"?null:OuterDistrictArt.battle(id,completed,arena);
    const done=i<completed,key=id*2+Number(done);
    if(typeof ScenicArt!=="undefined"){
      const feature=c=>paintProp(c,r,i,propsX[r][i],horizons[r][i]+17,done,[6,9,19].includes(i)?2.0:1.55);
      if(arena){const frame=typeof ArenaArt!=="undefined"&&ArenaArt.battle(id,done,feature);if(frame)return frame;}
      const view=ScenicArt.battle(id,done,feature);
      if(view)return view;
      const surroundings=ScenicArt.surroundings(id,done,c=>{
        const x=propsX[r][i],y=horizons[r][i]+17,p=swatches[r],g=brush(c,p);
        // Give each mechanism a support that belongs to the material under it.
        // Stone shelves, brick furnace blocks and tidal islets have distinct profiles.
        if(r===0)terrace(c,p,x,y+3,24+i%5,5,4);
        else if(r===1){
          g.a([[x-23,y-1],[x+16,y-4],[x+24,y-1],[x+21,y+4],[x-23,y+5]],0);
          g.l([[x-22,y],[x+16,y-3],[x+23,y]],2,2);
        }else isle(c,g,x,y+2,22+i%5,4+i%3);
        paintProp(c,r,i,x,y,done,i%10===9?2.3:1.68);
      });
      if(surroundings)return surroundings;
    }
    if(sceneCache.has(key))return sceneCache.get(key);
    const s=cv(384,154),c=s.getContext("2d"),p=swatches[r],g=brush(c,p),h=horizons[r][i];c.imageSmoothingEnabled=false;
    const skies=[["#97adb1","#bbc9ba","#dbd8be"],["#95808c","#b79692","#ddbaa0"],["#819cae","#adbdba","#d5d2b8"]];
    g.b(0,0,384,154,skies[r][0]);g.b(0,Math.round(h*.31),384,h,skies[r][1]);g.b(0,Math.round(h*.63),384,h,skies[r][2]);
    for(let n=0;n<7;n++){const x=Math.floor(prng(i*21+n*7)*384),y=8+Math.floor(prng(n+i)*h*.35);g.b(x,y,12+n*2,2,skies[r][2]);}
    if(r===0){
      for(let n=0;n<7;n++)ridge(c,p,n*71-(i*13)%53,h+13,42+prng(i*14+n)*47,i>3||n%2===0);
      g.a([[0,h+9],[70,h-5],[119,h+4],[182,h-2],[248,h+11],[298,h-10],[384,h-3],[384,154],[0,154]],1);
      for(let n=0;n<3;n++){const x=(n*147+i*23)%420-18;terrace(c,p,x,h+25,27+n*7,11,10);}
    }else if(r===1){
      g.a([[-1,h-5],[29,h-16],[80,h-14],[112,h-27],[166,h-10],[211,h-22],[251,h-21],[310,h-5],[361,h-16],[385,h-14],[385,154],[0,154]],1);
      for(let n=0;n<8;n++)kiln(c,p,n*58-(i*15)%45,h+4, .6+prng(n+i*15)*1.0);
      g.l([[-7,h+13],[60,h+4],[136,h+17],[238,h+14],[303,h+25],[393,h+12]],6,7);
    }else{
      g.b(0,h-4,384,158-h,"#68929a");
      for(let n=0;n<6;n++){const x=n*82-(i*9)%68;isle(c,g,x,h+3,18+prng(i+n)*20,6+n%4);
        if(n%3===0)g.ring(x,h-6,7,1,2);else g.post(x,h,5);}
      for(let n=0;n<46;n++)g.b(Math.floor(prng(33+n*7+i)*384),h+7+Math.floor(prng(n+i*8)*24),5+n%12,1,2);
    }
    const floor=[[0,154],[0,119+i%6],[57,112+i%8],[128,118-i%7],[190,109+i%6],[248,114],[312,111+i%8],[384,114],[384,154]];
    g.a(floor,0);g.a(floor.map(([x,y])=>[x,y===154?y:y+4]),r===1?1:2);
    for(let n=0;n<33;n++)g.b(Math.floor(prng(id+n)*384),125+Math.floor(prng(id*6+n)*27),3+n%6,1,r===1?2:1);
    paintProp(c,r,i,propsX[r][i],h+17,done,i%10===9?2.7:2.0);sceneCache.set(key,s);return s;
  }
  const more=(what,r)=>typeof OuterDistrictArt==="undefined"?undefined:OuterDistrictArt[what](r);
  return {sites:r=>points[r]||more("sites",r),edges:r=>legs[r]||more("edges",r),
    landmarks:r=>marks[r]||more("landmarks",r),forks:r=>portals[r]||more("forks",r),
    paint:{brush,canvas:cv,noise:prng},map,battle};
})();
