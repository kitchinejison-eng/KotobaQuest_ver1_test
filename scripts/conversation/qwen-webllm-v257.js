/* ことばクエスト Ver2.5.7 | 無料・任意のブラウザ内Qwen3試験実装
 * ネットワークへ文章を送信しない WebLLM。外部サーバー/APIキー不要。
 * WebGPUとモデル保存容量が必要。外部のWebLLM配布JS/モデルの初回取得のみ通信。
 * このコードは読み込み・推論が失敗したときに例外を返し、UI側がルール式へ切り替える。
 */
(function(root){
  'use strict';
  var MODEL_ID = 'Qwen3-1.7B-q4f16_1-MLC';
  var CDN_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.89';
  var engine = null, loading = null, phase = 'idle', pct = 0;
  var listeners = [];
  function notify(nextPhase, message, progress){
    phase = nextPhase;
    if (typeof progress === 'number' && Number.isFinite(progress)) pct = Math.max(0,Math.min(100,Math.round(progress*100)));
    listeners.slice().forEach(function(fn){try{fn({phase:phase,message:message,progress:pct,model:MODEL_ID});}catch(e){}});
  }
  function onStatus(fn){listeners.push(fn); return function(){listeners=listeners.filter(function(x){return x!==fn;});};}
  async function checkSupport(){
    if (!root.isSecureContext) throw new Error('HTTPSまたはlocalhostで開いてください。');
    if (!root.navigator || !navigator.gpu || typeof navigator.gpu.requestAdapter !== 'function') throw new Error('このブラウザはWebGPUに対応していません。');
    var adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('GPUを利用できません。ブラウザ・端末を確認してください。');
    return true;
  }
  async function waitForServiceWorker(){
    if (!navigator.serviceWorker) return;
    // 初回のCDNスクリプトもサービスワーカーで保管するため、短時間だけ登録を待つ。
    try{ await Promise.race([navigator.serviceWorker.ready,new Promise(function(resolve){setTimeout(resolve,4000);})]); }catch(e){}
  }
  function load(){
    if(engine) return Promise.resolve(engine);
    if(loading) return loading;
    loading=(async function(){
      try {
        notify('checking','端末の対応状況を確認しています。',0);
        await checkSupport();
        await waitForServiceWorker();
        notify('loading','WebLLMを読み込んでいます。初回は通信が必要です。',0);
        var pkg = await import(CDN_URL);
        if(!pkg.CreateMLCEngine || !pkg.prebuiltAppConfig || !pkg.prebuiltAppConfig.model_list.some(function(m){return m.model_id===MODEL_ID;})){
          throw new Error('選択したQwen3モデルがWebLLMに登録されていません。');
        }
        var config=Object.assign({},pkg.prebuiltAppConfig,{cacheBackend:'cache'});
        notify('loading','モデルを準備しています。初回は1GB以上のダウンロードが必要です。',0);
        var loaded=await pkg.CreateMLCEngine(MODEL_ID,{
          appConfig:config,
          initProgressCallback:function(p){
            var progress=typeof p.progress==='number' ? p.progress : 0;
            notify('loading',p.text || 'モデルを読み込み中…',progress);
          }
        });
        engine=loaded;
        notify('ready','Qwen3-1.7Bを利用できます。生成AIの返信を有効にしました。',1);
        return engine;
      }catch(error){
        engine=null;
        notify('error',error && error.message || 'モデルを読み込めませんでした。',0);
        throw error;
      }finally{loading=null;}
    })();
    return loading;
  }
  function cleanAnswer(value){
    return String(value || '')
      .replace(/<think>[\s\S]*?<\/think>/gi,'')
      .replace(/^\s*<think>[\s\S]*$/gi,'')
      .replace(/<\/?(?:think|answer)>/gi,'')
      .trim().slice(0,500);
  }
  async function reply(messages){
    if(!engine) throw new Error('生成AIがまだ利用可能になっていません。');
    var completion=await engine.chat.completions.create({
      messages:messages, temperature:0.65, top_p:0.85, max_tokens:180,
      enable_thinking:false, stream:false
    });
    var text=cleanAnswer(completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content);
    if(!text) throw new Error('生成AIから有効な返信がありませんでした。');
    return text;
  }
  function ready(){return Boolean(engine);}
  function status(){return {phase:phase,progress:pct,ready:ready(),model:MODEL_ID};}
  root.KotobaQwenBrowserAI={MODEL_ID:MODEL_ID,checkSupport:checkSupport,load:load,reply:reply,ready:ready,status:status,onStatus:onStatus};
})(window);
