"use strict";
// A receipt is created once by the Go turn resolver. Painting it is read-only.
const BattleActions=(()=>{
  const duration=760,fallDuration=590,anticipation=.22,contact=.40,recovery=.72;
  const limit=value=>Math.max(0,Math.min(1,value));
  const impactDelay=reduced=>reduced?0:duration*contact;
  const cel=(first,count,progress)=>first+Math.min(count-1,Math.floor(limit(progress)*count));
  const idleCel=(time,reduced)=>reduced?0:Math.floor(Math.max(0,time)/160)%6;
  function attackCel(step,progress){
    const frames={ready:[6,4],advance:[10,3],contact:[13,2],return:[15,3]}[step];
    return cel(...frames,progress);
  }
  const fallCel=progress=>cel(18,8,progress);
  const allyName=id=>id===null?localizedPair(["ソルビ","솔비"]):localizedPair(CrewTactics.members[id].name);
  function member(row,used){
    return Crew.deployed().find(id=>Math.floor(Roster.cell(saved.roster,id)/3)===row&&!(used&(1<<id)))??null;
  }
  // Forecast a different *verified* White reply only if the marked group
  // retains more of Black's pressure. The pair spends both of its reactions.
  function relay(roster,used,current,mission,move,candidates){
    if(!current||current.point<0||!candidates?.length||!["read","capture"].includes(mission.kind))return null;
    const column=Math.floor(move%9/3);
    const at=row=>roster.slots.find(id=>Roster.cell(roster,id)===row*3+column&&!(used&(1<<id)));
    const front=at(2),middle=at(1);
    if(front===undefined||middle===undefined)return null;
    const target=mission.targets[0];
    const pressure=reply=>({
      captured:reply.state.captured.length,
      liberties:reply.state.board[target]===2?group(reply.state.board,target).liberties.size:0
    });
    const better=(a,b)=>a.captured<b.captured||a.captured===b.captured&&a.liberties<b.liberties;
    const normal=pressure(current);
    let best=current,bestPressure=normal;
    for(const reply of candidates){
      if(reply.canWin!==true||reply.point<0)continue;
      const next=pressure(reply);
      if(better(next,bestPressure)){best=reply;bestPressure=next;}
    }
    return best===current?null:{front,middle,reply:best,defaultReply:current,normal,actual:bestPressure};
  }
  function aid(kind){
    const language={
      follow:["追撃","추격"],protect:["かばう","가로막기"],remedy:["祝福","회복"],relay:["陣形連携","진형 연계"],guard:["防御","방어"]
    };
    return localizedPair(language[kind]);
  }
  function phase(action,now,reduced){
    if(!action)return null;
    const elapsed=Math.max(0,now-action.at),p=elapsed/duration;
    if(p>=1)return null;
    if(reduced)return {step:"contact",p,f:limit(p/.72),reduced};
    if(p<anticipation)return {step:"ready",p,f:p/anticipation,reduced};
    if(p<contact)return {step:"advance",p,f:(p-anticipation)/(contact-anticipation),reduced};
    if(p<recovery)return {step:"contact",p,f:(p-contact)/(recovery-contact),reduced};
    return {step:"return",p,f:(p-recovery)/(1-recovery),reduced};
  }
  function stride({step,f,reduced},scale,distance){
    if(reduced)return 0;
    switch(step){
      case "ready":return -scale*.08*f;
      case "advance":return scale*(-.08+(.08+distance*.70)*f);
      case "contact":return scale*distance*(.70+.30*Math.sin(Math.PI*f));
      default:return scale*distance*.70*(1-f);
    }
  }
  function body(action,now,id,scale){
    const frame=phase(action,now,reduceMotion);
    if(!frame)return {x:0,y:0,pose:0};
    const {step,f,reduced}=frame;
    if(id===null&&action.side===1&&action.kind!=="relay"){
      const pose={ready:1,advance:1,contact:2,return:0}[step];
      return {x:stride(frame,scale,.29),y:0,pose,cel:attackCel(step,reduced?.46:f)};
    }
    if(action.kind==="relay"&&action.cover===id){
      return {x:stride(frame,scale,.33),y:0,pose:{ready:5,advance:5,contact:3,return:6}[step]};
    }
    if(id!==null&&action.helper===id){
      const role=action.kind,charging=role==="follow"||role==="relay";
      const pose=charging?{ready:1,advance:1,contact:2,return:4}:
        role==="protect"?{ready:5,advance:5,contact:3,return:6}:{ready:1,advance:1,contact:2,return:4};
      return {x:role==="remedy"?0:stride(frame,scale,charging?.51:.32),y:0,pose:pose[step]};
    }
    if(action.side===2&&action.recipient===id){
      const recoil=step==="contact"&&!reduced?-scale*.12*Math.sin(Math.PI*f):0;
      return {x:recoil,y:0,pose:step==="contact"?3:0};
    }
    return {x:0,y:0,pose:0};
  }
  function hero(action,time,scale,down){
    if(down){
      const progress=reduceMotion||!action?1:limit((time-action.at-impactDelay(false))/fallDuration);
      return {x:reduceMotion?0:-scale*.20*progress,y:0,pose:3,cel:fallCel(progress)};
    }
    const view=body(action,time,null,scale);
    const frame=phase(action,time,reduceMotion);
    if(frame&&action.side===2&&action.recipient===null){
      if(frame.step==="contact")return {...view,cel:cel(18,2,frame.f)};
      if(frame.step==="return"&&frame.f<.7)return {...view,cel:20};
    }
    return {...view,cel:view.cel??idleCel(time,reduceMotion)};
  }
  function companionCel(action,time,id,down){
    if(down){
      const age=reduceMotion||!action?1:(time-action.at-impactDelay(false))/fallDuration;
      return cel(36,8,age);
    }
    const frame=phase(action,time,reduceMotion);
    if(frame){
      const stance=cel(52,8,reduceMotion?.52:frame.p);
      if(action.side===2&&action.recipient===id){
        // Covered attacks can still deal damage. A zero-damage block stays braced.
        if(action.kind==="protect"&&!action.aid)return stance;
        if(frame.step==="contact")return cel(29,4,reduceMotion?.5:frame.f);
        if(frame.step==="return")return cel(33,3,frame.f);
        return stance;
      }
      if(action.side===1&&action.helper===id){
        if(action.kind==="remedy"){
          const [first,count]={ready:[44,2],advance:[46,2],contact:[48,2],return:[50,2]}[frame.step];
          return cel(first,count,reduceMotion?0:frame.f);
        }
        const [first,count]={ready:[16,4],advance:[20,2],contact:[22,2],return:[24,4]}[frame.step];
        return cel(first,count,reduceMotion?0:frame.f);
      }
      if(action.kind==="relay"&&action.cover===id)return stance;
    }
    return reduceMotion?0:Math.floor(time/140)%8;
  }
  function foe(action,time,down=false){
    if(down){
      const beat=reduceMotion||!action?1:limit((time-action.at-impactDelay(false))/fallDuration);
      return {pose:"break",beat,shift:0};
    }
    const frame=phase(action,time,reduceMotion);if(!frame)return null;
    const {step,f}=frame;
    if(action.side===1){
      if(action.kind==="relay"||step==="ready"||step==="advance")return {pose:"idle",beat:0,shift:0};
      const beat=step==="contact"?.16+f*.4:.56+f*.44;
      return {pose:"hit",beat,shift:reduceMotion?0:.11*Math.sin(Math.PI*beat)};
    }
    return {pose:{ready:"tell",advance:"tell",contact:"contact",return:"recover"}[step],
      step,beat:f,shift:-stride(frame,1,.23)};
  }
  function effects(c,time,action,actors,heroX,heroGround,foeX,foeGround,scale){
    const frame=phase(action,time,reduceMotion);if(!frame)return;
    const {step,f,reduced}=frame;
    const helper=actors.find(m=>m.id===action.helper),recipient=actors.find(m=>m.id===action.recipient);
    const tx=recipient?.x??heroX,ty=(recipient?.ground??heroGround)-scale*.32;
    const ex=foeX,ey=foeGround-scale*.45;
    const ax=helper?.x??heroX,ay=(helper?.ground??heroGround)-scale*.42;
    if(typeof BattlePixelFX!=="undefined"&&BattlePixelFX.action(c,frame,action.kind,{
      source:{x:ax,y:ay},target:{x:tx,y:ty,ground:recipient?.ground??heroGround},enemy:{x:ex,y:ey}
    },scale))return;
    const color={relay:"#9fe9e4",follow:"#f5cf8b",protect:"#79d7de",remedy:"#a0f6b4",guard:"#9eeaff",counter:"#ffa98d",attack:"#ffe6a7"}[action.kind];
    const s=Math.max(1,scale*.034);
    c.save();
    if(step==="ready"){
      const x=action.side===2?ex:ax,y=action.side===2?ey:ay;
      c.fillStyle=color;c.fillRect(Math.round(x-2*s),Math.round(y-3*s),4*s,s);
    }else if(step==="advance"){
      const destX=action.kind==="remedy"?tx:ex,destY=action.kind==="remedy"?ty:ey;
      const x=action.side===2?ex+(tx-ex)*f:ax+(destX-ax)*f;
      const y=(action.side===2?ey+(ty-ey)*f:ay+(destY-ay)*f)-Math.sin(f*Math.PI)*3*s;
      c.strokeStyle=color;c.lineWidth=2*s;c.beginPath();c.moveTo(x+(action.side===2?4:-4)*s,y-s);c.lineTo(x,y);c.stroke();
    }else if(step==="contact"){
      const towardParty=action.kind==="remedy"||action.side===2;
      const x=towardParty?tx:ex,y=towardParty?ty:ey;
      c.globalAlpha=Math.max(.13,1-f);
      const radial=(action.kind==="remedy"?6:3)+f*9;
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4,cx=Math.round(x+Math.cos(a)*s*radial),cy=Math.round(y+Math.sin(a)*s*radial*.74);
        c.fillStyle=i%2?"#fff4ce":color;c.fillRect(cx,cy,2*s,(i%2+1)*s);
      }
      if(action.kind==="protect"||action.kind==="guard"){
        c.strokeStyle=color;c.lineWidth=s;c.beginPath();c.arc(x+s*2,y,s*(7+f*5),-1.4,1.4);c.stroke();
      }
    }
    c.restore();
  }
  function announcement(action){
    if(action.helper!==null){
      const helper=allyName(action.helper);
      const route=action.kind==="protect"?action.foe+" → "+helper:helper+" → "+(action.kind==="remedy"?allyName(null):action.foe);
      return route+" · "+aid(action.kind)+(action.aid?" "+(action.kind==="protect"?"−":"+")+action.aid:"");
    }
    if(action.side===2)return action.foe+" → "+allyName(action.recipient);
    return allyName(null)+" → "+action.foe;
  }
  function strikeSound(kind){
    if(kind==="protect"||kind==="guard")return "parryImpact";
    if(kind==="remedy")return "mendImpact";
    if(kind==="follow"||kind==="relay")return "followImpact";
    return kind==="counter"?"counterImpact":"stoneImpact";
  }
  function contactSound(action,now,reduced,visible){
    if(!action||action.heard||now<action.at+impactDelay(reduced))return;
    action.heard=true;
    if(visible)sound(strikeSound(action.kind));
  }
  return Object.freeze({member,relay,phase,body,hero,companionCel,foe,effects,announcement,strikeSound,contactSound,allyName,duration,fallDuration,impactDelay,idleCel,attackCel,fallCel});
})();
