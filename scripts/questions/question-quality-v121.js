/*
 * 【ことばクエスト ver1.2.1｜教材品質の再構成】
 * 役割：旧問題のヒント不足・音の選択肢・モーラ拍数・説明文の整合性を点検して補正します。
 * 読込順：問題バンク、課題別スクリプト、解説スクリプトの「後」に読み込んでください。
 * 注意：既存の活動ID、回答形式、記録キーを変更しません。
 *       画像の数を増やしていないため、同じ画像を使う問題は「復習」として扱います。
 */
(function(root){
  'use strict';
  if(!root.QUESTIONS || root.__kotobaQualityV121) return;
  root.__kotobaQualityV121=true;
  var banks=root.QUESTIONS;
  var hints={
    'りんご':'赤や緑の実がなる果物です。','バナナ':'黄色く細長い果物で、皮をむいて食べます。',
    'みかん':'皮をむいて食べる小さな柑橘類です。','くま':'大きな体と丸い耳が特徴の動物です。',
    'コーヒー':'豆から作る香りのある飲み物です。','さくら':'春に花が咲く木です。',
    '手洗い':'手の汚れを落とす動作です。','ごはん':'米を炊いた食べ物です。',
    'おふろ':'体を温めたり洗ったりする場所です。','えんぴつ':'芯で字を書く文房具です。',
    'でんしゃ':'線路を走る乗り物です。','くつ':'足にはいて使うものです。',
    'かさ':'雨にぬれないように使う道具です。','いぬ':'ワンと鳴く動物です。',
    'ねこ':'ニャーと鳴く動物です。','みず':'のどが渇いたときに飲む液体です。',
    'とけい':'時刻を確認する道具です。','かばん':'物を入れて持ち歩く道具です。',
    'ほん':'文章や絵が載っている冊子です。','いす':'腰をかける家具です。',
    'はさみ':'紙を切るための刃のある道具です。','でんわ':'離れた相手と話す道具です。',
    'じてんしゃ':'ペダルをこいで進む乗り物です。','たまご':'殻があり料理に使う食材です。',
    'パン':'小麦粉などを焼いて作る食べ物です。','くるま':'道路を走る乗り物です。',
    'せっけん':'汚れを落とすために使います。','めがね':'目の前にかけて使う道具です。',
    '晴れ':'雲が少なく太陽が見える天気です。','コップ':'飲み物を入れる器です。',
    'タオル':'水分を拭く布です。','おさら':'料理を盛り付ける器です。',
    'バス':'多くの人が乗れる道路の乗り物です。','さくらんぼ':'小さく丸い赤い果物です。',
    'スマートフォン':'手のひらに収まる通信機器です。'
  };
  var moveHints={
    '商品を指さす':'指先がどこへ向いているか見ましょう。','おじぎをする':'上半身が前に傾く動きです。',
    '方向を指し示す':'腕が向いている方向に注目しましょう。','耳に手を当てる':'手が頭のどこに触れていますか。',
    '箱を持ち上げる':'箱が上下のどちらへ動いていますか。','手のひらで止める':'手のひらを相手へ向けた合図です。',
    'ひざを押さえる':'手を当てている体の部分を探しましょう。','地図を指さす':'紙のどこを指しているか見ましょう。',
    '手を上げる':'腕の高さに注目しましょう。','うなずく':'首を上下に動かす合図です。',
    '手でバツを作る':'両腕の形に注目しましょう。','手を振る':'手を左右に動かしています。',
    '頭に手を当てる':'頭と手の位置に注目しましょう。','椅子を指す':'指先が家具へ向いています。',
    '指を一本立てる':'伸ばしている指の本数に注目しましょう。'
  };
  function byId(id,fn){(banks[id]||[]).forEach(fn);}
  byId('naming',function(q){
    var clue=hints[String(q.answer||'')];
    if(clue){q.hint=clue;q.explanation='この絵やアイコンが表す言葉は「'+q.answer+'」です。'+clue;}
    // 一部の旧写真には回答と一致しない物があったため、既存の絵文字優先方針は維持します。
    if(q.emoji&&!q.image)q.question = q.reviewImageReused
      ? String(q.question||'').replace('絵やアイコン','絵文字・アイコン')
      : '絵文字・アイコンを見て、名前を声に出しましょう。';
  });
  byId('gesture',function(q){
    var clue=moveHints[String(q.answer||'')];
    if(clue){q.hint=clue;q.explanation='この写真の動作は「'+q.answer+'」です。'+clue;}
  });
  byId('matching',function(q){
    var clue=hints[String(q.target||q.answer||'')];
    if(clue){q.hint=clue;q.explanation='文字「'+(q.target||q.answer)+'」に対応する絵を選びます。'+clue;}
  });
  byId('mora',function(q){
    var count=Number(q.moraCount || parseInt(q.answer,10));
    if(!Number.isInteger(count)||count<1||count>12)return;
    var options=[count], offsets=[-1,1,-2,2,3,-3,4,-4];
    offsets.forEach(function(offset){var value=count+offset;if(value>=1&&value<=12&&options.length<4&&options.indexOf(value)<0)options.push(value);});
    q.choices=options.sort(function(a,b){return a-b;}).map(function(n){return n+'拍';});
    q.answer=count+'拍';
    var word=String(q.voiceText || String(q.prompt||'').replace(/・/g,''));
    if(q.expansionVersion==='veta11')q.hint='「'+word+'」を一音ずつ手拍子で数えましょう。「ん」「っ」「ー」も一拍と数えます。';
    q.explanation='「'+String(q.prompt||word)+'」の拍を数えると「'+count+'拍」です。小さい「ゃ・ゅ・ょ」は前の音と一緒に数えます。';
  });
  byId('sound',function(q){
    var m=String(q.question||'').match(/[「『]([^」』]+)[」』]/);
    var sounds=m ? m[1].split(/[・,，、]/) : [];
    var choices=Array.isArray(q.choices)?q.choices:[];
    if(!sounds.length||!choices.length)return;
    var matches=choices.filter(function(choice){return sounds.some(function(ch){return String(choice).indexOf(ch)>=0;});});
    if(matches.length!==1||matches[0]!==q.answer){
      // 予期しない追加問題は採点を不公平にしないため、安全な4択に修復します。
      var answer=String(q.answer), sound=sounds.find(function(ch){return answer.indexOf(ch)>=0;}) || Array.from(answer)[0];
      var distractorBank=['いぬ','ねこ','ほん','くま','さくら','くつ','とけい','りんご','かさ','みず','はな','そら','えき','バス'];
      var other=distractorBank.filter(function(w){return w!==answer&&w.indexOf(sound)<0;}).slice(0,3);
      q.question='「'+sound+'」の音が入る言葉を選びましょう。';q.choices=[answer].concat(other);q.hint='指定された一音を、言葉の中から探しましょう。';
    }
    q.explanation='正解は「'+q.answer+'」です。指定された音がこの言葉の中に含まれています。ほかの選択肢と音を比べましょう。';
  });
  // ヒントボタンが押せない旧『特徴から想起』問題を、既存の段階ヒントにつなぎます。
  byId('cue',function(q){
    if(q.hint)return;
    var cues=Array.isArray(q.cues)?q.cues:[];
    var first=cues.find(function(c){return c && c.text;});
    if(first)q.hint=String(first.text);
    else if(q.answer)q.hint='言葉の最初の音と、使う場面を思い出しましょう。';
  });
  // 旧RPG問題も空欄ではなく、意味を考えるための短い案内を表示します。
  byId('kotobaQuestClassic',function(q){
    if(!q.hint)q.hint='問題文をゆっくり読み、選択肢が意味に合うか比べましょう。';
  });
  byId('fill',function(q){
    if(q.expansionVersion!=='veta11')return;
    if(!q.hint || q.hint==='意味が合う言葉を選びましょう。')q.hint='文の前と後ろを続けて読み、意味の通る言葉を考えましょう。';
  });
  root.KotobaQualityV121={version:'1.2.1-content-fix',hintsForNamedObjects:Object.keys(hints).length};
})(window);
