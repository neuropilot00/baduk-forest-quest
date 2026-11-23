"use strict";
const ReachMap=(()=>{
  const pair=(ja,ko)=>[ja,ko];
  const area=pair("星水の渡し","별물 나루");
  const forkDeparture=[
    [pair("舟守さん、綱はここで結べたね。板はまだ濡れてる。最後の人が渡るまで、私は舟を押さえてるよ。","사공님, 여기 밧줄 묶였어요. 널은 아직 젖어 있어요. 마지막 사람이 건널 때까지 제가 배를 잡고 있을게요."),
      pair("南の石段で鎧が鳴った。甲将があっちへ回ったみたい。助けた舟はここに残して、ぼくらは乾いた道から行こう。","남쪽 돌계단에서 갑옷 소리가 났어. 갑장이 저쪽으로 돌아갔나 봐. 구한 배는 여기 두고, 우린 마른 길로 가자.")],
    [pair("戸が開いた。押し戻されなくなったよ。……西の桟橋、まだ誰も戻ってない。帰れるかどうか、確かめてから手紙に書こう。","문이 열렸어. 이제 물에 밀려나진 않겠어. …서쪽 잔교엔 아직 아무도 안 돌아왔네. 돌아올 수 있는지 확인하고 나서 편지에 쓰자."),
      pair("北の灯だけついたよ。南の灯は返らない。水が落ち着いても、あの灯がつくまで舟を出さないように言ってくる。","북쪽 등만 켜졌어. 남쪽 등은 아직 답이 없어. 물이 잦아들어도 그 불이 들어오기 전엔 배를 띄우지 말라고 전할게.")]
  ];
  // These conversations describe what happened on the walk after a cleared site.
  const travelDialogue={
    2:[
      pair("よし、車輪が回る。割れた板は脇に寄せよう。帰りに誰かが踏んだら困るからね。","됐다, 바퀴가 돌아가. 갈라진 널은 옆으로 치우자. 돌아오는 길에 누가 또 밟으면 안 되잖아."),
      pair("右の足場、もう水の中だよ。白い杭のほうなら渡れそう。あの雁の風見の下で待ってるね。","오른쪽 발판은 벌써 물에 잠겼어. 하얀 말뚝 쪽으로는 건널 수 있겠어. 저 기러기 풍향계 밑에서 기다릴게.")
    ],
    3:[
      pair("縄が翼に食い込んでたんだ。抜いたら、あの雁は南を向いた。舟の音もそっちからする。","줄이 날개에 박혀 있었네. 빼니까 기러기가 남쪽을 보잖아. 뱃소리도 저쪽에서 나."),
      pair("待った、その網は真ん中を切ると櫂に絡むよ。端の輪を外しておくれ。あとは私が巻くから。","잠깐, 그물 가운데를 자르면 노에 감겨. 끝 고리만 빼 주렴. 나머진 내가 감을게.")
    ],
    4:[
      pair("網が上がった。これで小舟が通れる。……向こうの浅瀬で手を振ってる。あの赤い舟、動いてないよ。","그물이 올라갔어. 이제 작은 배가 지나갈 수 있어. …저쪽 여울에서 손을 흔들고 있어. 저 빨간 배가 꼼짝 안 해."),
      pair("底がつっかえて、櫂も一本折れた！　舟を沖へ向けてくれれば、残りの一本で漕げる。","배 밑이 걸렸어. 노도 하나 부러졌고! 뱃머리만 바깥 물길로 돌려 주면 남은 노로 저을 수 있어.")
    ],
    5:[
      pair("舟が浮いた！　今なら自分で漕げそうだね。赤い舟の先に、葦の筏が二つ見える。","배가 떴어! 이제 혼자 노를 저을 수 있겠네. 빨간 배 너머로 갈대 뗏목 두 척이 보여."),
      pair("二人とも、手を離さないで。赤い綱の端を渡すね。片方ずつ引くから、私が呼んだら返事して。","두 분 다 손 놓지 마세요. 빨간 줄 끝을 건넬게요. 한 분씩 끌어당길 거니까 제가 부르면 대답해 주세요.")
    ],
    6:[
      pair("二人とも、息を合わせて。その赤い結び目で筏がつながったら、残りの人にも手を貸せるよ。","두 분, 힘을 맞춰 주세요. 빨간 매듭으로 뗏목을 이으면 나머지 사람들도 도울 수 있어요."),
      pair("白い流木が来るよ。あのまま左へ抜けると下の舟にぶつかる。葦戸で左を閉めておくれ。","하얀 통나무가 떠내려온다. 저대로 왼쪽으로 빠지면 아래쪽 배에 부딪혀. 갈대문으로 왼쪽을 막아 주렴.")
    ],
    7:[
      pair("流木が溜まりに入った。ちょっと水が引いたね。検札小屋の下に、前は見えなかった鎖が二本ある。","통나무가 옆 웅덩이로 들어갔어. 물이 조금 빠졌네. 검표소 밑에 아까는 안 보이던 사슬이 두 줄 있어."),
      pair("鎖、見た目はそっくり。でも青い札のほうだけ、舟の人がじっと見てる。引く前に確かめよう。","사슬이 똑같이 생겼어. 그런데 배에 탄 사람들이 파란 표 쪽만 보고 있어. 당기기 전에 확인하자.")
    ],
    9:[
      pair("甲将が分銅を外した。橋が両側から下りてくるね。合図が来るまで、舟はまだ待ってもらおう。","갑장이 추를 뺐어. 다리가 양쪽에서 내려오고 있어. 신호가 올 때까지 배는 잠깐 기다려 달라고 하자."),
      pair("潮が引いて、内側に一段出てきた。手で先に確かめるね。石が滑るから、私の足跡を踏んで。","물이 빠져서 안쪽에 한 단이 나왔어. 내가 손으로 먼저 짚어 볼게. 돌이 미끄러우니 내 발자국을 밟고 와.")
    ],
    10:[
      pair("足場を掛けたよ。ここの泥を払えば、潮の跡が見える。いちばん下の線から、細い樋が続いてる。","발판을 걸었어. 이 진흙을 닦으니 물이 찼던 자국이 보여. 맨 아래 줄에서 좁은 홈통이 이어져."),
      pair("表の格子は錆びついてる。灯りを次の曲がりに向けて。水音が返ってくるから、まだ先があるはずだ。","앞쪽 격자는 녹슬어서 안 열려. 모퉁이 너머로 불을 비춰 줘. 물소리가 돌아오는 걸 보니 길이 더 있겠어.")
    ],
    11:[
      pair("水が通った！　倉の下から包みが二つ出てきたよ。長いほう、流される前に引っかけて。","물이 통해! 창고 밑에서 꾸러미 두 개가 나왔어. 긴 쪽부터 떠내려가기 전에 걸어 줘."),
      pair("小袋は持つとじゃりじゃりする。塩だね。長い方には鐘の留め具があるよ。こっちは手でほどこう。","작은 자루는 들면 사각거려. 소금이야. 긴 꾸러미엔 종 모양 고리가 달렸어. 이건 손으로 풀어 보자.")
    ],
    12:[
      pair("油布のおかげで、中はまだ乾いてる。これ、星の並びだね。二枚の鏡まで描いてある。","기름 먹인 천 덕분에 속은 아직 말라 있어. 이건 별자리잖아. 거울도 두 개 그려져 있네."),
      pair("あの庭だ。左の鏡は空を映してる。右は水面だね。どっちを動かされても、向こうに光を返せるようにしよう。","저 정원이야. 왼쪽 거울은 하늘을 비추고, 오른쪽은 물을 비춰. 어느 쪽을 건드려도 건너편에 빛을 보낼 수 있게 하자.")
    ],
    13:[
      pair("鏡を二枚とも起こした。光がちゃんと向こうの浮標に届いてる。あの明かりの手前で、綱が切れてるのが見えるね。","거울 두 개를 다 세웠어. 빛이 건너편 부표까지 닿았네. 불빛 바로 앞에 끊어진 줄이 보여."),
      pair("横の綱に縦を重ねてごらん。波に引かれるたびに締まる所で結ぶよ。流れが戻っても、これなら持つ。","가로줄 위에 세로줄을 얹어 보렴. 파도가 당길 때 더 조이는 자리에서 묶는 거야. 물살이 돌아와도 이러면 버텨.")
    ],
    14:[
      pair("四つの灯りが並んだ。最後の灯りの先に家の屋根が見える。人が残ってないか、見にいこう。","등불 네 개가 한 줄로 섰어. 마지막 불 너머에 집 지붕이 보여. 남아 있는 사람이 있는지 가 보자."),
      pair("あそこの人にも聞こえるかな。屋根に梯子を掛けるから、こっちが手を上げるまで瓦の上で待ってて！","저쪽 분한테도 들리려나? 지붕에 사다리를 걸 테니까, 내가 손을 들 때까지 기와 위에서 기다려 주세요!")
    ],
    15:[
      pair("梯子を渡れたね。上がった人が、次の人に手を伸ばしてくれた。私たちはあっちの水門を見てくるよ。","사다리를 건넜네. 먼저 올라간 분이 다음 분한테 손을 내밀어 줬어. 우린 저쪽 수문을 보고 올게."),
      pair("こっちは泥が詰まって、何も聞こえない。隣の戸の下で水が鳴ってるよ。そっちならまだ動くかも。","이쪽은 진흙이 꽉 차서 아무 소리도 안 나. 옆 문 아래에선 물소리가 들려. 저쪽은 아직 움직일지도 몰라.")
    ],
    16:[
      pair("戸が上がったよ。水面から出てきた杭、どれも同じ方を向いてる。あの桟橋まで行けそう？","문이 올라갔어. 물 위로 나온 말뚝이 전부 같은 쪽을 향하네. 저 잔교까지 갈 수 있겠어요?"),
      pair("行けるよ。泡が杭の左を回るか、右を回るか見てて。桟橋が向きを変えるのはそのあとだ。","갈 수 있어. 물거품이 말뚝 왼쪽으로 도는지 오른쪽으로 도는지 봐 줘. 잔교가 방향을 바꾸는 건 그다음이야.")
    ],
    17:[
      pair("桟橋が石段に届いた。もう一度ずれないように、ここの穴に留め木を差すね。段を上がるのはそれから。","잔교가 돌계단에 닿았어. 다시 어긋나지 않게 여기 구멍에 고정목을 끼울게. 계단은 그다음에 오르자."),
      pair("留め石が三つだ。動かす順を間違えると、さっき引いた水が塔に戻る。先にこの溝のつながりを見よう。","빗장돌이 세 개야. 순서를 틀리면 방금 빠진 물이 탑으로 들어올 거야. 먼저 홈이 어떻게 이어지는지 보자.")
    ],
    18:[
      pair("石が横にずれたね。鎖が出てる。重いな……引く前に、向こう側の結び目も見せて。","돌이 옆으로 밀렸어. 사슬이 나왔네. 무겁다… 당기기 전에 저쪽에 묶인 곳도 보여 줘."),
      pair("その鎖に手を掛ける者よ。水面の仲間を岸まで返せるか。鐘に触れるのは、全員の足が地に着いてからだ。","그 사슬에 손을 댄 자여. 물 위의 동료를 강가까지 데려갈 수 있느냐? 모두 땅에 발을 디딘 뒤에 종을 만져라.")
    ],
  };
  const entry=(name,before,goal,after,clue)=>({name,before,goal,after,clue});
  const events=[
    entry(pair("西便の旗竿","서쪽 우편깃대"),pair("ソルビ「暁鐘の便りが濡れている。一本だけ残った道を旗で示そう」","솔비 “새벽종 편지가 젖었어. 남은 길 하나를 깃발로 표시하자.”"),pair("一子の最後の呼吸点を探す。","돌 하나의 마지막 활로를 찾자."),pair("下がっていた西便の旗が揚がった。","처졌던 서쪽 우편깃발이 올라갔다."),pair("風下の干し棚に便りの続きが引っ掛かっている。","바람 아래쪽 건조대에 편지 다음 장이 걸렸다.")),
    entry(pair("二本の干し棚","쌍줄 건조대"),pair("ルル「ソルビ、包みはまだたたまないで。書いた名前がにじんじゃう。ぼくが端を持つから、そっちの紐、張ってくれる？」","루루 “솔비, 꾸러미는 아직 접지 마. 써 둔 이름이 다 번져. 내가 끝을 잡을 테니까 그쪽 줄 좀 당겨 줄래?”"),pair("つながった二子が共有する呼吸点を読む。","붙은 두 돌이 함께 쓰는 활로를 읽자."),pair("二本の綱に乾いた水路図が広がった。","두 줄에 마른 수로 지도가 펼쳐졌다."),pair("図には破れた板道を渡る印がある。","지도에 끊어진 널길을 건너는 표식이 있다.")),
    entry(pair("継ぎ板の辻","쪽널 갈림길"),pair("ソルビ「車輪が隙間にはまった。両岸をまっすぐ一枚でつなごう」","솔비 “바퀴가 틈에 빠졌어. 양쪽 널을 한 장으로 곧게 이을게.”"),pair("二つの黒を切れない形につなぐ。","떨어진 두 흑돌을 끊기지 않게 잇자."),pair("欠けた床に新しい板が渡り、配達車が通った。","빈자리에 새 널이 놓여 우편 수레가 건넜다."),pair("車輪の跡は斜めに並ぶ風見へ向かう。","바퀴 자국이 비스듬히 선 풍향계로 향한다.")),
    entry(pair("雁渡りの風見","기러기 풍향계"),pair("ルル「ソルビ、そっちの板、半分水に浸かってる！ ぼくは手紙を抱えてるから、乾いてる杭のほうに回るね」","루루 “솔비, 그쪽 널 반쯤 잠겼어! 난 편지 안고 있으니까 마른 말뚝 쪽으로 돌아갈게.”"),pair("二つの継ぎ目のうち白に塞がれていない方を選ぶ。","두 이음점 중 백이 막지 않은 쪽을 고르자."),pair("絡んだ風見の翼がほどけ、南へ向いた。","엉킨 기러기 날개가 풀려 남쪽을 가리킨다."),pair("風見の下流で長い網が舟をせき止めている。","풍향계 하류에서 긴 그물이 배를 가로막는다.")),
    entry(pair("引き網の波止","긴그물 선창"),pair("船頭「真ん中を切っても網は流れない。端の最後の留め輪だ」","사공 “가운데를 잘라선 그물이 안 풀려. 끝의 마지막 고리를 봐.”"),pair("長い白の連の最後の呼吸点を詰めて取る。","긴 백 무리의 마지막 활로를 막아 따내자."),pair("網が巻き上がり、小舟の水路が開いた。","그물이 감기면서 작은 배가 지날 물길이 열렸다."),pair("浅瀬で一人の渡し守が助けを呼んでいる。","여울에서 나루지기 한 사람이 손을 흔든다.")),
    entry(pair("片櫂の浅瀬","외노 여울"),pair("渡し守「もう櫂が一本しか動かない。広い流れへ押し出して！」","나루지기 “노 하나만 움직여! 넓은 물길로 밀어 줘!”"),pair("アタリの黒一子を安全な方へ逃がす。","단수에 몰린 흑 한 점을 안전한 쪽으로 구하자."),pair("座礁していた赤い櫂舟が浮かんだ。","바닥에 걸렸던 붉은 노젓배가 떠올랐다."),pair("舟先が二艘の葦筏を指した。","뱃머리가 갈대 뗏목 두 척을 가리킨다.")),
    entry(pair("結び筏の入江","매듭뗏목 포구"),pair("ソルビ「二人とも綱を離さないで。一緒に大きな筏へ寄せるよ」","솔비 “둘 다 밧줄 놓지 마. 큰 뗏목에 함께 묶어 줄게.”"),pair("危ない黒二子を味方につないで救う。","위태로운 흑 두 점을 아군에 연결해 구하자."),pair("ばらけた筏に赤い結び綱が掛かった。","벌어졌던 뗏목 사이에 붉은 매듭이 걸렸다."),pair("葦の隙間から流木がまた流れ込む。","갈대 틈으로 표류목이 다시 떠밀려 온다.")),
    entry(pair("葦戸の分水","갈대문 물가름"),pair("船頭「白い流木は左へ抜ける。先にその出口を閉めよう」","사공 “흰 통나무가 왼쪽으로 빠질 거야. 그 출구부터 닫자.”"),pair("白が抜ける前に逃げ道を封じる。","백이 달아나기 전에 탈출로를 막자."),pair("葦の戸が閉まり、流木は脇の溜まりへ入った。","갈대문이 닫히고 표류목은 옆 웅덩이에 모였다."),pair("水位が下がり、検札小屋の二つの鎖が見えた。","물이 빠지자 검표소의 두 사슬이 드러났다.")),
    entry(pair("青札の検札小屋","푸른 표 검표소"),pair("ルル「ソルビ、あの青い札、舟の人がこっちに振ってる。丸太のほうに結んだ綱と、取り違えないでね！」","루루 “솔비, 파란 표 봐! 배에 탄 분이 우리한테 흔들고 있어. 통나무에 묶인 줄이랑 헷갈리면 안 돼!”"),pair("黒を救う手と白を塞ぐ手を見分ける。","흑을 구할 수와 백을 가로막을 수를 구별하자."),pair("青札が表へ返り、救い舟は検札を通った。","푸른 표가 뒤집히고 구조선이 검표소를 지났다."),pair("大跳ね橋には潮を量る甲将が待つ。","큰 도개교에서 물때를 재는 갑장이 기다린다.")),
    entry(pair("潮秤の大跳ね橋","물저울 도개교"),pair("甲将「舟を通したければ、水圧を読め。片側だけ開けば皆が沈む」","갑장 “배를 보내려거든 수압을 읽어라. 한쪽만 열면 모두 잠긴다.”"),pair("連絡、アタリ、取り、救出、白の応手を読み橋を下ろす。","연결·단수·따내기·구출과 백의 응수를 읽어 다리를 내리자."),pair("甲将が分銅を外し、跳ね橋の両翼が下りた。","갑장이 추를 풀자 도개교 양쪽 상판이 내려왔다."),pair("橋の向こうで潮だまりの階段が姿を現す。","다리 너머로 물웅덩이 층계가 드러난다.")),
    entry(pair("干潮の段々堰","썰물 층계보"),pair("ソルビ「岸の石は後ろへ下がれない。一段ずつ先に踏もう」","솔비 “가장자리 돌은 뒤로 물러날 수 없어. 한 단씩 순서대로 가자.”"),pair("盤端の呼吸点を数え、正しい順で打つ。","가장자리 활로를 세고 올바른 순서로 두자."),pair("沈んだ段に足掛かりが渡り、潮の目盛りが読めた。","잠긴 층계에 발판이 놓여 물때 눈금이 보인다."),pair("一番低い目盛りから排水樋をたどれる。","가장 낮은 눈금에서 배수 홈통이 이어진다.")),
    entry(pair("行き止まりの樋","막바지 홈통"),pair("渡し守「最初の出口は行き止まりだ。白が来た次の曲がりまで読んで」","나루지기 “첫 출구는 막혔어. 백이 오고 난 뒤의 굽이까지 봐.”"),pair("川岸から二手で逃げる順を読む。","막다른 강가에서 두 수로 빠져나갈 순서를 읽자."),pair("古い排水樋から水が流れ始めた。","낡은 배수 홈통으로 물줄기가 다시 흐른다."),pair("流れが塩倉の床下から二つの荷を押し出した。","물살이 소금창고 밑에서 짐 두 개를 밀어냈다.")),
    entry(pair("塩倉の偽荷","소금창고 미끼짐"),pair("ルル「小袋はじゃりじゃりする。これは塩だよ。長い包みの留め具、見て。鐘の形してる！」","루루 “작은 자루는 사각거려. 소금이야. 솔비, 긴 꾸러미 고리 좀 봐. 종 모양이야!”"),pair("離れた囮を避け、印の白の連だけを取る。","멀리 있는 미끼를 지나 표시된 백 무리를 따내자."),pair("印の荷が覆いを外し、塩に埋もれた星図が現れた。","표시한 짐의 덮개가 열려 소금에 묻힌 별지도가 나왔다."),pair("星図に二つの反射鏡が描いてある。","별지도에 물가의 반사경 두 개가 그려져 있다.")),
    entry(pair("双鏡の水庭","쌍거울 물정원"),pair("ソルビ「白は右にも左にも返せる。どちらの鏡でも光が届くように」","솔비 “백은 어느 쪽으로도 받을 수 있어. 두 거울 모두 빛이 닿게 하자.”"),pair("白の異なる応手を読んで続きを選ぶ。","서로 다른 백의 응수를 읽고 후속 수를 고르자."),pair("二枚の鏡が起き、対岸の浮標を照らした。","두 거울이 세워져 건너편 부표를 비춘다."),pair("光が交わる先に、切れた縦横の係留索が見える。","빛이 교차한 곳에 끊어진 가로세로 계류줄이 보인다.")),
    entry(pair("十字浮標の瀬","십자부표 여울"),pair("船頭「縦と横の綱を一本に。波が打ち返しても外れない継ぎ目だ」","사공 “가로세로 줄을 하나로 잇자. 파도가 받아쳐도 안 풀릴 이음점으로.”"),pair("交点で連絡し、白の割り込みを読む。","교차점에서 잇고 백의 끼어드는 수를 읽자."),pair("十字浮標の四つの灯りが一直線に並んだ。","십자부표의 등불 네 개가 물길을 따라 정렬됐다."),pair("灯りの向こうに屋根だけの村がある。","등불 건너에는 지붕만 남은 마을이 있다.")),
    entry(pair("軒渡りの村","처마건너 마을"),pair("ソルビ「先に屋根をつなげば、追われても三歩先で上がれる」","솔비 “지붕부터 이으면 쫓겨도 세 걸음 뒤에 올라설 수 있어.”"),pair("連絡から脱出まで三手先を読む。","연결에서 탈출까지 세 수 앞을 읽자."),pair("二軒の屋根に長い梯子が架かった。","두 집의 처마 사이에 긴 사다리가 걸렸다."),pair("梯子の先で二つの水門の片方だけが鳴る。","사다리 끝에서 두 수문 중 한쪽만 소리를 낸다.")),
    entry(pair("双扉の潮溜め","쌍문 조수지"),pair("ルル「この戸、泥でびくともしないよ。……待って、隣でちゃぷちゃぷ鳴ってる。耳を当ててみて」","루루 “이 문은 진흙이 껴서 꼼짝도 안 해. …잠깐, 옆에서 찰박찰박 소리가 나. 들어 봐.”"),pair("閉じた道と残った道を読み違えずに進む。","막힌 길과 남은 길을 구분해 나아가자."),pair("正しい扉が上がり、水面から鐘守の杭が出た。","맞는 문이 올라가고 물속에서 종지기 말뚝이 솟았다."),pair("杭が並ぶ先の回転桟橋で白波が向きを変える。","말뚝이 가리키는 회전 잔교에서 흰 파도가 꺾인다.")),
    entry(pair("回り桟橋の杭","회전잔교 말뚝"),pair("渡し守「白が返す向きで岸が変わる。決め打ちせず、次の一手を見て」","나루지기 “백의 응수에 따라 닿는 강가가 달라. 다음 수를 보고 마무리해.”"),pair("白の抵抗に合わせて最後の手を変える。","백의 저항에 맞춰 마무리 수를 바꾸자."),pair("桟橋が鐘楼の石段へ向きを変えた。","잔교가 돌아 수몰 종탑의 돌계단에 닿았다."),pair("石段の足元を三つの封じ石が塞ぐ。","돌계단 밑을 봉인석 세 개가 막고 있다.")),
    entry(pair("三つの封じ石","세 봉인석"),pair("ソルビ「三つの留め石には順番がある。鐘楼に水を入れない手を選ぶ」","솔비 “세 빗장돌엔 순서가 있어. 종탑에 물이 들지 않을 수를 고르자.”"),pair("連絡と封鎖を組み合わせて三手を通す。","연결과 봉쇄를 엮어 세 수를 완성하자."),pair("封じ石が横へ退き、沈鐘の鎖が手に届いた。","봉인석이 옆으로 물러나 수몰종 사슬에 손이 닿는다."),pair("鎖の先で、鐘を守る鷺が一歩踏み出した。","사슬 끝에서 종을 지키는 왜가리가 한 걸음 나선다.")),
    entry(pair("沈鐘の鐘楼","수몰종 종탑"),pair("守り鷺「鐘の音を返せるか。仲間を救い、逃げる白に最後まで応じよ」","수몰종의 왜가리 “종소리를 돌려줄 수 있나. 동료를 구하고 백의 마지막 응수까지 따라와라.”"),pair("安全な連絡、救出、アタリ、印の取り、最後の二手を通す。","안전한 연결·구출·단수·지정 무리 포획과 마지막 두 수를 완성하자."),pair("沈んだ暁鐘が上がり、星水の灯が西便の旗までともった。","물에 잠겼던 새벽종이 올라오고 별물의 불빛이 서쪽 우편깃대까지 이어졌다."),pair("鐘楼には乾いた便りが一通。次の配達は本街道へ。","종루에 마른 편지 한 통이 남았다. 다음 배달은 본 원정길로 이어진다."))
  ];
  const sites=[[49,80],[119,69],[201,100],[160,154],[76,184],[91,246],[161,228],[225,278],[294,245],[308,323],[247,381],[177,409],[114,369],[61,439],[99,505],[177,535],[239,487],[308,557],[249,628],[168,680]];
  const offsets=[[18,-13],[16,-11],[21,-8],[-21,-8],[-19,0],[18,-8],[9,-13],[20,-9],[17,-13],[20,-14],[18,-9],[-17,-9],[-16,-13],[17,-10],[-19,-9],[22,-10],[16,-9],[-16,-14],[20,-11],[1,-18]];
  const landmarks=sites.map(([x,y],i)=>({x,y,propX:x+offsets[i][0],propY:y+offsets[i][1]}));
  const bends=[[[74,75],[88,65]],[[146,80],[167,95]],[[201,131],[177,140]],[[139,181],[106,178]],[[54,208],[72,228]],[[112,239],[134,223]],[[189,229],[195,254]],[[251,282],[279,265]],[[318,267],[316,295]],[[290,345],[263,352]],[[220,382],[203,408]],[[153,408],[137,386]],[[85,379],[78,411]],[[57,471],[72,491]],[[122,518],[150,521]],[[197,512],[214,494]],[[274,502],[277,534]],[[301,592],[279,608]],[[225,645],[191,653]]];
  const edges=bends.map((b,i)=>[sites[i],...b,sites[i+1]]);
  const sessionKey=typeof CampaignSlots!=="undefined"?CampaignSlots.session("bfq-reach-map.v1"):"bfq-reach-map.v1";
  const words=(ja,ko)=>localizedPair([ja,ko]);
  const districts=[pair("西の郵便道","서쪽 우편길"),pair("葦の分水路","갈대 수로"),pair("跳ね橋の秤場","도개교 계량장"),pair("塩の水庭","소금 물정원"),pair("水没鐘楼","수몰 종루")];
  const byId=id=>document.getElementById(id);
  let panel,entryButton,selected=0,here=0,outcome=false,selectedFork=0,hereFork=0,offer=false,travel=null,raf=0,physical=null,heading=0;
  const clampIndex=i=>Number.isInteger(i)?Math.max(0,Math.min(19,i)):0;
  const cleared=()=>typeof SecondReach!=="undefined"?SecondReach.cleared():0;
  const hasFork=()=>typeof ReachFork!=="undefined";
  const access=i=>typeof SecondReach!=="undefined"&&SecondReach.unlocked(i);
  const canEnter=i=>access(i)&&(i!==9||!hasFork()||ReachFork.bossOpen(saved.reachFork,saved.reach));
  const fstatus=id=>hasFork()?ReachFork.status(id):{unlocked:false,complete:false,otherLocked:false};
  const forkMask=()=>[1,2].reduce((n,id)=>n|(Number(!!fstatus(id).complete)<<(id-1)),0);
  const currentPoint=()=>hereFork?ReachArt.forks[hereFork-1].site:sites[here];
  const validFork=id=>id===1||id===2?id:0;
  function departure(){
    const from=MapJourney.read("delta");
    if(!Number.isInteger(from))return null;
    if(from<0)return validFork(-from)&&fstatus(-from).complete?from:null;
    return from<19&&from<cleared()?from:null;
  }
  function beacon(target){
    const from=departure();
    if(from===null)return false;
    if(from<0)return target===9&&canEnter(9);
    if(from===8&&!canEnter(9))return target<0&&fstatus(-target).unlocked&&!fstatus(-target).otherLocked;
    return target===from+1&&canEnter(target);
  }
  function keep(){
    if(!panel||panel.hidden)return;
    const data={i:selected,here,outcome,selectedFork,hereFork,offer};
    try{sessionStorage.setItem(sessionKey,JSON.stringify(data));}catch{}
    const state=history.state;
    if(state?.reachArea&&state.reachBattle===undefined&&state.reachForkBattle===undefined&&!state.campRoute&&!state.mapJourney&&!state.battleReceipt)
      MapJourney.rememberView("reachArea",data);
  }
  function read(){try{return JSON.parse(sessionStorage.getItem(sessionKey));}catch{return null;}}
  function entrance(){
    if(!entryButton)return;
    const available=canEnter(0);
    entryButton.disabled=!available;
    const name=localizedPair(area);
    entryButton.textContent=name+(available?" ›":" · "+words("初級1クリア後","초급 1 완료 후"));
    entryButton.setAttribute("aria-label",available?words("初級2の地図を開く","초급 2 원정 지도 열기"):entryButton.textContent);
  }
  function camera(y){
    const v=byId("reachViewport"),world=byId("reachWorld");
    v.scrollTop=Math.max(0,y/748*world.offsetHeight-v.clientHeight*.48);
  }
  function party(point,isWalk=false,time=0){
    const canvas=byId("reachActors"),c=sceneLayer(canvas,384,748),[x,y]=point;
    c.clearRect(0,0,384,748);c.imageSmoothingEnabled=false;
    const from=departure();
    if(from!==null){
      if(from<0)MapJourney.trace(c,ReachArt.forks[-from-1].out);
      else if(from===8){for(let i=0;i<2;i++)if(!fstatus(i+1).otherLocked)MapJourney.trace(c,ReachArt.forks[i].in);}
      else MapJourney.trace(c,edges[from]);
    }
    const beat=isWalk&&!reduceMotion?Math.floor(time/125)%4:0;
    c.fillStyle="#314e4b85";c.fillRect(Math.round(x-6),Math.round(y-1),13,3);
    CastMotion.hiker(c,Math.round(x),Math.round(y),heading,beat,isWalk&&!reduceMotion);
    physical={x,y,walk:isWalk};
  }
  function routePosition(points,f){
    const lengths=points.slice(1).map(([x,y],j)=>Math.hypot(x-points[j][0],y-points[j][1]));
    let d=lengths.reduce((a,b)=>a+b,0)*Math.min(1,Math.max(0,f));
    for(let j=0;j<lengths.length;j++){
      const [x,y]=points[j],[xx,yy]=points[j+1],len=lengths[j];
      if(d<=len||j===lengths.length-1){const a=Math.min(1,d/len);
        return [x+(xx-x)*a,y+(yy-y)*a,CastMotion.direction(xx-x,yy-y)];}
      d-=len;
    }
  }
  function stopWalk(){
    if(raf)cancelAnimationFrame(raf);raf=0;travel=null;
    panel?.classList.remove("reach-walking");
  }
  function paintLand(count){
    const painting=DistrictIllustration.get(0),closed=[1,2].find(id=>fstatus(id).otherLocked)||0;
    const sheet=ReachArt.map(sites,edges,landmarks,count,forkMask(),closed,painting);
    DistrictIllustration.place(byId("reachLand"),sheet,!!painting);
  }
  document.addEventListener("districtillustration",e=>{
    if(e.detail===0&&panel&&!panel.hidden)paintLand(cleared());
  });
  function repaint(center=false){
    if(!panel||panel.hidden)return;
    const count=cleared(),e=events[selected],open=canEnter(selected),done=selected<count;
    panel.dataset.stageId=80+selected;panel.dataset.selection=selected;
    panel.dataset.outcome=String(outcome);panel.dataset.fork=selectedFork;panel.dataset.forkChoice=String(offer);byId("reachLand").dataset.completed=count;
    paintLand(count);
    byId("reachName").textContent=localizedPair(e.name);byId("reachTitle").textContent=localizedPair(area);
    byId("reachDistrict").textContent=localizedPair(districts[Math.floor(selected/4)])+" · "+(selected+1)+"/20"+
      (selected%10===9?" · "+words("番人","수문장"):selected===6?" · "+words("精鋭","정예"):"")+(done?" · ✓":"");
    byId("reachMapCount").textContent=count+" / 20";
    [...byId("reachLabels").children].forEach((label,i)=>label.textContent=localizedPair(districts[i]));
    byId("reachViewport").setAttribute("aria-label",words("星水の地図","별물 나루 지도"));
    byId("reachStops").setAttribute("aria-label",words("場所を選ぶ","장소 선택"));
    byId("reachLine").textContent=outcome?localizedPair(e.after)+" "+localizedPair(e.clue):open?localizedPair(e.before):
      words("先に「","먼저 ‘")+localizedPair(events[Math.max(0,selected-1)].name)+words("」を突破しよう。","’을 해결하자.");
    const goal=byId("reachMapGoal");goal.hidden=outcome||!open;goal.textContent=localizedPair(e.goal);
    const action=byId("reachAction");action.hidden=outcome&&selected!==19;action.disabled=!open;action.textContent=outcome?
      words("本街道へ戻る","본 원정길로"):
      open?done?words("もう一度挑む","재도전"):words("現地へ入る","현장에 들어가기"):words("通行止め","길이 막혀 있음");
    byId("reachMapBack").textContent=words("‹ 本街道","‹ 본 원정길");byId("reachSettings").textContent=words("設定","설정");
    const stops=byId("reachStops");
    for(const [i,b] of [...stops.children].entries()){
      const ok=canEnter(i),finished=i<count;
      b.setAttribute("aria-pressed",String(i===selected));b.setAttribute("aria-current",i===here?"location":"false");
      b.className="reach-stop "+(ok?finished?"cleared":"open":"closed")+(i%10===9?" sentinel":i===6?" elite":"");
      b.dataset.completed=String(finished);b.dataset.locked=String(!ok);
      b.firstChild.textContent=finished?"✓":!ok?"":i%10===9?"♜":i===6?"✦":"◆";
      b.setAttribute("aria-label",localizedPair(events[i].name)+(i===6?" · "+words("精鋭戦","정예전"):i%10===9?" · "+words("番人戦","수문장전"):"")+" · "+(finished?t("cleared"):ok?t("available"):t("locked")));
      MapPlaceArt.paint(b,80+i,ok,finished);
      MapJourney.mark(b,beacon(i));
    }
    presentForks(open);if(!selectedFork&&beacon(selected))action.hidden=true;window.TalkPortrait?.quoted(byId("reachLine"));
    party(currentPoint());
    if(center)camera(selectedFork?ReachArt.forks[selectedFork-1].site[1]:offer?279:sites[selected][1]);
  }
  function setSelection(i){
    if(travel)return;
    selected=clampIndex(i);selectedFork=0;outcome=false;offer=selected===9&&!canEnter(9)&&cleared()===9;repaint();keep();
  }
  function activate(i,loc=i,won=false,extra={}){
    if(!canEnter(0))return false;
    stopWalk();byId("voyage").classList.add("in-reach");
    panel.hidden=false;selected=clampIndex(i);here=Math.min(clampIndex(loc),Math.min(19,cleared()));
    selectedFork=validFork(extra.selectedFork);hereFork=validFork(extra.hereFork);
    outcome=!!won&&(selectedFork?fstatus(selectedFork).complete:selected<cleared());
    offer=!!extra.offer||(!selectedFork&&selected===9&&!canEnter(9)&&cleared()===9);
    repaint(true);keep();return true;
  }
  function open(i=Math.min(19,cleared())){
    if(!panel||!canEnter(0))return false;
    if(!history.state?.reachArea)history.pushState({...history.state,reachArea:{i,here:Math.min(19,cleared()),outcome:false}},"");
    return activate(i,Math.min(19,cleared()),false);
  }
  function win(i){
    if(!panel||!canEnter(i))return false;
    if(panel.hidden)open(i);
    MapJourney.write("delta",i<19?i:null);
    const ok=activate(i,i,true);(panel.querySelector("[data-travel-next]")||byId("reachAction")).focus({preventScroll:true});return ok;
  }
  function hide(){
    stopWalk();panel.hidden=true;byId("voyage").classList.remove("in-reach");physical=null;
    try{sessionStorage.removeItem(sessionKey);}catch{}
    entrance();entryButton?.focus({preventScroll:true});
  }
  function close(){
    if(!panel||panel.hidden)return;
    if(history.state?.reachArea&&history.state.reachBattle===undefined&&history.state.reachForkBattle===undefined&&!history.state.campRoute)history.back();else hide();
  }
  function presentForks(){
    const buttons=byId("reachForkStops"),action=byId("reachAction"),line=byId("reachLine");
    buttons.hidden=!hasFork();if(!hasFork())return;
    for(const b of buttons.children){
      const id=Number(b.dataset.reachFork),r=ReachFork.routes[id-1],status=fstatus(id);
      b.dataset.completed=String(!!status.complete);b.dataset.sealed=String(!!status.otherLocked);
      b.className="reach-fork-stop"+(status.complete?" cleared":status.otherLocked?" sealed":"")+(status.unlocked?" open":" closed");
      b.setAttribute("aria-pressed",String(selectedFork===id));b.setAttribute("aria-current",hereFork===id?"location":"false");
      const label=localizedPair(r.name);b.querySelector("b").textContent=label;
      b.querySelector("i").textContent=status.complete?"✓":status.otherLocked?"×":id===1?"⌁":"≋";
      b.setAttribute("aria-label",label+" · "+(status.otherLocked?words("永久封鎖","영구 봉쇄"):status.complete?t("cleared"):status.unlocked?t("available"):t("locked")));
      MapPlaceArt.paint(b,80,!!status.unlocked,!!status.complete,id);
      MapJourney.mark(b,beacon(-id));
    }
    if(selectedFork){
      const r=ReachFork.routes[selectedFork-1],s=fstatus(selectedFork);
      byId("reachName").textContent=localizedPair(r.name);byId("reachDistrict").textContent=words("検札所の分岐","검표소의 갈림길")+(s.complete?" · ✓":"");
      byId("reachMapGoal").textContent=localizedPair(r.goal);byId("reachMapGoal").hidden=!s.unlocked||outcome;
      line.textContent=s.otherLocked?words("もう片方を選んだため、この道は永久に閉ざされた。","다른 길을 선택해 이 길은 영구히 봉쇄됐다."):outcome?localizedPair(r.after):localizedPair(r.before);
      action.disabled=!s.unlocked||s.otherLocked;
      action.textContent=s.otherLocked?words("永久封鎖","영구 봉쇄"):outcome?words("跳ね橋で合流する","도개교에서 합류하기"):s.complete?words("現地を訪ねる","현장 다시 보기"):words("この岸を調べる","이 강가 살펴보기");
    }else if(offer){
      byId("reachName").textContent=words("二つの岸","두 갈래 강가");
      line.textContent=words("ルル「西の舟が流されそう。東の水門も、もうすぐ水があふれるって。ソルビ、ぼくはどっちの岸を手伝えばいい？」","루루 “서쪽 배가 떠밀려 가. 동쪽 수문도 곧 물이 넘친대. 솔비, 난 어느 쪽 강가를 도우면 돼?”");
      byId("reachMapGoal").textContent=words("現地で決めると、もう一方は永久に閉じる。","현장에서 확정하면 반대 길은 영구히 닫힌다.");
      byId("reachMapGoal").hidden=false;action.disabled=false;action.textContent=words("二つの岸を見比べる","두 강가 비교하기");
    }else if(outcome&&selected===8&&!canEnter(9))action.textContent=words("分かれ道を見る","갈림길 보기");
  }
  function chooseFork(id){
    if(travel||!validFork(id))return;

    selected=8;selectedFork=id;outcome=false;offer=false;repaint(true);keep();
  }
  function forkReturn(id){
    if(!validFork(id)||fstatus(id).first!==id||panel.hidden)return false;
    return activate(8,8,false,{selectedFork:id,hereFork:id});
  }
  function forkWin(id){
    if(!validFork(id)||!fstatus(id).complete)return false;
    if(panel.hidden)open(8);
    MapJourney.write("delta",-id);return activate(8,8,true,{selectedFork:id,hereFork:id});
  }
  // This graph also routes a returning party from another site along the real terrain.
  function routeTo(target){
    const start=hereFork?-hereFork:here;if(start===target)return [];
    const graph=new Map();
    function add(from,to,points){
      if(!graph.has(from))graph.set(from,[]);
      graph.get(from).push({to,points});
    }
    function connect(a,b,edge){add(a,b,edge);add(b,a,[...edge].reverse());}
    edges.forEach((e,i)=>{if(i!==8)connect(i,i+1,e);});
    ReachArt.forks.forEach((f,i)=>{if(!fstatus(i+1).otherLocked){connect(8,-i-1,f.in);connect(-i-1,9,f.out);}});
    const queue=[[start,[]]],visited=new Set([start]);
    while(queue.length){const [n,path]=queue.shift();
      for(const edge of graph.get(n)||[]){if(visited.has(edge.to))continue;
        const next=path.concat(path.length?edge.points.slice(1):edge.points);
        if(edge.to===target)return next;
        visited.add(edge.to);queue.push([edge.to,next]);
      }
    }
    return [];
  }
  function arrivalLines(from,to){
    const event=from<0?ReachFork.routes[-from-1]:events[from],next=events[to];
    if(!event||!next)return [];
    if(from<0&&to===9)return forkDeparture[-from-1].map((line,index)=>[Voyage.cast[index].name,line]);
    const quoted=next.before.map(line=>line.match(/([^「“”」\s]{1,12})\s*[「“]([^」”]+)[」”]/u));
    const solbi=Voyage.cast[0].name;
    const dialogue=to===from+1?travelDialogue[from]:null;
    return [[solbi,dialogue?.[0]||event.after],[
      quoted.map((text,i)=>text?.[1]||solbi[i]),
      dialogue?.[1]||quoted.map((text,i)=>text?.[2]||(event.clue||next.before)[i])
    ]];
  }
  function showJourney(from,to,restored=false){
    const lines=arrivalLines(from,to);
    if(!lines.length)return;
    const event=from<0?ReachFork.routes[-from-1]:events[from],next=events[to];
    MapJourney.story("reach",from,to,localizedPair(event.name)+" → "+localizedPair(next.name),
      lines.map(line=>line.map(localizedPair)),restored);
  }
  function arrive(){
    if(!travel)return;
    const {from,target,enterFork,revisit}=travel;stopWalk();
    if(target<0){here=selected=8;hereFork=selectedFork=-target;}
    else{selected=here=target;selectedFork=hereFork=0;if(!revisit)MapJourney.write("delta",null);}
    offer=false;outcome=false;repaint(true);keep();
    if(enterFork)ReachFork.enter(enterFork);
    else if(revisit)SiteVisit.prepare(80+target);
    else if(target>=0&&from!==target)showJourney(from,target);
  }
  function walkTo(target,enterFork=0,revisit=false){
    if(travel)return;
    const path=routeTo(target),from=hereFork?-hereFork:here;
    travel={from,target,enterFork,revisit};panel.classList.add("reach-walking");byId("reachAction").hidden=true;
    if(path.length<2){arrive();return;}
    const start=performance.now(),duration=reduceMotion?160:Math.min(1850,950+path.length*90);
    const frame=now=>{
      if(!travel)return;
      const f=Math.min(1,Math.max(0,(now-start)/duration)),[x,y,dir]=routePosition(path,f);heading=dir;
      party([x,y],true,now);camera(y);
      if(f===1)arrive();else raf=requestAnimationFrame(frame);
    };raf=requestAnimationFrame(frame);
  }
  function install(){
    if(panel)return;
    entryButton=document.createElement("button");entryButton.type="button";entryButton.id="reachAreaOpen";entryButton.onclick=()=>open();
    byId("voyage").querySelector(".atlas-head").insertBefore(entryButton,byId("mapMenuOpen"));
    panel=document.createElement("section");panel.id="reachMap";panel.hidden=true;panel.setAttribute("aria-labelledby","reachTitle");
    panel.innerHTML='<header class="reach-top"><button type="button" id="reachMapBack"></button><h2 id="reachTitle"></h2><button type="button" id="reachSettings"></button></header><div class="reach-spread"><div id="reachViewport" tabindex="0"><div id="reachWorld"><canvas id="reachLand" width="384" height="748" aria-hidden="true"></canvas><div id="reachLabels" aria-hidden="true"></div><div id="reachStops" role="group"></div><div id="reachForkStops" role="group"></div><canvas id="reachActors" width="384" height="748" aria-hidden="true"></canvas></div></div><div class="reach-detail"><small id="reachDistrict"></small><h3 id="reachName" aria-live="polite"></h3><p id="reachLine"></p><p id="reachMapGoal"></p><div class="reach-end"><span id="reachMapCount"></span><button type="button" id="reachAction"></button></div></div></div>';
    byId("voyage").append(panel);MapJourney.shelf(byId("reachViewport"),[byId("reachName"),byId("reachAction")]);
    for(const [x,y] of [[119,30],[248,187],[323,365],[69,535],[164,719]]){
      const label=document.createElement("span");label.style.left=x/384*100+"%";label.style.top=y/748*100+"%";byId("reachLabels").append(label);
    }
    const stops=byId("reachStops");
    sites.forEach(([x,y],i)=>{
      const b=document.createElement("button"),pin=document.createElement("i");b.type="button";b.dataset.reachSite=i;b.dataset.stageId=80+i;
      b.style.left=x/384*100+"%";b.style.top=y/748*100+"%";pin.setAttribute("aria-hidden","true");b.append(pin);b.onclick=()=>{
        if(travel)return;
        const gated=i===9&&!canEnter(9)&&cleared()===9;
        SiteVisit.tap(b,()=>setSelection(i),gated?()=>byId("reachAction").click():canEnter(i)?()=>{
          if(beacon(i))walkTo(i);
          else if(here===i&&!hereFork)SiteVisit.prepare(80+i);
          else walkTo(i,0,true);
        }:null);
      };stops.append(b);
    });
    for(let i=0;i<2;i++){
      const [x,y]=ReachArt.forks[i].site,b=document.createElement("button");
      b.type="button";b.dataset.reachFork=i+1;b.style.left=x/384*100+"%";b.style.top=y/748*100+"%";
      const pin=document.createElement("i");pin.setAttribute("aria-hidden","true");b.append(pin,document.createElement("b"));
      b.onclick=()=>{
        if(travel)return;
        const id=i+1,s=fstatus(id);
        SiteVisit.tap(b,()=>chooseFork(id),s.unlocked&&!s.otherLocked?()=>walkTo(-id,id):null,
          s.otherLocked?words("この遠征では閉鎖","이번 원정에서 닫힌 길"):null);
      };byId("reachForkStops").append(b);
    }
    byId("reachMapBack").onclick=close;byId("reachSettings").onclick=()=>{if(travel){stopWalk();repaint(true);}CampMenu.open("settings");};
    byId("reachAction").onclick=()=>{
      if(travel){arrive();return;}
      if(offer&&!selectedFork){ReachFork.enter(fstatus(1).first||1);return;}
      if(selectedFork){
        if(outcome)walkTo(9);else if(fstatus(selectedFork).unlocked&&!fstatus(selectedFork).otherLocked)walkTo(-selectedFork,selectedFork);
        return;
      }
      if(outcome){
        if(selected===19)SecondReach.returnMain();
        else if(selected===8&&!canEnter(9)){outcome=false;offer=true;repaint(true);keep();}
        else walkTo(selected+1);
        return;
      }
      if(canEnter(selected)){here=selected;hereFork=0;party(currentPoint());keep();SecondReach.enter(selected);}
    };
    entrance();
    const observe=new MutationObserver(()=>{entrance();if(!panel.hidden&&!travel)repaint();});
    observe.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    new MutationObserver(entrance).observe(byId("mapCount"),{childList:true});
    for(const pic of [CastMotion.trail,ExpeditionCast.sheet])pic.addEventListener("load",()=>{if(!panel.hidden&&!travel)party(currentPoint());});
    // Nested settings and battles retain this area entry as their return address.
    addEventListener("popstate",e=>{
      if(e.state?.mapJourney?.owner==="reach"){const j=e.state.mapJourney;showJourney(j.from,j.to,true);return;}
      if(e.state?.outerArea||e.state?.campRoute||e.state?.reachBattle!==undefined||e.state?.reachForkBattle!==undefined)return;
      const a=e.state?.reachArea;
      if(a){if(panel.hidden||!byId("reachBattleDialog")?.open)activate(a.i,a.here,a.outcome,a);}
      else if(!panel.hidden)hide();
    },true);
    const memo=read(),pending=typeof SecondReach!=="undefined"?SecondReach.pending():null;
    if(pending>=100||history.state?.outerArea)return;
    const forkPending=hasFork()?ReachFork.pending():null;
    if(!FrontDoor.active&&canEnter(0)&&(memo||pending!==null||forkPending!==null)){
      const i=pending??memo?.i??8,loc=memo?.here??i;
      if(!history.state?.reachArea)history.replaceState({...history.state,reachArea:{i,here:loc,outcome:!!memo?.outcome}},"");
      activate(i,loc,memo?.outcome,memo||{});if(pending!==null)SecondReach.resume();else if(forkPending!==null)ReachFork.resume();
      else if(history.state?.mapJourney?.owner==="reach"){const j=history.state.mapJourney;showJourney(j.from,j.to,true);}
    }
  }
  document.addEventListener("DOMContentLoaded",install,{once:true});
  return {install,open,close,win,forkWin,forkReturn,events,sites,landmarks,edges,arrivalLines,battle:(i,completed,arena)=>ReachArt.battle(i,completed,arena),
    get active(){return !!panel&&!panel.hidden;},get physical(){return physical;}};
})();
