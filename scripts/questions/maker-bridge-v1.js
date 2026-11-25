/* Runtime bank contract for future versions of KotobaQuest Maker. */
(function(root){'use strict';
var ids=['mouth','sound','stepup','repeat','mora','accent','sentenceRhythm','listen','instruction','tf','matching','copy','anagram','naming','cue','fill','gesture','board','roleplay','aac','kotobaQuestClassic'];
var banks=root.QUESTIONS||{};
if(root.KotobaCueImages)root.KotobaCueImages.populate(banks.cue);
function snapshot(){var data={schemaVersion:1,appVersion:'2.7.0',banks:{}};ids.forEach(function(id){if(Array.isArray(banks[id]))data.banks[id]=banks[id];});return JSON.parse(JSON.stringify(data));}
function exportFile(){var blob=new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='maker-runtime-banks.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
root.KotobaQuestMakerBridge={schemaVersion:1,appVersion:'2.7.0',snapshot:snapshot,exportFile:exportFile};
// Maker v2.2 output also installs this capture handler; stopping immediate propagation avoids duplicate speech.
var btn=document.getElementById('speakBtn');if(btn)btn.addEventListener('click',function(e){var q=root.questions&&root.questions[root.current];if(q&&typeof q.makerListenText==='string'&&q.makerListenText.trim()&&typeof root.speak==='function'){e.stopImmediatePropagation();root.speak(q.makerListenText,true);}},true);
})(window);
