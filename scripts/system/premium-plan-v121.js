/* ことばクエスト ver1.2.1 テスト版プラン管理。
 * 課金処理はありません。パスワードはクライアント側にあり、本番の認証には使用できません。
 * 既存の学習記録・熟練度・プロフィールの保存キーには一切書き込みません。
 */
(function (global) {
  'use strict';
  if (global.KotobaPlan) return;
  var PLAN_KEY = 'kotobaquest_plan_test_v121';
  var AVATAR_KEY = 'kotobaquest_premium_avatar_frame_v121';
  var SECRET = 'eji1125'; // テスト版だけ。正式リリース前に削除すること。
  var freeTheme = {blue:'#1976d2',red:'#c93d55',yellow:'#b68208',green:'#19875b',purple:'#7550b5'};
  var script = document.currentScript;
  var iconRoot = (script && script.getAttribute('data-icon-root')) || 'images/app-icons/';
  var premium = false;
  var listeners = [];
  function getValue(key, fallback) { try { var v = global.localStorage.getItem(key); return v === null ? fallback : v; } catch (_) { return fallback; } }
  function saveValue(key, value) { try { global.localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  premium = getValue(PLAN_KEY, 'free') === 'premium';
  function byId(id) { return document.getElementById(id); }
  function isPremium() { return !!premium; }
  function getPlan() { return premium ? 'premium' : 'free'; }
  var plannedFeatures = Object.freeze({extraRpg:true,extra3d:true,extraDungeon:true,extraTraining:true,costumes:true,advancedAnalysis:true,learningGraphs:true,profileBackgrounds:true});
  function hasFeature(name) { if (name === 'goldTheme' || name === 'goldProfileFrame') return premium; return false; } // 未実装特典は常に未提供
  function dispatch() {
    listeners.slice().forEach(function (fn) { try { fn(getPlan()); } catch (e) { console.warn(e); } });
    try { document.dispatchEvent(new CustomEvent('kotoba:plan-change', {detail:{plan:getPlan()}})); } catch (_) {}
  }
  function syncNativeIcon() {
    try {
      if (global.KotobaNativeBridge && typeof global.KotobaNativeBridge.setPremiumLauncherIcon === 'function') {
        global.KotobaNativeBridge.setPremiumLauncherIcon(premium);
      }
    } catch (e) { console.warn('ランチャーアイコン更新は利用できません', e); }
  }
  function updateIcons() {
    var src = iconRoot + (premium ? 'icon-premium-192.png' : 'icon-192.png');
    var shortcut = document.querySelector('link[rel="icon"]');
    if (shortcut) shortcut.href = src;
    var apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (apple) apple.href = src;
    // PWA manifest はインストール済みアプリのアイコンを即時変更できないブラウザがあります。
    var manifest = document.querySelector('link[rel="manifest"]');
    if (manifest && global.location && global.location.protocol !== 'file:') {
      var current = manifest.getAttribute('href') || 'manifest.webmanifest';
      var base = current.split('?')[0].replace(/manifest(?:-premium)?\.webmanifest$/,'');
      manifest.href = base + (premium ? 'manifest-premium.webmanifest' : 'manifest.webmanifest') + '?v=121-premium-test';
    }
    var brand = byId('kqPremiumTitleIcon');
    if (brand) brand.src = iconRoot + 'icon-premium-192.png';
  }
  function updateMetaColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var base = getValue('kotobaquest_theme_v3','blue');
    meta.content = premium ? '#D4AF37' : (freeTheme[base] || '#1976d2');
  }
  function showStatus(message, error) {
    var el = byId('kqPlanMessage');
    if (el) { el.textContent = message; el.classList.toggle('kq-plan-error', !!error); }
  }
  function updateUI() {
    var root = document.documentElement;
    if (root) root.setAttribute('data-kq-plan', getPlan());
    if (document.body) {
      document.body.setAttribute('data-kq-plan', getPlan());
      var frame = getValue(AVATAR_KEY, 'normal');
      document.body.classList.toggle('kq-avatar-gold', premium && frame === 'gold');
    }
    var isGame = /(?:pictogram-3d|cat-word-race|cat-word-puzzle|shiba-burger|kotoba-quest-ud|kotoba-card-game)(?:\/|\.html)/.test(global.location.pathname);
    if (root) root.setAttribute('data-kq-game', isGame ? 'yes' : 'no');
    // タイトル画面にFREE/PREMIUMの現在の状態を常時表示する。
    var titleCard = byId('kqTitlePlanCard');
    if (titleCard) titleCard.setAttribute('data-current-plan', getPlan());
    var titleName = byId('kqTitlePlanName');
    if (titleName) titleName.textContent = premium ? '👑 PREMIUM' : 'FREE';
    var titlePrice = byId('kqTitlePlanPrice');
    if (titlePrice) titlePrice.textContent = premium ? 'テスト利用中・請求なし' : '月額0円';
    var titleDescription = byId('kqTitlePlanDescription');
    if (titleDescription) titleDescription.textContent = premium
      ? 'ゴールドテーマと金色のプロフィール装飾をご利用中です。'
      : 'プレミアムで、特別なゴールドテーマを体験できます。';
    var titleDetail = byId('kqTitlePlanDetail');
    if (titleDetail) titleDetail.textContent = premium
      ? '追加ステージ・高度分析などは今後追加予定です。正式版の想定価格は月額980円。'
      : 'プレミアム月額980円は正式版の想定価格です。今は課金されません。';
    var titleActionLabel = byId('kqTitlePlanActionLabel');
    if (titleActionLabel) titleActionLabel.textContent = premium ? 'プランの詳細を見る' : 'プレミアムを見る';
    var planLabel = byId('kqCurrentPlan');
    if (planLabel) planLabel.textContent = premium ? 'PREMIUM（テスト中・課金なし）' : 'FREE（月額0円）';
    var form = byId('kqPremiumUnlockForm');
    if (form) form.hidden = premium;
    var revert = byId('kqPlanRevert');
    if (revert) revert.hidden = !premium;
    var pending = byId('kqPremiumPlanned');
    if (pending) pending.textContent = premium ? 'プレミアム限定の追加ステージ・教材・衣装・高度分析は今後追加予定です。' : '追加ステージ・教材・衣装・高度分析はプレミアム向けに今後追加予定です。';
    var help = byId('kqGoldThemeNote');
    if (help) help.hidden = !premium;
    var avatarArea = byId('kqPremiumAvatarOptions');
    if (avatarArea) avatarArea.hidden = !premium;
    var avatarSelect = byId('kqPremiumAvatarFrame');
    if (avatarSelect) avatarSelect.value = getValue(AVATAR_KEY,'normal') === 'gold' ? 'gold' : 'normal';
    document.querySelectorAll('[data-kq-premium-badge]').forEach(function (item) { item.hidden = !premium; });
    updateIcons(); updateMetaColor();
  }
  function setPlan(next) {
    if (next !== 'free' && next !== 'premium') return false;
    var changed = premium !== (next === 'premium');
    if (!saveValue(PLAN_KEY, next)) {
      showStatus('プラン状態を保存できません。ブラウザの保存設定を確認してください。', true);
      return false;
    }
    premium = next === 'premium';
    updateUI(); syncNativeIcon();
    if (changed) dispatch();
    return true;
  }
  function unlock(password) {
    if (password !== SECRET) return false;
    return setPlan('premium');
  }
  function initialize() {
    updateUI();
    // 設定の既存遷移を使うため、学習記録や画面遷移の状態を直接操作しない。
    var titleAction = byId('kqTitlePlanAction');
    if (titleAction && !titleAction.dataset.kqPlanBound) {
      titleAction.dataset.kqPlanBound = '1';
      titleAction.addEventListener('click', function () {
        var settingsButton = byId('titleSettingsBtn');
        var planPanel = byId('kqPlanPanel');
        if (!settingsButton || !planPanel) return;
        settingsButton.click();
        // 設定画面が可視化された後に料金プラン欄を表示。
        var moveToPanel = function () {
          if (planPanel.scrollIntoView) planPanel.scrollIntoView({block:'start',behavior:'auto'});
          // 入力前に詳細情報を読めるよう、パスワード欄には自動フォーカスしない。
        };
        if (typeof global.requestAnimationFrame === 'function') global.requestAnimationFrame(moveToPanel);
        else moveToPanel();
      });
    }
    var form = byId('kqPremiumUnlockForm');
    if (form && !form.dataset.kqPlanBound) {
      form.dataset.kqPlanBound = '1';
      form.addEventListener('submit',function (event) {
        event.preventDefault();
        var input = byId('kqPremiumPassword');
        var password = input ? input.value : '';
        if (input) input.value = '';
        if (password !== SECRET) { showStatus('パスワードが正しくありません',true); return; }
        if (unlock(password)) showStatus('プレミアムプランが解放されました！ゴールドテーマとプレミアム限定機能をお楽しみください。',false);
      });
    }
    var revert = byId('kqPlanRevert');
    if (revert && !revert.dataset.kqPlanBound) {
      revert.dataset.kqPlanBound = '1';
      revert.addEventListener('click',function () {
        if (!isPremium()) return;
        if (global.confirm && !global.confirm('テスト用：フリープランに戻しますか？学習記録・熟練度・プロフィールは保持されます。')) return;
        if (setPlan('free')) showStatus('フリープランに戻しました。学習記録は保持されています。',false);
      });
    }
    var avatarSelect = byId('kqPremiumAvatarFrame');
    if (avatarSelect && !avatarSelect.dataset.kqPlanBound) {
      avatarSelect.dataset.kqPlanBound = '1';
      avatarSelect.addEventListener('change',function () {
        if (!isPremium()) { avatarSelect.value = 'normal'; return; }
        saveValue(AVATAR_KEY, avatarSelect.value === 'gold' ? 'gold' : 'normal');
        updateUI();
      });
    }
    syncNativeIcon();
  }
  global.KotobaPlan = Object.freeze({
    getPlan:getPlan, isPremium:isPremium, hasFeature:hasFeature,
    isPlanned:function(name){return !!plannedFeatures[name];},
    unlock:unlock, refresh:updateUI,
    subscribe:function(fn){if(typeof fn!=='function')return function(){};listeners.push(fn);return function(){listeners=listeners.filter(function(f){return f!==fn;});};},
    storageKey:PLAN_KEY
  });
  document.documentElement.setAttribute('data-kq-plan',getPlan());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
  else initialize();
  global.addEventListener('load', updateUI);
  global.addEventListener('pageshow', updateUI);
  global.addEventListener('storage',function (e) {
    if (e.key === PLAN_KEY) { premium = getValue(PLAN_KEY,'free') === 'premium'; updateUI(); syncNativeIcon(); dispatch(); }
  });
})(window);
