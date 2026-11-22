"use strict";
// Every distance in this table is a physical length in centimetres. The axis is
// measured in the rest pose. Changing pose, slot or camera cannot change it.
const WorldScale=(()=>{
  // In the standing pose the painted crown and planted boot span 84 texels.
  // This body measure excludes the hat, staff and transparent pose margins.
  const heroCm=165,heroBattlePixels=84,heroBattleNominal=93;
  const specifications=[
    ["bodyLength",58],["bodyLength",52],["bodyLength",16],["bodyLength",61],
    ["bodyHeight",165],["bodyHeight",165],["bodyHeight",165],["bodyHeight",95],
    ["bodyLength",9],["wingDistance",15],["bodyLength",12],["bodyHeight",29],
    ["bodyHeight",165],["bodyHeight",165],["bodyHeight",56],["bodyLength",98],
    ["bodyHeight",165],["bodyHeight",61],["bodyHeight",165],["bodyHeight",15],
    ["bodyHeight",165],["bodyHeight",110],["bodyHeight",165],["wingSpan",36],
    ["bodyHeight",165],["bodyHeight",95],["bodyHeight",165],["bodyHeight",39],
    ["bodyHeight",165],["bodyHeight",40]
  ];
  const rows=Object.freeze(specifications.map(([axis,cm],id)=>Object.freeze({id,axis,cm})));
  function geometry(id,x,ground,heroPx){
    const row=rows[id],art=CrewMetrics.rows[id];
    const scale=heroPx/heroCm*row.cm/art[row.axis];
    // Ground is the pixel boundary immediately below the planted foot. Keep the
    // rest contact and the same image anchor throughout all nine frames.
    return {x,baseline:ground+(art.anchor[1]-art.solePoint[1]-1)*scale,
      scale,nominal:scale*CrewMetrics.restHeight};
  }
  // Union of painted horizontal extents over the eight world cells. A casting
  // staff can extend considerably farther than the rest silhouette.
  const extents=[[35,168],[14,185],[47,164],[50,149],[50,186],[47,171],[56,185],[56,160],[24,175],[33,163],[50,162],[51,167],[52,149],[57,146],[44,158],[55,152],[66,132],[43,166],[55,150],[45,155],[49,156],[65,149],[72,149],[51,152],[50,158],[64,146],[49,156],[38,166],[55,151],[67,139]];
  function draw(context,id,x,ground,heroPx,pose=0,beat=0){
    const frame=geometry(id,x,ground,heroPx);
    if(context?.getTransform){
      const matrix=context.getTransform(),[left,right]=extents[id],anchor=CrewMetrics.rows[id].anchor[0];
      if(matrix.a>0 && !matrix.b && !matrix.c){
        const lo=(2-matrix.e)/matrix.a+(anchor-left)*frame.scale;
        const hi=(context.canvas.width-2-matrix.e)/matrix.a-(right-anchor)*frame.scale;
        frame.x=Math.min(hi,Math.max(lo,frame.x));
      }
    }
    return CrewArt.draw(context,id,frame.x,frame.baseline,frame.nominal,pose,beat);
  }
  function hero(context,x,ground,heroPx,pose=0){
    return ExpeditionCast.party(context,0,x,ground+.5*heroPx/heroBattlePixels,heroPx*heroBattleNominal/heroBattlePixels,0,0,pose);
  }
  // Orthographic projection. Members in one row share ground and every row
  // shares the same pixels per cm. The caller chooses the usable strip on screen.
  function formation(ids,getCell,nearX,farX,ground,depth){
    const places=ids.map((id,i)=>{const value=getCell(id,i);return {id,cell:Number.isInteger(value)&&value>=0&&value<9?value:i+3};});
    places.sort((a,b)=>a.cell%3-b.cell%3||a.cell-b.cell);
    for(let i=0;i<places.length;i++){
      const actor=places[i],row=Math.floor(actor.cell/3),col=actor.cell%3;
      const lane=(i+.5)/places.length;
      actor.x=nearX+(farX-nearX)*(lane+.12*((col+.5)/3-lane));
      actor.ground=ground+(row-1)*depth;
    }
    return places.sort((a,b)=>a.ground-b.ground||a.x-b.x);
  }
  return Object.freeze({rows,heroCm,heroBattlePixels,heroBattleNominal,mapHeroPixels:28,geometry,draw,hero,formation});
})();
