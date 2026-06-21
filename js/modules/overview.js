// Module: overview — 控制塔全局总览 (v8.0 · 参照项目全局总览-新 · 浅色联动版)
// 核心设计：顶部四维(BG/BU/客户/产品)联动 + 本页子筛选 + 6汇总卡 + 5图表 + 漏斗 + 红绿灯 + 明细表

/* ══════════════════════════════════════════════
   1. KPI 健康分模拟
══════════════════════════════════════════════ */
function _ovSeededRand(seed) {
  var s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
function _ovGenKpi(name, isNpi) {
  var rng = _ovSeededRand(name.split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0) * 31);
  var dims = [];
  for (var i = 0; i < 5; i++) {
    var base = isNpi ? 72 : 78;
    var v = Math.round(base + (rng() - 0.35) * 48);
    dims.push(Math.min(100, Math.max(30, v)));
  }
  var score = Math.round(dims.reduce(function (a, b) { return a + b; }, 0) / 5);
  var health = score >= 80 ? 'g' : score >= 65 ? 'y' : 'r';
  return { dims: dims, score: score, health: health };
}

/* ══════════════════════════════════════════════
   2. 状态变量
══════════════════════════════════════════════ */
var _ovFiltered = [];
var _ovSortKey = 'key';
var _ovSortDir = -1;
var _ovPage = 1;
var _ovPageSize = 15;
var _ovChartLifecycle = null;
var _ovChartRadar = null;
var _ovChartCustomer = null;
var _ovDebouncedFilter = null;

/* ══════════════════════════════════════════════
   3. 主入口
══════════════════════════════════════════════ */
function initPage_overview() {
  try {
    if(!_ovDebouncedFilter) _ovDebouncedFilter = debounce(ovApplyFilters, 300);
    ovApplyFilters();
  } catch (e) {
    console.error('overview init error:', e);
  }
}
registerModule('overview', initPage_overview);

/* ══════════════════════════════════════════════
   4. 筛选逻辑（顶部四维联动 + 本页子筛选）
══════════════════════════════════════════════ */
function ovApplyFilters() {
  // 先取顶部四维筛选结果
  var fp = getFilteredProjects();

  // 本页子筛选
  var lc = document.getElementById('ovFLifecycle') ? document.getElementById('ovFLifecycle').value : '';
  var st = document.getElementById('ovFStage') ? document.getElementById('ovFStage').value : '';
  var hl = document.getElementById('ovFHealth') ? document.getElementById('ovFHealth').value : '';
  var key = document.getElementById('ovFKey') ? document.getElementById('ovFKey').checked : false;
  var kw = document.getElementById('ovFSearch') ? document.getElementById('ovFSearch').value.trim().toLowerCase() : '';

  _ovFiltered = fp.filter(function (p) {
    // 补算 KPI — 使用统一数据服务
    if (!p._ovKpi) {
      var ds = DS.get(p.id);
      if (ds) {
        p._ovKpi = { dims: ds.dims, score: ds.score, health: ds.health };
      } else {
        p._ovKpi = _ovGenKpi(p.name, p.lifecycleRaw === 'NPI');
      }
    }
    if (lc && p.lifecycleRaw !== lc) return false;
    if (st && p.engStage !== st) return false;
    if (hl && p._ovKpi.health !== hl) return false;
    if (key && !p.isMajor) return false;
    if (kw) {
      var hay = (p.name + p.customer + p.productLine + p.bu + p.bg).toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });

  _ovPage = 1;
  ovSortTable(_ovSortKey, true);
  ovUpdateSummary();
  ovUpdateFunnel();
  ovUpdateKeyProjects();
  ovUpdateCharts();

  var countEl = document.getElementById('ovFilterCount');
  if (countEl) countEl.textContent = _ovFiltered.length;
}

function ovResetFilters() {
  ['ovFLifecycle', 'ovFStage', 'ovFHealth'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var keyEl = document.getElementById('ovFKey');
  if (keyEl) keyEl.checked = false;
  var searchEl = document.getElementById('ovFSearch');
  if (searchEl) searchEl.value = '';
  ovApplyFilters();
}

/* ══════════════════════════════════════════════
   5. 汇总卡片
══════════════════════════════════════════════ */
function ovUpdateSummary() {
  var total = _ovFiltered.length;
  var npi = _ovFiltered.filter(function (d) { return d.lifecycleRaw === 'NPI'; }).length;
  var mp = _ovFiltered.filter(function (d) { return d.lifecycleRaw !== 'NPI'; }).length;
  var major = _ovFiltered.filter(function (d) { return d.isMajor; }).length;
  var yel = _ovFiltered.filter(function (d) { return d._ovKpi && d._ovKpi.health === 'y'; }).length;
  var red = _ovFiltered.filter(function (d) { return d._ovKpi && d._ovKpi.health === 'r'; }).length;
  var alert = yel + red;
  var bgSet = [...new Set(_ovFiltered.map(function (d) { return d.bg; }))];

  var grid = document.getElementById('ovSummaryGrid');
  if (!grid) return;
  grid.innerHTML = [
    { label: 'BG 数量', value: bgSet.length, icon: '🏢', color: 'c-blue',
      sub: bgSet.map(function (b) { return '<span class="tag">' + b + '</span>'; }).join('') },
    { label: '项目总数', value: total, icon: '📁', color: 'c-purple', sub: '筛选后显示' },
    { label: 'NPI 项目', value: npi, icon: '🔬', color: 'c-orange',
      sub: 'EVT ' + _ovFiltered.filter(function (d) { return d.engStage === 'EVT'; }).length +
           ' / DVT ' + _ovFiltered.filter(function (d) { return d.engStage === 'DVT'; }).length +
           ' / PVT ' + _ovFiltered.filter(function (d) { return d.engStage === 'PVT'; }).length },
    { label: 'MP 项目', value: mp, icon: '🏗️', color: 'c-green',
      sub: 'Ramp ' + _ovFiltered.filter(function (d) { return d.lifecycleRaw === 'Ramp-up'; }).length +
           ' / Mass ' + _ovFiltered.filter(function (d) { return d.lifecycleRaw === 'Mass Production'; }).length +
           ' / EOL ' + _ovFiltered.filter(function (d) { return d.lifecycleRaw === 'EOL'; }).length },
    { label: '重大项目', value: major, icon: '⭐', color: 'c-yellow', sub: '需重点跟踪' },
    { label: '健康预警', value: alert, icon: '🚨', color: 'c-red',
      sub: '<span style="color:#ca8a04">🟡 ' + yel + '</span>&nbsp;<span style="color:var(--danger)">🔴 ' + red + '</span>' },
  ].map(function (k) {
    return '<div class="ov-sum-card ' + k.color + '">' +
      '<div class="ov-sum-icon">' + k.icon + '</div>' +
      '<div class="ov-sum-label">' + k.label + '</div>' +
      '<div class="ov-sum-value">' + k.value + '</div>' +
      '<div class="ov-sum-sub">' + k.sub + '</div>' +
      '</div>';
  }).join('');
}

/* ══════════════════════════════════════════════
   6. NPI 漏斗 + MP 阶段条
══════════════════════════════════════════════ */
function ovUpdateFunnel() {
  var evt = _ovFiltered.filter(function (d) { return d.engStage === 'EVT'; }).length;
  var dvt = _ovFiltered.filter(function (d) { return d.engStage === 'DVT'; }).length;
  var pvt = _ovFiltered.filter(function (d) { return d.engStage === 'PVT'; }).length;
  var ramp = _ovFiltered.filter(function (d) { return d.lifecycleRaw === 'Ramp-up'; }).length;
  var mass = _ovFiltered.filter(function (d) { return d.lifecycleRaw === 'Mass Production'; }).length;
  var eol = _ovFiltered.filter(function (d) { return d.lifecycleRaw === 'EOL'; }).length;
  var maxNpi = Math.max(evt, dvt, pvt, 1);
  var maxMp = Math.max(ramp, mass, eol, 1);

  var funnelColors = ['#16a34a', '#3b82f6', '#8b5cf6'];
  var steps = [{ label: 'EVT', val: evt }, { label: 'DVT', val: dvt }, { label: 'PVT', val: pvt }];
  var fwrap = document.getElementById('ovFunnelWrap');
  if (!fwrap) return;
  fwrap.innerHTML = '';
  steps.forEach(function (s, i) {
    var pct = Math.round((s.val / maxNpi) * 100);
    var w = Math.max(pct, 12);
    var row = document.createElement('div');
    row.className = 'ov-funnel-step';
    row.innerHTML =
      '<div class="ov-funnel-label">' + s.label + '</div>' +
      '<div class="ov-funnel-bar-wrap"><div class="ov-funnel-bar" style="width:' + w + '%;background:' + funnelColors[i] + ';min-width:50px;">' + s.val + '</div></div>' +
      '<div class="ov-funnel-count">' + s.val + ' 个</div>';
    fwrap.appendChild(row);
    if (i < 2) {
      var arr = document.createElement('div');
      arr.className = 'ov-funnel-arrow';
      arr.innerHTML = '▼';
      fwrap.appendChild(arr);
    }
  });

  // MP 阶段横向柱状
  var mpBars = document.getElementById('ovMpStageBars');
  if (!mpBars) return;
  mpBars.innerHTML = '';
  [
    { label: 'Ramp-up', val: ramp, color: 'var(--primary-light)' },
    { label: 'Mass Pro.', val: mass, color: 'var(--success)' },
    { label: 'EOL', val: eol, color: 'var(--text-muted)' }
  ].forEach(function (item) {
    var pct = Math.round((item.val / maxMp) * 100);
    mpBars.innerHTML +=
      '<div style="display:flex;align-items:center;gap:8px;">' +
      '<span style="font-size:10px;color:var(--text-sec);width:52px;flex-shrink:0;">' + item.label + '</span>' +
      '<div style="flex:1;background:var(--border-light);border-radius:3px;height:12px;overflow:hidden;">' +
      '<div style="width:' + Math.max(pct, 4) + '%;height:100%;background:' + item.color + ';border-radius:3px;transition:width .4s;"></div></div>' +
      '<span style="font-size:11px;font-weight:700;color:' + item.color + ';width:24px;text-align:right;">' + item.val + '</span></div>';
  });
}

/* ══════════════════════════════════════════════
   7. 重大项目红绿灯
══════════════════════════════════════════════ */
function ovUpdateKeyProjects() {
  var keyList = _ovFiltered.filter(function (d) { return d.isMajor; });
  var el = document.getElementById('ovKeyProjectList');
  var lb = document.getElementById('ovKeyCountLabel');
  if (lb) lb.textContent = '共 ' + keyList.length + ' 个';
  if (!el) return;
  if (!keyList.length) {
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;"><div style="font-size:28px;margin-bottom:8px;">⭐</div>当前筛选范围内无重大项目</div>';
    return;
  }
  el.innerHTML = keyList.map(function (d) {
    var kpi = d._ovKpi || { health: 'y', score: 72 };
    var lcLabel = d.lifecycleRaw === 'NPI'
      ? '<span class="ov-kp-badge npi-badge">NPI</span>'
      : '<span class="ov-kp-badge mp-badge">MP</span>';
    return '<div class="ov-kp-item">' +
      '<div class="ov-kp-dot ' + kpi.health + '"></div>' +
      '<div class="ov-kp-info"><div class="ov-kp-name">' + d.name + '</div>' +
      '<div class="ov-kp-meta">' + d.customer + ' · ' + d.productLine + ' · ' + d.engStage + '</div></div>' +
      lcLabel +
      '<div class="ov-kp-score ' + kpi.health + '">' + kpi.score + '</div></div>';
  }).join('');
}

/* ══════════════════════════════════════════════
   8. 图表渲染
══════════════════════════════════════════════ */
var _OV_LC_COLORS = {
  'NPI': 'rgba(139,92,246,0.8)',
  'Ramp-up': 'rgba(59,130,246,0.8)',
  'Mass Production': 'rgba(34,197,94,0.8)',
  'EOL': 'rgba(148,163,184,0.8)',
};
var _OV_BG_LIST = ['A01', 'CEP', 'SAC'];
var _OV_DIM_LABELS = ['可靠性', '响应性', '成本', '资产', '韧性'];
var _OV_RADAR_BG = ['rgba(59,130,246,0.15)', 'rgba(139,92,246,0.15)', 'rgba(34,197,94,0.15)'];
var _OV_RADAR_BORDER = ['rgba(59,130,246,0.9)', 'rgba(139,92,246,0.9)', 'rgba(34,197,94,0.9)'];

function ovUpdateCharts() {
  ovRenderLifecycleChart();
  ovRenderRadarChart();
  ovRenderCustomerChart();
  var t1 = document.getElementById('ovChart1Total');
  if (t1) t1.textContent = '共 ' + _ovFiltered.length + ' 个项目';
}

/* —— 堆叠柱状：BG × 生命周期 —— */
function ovRenderLifecycleChart() {
  var lcKeys = ['NPI', 'Ramp-up', 'Mass Production', 'EOL'];
  var datasets = lcKeys.map(function (lc) {
    return {
      label: lc === 'Ramp-up' ? '量产爬坡' : lc === 'Mass Production' ? '稳定量产' : lc,
      data: _OV_BG_LIST.map(function (bg) {
        return _ovFiltered.filter(function (d) { return d.bg === bg && d.lifecycleRaw === lc; }).length;
      }),
      backgroundColor: _OV_LC_COLORS[lc],
      borderRadius: 4,
      borderSkipped: false,
    };
  });

  var ctx = document.getElementById('ovChartLifecycle');
  if (!ctx) return;
  if (_ovChartLifecycle) _ovChartLifecycle.destroy();
  _ovChartLifecycle = new Chart(ctx, {
    type: 'bar',
    data: { labels: _OV_BG_LIST, datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { usePointStyle: true, font: { size: 11 } } },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' } } },
        y: { stacked: true, title: { display: true, text: '项目数' }, grid: { color: '#f1f5f9' } }
      }
    }
  });
}

/* —— 雷达图：各 BG 五维平均得分 —— */
function ovRenderRadarChart() {
  var datasets = _OV_BG_LIST.map(function (bg, i) {
    var pool = _ovFiltered.filter(function (d) { return d.bg === bg; });
    var avgs = pool.length
      ? _OV_DIM_LABELS.map(function (_, di) {
          return Math.round(pool.reduce(function (s, d) { return s + (d._ovKpi ? d._ovKpi.dims[di] : 75); }, 0) / pool.length);
        })
      : [0, 0, 0, 0, 0];
    return {
      label: bg,
      data: avgs,
      backgroundColor: _OV_RADAR_BG[i],
      borderColor: _OV_RADAR_BORDER[i],
      borderWidth: 2,
      pointBackgroundColor: _OV_RADAR_BORDER[i],
      pointRadius: 3,
    };
  });

  // 图例
  var lgd = document.getElementById('ovRadarLegend');
  if (lgd) {
    lgd.innerHTML = _OV_BG_LIST.map(function (bg, i) {
      return '<span style="font-size:10px;display:flex;align-items:center;gap:4px;color:' + _OV_RADAR_BORDER[i].replace('0.9', '1') + '">' +
        '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + _OV_RADAR_BORDER[i] + '"></span>' + bg + '</span>';
    }).join('');
  }

  var ctx = document.getElementById('ovChartRadar');
  if (!ctx) return;
  if (_ovChartRadar) _ovChartRadar.destroy();
  _ovChartRadar = new Chart(ctx, {
    type: 'radar',
    data: { labels: _OV_DIM_LABELS, datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function (ctx) { return ' ' + ctx.dataset.label + '：' + ctx.raw + ' 分'; } } }
      },
      scales: {
        r: {
          min: 40, max: 100, stepSize: 15,
          ticks: { color: '#94a3b8', font: { size: 9 }, backdropColor: 'transparent' },
          grid: { color: '#e2e8f0' },
          pointLabels: { color: '#64748b', font: { size: 11 } },
          angleLines: { color: '#e2e8f0' }
        }
      }
    }
  });
}

/* —— 横向柱状：客户项目数 —— */
function ovRenderCustomerChart() {
  var cuMap = {};
  _ovFiltered.forEach(function (d) { cuMap[d.customer] = (cuMap[d.customer] || 0) + 1; });
  var sorted = Object.entries(cuMap).sort(function (a, b) { return b[1] - a[1]; });
  var labels = sorted.map(function (e) { return e[0]; });
  var values = sorted.map(function (e) { return e[1]; });

  var colors = labels.map(function (cu) {
    var pool = _ovFiltered.filter(function (d) { return d.customer === cu; });
    var gRate = pool.filter(function (d) { return d._ovKpi && d._ovKpi.health === 'g'; }).length / pool.length;
    if (gRate > 0.75) return 'rgba(34,197,94,0.80)';
    if (gRate > 0.5) return 'rgba(59,130,246,0.80)';
    if (gRate > 0.3) return 'rgba(234,179,8,0.80)';
    return 'rgba(220,38,38,0.75)';
  });

  var ctx = document.getElementById('ovChartCustomer');
  if (!ctx) return;
  if (_ovChartCustomer) _ovChartCustomer.destroy();
  _ovChartCustomer = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: '项目数', data: values, backgroundColor: colors, borderRadius: 5, borderSkipped: false }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var cu = ctx.label;
              var pool = _ovFiltered.filter(function (d) { return d.customer === cu; });
              var g = pool.filter(function (d) { return d._ovKpi && d._ovKpi.health === 'g'; }).length;
              var y = pool.filter(function (d) { return d._ovKpi && d._ovKpi.health === 'y'; }).length;
              var r = pool.filter(function (d) { return d._ovKpi && d._ovKpi.health === 'r'; }).length;
              return ['总计：' + ctx.raw + ' 个', '🟢 ' + g + '  🟡 ' + y + '  🔴 ' + r];
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        y: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

/* ══════════════════════════════════════════════
   9. 表格排序
══════════════════════════════════════════════ */
function ovSortTable(key, keepDir) {
  if (!keepDir) {
    if (_ovSortKey === key) _ovSortDir *= -1;
    else { _ovSortKey = key; _ovSortDir = -1; }
  }
  // 高亮排序列
  document.querySelectorAll('.ov-proj-table thead th[id]').forEach(function (th) { th.classList.remove('sorted'); });
  var activeTh = document.getElementById('ovTh' + key.charAt(0).toUpperCase() + key.slice(1));
  if (activeTh) activeTh.classList.add('sorted');

  var keyMap = {
    key: 'isMajor', bg: 'bg', bu: 'bu', customer: 'customer',
    product: 'productLine', name: 'name', stage: 'engStage',
    lifecycle: 'lifecycleRaw', score: '_ovScore', health: '_ovHealth'
  };
  var field = keyMap[key] || key;

  _ovFiltered.sort(function (a, b) {
    var va, vb;
    if (field === '_ovScore') { va = a._ovKpi ? a._ovKpi.score : 0; vb = b._ovKpi ? b._ovKpi.score : 0; }
    else if (field === '_ovHealth') { var ord = { g: 2, y: 1, r: 0 }; va = a._ovKpi ? ord[a._ovKpi.health] || 0 : 0; vb = b._ovKpi ? ord[b._ovKpi.health] || 0 : 0; }
    else if (field === 'isMajor') { va = a.isMajor ? 1 : 0; vb = b.isMajor ? 1 : 0; }
    else { va = a[field]; vb = b[field]; }
    if (typeof va === 'string') return va.localeCompare(vb) * _ovSortDir;
    return (va - vb) * _ovSortDir;
  });
  ovRenderTable();
}

/* ══════════════════════════════════════════════
   10. 表格渲染 + 分页
══════════════════════════════════════════════ */
var _OV_LC_MAP = { 'NPI': 'ov-lc-npi', 'Ramp-up': 'ov-lc-ramp', 'Mass Production': 'ov-lc-mass', 'EOL': 'ov-lc-eol' };
var _OV_HEALTH_LABEL = { g: '正常', y: '预警', r: '异常' };
var _OV_DIM_SHORT = ['可靠', '响应', '成本', '资产', '韧性'];

function ovRenderTable() {
  var total = _ovFiltered.length;
  var pages = Math.max(1, Math.ceil(total / _ovPageSize));
  _ovPage = Math.min(_ovPage, pages);
  var start = (_ovPage - 1) * _ovPageSize;
  var slice = _ovFiltered.slice(start, start + _ovPageSize);

  var tbody = document.getElementById('ovProjTbody');
  var empty = document.getElementById('ovTableEmpty');
  var titleCount = document.getElementById('ovTableTitleCount');
  if (titleCount) titleCount.textContent = total ? '（共 ' + total + ' 条）' : '';

  if (!slice.length) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    ovRenderPagination(0, 0);
    var pi = document.getElementById('ovPageInfo');
    if (pi) pi.textContent = '共 0 条';
    return;
  }
  if (empty) empty.style.display = 'none';

  if (!tbody) return;
  tbody.innerHTML = slice.map(function (d) {
    var kpi = d._ovKpi || { dims: [75, 75, 75, 75, 75], score: 75, health: 'y' };
    var dimTds = kpi.dims.map(function (v, i) {
      var cls = v >= 80 ? 'g' : v >= 65 ? 'y' : 'r';
      return '<td><div class="ov-dim-cell ' + cls + '" style="width:auto;padding:0 5px;font-size:10px;" title="' + _OV_DIM_SHORT[i] + '维度：' + v + ' 分">' + v + '</div></td>';
    }).join('');
    var lcClass = _OV_LC_MAP[d.lifecycleRaw] || 'ov-lc-npi';
    var lcText = d.lifecycleRaw === 'Ramp-up' ? '量产爬坡' : d.lifecycleRaw === 'Mass Production' ? '稳定量产' : d.lifecycleRaw === 'EOL' ? '量产EOL' : d.lifecycleRaw;
    // 智能跳转目标提示
    var drillTarget = kpi.health==='r'?'风险预警':d.lifecycleRaw==='NPI'?'物料状态':'项目进度';
    return '<tr class="ov-drill-row" onclick="ovDrillTo(\''+d.id+'\')" title="点击查看「'+drillTarget+'」详情">' +
      '<td style="text-align:center;width:32px;">' + (d.isMajor ? '<span class="ov-star-mark">★</span>' : '') + '</td>' +
      '<td>' + d.bg + '</td>' +
      '<td style="color:var(--text-sec);">' + d.bu + '</td>' +
      '<td><strong>' + d.customer + '</strong></td>' +
      '<td style="color:var(--text-sec);">' + d.productLine + '</td>' +
      '<td class="td-name">' + d.name + '</td>' +
      '<td><span class="ov-stage-badge ov-stage-' + d.engStage + '">' + d.engStage + '</span></td>' +
      '<td><span class="ov-lc-badge ' + lcClass + '">' + lcText + '</span></td>' +
      dimTds +
      '<td><span class="ov-score-pill ' + kpi.health + '">' + kpi.score + '</span></td>' +
      '<td><span class="ov-health-dot ' + kpi.health + '">' + _OV_HEALTH_LABEL[kpi.health] + '</span></td>' +
      '<td style="text-align:center;width:36px;"><i class="fa-solid fa-arrow-right" style="color:var(--text-muted);font-size:11px;"></i></td>' +
      '</tr>';
  }).join('');

  ovRenderPagination(total, pages);
  var pi = document.getElementById('ovPageInfo');
  if (pi) pi.textContent = '第 ' + (start + 1) + '–' + Math.min(start + _ovPageSize, total) + ' 条，共 ' + total + ' 条';
}

function ovRenderPagination(total, pages) {
  var pg = document.getElementById('ovPagination');
  if (!pg) return;
  if (total === 0) { pg.innerHTML = ''; return; }
  var html = '';
  html += '<button class="ov-page-btn" onclick="ovGoPage(' + (_ovPage - 1) + ')" ' + (_ovPage <= 1 ? 'disabled' : '') + '>‹</button>';
  var range = 2;
  for (var i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - _ovPage) <= range) {
      html += '<button class="ov-page-btn' + (i === _ovPage ? ' active' : '') + '" onclick="ovGoPage(' + i + ')">' + i + '</button>';
    } else if (Math.abs(i - _ovPage) === range + 1) {
      html += '<span style="color:var(--text-muted);padding:0 4px;font-size:12px;">…</span>';
    }
  }
  html += '<button class="ov-page-btn" onclick="ovGoPage(' + (_ovPage + 1) + ')" ' + (_ovPage >= pages ? 'disabled' : '') + '>›</button>';
  pg.innerHTML = html;
}

function ovGoPage(p) {
  var pages = Math.ceil(_ovFiltered.length / _ovPageSize);
  if (p < 1 || p > pages) return;
  _ovPage = p;
  ovRenderTable();
  var tableCard = document.querySelector('.ov-table-card');
  if (tableCard) tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ovChangePageSize() {
  _ovPageSize = parseInt(document.getElementById('ovPageSize').value);
  _ovPage = 1;
  ovRenderTable();
}
