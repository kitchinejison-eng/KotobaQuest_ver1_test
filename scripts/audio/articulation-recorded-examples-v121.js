/*
 * 【構音筋ビジュアルナビゲーション：アフレコ音声】
 * 使い方：お手本ボタンで録音したMP3を一度だけ再生します。
 * 提供者が日本語の発音名で整理したMP3を、扱いやすい英字ファイル名へ変更しました。
 * 現行の出題28音すべてに録音を割り当てています。
 * 注意：録音の発音そのものの精度は、開発者・支援者による試聴で確認してください。
 * ここで使うファイルは voice/articulation/ にあります。
 * 他のトレーニングの標準読み上げ、マイク認識、学習記録には影響させません。
 */
(function(){
  'use strict';
  if(window.KotobaArticulationSamples) return;
  // 【編集時の注意】日本語の出題音 → 英字のMP3ファイル名
  // MP3を差し替える場合は、voice/articulation/ の同名ファイルを上書きするだけです。
  // 新しい発音を追加するときは、この対応表と voice/audio-map.json の両方を更新してください。
  var files = {
    "か": "ka.mp3",
    "き": "ki.mp3",
    "く": "ku.mp3",
    "け": "ke.mp3",
    "こ": "ko.mp3",
    "し": "shi.mp3",
    "た": "ta.mp3",
    "ち": "chi.mp3",
    "て": "te.mp3",
    "と": "to.mp3",
    "な": "na.mp3",
    "ね": "ne.mp3",
    "は": "ha.mp3",
    "へ": "he.mp3",
    "ほ": "ho.mp3",
    "ま": "ma.mp3",
    "み": "mi.mp3",
    "む": "mu.mp3",
    "め": "me.mp3",
    "も": "mo.mp3",
    "や": "ya.mp3",
    "ゆ": "yu.mp3",
    "よ": "yo.mp3",
    "ファ": "fa.mp3",
    "フィ": "fi.mp3",
    "フェ": "fe.mp3",
    "フォ": "fo.mp3",
    "ヴァ": "va.mp3"
  };
  // ボイスファイル本体。全28音を voice/articulation/ に格納しています。
  var base = 'voice/articulation/';
  var currentAudio = null;
  var currentFinish = null;
  function clean(value){return String(value || '').trim();}
  function has(value){return Object.prototype.hasOwnProperty.call(files,clean(value));}
  function fileFor(value){return has(value)?base+files[clean(value)]:null;}
  // 問題を切り替えた場合や、別画面へ移った場合は、残った録音を必ず停止します。
  function stop(){
    var old = currentAudio;
    var finish = currentFinish;
    currentAudio = null;
    currentFinish = null;
    if(old){
      try{old.pause();old.currentTime=0;}catch(_){}
      old.onended = null;
      old.onerror = null;
    }
    // 再生待ちのPromiseも解放し、古い状態を画面へ残さない。
    if(finish) finish({ok:false,reason:'interrupted'});
  }
  // 音量は読み上げ設定と共通。音声ON/OFFも尊重します。
  function volume(){
    if(window.KotobaAudio){
      if(!window.KotobaAudio.isTtsOn())return 0;
      return Math.min(1,Math.max(0,Number(window.KotobaAudio.effectiveTts())||0));
    }
    return 0.65;
  }
  function play(value){
    stop();
    var sound = fileFor(value);
    if(!sound)return Promise.resolve({ok:false,reason:'missing'});
    var level=volume();
    if(level<=0)return Promise.resolve({ok:false,reason:'muted'});
    if(typeof Audio!=='function')return Promise.resolve({ok:false,reason:'unsupported'});
    var player;
    try{player=new Audio(sound);player.preload='auto';player.volume=level;}catch(_){return Promise.resolve({ok:false,reason:'unsupported'});}
    currentAudio=player;
    // 音声合成が先に流れていた場合、録音MP3と混ざらないよう止めます。
    try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_){}
    return new Promise(function(resolve){
      var settled=false;
      function finish(result){
        if(settled)return;
        settled=true;
        player.onended=null;
        player.onerror=null;
        if(currentAudio===player)currentAudio=null;
        if(currentFinish===finish)currentFinish=null;
        resolve(result);
      }
      currentFinish=finish;
      player.onended=function(){finish({ok:true,reason:'completed'});};
      player.onerror=function(){finish({ok:false,reason:'load-error'});};
      try{
        var pending=player.play();
        if(pending&&typeof pending.catch==='function')pending.catch(function(){finish({ok:false,reason:'play-error'});});
      }catch(_){finish({ok:false,reason:'play-error'});}
    });
  }
  window.KotobaArticulationSamples={has:has,fileFor:fileFor,play:play,stop:stop,files:Object.freeze(files)};
})();
