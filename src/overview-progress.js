/* Native V2 renderer. Input counts and stable groups are validated at build time. */
(function () {
  'use strict';
  window.GeziOverview = {
    render: function (info, esc, photoCredit) {
      var next = info.next, nextTitle = info.next_label || (next ? next.name : '待确认');
      var checked = info.counts.done, active = info.counts.active + (info.counts.partial || 0), pending = info.counts.future;
      var activeLabel = info.counts.partial ? '部分通过待核验' : '当前进行中';
      var activeLegend = info.counts.partial ? '部分通过 / 待核验' : '进行中';
      var reader = function (id) { return 'docs/data-preparation.html#' + id; };
      var rows = info.stages.map(function (stage, index) {
        var isNext = next && next.id === stage.id;
        return '<li class="op-stage' + (isNext ? ' is-next' : '') + '" data-stage-id="' + esc(stage.id) + '">' +
          '<span class="op-number">' + String(index + 1).padStart(2, '0') + '</span>' +
          '<span class="op-stage-name">' + esc(stage.name) + (isNext ? '<small>下一步</small>' : '') + '</span>' +
          '<span class="op-state' + (stage.kind === 'done' ? ' is-checked' : '') + '">' + esc(stage.short_status) + '</span>' +
          '<a href="' + esc(stage.url) + '" class="op-arrow" aria-label="查看' + esc(stage.name) + '的验收要求">查看验收要求 <span aria-hidden="true">↗</span></a></li>';
      }).join('');
      var flow = info.groups.map(function (group, index) {
        return '<li data-stage-ids="' + esc(group.stage_ids.join(' ')) + '"><a class="op-flow-link' + (group.checked === group.total ? ' all-checked' : '') + '" href="' + esc(group.url) + '" aria-label="查看' + esc(group.name) + '阶段记录">' +
          '<span class="op-flow-symbol">' + String(index + 1).padStart(2, '0') + '</span><strong>' + group.lines.map(esc).join('<br>') + '</strong>' +
          '<span class="op-flow-count">' + group.checked + ' / ' + group.total + '<small>阶段检查通过</small></span></a></li>';
      }).join('');
      var ratio = info.total ? checked / info.total * 100 : 0;
      var checkedNote = '929数据准备与交付已验收；正式微调未开始。';
      return '<section class="overview-dashboard op-progress" id="project-progress" aria-labelledby="op-progress-title">' +
        '<header class="op-heading"><div><span class="op-kicker">RESEARCH OVERVIEW</span><h2 id="op-progress-title">929数据准备已验收</h2><p>每一步，都有可追溯的记录。</p></div><button class="op-light-button" data-goto="data">查看数据准备 <span aria-hidden="true">↗</span></button></header>' +
        '<div class="op-board"><section class="op-stats" aria-label="研究进度摘要">' +
        '<article class="op-stat"><div class="op-stat-label">929数据阶段已验收</div><div class="op-stat-value">' + checked + '<span> / ' + info.total + '</span></div><p>' + esc(checkedNote) + '</p></article>' +
        '<article class="op-stat"><div class="op-stat-label">已收录完整录音</div><div class="op-stat-value">' + info.facts.recording_count + '<span> 首</span></div><p>' + info.facts.individually_listened_recordings + '首完整听验，' + info.facts.batch_rule_recordings + '首按批次规则采用</p></article>' +
        '<article class="op-stat op-stat-next"><div class="op-stat-label">训练／验证／测试</div><div class="op-stat-name">' + info.facts.recording_splits.train + '／' + info.facts.recording_splits.validation + '／' + info.facts.recording_splits.test + ' 首</div><p>完整录音隔离，演唱者允许重叠</p></article>' +
        '<article class="op-stat"><div class="op-stat-label">正式配对音频</div><div class="op-stat-value">' + info.facts.pair_count + '<span> 对</span></div><p>' + esc(info.facts.paired_duration_label) + '；' + info.facts.whole_interface_pair_count + '对整段＋' + info.facts.window_interface_pair_count + '对窗口有限接口</p></article></section>' +
        '<div class="op-middle"><section class="op-flow-panel"><div class="op-flow-heading"><div><h3>当前数据路线</h3><p>' + info.groups.length + ' 组任务 · ' + info.total + ' 个数据阶段</p></div><img src="assets/opera-musician.svg" width="56" height="56" alt=""></div><ol class="op-flow">' + flow + '</ol>' +
        '<div class="op-flow-next"><span>下一步</span><strong>' + esc(nextTitle) + '</strong><a href="' + reader('next-step') + '">查看安排 ↗</a></div>' +
        '<p class="op-flow-note">由完整录音出发，经过分离、听验与配对，再完成训练输入核验和数据交付。组内数字仅表示阶段检查数量。</p></section>' +
        '<section class="op-gauge-panel" aria-labelledby="op-gauge-title"><h3 id="op-gauge-title">阶段检查数量</h3>' +
        '<figure class="op-gauge" role="img" aria-label="' + info.total + ' 个数据阶段中 ' + checked + ' 个检查通过、' + active + ' 个' + activeLegend + '、' + pending + ' 个待执行"><svg viewBox="0 0 260 155" aria-hidden="true">' +
        '<path d="M 26 130 A 104 104 0 0 1 234 130" fill="none" stroke="#141510" stroke-width="26"/><path d="M 26 130 A 104 104 0 0 1 234 130" fill="none" stroke="white" stroke-width="23"/>' +
        '<path class="op-gauge-fill" d="M 26 130 A 104 104 0 0 1 234 130" fill="none" stroke="#141510" stroke-width="24" pathLength="100" stroke-dasharray="' + ratio + ' 100"/></svg>' +
        '<figcaption><span>检查已通过</span><strong>' + checked + '<small> / ' + info.total + '</small></strong></figcaption></figure>' +
        '<dl class="op-gauge-legend"><div><dt><i class="checked-dot"></i>检查通过</dt><dd>' + checked + '</dd></div><div><dt><i class="active-dot"></i>' + activeLegend + '</dt><dd>' + active + '</dd></div><div><dt><i></i>待执行</dt><dd>' + pending + '</dd></div></dl>' +
        '<a class="op-dark-button" href="' + reader('next-step') + '">查看下一步安排 <span aria-hidden="true">↗</span></a><p class="op-count-note">' + esc(info.count_scope) + '</p></section></div>' +
        '<section class="op-route op-full-route"><div class="op-panel-heading"><div><h3>阶段清单</h3><p>名称、当前状态与对应验收记录</p></div><a class="op-text-button" href="' + reader('complete') + '">打开完整记录 ↗</a></div><ol>' + rows + '</ol></section></div>' +
        '<div class="op-boundary"><span aria-hidden="true">↳</span><p>数据阶段统计包含小规模验证、规模化处理与最终交付。正式微调尚未开始，训练与生成评价另开实验。</p><a href="' + reader('scope') + '">查看说明 ↗</a></div>' + photoCredit + '</section>';
    }
  };
})();
