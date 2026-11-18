/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/games/print-drills.js
 * 役割：練習ドリルの印刷用問題とレイアウト
 * 利用画面：print-drills.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
(function(){
'use strict';
const DATA = [{"id":"matching","title":"文字・画像マッチング","icon":"🖼️","description":"絵を見て、合う言葉を選びます。","items":[{"label":"りんご","art":"apple","options":["りんご","バナナ","はな","コップ"]},{"label":"バナナ","art":"banana","options":["バナナ","りんご","くつ","かさ"]},{"label":"ねこ","art":"cat","options":["ねこ","いぬ","でんしゃ","ほん"]},{"label":"いぬ","art":"dog","options":["いぬ","ねこ","かぎ","スプーン"]},{"label":"コップ","art":"cup","options":["コップ","スプーン","でんわ","りんご"]},{"label":"くるま","art":"car","options":["くるま","でんしゃ","くつ","はぶらし"]},{"label":"でんしゃ","art":"train","options":["でんしゃ","くるま","かさ","はな"]},{"label":"かさ","art":"umbrella","options":["かさ","はぶらし","かぎ","バナナ"]},{"label":"はぶらし","art":"toothbrush","options":["はぶらし","スプーン","くつ","でんわ"]},{"label":"かぎ","art":"key","options":["かぎ","でんわ","ほん","コップ"]},{"label":"スプーン","art":"spoon","options":["スプーン","はぶらし","はな","くるま"]},{"label":"ほん","art":"book","options":["ほん","でんわ","ねこ","バナナ"]},{"label":"はな","art":"flower","options":["はな","りんご","かぎ","でんしゃ"]},{"label":"でんわ","art":"phone","options":["でんわ","ほん","コップ","いぬ"]},{"label":"くつ","art":"shoe","options":["くつ","かさ","くるま","ねこ"]}]},{"id":"scramble","title":"文字並べ替え","icon":"🔤","description":"ばらばらの文字を並べて言葉を作ります。","items":[{"word":"りんご","scramble":"ご・り・ん"},{"word":"ばなな","scramble":"な・ば・な"},{"word":"みず","scramble":"ず・み"},{"word":"ねこ","scramble":"こ・ね"},{"word":"いぬ","scramble":"ぬ・い"},{"word":"くるま","scramble":"ま・る・く"},{"word":"でんしゃ","scramble":"しゃ・で・ん"},{"word":"かさ","scramble":"さ・か"},{"word":"ほん","scramble":"ん・ほ"},{"word":"はな","scramble":"な・は"},{"word":"でんわ","scramble":"わ・で・ん"},{"word":"くつ","scramble":"つ・く"},{"word":"すぷーん","scramble":"す・ぷ・ー・ん"},{"word":"とけい","scramble":"い・と・け"},{"word":"てがみ","scramble":"み・て・が"}]},{"id":"copy","title":"写字・見写し","icon":"✍️","description":"見本を見ながら、同じ言葉や文を書きます。","items":[{"text":"あさ"},{"text":"みず"},{"text":"りんご"},{"text":"でんわ"},{"text":"くつ"},{"text":"おはよう"},{"text":"ありがとう"},{"text":"ゆっくり はなす"},{"text":"おちゃを のみます"},{"text":"きょうは はれです"},{"text":"コーヒーを おねがいします"},{"text":"トイレに いきたいです"},{"text":"もういちど おねがいします"},{"text":"すこし やすみたいです"},{"text":"ありがとうございました"}]},{"id":"truefalse","title":"○×・意味理解","icon":"⭕","description":"文を読んで、合っていれば○、違っていれば×。","items":[{"statement":"りんごは食べ物です。","answer":true},{"statement":"くつは足にはきます。","answer":true},{"statement":"かさは雨の日に使います。","answer":true},{"statement":"でんしゃは空を飛びます。","answer":false},{"statement":"はぶらしで歯をみがきます。","answer":true},{"statement":"スプーンで髪をとかします。","answer":false},{"statement":"電話で人と話せます。","answer":true},{"statement":"本は読むものです。","answer":true},{"statement":"コップに飲み物を入れます。","answer":true},{"statement":"冬に氷がいつも熱くなります。","answer":false},{"statement":"病院では体の相談ができます。","answer":true},{"statement":"駅で電車に乗れます。","answer":true},{"statement":"信号の赤は進んでよい合図です。","answer":false},{"statement":"お店でお金を払って買い物をします。","answer":true},{"statement":"眠いときは休むことも大切です。","answer":true}]},{"id":"naming","title":"絵を見て名前を言う","icon":"🍎","description":"絵の名前を声に出すか、紙に書きます。","items":[{"label":"りんご","art":"apple"},{"label":"バナナ","art":"banana"},{"label":"ねこ","art":"cat"},{"label":"いぬ","art":"dog"},{"label":"コップ","art":"cup"},{"label":"くるま","art":"car"},{"label":"でんしゃ","art":"train"},{"label":"かさ","art":"umbrella"},{"label":"はぶらし","art":"toothbrush"},{"label":"かぎ","art":"key"},{"label":"スプーン","art":"spoon"},{"label":"ほん","art":"book"},{"label":"はな","art":"flower"},{"label":"でんわ","art":"phone"},{"label":"くつ","art":"shoe"}]},{"id":"cueing","title":"ヒントでことばを思い出す","icon":"💡","description":"ヒント1から見て、必要なら次のヒントを使います。","items":[{"category":"くだもの","initial":"り","feature":"赤くて丸いことが多い","answer":"りんご"},{"category":"くだもの","initial":"ば","feature":"黄色くて長い","answer":"バナナ"},{"category":"動物","initial":"ね","feature":"にゃーと鳴く","answer":"ねこ"},{"category":"動物","initial":"い","feature":"しっぽを振り、ワンと鳴く","answer":"いぬ"},{"category":"飲み物の道具","initial":"こ","feature":"水やお茶を入れる","answer":"コップ"},{"category":"乗り物","initial":"く","feature":"道路を走る","answer":"くるま"},{"category":"乗り物","initial":"で","feature":"駅に来る長い乗り物","answer":"でんしゃ"},{"category":"雨の日の道具","initial":"か","feature":"ぬれないようにさす","answer":"かさ"},{"category":"洗面所で使う物","initial":"は","feature":"歯をみがく","answer":"はぶらし"},{"category":"家で使う物","initial":"か","feature":"鍵穴に入れてドアを開ける","answer":"かぎ"},{"category":"食事の道具","initial":"す","feature":"スープなどをすくう","answer":"スプーン"},{"category":"読む物","initial":"ほ","feature":"ページをめくる","answer":"ほん"},{"category":"植物","initial":"は","feature":"花びらがある","answer":"はな"},{"category":"連絡する道具","initial":"で","feature":"相手と話す","answer":"でんわ"},{"category":"身につける物","initial":"く","feature":"外を歩くとき足にはく","answer":"くつ"}]},{"id":"roleplay","title":"生活の場面で伝える（4択）","icon":"🗣️","description":"場面に合う伝え方を選びます。","items":[{"situation":"カフェで飲み物を注文します。","options":["コーヒーをお願いします。","トイレはどこですか。","駅までの道を教えてください。","今日は休みです。"],"answer":0},{"situation":"店員さんに商品があるか聞きます。","options":["これをください。","これはありますか。","お会計をお願いします。","少し休みたいです。"],"answer":1},{"situation":"会計をしたいとき、店員さんに伝えます。","options":["お会計をお願いします。","もう一度言ってください。","水をください。","ここで降ります。"],"answer":0},{"situation":"病院の受付に来ました。","options":["診察をお願いします。","パンをひとつください。","切符を買いたいです。","電話番号を教えます。"],"answer":0},{"situation":"話が聞き取れませんでした。","options":["もう一度ゆっくりお願いします。","お会計をお願いします。","右に曲がってください。","お茶を飲みます。"],"answer":0},{"situation":"トイレに行きたいとき、支援者に伝えます。","options":["トイレに行きたいです。","電車に乗りたいです。","本を読みたいです。","お金を払います。"],"answer":0},{"situation":"駅で行き先を確認します。","options":["この電車は横須賀に行きますか。","コーヒーをください。","鍵をなくしました。","少し休みたいです。"],"answer":0},{"situation":"体調が悪いので休みたいです。","options":["少し休ませてください。","お会計をお願いします。","これを温めてください。","次の駅で降ります。"],"answer":0},{"situation":"商品を指して購入したいと伝えます。","options":["これをください。","もう一度お願いします。","トイレはどこですか。","体温を測ってください。"],"answer":0},{"situation":"道に迷ったので場所を聞きます。","options":["駅はどこですか。","これをください。","お水をください。","診察券を見せます。"],"answer":0},{"situation":"気分が悪いことをスタッフに伝えます。","options":["気分が悪いです。","お会計です。","電車が来ました。","ありがとうございました。"],"answer":0},{"situation":"会話の内容を確認したいです。","options":["もう一度確認してもいいですか。","これをください。","窓を開けます。","あさごはんです。"],"answer":0},{"situation":"少し待ってほしいときに伝えます。","options":["少し待ってください。","切符をください。","左に曲がります。","電話をかけます。"],"answer":0},{"situation":"パン屋でパンを買います。","options":["パンを2つください。","駅までお願いします。","頭が痛いです。","窓を閉めてください。"],"answer":0},{"situation":"帰ることをスタッフに伝えます。","options":["今日はこれで帰ります。","お茶をください。","これを修理します。","どこで乗りますか。"],"answer":0}]},{"id":"reading","title":"短文を読んで答える","icon":"📖","description":"短い文を読んで、質問に答えます。","items":[{"passage":"たろうさんは朝、パンと牛乳を食べました。","question":"たろうさんは何を食べましたか。","answer":"パンと牛乳"},{"passage":"雨が降り始めたので、花子さんはかさを開きました。","question":"花子さんは何を使いましたか。","answer":"かさ"},{"passage":"駅に着くと、電車は5分後に来ると書いてありました。","question":"電車は何分後に来ますか。","answer":"5分後"},{"passage":"店でりんごを3個買いました。","question":"りんごを何個買いましたか。","answer":"3個"},{"passage":"ゆきさんは本を読んでから、机の上に置きました。","question":"ゆきさんは何を読みましたか。","answer":"本"},{"passage":"昼ごはんのあとに、お茶を飲みました。","question":"何を飲みましたか。","answer":"お茶"},{"passage":"けんさんは電話で友だちに連絡しました。","question":"誰に連絡しましたか。","answer":"友だち"},{"passage":"病院の予約は午後2時です。","question":"予約は何時ですか。","answer":"午後2時"},{"passage":"今日は天気がよいので、公園を散歩しました。","question":"どこを散歩しましたか。","answer":"公園"},{"passage":"みかさんは靴をはいて、外へ出ました。","question":"何をはきましたか。","answer":"靴"},{"passage":"お店は午前10時に開きます。","question":"お店は何時に開きますか。","answer":"午前10時"},{"passage":"かずさんは手を洗ってから食事をしました。","question":"食事の前に何をしましたか。","answer":"手を洗った"},{"passage":"帰りに薬局へ寄って、薬を受け取りました。","question":"どこで薬を受け取りましたか。","answer":"薬局"},{"passage":"電車の中で席をゆずりました。","question":"どこで席をゆずりましたか。","answer":"電車の中"},{"passage":"あきさんは、疲れたので10分休みました。","question":"何分休みましたか。","answer":"10分"}]},{"id":"category","title":"仲間分け・ことばの分類","icon":"🧩","description":"仲間ではない言葉を1つ見つけます。","items":[{"options":["りんご","バナナ","みかん","くつ"],"answer":"くつ"},{"options":["ねこ","いぬ","うさぎ","でんしゃ"],"answer":"でんしゃ"},{"options":["コップ","スプーン","はし","でんわ"],"answer":"でんわ"},{"options":["くるま","でんしゃ","バス","はな"],"answer":"はな"},{"options":["シャツ","ズボン","くつ","りんご"],"answer":"りんご"},{"options":["本","新聞","雑誌","コップ"],"answer":"コップ"},{"options":["春","夏","秋","電話"],"answer":"電話"},{"options":["月曜日","火曜日","日曜日","にんじん"],"answer":"にんじん"},{"options":["病院","薬局","診療所","公園の木"],"answer":"公園の木"},{"options":["赤","青","黄色","スプーン"],"answer":"スプーン"},{"options":["はぶらし","せっけん","タオル","電車"],"answer":"電車"},{"options":["朝ごはん","昼ごはん","晩ごはん","鍵"],"answer":"鍵"},{"options":["バラ","さくら","チューリップ","自転車"],"answer":"自転車"},{"options":["駅","バス停","改札","枕"],"answer":"枕"},{"options":["手袋","マフラー","帽子","スープ"],"answer":"スープ"}]},{"id":"cards","title":"絵・ことばカード（AAC）","icon":"🪧","description":"切り取って指差しや意思表示に使えるカードです。","items":[{"phrase":"おねがいします","icon":"🙏"},{"phrase":"ありがとう","icon":"🌼"},{"phrase":"もう一度お願いします","icon":"🔁"},{"phrase":"ゆっくり話してください","icon":"🐢"},{"phrase":"わかりません","icon":"❔"},{"phrase":"はい","icon":"⭕"},{"phrase":"いいえ","icon":"✖️"},{"phrase":"休みたいです","icon":"🪑"},{"phrase":"トイレに行きたいです","icon":"🚻"},{"phrase":"水をください","icon":"💧"},{"phrase":"痛いです","icon":"🩹"},{"phrase":"手伝ってください","icon":"🤝"},{"phrase":"お会計をお願いします","icon":"🧾"},{"phrase":"帰ります","icon":"🏠"},{"phrase":"大丈夫です","icon":"🙂"}]}];
const svgMap = {"apple": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M50 27 C28 13 13 34 22 59 C29 81 43 86 51 77 C60 86 76 80 82 58 C90 34 72 14 52 27Z\" fill=\"#e8b0a1\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M51 26 Q48 10 61 6\" stroke=\"#333\" stroke-width=\"4\" fill=\"none\"/><path d=\"M56 15 Q72 4 79 15 Q67 28 56 15Z\" fill=\"#94b887\" stroke=\"#333\" stroke-width=\"2\"/></svg>", "banana": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M18 20 Q42 78 82 66 Q74 83 53 83 Q25 77 11 35Z\" fill=\"#f0d26d\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M21 22 L13 17 M80 66 L89 64\" stroke=\"#333\" stroke-width=\"4\"/></svg>", "cat": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M20 35 L18 13 L39 26 Q51 19 62 26 L82 13 L80 36 Q90 53 77 72 Q50 91 23 72 Q10 53 20 35Z\" fill=\"#f0e2c5\" stroke=\"#333\" stroke-width=\"3\"/><circle cx=\"38\" cy=\"49\" r=\"4\"/><circle cx=\"63\" cy=\"49\" r=\"4\"/><path d=\"M46 59 L54 59 L50 64Z M50 64 Q45 72 39 66 M50 64 Q56 72 62 66\" stroke=\"#333\" stroke-width=\"2\" fill=\"none\"/></svg>", "dog": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M24 35 Q7 21 10 52 Q10 68 27 63 L31 76 Q50 91 69 76 L73 63 Q91 67 90 48 Q88 24 76 35 L69 27 Q50 18 31 27Z\" fill=\"#d9b28e\" stroke=\"#333\" stroke-width=\"3\"/><circle cx=\"39\" cy=\"49\" r=\"4\"/><circle cx=\"61\" cy=\"49\" r=\"4\"/><ellipse cx=\"50\" cy=\"61\" rx=\"6\" ry=\"4\" fill=\"#333\"/></svg>", "cup": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M25 27 L69 27 L65 78 Q47 87 30 78Z\" fill=\"#d7e2e8\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M69 35 Q91 29 84 49 Q79 59 67 57\" fill=\"none\" stroke=\"#333\" stroke-width=\"4\"/><path d=\"M23 26 L71 26\" stroke=\"#333\" stroke-width=\"4\"/></svg>", "car": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M12 55 L20 42 L35 38 L46 25 L68 25 L79 42 L89 47 L91 66 L10 66Z\" fill=\"#b6cde0\" stroke=\"#333\" stroke-width=\"3\"/><circle cx=\"27\" cy=\"67\" r=\"8\" fill=\"#eee\" stroke=\"#333\" stroke-width=\"3\"/><circle cx=\"75\" cy=\"67\" r=\"8\" fill=\"#eee\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M42 30 L39 42 L70 42 L65 30Z\" fill=\"#fff\" stroke=\"#333\" stroke-width=\"2\"/></svg>", "train": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><rect x=\"22\" y=\"15\" width=\"56\" height=\"64\" rx=\"6\" fill=\"#d6e7d4\" stroke=\"#333\" stroke-width=\"3\"/><rect x=\"29\" y=\"23\" width=\"16\" height=\"18\" fill=\"#fff\" stroke=\"#333\" stroke-width=\"2\"/><rect x=\"53\" y=\"23\" width=\"16\" height=\"18\" fill=\"#fff\" stroke=\"#333\" stroke-width=\"2\"/><rect x=\"31\" y=\"51\" width=\"38\" height=\"15\" fill=\"#fff\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"81\" r=\"4\"/><circle cx=\"68\" cy=\"81\" r=\"4\"/></svg>", "umbrella": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M10 43 Q18 11 50 11 Q82 11 90 43 Q78 34 66 43 Q56 32 50 43 Q35 32 25 43Z\" fill=\"#9ab7d3\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M50 43 L50 78 Q50 88 60 83\" fill=\"none\" stroke=\"#333\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg>", "toothbrush": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><rect x=\"23\" y=\"20\" width=\"19\" height=\"68\" rx=\"8\" transform=\"rotate(-25 32 54)\" fill=\"#9bc9b4\" stroke=\"#333\" stroke-width=\"3\"/><rect x=\"31\" y=\"10\" width=\"34\" height=\"18\" rx=\"4\" transform=\"rotate(-25 48 19)\" fill=\"#f0c4c4\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M39 8 L38 19 M47 7 L46 17 M55 7 L54 15\" stroke=\"#333\" stroke-width=\"2\"/></svg>", "key": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><circle cx=\"29\" cy=\"35\" r=\"17\" fill=\"#f0d37c\" stroke=\"#333\" stroke-width=\"4\"/><circle cx=\"29\" cy=\"35\" r=\"6\" fill=\"#fff\" stroke=\"#333\" stroke-width=\"2\"/><path d=\"M44 47 L82 78 L88 71 L78 63 L84 57 L73 48 L63 55 L53 45\" fill=\"#f0d37c\" stroke=\"#333\" stroke-width=\"3\"/></svg>", "spoon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><ellipse cx=\"38\" cy=\"27\" rx=\"17\" ry=\"22\" transform=\"rotate(-24 38 27)\" fill=\"#d9d9d9\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M49 44 L76 84\" stroke=\"#333\" stroke-width=\"11\" stroke-linecap=\"round\"/><path d=\"M49 44 L76 84\" stroke=\"#eee\" stroke-width=\"5\" stroke-linecap=\"round\"/></svg>", "book": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M13 20 Q33 14 50 28 Q67 14 87 20 L87 78 Q67 72 50 85 Q33 72 13 78Z\" fill=\"#d2e3c5\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M50 28 L50 84 M20 31 Q34 29 42 35 M58 35 Q69 29 80 31\" stroke=\"#333\" stroke-width=\"2\" fill=\"none\"/></svg>", "flower": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M50 48 L50 88\" stroke=\"#56865a\" stroke-width=\"5\"/><path d=\"M50 72 Q29 57 28 72 Q41 84 50 72 M50 80 Q69 62 75 75 Q65 88 50 80\" fill=\"#9bc89b\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"50\" cy=\"37\" r=\"13\" fill=\"#edc1c5\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"36\" cy=\"37\" r=\"12\" fill=\"#edc1c5\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"64\" cy=\"37\" r=\"12\" fill=\"#edc1c5\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"50\" cy=\"24\" r=\"12\" fill=\"#edc1c5\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"50\" cy=\"37\" r=\"9\" fill=\"#f3d46f\" stroke=\"#333\" stroke-width=\"2\"/></svg>", "phone": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><rect x=\"28\" y=\"8\" width=\"44\" height=\"82\" rx=\"7\" fill=\"#333\" stroke=\"#222\" stroke-width=\"2\"/><rect x=\"33\" y=\"17\" width=\"34\" height=\"62\" fill=\"#dce9ed\"/><circle cx=\"50\" cy=\"85\" r=\"2\" fill=\"#fff\"/><circle cx=\"43\" cy=\"32\" r=\"3\" fill=\"#fff\"/><circle cx=\"57\" cy=\"32\" r=\"3\" fill=\"#fff\"/></svg>", "shoe": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" role=\"img\" aria-label=\"絵\"><path d=\"M15 59 Q35 65 41 39 L54 52 Q63 64 83 65 Q91 68 89 80 L15 80 Q8 74 15 59Z\" fill=\"#b6c7d8\" stroke=\"#333\" stroke-width=\"3\"/><path d=\"M20 73 L83 73 M45 55 L54 60 M51 50 L61 56\" stroke=\"#333\" stroke-width=\"2\"/></svg>"};

/* ===== 表示・印刷処理：教材データと分離した日本語注記つき実装 ===== */
const $ = id => document.getElementById(id);
let selected = DATA[0].id;
let currentQuestions = [];
let currentGenre = DATA[0];

function esc(v) {
  // 【HTML安全対策】問題文などに記号があってもHTMLタグとして解釈させません。
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function shuffle(a) {
  // 問題順・選択肢の位置だけをシャッフル。正解データは変更しません。
  const b=a.slice();
  for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
  return b;
}
function art(key){return svgMap[key] || svgMap.book;}

function optionMarkup(options, twoColumns) {
  // 【選択式】チェック欄を小さな四角から大きな「丸をつける」欄へ変更。
  const className=twoColumns?'q-options':'roleplay-options';
  return `<div class="${className}">${options.map((value,i)=>
    `<div class="option"><span class="selection-mark" aria-hidden="true"></span><span class="option-body"><b class="option-letter">${String.fromCharCode(65+i)}.</b>${esc(value)}</span></div>`).join('')}</div>`;
}
function chooseBoxes(text, mode) {
  // 【1文字1マス】ひらがな・カタカナ・漢字を1文字ずつ書きます。
  // 元のデータの空白は「単語間の区切り」なのでマス数には含めません。
  const letters=Array.from(String(text||'').replace(/[\s　]/g,''));
  const maxPerRow=mode==='2'?6:mode==='1'?7:8;
  const columns=Math.max(1,Math.min(maxPerRow,letters.length));
  return `<div class="writing-label">こたえ（1マスに1文字ずつ書きましょう）</div>`+
    `<div class="char-grid" style="--columns:${columns}" aria-label="${letters.length}文字の記入欄">`+
    letters.map(()=>'<span class="char-box" aria-hidden="true"></span>').join('')+'</div>';
}
function longWritingArea(lines=2){
  // 【自由記述】文章を手書きしやすいよう、広い2行以上の枠を確保します。
  return `<div class="writing-label">こたえ</div><div class="write-area">${Array.from({length:lines},()=>'<div class="write-row"></div>').join('')}</div>`;
}
function renderGenreCards(){
  const grid=$('genreGrid');
  grid.innerHTML=DATA.map(g=>`<button type="button" class="genre-card ${g.id===selected?'selected':''}" data-genre="${g.id}" aria-pressed="${g.id===selected}"><span class="ico" aria-hidden="true">${g.icon}</span><span><strong>${esc(g.title)}</strong><small>${esc(g.description)}</small></span></button>`).join('');
  grid.querySelectorAll('[data-genre]').forEach(b=>b.addEventListener('click',()=>{
    selected=b.dataset.genre;renderGenreCards();updateSelectionText();
  }));
}
function updateSelectionText(){
  const g=DATA.find(x=>x.id===selected);
  $('selectedGenreText').textContent=g.title+'：'+g.description+(g.id==='cards'?'（カード形式のため解答例はありません）':'');
  const a=$('includeAnswers');
  if(g.id==='cards'){a.checked=false;a.disabled=true;}else{a.disabled=false;}
}
function renderQuestion(q,i,g,mode){
  // 【設問HTML】問題ごとに最も書きやすい回答欄を使い分けます。
  const stem=t=>`<div class="q-num">問題 ${i+1}</div><div class="q-prompt">${esc(t)}</div>`;
  switch(g.id){
    case 'matching': {
      const options=shuffle(q.options);
      return `<article class="q-item q-item--choice">${stem('この絵に合う言葉を選び、○をつけましょう。')}<div class="match-row"><div class="img-wrap">${art(q.art)}</div><div class="match-options">${optionMarkup(options,true)}</div></div></article>`;
    }
    case 'scramble': {
      // 「すぷーん」などの長音「ー」も独立した文字タイルとして扱います。
      const letters=q.scramble.split('・');
      return `<article class="q-item q-item--writing">${stem('文字をならべかえて、言葉を書きましょう。')}<div class="tiles">${letters.map(c=>`<span class="tile">${esc(c)}</span>`).join('')}</div>${chooseBoxes(q.word,mode)}</article>`;
    }
    case 'copy':
      return `<article class="q-item q-item--writing">${stem('見本と同じ言葉を書きましょう。')}<div class="copy-model">${esc(q.text)}</div>${chooseBoxes(q.text,mode)}</article>`;
    case 'truefalse':
      return `<article class="q-item q-item--choice">${stem(q.statement)}<div class="hint-help">合っていると思う方に○をつけましょう。</div><div class="tf-choices"><span class="tf-choice"><span class="selection-mark"></span><span class="tf-symbol">○</span></span><span class="tf-choice"><span class="selection-mark"></span><span class="tf-symbol">×</span></span></div></article>`;
    case 'naming':
      return `<article class="q-item q-item--writing">${stem('絵の名前を声に出し、文字で書きましょう。')}<div class="match-row"><div class="img-wrap">${art(q.art)}</div><div class="match-options">${chooseBoxes(q.label,mode)}</div></div></article>`;
    case 'cueing':
      return `<article class="q-item q-item--writing">${stem('ヒントを上から見て、言葉を思い出しましょう。')}<div class="cue-list"><div class="cue-hint">ヒント① 仲間：${esc(q.category)}</div><div class="cue-hint">ヒント② 最初の音：${esc(q.initial)}</div><div class="cue-hint">ヒント③ 特徴：${esc(q.feature)}</div></div>${chooseBoxes(q.answer,mode)}</article>`;
    case 'roleplay': {
      const options=shuffle(q.options);
      return `<article class="q-item q-item--choice">${stem(q.situation)}<div class="hint-help">相手に伝えるのに合う言葉へ○をつけましょう。</div>${optionMarkup(options,false)}</article>`;
    }
    case 'reading':
      return `<article class="q-item q-item--reading">${stem('文章を読んで質問に答えましょう。')}<div class="passage">${esc(q.passage)}</div><div class="q-question">${esc(q.question)}</div>${longWritingArea(2)}</article>`;
    case 'category':
      return `<article class="q-item q-item--choice">${stem('仲間ではない言葉を1つ選び、○をつけましょう。')}${optionMarkup(q.options,true)}</article>`;
    case 'cards':
      return `<article class="aac-card"><div class="card-ico">${esc(q.icon)}</div><div class="card-text">${esc(q.phrase)}</div></article>`;
    default:return '';
  }
}
function answerText(q,g){
  switch(g.id){
    case 'matching':case 'naming':return q.label;
    case 'scramble':return q.word;
    case 'copy':return q.text;
    case 'truefalse':return (q.answer?'○':'×')+'　'+q.statement;
    case 'cueing':case 'reading':return q.answer;
    case 'roleplay':return q.options[q.answer];
    case 'category':return q.answer;
    case 'cards':return '意思表示カードのため解答なし';
    default:return '';
  }
}
function modeClass(mode){return mode==='2'?'size-extra-large':mode==='1'?'size-large':'size-standard';}
function perPageFor(g,mode){
  // 【ページ分割】回答欄を広げた分だけ安全側に減らし、文字の切れを防ぎます。
  // 長い写字文では複数段のマスになるため、特大は1問ずつ配置します。
  if(g.id==='cards')return mode==='0'?6:4;
  if(g.id==='reading')return mode==='0'?2:1;
  if(g.id==='copy'||g.id==='scramble'||g.id==='naming'||g.id==='cueing')return mode==='2'?1:2;
  if(g.id==='roleplay')return mode==='2'?1:2;
  if(g.id==='matching')return mode==='2'?2:3;
  if(g.id==='truefalse'||g.id==='category')return mode==='0'?4:mode==='1'?3:2;
  return 2;
}
function makePage(content,g,number,titleText,mode){
  // 【共通紙面】法人・事業所名、氏名、日付、ページ番号を毎ページ表示。
  return `<section class="print-page ${modeClass(mode)}" data-page="${number}"><header class="print-head"><div class="print-brand">株式会社アリストテレス・ジャパン　｜　エジソン・キッチン</div><div class="print-title">${esc(titleText||g.title)}</div><div class="print-instruction">${esc(g.description)}　あわてず、ゆっくり取り組みましょう。</div><div class="name-line"><span>お名前：</span><span>日付：</span></div></header><div class="print-body">${content}</div><div class="footer-note">このプリントは学習・練習用の教材です。必要に応じて支援者と一緒に取り組んでください。</div><div class="page-label">${number}</div></section>`;
}
function buildDocument(g,items,answers,mode){
  const pages=[];
  const perPage=perPageFor(g,mode);
  // 【問題ページ】回答欄の種類や文字設定に応じてページを分割。
  for(let i=0;i<items.length;i+=perPage){
    const chunk=items.slice(i,i+perPage);
    const content=g.id==='cards'?
      `<div class="card-grid">${chunk.map((q,j)=>renderQuestion(q,i+j,g,mode)).join('')}</div>`:
      `<div class="q-list">${chunk.map((q,j)=>renderQuestion(q,i+j,g,mode)).join('')}</div>`;
    pages.push(makePage(content,g,pages.length+1,`${g.title}｜練習プリント`,mode));
  }
  // 【答えのページ】利用者向け問題ページと区切って最後にまとめる。
  if(answers&&g.id!=='cards'){
    const answerPageSize=mode==='2'?5:mode==='1'?6:9;
    for(let i=0;i<items.length;i+=answerPageSize){
      const chunk=items.slice(i,i+answerPageSize);
      const rows=chunk.map((q,j)=>`<div class="answer-item"><strong>問題 ${i+j+1}：</strong>${esc(answerText(q,g))}</div>`).join('');
      const note='<p class="hint-help">※手書き・会話の回答は、本人の表現や書字の状況に合わせて支援してください。</p>';
      pages.push(makePage(`<div class="answer-page"><h2>解答例（支援者用）</h2>${rows}${note}</div>`,g,pages.length+1,'解答例（支援者用）',mode));
    }
  }
  const total=pages.length;
  const numbered=pages.map((page,i)=>page.replace(/<div class="page-label">.*?<\/div>/,`<div class="page-label">${i+1} / ${total}</div>`));
  const css=$('print-css').textContent;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ことばクエスト｜${esc(g.title)}｜紙のドリル</title><style>${css}</style></head><body>${numbered.join('')}</body></html>`;
}
function showPreview(g,items,answers,mode){
  currentGenre=g;currentQuestions=items;
  const fullHTML=buildDocument(g,items,answers,mode);
  const doc=new DOMParser().parseFromString(fullHTML,'text/html');
  $('previewContent').innerHTML=doc.body.innerHTML;
  $('printPreview').classList.remove('hidden');$('printPreview').style.display='block';
  $('setupPanel').classList.add('hidden');
  $('previewTitle').textContent=g.title+'｜'+items.length+'問｜'+(mode==='2'?'特大':mode==='1'?'大きい文字':'標準');
  window.__kotobaPrintHTML=fullHTML;
  window.scrollTo(0,0);
}
function generate(){
  const g=DATA.find(x=>x.id===selected);
  const count=Number($('questionCount').value)||5;
  const pool=shuffle(g.items);
  const items=pool.slice(0,Math.min(count,pool.length)).map(q=>JSON.parse(JSON.stringify(q)));
  const answers=$('includeAnswers').checked;
  const mode=$('largeText').value;
  showPreview(g,items,answers,mode);
}
function printDrill(){
  const html=window.__kotobaPrintHTML;
  if(!html||!currentQuestions.length)return;
  // 【Androidとの互換】ネイティブの印刷ブリッジがあればHTMLを渡します。
  // ブラウザ版では、画面で表示している同じ内容を window.print() で印刷します。
  const bridge=window.KotobaNativeBridge;
  if(bridge&&typeof bridge.printHtml==='function'){
    try{bridge.printHtml('ことばクエスト_'+currentGenre.title,html,false);return;}
    catch(e){console.warn('Native print failed',e);}
  }
  window.print();
}
function resetSetup(){
  $('printPreview').classList.add('hidden');$('printPreview').style.display='none';
  $('setupPanel').classList.remove('hidden');window.scrollTo(0,0);
}
document.addEventListener('DOMContentLoaded',function(){
  renderGenreCards();updateSelectionText();
  $('generateBtn').addEventListener('click',generate);
  $('printBtn').addEventListener('click',printDrill);
  $('changeBtn').addEventListener('click',resetSetup);
  $('regenBtn').addEventListener('click',generate);
  $('backBtn').addEventListener('click',function(){window.location.href='index.html#title';});
});
})();
