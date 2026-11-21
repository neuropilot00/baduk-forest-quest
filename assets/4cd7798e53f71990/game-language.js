"use strict";
// English and Simplified Chinese are available for terminology review. Only the
// two finished story locales are selectable or loaded from a player save.
const GameLanguage=(()=>{
  const selectable=Object.freeze(["ja","ko"]),languages=Object.freeze(["ja","ko","en","zh-Hans"]);
  const menu={
    home:["冒険メニュー","모험 메뉴","Adventure menu","冒险菜单"],
    party:["遠征隊","원정대","Expedition party","远征队"],
    practice:["稽古と挑戦","바둑 연습과 도전","Practice and challenges","练习与挑战"],
    records:["記録","기록","Records","记录"],
    library:["図鑑","도감","Field guide","图鉴"],
    back:["戻る","뒤로","Back","返回"],
    regions:["地方を選ぶ","지역 선택","Choose a region","选择地区"],
    courses:["対局を選ぶ","대국 선택","Choose a match","选择对局"],
    backup:["進行のバックアップ","진행 백업","Back up progress","备份进度"],
    settings:["基本設定","기본 설정","General settings","基本设置"],
    menu:["メニュー","메뉴","Menu","菜单"]
  };
  const ui={
    training:["囲碁の練習","바둑 훈련","Go practice","围棋练习"],
    liberty:["呼吸点","활로 찾기","Liberties","数气"],
    atari:["アタリ","단수","Atari","打吃"],
    capture:["捕獲の術","포획술","Capture","提子术"],
    link:["連結の術","연결술","Connect","连接术"],
    escape:["救出の術","구출술","Rescue","救援术"],
    read:["先読み","수읽기","Read ahead","推演变化"],
    hint:["ヒント","힌트","Hint","提示"],
    retry:["再挑戦","다시 도전","Try again","再次挑战"],
    cleared:["クリア","완료","Cleared","已通关"],
    locked:["未解放","잠김","Locked","未解锁"],
    available:["挑戦","도전","Challenge","挑战"],
    goalCapture:["印のついた白石を取ろう。","표시된 백돌을 잡으세요.","Capture the marked white stones.","提掉标记的白棋。"],
    goalLink:["印のついた黒石をつなごう。","표시된 흑돌을 한 무리로 연결하세요.","Connect the marked black stones.","把标记的黑棋连成一块。"],
    goalEscape:["印のついた黒石の呼吸点を3つ以上にしよう。","표시된 흑돌에 활로를 3개 이상 만드세요.","Give the marked black group at least three liberties.","让标记的黑棋至少有三口气。"],
    goalRead:["白の応手を読んで、黒{0}手以内に白石を取ろう。","백의 응수를 읽고 흑 {0}수 안에 백돌을 잡으세요.","Read White’s replies. Capture with at most {0} black moves.","算清白棋的应对，黑棋须在 {0} 手以内提子。"],
    goalAtari:["印のついた白石の呼吸点をひとつにしよう。","표시된 백돌 무리의 활로를 하나만 남기세요.","Leave the marked white group with one liberty.","让标记的白棋只剩一口气。"]
  };
  const campaign={
    "backupTitle":["進み具合のバックアップ","진행 기록 백업","Back up progress","备份进度"],
    "backupHelp":["コードを保存しておけば、別の端末でも続きから遊べます。","코드를 저장해 두면 다른 기기에서도 이어 할 수 있어요.","Keep this code to continue on another device.","保存此代码，即可在其他设备上继续游玩。"],
    "backupLabel":["バックアップコード","백업 코드","Backup code","备份代码"],
    "copyBackup":["コードをコピー","코드 복사","Copy code","复制代码"],
    "closeBackup":["閉じる","닫기","Close","关闭"],
    "restoreBackup":["コードを読み込む","코드 불러오기","Restore from code","从代码恢复"],
    "copied":["コードをコピーしました。","코드를 복사했어요.","Code copied.","已复制代码。"],
    "selectCode":["選択されたコードをコピーしてください。","선택된 코드를 복사하세요.","Copy the selected code.","请复制已选中的代码。"],
    "restored":["進み具合を引き継ぎました。","진행 기록을 불러왔어요.","Progress restored.","已恢复进度。"],
    "badBackup":["バックアップコードを確認してください。","백업 코드가 올바른지 확인해 주세요.","Check the backup code.","请检查备份代码。"],
    "goalLiberty":["白石に上下左右で接する空き交点に打とう。","백돌 무리의 상하좌우에 붙은 빈 교차점에 두세요.","Play on an empty point directly next to the white group.","在与白棋棋块上下左右相邻的空交叉点落子。"],
    "boardLabel":["碁盤","바둑판","Go board","棋盘"],
    "blackStone":["黒石","흑돌","Black stone","黑子"],
    "whiteStone":["白石","백돌","White stone","白子"],
    "reach.enter":["現地へ入る","현장에 들어가기","Enter the site","进入地点"],
    "map.travel":["ここへ進む","이곳으로 이동","Travel here","前往此处"],
    "reach.map":["星水の地図","별물 나루 지도","Starwater Ferry map","星水渡口地图"],
    "reach.road":["本街道へ戻る","본 원정길로","Return to the main road","返回主路"],
    "reach.select":["場所を選ぶ","장소 선택","Choose a site","选择地点"],
    "reach.closed":["通行止め","길이 막혀 있음","Road closed","道路封闭"],
    "reach.arrive":["到着する","도착하기","Finish walking","抵达"],
    "reach.route":["この岸を調べる","이 강가 살펴보기","Explore this bank","勘察这侧河岸"],
    "reach.revisit":["現地を訪ねる","현장 다시 보기","Revisit the site","重访地点"],
    "reach.join":["跳ね橋で合流する","도개교에서 합류하기","Meet at the drawbridge","在吊桥会合"],
    "reach.sealed":["永久封鎖","영구 봉쇄","Permanently closed","永久封闭"],
    "reach.sealedReason":["もう片方を選んだため、この道は永久に閉ざされた。","다른 길을 선택해 이 길은 영구히 봉쇄됐다.","Your choice has permanently closed this route.","你已选择另一条路线，此路永久封闭。"],
    "reach.beforeChoice":["現地で決めると、もう一方は永久に閉じる。","현장에서 확정하면 반대 길은 영구히 닫힌다.","Confirm at the site to permanently close the other route.","在现场确认后，另一条路线将永久封闭。"],
    "fork.choose":["この道に決める","이 길로 확정","Commit to this route","确定此路线"],
    "fork.rejoin":["合流点へ","합류 지점으로","To the meeting point","前往会合处"],
    "fork.reply":["白の応手へ","백 응수로","See White’s reply","查看白棋应手"],
    "fork.reset":["打ち直す","다시 두기","Try the move again","重新落子"],
    "fork.bridge":["避難桟橋","끊긴 피난교","Broken Evacuation Pier","断裂的避难栈桥"],
    "fork.gate":["東の放水戸","동쪽 배수문","East Sluice","东侧泄水闸"],
    "fork.rope":["救助綱","구조 밧줄","Rescue rope","救援绳"],
    "fork.latch":["青銅の留め金","청동 빗장","Bronze latch","青铜门闩"],
    "fork.back":["地図へ戻る","지도로 돌아가기","Return to the map","返回地图"],
    "outer.chart":["流域図","유역 지도","Watershed map","流域地图"],
    "outer.visit":["この地方へ","이 지역으로","Enter this region","进入此区域"],
    "outer.sealed":["この便では閉鎖","이 원정에서 닫힌 길","Closed on this journey","本次旅程中已关闭"],
    "outer.ferry":["星水の渡しへ","별물 나루로","Return to Starwater Ferry","返回星水渡口"],
    "outer.back":["流域図へ","유역 지도로","Back to the watershed map","返回流域地图"],
    "outer.ridge":["山の観測嶺","산악 관측령","Mountain Observation Ridge","山地观测岭"],
    "outer.glass":["硝子火山の都","화산 유리도시","Volcanic Glass City","火山琉璃城"],
    "outer.stars":["潮の天文台","조석 천문대","Tidal Observatory","潮汐天文台"],
    "rite.open":["奥義 · 3問","필살기 · 3문제","Finisher · 3 puzzles","必杀技 · 3 题"],
    "rite.name":["暁の三連星","새벽의 삼연성","Three Stars of Dawn","拂晓三星"],
    "rite.rule":["十五秒。三つの正着で、暁の鐘を鳴らせ。","15초, 세 번의 정답으로 새벽종을 울려라.","Find three correct moves in 15 seconds to ring the dawn bell.","在 15 秒内走出三步正着，敲响晨钟。"],
    "rite.close":["戦闘に戻る","전투로 돌아가기","Return to battle","返回战斗"],
    "rite.success":["奥義発動","필살기 발동","Finisher triggered","必杀技发动"],
    "rite.wrong":["不発","발동 실패","Finisher failed","发动失败"],
    "rite.timeUp":["時間切れ","시간 종료","Time expired","时间到"],
    "rite.win":["暁の鐘が響く","새벽종이 울린다","The dawn bell rings.","晨钟响起。"],
    "rite.capture":["印の白石を取る","표시한 백돌 따내기","Capture the marked white stones","提掉标记的白子"],
    "rite.link":["印の黒石をつなぐ","표시한 흑돌 연결","Connect the marked black stones","连起标记的黑子"],
    "rite.atari":["印の白石をアタリに","표시한 백돌 단수","Put the marked white stones in atari","打吃标记的白棋"],
    "rite.empty":["空点","빈 점","Empty point","空点"],
    "slot.title":["旅の記録","여행 슬롯","Journey slots","旅程存档位"],
    "slot.active":["プレイ中","플레이 중","Current journey","当前旅程"],
    "slot.empty":["新しい旅","새 원정","New expedition","新远征"],
    "fork.forecloses":["こちらへ進むと「{0}」はこの記録では永久に閉じます。","이 길을 선택하면 ‘{0}’은 이 저장에서 영구히 닫힙니다.","Choosing this route permanently closes {0} in this journey.","选择此路后，{0}将在本次旅程中永久关闭。"],
    "format.moves":["黒{0}手以内","흑 {0}수 이내","Within {0} Black moves","黑棋 {0} 手以内"],
    "format.seconds":["{0}秒","{0}초","{0}s","{0}秒"],
    "format.komi":["コミ {0}目","덤 {0}집","Komi: {0} points","贴 {0} 目"],
    "term.ko":["コウ","패","Ko","劫"],
    "term.pass":["パス","패스","Pass","停一手"],
    "term.area":["面積計算","면적 계가","Area scoring","面积计分"],
    "term.liberty":["呼吸点","활로","Liberty","气"],
    "term.atari":["アタリ","단수","Atari","打吃"],
    "term.capture":["取り","따내기","Capture","提子"],
    "term.connect":["ツギ","이음","Connection","连接"],
    "term.komi":["コミ","덤","Komi","贴目"],
    "term.read":["読み","수읽기","Reading","计算变化"]
  };
  // Existing two-language map data can migrate one string at a time. An
  // untranslated story still uses the released-language fallback.
  const byPair=new Map();
  for(const [key,[ja,ko]] of Object.entries(campaign)){
    if(!byPair.has(ja))byPair.set(ja,new Map());
    byPair.get(ja).set(ko,key);
  }
  const value=(key,tag)=>campaign[key]?.[languages.indexOf(tag)];
  function format(key,tag,...args){
    let template=value(key,tag);
    if(tag==="en"&&args[0]===1){
      if(key==="format.moves")template="Within {0} Black move";
      if(key==="format.komi")template="Komi: {0} point";
    }
    return template?.replace(/\{(\d+)\}/g,(_,n)=>{
      const arg=args[Number(n)];
      return typeof arg==="number"&&Number.isFinite(arg)?new Intl.NumberFormat(tag).format(arg):String(arg??"");
    });
  }
  function date(iso,tag){
    if(!languages.includes(tag)||!/^\d{4}-\d{2}-\d{2}$/.test(iso))return undefined;
    const day=new Date(iso+"T12:00:00Z");
    if(!Number.isFinite(+day)||day.toISOString().slice(0,10)!==iso)return undefined;
    return new Intl.DateTimeFormat(tag,{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}).format(day);
  }
  const released=tag=>selectable.includes(tag)?tag:"ja";
  const next=tag=>selectable[(selectable.indexOf(released(tag))+1)%selectable.length];
  const pair=(strings,tag)=>value(byPair.get(strings[0])?.get(strings[1]),tag)??strings[selectable.indexOf(released(tag))];
  const get=(table,key,tag)=>Object.hasOwn(table,key)?table[key][languages.indexOf(tag)]:undefined;
  return Object.freeze({languages,selectable,released,next,pair,
    menu:(key,tag)=>get(menu,key,tag),ui:(key,tag)=>get(ui,key,tag)??value(key,tag),format,date,
    campaignKeys:Object.freeze(Object.keys(campaign)),
    menuKeys:Object.freeze(Object.keys(menu)),uiKeys:Object.freeze(Object.keys(ui))});
})();
