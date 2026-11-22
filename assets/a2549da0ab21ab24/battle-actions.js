"use strict";
// A receipt is created once by the Go turn resolver. Painting it is read-only.
const BattleActions=(()=>{
  const duration=680;
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
    return {step:reduced?"contact":p<.17?"ready":p<.4?"advance":p<.73?"contact":"return",p,reduced};
  }
  function body(action,now,id,scale){
    const frame=phase(action,now,reduceMotion);
    if(!frame)return {x:0,y:0,pose:0};
    const {step,p,reduced}=frame;
    if(action.kind==="relay"&&action.cover===id){
      return {x:reduced?0:Math.sin(Math.PI*p)*scale*.36,y:0,pose:{ready:5,advance:1,contact:3,return:6}[step]};
    }
    if(action.helper===id){
      const kind=action.kind,lift=kind==="remedy"?0:Math.sin(Math.PI*p)*scale*.08;
      const lunge=reduced?0:Math.sin(Math.PI*p)*scale*(kind==="follow"||kind==="relay"?.52:kind==="protect"?.33:.03);
      const pose=kind==="follow"||kind==="relay"?{ready:1,advance:2,contact:2,return:4}:
        kind==="protect"?{ready:5,advance:5,contact:3,return:6}:{ready:1,advance:1,contact:4,return:6};
      return {x:lunge,y:reduced?0:-lift,pose:pose[step]};
    }
    if(action.side===2&&action.recipient===id){
      return {x:step==="contact"&&!reduced?-scale*.09:0,y:0,pose:step==="contact"?3:0};
    }
    return {x:0,y:0,pose:0};
  }
  function foe(action,time){
    if(!action||action.side!==2)return null;
    const frame=phase(action,time,reduceMotion);if(!frame)return null;
    const {step,p,reduced}=frame;
    return {pose:{ready:"tell",advance:"tell",contact:"strike",return:"recover"}[step],
      beat:step==="contact"?.56:p,shift:reduced?0:-Math.sin(Math.PI*p)*.065};
  }
  function effects(c,time,action,actors,heroX,heroGround,foeX,foeGround,scale){
    const frame=phase(action,time,reduceMotion);if(!frame)return;
    const {step,p,reduced}=frame;
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
      const f=(p-.17)/.23;
      const destX=action.kind==="remedy"?tx:ex,destY=action.kind==="remedy"?ty:ey;
      const x=action.side===2?ex+(tx-ex)*f:ax+(destX-ax)*f;
      const y=(action.side===2?ey+(ty-ey)*f:ay+(destY-ay)*f)-Math.sin(f*Math.PI)*3*s;
      c.strokeStyle=color;c.lineWidth=2*s;c.beginPath();c.moveTo(x+(action.side===2?4:-4)*s,y-s);c.lineTo(x,y);c.stroke();
    }else if(step==="contact"){
      const towardParty=action.kind==="remedy"||action.side===2;
      const x=towardParty?tx:ex,y=towardParty?ty:ey;
      const f=reduced?.42:(p-.4)/.33;
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
  return Object.freeze({member,relay,phase,body,foe,effects,announcement,strikeSound,allyName,duration});
})();
