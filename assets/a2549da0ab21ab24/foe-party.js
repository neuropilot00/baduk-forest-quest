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
    // Keep gauges adjacent to the feet. The far lane sits above the front pair.
    const floor=Math.min(ground,h*.84);
    return lanes.map(([x,depth])=>{
      const y=Math.round(floor*depth),barY=y+Math.max(2,Math.round(h*.011));
      return {x:Math.round(w*x),y,height,barY:Math.round(barY)};
    });
  }
  function drawActor(c,m,x,y,height,pose="idle",beat=0){
    if(m.source!=="forest")return (m.source==="reach"?ReachFauna:OuterFauna).draw(c,m.actor,x,y,height,pose,beat);
    // Small animals retain their relative anatomy. Perspective and a common size cap
    // reserve room for broad wings and keep them inside the battlefield in every lane.
    const size=Math.min(height*.99,Math.max(height*(m.species===1?.44:.68),FaunaMotion.fieldHeight(m.species,height*1.21)));
    const query=pose==="idle"||pose==="recover"?-1:pose==="tell"?1:pose==="strike"?2:3;
    ExpeditionCast.foe(c,m.species,x,y,size,0,c.globalAlpha,query,true);
    return true;
  }
  function bar(c,m,l,w,h){
    const width=Math.round(Math.min(w*.082,h*.31)),height=Math.max(3,Math.round(Math.min(w*.01,h*.023)));
    const x=Math.round(l.x-width/2),y=l.barY;
    c.fillStyle="#121c22";c.fillRect(x-1,y-1,width+2,height+2);
    c.fillStyle="#643f46";c.fillRect(x,y,width,height);
    c.fillStyle=m.active?"#ffd16c":"#cf9e95";c.fillRect(x,y,Math.ceil(width*m.hp/m.max),height);
    if(!m.active)return;
    const a=Math.max(2,Math.round(Math.min(w*.009,h*.021)));
    c.fillStyle="#142025";c.beginPath();c.moveTo(x-3,y+height/2);c.lineTo(x-2*a-5,y-a);c.lineTo(x-2*a-5,y+height+a);c.closePath();c.fill();
    c.fillStyle="#ffdc84";c.beginPath();c.moveTo(x-5,y+height/2);c.lineTo(x-2*a-3,y-a+2);c.lineTo(x-2*a-3,y+height+a-2);c.closePath();c.fill();
  }
  function draw(c,members,w,h,ground,now,options={}){
    if(!members.length)return;
    const lanes=layout(w,h,ground,members.length),hit=options.hit,elapsed=hit?(now-hit.at)/580:2;
    const moving=elapsed>=0&&elapsed<1,still=typeof reduceMotion!=="undefined"&&reduceMotion;
    const indices=members.map((m,i)=>i).sort((a,b)=>lanes[a].y-lanes[b].y);
    for(const i of indices){
      const m=members[i],l=lanes[i],struck=moving&&hit.slots.includes(i),falling=!m.hp&&struck&&!still;
      if(!m.hp&&!falling)continue;
      const hurt=struck&&(falling||elapsed<.68),acting=m.active&&!hurt;
      const pose=hurt?(falling?"break":"hit"):acting?options.pose||"idle":"idle";
      const beat=hurt?elapsed:acting&&options.pose&&options.pose!=="idle"?options.beat||0:(now/1350+i*.31)%1;
      const recoil=still?0:hurt?Math.sin(Math.PI*elapsed)*l.height*.07:acting&&pose==="strike"?-Math.sin(Math.PI*beat)*l.height*.15:0;
      const x=l.x+recoil+(acting&&options.shift?options.shift*l.height:0),y=l.y+(falling?elapsed*l.height*.09:0);
      c.save();
      if(falling)c.globalAlpha*=1-elapsed;
      c.fillStyle="#17232369";c.beginPath();c.ellipse(x,l.y,l.height*.25,Math.max(2,l.height*.047),0,0,Math.PI*2);c.fill();
      drawActor(c,m,x,y,l.height,pose,beat);
      if(m.hp&&options.bars!==false)bar(c,m,l,w,h);
      c.restore();
    }
  }
  return Object.freeze({plan,distribute,layout,drawActor,draw});
})();
