"use strict";
// The head of the line is both the marked target and the source of White's reply.
// Stable lanes make older aggregate-HP saves sufficient to reconstruct every body.
const FoeParty=(()=>{
  // 2 = a leading pair, 3 = a three-sided ambush. Narrow crossings, open
  // switchbacks and later patrols fall at different stops in each district.
  const patrols=[
    [[1,3,5,8,12,15],[2,11,17]],
    [[1,3,7,8,12,16],[2,11,18]],
    [[1,4,5,10,14,16],[2,8,17]],
    [[1,3,7,10,12,18],[2,14,16]]
  ];
  function describe(id,fallback){
    if(id<80){
      const species=Expedition.species(id);
      return {source:"forest",actor:species,species,name:Expedition.names.flat()[species]};
    }
    const art=id<100?ReachFauna:OuterFauna,name=art.name(id);
    if(name)return {source:id<100?"reach":"outer",actor:id,species:null,name};
    if(!Number.isInteger(fallback))return null;
    return {source:"forest",actor:fallback,species:fallback,name:Expedition.names.flat()[fallback]};
  }
  function plan(id,scripted,fallback){
    if(scripted||!Number.isInteger(id)||id<0||id>=320)return [];
    const local=id%20,[pairs,trios]=patrols[Math.floor(id/20)%4];
    const n=trios.includes(local)?3:pairs.includes(local)?2:0;
    if(!n)return [];
    const residents=[],seen=new Set(),base=id-local;
    for(let offset=0;offset<20&&residents.length<n;offset++){
      const site=(local+offset)%20;
      if([6,9,13,19].includes(site))continue;
      const m=describe(base+site,offset===0?fallback:null);
      if(m&&!seen.has(m.name[0])){seen.add(m.name[0]);residents.push(m);}
    }
    return residents.length===n?residents:[];
  }
  function distribute(plan,hp,max){
    let damage=max-hp,ready=true,assigned=0;
    return plan.map((m,i)=>{
      const capacity=i===plan.length-1?max-assigned:Math.round(max*(plan.length===2?.42:i===0?.31:.34));
      const lost=Math.min(damage,capacity);damage-=lost;assigned+=capacity;
      const health=capacity-lost,active=ready&&health>0;
      if(active)ready=false;
      return {...m,slot:i,max:capacity,hp:health,active};
    });
  }
  function layout(w,h,ground,n){
    const lanes=n===2?[[.635,.98],[.855,.82]]:[[.603,.985],[.746,.766],[.88,.958]];
    const height=Math.min(h*(n===2?.48:.39),w*(n===2?.187:.157));
    // The far lane sits above the front pair.
    const floor=Math.min(ground,h*.84);
    return lanes.map(([x,depth])=>({x:Math.round(w*x),y:Math.round(floor*depth),height}));
  }
  function drawActor(c,m,x,y,height,pose="idle",beat=0,step,cel){
    if(m.source!=="forest")return (m.source==="reach"?ReachFauna:OuterFauna).draw(c,m.actor,x,y,height,pose,beat,step,cel);
    // Small animals retain their relative anatomy. Perspective and a common size cap
    // reserve room for broad wings and keep them inside the battlefield in every lane.
    const size=Math.min(height*.99,Math.max(height*(m.species===1?.44:.68),FaunaMotion.fieldHeight(m.species,height*1.21)));
    ExpeditionCast.foe(c,m.species,x,y,size,0,1,0,true,{pose,beat,step,cel});
    return true;
  }
  const gauges=new WeakMap();
  function showHealth(panel,members){
    if(!members.length){
      if(!panel.hidden){panel.hidden=true;panel.replaceChildren();gauges.delete(panel);}
      return;
    }
    const prior=gauges.get(panel),locale=saved.locale;
    if(prior?.members===members&&prior.locale===locale)return;
    gauges.set(panel,{members,locale});
    const spans=members.map(m=>{
      const meter=document.createElement("span"),label=localizedPair(m.name);
      meter.setAttribute("role","meter");
      meter.setAttribute("aria-label",label);
      meter.setAttribute("aria-valuemin","0");
      meter.setAttribute("aria-valuemax",m.max);
      meter.setAttribute("aria-valuenow",m.hp);
      meter.setAttribute("aria-valuetext",m.hp+"/"+m.max);
      meter.title=label+" "+m.hp+"/"+m.max;
      meter.style.setProperty("--foe-health",100*m.hp/m.max+"%");
      meter.style.flexGrow=m.max;
      meter.toggleAttribute("data-target",m.active);
      return meter;
    });
    panel.replaceChildren(...spans);panel.hidden=false;
  }
  function draw(c,members,w,h,ground,now,options={}){
    if(!members.length)return;
    const lanes=layout(w,h,ground,members.length),hit=options.hit,elapsed=hit?(now-hit.at)/BattleActions.fallDuration:2;
    const moving=elapsed>=0&&elapsed<1,still=typeof reduceMotion!=="undefined"&&reduceMotion;
    const indices=members.map((m,i)=>i).sort((a,b)=>lanes[a].y-lanes[b].y);
    for(const i of indices){
      const m=members[i],l=lanes[i],struck=moving&&hit.slots.includes(i),falling=!m.hp&&struck;
      if(!m.hp&&!falling)continue;
      const hurt=struck&&(falling||elapsed<.68),acting=m.active&&!hurt;
      const pose=hurt?(falling?"break":"hit"):acting?options.pose||"idle":"idle";
      const beat=hurt?elapsed:acting&&options.pose&&options.pose!=="idle"?options.beat||0:(now/1350+i*.31)%1;
      const recoil=still?0:hurt?Math.sin(Math.PI*elapsed)*l.height*.07:0;
      const x=l.x+recoil+(acting&&options.shift?options.shift*l.height:0),y=l.y;
      c.save();
      if(falling&&!still)c.globalAlpha*=Math.min(1,(1-elapsed)/.18);
      c.fillStyle="#17232369";c.beginPath();c.ellipse(x,l.y,l.height*.25,Math.max(2,l.height*.047),0,0,Math.PI*2);c.fill();
      if(m.active){
        c.strokeStyle="#ffdc84";c.lineWidth=Math.max(1.5,l.height*.025);
        c.beginPath();c.ellipse(x,y,l.height*.27,Math.max(3,l.height*.066),0,0,Math.PI*2);c.stroke();
      }
      drawActor(c,m,x,y,l.height,pose,beat,acting?options.step:undefined);
      c.restore();
    }
  }
  return Object.freeze({plan,distribute,layout,showHealth,drawActor,draw});
})();
