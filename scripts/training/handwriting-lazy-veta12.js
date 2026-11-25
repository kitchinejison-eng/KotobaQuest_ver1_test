/*
 * 【PC版・写字／見写し：以前の手書き入力方式を復元】
 * このファイルは「写字・見写し」を開始するときだけOCR・筆跡認識辞書を読み込みます。
 * 通常のゲーム開始時に約20MBのOCRエンジンを読み込まないことで、起動を軽くします。
 * 注意：OCRはWebWorkerを使用するため、ブラウザやfile://環境により利用できない場合があります。
 *       ローカルのJLect候補はOCRとは別に利用できます。
 * 日本語OCRの初回言語モデル取得にはネット接続が必要な場合があります。
 * 著作権と再配布条件は ocr/JLECT_LICENSE.txt / vendorライセンスを参照してください。
 */
(function (root) {
  'use strict';
  var files = [
    'ocr/browser-japanese-ocr.js?v=beta87-multipass-ocr',
    'ocr/kotoba-ink-shape.js?v=beta9-hybrid-ink',
    'ocr/kotoba-kanji-strokes-v92.js?v=92',
    'ocr/kotoba-ink-assist-v92.js?v=92',
    'ocr/kanjivg-style-guide.js?v=1',
    'ocr/kotoba-jlect-model.js?v=1',
    'ocr/kotoba-jlect-candidates.js?v=1'
  ];
  var prepared = null;
  function script(url) {
    return new Promise(function(resolve,reject) {
      var element=document.createElement('script'); element.src=url; element.async=false;
      element.onload=resolve; element.onerror=function(){reject(new Error('認識用データを読み込めませんでした: '+url));};
      document.head.appendChild(element);
    });
  }
  function prepare() {
    if (prepared) return prepared;
    prepared = files.reduce(function(prev,url) {return prev.then(function(){return script(url);});},Promise.resolve())
      .catch(function(e){prepared=null;throw e;});
    return prepared;
  }
  if (typeof root.startActivity === 'function') {
    var original = root.startActivity;
    var requestSequence = 0;
    root.startActivity = function (activityId) {
      // 別の練習に切り替えたら、以前の非同期の写字開始を無効にします。
      var sequence = ++requestSequence;
      if (activityId !== 'copy') return original.apply(this,arguments);
      var context = this, args = arguments;
      var existing = document.getElementById('copyLazyLoading');
      var notice = existing || document.createElement('p');
      if (!existing) {
        notice.id='copyLazyLoading'; notice.setAttribute('role','status');
        notice.style.cssText='padding:10px;margin:8px;border-radius:10px;background:#eef7ff;color:#174564;font-weight:700';
        (document.getElementById('activityCards')||document.body).appendChild(notice);
      }
      notice.textContent='✍️ 手書き入力用の認識データを準備しています…';
      prepare().then(function () {
        // 準備中に別のジャンルを選択した場合は誤って写字画面を開かない。
        if (sequence !== requestSequence) return;
        if (notice.parentNode) notice.parentNode.removeChild(notice);
        original.apply(context,args);
      }).catch(function (error) {
        if (sequence !== requestSequence) return;
        notice.textContent='手書き認識データを読み込めませんでした。保存先が正しいか確認し、もう一度お試しください。';
        console.warn('[写字・見写し] 認識データの準備に失敗:',error);
      });
    };
  }
  root.KotobaHandwritingLazy = {prepare:prepare};
})(window);
