(function(){
 'use strict';
 function time(t){if(!Number.isFinite(t))return '0:00';return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');}
 function render(data,esc){
  var records=data.historical_records||[];
  function link(e,cls){return '<a class="'+cls+'" href="'+esc(e.url||e.primary_url)+'" target="_blank" rel="noopener">'+esc(e.label||e.primary_label)+'<span aria-hidden="true">↗</span></a>';}
  function audioCard(e,i){
   var m=(data.history_audio||{})[e.url]||{duration:null,bars:[],ok:false,sourceAvailable:false,message:'音频元数据待核验。'},match=String(e.label||'').match(/方案\s*([AB])(?=\s|历史|伴奏|试听|$)/),title=match?'方案 '+match[1]:(e.label||'音频');
   var bars=(m.bars||[]).map(function(v,j){var h=56*v;return '<rect x="'+(j*4+1)+'" y="'+((64-h)/2)+'" width="2" height="'+h+'" rx="1"/>';}).join('');
   return '<article class="ha-audio" data-audio-card data-metadata-ok="'+String(!!m.ok)+'"><h3>'+esc(title)+'</h3><div class="ha-wave" aria-hidden="true">'+(bars?'<svg viewBox="0 0 224 64">'+bars+'</svg>':'<span>波形待核验</span>')+'</div><audio preload="metadata"'+(m.sourceAvailable?' src="'+esc(e.url)+'"':'')+'></audio><div class="ha-controls"><button type="button" class="ha-play" aria-label="播放'+esc(title)+'" aria-pressed="false"'+(!m.sourceAvailable?' disabled':'')+'><span aria-hidden="true">▶</span><span class="ha-play-text">播放</span></button><output class="ha-clock">0:00 / '+(Number.isFinite(m.duration)?time(m.duration):'—')+'</output></div><input class="ha-seek" type="range" min="0" max="'+(m.duration||0)+'" value="0" step="0.05" aria-label="'+esc(title)+'播放进度" aria-valuetext="0:00"'+(!m.sourceAvailable?' disabled':'')+'><p class="ha-error" role="status"'+(m.ok?' hidden':'')+'>'+esc(m.message||'')+'</p></article>';
  }
  var rows=records.map(function(item,i){
   var audio=(item.evidence||[]).filter(e=>e.audio),links=(item.evidence||[]).filter(e=>!e.audio);
   var kind={backstage_v1_history:'程式化伴奏',research_hybrid_v1_history:'混合架构',anyaccomp_zero_shot_history:'预训练基线'}[item.id]||'历史方案';
   return '<section class="ha-record" data-record-id="'+esc(item.id||'')+'" id="ha-record-'+i+'"><aside class="ha-index"><span class="ha-node">0'+(i+1)+'</span><p>'+kind+'</p><code>'+esc(item.version)+'</code></aside><article class="ha-entry"><div class="ha-entry-top"><span class="ha-chip">'+esc(item.status)+'</span><span class="ha-record-tag">ARCHIVE / 0'+(i+1)+'</span></div><h2>'+esc(item.title)+'</h2><p class="ha-summary">'+esc(item.summary)+'</p>'+link(item,'ha-primary')+(audio.length?'<div class="ha-listening"><div class="ha-listening-head"><h3>听听当时的结果</h3><span>'+audio.length+' 段音频</span></div><p class="ha-use-note">伴奏仅供个人使用，其他用途需另行获得许可。</p><div class="ha-audio-grid">'+audio.map(audioCard).join('')+'</div></div>':'')+'<div class="ha-evidence"><h3>相关资料 <span>'+String(links.length).padStart(2,'0')+'</span></h3><div>'+links.map(e=>link(e,'ha-evidence-link')).join('')+'</div></div></article></section>';
  }).join('');
  return '<div class="ha-page"><header class="ha-heading"><span class="ha-kicker">PROJECT ARCHIVE</span><div><h1>历史实现</h1><span class="ha-count">'+String(records.length).padStart(2,'0')+'<small>份方案档案</small></span></div><p>回看走过的路线，保留可以追溯的声音与记录。</p></header><div class="ha-boundary"><span aria-hidden="true">↳</span><p>本页收录历史工程实现与预训练基线，不计入当前微调研究进度。</p></div><div class="ha-timeline">'+rows+'</div><footer class="ha-end"><p>历史记录留在这里，新的研究继续向前。</p></footer></div>';
 }
 function mount(root){
  var disposed=false,desired=null,removers=[],audios=[];
  function listen(target,type,handler){target.addEventListener(type,handler);removers.push(function(){target.removeEventListener(type,handler);});}
  root.querySelectorAll('[data-audio-card]').forEach(function(card){
   var a=card.querySelector('audio'),button=card.querySelector('.ha-play'),seek=card.querySelector('.ha-seek'),clock=card.querySelector('.ha-clock'),error=card.querySelector('.ha-error');audios.push(a);
   var name=card.querySelector('h3').textContent;
   function sync(){var playing=!a.paused&&!a.ended;button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',(playing?'暂停':'播放')+name);button.firstElementChild.textContent=playing?'Ⅱ':'▶';button.querySelector('.ha-play-text').textContent=playing?'暂停':'播放';card.classList.toggle('is-playing',playing);}
   function progress(){var d=Number.isFinite(a.duration)&&a.duration>0?a.duration:Number(seek.max),known=d>0;seek.max=known?d:0;seek.value=a.currentTime;seek.setAttribute('aria-valuetext',time(a.currentTime)+' / '+(known?time(d):'待核验'));clock.textContent=time(a.currentTime)+' / '+(known?time(d):'—');seek.style.setProperty('--played',(known?a.currentTime/d*100:0)+'%');}
   function failure(message){if(disposed)return;error.textContent=message;error.hidden=false;a.pause();if(desired===a)desired=null;sync();}
   listen(button,'click',async function(){
    if(disposed)return;
    if(!a.paused){desired=null;a.pause();return;}
    desired=a;audios.forEach(function(other){if(other!==a)other.pause();});
    try{await a.play();if(disposed||desired!==a){a.pause();return;}if(card.dataset.metadataOk==='true')error.hidden=true;}
    catch(e){if(!disposed&&desired===a)failure('暂时无法播放，请重试。');}
   });
   listen(seek,'input',function(){if(disposed||!a.readyState)return;try{a.currentTime=Math.min(Number(seek.value),Number.isFinite(a.duration)?a.duration:Number(seek.max));progress();}catch(e){failure('暂时无法定位，请重试。');}});
   listen(a,'play',function(){if(disposed||desired!==a){a.pause();return;}audios.forEach(function(other){if(other!==a)other.pause();});sync();});
   listen(a,'pause',sync);
   listen(a,'ended',function(){if(desired===a)desired=null;sync();progress();});
   listen(a,'timeupdate',progress);listen(a,'loadedmetadata',progress);listen(a,'durationchange',progress);
   listen(a,'error',function(){failure('音频未能加载，请核对资源后重试。');});
   sync();progress();
  });
  function dispose(){
   if(disposed)return;disposed=true;desired=null;
   removers.forEach(function(remove){remove();});removers=[];
   audios.forEach(function(a){a.pause();a.removeAttribute('src');a.load();});audios=[];
  }
  listen(window,'pagehide',dispose);
  return dispose;
 }
 window.GeziHistory={render:render,mount:mount};
})();
