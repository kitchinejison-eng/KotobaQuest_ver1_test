/*
 * ことばクエスト Ver.1.2.1 PC R15.4 - 個別学習・第1段階
 * 外部AI・外部通信なし。学習モードON時だけ、利用者ごとに回答履歴を保存し
 * 苦手問題を優先する。熟練度・難易度・従来の学習記録は変更しない。
 * 3Dなど個別ゲームは共有連携から正誤だけ収集（時間/ヒントは不明）。
 */
(function (root) {
  'use strict';
  if (root.KotobaPersonalReview) return;
  var PREFIX = 'kotobaquest_personal_review_r154_';
  var MIN_ANSWERS = 5;
  var MAX_ITEMS_PER_ACTIVITY = 200;
  var MAX_HISTORY = 500;
  var dataCache = null, cacheKey = null, activeQuestion = null;

  function profileId() {
    try {
      var p = root.KotobaQuestUserProfile && root.KotobaQuestUserProfile.getCurrent();
      if (p && p.profileId) return String(p.profileId).replace(/[^\w-]/g, '').slice(0, 60) || 'unconfigured';
      var old = JSON.parse(localStorage.getItem('kotobaquest_user_profile_v1') || '{}');
      if (old.profileId) return String(old.profileId).replace(/[^\w-]/g, '').slice(0, 60) || 'unconfigured';
    } catch (_) { /* keep guest isolated */ }
    return 'unconfigured';
  }
  function storageKey() { return PREFIX + profileId(); }
  function enabled() { return !!(root.KotobaLearningMode && root.KotobaLearningMode.isEnabled()); }
  function load() {
    var key = storageKey();
    if (cacheKey === key && dataCache) return dataCache;
    cacheKey = key;
    var data = null;
    try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) {}
    if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
    data = {
      version: 1,
      activities: data.activities && typeof data.activities === 'object' && !Array.isArray(data.activities) ? data.activities : {},
      history: Array.isArray(data.history) ? data.history.slice(-MAX_HISTORY) : []
    };
    dataCache = data;
    return data;
  }
  function persist() {
    try { localStorage.setItem(storageKey(), JSON.stringify(load())); return true; }
    catch (err) { console.warn('個別学習の履歴を保存できませんでした', err); return false; }
  }
  function hash(value) {
    var h = 2166136261;
    for (var i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }
  // 問題の内容から安定した識別子を生成。音声/回答者の入力は含めない。
  function questionId(q) {
    if (Array.isArray(q)) return 'arr_' + hash(JSON.stringify(q).slice(0, 1000));
    if (!q || typeof q !== 'object') return 'val_' + hash(String(q || ''));
    var id = q.id != null ? String(q.id) : '';
    var content = [q.prompt,q.question,q.answer,q.voiceText,q.practiceVariant,q.itemNo,q.difficultyLevel]
      .map(function(v){return String(v == null ? '' : v).slice(0,200);}).join('|');
    return 'q_' + hash(id + '|' + content);
  }
  function getActivity(activity, create) {
    var id = String(activity || 'unknown').slice(0, 100);
    var rootData = load();
    if (!rootData.activities[id] && create) rootData.activities[id] = {total:0,correct:0,items:{}};
    var record = rootData.activities[id];
    if (record && !record.items) record.items = {};
    return record || null;
  }
  function markShown(activity, q, level) {
    activeQuestion = null;
    if (!enabled() || !q) return;
    activeQuestion = {activity:String(activity || 'unknown'),id:questionId(q),
      level:Math.max(1, Math.min(10, Number(level) || 1)),
      shownAt:Date.now(), hints:0, done:false};
  }
  function markHint(activity, q) {
    if (!enabled() || !activeQuestion || activeQuestion.done) return;
    if (activeQuestion.activity !== String(activity) || activeQuestion.id !== questionId(q)) return;
    activeQuestion.hints++;
  }
  function storeAnswer(activity, q, correct, extras) {
    if (!enabled() || !q) return false;
    var id = questionId(q), a = String(activity || 'unknown'), extra = extras || {};
    var record = getActivity(a, true), items = record.items;
    var now = Date.now(), item = items[id] || {correct:0,wrong:0,seen:0,hints:0,totalAnswerMs:0,timedCount:0};
    item.seen = (Number(item.seen) || 0) + 1;
    if (correct) item.correct = (Number(item.correct) || 0) + 1;
    else {item.wrong = (Number(item.wrong) || 0) + 1;item.lastWrongAt = now;}
    item.lastSeenAt = now;
    if (extra.level != null) item.level = Math.max(1,Math.min(10,Number(extra.level)||1));
    if (Number.isFinite(extra.answerMs) && extra.answerMs >= 0) {
      item.totalAnswerMs = (Number(item.totalAnswerMs) || 0) + Math.min(extra.answerMs, 60*60*1000);
      item.timedCount = (Number(item.timedCount) || 0) + 1;
    }
    item.hints = (Number(item.hints) || 0) + Math.max(0,Number(extra.hints)||0);
    items[id] = item;
    record.total = (Number(record.total) || 0) + 1;
    if (correct) record.correct = (Number(record.correct) || 0) + 1;
    // Keep the local data bounded; remove least-recently-used question records.
    var keys = Object.keys(items);
    if (keys.length > MAX_ITEMS_PER_ACTIVITY) {
      keys.sort(function(x,y){return (Number(items[x].lastSeenAt)||0)-(Number(items[y].lastSeenAt)||0);});
      keys.slice(0,keys.length-MAX_ITEMS_PER_ACTIVITY).forEach(function(k){delete items[k];});
    }
    var history = load().history;
    history.push({at:new Date(now).toISOString(),activity:a,questionId:id,correct:!!correct,
      level:item.level || null,hints:Math.max(0,Number(extra.hints)||0),
      answerMs:Number.isFinite(extra.answerMs) ? Math.round(extra.answerMs) : null});
    if (history.length>MAX_HISTORY) history.splice(0,history.length-MAX_HISTORY);
    persist();
    return true;
  }
  // 1問の初回採点だけを対象にする。再挑戦・スキップは二重記録しない。
  function recordAnswer(activity, q, correct) {
    if (!enabled() || !activeQuestion || activeQuestion.done) return false;
    if (activeQuestion.activity !== String(activity) || activeQuestion.id !== questionId(q)) return false;
    activeQuestion.done = true;
    return storeAnswer(activity, q, !!correct, {
      level:activeQuestion.level,hints:activeQuestion.hints,
      answerMs:Math.max(0,Date.now()-activeQuestion.shownAt)
    });
  }
  // ゲーム固有の回答。回答時間/ヒントが取得できない場合は推測しない。
  function recordExternal(activity,q,correct) {return storeAnswer(activity,q,!!correct,{});}
  function stats(activity) {
    var rec = getActivity(activity, false);
    if (!rec) return {total:0,correct:0,wrong:0,tracked:0,ready:false};
    var total = Math.max(0,Number(rec.total)||0), correct = Math.max(0,Number(rec.correct)||0);
    return {total:total,correct:correct,wrong:Math.max(0,total-correct),
      tracked:Object.keys(rec.items||{}).length,ready:total>=MIN_ANSWERS};
  }
  function shuffle(items) {
    var x=items.slice();
    for(var i=x.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=x[i];x[i]=x[j];x[j]=t;}
    return x;
  }
  function select(bank, activity, count) {
    if (!enabled() || !Array.isArray(bank) || !bank.length || !stats(activity).ready) return null;
    var needed = Math.min(bank.length,Math.max(1,Math.round(Number(count)||5)));
    var rec = getActivity(activity,false), items=rec.items||{};
    var unique={}, all=[];
    bank.forEach(function(q){var id=questionId(q);if(!unique[id]){unique[id]=true;all.push({q:q,id:id,rec:items[id]||null});}});
    needed=Math.min(needed,all.length);
    var weak=[], review=[], normal=[];
    shuffle(all).forEach(function(item){
      var r=item.rec;
      if (r && Number(r.wrong)>=2 && Number(r.wrong) >= Number(r.correct)) weak.push(item);
      else if (r && Number(r.wrong)>0) review.push(item);
      else normal.push(item);
    });
    weak.sort(function(a,b){return (Number(b.rec.wrong)-Number(b.rec.correct))-(Number(a.rec.wrong)-Number(a.rec.correct));});
    review.sort(function(a,b){return (Number(b.rec.lastWrongAt)||0)-(Number(a.rec.lastWrongAt)||0);});
    // 40% 苦手 / 30% 復習 / 30% 通常。候補不足は他の区分から補充。
    var nWeak=Math.round(needed*0.4), nReview=Math.floor(needed*0.3);
    var picked=weak.splice(0,nWeak).concat(review.splice(0,nReview));
    picked=picked.concat(normal.splice(0,Math.max(0,needed-picked.length)));
    picked=picked.concat(weak,review,normal).slice(0,needed);
    return shuffle(picked).map(function(v){return v.q;});
  }
  function summary() {
    var activityIds = Object.keys(load().activities), total=0, wrong=0, tasks=0;
    activityIds.forEach(function(id){var s=stats(id);if(s.total){total+=s.total;wrong+=s.wrong;tasks++;}});
    return {activities:tasks,total:total,wrong:wrong,readyActivities:activityIds.filter(function(id){return stats(id).ready;}).length};
  }
  function renderSettings() {
    var host = root.document && document.getElementById('personalReviewStatus');
    if (!host) return;
    var s=summary();
    host.textContent = '学習履歴：'+s.total+'問（うち不正解 '+s.wrong+'問）／'+s.activities+
      '課題。各課題で採点済み5問以上から苦手問題を優先します。'+
      (enabled()?' ON：端末内で学習します。':' OFF：通常出題のみです。');
  }
  root.KotobaPersonalReview={enabled:enabled,questionId:questionId,markShown:markShown,markHint:markHint,
    recordAnswer:recordAnswer,recordExternal:recordExternal,select:select,stats:stats,summary:summary,renderSettings:renderSettings};
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',renderSettings);
  else renderSettings();
})(window);
