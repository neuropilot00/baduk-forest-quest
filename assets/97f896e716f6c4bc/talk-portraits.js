"use strict";
// Face and shoulder illustrations. Other cels contain only the moving eyes or jaw.
window.TalkPortrait=(()=>{
  const cast=[
    ["solbi","ソルビ","솔비"],["lulu","ルル","루루"],["moru","モル","모루"],
    ["hon","ホン","홍","혼"],["isol","イソル","이솔"]
  ];
  const cell=140,frames=["rest","speak","open","blink"];
  const poses=new Image(),solbi=new Image(),owners=new WeakMap(),inline=new WeakMap(),sizes=new WeakMap();
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const ready=new Promise(resolve=>{poses.onload=()=>resolve(true);poses.onerror=()=>resolve(false);});
  const solbiReady=new Promise(resolve=>{solbi.onload=()=>resolve(true);solbi.onerror=()=>resolve(false);});
  poses.src="../eaecd090510d7805/talk-portraits.webp";
  solbi.src="./solbi-portraits.webp";
  function index(actor){
    if(Number.isInteger(actor))return actor>=0&&actor<cast.length?actor:-1;
    const keys=Array.isArray(actor)?actor:actor?.name||[actor];
    return cast.findIndex(names=>names.some(n=>keys.includes(n)));
  }
  function paint(canvas,i,frame){
    const detailed=i===0&&!!solbi.naturalWidth;
    if(!detailed&&!poses.naturalWidth)return;
    const art=detailed?"solbi-hd":"cast";
    if(canvas.dataset.portraitActor===cast[i][0]&&canvas.dataset.portraitFrame===frames[frame]&&canvas.dataset.portraitArt===art)return;
    if(!sizes.has(canvas))sizes.set(canvas,[canvas.width,canvas.height]);
    const [wide,high]=detailed?[256,256]:sizes.get(canvas);
    if(canvas.width!==wide)canvas.width=wide;if(canvas.height!==high)canvas.height=high;
    const c=canvas.getContext("2d"),w=canvas.width,h=canvas.height,s=Math.min(w,h),l=(w-s)/2,t=(h-s)/2;
    c.clearRect(0,0,w,h);
    if(detailed)c.drawImage(solbi,frame%2*256,Math.floor(frame/2)*256,256,256,l,t,s,s);
    else{
      c.drawImage(poses,0,i*cell,cell,cell,l,t,s,s);
      if(frame)c.drawImage(poses,frame*cell,i*cell,cell,cell,l,t,s,s);
    }
    canvas.dataset.portraitActor=cast[i][0];canvas.dataset.portraitFrame=frames[frame];
    canvas.dataset.portraitArt=art;
  }
  function clear(canvas){
    if(!canvas)return;
    const state=owners.get(canvas);
    if(state){clearTimeout(state.timer);observer.unobserve(canvas);owners.delete(canvas);}
    const c=canvas.getContext("2d");
    c.clearRect(0,0,canvas.width,canvas.height);
    delete canvas.dataset.portraitActor;delete canvas.dataset.portraitFrame;delete canvas.dataset.portraitMode;delete canvas.dataset.portraitArt;
  }
  // Punctuation leaves the mouth closed for a beat. Between lines the actor
  // listens with closed lips and an occasional blink, without moving the head.
  function cadence(line){
    const ends=[],shapes=[],syllables=[1,2,1,0,2,1,0];
    let time=0,voice=0;
    for(const ch of Array.from(String(line)).slice(0,160)){
      const gap=/[\s、。，,.。！？?!「」“”‘’…]/u.test(ch);
      time+=gap?122:89;ends.push(time);shapes.push(gap?0:syllables[voice++%syllables.length]);
    }
    return {ends,shapes,time};
  }
  function tick(canvas){
    const s=owners.get(canvas);
    if(!s)return;
    clearTimeout(s.timer);
    if(!canvas.isConnected){clear(canvas);return;}
    if(!s.visible||document.hidden)return;
    const dialog=document.querySelector("dialog[open]:modal");
    if(canvas.closest("[inert]")||(dialog&&!dialog.contains(canvas))){
      s.start=null;s.timer=setTimeout(()=>tick(canvas),420);return;
    }
    const now=performance.now();
    if(s.start===null)s.start=now;
    const age=now-s.start,wait=(delay)=>{s.timer=setTimeout(()=>tick(canvas),Math.ceil(delay));};
    if(reduced.matches){paint(canvas,s.i,s.talk?1:0);return;}
    if(s.talk&&age<s.beats.time){
      const n=s.beats.ends.findIndex(v=>v>age);
      paint(canvas,s.i,s.beats.shapes[n]);wait(Math.max(24,s.beats.ends[n]-age));return;
    }
    const cycle=3080+s.i*147,blinkAt=cycle-145;
    const t=Math.max(0,age-(s.talk?s.beats.time:0))%cycle;
    paint(canvas,s.i,t>=blinkAt?3:0);wait(t<blinkAt?blinkAt-t:cycle-t);
  }
  const observer=new IntersectionObserver(events=>events.forEach(({target,isIntersecting})=>{
    const s=owners.get(target);if(!s)return;
    if(!target.isConnected){clear(target);return;}
    s.visible=isIntersecting;
    if(isIntersecting)tick(target);else clearTimeout(s.timer);
  }));
  function show(canvas,actor,{speaking=true,line="",key=""}={}){
    if(!canvas)return false;
    const i=index(actor);
    if(canvas.width===300&&canvas.height===150){canvas.width=canvas.height=cell;}
    if(i<0){clear(canvas);return false;}
    const old=owners.get(canvas);
    if(old&&old.i===i&&old.talk===speaking&&old.line===line&&old.key===key)return true;
    if(old)clearTimeout(old.timer);
    const state={i,talk:speaking,line,key,beats:cadence(line),visible:old?.visible??false,start:null,timer:0};
    owners.set(canvas,state);canvas.dataset.portraitMode=speaking?"speaking":"listening";
    function begin(){if(owners.get(canvas)!==state)return;paint(canvas,i,speaking&&reduced.matches?1:0);observer.observe(canvas);if(state.visible)tick(canvas);}
    if(poses.naturalWidth||i===0&&solbi.naturalWidth)begin();else ready.then(ok=>{if(ok)begin();});
    if(i===0&&!solbi.naturalWidth)solbiReady.then(ok=>{if(ok)begin();});
    return true;
  }
  function quoted(line){
    const copy=line.textContent.trim(),lead=copy.match(/^([^「“”"\s]{1,12})\s*[「“"]/u);
    const id=lead?index(lead[1]):-1;
    let face=inline.get(line);
    if(id<0){if(face){clear(face);face.remove();inline.delete(line);}return false;}
    if(!face){
      face=document.createElement("canvas");face.width=face.height=cell;
      face.className="inline-talk-face";face.setAttribute("aria-hidden","true");inline.set(line,face);
    }
    if(face.parentElement!==line)line.prepend(face);
    return show(face,id,{line:copy,key:line.id});
  }
  function refresh(){
    document.querySelectorAll("canvas[data-portrait-mode]").forEach(canvas=>{
      const state=owners.get(canvas);if(state?.visible)tick(canvas);
    });
  }
  document.addEventListener("visibilitychange",refresh);reduced.addEventListener("change",refresh);
  function standStill(canvas){
    if(solbi.naturalWidth)paint(canvas,0,0);
    else solbiReady.then(ok=>{if(ok&&canvas.isConnected)paint(canvas,0,0);});
  }
  return {show,clear,quoted,ready,standStill,supports:actor=>index(actor)>=0};
})();
