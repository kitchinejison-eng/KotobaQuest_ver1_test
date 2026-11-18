/* ことばクエスト：FREE広告表示管理（テスト版）
 * 現状は画面内の広告サンプル枠のみ。広告SDK/通信/追跡/自動動画再生は行わない。
 * 課金認証や個人の学習・障害・プロフィール情報を一切参照しない。
 * 今後の商用広告は法令/ストア規約を確認し、別途公式SDKを接続すること。
 */
(function (global) {
  'use strict';
  if (global.KotobaAds) return;
  var placements = Object.freeze(['title', 'genre', 'result']);
  var provider = null;
  var started = false;
  var currentPlan = '';
  function plan() {
    try { return global.KotobaPlan && global.KotobaPlan.getPlan() === 'premium' ? 'premium' : 'free'; }
    catch (_) { return 'free'; }
  }
  function byId(id) { return document.getElementById(id); }
  function eligible() { return plan() === 'free'; }
  function findSlots() { return Array.prototype.slice.call(document.querySelectorAll('[data-kq-ad-slot]')); }
  function clearProvider(slot) {
    var host = slot.querySelector('.kq-ad-provider-host');
    if (!host) return;
    if (slot.dataset.kqAdProvider === 'active' && provider && typeof provider.destroy === 'function') {
      try { provider.destroy(host, slot.getAttribute('data-kq-ad-slot')); } catch (err) { console.warn('広告枠の解放', err); }
    }
    host.replaceChildren();
    slot.dataset.kqAdProvider = 'test';
  }
  function showWithProvider(slot) {
    if (!provider || typeof provider.render !== 'function') return;
    if (slot.dataset.kqAdProvider === 'active') return;
    var host = slot.querySelector('.kq-ad-provider-host');
    if (!host) return;
    try {
      var result = provider.render(host, slot.getAttribute('data-kq-ad-slot'));
      // 導入先SDKが実際の広告要素を生成した時だけ置換。未配信ならテスト枠を残す。
      if (result === true && host.childNodes.length > 0) slot.dataset.kqAdProvider = 'active';
    } catch (err) {
      host.replaceChildren();
      console.warn('広告の読込に失敗しました（テスト枠を継続）', err);
    }
  }
  function refresh() {
    var free = eligible();
    currentPlan = free ? 'free' : 'premium';
    findSlots().forEach(function (slot) {
      if (!free) clearProvider(slot);
      slot.hidden = !free;
      slot.setAttribute('aria-hidden', free ? 'false' : 'true');
      if (free) showWithProvider(slot);
    });
    var status = byId('kqAdPlanStatus');
    if (status) status.textContent = free
      ? 'FREE：タイトル・ジャンル選択・練習結果に広告枠を表示します（現在はテスト広告のみ）。'
      : 'PREMIUM：広告は非表示です。';
  }
  function openPlanSettings() {
    var action = byId('kqTitlePlanAction');
    if (action && typeof action.click === 'function') { action.click(); return true; }
    var button = byId('titleSettingsBtn');
    if (!button) return false;
    button.click();
    var panel = byId('kqPlanPanel');
    if (panel) {
      var scroll = function(){ if (typeof panel.scrollIntoView === 'function') panel.scrollIntoView({block:'start'}); };
      if (global.requestAnimationFrame) global.requestAnimationFrame(scroll); else scroll();
    }
    return true;
  }
  function initialize() {
    if (started) return;
    started = true;
    document.querySelectorAll('.kq-ad-upgrade').forEach(function (button) {
      button.addEventListener('click', openPlanSettings);
    });
    refresh();
  }
  global.KotobaAds = Object.freeze({
    refresh: refresh,
    isEligible: eligible,
    getPlan: plan,
    getPlacements: function(){ return placements.slice(); },
    // テスト専用のアダプタ境界。公式SDKとIDの準備ができるまで接続しない。
    setProvider: function (next) {
      findSlots().forEach(clearProvider);
      provider = next && typeof next.render === 'function' ? next : null;
      refresh();
      return !!provider;
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
  document.addEventListener('kotoba:plan-change', refresh);
  global.addEventListener('pageshow', refresh);
  global.addEventListener('storage', function(event){
    var key = global.KotobaPlan && global.KotobaPlan.storageKey;
    if (key && event.key === key) refresh();
  });
})(window);
