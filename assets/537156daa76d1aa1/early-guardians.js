"use strict";
// The five seventh-post duels keep their own game records and achievements.
const EarlyGuardians=(()=>{
  const games={
    6:{"rank":0,"komi":0.5,"start":[37,33,13,42,60,57,32,41,31,40,22,39,30,48,50,49,51,24,21,23,20,38,29,47,28,56,59,58,11,14,10,15,12,16,19,25,46,34,52,43,55,65,61,64,68,66,67,70,69,5,71,79,78,4],"size":9,"goal":["隅の白二子が取れる。白が反対側へ回った後も地を守ろう。","귀의 백 두 점을 딸 수 있어요. 백이 반대쪽으로 돌아설 때 남은 집도 지키세요."]},
    26:{"rank":2,"komi":3.5,"start":[59,14,46,51,64,66,55,50,41,49,32,40,31,39,30,48,21,57,20,23,22,24,29,33,42,38,47,56,60,58,11,13,10,12,19,15,28,37,43,16,34,25,52,65],"size":9,"goal":["二つの黒をつなごう。捨て石に時間を使うと白が先に境界を固める。","두 흑 무리를 연결하세요. 버림돌을 쫓으면 백이 먼저 경계를 굳혀요."]},
    46:{"rank":4,"komi":5.5,"start":[69,32,48,22,47,50,39,31,30,41,40,49,21,23,20,24,51,33,60,42,58,59,57,13,29,12,38,11,56,10,19,14,28,15,37,16,67,68,46,25,43,34,61,65,55,64,66,1,70,0],"size":9,"goal":["狭い黒の呼吸点を広げよう。生還した後は辺の境界を詰める。","몰린 흑 무리의 활로를 넓히세요. 살아나온 뒤엔 변의 경계를 정리하세요."]},
    66:{"rank":5,"komi":7.5,"start":[40,19,69,23,20,34,32,24,31,33,30,41,21,49,48,50,39,42,58,60,57,51,59,22,68,47,38,10,29,11,12,13,28,14,61,15,70,16,37,25,52,43,66,65],"size":9,"goal":["辺の白をアタリに。白が受けずに手を抜く変化も最後まで読む。","변의 백을 단수에 모세요. 백이 손을 빼면 그 뒤의 끝내기까지 읽으세요."]},
    86:{"rank":1,"komi":2.5,"start":[57,31,38,25,70,39,48,30,47,32,49,40,50,41,29,21,20,22,51,23,42,24,33,59,60,12,61,11,68,10,58,13],"size":9,"goal":["水路を挟む二団の黒をつなぎ、白が逆岸に向かった後の境界を取ろう。","수로 양쪽의 흑을 잇고 백이 반대 둑으로 돌아간 뒤의 경계를 차지하세요."]},
  };
  const is=id=>Number.isInteger(id)&&Object.hasOwn(games,id);
  const bit=id=>is(id)?1<<Math.floor(id/20):0;
  const clean=n=>Number.isInteger(n)&&n>=0&&n<512?n:0;
  function checked(n,frontier,reach){
    n=clean(n);let result=0;
    for(const id of [6,26,46,66,86]){
      const mask=bit(id);
      if((id===86?frontier>=20&&reach>=56:frontier>id)&&(n&mask))result|=mask;
      if(id<80&&frontier===id&&(n&(mask<<5)))result|=mask<<5;
    }
    return result;
  }
  function ready(id,saved){return id<80&&is(id)&&id===saved.expedition&&!!(saved.sentries&(bit(id)<<5));}
  return Object.freeze({is,bit,checked,ready,game:id=>is(id)?games[id]:null});
})();
if(typeof module!=="undefined")module.exports=EarlyGuardians;
