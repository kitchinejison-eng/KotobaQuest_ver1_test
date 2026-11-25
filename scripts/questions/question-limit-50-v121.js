/* ことばクエスト PC ver1.2.1 | 各ジャンル50通り・重複抑制
 * 問題バンクの作成・補正が終わったあとに1回だけ実行してください。
 * Lv1-10の各レベルから原則5題ずつ、元の画像や回答形式を維持します。
 * 正誤・音声・手書き・記録のコードには介入しません。
 */
(function (root) {
  'use strict';
  if (!root.QUESTIONS || root.__kotoba50AppliedV121) return;
  root.__kotoba50AppliedV121 = true;
  var MAX = 50, info = {}, banks = root.QUESTIONS;
  function level(q, index, length) {
    var n = Number(q.difficultyLevel);
    return Number.isFinite(n) && n >= 1 && n <= 10 ? Math.round(n)
      : Math.min(10, Math.floor(index * 10 / Math.max(length, 1)) + 1);
  }
  function contentKey(q) {
    // 表示順やテンプレート以外の、学習課題の実質的な刺激を比較する。
    return JSON.stringify([q.answer || '', q.prompt || q.statement || q.scene || q.voiceText || '',
      q.image || '', q.tokens || '', q.question || '', q.reviewFocus || '']);
  }
  function stimulusKey(id, q) {
    if (['naming','matching','gesture','listen','instruction'].indexOf(id) >= 0) {
      return String(q.image || q.emoji || q.target || q.answer || q.voiceText || q.question || '');
    }
    if (['board','aac','roleplay'].indexOf(id) >= 0) {
      return String(q.answer || q.target || q.prompt || '');
    }
    if (id === 'mouth') return String(q.voiceText || q.prompt || '');
    return String(q.answer === 'できた' ? (q.voiceText || q.prompt || q.question || '')
      : (q.answer || q.prompt || q.statement || q.scene || q.voiceText || q.question || ''));
  }
  Object.keys(banks).forEach(function (id) {
    var bank = banks[id];
    if (!Array.isArray(bank)) return;
    var before = bank.length;
    if (before <= MAX) {info[id] = {before:before,after:before};return;}
    var selected = [], chosen = new Set(), exact = new Set(), freq = Object.create(null);
    var entries = bank.map(function (q,i){return {q:q,i:i,lv:level(q,i,bank.length),
      content:contentKey(q),source:stimulusKey(id,q)};});
    function take(candidates, count) {
      while (count > 0) {
        var best = null, bestScore = Infinity;
        candidates.forEach(function (e) {
          if(chosen.has(e.i)) return;
          var repetitions=freq[e.source] || 0;
          // 基本は異なる刺激を優先。全く同じ問題は一番最後にする。
          var score = (exact.has(e.content) ? 100000 : 0) + repetitions * 1000 +
            (e.q.expansionVersion === 'veta11' ? 4 : 0) + e.i/100000;
          if(score < bestScore){bestScore=score;best=e;}
        });
        if(!best)break;
        selected.push(best);chosen.add(best.i);exact.add(best.content);
        freq[best.source]=(freq[best.source] || 0)+1;count--;
      }
    }
    // 5問×10レベル。レベルが足りない場合は近いレベルから補充する。
    for(var lv=1;lv<=10;lv++) take(entries.filter(function(e){return e.lv===lv;}),5);
    if(selected.length<MAX)take(entries,MAX-selected.length);
    // ステップ選択の安定性と既存問題番号を維持するため元の順番に戻す。
    selected.sort(function(a,b){return a.i-b.i;});
    bank.splice.apply(bank,[0,bank.length].concat(selected.map(function(e){return e.q;})));
    info[id]={before:before,after:bank.length,distinctStimuli:Object.keys(freq).length,
      perLevel:Array.from({length:10},function(_,i){return bank.filter(function(q){return Number(q.difficultyLevel)===i+1;}).length;})};
  });
  // ほかの機能が参照する統計も最新の問題数を示す。
  if(root.KotobaV11QuestionStats && root.KotobaV11QuestionStats.activityCounts) {
    Object.keys(root.KotobaV11QuestionStats.activityCounts).forEach(function(id){
      if(Array.isArray(banks[id]))root.KotobaV11QuestionStats.activityCounts[id]=banks[id].length;
    });
  }
  if(root.__kotobaDistinctR5Counts) ['board','aac','roleplay','mouth'].forEach(function(id){
    if(Array.isArray(banks[id]))root.__kotobaDistinctR5Counts[id]=banks[id].length;
  });
  root.KotobaQuestion50 = {limit:MAX,version:'v121-pc-50-20261117',stats:info};
})(window);
