/* ── v10.1 项目周期监控 — 参照《履行周期监控_合并版_参考.html》甘特图 ── */
registerModule('cycle', initPage_cycle);

var cycleCache = null;
var expandedCycles = {};
var activeCycleCode = '';

/* ── 常量 ── */
var CYCLE_DEF = [
  { code:'RESP', name:'T1 需求响应', short:'T1 需求响应', target:4, actual:12, diff:8, trend:'持续恶化',
    nodes:[
      {code:'1.1', name:'需求接收', target:0.5, actual:2, diff:1.5},
      {code:'1.2', name:'技术评审', target:2, actual:6, diff:4},
      {code:'1.3', name:'交期确认', target:1.5, actual:4, diff:2.5}
    ], factors:[{name:'需求变更率',val:'+23%',cls:'bad'}]},
  { code:'PLAN', name:'T2 计划运转', short:'T2 计划运转', target:6, actual:8, diff:2, trend:'高位波动',
    nodes:[
      {code:'2.1', name:'MRP运算', target:2, actual:3, diff:1},
      {code:'2.2', name:'产能排程', target:2, actual:2.5, diff:0.5},
      {code:'2.3', name:'物料齐套确认', target:2, actual:2.5, diff:0.5}
    ], factors:[{name:'齐套率',val:'89%',cls:'normal'}]},
  { code:'PROC', name:'T3 物料采购', short:'T3 物料采购', target:14, actual:18, diff:4, trend:'持续恶化',
    nodes:[
      {code:'3.1', name:'订单下达', target:1, actual:2, diff:1},
      {code:'3.2', name:'供应商确认', target:2, actual:3, diff:1},
      {code:'3.3', name:'来料检验', target:2, actual:3.5, diff:1.5},
      {code:'3.4', name:'入库上架', target:1, actual:1.5, diff:0.5}
    ], factors:[{name:'紧急采购率',val:'15%',cls:'bad'},{name:'L/T达成率',val:'82%',cls:'bad'}]},
  { code:'MFG', name:'T4 生产制造', short:'T4 生产制造', target:10, actual:13, diff:3, trend:'首次变坏',
    nodes:[
      {code:'4.1', name:'工单下达', target:0.5, actual:1, diff:0.5},
      {code:'4.2', name:'首件确认', target:1.5, actual:2, diff:0.5},
      {code:'4.3', name:'批量生产', target:6, actual:7.5, diff:1.5},
      {code:'4.4', name:'终检入库', target:2, actual:2.5, diff:0.5}
    ], factors:[{name:'良率',val:'94.2%',cls:'normal'}]},
  { code:'INV', name:'T5 库存在库', short:'T5 库存在库', target:3, actual:5, diff:2, trend:'持续恶化',
    nodes:[
      {code:'5.1', name:'成品入库', target:1, actual:1.5, diff:0.5},
      {code:'5.2', name:'库存周转', target:1, actual:2, diff:1},
      {code:'5.3', name:'拣货备货', target:1, actual:1.5, diff:0.5}
    ], factors:[{name:'呆滞金额',val:'190万',cls:'bad'}]},
  { code:'SHIP', name:'T6 物流发运', short:'T6 物流发运', target:3, actual:4, diff:1, trend:'恢复正常',
    nodes:[
      {code:'6.1', name:'发运排程', target:0.5, actual:0.5, diff:0},
      {code:'6.2', name:'物流承运', target:2, actual:3, diff:1},
      {code:'6.3', name:'签收确认', target:0.5, actual:0.5, diff:0}
    ], factors:[{name:'空运溢价',val:'+8%',cls:'bad'}]}
];

var TREND_LABELS = {
  '持续恶化':'bad','首次变坏':'bad','高位波动':'bad',
  '持续改善':'good','恢复正常':'recover',
  '正常':'normal','低位稳定':'normal'
};

/* ── 工具函数 ── */
function cycleFmt(n){ return Math.round(n*10)/10; }
function cycleDiffText(n){ return (n>=0?'+':'')+cycleFmt(n); }
function cycleStatusClass(diff){
  if(diff>=1.0) return 'late';
  if(diff<=-1.0) return 'good';
  return 'normal';
}
function cycleTrendClass(label){
  return TREND_LABELS[label]||'normal';
}

/* ── buildTimeline: 计算各段甘特图位置（含T3并行） ── */
function buildTimeline(d){
  var cycles = [];
  var totalActual = 0, totalTarget = 0;
  CYCLE_DEF.forEach(function(cd){
    var mTarget = d.targets[cd.code] || cd.target;
    var mActual = d.actuals[cd.code] || cd.actual;
    totalTarget += mTarget;
    totalActual += mActual;
    var nodes = cd.nodes.map(function(nd){
      var nt = mTarget * (nd.target / cd.target);
      var na = mActual * (nd.actual / cd.actual);
      return { code:nd.code, name:nd.name, target:cycleFmt(nt), actual:cycleFmt(na), diff:cycleFmt(na-nt) };
    });
    cycles.push({
      code:cd.code, name:cd.name, short:cd.short,
      target:cycleFmt(mTarget), actual:cycleFmt(mActual), diff:cycleFmt(mActual-mTarget),
      trend:cd.trend, nodes:nodes, factors:cd.factors||[],
      planStart:0, planDuration:0, planMetricDuration:0, planLayoutNote:'',
      actualStart:0, actualDuration:0, actualMetricDuration:0, actualLayoutNote:''
    });
  });

  function durOf(cycle, field){ return cycle[field]; }

  function assignCycle(cycle, kind, field, start, metricDuration, opts){
    opts = opts||{};
    var dur = durOf(cycle, field);
    var barSpan = opts.span === undefined ? metricDuration : opts.span;
    cycle[kind+'Start'] = cycleFmt(start);
    cycle[kind+'Duration'] = Math.max(0.1, cycleFmt(barSpan));
    cycle[kind+'MetricDuration'] = metricDuration;
    cycle[kind+'LayoutNote'] = opts.note||'';
    // distribute nodes proportionally
    var cursor = cycleFmt(start);
    cycle.nodes.forEach(function(node){
      var fraction = node[kind === 'plan' ? 'target' : 'actual'] / durOf(cycle, kind === 'plan' ? 'target' : 'actual');
      var nDur = cycleFmt(cycle[kind+'Duration'] * fraction);
      node[kind+'Start'] = cursor;
      node[kind+'Duration'] = Math.max(0.1, nDur);
      cursor = cycleFmt(cursor + nDur);
    });
  }

  // Sequential layout for plan
  (function(){
    var cursor = 0;
    cycles.forEach(function(cycle){
      assignCycle(cycle, 'plan', 'target', cursor, cycle.target);
      cursor = cycleFmt(cursor + cycle.target);
    });
  })();

  // Sequential layout for actual (then apply parallel)
  (function(){
    var cursor = 0;
    cycles.forEach(function(cycle){
      assignCycle(cycle, 'actual', 'actual', cursor, cycle.actual);
      cursor = cycleFmt(cursor + cycle.actual);
    });
  })();

  // Apply PROC parallel layout (T3 starts from T2 midpoint, ends at T4 midpoint)
  function applyParallel(kind){
    var byCode = {};
    cycles.forEach(function(c){ byCode[c.code]=c; });
    var t2 = byCode.PLAN, t3 = byCode.PROC, t4 = byCode.MFG;
    if(!t2||!t3||!t4) return;

    // T4 follows T2
    var t2Start = t2[kind+'Start'];
    var t2Dur = t2[kind+'Duration'];
    var t2End = cycleFmt(t2Start + t2Dur);
    assignCycle(t4, kind, kind==='plan'?'target':'actual', t2End, durOf(t4, kind==='plan'?'target':'actual'), {note:'承接展示：T2结尾=T4开始'});

    // T3 from T2 midpoint to T4 midpoint
    var t3Start = cycleFmt(t2Start + t2Dur * 0.5);
    var t4Start = t4[kind+'Start'];
    var t4Dur = t4[kind+'Duration'];
    var t3End = cycleFmt(t4Start + t4Dur * 0.5);
    var t3Span = Math.max(0.2, cycleFmt(t3End - t3Start));
    assignCycle(t3, kind, kind==='plan'?'target':'actual', t3Start, durOf(t3, kind==='plan'?'target':'actual'), {note:'并行展示：T2中点→T4中点', span:t3Span, compressNodes:true});

    // T5, T6 follow T4
    var cursor2 = cycleFmt(t4Start + t4Dur);
    ['INV','SHIP'].forEach(function(code){
      var cycle = byCode[code];
      if(!cycle) return;
      assignCycle(cycle, kind, kind==='plan'?'target':'actual', cursor2, durOf(cycle, kind==='plan'?'target':'actual'));
      cursor2 = cycleFmt(cursor2 + cycle[kind+'Duration']);
    });
  }
  applyParallel('plan');
  applyParallel('actual');

  var maxEnd = 0;
  cycles.forEach(function(cycle){
    maxEnd = Math.max(maxEnd, cycle.planStart+cycle.planDuration, cycle.actualStart+cycle.actualDuration);
    cycle.nodes.forEach(function(node){
      maxEnd = Math.max(maxEnd, (node.planStart||0)+(node.planDuration||0), (node.actualStart||0)+(node.actualDuration||0));
    });
  });

  return { cycles:cycles, totalDuration:Math.ceil(maxEnd+2), totalTarget:cycleFmt(totalTarget), totalActual:cycleFmt(totalActual) };
}

/* ── Tick marks ── */
function ticks(total){
  var step = total>35?5:total>18?3:2;
  var arr=[];
  for(var i=step;i<=total;i+=step) arr.push(i);
  return arr;
}

/* ── Grid HTML (tick marks in timeline) ── */
function gridHtml(total){
  return '<div class="cycle-grid">' + ticks(total).map(function(t){
    return '<span class="cycle-tick"><span>'+t+'</span></span>';
  }).join('') + '</div>';
}

/* ── Bar HTML ── */
function barHtml(label, kind, start, duration, total, diff, metricDuration, layoutNote){
  var left = (start/total)*100;
  var width = Math.max(1.2, (duration/total)*100);
  var cls = kind==='actual' ? cycleStatusClass(diff) : '';
  var metric = metricDuration===undefined ? duration : metricDuration;
  var metricLabel = kind==='plan'?'目标':'实际';
  var noteLine = layoutNote ? ' | '+layoutNote : '';
  var tip = label+'\\n'+metricLabel+'：'+cycleFmt(metric)+'天 | 起止：Day '+cycleFmt(start)+' - Day '+cycleFmt(start+duration)+' | 差额：'+cycleDiffText(diff)+'天'+noteLine;
  return '<div class="cbar '+kind+' '+cls+'" style="left:'+left+'%;width:'+width+'%;" title="'+tip+'"></div>';
}

/* ── Factor pills ── */
function factorPillsHtml(factors){
  if(!factors||!factors.length) return '';
  return '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">' +
    factors.map(function(f){
      return '<span class="cycle-factor-pill '+f.cls+'"><span class="fp-name">'+f.name+'</span> '+f.val+'</span>';
    }).join('') + '</div>';
}

/* ── Cycle row (L1) ── */
function cycleRowHtml(cycle, total){
  var expanded = !!expandedCycles[cycle.code];
  var isActive = activeCycleCode === cycle.code;
  var effective = cycleFmt(cycle.actual - cycle.diff*0.3); // simplified effective calculation
  var effectiveDiff = cycleFmt(effective - cycle.target);

  var html = '<div class="cycle-gantt-row l1 '+(isActive?'active':'')+'" data-cycle="'+cycle.code+'">';
  // Col 1: label
  html += '<div class="cycle-cell"><div class="cycle-label-main">';
  html += '<button type="button" class="cycle-expander '+(expanded?'expanded':'')+'" onclick="toggleCycleExpand(\''+cycle.code+'\')">▶</button>';
  html += '<div><div class="cycle-label-title">'+cycle.short+'</div>';
  html += '<div class="cycle-label-sub">目标 '+cycle.target+'天｜实际 '+cycle.actual+'天｜差额 <span class="cycle-diff '+cycleStatusClass(cycle.diff)+'">'+cycleDiffText(cycle.diff)+'天</span></div>';
  html += factorPillsHtml(cycle.factors);
  html += '</div></div></div>';
  // Col 2: timeline
  html += '<div class="cycle-cell"><div class="cycle-timeline">';
  html += gridHtml(total);
  html += barHtml(cycle.name, 'plan', cycle.planStart, cycle.planDuration, total, cycle.diff, cycle.planMetricDuration, cycle.planLayoutNote);
  html += barHtml(cycle.name, 'actual', cycle.actualStart, cycle.actualDuration, total, cycle.diff, cycle.actualMetricDuration, cycle.actualLayoutNote);
  html += '</div></div>';
  // Col 3: trend
  var trendCls = cycleTrendClass(cycle.trend);
  html += '<div class="cycle-cell" style="display:grid;place-items:center;"><span class="cycle-trend-tag '+trendCls+'">'+cycle.trend+'</span></div>';
  // Col 4: effective
  var efcCls = cycleStatusClass(effectiveDiff);
  html += '<div class="cycle-cell cycle-effective-cell"><div class="cycle-effective-main cycle-diff '+efcCls+'">'+cycleFmt(effective)+'天</div>';
  html += '<div class="cycle-effective-meta">修正 '+cycleDiffText(effective-cycle.actual)+'天｜差额 '+cycleDiffText(effectiveDiff)+'天</div></div>';
  html += '</div>';

  // L2 sub-nodes
  cycle.nodes.forEach(function(node){
    html += nodeRowHtml(node, cycle, total, expanded);
  });

  return html;
}

/* ── Node row (L2) ── */
function nodeRowHtml(node, cycle, total, expanded){
  var code = cycle.code.replace(/T\d/, 'T') + '.' + node.code;
  html = '<div class="cycle-gantt-row l2 '+(expanded?'':'cycle-hidden')+'" data-parent="'+cycle.code+'">';
  // Col 1
  html += '<div class="cycle-cell"><div class="cycle-label-main"><div class="cycle-label-title" style="padding-left:32px;">'+code+' '+node.name+'</div></div></div>';
  // Col 2
  html += '<div class="cycle-cell"><div class="cycle-timeline">';
  html += gridHtml(total);
  if(node.planStart!==undefined) html += barHtml(node.name, 'plan', node.planStart, node.planDuration, total, node.diff, node.planDuration, '');
  if(node.actualStart!==undefined) html += barHtml(node.name, 'actual', node.actualStart, node.actualDuration, total, node.diff, node.actualDuration, '');
  html += '</div></div>';
  // Col 3: trend placeholder
  html += '<div class="cycle-cell" style="display:grid;place-items:center;"><span style="font-size:11px;color:var(--text-muted);">—</span></div>';
  // Col 4: actual
  var ndCls = cycleStatusClass(node.diff);
  html += '<div class="cycle-cell cycle-effective-cell"><div class="cycle-effective-main cycle-diff '+ndCls+'">'+cycleFmt(node.actual)+'天</div>';
  html += '<div class="cycle-effective-meta">目标'+cycleFmt(node.target)+'天</div></div>';
  html += '</div>';
  return html;
}

/* ── Toggle expand ── */
function toggleCycleExpand(code){
  expandedCycles[code] = !expandedCycles[code];
  activeCycleCode = code;
  if(!cycleCache) return;
  renderCycleGantt(cycleCache);
}

/* ── Build project cycle data ── */
function buildCycleData(proj){
  var seed = 0;
  for(var i=0;i<(proj.id||'').length;i++) seed += (proj.id||'').charCodeAt(i);
  var jitter = function(base, factor){
    return Math.max(0.5, cycleFmt(base * (0.8 + ((seed*factor)%40)/100)));
  };
  var targets={}, actuals={};
  CYCLE_DEF.forEach(function(cd, idx){
    targets[cd.code] = jitter(cd.target, idx*7+1);
    actuals[cd.code] = jitter(cd.actual, idx*11+3);
  });
  return { proj:proj, targets:targets, actuals:actuals };
}

/* ── KPI Cards ── */
function renderCycleKpi(d){
  var el = document.getElementById('cycleKpiGrid'); if(!el) return;
  var tl = buildTimeline(d);
  var totalAct = tl.totalActual, totalTgt = tl.totalTarget;
  var dev = cycleFmt(totalAct - totalTgt);
  var bottleneck = CYCLE_DEF.reduce(function(a,b){ return (d.actuals[a.code]-d.targets[a.code])>(d.actuals[b.code]-d.targets[b.code])?a:b; });
  var trendText = '正常';
  CYCLE_DEF.forEach(function(cd){ if(cd.trend==='持续恶化'||cd.trend==='首次变坏') trendText='需关注'; });
  var items = [
    {lbl:'OTS总周期',val:totalAct+'天',sub:'目标 '+totalTgt+'天',color:dev>2?'var(--danger)':dev>0?'var(--warning)':'var(--success)'},
    {lbl:'总偏差',val:cycleDiffText(dev)+'天',sub:dev>0?'超目标':'优于目标',color:dev>2?'var(--danger)':dev>0?'var(--warning)':'var(--success)'},
    {lbl:'瓶颈环节',val:bottleneck.short,sub:'偏差'+cycleDiffText(d.actuals[bottleneck.code]-d.targets[bottleneck.code])+'天',color:'var(--danger)'},
    {lbl:'趋势判断',val:trendText,sub:'近5期综合判定',color:trendText==='需关注'?'var(--warning)':'var(--success)'}
  ];
  el.innerHTML = items.map(function(it){
    return '<div class="kpi-card" style="border-left:3px solid '+it.color+';"><div class="kpi-label">'+it.lbl+'</div><div class="kpi-value" style="color:'+it.color+';">'+it.val+'</div><div class="kpi-sub">'+it.sub+'</div></div>';
  }).join('');
}

/* ── Gantt main render ── */
function renderCycleGantt(d){
  var body = document.getElementById('cycleGanttBody'); if(!body) return;
  var tl = buildTimeline(d);
  var html = '';
  tl.cycles.forEach(function(cycle){
    html += cycleRowHtml(cycle, tl.totalDuration);
  });
  body.innerHTML = html;
}

/* ── Deviation table ── */
function renderDevTable(d){
  var el = document.getElementById('cycleDevTableBody'); if(!el) return;
  var tl = buildTimeline(d);
  el.innerHTML = tl.cycles.map(function(c){
    var st = c.diff>=3?'异常':c.diff>=1?'关注':'正常';
    var stColor = c.diff>=3?'var(--danger)':c.diff>=1?'var(--warning)':'var(--success)';
    return '<tr style="background:'+(c.diff>=3?'var(--danger-bg)':c.diff>=1?'var(--warning-bg)':'')+'"><td style="font-size:11px;font-weight:600;color:'+stColor+'">'+c.code.replace(/^(RESP|PLAN|PROC|MFG|INV|SHIP)$/,'T$&'.replace('RESP','1').replace('PLAN','2').replace('PROC','3').replace('MFG','4').replace('INV','5').replace('SHIP','6'))+'</td><td>'+c.name.split(' ').pop()+'</td><td>'+c.target+'</td><td>'+c.actual+'</td><td style="font-weight:600;color:'+stColor+'">'+cycleDiffText(c.diff)+'</td><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+stColor+';margin-right:4px;"></span>'+st+'</td></tr>';
  }).join('');
}

/* ── Trend chart ── */
function drawTrendChart(d){
  var canvas = document.getElementById('cycleTrendChart'); if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var tl = buildTimeline(d);
  var weeks = ['W17','W18','W19','W20','W21'];
  var baseAct = tl.totalActual;
  var baseTgt = tl.totalTarget;
  var seed = 0;
  for(var i=0;i<(d.proj.id||'').length;i++) seed+=(d.proj.id||'').charCodeAt(i);
  var actuals = weeks.map(function(w,i){ return Math.round(baseAct - 3 + ((seed*(i+1))%7)); });
  var targets = weeks.map(function(){ return Math.round(baseTgt); });
  if(window._cycleTrendChart && window._cycleTrendChart.destroy) window._cycleTrendChart.destroy();
  window._cycleTrendChart = new Chart(ctx, {
    type:'line',
    data:{
      labels:weeks,
      datasets:[
        {label:'实际OTS',data:actuals,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',fill:true,tension:0.3,pointRadius:4,pointBackgroundColor:'#3b82f6'},
        {label:'目标OTS',data:targets,borderColor:'#94a3b8',borderDash:[5,5],backgroundColor:'transparent',tension:0,pointRadius:0}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{font:{size:11},usePointStyle:true,pointStyle:'circle'}}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:11}}},
        y:{grid:{color:'var(--border-light)'},ticks:{font:{size:11},callback:function(v){return v+'天';}}}
      }
    }
  });
}

/* ── onCycleProjectChange ── */
function onCycleProjectChange(){
  try{
    var fp = getFilteredProjects();
    if(!fp||!fp.length) return;
    var sel = document.getElementById('cycleProjectSelect');
    var projId = sel?sel.value:'';
    var proj = fp.find(function(p){return p.id===projId;})||fp[0];
    if(!proj) return;
    cycleCache = buildCycleData(proj);
    renderAllCycle(cycleCache);
  }catch(e){console.error('cycle project change error:',e);}
}

/* ── renderAll ── */
function renderAllCycle(d){
  renderCycleKpi(d);
  renderCycleGantt(d);
  renderDevTable(d);
  drawTrendChart(d);
  resizeCharts();
}

/* ── initPage_cycle ── */
function initPage_cycle(){
  try{
    var fp = getFilteredProjects(); if(!fp.length) return;
    var sel = document.getElementById('cycleProjectSelect'); if(!sel) return;
    fillProjectSelect(sel, fp);
    consumeDrillDown('cycleProjectSelect');
    var proj = fp.find(function(p){return p.id===sel.value;})||fp[0];
    if(!proj) return;
    if(!sel.value&&fp.length) sel.value = proj.id;
    cycleCache = buildCycleData(proj);
    renderAllCycle(cycleCache);
  }catch(e){console.error('cycle init error:',e);}
}
