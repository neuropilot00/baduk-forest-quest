"use strict";
// The last eight districts use their own route geometry, ground plan and repair scenes.
// Recipe entries are "part x y [pose]" in local integer pixels. The three layers are
// permanent fixture | before this site's victory | state kept after victory.
const OuterDistrictArt=(()=>{
  const {brush,canvas,noise}=OuterMapArt.paint;
  const width=384,height=748;
  const coords=[
    [[44,633],[101,681],[169,657],[218,604],[157,562],[84,565],[59,492],[120,453],[188,469],[250,407],[303,451],[337,384],[294,314],[223,322],[180,257],[111,266],[72,196],[124,128],[194,147],[245,80]],
    [[48,681],[108,618],[174,635],[244,654],[323,602],[282,540],[218,555],[153,501],[90,512],[59,431],[131,399],[196,432],[269,389],[321,332],[273,274],[204,283],[136,222],[84,153],[161,97],[233,132]],
    [[54,561],[66,643],[141,679],[214,643],[286,677],[338,598],[288,533],[213,544],[151,482],[91,427],[128,352],[199,378],[254,305],[326,308],[334,220],[263,203],[206,147],[131,173],[78,106],[155,62]],
    [[319,633],[244,669],[170,637],[100,666],[48,596],[108,546],[185,560],[235,493],[308,516],[327,430],[259,388],[191,410],[126,374],[59,389],[65,298],[135,266],[194,304],[255,251],[310,175],[242,125]],
    [[45,665],[112,610],[162,665],[230,621],[303,641],[335,556],[270,518],[201,546],[143,483],[78,430],[106,350],[170,317],[231,359],[301,326],[329,246],[257,206],[184,234],[125,173],[157,96],[236,69]],
    [[80,679],[59,598],[126,567],[192,605],[266,648],[332,581],[279,521],[214,492],[140,483],[78,419],[128,352],[204,369],[276,408],[326,335],[267,282],[185,259],[109,238],[67,165],[137,112],[218,139]],
    [[50,555],[84,641],[160,682],[224,633],[295,661],[333,578],[274,541],[300,464],[228,437],[160,475],[86,427],[96,349],[169,310],[229,346],[306,306],[323,222],[249,179],[174,209],[116,148],[185,78]],
    [[56,656],[125,623],[192,677],[264,636],[331,661],[331,567],[258,529],[190,566],[125,520],[64,463],[106,391],[179,416],[243,356],[308,382],[332,296],[263,248],[189,279],[132,216],[164,136],[237,102]]
  ];
  const bends=[
    [1,-2,1,3,-2,4,-1,2,0,-3,1,2,-1,-2,4,-3,1,-1,2],
    [-1,4,-4,2,-2,-3,2,4,0,-1,3,-4,2,-3,2,-2,4,-1,3],
    [3,2,-4,2,1,-2,2,-4,0,2,-1,4,-3,3,1,-4,1,-2,3],
    [-4,4,-4,3,4,-4,4,-4,0,-4,4,-4,4,1,4,-4,4,-4,2],
    [1,-2,2,1,-2,3,-1,2,0,-3,1,-1,2,3,-2,1,-2,2,1],
    [2,-3,4,2,-1,-3,4,-2,0,3,-4,2,1,-2,3,-4,2,-2,3],
    [-3,-1,3,-2,4,-1,2,-3,0,-2,2,-1,3,-4,1,2,-1,3,-2],
    [4,-4,4,-4,4,-4,4,-4,0,-4,4,-4,4,-4,4,-4,4,-4,4]
  ];
  const branch=[
    [[185,400],[251,473]],[[40,482],[146,449]],[[85,485],[157,408]],[[269,454],[351,492]],
    [[78,482],[153,411]],[[73,473],[157,415]],[[168,410],[233,500]],[[60,525],[136,446]]
  ];
  const corners=(a,b,k)=>{
    const [x,y]=a,dx=b[0]-x,dy=b[1]-y;
    if(Math.abs(k)===4)return k>0?[[x+Math.round(dx*.65),y],[x+Math.round(dx*.65),b[1]]]:[[x,y+Math.round(dy*.45)],[b[0],y+Math.round(dy*.45)]];
    const d=Math.hypot(dx,dy),s=k*4;
    return [[Math.round(x+dx*.32-dy*s/d),Math.round(y+dy*.32+dx*s/d)],[Math.round(x+dx*.70-dy*s/d),Math.round(y+dy*.70+dx*s/d)]];
  };
  const edges=coords.map((sites,k)=>sites.slice(1).map((b,i)=>[sites[i],...corners(sites[i],b,bends[k][i]),b]));
  const forks=coords.map((s,k)=>branch[k].map((site,i)=>({site,mark:[site[0]+(i?-11:11),site[1]-10],in:[s[8],...corners(s[8],site,i?-1:2),site],out:[site,...corners(site,s[9],i?2:-1),s[9]]})));
  const marks=coords.map((sites,k)=>sites.map(([x,y],i)=>({x,y,propX:x+((i+k)%3===0?-17:17),propY:y-10-(i%3)*2})));
  const palettes=[
    ["#34443c","#597066","#8b9a77","#d5d09f","#79583d","#d9b45c","#c38b60","#74aab0"],
    ["#345045","#738474","#a9ae85","#dadaad","#78553e","#dcba70","#ad7459","#81ac9b"],
    ["#212e40","#3d515f","#75878a","#c8d1ac","#675445","#f1c069","#cb8563","#73b5ac"],
    ["#433a40","#786b59","#b6a37e","#ead8ac","#856048","#e5bb70","#ba7565","#779d8b"],
    ["#423e48","#70615b","#b39a77","#e6d1a1","#805746","#dfb26a","#ba7863","#85a4a2"],
    ["#262f39","#48565c","#82948a","#d0d6b2","#6d5a46","#d6ba80","#a57982","#739d9b"],
    ["#34474b","#617974","#adb297","#dfd5a9","#806a48","#e0bd6e","#b77c5f","#89b4ae"],
    ["#2b4049","#536767","#95a091","#c7ccb0","#746353","#d6bc83","#a77c72","#79a7a7"]
  ];
  // A part's variant changes its mechanism, contents or orientation.
  function part(g,key,x,y,v=0){
    const b=(a,h,w,z,k)=>g.b(x+a,y+h,w,z,k),l=(p,k,s=1)=>g.l(p.map(([i,j])=>[x+i,y+j]),k,s);
    const a=(p,k)=>g.a(p.map(([i,j])=>[x+i,y+j]),k),ring=(i,j,r,k,t)=>g.ring(x+i,y+j,r,k,t);
    const pts=(...n)=>n.reduce((p,t,i)=>{if(i%2===0)p.push([t,n[i+1]]);return p;},[]);
    switch(key){
      case "post":g.post(x,y,v?12:19);break;
      case "frame":g.frame(x-10,y,20,18+v*4);break;
      case "stone":g.slab(x,y,11+3*v);break;
      case "box":g.crate(x-4,y,9,7,v?6:4);break;
      case "lamp":g.lamp(x,y,!!v);if(v){b(-6,-6,2,1,5);b(5,-8,2,1,5);}break;
      case "wood":l(pts(-7,0,3,-3,8,-3),0,4);l(pts(-7,-1,7,-4),v?3:4,2);break;
      case "wheel":{
        const r=v>=2?8:6;ring(0,-r,r,0,4);ring(0,-r,r,4,2);
        for(let j=0;j<6;j++){const h=(j+v*.38)*Math.PI/3,xx=Math.cos(h)*r,yy=Math.sin(h)*r;
          l([[0,-r],[xx,yy-r]],v%2?5:2);b(xx-1,yy-r,3,2,3);}
        b(-1,-r-1,3,3,6);break;}
      case "basin":a(pts(-8,-6,7,-6,5,0,-5,1),0);a(pts(-6,-5,5,-5,4,-1,-4,0),4);l(pts(-6,-5,5,-6),3);if(v)l(pts(-5,-4,4,-4),7,2);break;
      case "sack":if(v){a(pts(-3,0,-5,-3,-3,-8,-2,-11,2,-11,2,-8,5,-4,4,0),4);l(pts(-2,-7,-4,-2,-1,-1),5);b(-2,-9,5,1,3);}else{a(pts(-7,-1,-4,-5,2,-5,6,-2,7,0,-5,1),4);l(pts(-5,-2,0,-4,5,-2),5);}break;
      case "paper":{const w=v===2?3:7;const h=v===1?7:4;a(pts(-w,-h,w-1,-h-2,w,0,-w+1,2),0);a(pts(-w+1,-h+1,w-2,-h,w-1,-1,-w+2,0),3);l(pts(-w+2,-h+2,1,-h+1),v===2?6:1);break;}
      case "cord":{const d=[6,1,-3,4][v];l(pts(-9,-9,-4,-5,1,-5+d,8,-10),0,3);l(pts(-9,-10,-4,-6,1,-6+d,8,-11),v===3?6:3);break;}
      case "pin":if(v){l(pts(-5,-3,5,-5),0,4);l(pts(-5,-4,5,-6),5,2);}else{l(pts(0,0,2,-11),1,3);b(-1,-12,6,3,5);}break;
      case "gate":g.frame(x-7,y,14,19);b(-5,-17,10,v?5:15,0);for(let j=0;j<(v?2:4);j++)b(-4,-16+j*3,8,2,4);b(-5,-15,10,1,3);break;
      case "chute":l(pts(-8,-7,-1,-3,v?9:3,v?-5:0),0,5);l(pts(-8,-8,-1,-4,v?9:3,v?-6:-1),v?7:2,2);break;
      case "mesh":for(let j=0;j<4;j++){l([[-7+j*3,-7],[v?-4+j*3:-5+j*3,v?0:-4]],3);l([[-6,-6+j*2],[5,-8+j*2]],4);}break;
      case "brick":b(-5,-4,10,5,0);b(-4,-4,8,3,v?3:2);b(-4,-1,3,1,4);break;
      case "balance":{g.post(x,y,17);const d=v?0:3;l([[-9,-15+d],[9,-15-d]],3,2);for(const s of [-1,1]){const j=-14-s*d;l([[s*8,j],[s*8,j+5]],4);l([[s*8-3,j+5],[s*8,j+6],[s*8+3,j+4]],5,2);}break;}
      case "disc":{g.slab(x,y,16);ring(0,-4,6,2,2);l([[-4,-4],[v?3:0,v?-6:-9]],5,2);break;}
      case "cap":a(v?pts(-5,0,-5,-7,4,-8,5,-1):pts(-6,-1,-1,-4,5,-4,7,0),4);l(v?pts(-4,-7,3,-8):pts(-5,-1,1,-3,5,-3),5,2);break;
      case "cart":g.crate(x-6,y-2,13,7,v?6:4);ring(-4,-1,2,0,2);ring(4,-1,2,0,2);l(pts(5,-4,10,-8),3,2);break;
      case "gauge":g.post(x,y,19);for(let j=0;j<4;j++)b(1,-16+j*4,3,1,3);l([[-4,-5-v*4],[4,-7-v*4]],6,2);break;
      case "strap":ring(0,-5,5,v?5:4,2);if(!v)b(-5,-6,3,3,0);else b(1,-9,3,2,6);break;
      case "hinge":l(pts(-5,-8,-2,-5,0,-1),0,4);l([[-1,-5],[v?5:2,v?-9:0]],5,3);ring(-1,-5,2,3,1);break;
      case "stair":for(let j=0;j<4;j++){b(-8+j*4,-j*2,5,3,0);b(-8+j*4,-j*2,5,1,v?3:2);}break;
      case "board":a(v?pts(-7,-8,6,-10,6,0,-7,1):pts(-7,-2,4,-5,8,-2,-3,1),4);l(v?pts(-7,-8,6,-10):pts(-7,-2,4,-5),3);break;
      case "hook":l(v?pts(-5,-9,0,-3,4,-6,3,-10):pts(0,-12,0,-3,4,-2,5,-5),2,3);l(v?pts(-5,-10,1,-4,4,-7):pts(-1,-12,-1,-3,3,-1),3);break;
      case "flag":g.post(x,y,19);a(v?pts(1,-18,12,-19,8,-15,13,-13,1,-12):pts(1,-18,5,-17,4,-9,1,-12),6);b(1,-17,3,2,5);break;
      case "hammer":l(v?pts(-5,0,3,-8):pts(-4,-2,7,-2),4,2);l(v?pts(0,-10,7,-6):pts(5,-5,5,1),1,4);break;
      case "wick":l(v?pts(-5,-1,-2,-4,3,-6,6,-10):pts(-4,0,-2,-3,-3,-6),3,2);if(v===2)b(5,-13,3,4,5);break;
      case "ladder":{const h=v?17:8;for(const xx of [-3,3])l([[xx-1,0],[xx+1,-h]],4,2);for(let j=2;j<h;j+=4)l([[-4,-j],[3,-j-1]],3);break;}
      case "jar":a(pts(-4,0,-5,-2,-4,-7,-2,-9,-2,-11,2,-11,2,-9,4,-7,5,-2,3,0),0);a(pts(-3,-1,-3,-6,-1,-8,2,-8,3,-2,2,-1),v?5:7);b(-2,-11,5,2,4);break;
      case "mirror":{g.post(x,y,9);a(v?pts(-6,-9,1,-15,7,-12,0,-6):pts(-6,-12,3,-14,6,-8,-2,-7),0);a(v?pts(-4,-9,1,-13,4,-12,0,-8):pts(-4,-11,2,-12,4,-9,-2,-8),v?3:1);break;}
      case "mast":g.post(x,y,23);a(v?pts(1,-22,12,-8,1,-6):pts(1,-22,4,-20,3,-11,1,-12),3);l(pts(-2,-2,8,-6),4,2);break;
      case "boat":a(pts(-10,-4,-2,-2,10,-5,7,0,-4,2),0);l(pts(-9,-4,-2,-3,9,-6),4,3);if(v)b(-2,-5,5,3,5);break;
      case "mat":for(let j=0;j<(v?6:3);j++)l([[-7+j*2,-2-j%2],[-1+j*2,-5-j%2]],j%2?2:4,2);break;
      case "boot":a(pts(-4,-12,2,-12,2,-5,6,-3,7,0,-5,1,-5,-3),0);a(pts(-3,-11,1,-11,0,-4,5,-2,5,-1,-3,-1),v?6:4);b(-4,-12,7,2,3);break;
      case "brush":l(v?pts(-6,-11,3,-3):pts(-2,-12,0,-3),4,2);a(v?pts(0,-5,5,-5,8,0,4,0):pts(-3,-4,3,-4,4,0,-3,1),v?6:2);break;
      case "track":for(let j=0;j<3;j++){b(-4+j*4,-j*3,3,2,v?3:0);b(-3+j*4,-1-j*3,2,1,1);}break;
      case "stamp":b(-3,-3,7,3,0);b(-2,-6,5,3,6);b(-1,-10,3,5,4);if(v)b(5,-1,4,2,6);break;
      case "flame":a(v?pts(-4,0,-4,-4,-1,-8,0,-12,2,-8,4,-5,3,-1):pts(-4,0,-2,-3,1,-4,3,0),v?6:1);if(v)a(pts(-2,0,-1,-6,1,-4,2,0),5);break;
      case "bell":a(pts(-7,-2,-4,-5,-3,-11,0,-14,3,-11,4,-5,7,-2),0);a(pts(-4,-4,-2,-10,0,-12,2,-10,3,-5),v?5:4);l(pts(-6,-2,6,-2),3,2);b(-1,-1,3,2,5);break;
      case "chain":for(let j=0;j<4;j++)ring(-5+j*3,-7+(v?-j:Math.min(j,2)),2,j%2?2:3,1);break;
      case "rock":a(pts(-8,0,-7,-5,-3,-10,2,-11,7,-6,8,-1,2,1),1);a(pts(-7,-4,-3,-9,1,-10,2,-6,-4,-3),v?3:2);break;
      case "flow":l(v?pts(-7,-6,-2,-5,2,-3,8,-3):pts(-6,-3,-2,-4,2,-3),7,2);l(v?pts(-7,-2,-3,-2,2,0,6,-1):pts(2,0,5,-1),3);break;
      case "marker":g.post(x,y,13);a(v?pts(-4,-13,3,-15,7,-12,2,-9,-4,-10):pts(-4,-12,0,-13,3,-11,1,-8,-4,-9),v?5:2);break;
      case "tent":a(pts(-8,1,0,-12,8,-1,2,1),4);a(pts(-6,0,0,-10,2,-1),v?3:2);break;
      case "letter":a(pts(-6,-5,4,-7,7,-2,-4,1),3);l(pts(-6,-5,0,-2,4,-6),1);if(v)b(0,-4,3,2,6);break;
      case "ink":a(v?pts(-8,0,-7,-3,-1,-4,3,-3,8,-4,6,-1,0,1):pts(-5,0,-4,-2,0,-3,4,-1,0,1),0);if(v)l(pts(-5,-2,1,-3,4,-2),7);break;
      case "nib":l(v?pts(-7,-10,0,-5,7,-1):pts(-2,-12,0,-6,3,-1),4,3);l(v?pts(3,-4,8,0):pts(0,-5,3,0),0,3);break;
      case "drop":a(pts(-3,-1,-2,-4,0,-7,2,-4,3,-1,1,1,-2,1),v?7:0);b(-1,-3,1,2,3);break;
      case "drum":a(pts(-6,-8,0,-10,6,-8,6,-1,1,1,-6,-1),4);l(pts(-6,-7,0,-5,6,-7),3);l(pts(-6,-2,0,0,6,-2),v?6:2);break;
      case "weight":a(pts(-5,-1,-4,-6,-2,-8,2,-8,4,-6,5,-1),v?4:1);ring(0,-8,2,5);b(-4,-2,8,2,3);break;
      case "pointer":ring(0,-7,6,2,2);l([[0,-7],[v?5:-4,v?-10:-9]],6,2);b(-1,-8,2,2,5);break;
      case "leaf":l(pts(-5,1,-1,-4,3,-10),4,2);a(pts(-2,-4,0,-10,7,-13,5,-7),v?5:7);break;
      case "shutter":g.frame(x-6,y,12,14);for(let j=0;j<3;j++)l([[-5,-12+j*3],[5,v?-12+j*3:-15+j*3]],v?4:2,2);break;
      case "ring":ring(0,-5,5,v?5:2,2);break;
      default:throw Error("Unknown district landmark part "+key);
    }
  }
  const recipes=[
    [ // Reverse mill. The mill slowly becomes a functioning grain network.
      "frame 0 0|basin 0 1|basin 0 1 1,flow -2 -9",
      "cart 0 0,wood 9 0|sack -3 -4|sack -3 -4 1,sack 3 -5 1",
      "chute -7 0,post 5 1|wheel 3 0 2|wheel 3 0 3,flow 9 1 1",
      "stone 0 0 2|ink -3 -1,rock 5 -3|flow -4 -2 1,flow 4 0",
      "post -9 1 1,box 8 0|mesh 0 0,rock 1 -3|mesh 0 -6 1,sack 9 -3 1",
      "stone -5 0 2,stone 6 0|wood -3 -3|brick -8 -5,brick 4 -6,wood 0 -8 1",
      "gate -1 0,wheel 9 -7|pin 2 -5 1|pin 3 -14,flow -2 1 1",
      "frame 0 0 1,wheel 7 -16|sack -1 0|sack -1 -12 1,cord 0 -8",
      "mesh -7 0,box 5 0|paper -7 1|paper 5 -8 1,stamp 10 -5",
      "stone 0 0 2|balance 0 -1,sack -9 -4|balance 0 -1 1,sack 9 -10 1",
      "post -9 0,post 9 0|chute -7 -8|chute -6 -8 1,chute 6 -7 1",
      "basin 0 0 1,post 9 1 1|drop 1 -6,drop -3 -3|mat -1 -1 1,flow 4 -3",
      "frame 0 0,wood 9 0|gate 0 0|gate 0 0 1,sack -1 -1 1",
      "stone -5 0 2,stone 6 0 2|disc -7 -3,disc 6 -4|disc -7 -3 1,disc 6 -4 1,sack 2 -9",
      "chute 0 0 1|flow 7 1 1,cap -9 1|cap 4 -2 1,flow -7 0",
      "wheel -8 0,wheel 8 0|strap -4 -2|cord 0 -2 1,strap 5 -3 1",
      "frame 0 0,mesh 10 0|lamp 0 -8|lamp 0 -8 1,paper 8 -4",
      "stair -8 0,wood 8 1|cart -6 -2|cart 7 -6 1,track -8 0 1",
      "basin -5 0 1,gauge 1 0|drop 2 -6,disc 9 -1|drop 2 -13 1,disc 9 -1 1",
      "frame -6 -2,wheel 7 0 3|sack -7 0,chute -4 -11|sack -8 -9 1,chute -3 -11 1,flow 5 -4 1"
    ],[ // Sliding dike, hardware and locks.
      "gate -4 0,stone 8 0|ink 2 0,brush 10 0|brush -9 -2 1,mat 2 0 1",
      "post -8 0 1,post 8 0 1|pin -7 -5,pin 7 -4|pin -3 -7 1,pin 3 -9 1",
      "stone -8 0 2,stone 8 0 2|gate 0 1|gate 0 1 1,ladder 2 1 1",
      "chute -4 0 1,post 7 0|board 7 0,flow 6 0|board 7 0 1,flow -6 0 1",
      "board -2 -1 1,wood 8 1|hinge 5 0|hinge 3 -4 1,pin 5 -6 1",
      "stair 0 0 1,frame 4 0|cart -8 0|cart 7 -10 1,rock 5 -14",
      "stone -11 0 2,stone 11 0 2|gate 0 0,rock -1 -3|gate 0 0 1,rock 9 -4,marker -3 -2",
      "flow 0 0 1|wood -3 0,wood 6 0|post -4 1,post 4 -1 1,cord 0 -2 1",
      "frame 0 0|paper -6 1|paper 0 -8 1,pin 5 -12 1",
      "wheel -5 -1 2,stair 5 0|brick 8 0|brick -2 -3,brick 5 -4,disc 4 -4",
      "frame 0 0|board 0 -2 1|board 0 -11,hinge 8 -14 1",
      "stone 0 0 2|hook -7 -2,hook 0 -2,hook 7 -2|hook -8 -4 1,hook 0 -7 1,hook 8 -10 1",
      "post -11 0 1,post 11 0 1|wood -7 0,wood 8 -3|wood -6 -2 1,wood 6 -4 1,hinge 0 -5 1",
      "frame 0 0 1,chain -3 -15|shutter 0 0,hook -9 -2|shutter 0 -7 1,hook 6 -12 1",
      "post -8 0,post 8 0|shutter 0 -2,flow -2 1 1|shutter 0 -2 1,flow 9 0",
      "box 4 0,wood -6 0|hammer -7 0|hammer 5 -6 1,pin -4 -3 1",
      "stone 0 0 2|marker 7 2|gauge 0 -2 1,brick -5 -3",
      "leaf -8 0 1,leaf 9 -1|gate 0 0|gate 0 0 1,mat 2 0 1",
      "stone 0 0 2,basin -8 0 1|flag 2 0|flag 2 0 1,gauge 10 0 2",
      "stair 0 0 1|gate -9 0,gate 0 -2,gate 9 -4|gate -9 -5 1,gate 0 -7 1,gate 9 -10 1,flow 0 0 1"
    ],[ // Night lock, nautical signals with deliberately visible silhouettes even before ignition.
      "wood 0 0 1,stone -7 1|flame 0 -3|flame 0 -3 1,lamp 7 -1 1",
      "post -6 0 1,post 7 0 1|wick -5 -3,wick 7 -3|wick -5 -3 1,wick 3 -6 2",
      "frame 0 0 1,lamp 6 -15|ladder -6 1|ladder -5 -2 1,lamp 6 -15 1",
      "lamp -4 0 1,post 8 0|board 7 0|board 7 -2 1,cap 6 -12",
      "box 0 0|jar -6 1,jar 6 1|jar -4 -3 1,jar 3 -3 1,strap 0 -7 1",
      "post 8 0,stone -7 0|stair 1 0|stair 1 0 1,lamp -7 0 1,lamp 8 -5 1",
      "frame 0 0 2,mirror -2 -16|cap -2 -19|cap 8 -20 1,lamp -2 -14 1",
      "boat -6 1,stone 5 -1|wood 5 -2|marker 4 -1 1,flag 8 -1",
      "chute 0 0,jar -8 0|wick -7 -2|wick 4 -1 2,jar 8 -3 1",
      "basin 0 0 1,post 9 0|ink 0 -3 1,mesh 9 0|mesh -7 -3 1,flow 2 -3 1",
      "frame 0 0|board 0 -7 1,lamp -8 -1|board 1 -10,lamp -8 -1 1",
      "stone 0 0 2|mirror 0 -3,ink 1 -10|mirror 0 -3 1,brush -8 -1",
      "boat -7 2,boat 7 0|wood -8 -2,wood 7 -4|wood -4 -4 1,wood 4 -5 1,cord 0 -2 1",
      "frame 0 0 1,flame -8 0 1|mesh 0 -12|mesh -2 -3 1,mesh 4 -5 1",
      "frame 0 0|wick -6 -3 2,wick 6 -4 2|wick -6 -3 2,cap 7 -6 1",
      "marker 0 0,boat 9 0|lamp -6 -4|lamp -6 -4 1,flag 8 0 1",
      "boat 0 0|mast 0 -3,cord -3 -5|mast 0 -3 1,cord -3 -8 1",
      "frame 0 0 2,wheel 9 -17|box 0 1,ladder -8 0|box 0 -12,cord 0 -12 1",
      "jar -8 0 1,jar 8 0 1|gauge -2 0,gauge 3 -1 2|gauge -2 0 1,gauge 3 -1 1,pin 0 -10 1",
      "frame 0 0 2,mast 9 -2|lamp -6 -6,lamp 3 -19|lamp -6 -6 1,lamp 3 -19 1,mirror 7 -6 1"
    ],[ // Boot post office. Canvas, letter bundles and shoemaking machinery.
      "board -7 -1 1,chute 8 0|mat 1 0|mat 1 0 1,flow 8 1",
      "boot -5 0,boot 5 -1 1|cord -3 2|cord 0 1 1,pin 1 -6 1",
      "frame 0 0,ink 5 0|gate 0 0|gate 0 0 1,mat -3 1 1",
      "frame 0 0,hook 6 -14|sack 0 1|sack 1 -9 1,cord 1 -8 1",
      "board -3 -2 1,boot 6 0|hinge -1 -2|hinge -2 -5 1,strap 4 -4 1",
      "chute 3 0,ink -5 0|mat 0 1|track 0 0,track 5 -5 1",
      "basin 0 0 1,frame 0 0|wheel 6 -6 2,boot -4 0|wheel 6 -6 3,boot -4 -4 1,flow 0 -3 1",
      "chute -6 0,chute 6 -2 1|brush -4 0,brush 4 0|brush -4 -4 1,cap 5 -3 1",
      "wood 0 0 1,boot -4 -1|marker 8 0|boot 6 -2 1,letter 1 1",
      "frame 0 0 1,boot 4 -5|drum -5 0,flame -4 -2|drum -5 0 1,flame -4 -2 1,boot 8 -6",
      "box 0 0,strap -6 0|cap 0 -7|cap 8 -7 1,pin 0 -7,pin -3 -6",
      "boot 0 0|paper 2 -5 1,drop 8 0|paper -8 1,stamp 5 -1",
      "post -10 0,post 9 0|wood -7 -8,wood 7 -12|wood -5 -9 1,wood 5 -11 1,boot 3 -12",
      "brick -2 0,letter 9 -2|cap -2 -4,jar 3 -2|cap -9 -2 1,jar 2 -2 1,stamp 8 -2 1",
      "sack -6 0 1,sack 7 -1 1|cord 0 -3|strap -5 -5 1,strap 7 -6 1",
      "frame 0 0 1,lamp 8 -9|shutter 0 0 1|shutter 0 -8,lamp 8 -9 1,letter 0 -2",
      "cart 0 0,sack -4 -5 1,sack 4 -6 1|paper 8 1|paper -4 -9 2,paper 4 -10 1",
      "post -8 0,post 8 0|board 0 -4 1|wood -4 -5 1,wood 3 -6 1,boot -1 -7 1",
      "letter -5 -1,letter 5 -2|stamp -7 -2,stamp 6 -2|stamp -7 -2 1,stamp 4 -3 1",
      "frame 0 0 1,mat 0 0 1|sack 1 -2,letter 7 -2|boot -4 -1,boot 5 -2 1,letter 8 -10 1"
    ],
    [ // Canyon mouths. Sound, falling stone and suspended rescue lines.
      "rock -5 0 1,rock 6 -1|ink 0 -2|disc 0 -2 1,marker 6 -3",
      "post -9 0,post 9 -1|chain -7 -5,chain 6 -6|chain -5 -7 1,chain 4 -11 1",
      "rock -8 0,rock 8 -2 1|board 0 -1 1|flag -7 -2 1,mat 0 0 1",
      "frame 0 0 1,rock 7 0|mesh 0 -3|mesh 0 -12 1,rock -1 -9",
      "stone 0 0 2,hook 8 -1|cord -2 0|cord 1 -3 1,strap 6 -5 1",
      "stair 0 0,post 6 0|cart -7 0|cart 5 -9 1,chain -2 -3 1",
      "rock -9 0,rock 9 -2 1|gate 0 0,cap 1 -4|gate 0 0 1,bell 0 -13 1",
      "rock -10 0,rock 0 0,rock 10 0|flow -5 -1,flow 6 -1|brick -6 -3,flow 6 -2 1",
      "post -8 0 1,hook 9 -3|cord 0 0|cord 0 -1 1,pin 7 -6 1",
      "frame 0 0,stone -10 1|board 0 0|wood -5 -2 1,wood 5 -3 1,flag 8 1",
      "rock -7 0,frame 2 0|bell 2 -4|bell 2 -8 1,cord 4 -4 2",
      "rock -2 -3,wood 6 0|rock -4 -8,rock 5 -7|stone -8 1,stone 8 -1,flow -1 -4",
      "flow 0 1 1|stone -9 0,stone 9 -2|stone -9 0,stone 0 -2 1,stone 9 -2",
      "rock -10 0 1,rock 10 0|gate 0 0,weight -4 -2|gate 0 0 1,weight -7 -10 1",
      "tent -6 0,post 8 0|shutter 4 0 1|shutter 4 -3,flag 8 0 1",
      "rock 2 0,mat -6 0 1|flame -5 0|flame -5 0 1,flame 5 -5 1",
      "stair -3 0,rock 8 0|track -1 0|track -3 -1 1,marker 6 -3 1",
      "post -9 0,post 9 -2|board -7 -2,cord 0 0|board 3 -8,cord 1 -5 1,letter 2 -9",
      "frame 0 0|gauge -5 0,gauge 5 -2 2|gauge -5 0 1,gauge 5 -2 1,bell 0 -9 1",
      "rock -9 0 1,rock 9 -2|gate -5 0,gate 5 -2|gate -5 -4 1,gate 5 -10 1,flow 0 1 1"
    ],[ // Ink farms. Stained fibres, brushes, screens and written letters.
      "chute 1 0 1,ink 2 0 1|paper -7 -1|paper 3 -3 1,flow -5 1",
      "basin 0 0,post 7 0 1|brush -6 0,brush 6 0|brush -4 -2 1,brush 4 -4 1,strap 1 -4 1",
      "leaf -9 0,leaf 8 -1|gate 0 1|gate 0 1 1,flow 0 1",
      "chute 0 0 1,ink 6 0 1|board 5 0|board 5 -1 1,ink -6 -2",
      "box -6 0,chute 5 0|jar 5 1,nib 7 0|jar -3 -3,nib -4 -7,cord -2 -3 1",
      "stone -8 0,stone 6 -2|drop 1 0,ink -2 -1|stair 0 -1 1,track 3 -2",
      "drum 0 0,wheel 7 -4|ink 0 -6 1,drop -4 -5|flow 0 -7 1,jar -6 0 1",
      "frame 0 0,basin 0 0|wick -4 -3,wick 4 -4|mesh -3 -6 1,wick 4 -7 1",
      "frame -4 0,box 6 0|paper -3 1,drop 1 1|paper 4 -5 1,paper 8 -6,cap 6 -8",
      "post -9 0,post 9 0|board 0 -5 1,ink 1 -9|board 5 -13,mat 0 0 1",
      "board 2 0 1,jar -8 0|ink 1 -3 1|paper 0 -3 1,nib 6 -2 1",
      "frame 0 0 1,basin 0 0|drop -3 -8,drop 4 -5|mesh 1 -8 1,flow -1 -3",
      "post -10 0,post 10 0|mesh -7 -4,mesh 7 -6|mesh -4 -6 1,mesh 3 -7 1,paper 2 -5",
      "chute -5 0 1,chute 5 -2 1|ink 0 -1 1|drop -7 0,drop 6 -2 1,cap 0 -5 1",
      "frame 0 0 1,ink 1 1 1|gate 4 -1 1,flow -5 0|gate 4 -1,flow -6 -1 1",
      "basin 0 0,stone 7 -1|drop 0 -4,ink 0 -2|brick 0 -4,mat -7 0 1",
      "stamp -6 0,box 6 0|brick -5 1,brick 4 0|brick 4 -5,pin 6 -6 1,stamp -6 0 1",
      "boat 1 0,post 8 0|letter -6 1,drop 3 1|letter -2 -4 1,cord 1 -8 1",
      "paper 0 0 1|jar -6 -1,jar 6 -2 1|ink -5 -4 1,drop 5 -4 1,pin 0 -6 1",
      "frame 0 0 2,brush 8 0 1|mesh 0 -7,ink 1 -6|paper -4 -7 1,paper 5 -8 1,letter 1 -2 1"
    ],[ // Balance channels. Counterweights, measuring lines, scales and bulk parcels.
      "boat 0 0,frame -3 0|basin -3 1,weight 6 -1|basin -3 -8 1,weight 6 -10 1",
      "post -9 0,post 9 -1|cord -4 0,cord 7 -1|cord 0 -4 1,strap 1 -8 1",
      "gauge -8 0,weight 7 0|gate 0 1|gate 0 1 1,weight 7 -9 1",
      "stone 0 0 2,gauge -8 0|ring 4 -2,flow 8 0|cap 4 -3 1,pin 6 -4 1",
      "stone 0 0 2|board 0 -3,weight -7 0|wood -4 -4 1,wood 4 -5 1,weight 7 -4",
      "frame 0 0 1,wheel 6 -16|weight 4 1|weight 4 -10 1,cord 3 -8",
      "gate 0 0,gauge -9 0|gauge 8 0 2,flow -6 1|gauge 8 0,flow 3 -2 1",
      "chute -5 0,chute 5 -2|flow 1 1|flow -6 1 1,flow 6 -3 1,pin 0 -3 1",
      "frame 0 0,chain 3 -9|weight 7 0|weight 3 -9 1,hook 4 -10",
      "stone 0 0 2|balance 0 -1,pointer 1 -15|balance 0 -1 1,pointer 1 -15 1",
      "basin 0 0 1|gauge -4 0,marker 5 0|gauge -4 0 2,paper 5 -6 2",
      "boat -6 0,post 7 0|weight -3 0,weight 4 1|weight -6 -5 1,weight 5 -10 1,flow 2 0",
      "drum -6 0,drum 6 -1|cord -2 1|cord 0 -2 1,chute 0 -2 1",
      "post 0 0,wood 6 1|wood 0 -10,weight -4 0|wood 0 -13 1,weight 5 -7 1,pin 0 -12 1",
      "basin 0 -2 1,chute -6 0,chute 6 -1|flow -5 1,flow 7 0|gate 6 0,flow -6 1 1",
      "basin -6 0 1,stone 4 0|balance 1 0 1,drop -6 -7|balance 1 0,drop -9 -3 1,weight 8 -6",
      "box 0 0,stamp -8 0|paper -3 -1,paper 6 -2|paper 0 -5 2,paper 3 -7 2,pin 5 -7 1",
      "frame 0 0 1,boat 6 0|box -4 1,flow -4 0|box -4 -9 1,cord -3 -8 1",
      "disc 0 0,gauge -7 0|pointer 1 -5,gauge 6 0 2|pointer 1 -5 1,gauge 6 0,pin 4 -6 1",
      "frame 0 0 1,gauge 0 0|boat -7 1,boat 8 -7,weight 8 -8|boat -8 -3 1,boat 8 -3 1,balance 0 -2 1"
    ],[ // Silent lock. The old bell has become a human signal, and the last letter is returned.
      "frame 0 0 1,leaf -9 0|ink 0 -5 1,cap 1 -3|bell 0 -6 1,flow -6 1",
      "boat -7 0,boat 7 -2|cord -5 1,cord 6 -1|cord 0 -3 1,pin 4 -6 1",
      "stone -8 0,stone 8 -1|gate 0 0,flow -2 2|gate 0 0 1,flow 1 1 1",
      "chute -5 0 1,basin 5 0 1|board 4 0,flow 8 1|board 4 -1 1,flow -7 1",
      "post -8 0,post 8 -1|flag -6 0,cord 0 0|flag -6 0 1,cord 1 -5 1,flag 8 -1 1",
      "stone -6 0 1,stone 8 -2 1|flow 0 -1 1,drop 4 0|stair 0 -1 1,track 1 -2",
      "frame 0 0 1,bell -7 -11|gate 0 0,chain 2 -8|gate 0 0 1,chain 4 -12 1,hammer 6 -3 1",
      "chute -5 0,chute 5 -2|lamp -7 0,lamp 7 -2|lamp -7 0 1,shutter 7 -2 1",
      "stone -5 0,post 8 0|lamp 1 -2,wick 5 0|lamp 1 -2 1,wick 3 -4 2",
      "drum -2 0 1,board 5 -1 1|pin 5 -4 1|pin 5 -8,hammer -7 -3 1",
      "bell 0 -5,stone 6 0|ink -7 0|ink 4 0 1,mirror -7 -1 1",
      "frame 0 0 1|cord -6 -5,cord 6 -6|cord -6 -11 1,hook 7 0 1",
      "post -9 0,post 9 0|ring -5 -3,ring 6 -3|ring -3 -6 1,ring 3 -7 1,chain 0 -3 1",
      "brick -10 0,brick 10 -1|gate -5 0,gate 6 -1|gate -5 0 1,gate 6 -1 1,flag 2 0 1",
      "stone -8 0 1,stone 8 -2 1|wood -5 0,wood 4 -2|wood -1 -3 1,marker 7 -3",
      "frame 0 0,bell -2 -9|ink -6 0 1|ink 7 0 1,mirror 6 -2 1",
      "letter -6 -1,letter 7 -2|cord -2 1|cord 0 -3 1,stamp 3 -4 1",
      "frame 0 0,leaf -8 0|board 0 0,hinge 6 0|board 0 0 1,hinge 4 -5 1,lamp 8 -5 1",
      "stone -7 0,stone 7 -2|basin -5 0,basin 5 -2|basin -5 0 1,basin 5 -2 1,leaf 0 -4",
      "frame 0 0 2,boat -8 1|gate 0 0,hook 5 -2,lamp 7 -9|gate 0 0 1,hook 5 -9 1,lamp 7 -9 1,letter -6 -4 1"
    ]
  ];
  const scenes=recipes.map(rows=>rows.map(row=>row.split("|").map(layer=>layer.split(",").map(entry=>{
    const [name,x,y,variant=0]=entry.split(" ");return [name,Number(x),Number(y),Number(variant)];
  }))));
  function prop(c,k,i,x,y,done,scale=1){
    const layers=scenes[k][i],g=brush(c,palettes[k]);c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    for(const parts of [layers[0],layers[done?2:1]])for(const args of parts)part(g,...args);
    c.restore();
  }
  function pond(g,x,y,w,h,fill=7){
    const rim=[[-1,-.1],[-.74,-.68],[-.19,-1],[.4,-.88],[.86,-.58],[1,-.14],[.77,.49],[.37,.9],[-.28,1],[-.84,.58]].map(([a,b])=>[x+a*w,y+b*h]);
    g.a(rim,0);g.a(rim.map(([a,b])=>[x+(a-x)*.97,y+(b-y)*.93]),fill);
    for(let j=0;j<13;j++){const t=Math.sin((j+.5)*4.7),v=Math.sin(j*7.13+.3);
      g.b(x+t*w*.63,y+v*h*.61,4+j%5,1,j%4===0?3:1);}
  }
  function mill(g,x,y,n=0){
    g.a([[x-15,y-8],[x-15,y-27],[x+10,y-33],[x+23,y-22],[x+23,y-2],[x-3,y+4]],0);
    g.a([[x-12,y-20],[x+7,y-25],[x+7,y-2],[x-12,y+1]],4);g.a([[x+7,y-25],[x+20,y-19],[x+20,y-5],[x+7,y-2]],1);
    g.a([[x-19,y-23],[x+4,y-37],[x+12,y-36],[x+26,y-24],[x+6,y-19]],0);
    g.a([[x-17,y-24],[x+4,y-35],[x+10,y-34],[x+6,y-22]],2);
    g.l([[x+8,y-33],[x+23,y-24]],3);for(let i=0;i<3;i++){g.l([[x-10,y-17+i*4],[x+4,y-20+i*4]],1);g.l([[x+9,y-18+i*4],[x+18,y-14+i*4]],4);}
    g.b(x-8,y-15,5,8,0);g.b(x+1,y-12,3,3,5);part(g,"wheel",x+12,y+1,n?3:2);part(g,"chute",x-14,y-7,1);
  }
  function terrace(g,pts,top,body,h){
    g.a([...pts,...pts.slice().reverse().map(([x,y])=>[x,y+h])],body);g.l(pts,0,4);g.l(pts,top,2);
  }
  function house(g,x,y,w,h){
    g.a([[x-w,y-h],[x+w,y-h-4],[x+w,y],[x-w,y+5]],4);
    g.a([[x-w-4,y-h],[x-4,y-h-14],[x+w-5,y-h-16],[x+w+3,y-h-5],[x-w,y-h+3]],0);
    g.a([[x-w-2,y-h-1],[x-4,y-h-12],[x+w-7,y-h-14],[x+w-12,y-h-4]],6);
    for(let i=-w+3;i<w-6;i+=5)g.l([[x+i,y-h],[x+i+5,y-h-7]],4);
    g.b(x-4,y-h+5,7,h-4,0);g.b(x+w-7,y-h+3,3,4,5);
  }
  function tower(g,x,y,h,light){
    g.a([[x-6,y],[x-4,y-h],[x+4,y-h-1],[x+7,y-1]],0);g.l([[x-4,y-1],[x-2,y-h]],1,3);
    g.b(x-5,y-h-6,10,7,0);g.b(x-3,y-h-5,6,4,light?5:2);g.a([[x-8,y-h-6],[x,y-h-13],[x+8,y-h-7]],4);
    if(light){g.b(x-12,y-h-4,4,1,5);g.b(x+8,y-h-6,5,1,5);}
  }
  function cliff(g,pts,h,face=1){
    g.a([...pts,...pts.slice().reverse().map(([x,y])=>[x-2,y+h])],0);
    g.a([...pts,...pts.slice().reverse().map(([x,y])=>[x-2,y+h-3])],face);g.l(pts,2,3);
    for(let j=0;j<pts.length-1;j++){const [x,y]=pts[j];g.l([[x+2,y+4],[x+1,y+h*.56],[x-2,y+h-2]],0);g.b(x+4,y+4,3,2,3);}
  }
  function inkbed(g,x,y,w,h){
    const p=[[x,y],[x+w,y-h*.38],[x+w+8,y+h*.62],[x+9,y+h]];
    g.a(p,0);g.l([...p,p[0]],2,2);
    for(let j=1;j<5;j++)g.l([[x+j*w/5,y-j*h*.075+1],[x+j*w/5+8,y+h-j*h*.075-1]],1,2);
  }
  function balanceTower(g,x,y,h,angle){
    const d=angle?4:-4;g.frame(x-6,y,12,h);g.l([[x-17,y-h+d],[x+17,y-h-d]],0,5);g.l([[x-17,y-h+d-1],[x+17,y-h-d-1]],5,2);
    for(const s of [-1,1]){const bx=x+s*14,by=y-h-s*d;g.l([[bx,by],[bx,by+11]],3);part(g,s<0?"basin":"weight",bx,by+15,1);}g.ring(x,y-h,3,3);
  }
  function gatehouse(g,x,y,w){
    g.a([[x-w,y-3],[x-w,y-17],[x-w*.55,y-25],[x-w*.38,y-24],[x-w*.38,y],[x-w*.7,y+2]],1);
    g.a([[x+w*.4,y-2],[x+w*.4,y-23],[x+w*.6,y-29],[x+w,y-28],[x+w,y-3]],1);
    g.l([[x-w-2,y-17],[x-w*.55,y-25],[x-w*.38,y-24]],3,2);
    g.l([[x+w*.4,y-22],[x+w*.6,y-29],[x+w,y-28]],3,2);
    g.l([[x-w*.5,y-18],[x+w*.6,y-22]],0,5);g.l([[x-w*.5,y-19],[x+w*.6,y-23]],4,3);
    for(let j=-1;j<2;j++)g.l([[x+j*4,y-19],[x+j*4,y-9]],2);
  }
  const grounds=[
    g=>{ // Two millponds, sluice flume, timber fringe and mill wheels.
      g.b(0,0,width,height,2);pond(g,53,210,115,176,7);pond(g,327,492,145,190,7);
      g.l([[-20,350],[72,330],[116,370],[176,365],[225,414],[337,435],[401,480]],0,19);
      g.l([[-20,350],[72,330],[116,370],[176,365],[225,414],[337,435],[401,480]],7,13);
      for(const [x,y] of [[28,403],[189,405],[360,578],[298,151],[110,340],[86,717]])mill(g,x,y,1);
      for(const [x,y] of [[105,80],[170,196],[330,700],[46,531]]){for(let j=0;j<8;j++)g.l([[x+j*4,y-j%2],[x+j*4+5,y-9]],4,2);}
    },
    g=>{ // Three raised retaining walls converge on a single intake.
      g.b(0,0,width,height,7);
      for(let n=0;n<4;n++){const yy=65+n*190,p=[[-15,yy+32],[65,yy+6],[131,yy+17],[211,yy-12],[281,yy+1],[404,yy-45]];
        g.a([...p,[404,yy+109],[290,yy+139],[208,yy+124],[132,yy+155],[-17,yy+143]],2);
        terrace(g,p,3,1,15);terrace(g,p.map(([x,y])=>[x,y+49]),3,1,7);
        for(let j=0;j<5;j++){const x=23+j*75+n%2*9;g.post(x,yy+49-j*6,11);}}
      [[329,75],[193,193],[43,348],[313,470],[92,690]].forEach(([x,y])=>gatehouse(g,x,y,17));
    },
    g=>{ // Offshore night beacons and an angular breakwater where the sea opens.
      g.b(0,0,width,height,0);for(let n=0;n<95;n++){const x=noise(n*53+21)*383,y=noise(n*71+3)*747;g.b(x,y,2+n%8,1,n%6?1:7);}
      const points=[[28,697],[108,597],[216,584],[300,476],[236,378],[132,349],[56,233],[106,105],[250,68],[356,138]];
      g.l(points,1,27);g.l(points,2,16);g.l(points,4,8);
      for(const [j,[x,y]] of points.entries()){pond(g,x,y,25+j%3*5,11,1);tower(g,x+4,y,15+j%3*6,true);}
      [[341,690],[34,325],[358,235],[166,228]].forEach(([x,y])=>{pond(g,x,y,30,11,1);tower(g,x,y,22,true);});
    },
    g=>{ // Muddy courtyards and stepped postal terraces with a main sorting yard.
      g.b(0,0,width,height,2);for(const [x,y,w,h] of [[-8,35,174,111],[220,41,173,99],[3,232,202,139],[223,275,165,117],[8,492,158,111],[230,517,172,154]]){
        g.a([[x,y+20],[x+w*.72,y],[x+w,y+22],[x+w,y+h],[x+14,y+h+13]],1);
        g.a([[x+5,y+22],[x+w*.72,y+5],[x+w-4,y+25],[x+w-6,y+h-3],[x+16,y+h+8]],4);
        for(let i=0;i<3;i++){house(g,x+31+i*34,y+44,11+i%2*3,13);part(g,"boot",x+41+i*28,y+h-8,i%2);}}
      g.l([[-8,447],[67,458],[152,439],[236,462],[303,439],[385,454]],1,15);
      for(const [x,y] of [[37,159],[207,191],[59,480],[347,728]]){part(g,"cart",x,y,1);part(g,"letter",x,y-8,1);}
    },
    g=>{ // Two broken canyon mouths, sharp cliff terraces and isolated spires.
      g.b(0,0,width,height,1);const p=[[25,-20],[93,91],[58,145],[134,224],[89,298],[147,381],[91,460],[151,558],[87,642],[114,772]];
      const q=[[285,-22],[230,82],[303,171],[243,242],[310,336],[241,434],[314,510],[261,602],[326,681],[294,770]];
      g.a([[-11,-15],...p,[-12,775]],2);g.a([[395,-16],...q,[396,771]],2);
      cliff(g,p,20);cliff(g,q,28);g.l([[189,-7],[148,91],[203,200],[158,303],[209,405],[149,523],[207,645],[164,751]],7,4);
      for(const [x,y] of [[147,110],[294,126],[48,251],[204,287],[342,457],[170,488],[31,612],[228,712]]){cliff(g,[[x-11,y],[x-6,y-12],[x,y-21],[x+9,y-1]],14);part(g,"rock",x+4,y+16,1);}
    },
    g=>{ // Brush-growing beds, paper drying screens and indigo runoffs in diagonal terraces.
      g.b(0,0,width,height,1);for(let row=0;row<8;row++){const y=row*94+29;
        for(let j=0;j<4;j++)inkbed(g,-20+j*105+(row%3)*6,y,85,53);
        g.l([[-10,y+70],[124,y+51],[217,y+62],[397,y+37]],7,6);
        for(let j=row%2;j<4;j+=2){const x=26+j*101;g.frame(x,y+9,16,13);part(g,"mesh",x+8,y+4,1);}}
      for(const [x,y] of [[104,92],[24,353],[344,569],[213,710]]){part(g,"drum",x,y,1);part(g,"nib",x+7,y,1);}
    },
    g=>{ // Overlapping levels of a water balance: two long channels and a trough market.
      g.b(0,0,width,height,2);const c=[[29,-14],[108,80],[68,166],[144,255],[100,341],[165,440],[96,539],[155,642],[114,761]];
      const d=[[245,-20],[287,70],[247,159],[325,252],[277,336],[332,439],[267,523],[322,626],[281,756]];
      for(const p of [c,d]){g.l(p,0,30);g.l(p,7,25);g.l(p,1,3);}
      for(const [x,y,h] of [[52,105,22],[194,161,22],[310,270,25],[63,384,21],[206,482,26],[333,638,29],[170,732,24]]){
        balanceTower(g,x,y,h,y%3);for(let j=0;j<3;j++)part(g,"basin",x-22+j*10,y+10,j%2);}
    },
    g=>{ // Three stone lock chambers; bars, old signal walls and silent pools.
      g.b(0,0,width,height,1);
      [[13,32,276,178],[91,246,302,196],[-13,499,312,197]].forEach(([x,y,w,h])=>{
        g.b(x,y,w,h,0);g.b(x+5,y+6,w-10,h-12,2);g.b(x+14,y+17,w-28,h-34,1);g.b(x+23,y+28,w-46,h-56,7);
        for(let j=0;j<5;j++){const xx=x+32+j*(w-64)/4;g.b(xx,y+26,2,h-52,1);g.b(xx-3,y+19,9,3,0);}
        gatehouse(g,x+w/2,y+h-13,24);gatehouse(g,x+w*.35,y+28,13);});
      for(const [x,y] of [[334,106],[37,295],[342,522],[79,723]]){tower(g,x,y,20,false);part(g,"bell",x,y-8);}
    }
  ];
  // Material-aware detail is painted before the roads. Read the untouched ground
  // once, so meadow plants stay on banks and beams never erase a building.
  function weather(c,k){
    const p=palettes[k],g=brush(c,p),pixels=c.getImageData(0,0,width,height).data;
    const colors=p.map(col=>parseInt(col.slice(1),16)),tone=(base,end,n)=>{
      const a=colors[base],b=colors[end];let hex="#";
      for(const shift of [16,8,0])hex+=Math.round(((a>>shift)&255)*(1-n)+((b>>shift)&255)*n).toString(16).padStart(2,"0");
      return hex;
    };
    let state=51749+k*1097;const rand=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n;};
    const at=(x,y)=>{if(x<0||y<0||x>=width||y>=height)return -1;const idx=(Math.floor(y)*width+Math.floor(x))*4;
      return colors.indexOf((pixels[idx]<<16)|(pixels[idx+1]<<8)|pixels[idx+2]);};
    const allowed=(x,y,mat,d)=>[[0,0],[-d,-d],[d,-d],[d,d],[-d,d]].every(([dx,dy])=>at(x+dx,y+dy)===mat);
    const water=k===2?0:7,hard=k===4||k===7||k===5?1:2;
    for(let j=0;j<470;j++){
      const x=rand(width),y=rand(height),m=at(x,y),rad=3+rand(8);
      if((m!==water&&m!==hard)||!allowed(x,y,m,rad))continue;
      if(m===water){const col=tone(water,k===2?7:1,.13);
        g.l([[x-rad,y-1],[x-2,y-1],[x+1,y-2],[x+rad,y-2]],col,2);
        g.b(x-rad-2,y-1,3,1,tone(water,3,.19));if(j%3===0)g.b(x+4,y+2,rad,1,tone(water,3,.14));
      }else{
        const col=tone(hard,j%3===0?3:0,j%3===0?.12:.083);
        g.a([[x-rad,y],[x-rad+3,y-2],[x-3,y-3],[x+3,y-3],[x+rad,y-1],[x+rad-2,y+2],[x+2,y+3],[x-3,y+2]],col);
        if(j%2)g.b(x+1,y-3,2,1,tone(hard,3,.24));
      }
    }
    function shrub(x,y){
      const shade=tone(hard,0,.38),leaf=tone(hard,7,.42),sun=tone(hard,3,.31);
      g.a([[x-6,y],[x-5,y-4],[x-2,y-4],[x-2,y-7],[x+2,y-9],[x+5,y-5],[x+7,y-2],[x+4,y+1]],shade);
      g.a([[x-4,y-3],[x,y-7],[x+2,y-8],[x+3,y-5],[x+1,y-3]],leaf);g.b(x-2,y-6,3,1,sun);
      g.b(x,y+1,2,2,4);
    }
    for(let j=0;j<135;j++){
      const x=9+rand(width-18),y=16+rand(height-34),m=at(x,y);
      if(!allowed(x,y,m,5))continue;
      if(m===hard){
        if(k===0||k===1||k===6){if(j%7===0){shrub(x,y);continue;}
          for(let n=0;n<3;n++){const dx=n*2;g.l([[x+dx,y],[x+dx-2+n,y-3-n]],tone(hard,0,.31));}g.b(x-1,y,4,1,tone(hard,3,.3));}
        if(k===3){for(let n=0;n<3;n++){g.b(x+n*3,y-n,3,2,tone(2,4,.43));g.b(x+n*3,y-n,2,1,tone(2,3,.33));}}
        if(k===4){g.l([[x-6,y],[x-1,y-2],[x+4,y-2],[x+7,y-4]],tone(1,2,.44));g.l([[x+1,y-2],[x+2,y+1]],tone(1,0,.26));}
        if(k===5){for(let n=0;n<3;n++){g.l([[x+n*2,y],[x+n*2-1,y-4-n]],tone(1,7,.54));}g.b(x-1,y,5,1,0);}
        if(k===7){g.b(x-6,y,8,1,tone(1,2,.24));g.b(x+1,y-3,1,3,tone(1,0,.26));g.b(x+3,y-3,5,1,tone(1,2,.23));}
      }
      if(k===2&&m===0&&j%7===0){g.l([[x-4,y],[x-2,y-1],[x+2,y-1]],tone(0,7,.45));g.b(x+3,y-1,2,1,tone(0,3,.34));}
    }
    if(k===3){for(const [x,y] of [[45,80],[221,254],[66,550],[293,584]]){g.post(x,y,14);g.post(x+19,y-3,14);g.l([[x,y-12],[x+9,y-11],[x+19,y-15]],4);part(g,"boot",x+7,y-4,1);}}
    if(k===7){for(const [x,y] of [[40,83],[240,135],[121,300],[298,368],[39,553],[246,632]]){part(g,"chain",x,y,1);part(g,"weight",x-5,y+2);}}
    return at;
  }
  function trails(g,k,line,material){
    const rgb=[["#725c44","#ccad78"],["#716c55","#c9b78c"],["#34424c","#b49769"],["#6e5749","#cbab7a"],
      ["#635044","#cfad79"],["#425354","#b4a781"],["#64614d","#cbb48a"],["#515958","#c7b18b"]][k];
    g.l(line,rgb[0],8);g.l(line,rgb[1],5);
    for(let j=1;j<line.length;j++){const [x,y]=line[j-1],[xx,yy]=line[j],dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy);
      for(let t=8;t<len;t+=12){const a=x+dx*t/len,b=y+dy*t/len,wet=material(a,b)===(k===2?0:7);
        if(wet){const nx=-dy/len,ny=dx/len;g.l([[a-nx*3,b-ny*3],[a+nx*3,b+ny*3]],4,2);
          if(Math.round((t-8)/12)%2===0){g.l([[a+nx*5,b+ny*5],[a+nx*5,b+ny*5+4]],0,2);g.b(a+nx*5-1,b+ny*5-1,3,2,3);}}
        else if((k+j)%3===0)g.l([[a+dy*2/len,b-dx*2/len],[a-dy*2/len,b+dx*2/len]],4);else g.b(a,b,2,1,2);}}
  }
  const branchPieces=[["sack","wheel"],["hinge","gate"],["lamp","mast"],["boot","stamp"],["cord","rock"],["paper","nib"],["balance","weight"],["bell","shutter"]];
  const tileCache=new Map(),currentCache=new Map(),battleCache=new Map();
  function remember(cache,key,value,limit){if(cache.size>=limit&&!cache.has(key))cache.delete(cache.keys().next().value);cache.set(key,value);return value;}
  function map(r,completed=0,route=0,painting=null){
    const k=r-3;if(!coords[k])return null;
    const cacheKey=[r,completed,route,!!painting].join("/");if(currentCache.has(cacheKey))return currentCache.get(cacheKey);
    let base=painting||tileCache.get(k);
    if(!base){base=canvas(width,height);const ctx=base.getContext("2d"),g=brush(ctx,palettes[k]);grounds[k](g);const material=weather(ctx,k);
      edges[k].forEach((line,i)=>{if(i!==8)trails(g,k,line,material);});for(const f of forks[k]){trails(g,k,f.in,material);trails(g,k,f.out,material);}remember(tileCache,k,base,2);}
    const sheet=painting?canvas(painting.naturalWidth,painting.naturalHeight):canvas(width,height),c=sheet.getContext("2d"),g=brush(c,palettes[k]);
    c.imageSmoothingEnabled=false;c.drawImage(base,0,0);
    if(painting)c.scale(sheet.width/width,sheet.height/height);
    for(const [i,m] of marks[k].entries()){
      if(!painting||i<completed)prop(c,k,i,m.propX,m.propY,i<completed,[6,13,19].includes(i)?1.4:1);
    }
    forks[k].forEach((f,i)=>{
      if(!painting||route===i+1)part(g,branchPieces[k][i],...f.mark,route===i+1?1:0);
      if(route&&route!==i+1){const [x,y]=f.in[1];g.post(x-4,y+2,7);g.post(x+5,y,7);g.l([[x-7,y-6],[x+7,y]],0,4);g.l([[x-7,y-6],[x+7,y]],6,2);g.l([[x-6,y+1],[x+6,y-7]],4,3);}
    });
    return remember(currentCache,cacheKey,sheet,3);
  }
  // Physical height and direction come from that site's position and road, so the
  // stage looks toward its next place across the same terrain as the map.
  const skies=[
    ["#98a69a","#c6c4a6","#e0d9b1"],["#92a7a3","#b9c5ae","#ded8b6"],
    ["#253646","#435a67","#778880"],["#ac9e9c","#ccbaab","#e7d2b1"],
    ["#93939c","#bfaca2","#dfc6a5"],["#778891","#a0b0a6","#c7c8a9"],
    ["#8ca3a0","#b4c2af","#dbd6b1"],["#89979c","#adb6ac","#d2cdb1"]
  ];
  const companions=[["stair","basin","cart","chute","wheel"],["wood","gate","brick","frame","hook"],
    ["boat","lamp","jar","mast","mirror"],["cart","boot","drum","paper","brush"],
    ["tent","cliff","rock","chain","post"],["drum","brush","mat","jar","frame"],
    ["drum","balance","weight","gauge","boat"],["ring","gate","bell","stone","post"]];
  // Focus marks follow each district's story: wheel / mill deck, three gate
  // leaves, upper/lower lamps, the paired postmarks, twin arches, ink racks,
  // the two pans of the crane, and the final bell and its sheltered light.
  const focus=[
    [3,1,7,4,2,6,8,3,1,4,7,2,3,5,8,7,2,1,6,5],
    [2,6,8,3,6,1,5,2,4,7,9,8,6,5,3,8,4,1,6,5],
    [4,2,8,1,3,7,2,8,5,1,6,9,3,7,8,2,6,1,7,4],
    [4,8,2,7,4,1,3,9,6,2,8,4,1,7,9,3,6,1,5,4],
    [4,2,7,1,8,3,1,5,8,2,6,9,4,7,2,8,6,1,7,5],
    [3,7,1,8,5,2,6,9,3,4,8,6,2,8,7,1,3,9,6,4],
    [3,1,8,6,2,7,3,8,1,6,9,2,7,4,8,3,1,6,7,5],
    [5,1,7,2,8,4,6,3,9,2,7,1,4,6,8,3,7,9,2,5]
  ];
  const zoom=[1.00,1.34,1.58,1.25,1.49,1.38,1.16,1.52,1.63,1.28,
    1.47,1.38,1.61,1.20,1.55,1.48,1.33,1.61,1.39,1.07];
  const painting=new Image(),pendingPaint=new Map();
  const painted=new Promise(resolve=>{
    painting.onload=()=>{
      for(const finish of pendingPaint.values())finish();
      pendingPaint.clear();document.dispatchEvent(new Event("tailwaterwaysready",{bubbles:true}));resolve(true);
    };
    painting.onerror=()=>{pendingPaint.clear();resolve(false);};
  });
  let requestedPainting=false;
  function loadPainting(){
    if(!requestedPainting){requestedPainting=true;painting.src="../eaecd090510d7805/tail-waterways.webp";}
    return painted;
  }
  function paintDistrict(dst,k,i,done,detail){
    const sw=painting.naturalWidth/2,sh=painting.naturalHeight/4;
    // Keep the illustration's detail for the portrait close-up. The original
    // logical 384×154 prop and foot coordinates are scaled below.
    dst.width=sw;dst.height=Math.round(sw*154/384);
    const c=dst.getContext("2d");
    const z=zoom[i],cw=sw/z,ch=sh/z,x=(k%2)*sw+(sw-cw)*focus[k][i]/10;
    const y=Math.floor(k/2)*sh+(sh-ch)*.92;
    c.imageSmoothingEnabled=false;c.drawImage(painting,x,y,cw,ch,0,0,dst.width,dst.height);
    c.save();c.scale(dst.width/384,dst.height/154);detail(c);c.restore();
    dst.dataset.plateReady=String(160+k*20+i)+(done?":1":":0");
  }
  function battle(id,completed=0,arena=false){
    const k=Math.floor((id-160)/20),i=(id-160)%20;if(!coords[k]||i<0)return null;
    const done=i<completed,key=id*2+Number(done);
    const [x,y]=coords[k][i],road=edges[k][Math.min(i,18)],sk=skies[k];
    const direction=road.at(-1)[0]>=road[0][0]?1:-1,h=55+Math.round(y/748*23)+(i%4)*3;
    const stageX=direction>0?69+x%76:244+x%71,approach=direction>0?306:69,extra=companions[k][Math.floor(i/4)];
    function details(ink,onPainting){
      const brushwork=brush(ink,palettes[k]),base=onPainting?121:h+20;
      const boss=[6,13,19].includes(i);
      const propScale=onPainting?(boss?1.65:1.25):(boss?2.6:2);
      if(extra==="cliff")cliff(brushwork,[[approach-13,base-8],[approach-3,base-13],[approach+12,base-11]],7);
      else part(brushwork,extra,approach,base-5,i%2);
      prop(ink,k,i,stageX,base,done,propScale);
    }
    if(arena){const frame=typeof ArenaArt!=="undefined"&&ArenaArt.battle(id,done,ink=>details(ink,true));if(frame)return frame;}
    if(battleCache.has(key))return battleCache.get(key);
    const sheet=canvas(384,154),c=sheet.getContext("2d"),g=brush(c,palettes[k]);
    // Preserve the original small position-specific repair kit and the bank
    // at the actors' feet in both the live scene and its travel-dialog canvas.
    const finish=()=>paintDistrict(sheet,k,i,done,ink=>details(ink,true));
    loadPainting();
    if(painting.complete&&painting.naturalWidth){finish();return remember(battleCache,key,sheet,6);}
    if(!painting.complete)pendingPaint.set(sheet,finish);
    c.imageSmoothingEnabled=false;g.b(0,0,384,154,sk[0]);g.b(0,h*.33,384,h,sk[1]);g.b(0,h*.68,384,154,sk[2]);
    const px=n=>Math.round(n*78-(x%51)-13);
    for(let n=0;n<5;n++){const xx=(n*83+x)%384,yy=7+((n*17+y)%Math.max(9,h-35));g.b(xx,yy,12+n*3,1,k===2?3:sk[2]);}
    switch(k){
      case 0:{
        g.a([[0,h-6],[51,h-15],[96,h-9],[150,h-19],[208,h-11],[283,h-18],[347,h-9],[384,h-13],[384,154],[0,154]],1);
        g.b(0,h+1,384,48,7);for(let n=0;n<3;n++){const xx=px(n*2+1);
          g.a([[xx-28,h+10],[xx-5,h+2],[xx+25,h+4],[xx+33,h+11]],2);mill(g,xx,h+8,n%2);}
        g.l([[0,h+29],[83,h+11],[165,h+21],[248,h+7],[384,h+18]],4,3);break;}
      case 1:{
        g.b(0,h-6,384,160-h,7);
        for(let n=0;n<3;n++){const y0=h+n*11;terrace(g,[[-8,y0],[63,y0-5],[119,y0-11],[194,y0-8],[260,y0-16],[330,y0-9],[392,y0-14]],3,1,n+4);}
        for(let n=0;n<4;n++)gatehouse(g,px(n+1),h+8-(n%2)*7,11+n%3*2);break;}
      case 2:{
        g.b(0,h-5,384,160-h,0);for(let n=0;n<8;n++){const xx=px(n*.72);g.a([[xx-24,h+4],[xx-7,h-4],[xx+18,h-2],[xx+28,h+5]],1);tower(g,xx,h+2,9+(n+i)%3*4,n%3!==0);}
        for(let n=0;n<27;n++){const xx=(n*49+x)%384,yy=h+8+(n*13+i)%17;g.b(xx,yy,3+n%8,1,n%8===0?5:1);}break;}
      case 3:{
        g.a([[0,h+2],[44,h-4],[119,h+1],[196,h-8],[265,h+3],[350,h-3],[384,h+1],[384,154],[0,154]],2);
        for(let n=0;n<9;n++){const xx=px(n*.57),yy=h+6-n%2*5;house(g,xx,yy,11+(n+i)%3*4,8+n%3*2);}
        g.l([[0,h+22],[112,h+11],[202,h+19],[320,h+7],[389,h+12]],4,6);break;}
      case 4:{
        g.a([[0,h-21],[64,h-33],[102,h-16],[143,h-23],[178,h+4],[223,h-10],[267,h-35],[306,h-20],[348,h-34],[384,h-23],[384,154],[0,154]],1);
        for(let n=0;n<6;n++){const xx=px(n);cliff(g,[[xx-29,h-4],[xx-12,h-8-(i+n)%11],[xx-3,h-7],[xx+14,h-14],[xx+23,h+1]],12+n%3*3);}
        g.l([[0,h+28],[91,h+17],[176,h+25],[249,h+12],[320,h+17],[384,h+9]],7,4);break;}
      case 5:{
        g.b(0,h-5,384,154-h,1);for(let n=0;n<9;n++){const xx=px(n*.66);inkbed(g,xx,h+2+n%2*6,41,13);
          if(n%2===0){g.frame(xx+10,h+2,18,11);part(g,"paper",xx+18,h-1,1);}}
        g.l([[0,h+20],[106,h+15],[182,h+23],[277,h+13],[384,h+17]],7,5);break;}
      case 6:{
        g.b(0,h-2,384,158-h,7);for(let n=0;n<7;n++){const xx=px(n*.9);g.a([[xx-20,h+7],[xx-7,h+1],[xx+21,h-1],[xx+27,h+5]],2);balanceTower(g,xx+2,h+5,13+n%2*5,(n+i)%2);}
        for(let n=0;n<5;n++)part(g,"boat",px(n+1)+3,h+18,n%2);break;}
      case 7:{
        g.b(0,h-5,384,158-h,1);for(let n=0;n<6;n++){const xx=px(n*.93);
          g.b(xx-23,h-3,44,12,0);g.b(xx-20,h,38,11,7);gatehouse(g,xx,h,14+n%3*2);if(n%2===0)tower(g,xx+17,h,12,false);}
        terrace(g,[[-4,h+22],[82,h+12],[158,h+18],[239,h+9],[311,h+14],[390,h+5]],2,0,7);break;}
    }
    const floor=[[0,154],[0,118+y%8],[73,110+x%7],[129,114+y%6],[202,108+x%7],[276,115],[335,110+y%4],[384,114],[384,154]];
    g.a(floor,0);g.a(floor.map(([xx,yy])=>[xx,yy===154?yy:yy+4]),k===2||k===5?1:2);
    for(let n=0;n<27;n++)g.b((n*73+x)%384,126+((n*13+y)%24),1+n%7,1,[1,4,0,1,1,0,1,1][k]);
    details(c,false);
    return remember(battleCache,key,sheet,6);
  }
  function travelLand(from,to,beat){
    if(!Number.isInteger(from)||from<160||to!==from+1||to>319||Math.floor(from/20)!==Math.floor(to/20))return null;
    const id=beat>0?to:from,cleared=OuterCampaign.cleared(saved,OuterCampaign.region(id));
    return {id,land:battle(id,cleared)};
  }
  const journeyCache=new Map();
  function drawTravel(c,geom,site){
    const land=site?.land,plate=land?.dataset.plateReady;
    if(!plate)return false;
    const {w,h,ground}=geom,key=[plate,w,h,ground].join("/");
    let frame=journeyCache.get(key);
    if(!frame){
      frame=canvas(w,h);const ink=frame.getContext("2d");ink.imageSmoothingEnabled=false;
      const sw=land.width,sh=land.height,scale=Math.max(w/sw,ground/(sh*.88));
      const pw=Math.ceil(sw*scale),ph=Math.ceil(sh*scale),top=Math.round(ground-.88*ph);
      const k=Math.floor((site.id-160)/20),i=(site.id-160)%20;
      const line=edges[k][Math.min(i,18)],point=coords[k][i][0];
      const propX=line.at(-1)[0]>=line[0][0]?69+point%76:244+point%71;
      const left=Math.max(w-pw,Math.min(0,Math.round(w*.72-propX/384*pw)));
      ink.drawImage(land,left,top,pw,ph);
      // Continue only the painted bank below the actors. Sample the near
      // ground with widening perspective, keeping one sky and one horizon.
      const bottom=top+ph,span=Math.max(1,h-bottom);
      for(let py=bottom;py<h;py+=2){
        const depth=py-bottom,dist=depth/Math.max(1,scale);
        const band=Math.floor(sh*.095),offset=band-Math.abs(band-dist%(band*2));
        const wide=Math.ceil(pw*(1+.19*depth/span));
        ink.drawImage(land,0,sh-3-Math.floor(offset),sw,1,left-(wide-pw)*.5,py,wide,2);
      }
      if(bottom<h){
        const shade=ink.createLinearGradient(0,bottom,0,h);
        shade.addColorStop(0,"#14242200");shade.addColorStop(.46,"#14242280");shade.addColorStop(1,"#101f1de8");
        ink.fillStyle=shade;ink.fillRect(0,bottom,w,span);
      }
      remember(journeyCache,key,frame,6);
    }
    c.drawImage(frame,0,0);return true;
  }
  return {get painted(){return loadPainting();},travelLand,drawTravel,sites:r=>coords[r-3],edges:r=>edges[r-3],landmarks:r=>marks[r-3],forks:r=>forks[r-3],map,battle};
})();
