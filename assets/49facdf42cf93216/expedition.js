"use strict";

// Campaign positions never advance the separate v4 training library.
const Expedition = (() => {
  const ranks = [["初級","초급"],["中級","중급"],["上級","상급"],["最上級","최상급"]];
  const regions = [["木漏れ日の森","볕드는 숲"],["蛍の渓谷","반딧불 계곡"],["残り火の峠","잿불 고개"],["星霜の峰","서리별 봉우리"]];
  const paths = [
    ["木の根の小径","나무뿌리 오솔길"],["川の吊り橋","개울 위 구름다리"],
    ["灯石の洞窟","등불돌 동굴"],["風笛の尾根","바람피리 능선"]
  ];
  const tracks = [
    [1,2,3,1,4], [2,4,3,5,5], [4,5,3,6,6], [5,6,7,6,7]
  ];
  const names = [[["岩角の雄羊","바위뿔 숫양"],["渓流カワセミ","여울 물총새"],["木札センザンコウ","나무패 천산갑"],["火花イモリ","불꽃 도롱뇽"],["鈴羽の蛾","방울날개 나방"],["白羽フクロウ","흰날개 올빼미"],["晶尾サソリ","수정꼬리 전갈"],["祠を背負う亀","사당을 인 거북"],["苔冠の山鹿","이끼관 사슴"],["切株ヤドカリ","그루터기 소라게"],["野ばら兎","들장미 토끼"],["笹葉カマキリ","댓잎 사마귀"]],
    [["錨爪ガニ","닻집게 게"],["硝子クラゲ","유리 해파리"],["葦嘴サギ","갈대부리 왜가리"],["扇エイ","부채 가오리"],["帆ビレ竜馬","돛지느러미 해마"],["渦巻きオウム貝","회오리 앵무조개"],["水車ウナギ","물레 장어"],["沼の提灯魚","늪 초롱아귀"],["舟背ラッコ","뗏목 해달"],["泡羽トンボ","거품날개 잠자리"],["岩屋ウツボ","틈바위 곰치"],["水琴ムール貝","물금 홍합"]],
    [["煙突バク","굴뚝 맥"],["鋏牙クワガタ","가윗턱 사슴벌레"],["釜腹イノシシ","솥배 멧돼지"],["炉縁ヤモリ","화덕붙이 도마뱀붙이"],["煤翼カラス","검댕 까마귀"],["鎚嘴キツツキ","망치부리 딱따구리"],["鉄輪アルマジロ","철테 아르마딜로"],["灰火ヒドラ","잿불 히드라"],["火床ダチョウ","불마루 타조"],["岩芯モグラ","암심 두더지"],["火口タコ","분화구 문어"],["鎧ハリネズミ","갑옷 고슴도치"],["溶岩ヒトデ","용암 불가사리"]],
    [["雪笠ペンギン","눈갓 펭귄"],["薄氷アザラシ","살얼음 물범"],["星角シロサイ","별뿔 흰코뿔소"],["氷柱セイウチ","고드름 바다코끼리"],["流星モモンガ","유성 하늘다람쥐"],["燭台トナカイ","촛대 순록"],["氷鏡マンモス","빙경 매머드"],["霜刃リュウグウウミウシ","서리칼 갯민숭달팽이"],["風鈴コウモリ","풍경 박쥐"],["硝子鶴","유리 두루미"],["極光マンタ","극광 쥐가오리"],["銀鈴キツネ","은방울 여우"],["甲冑シロクマ","갑주 북극곰"]]];
  const palettes = [
    ["#ebdeb0","#78b968","#263e34","#ffdb87"],
    ["#caf2df","#539eaa","#213d50","#a4f4f1"],
    ["#ffc594","#bd624e","#4c3041","#ffdc66"],
    ["#ede2fd","#9a94cc","#393954","#95eeef"]
  ];
  const rankSize=20;
  const total=ranks.length*rankSize;
  const words = {
    expedition:["遠征","원정"], rankSelect:["遠征の難易度","원정 난이도"], walking:["移動中","걷는 중"],
    continueWalk:["先へ進む","앞으로 가기"], arrive:["道を抜ける","길 건너기"], departing:["次の足あとへ！","다음 발자국을 따라가요!"],
    arriveMsg:["{0}が道をふさいだ！","{0} 등장! 길을 막고 있어요."],
    guardianArrives:["{0}が門を守っている。","{0}이 문 앞을 지키고 있다."],
    areaLabel:["{0} · 第{1}局","{0} · 제{1}국"], round:["{0}局目 / 全{1}局","{0}국 / 총 {1}국"],
    checkpoint:["関門","관문"], guardian:["番人","수문장"], road:["道中","길목"],
    trailText:["{0}を抜け、次の気配を追う。","{0}을 지나 다음 인기척을 따라갑니다."],
    fieldText:["{0}の先に{1}が現れた。","{0} 너머에 {1}의 모습이 보입니다."],
    trailWon:["道が開いた。次の目的地へ向かおう。","길이 열렸어요. 다음 목적지로 출발해요."],
    gateWon:["構えが変わる。次の局面へ。","상대가 자세를 바꿉니다. 다음 국면으로 이어집니다."],
    journeyDone:["極光の天竜が道を譲った。すべての遠征を踏破！","극광천룡이 길을 열었어요. 모든 원정을 완주했습니다!"],
    bestiary:["遠征の魔物図鑑","원정 몬스터 도감"], fieldSkills:["遠征スキル","원정 스킬"],
    skillReward:["新しいスキル「{0}」を覚えた！","새 스킬 ‘{0}’을 배웠어요!"],
    skillsLocked:["初級1をクリアすると最初のスキルを覚えるよ。","초급 1을 깨면 첫 스킬을 배워요."],
    breath:["息の灯","활로 등불"], breathHelp:["目標の石の呼吸点を照らす。","목표 돌의 활로를 밝혀요."],
    rewind:["時戻し","한 수 되감기"], rewindHelp:["直前の黒の手まで一度戻る。","직전 흑 착수 전으로 한 번 돌아가요."],
    scout:["試し読み","미리 읽기"], scoutHelp:["次に触れた一手を打つ前に試す。","다음에 누른 한 수를 두기 전에 시험해요."],
    lit:["光の輪は目標の石の呼吸点。","빛나는 고리는 목표 돌의 활로예요."],
    rewound:["ひとつ前の黒番に戻った。","직전 흑 차례로 돌아왔어요."],
    scouting:["調べたい空き交点を選ぼう。","시험해 볼 빈 교차점을 고르세요."],
    scoutGood:["この手なら目標に届く。実際に打ってみよう。","이 수로 목표에 닿을 수 있어요. 직접 두어 보세요."],
    scoutBad:["この手では届かない。別の手を考えよう。","이 수로는 목표에 닿지 못해요. 다른 수를 생각해 보세요."],
    usedSkill:["使用済み","사용함"]
  };
  const skills=[["breath",1],["rewind",5],["scout",20]];
  const rankOf=id=>Math.floor(id/rankSize);
  const numberOf=id=>id%rankSize+1;
  function species(id) {
    const rank=rankOf(id),local=id%20,offset=[0,12,24,37][rank];
    const encounter=local-(local>=10?1:0);
    return offset+encounter%names[rank].length;
  }
  function route(id) { return (rankOf(id)+Math.floor((numberOf(id)-1)/5))%paths.length; }
  // Each edited three-move position has four starting liberties and exactly one winning first move.
  const gates=[[0,38,[37,29]],[3,39,[38]],[6,31,[22]],[9,30,[21]],[12,39,[38]],[15,48,[]],[18,49,[]],[21,31,[22]],[24,39,[]],[27,58,[67]],[30,39,[38]],[33,39,[38]],[36,31,[22]],[39,30,[21]],[42,39,[38]],[45,39,[38]],[48,31,[22]],[51,41,[42]],[54,50,[51]],[57,50,[59]],[60,48,[57]],[63,39,[38]],[66,41,[42]],[69,39,[38]],[72,41,[42]],[75,38,[37]],[78,39,[]],[81,30,[]],[84,42,[43,51]],[87,38,[37]],[90,32,[33]],[93,49,[58]]];
  function narrowGate(number,getExercise){
    const [seed,opening,walls]=gates[number];
    const mission=getExercise(6,seed),board=mission.board.slice();
    board[opening]=0;
    for(const p of walls)board[p]=1;
    return {...mission,board,turns:4};
  }
  const studyHints={
    joinCut:["黒の継ぎ目に注目。そこに打つと呼吸点がなくなる白はどれ？","흑의 이음점을 보세요. 거기에 두면 마지막 활로를 잃는 백돌이 있나요?"],
    joinSave:["味方どうしがつながると、両方の呼吸点を使えるよ。","아군 두 무리가 이어지면 양쪽 활로를 함께 쓸 수 있어요."],
    joinThreat:["黒をつなぐ候補の隣で、白の呼吸点を数えよう。","흑의 이음점 후보 옆에서 백의 활로도 세어 보세요."],
    escapeTake:["逃げる前に、隣の白もアタリか調べよう。取った跡は黒の呼吸点だよ。","뻗기 전에 이웃 백도 단수인지 보세요. 백을 따낸 자리가 흑의 활로가 돼요."],
    escapeJoin:["ただ一つの逃げ口の向こうに、味方の黒がいないかな？","하나 남은 탈출구 너머에 아군 흑돌이 있는지 보세요."],
    doubleAtari:["白二組の呼吸点が重なる場所を探そう。一手で両アタリになるよ。","두 백 무리의 활로가 겹치는 곳을 찾으세요. 한 수로 양단수가 돼요."],
    decoy:["取れる白が二か所。石の数より、印の白とつながっているかを確かめよう。","두 곳에서 백을 잡을 수 있어요. 돌 수보다 표시된 백 무리에 붙어 있는지 확인하세요."],
    reading2:["先手のアタリ。白が逃げた後にも、最後の呼吸点をふさげるかな？","선수로 단수를 걸어 보세요. 백이 뻗은 뒤에도 마지막 활로를 막을 수 있나요?"],
    readingAlt:["左右の決め打ちは不要。白が逃げた先で、次の取り方を読み直そう。","처음 몰아가는 방향은 둘 다 가능해요. 백이 뻗은 곳을 보고 다음 따낼 수를 읽으세요."],
    readingEdge:["線の外には逃げられないよ。辺に沿うノビにも手が続く方から追おう。","판 밖은 활로가 아니에요. 백이 변을 따라 뻗어도 다음 수가 이어지는 쪽부터 모세요."],
    reading3:["すぐにはアタリにできないね。白が一番広く逃げる道から先に読もう。","첫 수로 곧장 단수를 만들 수 없어요. 백이 가장 넓게 달아나는 길부터 읽으세요."]
  };
  function studyHint(mission,remaining=mission.turns){
    if(!mission.studyPattern)return null;
    if(remaining===1&&mission.turns>1)return ["逃げた白の一団を見直そう。最後の呼吸点はどこ？","백이 뻗은 뒤의 무리를 다시 보세요. 마지막 활로가 어디인가요?"];
    return studyHints[mission.studyPattern];
  }
  const studyPrompts={
    joinCut:["白を取り、印の黒どうしの切れ目をつなごう。","백을 따내며 표시된 흑 무리의 끊어진 곳을 이으세요."],
    joinSave:["アタリの黒を、もう一つの印の黒につなごう。","단수에 몰린 흑을 다른 표시된 흑과 이으세요."],
    joinThreat:["印の黒をつなごう。白もアタリにできるかな？","표시된 흑을 이으세요. 백도 함께 단수에 몰 수 있을까요?"],
    escapeTake:["黒がアタリ。白を取って呼吸点を三つ以上にしよう。","흑이 단수예요. 백을 따내 흑의 활로를 셋 이상 만드세요."],
    escapeJoin:["アタリの黒を味方につなぎ、呼吸点を三つ以上にしよう。","단수인 흑을 아군과 이어 활로를 셋 이상 확보하세요."],
    doubleAtari:["印の白をアタリに。両アタリも狙えるよ。","표시된 백을 단수에 모세요. 양단수도 노릴 수 있어요."],
    decoy:["ほかの白に惑わされず、印のある白の一団を取ろう。","다른 백돌에 눈을 돌리지 말고 표시된 백 무리를 따내세요."],
    reading2:["白が逃げても、黒二手以内で印の白を取ろう。","백이 달아나도 흑 두 수 안에 표시된 백을 따내세요."],
    readingAlt:["追い方は一つじゃない。黒二手以内で印の白を取ろう。","몰아가는 길이 둘이에요. 흑 두 수 안에 표시된 백을 따내세요."],
    readingEdge:["盤端から逃がさず、黒二手以内で印の白を取ろう。","가장자리에서 빠져나가지 못하게 흑 두 수 안에 표시된 백을 따내세요."],
    reading3:["白がどう逃げるか読み、黒三手以内で印の白を取ろう。","백이 어디로 달아날지 읽고 흑 세 수 안에 표시된 백을 따내세요."]
  };
  // Patterns are fixed per site. Empty entries retain the original board.
  const studyLessons=[
    [null,["joinSave",0,0,"Bo../.Bxx/..x./.xx."],["reading2",2,2,"xx/.W/xx"]],
    [["joinCut",5,6,"Bxx./xo../oBxx"],["escapeJoin",0,2,".x/Bo/o."],["readingAlt",2,5,"xx../.Wx./x.xo"]],
    [["escapeJoin",1,7,".o../oB.x"],["joinThreat",3,2,"Bx./o../Bxx"],["reading2",5,1,".x./xW./xox/x../.xx"]],
    [["doubleAtari",1,6,"..x/xxo/.W."],["escapeTake",1,0,"xoB./xoxo/..o."],["readingEdge",6,0,"xW"]],
    [["reading2",1,1,"x.x/xWx/x../.o."],["joinSave",5,3,"Bxx./x.oB/...o"],["readingAlt",4,3,".xx/xW./x.x/..x"],["doubleAtari",0,4,".Wx/oxx"]],
    [["joinSave",4,0,"..Bx/oBo./.o.."],["escapeTake",4,0,"oBo./.xox/.ox."],["reading2",6,1,"x.x/.Wx/.xx"]],
    [["escapeTake",0,2,"o../Bxo/oo./xx."],["joinCut",4,4,"...x./BxxoB/x.x.x"],["readingAlt",1,0,".x./x../.Wx/xx."]],
    [["doubleAtari",4,6,".x.../xW.ox/...x."],["escapeJoin",0,0,"B./ox/.x"],["readingEdge",3,0,".Wx/xox/..x"]],
    [["readingEdge",0,3,"xx./W.x"],["joinThreat",2,6,"..B/B.x/xo."],["reading2",3,3,"..xx/..W./x.xx"]],
    [["joinCut",2,7,".B.B/xxox"],["escapeTake",4,0,".xo./xoox/oBxo/..o."],["reading2",1,4,"xWxo/..x./.x.."],["doubleAtari",2,1,".x./xW./..o/.ox/.x."],["readingAlt",3,0,"x../xWx/x../.x./.o."]],
    [["escapeJoin",3,5,"x../oBo/.o."],["joinSave",2,6,".B./.../oBo"],["readingEdge",5,8,"xxW"]],
    [["doubleAtari",0,6,".Wx/oxo"],["escapeTake",3,1,".xo./xoBo/.ox./.xo."],["reading2",3,1,"x.x/xWx/..o"]],
    [["readingAlt",4,2,"xxx/.W./xxx"],["joinCut",2,5,".B./.xx/xo./.Bx"],["readingEdge",1,5,".o./.o./..x/xW."]],
    [["joinThreat",0,3,"o.Bx/Bxo./.x.."],["escapeJoin",4,6,"x.o/oBo/.o."],["reading2",5,2,".x../xWox/x.x."]],
    [["escapeTake",0,0,"Bx/oo/ox/ox/x."],["joinSave",2,2,"Bx.o/.oBo/..o."],["reading3",2,4,"x.x/.Wx/xox"],["doubleAtari",3,0,".Wx/.../xo./.x."]],
    [["doubleAtari",6,5,".x/.W/ox/x."],["escapeTake",1,6,".xxo/.oox/oBx."],["readingAlt",5,1,"..x/xxW/.xo/..x"]],
    [["reading3",4,0,".x/Wx/.x/x."],["joinCut",0,3,"..x../.BoB./xx.xx/.oxx."],["readingEdge",4,0,".Wx/.ox/ox."]],
    [["joinSave",6,2,"B../xx./xxo/..B/..o"],["escapeJoin",2,3,".o./.Bo/xox"],["reading3",6,0,".Wo/xoo"]],
    [["escapeTake",2,5,".x../xo../oBox/..x."],["joinCut",1,3,".x../xoBo/xo.B/.x.x"],["reading3",0,1,"W.x/ox./.x."]],
    [["doubleAtari",5,4,"x../W../xox"],["escapeTake",0,0,"o../Box/.x./o.o"],["reading2",3,6,".oxx/..W./x.xx"],["doubleAtari",3,3,"x./ox/.W/ox"],["reading3",5,5,"x.Wx/.xo./..xx"]]
  ];
  function studyPosition(entry,kind){
    const [studyPattern,left,top,diagram]=entry,board=Array(81).fill(0),targets=[];
    diagram.split("/").forEach((row,y)=>[...row].forEach((stone,x)=>{
      const p=(top+y)*9+left+x;
      if(stone==="B"||stone==="W")targets.push(p);
      if(stone!==".")board[p]=stone==="B"||stone==="x"?1:2;
    }));
    const turns=studyPattern==="reading3"?3:studyPattern.startsWith("reading")?2:1;
    return {kind,turns,board,targets,studyPattern,studyPrompt:studyPrompts[studyPattern].slice()};
  }
  function stage(id,getExercise,previousEdition=false) {
    const rank=rankOf(id), n=numberOf(id);
    const length=n%10===0?5:n%5===0?4:3;
    const practical=[1,2,3,4][id%4];
    const tactics=rank===0 ? [1,2,3,4,1] : rank===1 ? [practical,2+(id%2),5,4,5]
      : rank===2 ? [practical,5,6,3,6] : [practical,6,7,5,7];
    const phases=Array.from({length},(_,p)=>{
      if(id===9){
        if(p===2){
          const board=Array(81).fill(0);[31,39,41,1,9,11].forEach(q=>board[q]=1);board[40]=board[10]=2;
          return {kind:"capture",board,turns:1,targets:[40],guardian:true};
        }
        if(p===0){
          const board=Array(81).fill(0);board[40]=board[50]=1;board[30]=board[60]=2;
          return {kind:"link",board,turns:1,targets:[40,50],guardian:true};
        }
        if(p===1)return {...getExercise(5,0),kind:"atari",turns:1,guardian:true};
        return {...getExercise(p===3?3:5,id*5+p),guardian:true};
      }
      if(id===0) return getExercise(0,p);
      if(id===2)return getExercise([0,2,3][p],[3,11,12][p]); // Tie the ferry rope, then free its crew.
      if(id===4)return getExercise([1,4,5,5][p],[20,21,22,23][p]); // An open span invites a white reply.
      let course=rank===0?tracks[0][(id+p)%5]:tactics[p];
      if(id===1) course=p<2?1:2;
      if(rank===0 && n>=16 && p===length-1) course=5;
      if(rank===1 && n===20 && p===length-1) course=6;
      if(rank===2 && n===20 && p===length-1) course=7;
      if(rank===3 && course===7)return narrowGate(p===2?n-1:20+Math.floor(n/10),getExercise);
      const entry=rank===1&&!previousEdition&&studyLessons[n-1][p];
      if(entry)return studyPosition(entry,["liberty","capture","link","escape","atari","read","read","read"][course]);
      return getExercise(course,id*5+p);
    });
    return {enemy:route(id),species:species(id),phases};
  }
  const reviewKinds=["liberty","capture","link","escape","atari","read"];
  function review(kind,serial,rank,getExercise){
    const course={liberty:4,capture:1,link:2,escape:3,atari:4,read:Math.min(7,5+rank)}[kind];
    const problem=getExercise(course,(kind==="liberty"?800:950)+serial);
    return kind==="liberty"?{...problem,kind}:problem;
  }
  function drawRoad(ctx,w,h,path,progress) {
    const ground=h*.84, scroll=progress*w*.85;
    ctx.fillStyle=["#6f624b","#5e4637","#52516a","#797787"][path];
    ctx.fillRect(0,ground,w,h-ground);
    for(let i=0;i<15;i++){
      const x=(i*83-scroll)%(w+120);
      ctx.fillStyle=path===1?"#d0aa73":"#b5a98c";
      if(path===1){
        ctx.fillRect(x,ground,5,h*.16);ctx.fillRect(x,ground-28,5,28);
        ctx.fillRect(x,ground-23,83,3);
      }else if(path===2){
        ctx.fillStyle="#8ed5d9";ctx.fillRect(x,ground-13,5,15);ctx.fillRect(x+5,ground-6,4,8);
      }else if(path===3){
        ctx.fillStyle="#d8cfdd";ctx.fillRect(x,ground+6,20,3);ctx.fillRect(x+8,ground+3,6,3);
      }else{
        ctx.fillRect(x,ground+8+(i%3)*4,12,3);
        ctx.fillStyle="#88ac69";ctx.fillRect(x+36,ground-6,3,7);
      }
    }
  }
  return {ranks,regions,paths,names,words,skills,palettes,studyHint,rankSize,total,rankOf,numberOf,species,route,stage,reviewKinds,review,narrowGate,drawRoad};
})();
