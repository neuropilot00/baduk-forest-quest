"use strict";
// Preserve the individually art-directed crops from the first edition.
window.StoryPanels=(()=>{
  const shot=(plate,x=.5,zoom=1,y=.5)=>({plate,x,y,zoom});
  const events={
    0:[shot("sack",.53),shot("seal",.47),shot("seal",.55,1.19,.72),shot("oar",.53)],
    1:[shot("oar",.64,1.04),shot("oar",.49,1.16,.59),shot("paint",.59,1.12),
       shot("paint",.64),shot("ferry",.58)],
    2:[shot("ferry",.57),shot("ferry",.42,1.25,.79),shot("tracks",.51)],
    3:[shot("tracks",.59,1.11,.62),shot("tracks",.42,1.13,.57),shot("joint",.45)],
    4:[shot("joint",.57),shot("joint",.53,1.22,.77),shot("wheel",.59)],
    9:[shot("tooth",.56),shot("tooth",.48,1.25,.62)],
    27:[shot("post",.54),shot("post",.62,1.12,.57)],
    40:[shot("quarry",.52,1.15,.72),shot("quarry",.57)],
    59:[null,shot("snow",.52)],
    60:[shot("snow",.55,1.07,.55),shot("snow",.55)],
    62:[null,shot("snow",.46,1.05)],
    63:[null,shot("snow",.53,1.15,.58)]
  };
  const authored=(from,beat)=>events[from]?.[beat]||null;
  const selection=(from,beat)=>EventPlates.select("road",from,from+1,beat);
  const warm=(from,beat=0)=>EventPlates.warm("road",from,from+1,beat);
  const draw=(canvas,from,beat)=>EventPlates.draw(canvas,"road",from,from+1,beat);
  return {draw,warm,selection,authored};
})();
