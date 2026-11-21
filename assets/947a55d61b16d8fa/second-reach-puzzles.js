"use strict";
// Each diagram occupies its stated rectangle on the same 9×9 board.
// x/o are black/white stones. B/W mark the particular stones in the objective.
// Positions are data only. The ordinary game rules and guardian reader judge each play.
const ReachPuzzles=(()=>{
  const locations=[
    // 1. single liberties
    {lesson:["ひと石の呼吸点","한 점의 활로"], species:12, diagrams:[
      ["liberty",1,3,3,".x/xW"],
      ["liberty",1,2,1,".W./xox/.x."],
      ["capture",1,5,3,".x/xW/.x"],
    ]},
    // 2. shared liberties
    {lesson:["つながった石の呼吸点","이어진 돌의 공유 활로"], species:19, diagrams:[
      ["liberty",1,3,5,"xo./.Wx/.x."],
      ["liberty",1,0,3,"..x./..ox/xoW."],
      ["atari",1,5,5,"xx./Wox/.x."],
    ]},
    // 3. straight connection
    {lesson:["一本の道でつなぐ","한 길로 연결하기"], species:14, diagrams:[
      ["link",1,2,6,".xoxo/oB.B./.xo.."],
      ["link",1,5,1,"..oo/.oxx/oB.B/...o"],
      ["capture",1,4,0,".x./.Wx/xox/.x."],
    ]},
    // 4. diagonal connection
    {lesson:["斜めの石をつなぐ二つの道","대각선 돌을 잇는 두 길"], species:21, diagrams:[
      ["link",1,4,0,".o../oB../..Bo/..xo/..o."],
      ["link",1,5,1,".o../xB../..Bx/..xo"],
      ["link",1,4,0,".o./ox./xBo/o.B"],
    ]},
    // 5. long chain
    {lesson:["長い連の最後の呼吸点","긴 무리의 마지막 활로"], species:12, diagrams:[
      ["liberty",1,3,6,".x../xoW./.xoo"],
      ["atari",1,3,5,".x./.ox/Wox/xx."],
      ["capture",1,4,1,"xox./xoWx/.xx."],
      ["capture",1,5,4,".x./xo./xox/xWx/xox"],
    ]},
    // 6. rescue a stone
    {lesson:["アタリの石を助ける","단수에 몰린 돌 구하기"], species:19, diagrams:[
      ["escape",1,5,1,"xo./.Bo/xo."],
      ["escape",1,3,4,"oBo/.o."],
      ["link",1,5,1,"...o/..ox/.B.B/oxo./.o.."],
    ]},
    // 7. rescue a chain
    {lesson:["二子を一緒に逃がす","두 점을 함께 구하기"], species:14, diagrams:[
      ["escape",1,4,2,".oo/oBx/.oo"],
      ["link",1,3,5,"oxo./.B.o/..Bx/..oo"],
      ["escape",1,3,0,".xo./x.Bo/.oxo/.oxo/..o."],
    ]},
    // 8. close an exit
    {lesson:["白の逃げ道を塞ぐ","백의 탈출로 막기"], species:21, diagrams:[
      ["atari",1,2,4,".x../xWox/..x."],
      ["atari",1,0,6,".xx./xooW/.xxx"],
      ["capture",1,6,3,"xx./Wox/xx."],
    ]},
    // 9. rescue or attack
    {lesson:["助ける石と攻める石","구할 돌과 공격할 돌"], species:19, diagrams:[
      ["escape",1,1,4,".oox./oBx.x/.oo.."],
      ["atari",1,3,2,".x./.Wx/xox"],
      ["read",2,3,7,"xWx/xo."],
    ]},
    // 10. ferry gate
    {lesson:["渡し場の攻防","나루터 공방"], species:12, diagrams:[
      ["link",1,1,4,"oB../..Bo/.ox."],
      ["atari",1,2,1,".xxx../x.Wo.x/.xxxx."],
      ["capture",1,2,2,".x./xox/xWx/.ox/.x."],
      ["escape",1,2,7,"oBo/oxo"],
      ["read",2,3,5,".xx./xWox/x..x/..x."],
    ]},
    // 11. edge order
    {lesson:["岸辺で打つ順番","가장자리에서 두는 순서"], species:21, diagrams:[
      ["atari",1,8,6,"x/W/o"],
      ["capture",1,0,1,".x./xo./oWx/xx."],
      ["read",2,6,0,".xx/x.W/.../..x"],
    ]},
    // 12. edge escape
    {lesson:["岸の隅に残された道","강가 모퉁이에 남은 길"], species:19, diagrams:[
      ["escape",1,6,0,"..x/.o./oxB/..o/.x."],
      ["capture",1,0,2,"x./Wx/ox"],
      ["read",2,0,4,"x../.../Wx./o.x/xx."],
    ]},
    // 13. decoy group
    {lesson:["狙った連だけを取る","지정한 무리 따내기"], species:12, diagrams:[
      ["capture",1,1,0,".x.../xWx../....x/...xo/....x"],
      ["capture",1,0,2,"..x../.xWox/..xx./xox../.x..."],
      ["read",2,1,2,".xx./xW../xox./xo.x/.xx."],
    ]},
    // 14. white replies
    {lesson:["白が伸びる先を読む","백이 뻗는 방향 읽기"], species:14, diagrams:[
      ["atari",1,5,0,".x./xo./.Wx/xox/.x."],
      ["read",2,3,0,".xxx../x.oW.x/.xxox./...x.."],
      ["read",2,2,3,".x./x.x/xW./.xx"],
    ]},
    // 15. crossing
    {lesson:["合流点を守る","길이 만나는 곳 지키기"], species:21, diagrams:[
      ["link",1,1,5,"..o.../..xo../oxBo../...Bxo"],
      ["escape",1,3,2,".o./.xo/oBo"],
      ["atari",1,4,2,".xx./xWox"],
      ["read",2,1,2,".x../x.x./xoWx/xo../.xx."],
    ]},
    // 16. third move
    {lesson:["三手先の取り上がり","세 수 뒤의 따내기"], species:19, diagrams:[
      ["link",1,5,2,"...o/oB.B/.oox/...o"],
      ["escape",1,1,3,".x../.oxo/oxBo/.oo."],
      ["read",3,1,0,".x../x.x./xWx./xox./xo.x/x.x./.x.."],
    ]},
    // 17. open exit
    {lesson:["開いた道を先に塞ぐ","열린 길부터 막기"], species:12, diagrams:[
      ["atari",1,2,5,"xx/oW/xx"],
      ["read",2,3,1,".x.../..xx./xooWx/.xx.x"],
      ["read",2,3,1,"..x/xW./.xx"],
    ]},
    // 18. resistance
    {lesson:["白の抵抗に応じて取る","백의 저항을 보고 마무리"], species:14, diagrams:[
      ["escape",1,0,0,".o../oxBo/x.o./.x.."],
      ["read",2,0,4,".xx./x.Wx/.x../..x."],
      ["read",3,1,1,".x.../x.x../xWo.x/x.x../.x..."],
    ]},
    // 19. gate approach
    {lesson:["水門前の読み合わせ","수문 앞 복합 수읽기"], species:21, diagrams:[
      ["capture",1,0,3,".x.../xo.x./.xxox/.xoWx/...x."],
      ["read",2,5,0,".x../xWox/.x../..x."],
      ["read",3,3,4,"x.xx../xooW.x/.xx.../...x.."],
    ]},
    // 20. gatekeeper
    {lesson:["水門番の五つの局面","수문장의 다섯 국면"], species:14, diagrams:[
      ["link",1,3,5,"...o./.B.Bo/oxoo."],
      ["escape",1,1,2,".xooo./x.xBxo/..ooo."],
      ["atari",1,3,1,"x.x./xoWx/xox./x.x."],
      ["capture",1,3,6,"xox./xWxx/.xxo"],
      ["read",2,3,5,".xx./xo.x/xWox/..x."],
    ]},
  ];
  function stage(index){
    const offset=index>=80?index-80:index;
    if(!Number.isInteger(index)||offset<0||offset>=locations.length)throw RangeError("Unknown second-reach location: "+index);
    const site=locations[offset],boss=offset===9||offset===19;
    const phases=site.diagrams.map(([kind,turns,left,top,diagram])=>{
      const board=Array(81).fill(0),targets=[];
      diagram.split("/").forEach((row,y)=>{
        [...row].forEach((char,x)=>{
          const p=(y+top)*9+left+x;
          if(char==="B"||char==="W")targets.push(p);
          if(char!==".")board[p]=char==="B"||char==="x"?1:2;
        });
      });
      return {kind,turns,board,targets,lesson:site.lesson.slice(),...(boss?{guardian:true}:{})};
    });
    return {enemy:1,species:site.species,lesson:site.lesson.slice(),phases};
  }
  return Object.freeze({stage});
})();
