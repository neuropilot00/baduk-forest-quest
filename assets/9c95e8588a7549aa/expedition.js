"use strict";

// The campaign references immutable v4 exercise positions without advancing training.
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
  function stage(id, getExercise) {
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
  return {ranks,regions,paths,names,words,skills,palettes,rankSize,total,rankOf,numberOf,species,route,stage,reviewKinds,review,narrowGate,drawRoad};
})();
