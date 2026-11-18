/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/learning/difficulty-veta11.js
 * 役割：Lv・熟練度・難易度解放の共通処理
 * 利用画面：reading-memory.html,index.html,pictogram-3d.html,cat-word-puzzle.html,cat-word-race.html,kotoba-card-game.html,kotoba-quest-ud.html,shiba-burger-r4/index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* KotobaQuest browser VETA11: genre display + per-task level/mastery. */
(function (root) {
  'use strict';
  var STORAGE_KEY = 'kotobaquest_difficulty_veta11';
  var LEGACY_STORAGE = 'kotobaquest_user_profile_v1';
  // 【構音筋ナビ専用】Lv.1〜5。過去のLv.6〜10のポイントは消さずに保持する。
  function maxLevel(id) { return id === 'articulationNavigator' ? 5 : 10; }
  function profileId() {
    try {
      var p = root.KotobaQuestUserProfile && root.KotobaQuestUserProfile.getCurrent();
      if (p && p.profileId) return String(p.profileId);
      var raw = JSON.parse(localStorage.getItem(LEGACY_STORAGE) || '{}');
      if (raw.profileId) return String(raw.profileId);
    } catch (_) { /* use fallback for browsers without storage */ }
    return 'unconfigured';
  }
  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return data && typeof data === 'object' ? data : {};
    } catch (_) { return {}; }
  }
  function write(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) { /* private mode */ }
  }
  function normalize(item, id) {
    var x = item && typeof item === 'object' ? item : {};
    var levels = Array.isArray(x.levelPoints) ? x.levelPoints.slice(0, 10) : [];
    while (levels.length < 10) levels.push(0);
    levels = levels.map(function (n) { return Math.max(0, Math.min(100, Math.round(Number(n) || 0))); });
    var unlocked = 1;
    for (var i = 0; i < maxLevel(id) - 1 && levels[i] >= 100; i++) unlocked++;
    // R15.2: 一度解放したLvは、復習で熟練度が下がっても再ロックしない。
    // 旧データの unlocked も読んで移行する（既存記録を初期化しない）。
    var earnedUnlock = Math.max(1, Math.round(Number(x.highestUnlocked) || 1), Math.round(Number(x.unlocked) || 1));
    unlocked = Math.max(unlocked, Math.min(maxLevel(id), Math.max(1, earnedUnlock)));
    // R15.5: 解放済みの下位Lvで減点されても、今のLvで100ptになれば次を解放。
    // 以前の処理はLv.1から連続100ptを要求し、下位Lvの減点で上位Lvが解放できなかった。
    while (unlocked < maxLevel(id) && levels[unlocked - 1] >= 100) unlocked++;
    var selected = Math.max(1, Math.min(unlocked, Math.round(Number(x.selected) || unlocked)));
    // R15.5: 移行前に解放済みなのに低いLvに留まった古い記録を一度だけ補正。
    // 補正後の手動Lv選択は保持する（復習のため低いLvへ戻ることも可能）。
    var migrated = x.autoAdvanceMigrated === 1;
    if (!migrated && unlocked > selected) selected = unlocked;
    return {selected:selected, unlocked:unlocked, highestUnlocked:unlocked,
      autoAdvanceMigrated:1,
      mastery:levels[unlocked - 1], selectedMastery:levels[selected - 1], levelPoints:levels};
  }
  function get(id) {
    var data = read();
    var user = data[profileId()] || {};
    return normalize(user[id], id);
  }
  // 【select】熟練度・難易度の選択値を保存します。
  function select(id, level) {
    var data = read(); var key = profileId();
    if (!data[key] || typeof data[key] !== 'object') data[key] = {};
    var p = get(id);
    p.selected = Math.max(1, Math.min(p.unlocked, Math.round(Number(level) || 1)));
    p.selectedMastery = p.levelPoints[p.selected - 1];
    data[key][id] = p;
    write(data);
    return p;
  }
  // 【finish】課題終了時の熟練度更新です。
  function finish(id, rate, completed, count) {
    var data = read(); var key = profileId();
    if (!data[key] || typeof data[key] !== 'object') data[key] = {};
    var p = get(id); var lv = p.selected, before = p.levelPoints[lv - 1];
    // R15.2: 低い減点方式。正答分の加点は最大20pt、誤答は1問-1pt（1回最大-5pt）。
    // 採点対象外のスキップは count に含めない呼び出し元の仕様を維持。
    // 全問不正解でも +5pt されていた旧処理は廃止する。
    var total = Math.max(0, Math.round(Number(count) || 0));
    var correctCount = 0, incorrectCount = 0, correctGain = 0, wrongPenalty = 0;
    if (completed && total > 0) {
      var percent = Math.max(0, Math.min(100, Number(rate) || 0));
      correctCount = Math.max(0, Math.min(total, Math.round(total * percent / 100)));
      incorrectCount = total - correctCount;
      correctGain = Math.round(20 * correctCount / total);
      wrongPenalty = Math.min(5, incorrectCount);
      p.levelPoints[lv - 1] = Math.max(0, Math.min(100, before + correctGain - wrongPenalty));
    }
    var oldUnlocked = p.unlocked;
    p = normalize(p, id);
    // R15.5: 100pt達成で新Lvを解放したら、そのLvを自動選択する。
    // それ以外は手動で選んだ難易度を維持する。
    var raised = p.unlocked > oldUnlocked;
    p.selected = raised ? p.unlocked : lv;
    p.selectedMastery = p.levelPoints[p.selected - 1];
    data[key][id] = p;
    write(data);
    return {level:lv, before:before, points:p.levelPoints[lv - 1], unlocked:p.unlocked,
      selected:p.selected, autoAdvanced:raised, nextLevel:raised?p.selected:null,
      raised:raised, earned:p.levelPoints[lv - 1] - before,
      correctCount:correctCount, incorrectCount:incorrectCount,
      correctGain:correctGain, wrongPenalty:wrongPenalty};
  }
  // R15.6: ジャンル画面はLv番号を表示せず、課題ごとの解放状況をメーターに合算する。
  // Lv.1は開始地点(0%)、最終Lvの解放で100%。構音筋ナビのみLv.5が最終。
  // 自由会話は採点・熟練度がないため、解放率の分母に含めない。
  function genreProgress(category) {
    var tasks = category && Array.isArray(category.activities) ? category.activities : [];
    var sum = 0, max = 0, included = 0;
    tasks.forEach(function(item) {
      var id = item && item[0];
      if (!id || id === 'localAIConversation') return;
      var maxLv = maxLevel(id);
      var unlocked = Math.max(1, Math.min(maxLv, get(id).unlocked));
      sum += unlocked - 1;
      max += maxLv - 1;
      included++;
    });
    var percent = max ? Math.max(0, Math.min(100, Math.round(sum / max * 100))) : 0;
    return {percent:percent, completed:max>0&&sum===max, unlockedSteps:sum,
      totalSteps:max, activities:included};
  }
  function genreLevel(category) {
    if (!category || !Array.isArray(category.activities)) return 1;
    // A single readable genre level, derived from the independently stored tasks.
    var total = 0, count = 0;
    category.activities.forEach(function (item) { total += get(item[0]).unlocked; count++; });
    return count ? Math.max(1, Math.min(10, Math.floor(total / count))) : 1;
  }
  function pool(bank, level) {
    if (!Array.isArray(bank) || !bank.length) return [];
    var lv = Math.max(1, Math.min(10, Number(level) || 1));
    var exact = bank.filter(function (q) { return Number(q.difficultyLevel) === lv; });
    // All new 100-item banks have 10 questions per level; older/special banks
    // can continue to run even if they have fewer than ten levelled items.
    if (exact.length >= 5) return exact;
    var other = bank.filter(function (q) { return Number(q.difficultyLevel) !== lv; });
    other.sort(function (a, b) {
      return Math.abs((Number(a.difficultyLevel) || 5) - lv) - Math.abs((Number(b.difficultyLevel) || 5) - lv);
    });
    return exact.concat(other.slice(0, Math.max(0, 10 - exact.length)));
  }
  function draw(bank, id, level, count) {
    var candidates = pool(bank, level), needed = Math.min(Math.max(1, Number(count)||5), candidates.length);
    var data = read(), key = profileId();
    if (!data[key] || typeof data[key] !== 'object') data[key] = {};
    if (!data[key].__recent || typeof data[key].__recent !== 'object') data[key].__recent = {};
    var historyKey = id + '@' + level, recent = data[key].__recent[historyKey] || [];
    function identity(q, index) {
      return q.id ? String(q.id) : q.practiceVariant ? 'variant-' + q.practiceVariant : String(q.itemNo || q.prompt || q.question || q.answer || index);
    }
    var indexed = candidates.map(function (q, i) { return {question:q, key:identity(q, i)}; });
    // Shuffle both halves independently. Prefer unseen questions, then recycle
    // least-recently used ones after exhausting the level's available pool.
    var learning = !!(root.KotobaLearningMode && root.KotobaLearningMode.isEnabled());
    var weakIds = learning && root.KotobaAdaptive ? (root.KotobaAdaptive.getSkill(id).lastWrongIds || []) : [];
    // At most two review questions per run; keep most of the session fresh.
    var review = indexed.filter(function (x) { return weakIds.indexOf(x.key)>=0; }).slice(0,Math.min(2,Math.floor(needed/3)));
    var remainder = indexed.filter(function (x) { return review.indexOf(x)<0; });
    var fresh = remainder.filter(function (x) { return recent.indexOf(x.key) < 0; });
    var used = remainder.filter(function (x) { return recent.indexOf(x.key) >= 0; });
    function shuffle(list) { return list.sort(function () { return Math.random() - 0.5; }); }
    shuffle(fresh);
    used.sort(function (a,b) {return recent.indexOf(a.key) - recent.indexOf(b.key);});
    var selected = review.concat(fresh,used).slice(0, needed);
    var nextRecent = recent.concat(selected.map(function (x) { return x.key; }));
    var unique = [];
    nextRecent.forEach(function (x) { var i=unique.indexOf(x); if (i>=0) unique.splice(i,1); unique.push(x); });
    data[key].__recent[historyKey] = unique.slice(-Math.max(10, candidates.length));
    write(data);
    return selected.map(function (x) { return x.question; });
  }
  root.KotobaLevels = {get:get, select:select, finish:finish, genreLevel:genreLevel, genreProgress:genreProgress, pool:pool, draw:draw, maxLevel:maxLevel};
  if (typeof root.renderCategories === 'function') root.renderCategories();
})(window);
