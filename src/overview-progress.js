/* Project-level content in the user's existing overview components and styles. */
(function () {
  'use strict';
  window.GeziOverview = {
    render: function (info, esc, photoCredit, model) {
      var facts = info.facts, stages = model.stages;
      var counts = {done: 0, technical: 0, active: 0, future: 0};
      stages.forEach(function (stage) { counts[stage.kind] += 1; });
      var executed = counts.done + counts.technical, total = stages.length;
      var ratio = total ? executed / total * 100 : 0;
      var dataAccepted = info.counts.done === info.total;
      var documents = {
        S1: model.support[1].url, S2: model.support[0].url,
        S3: model.support[2].url, S4: model.support[2].url,
        S5: model.support[6].url, S6: model.support[7].url,
        S7: model.support[0].url, S8: model.document_url
      };
      function phase(name, lines, ids, url, ready, note) {
        var selected = stages.filter(function (stage) { return ids.indexOf(stage.id) !== -1; });
        var kind = selected.some(function (s) { return s.kind === 'active'; }) ? 'active' :
          selected.some(function (s) { return s.kind === 'future'; }) ? 'future' :
          selected.some(function (s) { return s.kind === 'technical'; }) ? 'technical' : 'done';
        return {name: name, lines: lines, ids: ids, url: url, kind: kind,
          status: kind === 'active' ? '进行中' : kind === 'future' ? '未开始' : ready,
          note: note};
      }
      var groups = [
        {name: '数据准备', lines: ['数据', '准备'], ids: ['dataset'], url: 'docs/data-preparation.html#delivery',
          kind: dataAccepted ? 'done' : 'active', status: dataAccepted ? '已验收' : '进行中', note: '数据准备与交付'},
        phase('训练准备', ['训练', '准备'], ['S1', 'S2', 'S3', 'S4'], model.support[1].url, '已就绪', '训练链路核验'),
        phase('正式微调', ['正式', '微调'], ['S5'], model.support[6].url, '已完成', '运行与技术核验'),
        phase('验证听验', ['验证', '听验'], ['S6'], model.support[7].url, '已完成', '听验与连续性定位'),
        phase('最终评价与验收', ['最终评价', '与验收'], ['S7', 'S8'], model.support[0].url, '已完成', '测试评价与验收')
      ];
      var flow = groups.map(function (group, index) {
        var closed = group.kind === 'done' || group.kind === 'technical';
        return '<li data-stage-ids="' + esc(group.ids.join(' ')) + '" data-phase-kind="' + esc(group.kind) + '"><a class="op-flow-link' + (closed ? ' all-checked' : '') + '" href="' + esc(group.url) + '"' + (group.kind === 'active' ? ' aria-current="step"' : '') + ' aria-label="' + esc(group.name + '：' + group.status + '，查看阶段记录') + '">' +
          '<span class="op-flow-symbol">' + String(index + 1).padStart(2, '0') + '</span><strong>' + group.lines.map(esc).join('<br>') + '</strong>' +
          '<span class="op-flow-count">' + esc(group.status) + '<small>' + esc(group.note) + '</small></span></a></li>';
      }).join('');
      var rows = [{id: 'dataset', name: '929 数据准备与交付', kind: dataAccepted ? 'done' : 'active',
        status: dataAccepted ? '已验收 · ' + facts.recording_count + '首／' + facts.pair_count + '对' : '进行中',
        url: 'docs/data-preparation.html#delivery', label: '查看交付记录'}];
      stages.forEach(function (stage) {
        var current = stage.id === model.active_stage.id;
        var status = stage.kind === 'done' ? '已完成' : stage.kind === 'technical' ? '技术核验通过' : stage.kind === 'active' ? '进行中 · 等待听验反馈' : '未开始';
        if (stage.id === 'S5') status = '第二轮运行及技术核验完成';
        rows.push({id: stage.id, name: current ? '验证听验与连续性定位' : stage.title, kind: stage.kind,
          status: status, current: current, fullStatus: stage.status, url: documents[stage.id],
          label: stage.kind === 'future' ? '查看阶段方案' : '查看阶段记录'});
      });
      var rowHtml = rows.map(function (stage) {
        return '<li class="op-stage' + (stage.current ? ' is-next' : '') + '" data-stage-id="' + esc(stage.id) + '" data-stage-kind="' + esc(stage.kind) + '">' +
          '<span class="op-number">' + (stage.id === 'dataset' ? '数据' : esc(stage.id)) + '</span>' +
          '<span class="op-stage-name">' + esc(stage.name) + (stage.current ? '<small>当前</small>' : '') + '</span>' +
          '<span class="op-state' + (stage.kind === 'done' ? ' is-checked' : '') + '" title="' + esc(stage.fullStatus || stage.status) + '">' + esc(stage.status) + '</span>' +
          '<a href="' + esc(stage.url) + '" class="op-arrow" aria-label="' + esc(stage.name + '：' + stage.label) + '">' + esc(stage.label) + ' <span aria-hidden="true">↗</span></a></li>';
      }).join('');
      return '<section class="overview-dashboard op-progress" id="project-progress" aria-labelledby="op-progress-title">' +
        '<header class="op-heading"><div><span class="op-kicker">RESEARCH OVERVIEW</span><h2 id="op-progress-title">当前研究进展</h2><p>数据已验收，两轮训练已完成；当前进行验证听验与连续性定位。</p></div><button class="op-light-button" data-goto="experiments">查看模型微调 <span aria-hidden="true">↗</span></button></header>' +
        '<div class="op-board"><section class="op-stats" aria-label="研究进度摘要">' +
        '<article class="op-stat"><div class="op-stat-label">已验收数据</div><div class="op-stat-value">' + facts.recording_count + '<span> 首</span></div><p>' + facts.pair_count + '对人声—伴奏 · ' + esc(facts.paired_duration_label) + '</p></article>' +
        '<article class="op-stat op-stat-next"><div class="op-stat-label">训练／验证／测试</div><div class="op-stat-name">' + facts.recording_splits.train + '／' + facts.recording_splits.validation + '／' + facts.recording_splits.test + ' 首</div><p>沿用冻结划分，完整录音隔离</p></article>' +
        '<article class="op-stat"><div class="op-stat-label">第二轮训练</div><div class="op-stat-value">' + model.second_round.epochs + '<span> 轮</span></div><p>' + model.second_round.steps + '步；运行与技术核验完成</p></article>' +
        '<article class="op-stat"><div class="op-stat-label">当前阶段</div><div class="op-stat-value">' + esc(model.active_stage.id) + '<span> 验证听验</span></div><p>定位连续性问题，音乐效果待验收</p></article></section>' +
        '<div class="op-middle"><section class="op-flow-panel"><div class="op-flow-heading"><div><h3>当前研究路线</h3><p>从数据验收，到模型效果与最终验收</p></div><img src="assets/opera-musician.svg" width="56" height="56" alt=""></div><ol class="op-flow">' + flow + '</ol>' +
        '<div class="op-flow-next"><span>当前重点</span><strong>验证听验与连续性定位</strong><a href="' + esc(model.support[7].url) + '">查看定位记录 ↗</a></div>' +
        '<p class="op-flow-note">' + esc(model.next_action) + '</p></section>' +
        '<section class="op-gauge-panel" aria-labelledby="op-gauge-title"><h3 id="op-gauge-title">实验阶段状态</h3>' +
        '<figure class="op-gauge" role="img" aria-label="模型实验共' + total + '个阶段：' + counts.done + '项已完成、' + counts.technical + '项技术通过、' + counts.active + '项进行中、' + counts.future + '项未开始；不是研究完成率或音乐评分"><svg viewBox="0 0 260 155" aria-hidden="true">' +
        '<path d="M 26 130 A 104 104 0 0 1 234 130" fill="none" stroke="#141510" stroke-width="26"/><path d="M 26 130 A 104 104 0 0 1 234 130" fill="none" stroke="white" stroke-width="23"/>' +
        '<path class="op-gauge-fill" d="M 26 130 A 104 104 0 0 1 234 130" fill="none" stroke="#141510" stroke-width="24" pathLength="100" stroke-dasharray="' + ratio + ' 100"/></svg>' +
        '<figcaption><span>已完成或技术通过</span><strong>' + executed + '<small> / ' + total + '</small></strong></figcaption></figure>' +
        '<dl class="op-gauge-legend"><div><dt><i class="checked-dot"></i>已完成</dt><dd>' + counts.done + '</dd></div><div><dt><i></i>技术通过</dt><dd>' + counts.technical + '</dd></div><div><dt><i class="active-dot"></i>进行中</dt><dd>' + counts.active + '</dd></div><div><dt><i></i>未开始</dt><dd>' + counts.future + '</dd></div></dl>' +
        '<a class="op-dark-button" href="' + esc(model.support[7].url) + '">查看当前定位记录 <span aria-hidden="true">↗</span></a><p class="op-count-note">仅统计模型实验的' + total + '个阶段，数据验收单独列示。弧线表示阶段数量，不是研究完成率或音乐评分。</p></section></div>' +
        '<section class="op-route op-full-route"><div class="op-panel-heading"><div><h3>研究阶段清单</h3><p>数据验收与模型实验分别记录，详细依据按需查阅</p></div><a class="op-text-button" href="' + esc(model.document_url) + '">打开微调概览 ↗</a></div><ol>' + rowHtml + '</ol></section></div>' +
        '<div class="op-boundary"><span aria-hidden="true">↳</span><p>数据已验收；训练运行与技术通过不代表音乐效果通过。测试集最终评价与最终验收尚未开始。</p><a href="' + esc(model.document_url) + '">查看实验边界 ↗</a></div>' + photoCredit + '</section>';
    }
  };
})();
