"use strict";
// Landmarks manually traced on the upright, unwarped battle atlas. Coordinates
// originate at each 204 × 154 cell's top left and remain fixed throughout its motion.
// For quadrupeds the upper landmark can be the highest part of the torso or skull.
// Birds' length is tail-tip to bill-tip. A folded or foreshortened wing chord
// must not be calibrated against a species' full, open wingspan.
window.CrewMetrics=(()=>{
  const rows=[
    ["red panda","quadruped","skull",[132,55],[118,130],[76,88],[156,79]],
    ["pangolin","quadruped","back",[96,42],[131,129],[54,92],[171,91]],
    ["kingfisher","perched bird","skull",[109,66],[101,126],[58,124],[147,78],[64,42],[96,93],"chord"],
    ["snowy owl","perched bird","skull",[126,59],[113,126],[65,123],[138,77],[60,119],[113,79],"chord"],
    ["human","human","beneath helmet",[110,48],[93,130],[91,87],[120,82]],
    ["human","human","beneath hood",[100,48],[91,130],[82,87],[114,83]],
    ["human","human","beneath hood",[106,46],[119,130],[89,82],[115,82]],
    ["ram","quadruped","shoulder",[98,76],[112,130],[65,99],[138,78]],
    ["newt","quadruped","skull",[146,68],[108,128],[60,96],[170,82]],
    ["bell moth","winged insect","head",[128,69],[141,124],[99,102],[139,84],[48,43],[114,85],"chord"],
    ["crystal scorpion","arthropod","carapace",[106,93],[72,124],[82,94],[112,105]],
    ["shrine turtle","quadruped","shell",[97,76],[104,130],[62,99],[150,85]],
    ["human","human","skull",[105,48],[118,130],[89,89],[120,90]],
    ["human","human","beneath cap",[106,49],[90,130],[91,88],[110,80]],
    ["catfish","upright animal","beneath cap",[111,52],[77,130],[76,86],[132,66]],
    ["egret","perched bird","skull",[116,42],[112,128],[74,121],[135,48],[70,117],[110,72],"chord"],
    ["human","human","skull",[109,47],[89,130],[93,84],[118,80]],
    ["beaver","upright animal","skull",[105,42],[82,130],[80,83],[122,52]],
    ["human","human","skull",[97,42],[112,129],[86,86],[110,79]],
    ["chipmunk","upright animal","skull",[111,51],[86,130],[84,99],[124,60]],
    ["human","human","beneath scarf",[97,44],[81,130],[82,82],[112,81]],
    ["wolf","upright animal","skull",[110,49],[95,130],[87,80],[124,55]],
    ["human","human","skull",[98,43],[80,130],[84,81],[107,79]],
    ["bat","upright animal","skull",[111,62],[101,130],[99,92],[124,73],[67,123],[138,121],"span"],
    ["human","human","beneath mask",[103,46],[84,130],[90,81],[110,78]],
    ["alpine goat","upright animal","skull",[116,51],[124,130],[92,84],[137,58]],
    ["human","human","skull",[98,41],[117,130],[86,81],[107,77]],
    ["ferret","upright animal","skull",[128,44],[74,130],[74,101],[140,47]],
    ["human","human","skull",[103,44],[89,130],[88,80],[117,83]],
    ["rabbit","upright animal","skull",[108,60],[83,130],[91,86],[116,69]]
  ].map(([species,kind,upperLandmark,crownPoint,solePoint,rearPoint,frontPoint,wingA=null,wingB=null,wingMeasure=null],id)=>{
    const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
    const bodyHeight=solePoint[1]-crownPoint[1];
    const bodyLength=distance(rearPoint,frontPoint);
    const wingDistance=wingA&&wingB?distance(wingA,wingB):null;
    return Object.freeze({id,species,kind,upperLandmark,crownPoint,solePoint,rearPoint,frontPoint,wingA,wingB,wingMeasure,
      anchor:[102,132],bodyHeight,bodyLength,wingDistance,wingSpan:wingMeasure==="span"?wingDistance:null});
  });
  return Object.freeze({rows:Object.freeze(rows),cellWidth:204,cellHeight:154,restHeight:92});
})();
