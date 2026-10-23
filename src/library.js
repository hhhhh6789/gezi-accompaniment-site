/* Alternating document sections based on the user's uploaded layout. */
window.GeziLibrary = {
 render(data,esc){
   const docs=(data.documents||[]).map(doc=>Object.assign({},doc,{
     title:doc.path===(data.finetuning||{}).document_path?'AnyAccomp 歌仔戏微调':doc.title,
     description:doc.path===(data.finetuning||{}).document_path?'当前进展、两轮训练、验证听验与下一步。':
       /929训练数据采集/.test(doc.path)?'已验收规模、录音划分、交付结果与使用边界。':doc.description
   }));
   // Reuse the existing ID mapping, then read the original source status.
   const stage=(id,fallback)=>{
     const mapped=((data.overview_progress||{}).stages||[]).filter(s=>s.id===id);
     const rows=mapped.length===1?((data.progress||{}).stages||[]).filter(s=>s.name===mapped[0].name):[];
     const s=rows.length===1&&rows[0].kind===mapped[0].kind?rows[0]:null;
     return s?{id,name:fallback,status:mapped[0].short_status,done:s.kind==='done'}:{id,name:fallback,status:'来源待核对',done:false};
   };
   function panel(doc){
     if(doc.path===(data.finetuning||{}).document_path){
       const f=data.finetuning;
       return '<div class="pl-document"><div class="pl-paper-top">当前模型实验 <small>文档快照 '+esc(f.updated_at)+'</small></div><h3>训练之后，<br>继续验证音乐。</h3><div class="pl-record-list"><div><span>第二轮训练</span><small>'+f.second_round.epochs+'轮／'+f.second_round.steps+'步</small></div><div><span>当前阶段</span><small>'+esc(f.active_stage.id)+' 听验与定位</small></div><div><span>整体音乐质量</span><small>尚未通过验收</small></div></div><div class="pl-paper-foot"><span>模型微调概览</span><span aria-hidden="true">↗</span></div></div>';
     }

     if(doc.url && doc.url===(data.progress||{}).document_url){
       const items=[stage('stage-download','录音来源与收集'),stage('stage-preserve','完整录音保存'),stage('stage-separation','分离方案选择')];
       return '<div class="pl-document"><div class="pl-paper-top"><span class="pl-paper-icon" aria-hidden="true">▤</span><span>数据准备记录</span><small>进度来源</small></div><h3>从完整录音，<br>到配对唱段。</h3><div class="pl-record-list">'+items.map(s=>'<div><span>'+esc(s.name)+'</span><small class="'+(s.done?'pl-checked':'')+'">'+esc(s.status)+'</small></div>').join('')+'</div><div class="pl-paper-foot"><span>929 训练数据采集</span><span aria-hidden="true">↗</span></div></div>';
     }
     if(doc.path==='deploy/cloud_anyaccomp/README.md'){
       return '<div class="pl-document"><div class="pl-paper-top"><span class="pl-paper-icon" aria-hidden="true">▤</span><span>AnyAccomp</span><small>文档提要</small></div><h3>运行之前，<br>准备与留存。</h3><div class="pl-outline"><div><span>01</span><strong>输入样例与清单</strong><small>来源与音频记录</small></div><div><span>02</span><strong>代码与模型版本</strong><small>环境与权重记录</small></div><div><span>03</span><strong>输出、配置与日志</strong><small>运行与复现要求</small></div></div><div class="pl-paper-foot"><span>环境准备 · README</span><span aria-hidden="true">↗</span></div></div>';
     }
     return '<div class="pl-document"><div class="pl-paper-top">文档提要</div><h3>'+esc(doc.title)+'</h3><p>'+esc(doc.description)+'</p></div>';
   }
   return '<div class="pl-page"><header class="pl-heading"><span class="pl-kicker">PROJECT LIBRARY</span><h1>当前项目资料</h1><p>从已验收数据到模型微调，按当前问题找到依据。</p></header><div class="pl-sections">'+docs.map((doc,i)=>'<section class="pl-row '+(i%2?'pl-reverse':'')+'" aria-labelledby="pl-title-'+i+'"><div class="pl-copy"><span class="pl-number" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span><div class="pl-category">'+esc(doc.category)+'</div><h2 id="pl-title-'+i+'">'+esc(doc.title)+'</h2><p>'+esc(doc.description)+'</p><a class="pl-read" href="'+esc(doc.url)+'" target="_blank" rel="noopener">阅读文档 <span aria-hidden="true">↗</span></a><details class="pl-source"><summary>文档位置</summary><p>'+esc(doc.path)+'</p></details></div><div class="pl-art" aria-label="'+esc(doc.category)+'内容预览"><div class="pl-ribbon pl-ribbon-one" aria-hidden="true"></div><div class="pl-ribbon pl-ribbon-two" aria-hidden="true"></div>'+panel(doc)+'<img class="pl-mascot" src="assets/opera-musician.svg" alt="" aria-hidden="true"></div></section>').join('')+'</div><footer class="pl-end"><p>这里收录当前项目的主要资料，历史系统与推理记录另行归档。</p><button data-goto="history">查阅历史实现 <span aria-hidden="true">↗</span></button></footer></div>';
 }
};
