/* Native C-layout renderer. Unconfirmed experiment choices remain explicit. */
window.GeziExperiments = {
  render(data, esc) {
    const env = data.documents.find(d => /cloud_anyaccomp/.test(d.path));
    const envLink = env ? '<a href="'+esc(env.url)+'" target="_blank" rel="noopener">已有环境记录 <span aria-hidden="true">↗</span></a>' : '';
    return `<div class="ft-page">
      <header class="ft-heading"><div><p class="ft-eyebrow">RESEARCH PLAN / FINETUNING</p><h1>微调目标与评价</h1><p class="ft-intro">先把训练条件准备好，再用一致的方式判断效果。</p></div><span class="ft-header-state"><i aria-hidden="true"></i>实验筹备阶段</span></header>
      <section class="ft-summary" aria-label="目标与当前状态">
        <article class="ft-stat"><div class="ft-label">01 / 模型目标 <span aria-hidden="true">↗</span></div><h2>生成歌仔戏伴奏</h2><p>用经过核验的唱腔—伴奏配对数据进行模型微调。</p></article>
        <article class="ft-stat"><div class="ft-label">02 / 当前状态 <span aria-hidden="true">○</span></div><h2>正式微调<br>尚未启动</h2><p>正式训练与效果评价作为后续独立实验开展。</p></article>
        <article class="ft-stat"><div class="ft-label">03 / 当前重点 <span aria-hidden="true">→</span></div><h2>数据准备<br>与输入核验</h2><p>当前要交付：经核验的数据集与训练输入兼容性证据。</p></article>
        <div class="ft-goal-note"><span>近期目标</span><p>${esc(data.project.short_term_goal)}</p></div>
      </section>
      <section class="ft-roadmap ft-white" aria-labelledby="ft-route-title">
        <div class="ft-section-head"><div><span class="ft-small-label">PREPARATION</span><h2 id="ft-route-title">正式实验，先过三道关</h2></div><span class="ft-caption">启动条件 · 非时间排期</span></div>
        <div class="ft-route" role="list">
          <article class="ft-step" role="listitem"><div class="ft-step-top"><span class="ft-step-number">01</span><span class="ft-badge">待交付</span></div><h3>数据交付</h3><p>配对数据通过核验，确认能作为训练输入。</p><ul><li>小规模链路验收</li><li>规模化处理</li><li>数据交付关口</li></ul><button data-goto="data" class="ft-inline-link">查看数据关口 <span aria-hidden="true">↗</span></button></article>
          <article class="ft-step" role="listitem"><div class="ft-step-top"><span class="ft-step-number">02</span><span class="ft-badge">待核验</span></div><h3>训练准备</h3><p>另行确认实际可运行的训练入口与记录方式。</p><ul><li>可运行的训练入口</li><li>正式训练配置</li><li>训练日志与产物记录</li></ul><div class="ft-inline-link">${envLink}</div></article>
          <article class="ft-step" role="listitem"><div class="ft-step-top"><span class="ft-step-number">03</span><span class="ft-badge">待确认</span></div><h3>评价安排</h3><p>正式启动前，固定比较样本与评价方法。</p><ul><li>固定比较样本</li><li>自动评价指标</li><li>专业听评安排</li></ul><button class="ft-inline-link" data-ft-scroll="ft-evaluation">查看评价安排 <span aria-hidden="true">↓</span></button></article>
        </div>
        <div class="ft-destination"><span>三项准备确认后</span><span class="ft-destination-line" aria-hidden="true"></span><strong>正式微调与效果评价</strong><span aria-hidden="true">→</span></div>
      </section>
      <section id="ft-evaluation" class="ft-evaluation ft-white" aria-labelledby="ft-evaluation-title">
        <div class="ft-section-head"><div><span class="ft-small-label">EVALUATION</span><h2 id="ft-evaluation-title">效果怎样判断</h2></div><span class="ft-badge">方案待确认</span></div>
        <p class="ft-table-note">先确定比较依据，再记录实验结果。</p>
        <div class="ft-eval-table" role="table" aria-label="评价准备对照表">
          <div class="ft-table-head" role="row"><span role="columnheader">评价项目</span><span role="columnheader">用途</span><span role="columnheader">正式开始前确认</span><span role="columnheader">状态</span></div>
          <div class="ft-table-row" role="row"><strong role="rowheader">固定比较样本</strong><span role="cell" data-label="用途">保持比较条件一致</span><span role="cell" data-label="需要确认">样本清单与比较方案</span><span role="cell" class="ft-pending">待确认</span></div>
          <div class="ft-table-row" role="row"><strong role="rowheader">自动指标</strong><span role="cell" data-label="用途">提供可重复的数值比较</span><span role="cell" data-label="需要确认">指标、计算方式与统计口径</span><span role="cell" class="ft-pending">待确认</span></div>
          <div class="ft-table-row" role="row"><strong role="rowheader">专业听评</strong><span role="cell" data-label="用途">结合专业判断评价伴奏</span><span role="cell" data-label="需要确认">听评维度、人员与执行安排</span><span role="cell" class="ft-pending">待确认</span></div>
        </div>
        <details class="ft-evaluation-note"><summary>为什么暂时没有评价分数？<span aria-hidden="true">＋</span></summary><p>当前进度文档没有记录正式微调已启动。具体指标和评价方案还需确认，这里先展示准备事项，待有实际实验记录后再展示结果。</p></details>
      </section>
      <aside class="ft-boundary"><div><strong>历史基线，单独查阅</strong><p>历史 AnyAccomp 推理结果只作零样本基线，不作为本次微调结果。</p></div><button data-goto="history">查看历史实现 <span aria-hidden="true">↗</span></button></aside>
      <div class="ft-source"><span>进度来源：${esc(data.progress.document_label)} · ${esc(data.progress.updated_at)}</span><a href="${esc(data.progress.document_url)}" target="_blank" rel="noopener">查看原文 ↗</a></div>
    </div>`;
  },
  scrollTo(id) {
    if (!document.body.classList.contains('experiments-page') || id !== 'ft-evaluation') return;
    const section = document.getElementById(id);
    if (!section) return;
    // Keep the focused section clear of the fixed capsule navigation.
    const nav = document.querySelector('.sidebar');
    section.style.scrollMarginTop = Math.ceil(nav.getBoundingClientRect().bottom + 24) + 'px';
    section.setAttribute('tabindex', '-1');
    section.focus({preventScroll:true});
    section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
};