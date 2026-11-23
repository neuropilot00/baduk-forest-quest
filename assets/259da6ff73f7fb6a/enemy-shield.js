"use strict";
// Full-size equipment appears on arrival. Subsequent changes belong to the HP
// badge and are driven only by the board, independently of the attack animation.
const EnemyShield=(()=>{
  const atlas="../eaecd090510d7805/fortress-shield.png";
  document.documentElement.style.setProperty("--enemy-shield-art",'url("'+atlas+'")');
  let key="",damage=0,broken=false,started=0,changed=0,phaseView="none",paintKey="";
  const by=id=>document.getElementById(id);
  function situation(){
    if(!mission||!state||inTraining()||mode==="walking"||!by("voyage").hidden||by("matchDialog").open)return null;
    const fortress=Fortress.shieldState();
    if(fortress)return {key:trial?"fortress-rehearsal":"fortress",...fortress};
    // In the legacy story the first sentry carries the bell fragment in its
    // shield. The king's first board removes his arm guard. Other captures,
    // training diagrams and armored-looking wildlife carry no shield rule.
    if(journey()||!((level===0&&phase<3)||(level===10&&phase===0))||mission.kind!=="capture")return null;
    const hit=(mode==="won"||mode==="phase")&&mission.targets.length>0&&
      mission.targets.every(p=>mission.board[p]===white&&state.board[p]!==white)&&
      mission.targets.some(p=>state.captured?.includes(p));
    const final=level===10||phase===2;
    return {key:"chronicle-"+level,damage:Math.min(2,phase+Number(hit&&!final)),broken:hit&&final,cracked:hit&&!final,brace:false};
  }
  function paint(){
    const icon=by("enemyShield"),burst=by("enemyShieldBurst");
    const stamp=phaseView+damage+saved.locale;
    if(stamp===paintKey)return;paintKey=stamp;
    icon.hidden=phaseView!=="icon"&&phaseView!=="crack";icon.dataset.damage=String(damage);
    icon.classList.toggle("shield-chip",phaseView==="crack");
    icon.setAttribute("aria-label",localizedPair([
      ["盾は健在","ひびの入った盾","盾の留め金が露出"][damage],
      ["온전한 방패","금이 간 방패","빗장이 드러난 방패"][damage]
    ]));
    burst.hidden=phaseView!=="break";
  }
  function clear(){
    if(!key&&phaseView==="none")return;
    key="";damage=0;broken=false;started=changed=0;phaseView="none";paintKey="";
    const icon=by("enemyShield"),burst=by("enemyShieldBurst");if(icon){icon.hidden=true;icon.classList.remove("shield-chip");icon.removeAttribute("aria-label");}if(burst)burst.hidden=true;
  }
  function frame(now){
    const s=situation();if(!s){if(key)clear();return null;}
    if(s.key!==key){
      key=s.key;damage=s.damage;broken=s.broken;started=now;changed=-Infinity;
    }else if(broken!==s.broken||damage!==s.damage){
      damage=s.damage;broken=s.broken;changed=now;
    }
    if(broken)phaseView=!reduceMotion&&now-changed<390?"break":"gone";
    else if(now-changed<(reduceMotion?0:310))phaseView="crack";
    else phaseView=now-started<(reduceMotion?300:690)&&changed===-Infinity?"intro":"icon";
    paint();return phaseView==="intro"?s:null;
  }
  function draw(c,w,h,base,height,enemyX,now){
    const s=frame(now);
    if(!s)return;
    const opacity=reduceMotion?1:Math.min(1,(690-(now-started))/105);
    if(!Fortress.drawHeld(c,enemyX-height*.34,base,height,h,s.damage,opacity))started=now;
  }
  const changedView=new MutationObserver(()=>{
    if(!by("voyage").hidden||by("matchDialog").open||by("battleLayout").hidden)clear();
  });
  for(const id of ["voyage","matchDialog","battleLayout"])changedView.observe(by(id),{attributes:true,attributeFilter:["hidden","open"]});
  return {draw,clear,inspect:()=>({phase:phaseView,damage,broken,key})};
})();
