/* Model experiment page; all progress is read from the independent narrative. */
window.GeziExperiments = {
 render(data,esc){
  const f=data.finetuning;
  const link=(url,label)=>'<a href="'+esc(url)+'">'+esc(label)+' <span aria-hidden="true">↗</span></a>';
  const stages=f.stages.map(s=>'<li><details class="ft-stage '+esc(s.kind)+'" '+(s.kind==='active'?'open':'')+'><summary><span class="ft-stage-id">'+esc(s.id)+'</span><strong>'+esc(s.title)+'</strong><span class="ft-stage-status">'+esc(s.status)+'</span></summary><div class="ft-stage-body"><p>'+esc(s.purpose)+'</p><p>'+esc(s.evidence)+'</p></div></details></li>').join('');
  const basis=f.basis.filter(r=>['正式训练','第二轮4组验证均值','两轮验证生成与听验'].includes(r.name)).map(r=>'<div class="ft-result-row" role="row"><strong role="rowheader">'+esc(r.name)+'</strong><span role="cell" data-label="文档记录">'+esc(r.result)+'</span><span role="cell" data-label="结论边界">'+esc(r.limit)+'</span></div>').join('');
  const supports=f.support.map((doc,i)=>'<article class="ft-support"><span>'+String(i+1).padStart(2,'0')+'</span><h3>'+link(doc.url,doc.title)+'</h3><p>'+esc(doc.description)+'</p></article>').join('');
  const metrics=f.comparable_validation.map(r=>'<tr><th scope="row">'+esc(r.label)+'</th><td>'+esc(r.value)+'</td></tr>').join('');
  return `<div class="ft-page">
   <header class="ft-heading"><div><p class="ft-eyebrow">训练与验证 · 文档更新 ${esc(f.updated_at)}</p><h1>模型微调与评价</h1><p class="ft-intro">训练完成之后，继续检验伴奏是否更贴合、更连贯。</p></div><span class="ft-header-state"><i aria-hidden="true"></i>${esc(f.active_stage.id)} 验证听验与定位</span></header>
   <section class="ft-summary" aria-label="模型实验当前状态">
    <article class="ft-stat"><div class="ft-label">研究目标</div><h2>根据人声<br>生成歌仔戏伴奏</h2><p>${esc(f.target)}</p></article>
    <article class="ft-stat"><div class="ft-label">训练运行已完成</div><h2>${f.second_round.epochs} 轮<br>${f.second_round.steps} 步</h2><p>第二轮已完成有界运行与技术核验；两轮独立初始化，不累计成连续训练。</p></article>
    <article class="ft-stat"><div class="ft-label">当前判断</div><h2>音乐效果<br>尚未通过验收</h2><p>数值目标改善；整体可听质量仍待判断，第三轮训练未启动。</p></article>
    <div class="ft-goal-note"><span>当前重点</span><p>${esc(f.next_action)}</p></div>
   </section>
   <nav class="ft-jumps" aria-label="模型页内导航"><a href="#ft-results" data-ft-scroll="ft-results">已有结果</a><a href="#ft-evaluation" data-ft-scroll="ft-evaluation">音乐听验</a><a href="#ft-process" data-ft-scroll="ft-process">实验流程</a><a href="#ft-documents" data-ft-scroll="ft-documents">详情资料</a></nav>
   <section class="ft-white ft-block" aria-labelledby="ft-method"><div class="ft-section-head"><h2 id="ft-method">做了什么</h2></div><p class="ft-body-copy">使用已验收的40首、60对数据，沿用32／4／4首的训练、验证与测试划分。</p><p class="ft-body-copy">人声经冻结旋律编码器输入FM（流匹配模型），生成伴奏频谱，再由冻结声码器还原；只更新FM主路径。</p><p class="ft-body-copy">两轮训练均从原预训练权重独立开始，不合并累计。</p><button data-goto="data" class="ft-inline-link">查看已验收数据 <span aria-hidden="true">↗</span></button></section>
   <section id="ft-results" class="ft-white ft-block" aria-labelledby="ft-results-title"><div class="ft-section-head"><h2 id="ft-results-title">结果说明什么</h2><span class="ft-caption">文档记录，非实时监控</span></div><div class="ft-results" role="table" aria-label="实验结果与结论边界"><div class="ft-result-row ft-result-head" role="row"><span role="columnheader">项目</span><span role="columnheader">已记录的结果</span><span role="columnheader">仍需判断或限制</span></div>${basis}</div><details class="ft-metric"><summary>查看同口径的第二轮验证数值</summary><p>第二轮4组验证均值；短程与长程来自同一学习率轨迹。首轮单组指标口径不同，不放入本表计算收益。</p><table><thead><tr><th scope="col">比较条件</th><th scope="col">验证FM损失</th></tr></thead><tbody>${metrics}</tbody></table><p>${esc(f.metric_limit)}。损失下降不代表音乐质量已改善。</p></details></section>
   <section id="ft-evaluation" class="ft-white ft-block" aria-labelledby="ft-evaluation-title"><div class="ft-section-head"><h2 id="ft-evaluation-title">现在做什么</h2><span class="ft-badge">听验与定位进行中</span></div><p class="ft-body-copy">${esc(f.next_action)}</p><div class="ft-evidence-pair"><article><h3>已确认的局部反馈</h3><p>固定位置的真实伴奏频谱，经声码器重建后获用户认可。这是模块检查，不能计为模型生成伴奏通过。</p></article><article><h3>尚未完成的评价</h3><p>生成伴奏仍有碎片感与连续性问题；测试集最终评价、整体音乐质量与最终验收尚未完成。</p></article></div><div class="ft-material-note"><strong>试听与曲线材料尚未发布</strong><p>本轮接入文档，未同步验证音频、曲线文件或原始运行证据。详情保留原记录与依赖说明，有实际发布材料后再提供试听和曲线。</p>${link(f.support[4].url,'查看听验记录')} ${link(f.support[7].url,'查看连续性定位')}</div></section>
   <section id="ft-process" class="ft-white ft-block" aria-labelledby="ft-process-title"><div class="ft-section-head"><h2 id="ft-process-title">完整实验流程与验收状态</h2><span class="ft-caption">仅 ${esc(f.active_stage.id)} 为当前阶段；展开查看依据</span></div><ol class="ft-stages">${stages}</ol><p class="ft-body-copy">训练、技术核验、音乐听验与最终验收分别记录，不将运行通过计为模型效果通过。</p></section>
   <section id="ft-documents" class="ft-white ft-block" aria-labelledby="ft-documents-title"><div class="ft-section-head"><h2 id="ft-documents-title">按问题查阅详情</h2>${link(f.document_url,'阅读微调完整概览')}</div><div class="ft-supports">${supports}</div></section>
   <aside class="ft-boundary"><div><strong>历史实现单独查阅</strong><p>过往系统与零样本推理不作为本次正式微调成果。</p></div><button data-goto="history">查看历史实现 <span aria-hidden="true">↗</span></button></aside>
   <div class="ft-source"><span>进度来源：${esc(f.document_label)} · ${esc(f.updated_at)}</span>${link(f.document_url,'查看原文')}</div>
  </div>`;
 },
 scrollTo(id){
  if(!document.body.classList.contains('experiments-page')||!['ft-process','ft-results','ft-evaluation','ft-documents'].includes(id))return;
  const section=document.getElementById(id);if(!section)return;
  section.style.scrollMarginTop=Math.ceil(document.querySelector('.sidebar').getBoundingClientRect().bottom+24)+'px';section.setAttribute('tabindex','-1');section.focus({preventScroll:true});
  section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }
};
