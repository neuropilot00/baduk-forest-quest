"use strict";
// Each key is one finished illustration or one bounded panel of a painted atlas.
// The camera can reframe an existing panel without creating a new artwork.
window.EventPlates=(()=>{
  const files={},images=new Map(),frames=new WeakMap();
  // Keep only nearby dialogue images decoded during a long playthrough.
  const maxCachedPictures=16;
  const ambience=document.createElement("canvas");
  function atlas(file,cols,rows,keys){
    keys.forEach((key,i)=>{files[key]={file,cols,rows,i};});
  }
  const paintings={sack:"../eaecd090510d7805/story-panel-mail-sack.webp",oar:"../eaecd090510d7805/story-panel-broken-oar.jpg",ferry:"../eaecd090510d7805/story-panel-ferry-line.jpg",joint:"../eaecd090510d7805/story-panel-bridge-joint.jpg",
    seal:"../eaecd090510d7805/story-panel-wax-letter.jpg",paint:"../eaecd090510d7805/story-panel-oar-paint.jpg",tracks:"../eaecd090510d7805/story-panel-mud-tracks.jpg",wheel:"../eaecd090510d7805/story-panel-waterwheel.jpg",tooth:"../eaecd090510d7805/story-panel-gate-tooth.jpg",
    post:"../eaecd090510d7805/story-panel-flooded-post.jpg",quarry:"../eaecd090510d7805/story-panel-ash-quarry.jpg",snow:"../eaecd090510d7805/story-panel-snow-lantern.jpg"};
  for(const [key,name] of Object.entries(paintings))atlas(name,1,1,[key]);
  atlas("../eaecd090510d7805/event-river-crafts.webp",2,2,["tide-dial","inkstone","scale-dock","winter-ferry"]);
  atlas("../eaecd090510d7805/event-name-tags.webp",2,2,["drying-bank","wet-tags","tag-light","postmarks"]);
  atlas("../eaecd090510d7805/forest-panoramas.webp",2,3,["forest","landing","timber","fort","mill","creek"]);
  atlas("../eaecd090510d7805/district-panoramas.webp",2,3,["posthouse","furnace","snowpass","summit","glass","orrery"]);
  atlas("../eaecd090510d7805/event-trade-routes.webp",3,3,["ledger","kiln-test","snow-survey","mill-repair","levee-badge","lampwatch","boot-shelf","gorge-post","quiet-levers"]);
  atlas("../eaecd090510d7805/event-waterways.webp",2,4,["flour","levee","nightlamp","bootpost","gorge","inkfield","balance","silent"]);
  atlas("../eaecd090510d7805/riverbanks-restored.webp",2,1,["west-bridge","east-gate"]);

  // Source establishing shots follow the actual object at every original location.
  // The six tags appear both as they are discovered (9→10) and laid out to dry (10→11).
  const main=[
    "sack oar ferry tracks joint wheel creek tooth fort tooth wet-tags wet-tags landing ferry creek fort forest timber fort landing",
    "seal posthouse posthouse timber posthouse post posthouse post post seal landing creek landing creek landing seal posthouse seal seal quarry",
    "quarry quarry quarry furnace furnace furnace furnace furnace quarry furnace furnace furnace quarry furnace tooth tooth east-gate creek furnace furnace",
    "snow snowpass snowpass snow snow snowpass snowpass snowpass snowpass snowpass fort snowpass snow snowpass snowpass snowpass snowpass snowpass snowpass snow"
  ].flatMap(row=>row.split(" "));
  const reach="sack creek landing timber landing west-bridge creek timber west-bridge east-gate mill posthouse post creek creek posthouse timber east-gate fort posthouse".split(" ");
  const outerPrimary=["summit","glass","orrery","flour","levee","nightlamp","bootpost","gorge","inkfield","balance","silent"];
  // Visual anchors in the scene, left-to-right. These are photographic camera
  // choices for the actual district plates, not generated actors or floating props.
  const personnel=["snow-survey","kiln-test","tide-dial","mill-repair","levee-badge","lampwatch","boot-shelf","gorge-post","inkstone","scale-dock","quiet-levers"];
  const visits=[
    [0,2,3,5,6,7,10,11,13,14,17,19], [0,2,3,6,9,11,12,13,15,16,18,19], [0,1,3,5,7,9,10,12,13,14,15,16,18,19],
    [0,1,2,3,5,6,7,9,12,13,14,15,17,19], [0,1,2,3,4,6,8,10,11,12,13,17,19],
    [0,1,3,4,5,6,7,8,10,11,13,14,15,16,18,19], [0,1,3,4,6,8,9,10,11,12,13,14,15,16,17,18,19],
    [0,2,4,6,7,8,9,10,12,13,16,17,18,19], [0,1,3,4,5,6,8,9,10,11,12,13,15,16,17,18,19],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19], [0,1,2,3,4,6,7,8,9,10,11,12,13,14,15,17,18,19]
  ];
  const roadInsert={
    20:"ledger",22:"ledger",24:"ledger",25:"ledger",27:"ledger",28:"ledger",29:"ledger",
    30:"lampwatch",31:"lampwatch",32:"lampwatch",34:"ledger",35:"ledger",36:"ledger",37:"ledger",38:"ledger",39:"kiln-test",
    43:"kiln-test",44:"kiln-test",45:"kiln-test",47:"kiln-test",48:"quarry",49:"kiln-test",50:"kiln-test",51:"kiln-test",52:"kiln-test",53:"kiln-test",
    55:"quiet-levers",56:"quiet-levers",57:"kiln-test",60:"snow-survey",61:"snow-survey",62:"snow-survey",63:"snow-survey",64:"snow-survey",
    65:"winter-ferry",66:"winter-ferry",67:"winter-ferry",68:"winter-ferry",69:"winter-ferry",70:"ledger",71:"snow-survey",72:"snow-survey",73:"winter-ferry",74:"snow-survey",76:"winter-ferry",77:"winter-ferry",78:"ledger"
  };
  const focal=[
    [26,67,19,45,74,35,58,73,26,50,72,43,31,67,74,51,25,46,70,51],
    [12,28,52,70,80,61,73,47,27,50,41,39,24,68,73,68,51,29,74,48],
    [74,48,28,33,57,69,42,24,70,50,21,56,76,34,68,30,44,62,79,54],
    [42,58,36,76,49,30,65,56,73,46,42,34,68,44,26,73,55,43,63,45],
    [27,58,43,70,34,78,51,64,45,53,25,37,64,74,52,32,57,78,51,43],
    [72,38,24,51,76,47,69,32,51,66,28,76,60,49,37,29,70,57,35,62],
    [31,52,68,37,75,42,26,65,51,39,62,78,43,29,67,36,72,57,31,49],
    [25,47,74,36,66,53,72,31,42,61,76,37,51,67,35,52,71,36,64,48],
    [67,49,29,73,42,62,35,56,74,39,64,28,72,51,46,73,28,65,40,53],
    [31,67,41,76,53,39,65,32,48,71,38,60,77,39,53,68,30,42,72,48],
    [56,27,71,43,65,38,73,43,29,55,74,39,66,27,51,77,43,64,38,53]
  ];
  const shot=(plate,x=.5,zoom=1,y=.5)=>({plate,x,y,zoom});
  // A close detail of a tool can follow its district's establishing shot.
  // Tight crops keep incidental actors or an unrelated skyline outside the frame.
  const details={
    rope:shot("ferry",.40,2.45,.99),timber:shot("joint",.52,1.75,.88),
    ink:shot("seal",.48,2.05,.73),gear:shot("wheel",.52,1.72,.45),
    rock:shot("quarry",.44,1.85,.77),iron:shot("tooth",.55,2.12,.51),
    sack:shot("sack",.52,1.52,.65),tracks:shot("tracks",.48,1.95,.98),
    wax:shot("wet-tags",.92,2.3,.83),water:shot("post",.55,1.72,.51)
  };
  const deltaDetails="sack rope - timber rope timber - - rope iron gear water wax rope - ink timber - iron water".split(" ");
  const districtDetails=[
    "sack rope rock - timber rope - - - iron - - timber - - - rock - - -",
    "- iron - - - rock timber - - gear - - timber - - - rock - ink -",
    "wax rope - rock timber rock rope - - iron - rope ink - - - - water - -",
    "- sack gear rock - timber gear rope wax - - - iron gear - timber - sack - gear",
    "timber iron - iron iron tracks rock timber ink gear timber iron timber iron - timber rock timber timber iron",
    "- - timber timber - rock - - rope - - - timber - - - rope rope - iron",
    "tracks rope tracks sack iron tracks ink - - - - wax - ink sack - wax timber ink sack",
    "rock rope - rock rope timber rock rock rope timber - rock rock - - - tracks rope - rock",
    "ink timber - - - rock - - ink - wax - timber - - rock ink ink - -",
    "rope rope - - timber gear rock - iron iron timber water timber - - - ink water - -",
    "- rope iron - timber rock - - - iron - rope iron - timber - ink timber - iron"
  ].map(s=>s.split(" "));
  function detailFor(row,n,beat){
    return beat===2?details[row[n]]:null;
  }
  const portraitFraming={
    "road-12-1":[.14,1.24],"road-70-1":[.62,1.03],"road-72-0":[.55,1.03],"road-73-0":[.49,1.14],
    "road-74-0":[.86,1.40],"road-74-1":[.88,1.44],"road-74-2":[.53,1.03],"road-75-0":[.50,1.17],
    "road-76-1":[.44,1.22],"road-77-0":[.50,1.28],"road-77-1":[.57,1.18],"road-78-1":[.50,1.20],
    "delta-5-1":[.50,1.30],"delta-12-1":[.50,1.24],"delta-13-0":[.50,1.27],"delta-14-0":[.58,1.02],"delta-15-1":[.50,1.10],"delta-17-1":[.54,1.12],
    "delta-fork-1-0":[.56,1.35],"delta-fork-1-1":[.44,1.32],"delta-fork-2-0":[.53,1.46],"delta-fork-2-1":[.54,1.43],
    "outer-100-0-1":[.81,1.23],"outer-101-0-1":[.45,1.34],"outer-103-0-1":[.51,1.30],"outer-105-0-1":[.56,1.36],
    "outer-106-0-0":[.52,1.39],"outer-106-1-0":[.55,1.01],"outer-106-1-1":[.58,1.01],"outer-108-0-0":[.56,1.36],"outer-108-1-0":[.53,1.37],
    "outer-109-0-0":[.60,1.34],"outer-109-1-0":[.56,1.31],"outer-109-1-1":[.48,1.39],"outer-110-0-0":[.57,1.01],"outer-110-0-1":[.67,1.02],"outer-111-0-0":[.62,1.01],"outer-111-0-1":[.47,1.01],"outer-112-0-0":[.54,1.01],"outer-112-0-1":[.52,1.01],"outer-113-0-1":[.65,1.01],
    "outer-114-0-0":[.53,1.04],"outer-114-0-1":[.55,1.03],"outer-115-0-0":[.52,1.03],
    "outer-115-0-1":[.56,1.02],"outer-116-0-0":[.62,1.02],"outer-116-0-1":[.54,1.02],
    "outer-117-0-0":[.60,1.05],"outer-117-0-1":[.52,1.02],"outer-118-0-0":[.55,1.01],
    "outer-118-0-1":[.58,1.04],"outer-120-0-0":[.56,1.01],"outer-121-0-0":[.66,1.02],"outer-121-0-1":[.62,1.02],
    "outer-120-0-1":[.56,1.06],"outer-122-0-0":[.56,1.02],"outer-122-0-1":[.66,1.02],
    "outer-123-0-0":[.59,1.02],"outer-123-0-1":[.65,1.05],"outer-124-0-0":[.62,1.04],
    "outer-124-0-1":[.64,1.03],"outer-125-0-0":[.52,1.02],"outer-125-0-1":[.57,1.02],
    "outer-126-0-0":[.51,1.02],"outer-126-0-1":[.55,1.02],"outer-126-1-0":[.55,1.02],
    "outer-126-1-1":[.55,1.02],"outer-127-0-0":[.54,1.02],"outer-127-0-1":[.56,1.02],
    "outer-128-0-0":[.56,1.02],"outer-128-0-1":[.53,1.04],"outer-128-1-0":[.61,1.02],"outer-128-1-1":[.57,1.02],
    "outer-129-0-0":[.56,1.02],"outer-129-0-1":[.48,1.02],"outer-129-1-0":[.55,1.02],"outer-129-1-1":[.60,1.02],
    "outer-130-0-0":[.55,1.02],"outer-130-0-1":[.51,1.02],
    "outer-131-0-0":[.52,1.04],"outer-131-0-1":[.61,1.02],"outer-132-0-0":[.49,1.04],"outer-132-0-1":[.59,1.02],
    "outer-133-0-0":[.58,1.02],"outer-133-0-1":[.61,1.02],"outer-134-0-0":[.58,1.02],"outer-134-0-1":[.51,1.02],
    "outer-135-0-0":[.52,1.02],"outer-135-0-1":[.51,1.05],"outer-136-0-0":[.58,1.02],"outer-136-0-1":[.56,1.03],
    "outer-137-0-0":[.56,1.02],"outer-137-0-1":[.55,1.02],"outer-138-0-0":[.56,1.02],"outer-138-0-1":[.60,1.03],
    "outer-140-0-0":[.57,1.02],"outer-140-0-1":[.61,1.02],
    "outer-142-0-0":[.57,1.03],"outer-143-0-0":[.48,1.05],"outer-146-0-0":[.58,1.02],
    "outer-146-1-0":[.48,1.05],"outer-146-2-0":[.54,1.03],"outer-146-2-1":[.62,1.02],
    "outer-148-0-1":[.48,1.03],"outer-148-1-1":[.53,1.02],"outer-149-0-0":[.75,1.02],"outer-149-0-1":[.57,1.04],
    "outer-149-1-0":[.53,1.03],"outer-153-0-1":[.55,1.01],"outer-156-0-1":[.54,1.03],
    "outer-158-0-0":[.51,1.02],"brief-159-1":[.29,1.02],"outer-160-0-1":[.48,1.02],"outer-161-0-1":[.53,1.02],
    "brief-162-0":[.58,1.02],"brief-162-1":[.43,1.02],"outer-162-0-0":[.56,1.02],
    "outer-162-0-1":[.55,1.02],"brief-163-0":[.55,1.02],"brief-163-1":[.44,1.02],
    "outer-163-0-0":[.48,1.02],"outer-163-0-1":[.51,1.02],
    "brief-164-0":[.52,1.02],"brief-164-1":[.52,1.02],"outer-164-0-0":[.64,1.02],
    "outer-164-0-1":[.50,1.02],"brief-165-0":[.37,1.02],"brief-165-1":[.57,1.02],
    "outer-165-0-0":[.43,1.02],"outer-165-0-1":[.58,1.02],"brief-166-0":[.54,1.02],
    "brief-166-1":[.51,1.02],"outer-166-0-0":[.40,1.02],"outer-166-0-1":[.57,1.02],
    "outer-166-1-0":[.52,1.02],"outer-166-1-1":[.58,1.02],"outer-166-2-0":[.52,1.02],
    "outer-166-2-1":[.53,1.02],"brief-167-0":[.40,1.02],"brief-167-1":[.56,1.02],
    "outer-106-2-0":[.51,1.15],"outer-106-2-1":[.58,1.15],"outer-126-2-0":[.50,1.22],
    "outer-126-2-1":[.46,1.11],"outer-167-0-0":[.64,1.07],"outer-167-0-1":[.51,1.03],
    "brief-168-0":[.37,1.02],"brief-168-1":[.56,1.02],"outer-168-0-0":[.51,1.17],
    "outer-168-0-1":[.57,1.02],"outer-168-1-0":[.57,1.10],"outer-168-1-1":[.47,1.21],
    "brief-169-0":[.53,1.02],"brief-169-1":[.46,1.02],"outer-169-0-0":[.62,1.07],
    "outer-169-0-1":[.47,1.05],"brief-170-0":[.41,1.02],"brief-170-1":[.53,1.02],
    "outer-170-0-0":[.67,1.12],"outer-170-0-1":[.47,1.12],"brief-171-0":[.56,1.02],
    "brief-171-1":[.51,1.02],"outer-171-0-0":[.42,1.12],"outer-171-0-1":[.43,1.08],
    "brief-172-0":[.60,1.02],"brief-172-1":[.53,1.02],"outer-172-0-0":[.51,1.17],
    "outer-172-0-1":[.51,1.04],"brief-173-0":[.47,1.02],"brief-173-1":[.51,1.02],
    "outer-173-0-0":[.57,1.15],"outer-173-0-1":[.69,1.12],"outer-173-1-0":[.49,1.15],
    "outer-173-1-1":[.47,1.12],"brief-174-0":[.44,1.02],"brief-174-1":[.44,1.02],
    "outer-174-0-0":[.43,1.13],"outer-174-0-1":[.59,1.08],"brief-175-0":[.46,1.02],
    "brief-175-1":[.49,1.02],"outer-175-0-0":[.47,1.17],"outer-175-0-1":[.48,1.07],
    "brief-176-0":[.49,1.02],"brief-176-1":[.44,1.02],"outer-176-0-0":[.54,1.13],
    "outer-176-0-1":[.43,1.09],"brief-177-0":[.59,1.02],"brief-177-1":[.50,1.02],
    "outer-177-0-0":[.62,1.08],"outer-177-0-1":[.57,1.10],"brief-178-0":[.48,1.02],
    "brief-178-1":[.55,1.02],"outer-178-0-0":[.52,1.13],"outer-178-0-1":[.57,1.12],
    "brief-179-0":[.57,1.02],"brief-179-1":[.49,1.02],"brief-180-0":[.50,1.02],
    "brief-180-1":[.57,1.02],"outer-180-0-0":[.58,1.10],"outer-180-0-1":[.50,1.07],
    "brief-181-0":[.45,1.02],"brief-181-1":[.52,1.02],
    "outer-181-0-0":[.51,1.12],"outer-181-0-1":[.49,1.10],"brief-182-0":[.39,1.02],
    "brief-182-1":[.41,1.02],"outer-182-0-0":[.55,1.12],"outer-182-0-1":[.53,1.08],
    "brief-183-0":[.33,1.02],"brief-183-1":[.48,1.02],"outer-183-0-0":[.50,1.18],
    "outer-183-0-1":[.52,1.08],"brief-184-0":[.54,1.02],"brief-184-1":[.59,1.02],
    "outer-184-0-0":[.55,1.15],"outer-184-0-1":[.56,1.10],"brief-185-0":[.56,1.02],
    "brief-185-1":[.49,1.02],"outer-185-0-0":[.53,1.10],"outer-185-0-1":[.58,1.12],
    "brief-186-0":[.59,1.02],"brief-186-1":[.45,1.02],"outer-186-0-0":[.62,1.17],
    "outer-186-0-1":[.51,1.10],"outer-186-1-0":[.48,1.10],"outer-186-1-1":[.44,1.10],
    "outer-186-2-0":[.56,1.20],"outer-186-2-1":[.52,1.11],"brief-187-0":[.53,1.02],
    "brief-187-1":[.51,1.02],"outer-187-0-0":[.53,1.17],"outer-187-0-1":[.52,1.14],
    "brief-188-0":[.49,1.02],"brief-188-1":[.52,1.02],"outer-188-0-0":[.56,1.18],
    "outer-188-0-1":[.46,1.15],"outer-188-1-0":[.48,1.17],"outer-188-1-1":[.67,1.12],
    "brief-189-0":[.48,1.02],"brief-189-1":[.52,1.02],"outer-189-0-0":[.51,1.17],
    "outer-189-0-1":[.49,1.12],"brief-190-0":[.49,1.02],"brief-190-1":[.53,1.02],
    "outer-190-0-0":[.53,1.13],"outer-190-0-1":[.51,1.03],
    "brief-191-0":[.36,1.02],"brief-191-1":[.48,1.02],"outer-191-0-0":[.54,1.15],
    "outer-191-0-1":[.56,1.15],"brief-192-0":[.59,1.02],"brief-192-1":[.49,1.02],
    "outer-192-0-0":[.48,1.12],"outer-192-0-1":[.53,1.08],"outer-193-0-0":[.55,1.17],
    "outer-193-0-1":[.62,1.10],"outer-193-1-0":[.48,1.13],"outer-193-1-1":[.54,1.13],
    "brief-194-0":[.58,1.02],"brief-194-1":[.52,1.02],"brief-195-1":[.51,1.02],
    "outer-195-0-1":[.51,1.13],"outer-196-0-0":[.52,1.11],"outer-196-0-1":[.56,1.19],
    "brief-197-0":[.59,1.02],"outer-197-0-0":[.51,1.19],"outer-197-0-1":[.58,1.15],
    "outer-198-0-0":[.52,1.19],"outer-198-0-1":[.54,1.18],"brief-199-1":[.45,1.02],
    "brief-200-0":[.50,1.02],"brief-200-1":[.54,1.02],"outer-200-0-0":[.47,1.19],
    "outer-200-0-1":[.51,1.12],"outer-201-0-0":[.49,1.18],"outer-201-0-1":[.57,1.09],
    "brief-202-0":[.53,1.02],"outer-202-0-0":[.59,1.13],"outer-203-0-0":[.50,1.12],
    "brief-204-1":[.53,1.02],"outer-204-0-0":[.54,1.11],"outer-205-0-0":[.51,1.16],
    "brief-206-0":[.52,1.02],"brief-206-1":[.45,1.02],"outer-206-0-0":[.55,1.18],
    "outer-206-0-1":[.54,1.13],"outer-206-1-0":[.52,1.13],"outer-206-1-1":[.56,1.15],
    "outer-206-2-0":[.49,1.14],"outer-206-2-1":[.52,1.11],"outer-207-0-0":[.55,1.17],
    "outer-208-0-0":[.51,1.16],"outer-208-0-1":[.52,1.16],"outer-208-1-0":[.52,1.16],
    "outer-208-1-1":[.49,1.11],"brief-209-0":[.51,1.02],"outer-210-0-0":[.49,1.16],
    "outer-211-0-0":[.53,1.15],"outer-212-0-0":[.51,1.14],
    "brief-213-0":[.46,1.02],"outer-213-0-0":[.54,1.13],"outer-213-0-1":[.52,1.12],
    "outer-213-1-0":[.48,1.14],"outer-213-1-1":[.48,1.15],"outer-214-0-0":[.56,1.18],
    "outer-215-0-0":[.52,1.20],"outer-215-0-1":[.59,1.17],"outer-216-0-0":[.51,1.18],
    "outer-218-0-1":[.51,1.18],"brief-219-0":[.50,1.02],"brief-219-1":[.48,1.02],
    "outer-221-0-0":[.52,1.15],"outer-221-0-1":[.56,1.11],"outer-222-0-0":[.53,1.13],
    "outer-226-2-0":[.31,1.18],"outer-228-1-0":[.35,1.09],
    "outer-246-2-0":[.49,1.28],"outer-248-1-0":[.36,1.08],
    "outer-273-1-0":[.78,1.25],"outer-293-0-0":[.91,1.70],"outer-293-1-0":[.76,1.62],
    "outer-308-0-0":[.64,1.72],"outer-308-1-0":[.43,1.69],
    "outer-318-0-1":[.35,1.16],"brief-319-0":[.56,1.10],"brief-319-1":[.25,1.06]
  };
  function horizontalFocus(key){return portraitFraming[key]?.[0]??.50;}
  function originalCut(key){
    const source=OriginalStoryPlates.get(key);
    if(!source)return null;
    files[key]={file:source,cols:1,rows:1,i:0};
    return shot(key,horizontalFocus(key),1,.49);
  }
  function select(owner,from,to,beat=0,variant=0){
    if(!Number.isInteger(from)||!Number.isInteger(to)||!Number.isInteger(beat)||beat<0)return null;
    if(owner==="road"){
      if(from<0||from>=79||to!==from+1)return null;
      const count=from<19?RoadForest.lines(from).length:RoadChapters.lines(from).length;
      const key=beat<count?"road-"+from+"-"+beat:"brief-"+to+"-"+(beat-count);
      const original=originalCut(key);if(original)return original;
      const fixed=window.StoryPanels?.authored(from,beat);if(fixed)return fixed;
      // Later dialogue pages belong to the destination, independently of speakers.
      const id=beat>=count?to:from,near=beat%2===1;
      if(from===9&&id===10)return near?shot("wet-tags",.5,1):shot("drying-bank",.48,1,.59);
      if(from===10){
        if(beat===0)return shot("tag-light",.56,1,.45);
        if(beat===1)return shot("wet-tags",.5,1);
        return shot("postmarks",near?.64:.51,near?1.09:1,.68);
      }
      if(from===11&&beat===0)return shot("postmarks",.53,1.08,.69);
      if(from===11&&beat===1)return shot("landing",.63,1.12);
      if(!near&&roadInsert[id])return shot(roadInsert[id],.50,1,.53);
      return shot(main[id],near?.62:.43,near?1.13:1,.5);
    }
    if(owner==="reach"){
      const key=beat>=2?"brief-"+(80+to)+"-"+(beat-2):from<0?"delta-fork-"+(-from)+"-"+beat:"delta-"+from+"-"+beat;
      const original=originalCut(key);if(original)return original;
      const id=beat===0?from:to;
      if(id===-1||id===-2)return shot(id===-1?"west-bridge":"east-gate",.52);
      if(id<0||id>=20)return null;
      if(beat===0||beat===3){
        const action={2:"mill-repair",5:"levee-badge",7:"levee-badge",9:"quiet-levers",10:"mill-repair",11:"ledger",12:"ledger",14:"levee-badge",16:"levee-badge",17:"quiet-levers",19:"ledger"}[id];
        if(action)return shot(action,.5,1,.55);
      }
      return detailFor(deltaDetails,id,beat)||shot(reach[id],beat===1?.65:beat===3?.35:.48,beat===3?1.2:1,.52);
    }
    if(owner==="outer"){
      if(beat>=2||variant>=0){
        const key=beat>=2?"brief-"+to+"-"+(beat-2):"outer-"+from+"-"+variant+"-"+beat;
        const original=originalCut(key);if(original)return original;
      }
      const id=beat===0?from:to,r=Math.floor((id-100)/20),n=(id-100)%20;
      if(!outerPrimary[r]||n<0)return null;
      const center=focal[r][n]/100;
      if((beat===0||beat===3)&&visits[r].includes(n)&&personnel[r])return shot(personnel[r],beat?.59:.5,beat?1.08:1,.53);
      return detailFor(districtDetails[r],n,beat)||shot(outerPrimary[r],beat===2?1-center:center,beat===3?1.20:beat===1&&n%3?1.08:1,.54);
    }
    return null;
  }
  function picture(file){
    const previous=images.get(file);
    if(previous){
      images.delete(file);images.set(file,previous);
      return previous;
    }
    const image=new Image();
    const rec={image,loaded:false,failed:false};
    rec.promise=new Promise(resolve=>{
      image.onload=()=>{rec.loaded=true;resolve(true);};
      image.onerror=()=>{rec.failed=true;resolve(false);};
    });
    images.set(file,rec);
    if(images.size>maxCachedPictures)images.delete(images.keys().next().value);
    image.src=file;return rec;
  }
  function ready(owner,from,to,beat,variant){
    const view=select(owner,from,to,beat,variant);return view?picture(files[view.plate].file).promise:Promise.resolve(false);
  }
  function retry(owner,from,to,beat,variant){
    const view=select(owner,from,to,beat,variant);
    const file=view&&files[view.plate].file;
    if(file&&images.get(file)?.failed)images.delete(file);
    return ready(owner,from,to,beat,variant);
  }
  function warm(owner,from,to,beat=0,variant=0){ready(owner,from,to,beat,variant);ready(owner,from,to,beat+1,variant);}
  function draw(canvas,owner,from,to,beat=0,variant=0){
    const view=select(owner,from,to,beat,variant);if(!view)return false;
    const host=canvas.closest("dialog"),box=canvas.getBoundingClientRect();if(!host||!box.width||!box.height)return true;
    const art=files[view.plate],rec=picture(art.file);
    host.classList.add("painted-road");canvas.style.imageRendering="auto";
    const caption=host.querySelector(".road-words,.reach-journey-copy,.outer-journey-copy");
    const scale=Math.min(devicePixelRatio||1,2.5,1920/box.width,1920/box.height);
    const w=Math.round(box.width*scale),h=Math.round(box.height*scale);
    const wide=owner==="road"&&box.width>=600&&box.width/box.height>=1.26;
    const outside=caption?.getBoundingClientRect();
    const contentWidth=wide?Math.round((outside?outside.left-box.left:w*.67/scale)*scale):w;
    const contentHeight=wide?h:Math.min(h,Math.max(h*.48,Math.round((outside?outside.top-box.top:box.height*.73)*scale+20*scale)));
    const stamp=[owner,from,to,beat,variant,w,h,wide,contentWidth,contentHeight].join("/");
    const expected=rec.loaded?"ready":rec.failed?"error":"loading";
    if(frames.get(canvas)===stamp&&canvas.dataset.plateState===expected)return true;
    frames.set(canvas,stamp);
    if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
    canvas.dataset.plateKey=view.plate;canvas.dataset.plateState=expected;
    if(owner==="reach")canvas.dataset.deltaPicture=(beat?to:from)+(beat?"-approach":"-repaired");
    delete canvas.dataset.roadHabitat;
    const c=canvas.getContext("2d");c.fillStyle="#192b2a";c.fillRect(0,0,w,h);
    if(!rec.loaded){
      delete canvas.dataset.panel;delete canvas.dataset.originalCut;
      if(!rec.failed)rec.promise.then(()=>{if(host.open&&frames.get(canvas)===stamp)draw(canvas,owner,from,to,beat,variant);});
      return true;
    }
    const sizeX=rec.image.naturalWidth/art.cols,sizeY=rec.image.naturalHeight/art.rows;
    const sx=art.i%art.cols*sizeX+1,sy=Math.floor(art.i/art.cols)*sizeY+1,sw=sizeX-2,sh=sizeY-2;
    const cw=Math.max(1,contentWidth),ch=Math.max(1,contentHeight);
    const isOriginal=OriginalStoryPlates.has(view.plate);
    const portrait=isOriginal&&box.height>box.width*1.22;
    // The complete original sits in the same window on every beat. Only the
    // soft color field may overflow it; a wider plate never crops the cast.
    const topSafe=wide?0:Math.min(ch*.18,62*scale);
    const visibleH=isOriginal?ch-topSafe:Math.min(ch,cw/(view.plate==="wet-tags"?.94:sw/sh>1.7?.77:.73));
    const magnify=isOriginal?Math.min(cw/sw,visibleH/sh):Math.max(cw/sw,visibleH/sh)*view.zoom;
    const dw=sw*magnify,dh=sh*magnify;
    const left=isOriginal?(cw-dw)/2:(cw-dw)*view.x;
    const top=isOriginal?topSafe+(visibleH-dh)*(portrait?.82:.50):(visibleH-dh)*view.y+(ch-visibleH)*.16;
    const paint=(x,y,width,height)=>c.drawImage(rec.image,sx,sy,sw,sh,x,y,width,height);
    c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
    if(isOriginal&&!wide){
      // Downsample the painting to its colors to keep the atmosphere soft in
      // WebKit as well as browsers that support CanvasRenderingContext2D.filter.
      const cover=Math.max(w/sw,h/sh);
      const coverW=sw*cover,coverH=sh*cover;
      const softWidth=14,softHeight=Math.max(14,Math.round(softWidth*h/w));
      if(ambience.width!==softWidth)ambience.width=softWidth;
      if(ambience.height!==softHeight)ambience.height=softHeight;
      const soft=ambience.getContext("2d");
      soft.imageSmoothingEnabled=true;soft.imageSmoothingQuality="high";
      soft.drawImage(rec.image,sx,sy,sw,sh,
        (w-coverW)*softWidth/(2*w),(h-coverH)*softHeight/(2*h),coverW*softWidth/w,coverH*softHeight/h);
      c.save();c.globalAlpha=portrait?.67:.34;c.drawImage(ambience,0,0,w,h);c.restore();
    }
    // Behind the uncropped evidence, extend its ink and light as a subdued matte.
    if(top>0&&!isOriginal){
      c.drawImage(rec.image,sx,sy,sw,Math.max(1,sh*.012),left,0,dw,top+1);
      const sky=c.createLinearGradient(0,0,0,top);sky.addColorStop(0,"#142424b3");sky.addColorStop(1,"#14242400");
      c.fillStyle=sky;c.fillRect(0,0,w,top);
    }
    c.save();c.beginPath();c.rect(0,Math.max(0,top),cw,Math.max(1,Math.min(h,top+dh)-Math.max(0,top)));c.clip();paint(left,top,dw,dh);c.restore();
    if(portrait&&top>0){
      const depth=24*scale,fade=c.createLinearGradient(0,top,0,top+depth);
      fade.addColorStop(0,"#13232387");fade.addColorStop(1,"#13232300");
      c.fillStyle=fade;c.fillRect(0,top,w,depth);
    }
    if(wide){
      const shade=c.createLinearGradient(cw*.90,0,Math.min(w,cw+38*scale),0);shade.addColorStop(0,"#192b2a00");shade.addColorStop(1,"#192b2a");
      c.fillStyle=shade;c.fillRect(cw*.9,0,w-cw*.9,h);
    }else{
      const bottom=Math.min(h,top+dh);
      const start=Math.max(0,bottom-62*scale);
      const shade=c.createLinearGradient(0,start,0,Math.max(start+1,bottom+9*scale));
      shade.addColorStop(0,"#18292800");shade.addColorStop(.55,"#18292875");shade.addColorStop(.85,portrait?"#172927aa":"#172927e8");shade.addColorStop(1,portrait?"#16282788":"#162827");
      c.fillStyle=shade;c.fillRect(0,start,w,h);
    }
    if(OriginalStoryPlates.has(view.plate)){
      canvas.dataset.originalCut=view.plate;
      canvas.dataset.panel=owner==="road"?(window.StoryPanels?.authored(from,beat)?.plate??view.plate):view.plate;
    }else{delete canvas.dataset.originalCut;canvas.dataset.panel=view.plate;}
    return true;
  }
  return Object.freeze({select,ready,retry,warm,draw,horizontalFocus});
})();
