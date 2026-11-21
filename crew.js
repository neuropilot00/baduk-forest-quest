"use strict";
const Crew=(()=>{
  const roles=[
    {gate:3,name:["セナ · 勇者","세나 · 용사"],line:["私が舟を押さえる。隊長、渡し場まで一緒に行こう。","내가 배를 붙들게. 대장, 나루까지 함께 가자."]},
    {gate:10,name:["ミオ · 司祭","미오 · 성직자"],line:["鐘が戻った。下流の怪我人を迎えに行けるわ。","종이 돌아왔어. 이제 하류의 부상자를 데리러 갈 수 있어."]},
    {gate:7,name:["レン · 盗賊","렌 · 도적"],line:["橋番の鍵ならここにある。次の扉は任せな。","다리 지기의 열쇠는 내게 있어. 다음 문은 내가 열지."]}
  ];
  const frames=new Map();
  function image(id,step){
    const key=id*4+step;if(frames.has(key))return frames.get(key);
    const c=document.createElement("canvas");c.width=32;c.height=38;const g=c.getContext("2d");
    const box=(color,x,y,w,h)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
    const poly=(color,pts)=>{g.fillStyle=color;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
    const ink="#293939",skin="#ebb58a",hair="#664d3c",boot="#534535",glint="#f5da91",robe=["","#4e777d","#e5dfbe","#4c586e"][id],shade=["","#344f57","#aebba5","#323e54"][id];
    const lift=step%2,leg=step===1?2:step===3?-2:0;g.translate(0,-lift);
    box(ink,10+leg,28,5,7);box(boot,8+leg,34,7,3);box(ink,18-leg,28,5,7);box(boot,18-leg,34,7,3);
    poly(ink,[[10,14],[20,12],[25,19],[24,31],[7,31],[9,23],[6,19]]);
    poly(robe,[[11,15],[19,14],[23,19],[21,29],[9,29]]);box(shade,11,18,3,10);
    box(hair,11,6,11,9);box(skin,14,7,9,8);box(ink,20,9,2,2);
    if(id===1){
      poly("#9aabb0",[[9,9],[10,4],[14,2],[20,2],[23,5],[24,9],[17,8],[15,12],[11,12]]);
      poly("#b86149",[[12,3],[9,0],[5,1],[3,6],[9,4]]);box("#d1d5bc",11,5,10,2);
      poly("#793f39",[[10,15],[13,16],[11,23],[5,28],[5,18]]);
      poly(ink,[[6,17],[14,16],[16,19],[14,26],[10,30],[6,26],[4,20]]);
      poly("#9d7754",[[6,19],[13,18],[14,20],[12,25],[10,27],[7,25]]);box(glint,9,20,2,5);
      poly("#cad7cd",[[23,23],[28,11],[30,8],[30,12],[25,25]]);box(glint,22,22,5,2);
    }else if(id===2){
      poly(robe,[[8,11],[9,5],[14,1],[18,0],[23,5],[24,9],[20,7],[14,8],[12,14],[8,15]]);
      poly("#f1edd5",[[12,17],[19,16],[23,27],[25,32],[7,32],[10,24]]);
      poly("#739589",[[13,16],[16,16],[18,31],[14,31]]);box(glint,15,21,4,2);
      box("#875d3d",25,8,2,27);box(glint,23,4,5,2);box(glint,22,6,2,4);box(glint,27,6,2,4);box("#aedbda",24,7,3,3);
    }else{
      poly(shade,[[7,13],[9,6],[14,2],[21,3],[24,7],[17,7],[13,11],[13,15]]);
      box(shade,15,12,9,3);poly("#995c48",[[9,15],[16,16],[13,19],[4,18],[1,20],[3,16]]);
      poly(robe,[[10,17],[17,16],[21,22],[23,29],[15,26],[10,31],[6,28]]);
      box("#a37c58",10,23,11,3);box(glint,16,23,3,2);
      poly("#c2cdbe",[[20,21],[30,17],[27,21],[21,24]]);poly("#9cb2ab",[[6,25],[1,29],[5,22],[8,22]]);
    }
    frames.set(key,c);return c;
  }
  function draw(c,x,y,h,step=0,gap=.47){
    if(saved.partner>1&&saved.work.mascot&&saved.expedition>=1)ExpeditionCast.companion(c,1,x-h*.44,y,h*.84);
    const ids=saved.work.crew;ids.forEach((id,i)=>{const size=h*(i?.84:.89),cx=x+i*h*gap;c.save();c.imageSmoothingEnabled=false;c.drawImage(image(id,step%4),Math.round(cx-size*.42),Math.round(y-size),Math.round(size*32/38),Math.round(size));c.restore();});
  }
  function guide(){return saved.partner===1&&!saved.work.mascot?0:saved.partner;}
  function filter(){saved.work.crew=saved.work.crew.filter(id=>roles[id-1]?.gate<=saved.expedition);}
  function render(){
    const root=el("squadList"),caption=el("squadCaption"),ids=saved.work.crew;caption.textContent=localizedPair(["出発する二人","함께 떠날 두 사람"]);
    const lineup=el("crewLine");lineup.textContent=ids.length?ids.map(id=>localizedPair(roles[id-1].name)).join(" · "):localizedPair(["編成する仲間を選ぶ","동행할 대원을 선택하세요"]);
    root.replaceChildren(...roles.map((role,i)=>{
      const id=i+1,b=document.createElement("button"),pic=document.createElement("canvas"),text=document.createElement("span"),status=document.createElement("small");
      b.type="button";b.className="party-card";b.dataset.crew=id;b.disabled=saved.expedition<role.gate;
      b.setAttribute("aria-pressed",String(ids.includes(id)));pic.width=32;pic.height=38;pic.getContext("2d").drawImage(image(id,0),0,0);
      text.textContent=localizedPair(role.name);status.textContent=b.disabled?t("recruitAt",role.gate):ids.includes(id)?localizedPair(["外す","제외"]):ids.length===2?localizedPair(["先頭と交代","선두와 교대"]):localizedPair(["加える","편성"]);
      b.append(pic,text,status);b.onclick=()=>{if(ids.includes(id))saved.work.crew=ids.filter(n=>n!==id);else if(ids.length<2)ids.push(id);else ids.splice(0,1,id);save();renderMap();};return b;
    }));
    const mascot=el("mascotToggle");mascot.hidden=saved.expedition<1;mascot.setAttribute("aria-pressed",String(saved.work.mascot));
    mascot.textContent=localizedPair(["旅のマスコット · ルル","여행 마스코트 · 루루"])+(saved.work.mascot?" ✓":"");
    mascot.onclick=()=>{saved.work.mascot=!saved.work.mascot;save();renderMap();};
  }
  return {roles,image,draw,guide,filter,render};
})();
