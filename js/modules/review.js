// Module: review — 5.3 闭环复盘（验尸台+经验库）
(function(){
"use strict";

var REVIEW_DATA = [
  // ── 库存类：E-0850 EOL专用料高Aging呆滞（待复盘，与事件中心/方案对策串联）──
  { eventId:'E-0850', title:'EOL项目专用料高Aging预警（>90天呆滞）', closeDate:'07/02', status:'已关闭', days:9.0, effectiveness:'A-', score:88,
    timeline:[
      {time:'06/23 06:00', stage:'发现', text:'规则触发：DOI>90天 AND EOL项目', duration:'3.5小时'},
      {time:'06/23 09:30', stage:'响应', text:'吴芳接单启动呆滞评估', duration:'6.5小时'},
      {time:'06/24 16:00', stage:'决策', text:'方案A+B+C组合批准', duration:'8天'},
      {time:'06/28 10:00', stage:'客户回购', text:'客户回购3个料号完成', duration:'4天'},
      {time:'07/01 16:00', stage:'转用完成', text:'AU03跨项目转用完成', duration:'1天'},
      {time:'07/02 17:00', stage:'验证关闭', text:'呆滞金额降至¥95万，关闭事件', duration:'总计9.0天'}
    ],
    why:[
      'EOL项目AU01/AU02专用料库龄超90天，8个料号呆滞¥520万',
      'EOL启动时未同步冻结新增采购，导致后期仍有备料入库',
      'EOL物料消化计划未纳入项目管理里程碑，无专人跟踪',
      '控制塔上线前缺少DOI自动预警机制，库龄超期才发现',
      'EOL物料库龄分级预警机制缺失（无90/150/180天分级）'
    ],
    rootCauseTags:['流程根因：EOL启动时未冻结采购','制度根因：EOL消化计划未纳入项目考核','系统根因：缺少DOI分级自动预警'],
    metrics:[
      {name:'呆滞金额', expected:'降至¥150万', actual:'降至¥95万', eval:'优于预期'},
      {name:'库龄>180天料号', expected:'清零', actual:'清零', eval:'达成'},
      {name:'消化回收率', expected:'≥70%', actual:'82%', eval:'优于预期'},
      {name:'处置成本', expected:'¥13万', actual:'¥11万', eval:'优于预期'},
      {name:'处置时长', expected:'14天', actual:'9天', eval:'优于预期'}
    ],
    improvements:[
      {action:'EOL启动时自动冻结新增采购PR/PO', owner:'系统组', deadline:'07/30', status:'进行中'},
      {action:'建立DOI分级预警：90天提醒/150天预警/180天呆滞', owner:'系统组', deadline:'08/15', status:'待启动'},
      {action:'EOL物料消化计划纳入项目移交检查清单', owner:'PMO', deadline:'08/01', status:'待启动'}
    ],
    summary:'EOL项目启动时必须同步冻结采购并制定消化计划，DOI>90天即应触发分级预警，库龄>180天料号优先推动客户回购。',
    tags:['EOL呆滞','高Aging','库存风险','R04'],
    relatedCases:['E-0848','E-0821']
  },
  // ── 库存类：E-0848 成品呆滞（已复盘，与事件中心串联）──
  { eventId:'E-0848', title:'成品库存呆滞预警（EOL尾品>60天）', closeDate:'06/20', status:'待复盘', days:15.0, effectiveness:'B+', score:79,
    timeline:[
      {time:'06/05 09:00', stage:'发现', text:'规则触发：EOL成品DOI>60天', duration:'5小时'},
      {time:'06/05 14:00', stage:'响应', text:'周涛接单制定三路径方案', duration:'0.5小时'},
      {time:'06/05 14:30', stage:'决策', text:'三路径消化方案批准', duration:'5天'},
      {time:'06/10 10:00', stage:'客户回购', text:'客户回购4K台', duration:'5天'},
      {time:'06/15 16:00', stage:'内部促销', text:'促销5K台完成', duration:'5天'},
      {time:'06/20 18:00', stage:'验证关闭', text:'拆解回收3K台，关闭', duration:'总计15天'}
    ],
    why:[
      'SP01智能音箱EOL成品1.2万台积压，库龄超60天',
      'EOL通知发出后未及时启动成品消化计划',
      '成品库存库龄预警阈值设置过高（60天才触发）',
      '缺少EOL成品多路径消化标准流程'
    ],
    rootCauseTags:['流程根因：EOL成品消化启动滞后','制度根因：成品库龄预警阈值不合理','系统根因：缺少EOL成品自动消化流程'],
    metrics:[
      {name:'成品库存', expected:'清零', actual:'清零', eval:'达成'},
      {name:'回收金额', expected:'¥250万', actual:'¥285万', eval:'优于预期'},
      {name:'回收率', expected:'≥70%', actual:'79%', eval:'达成'},
      {name:'报废损失', expected:'¥110万', actual:'¥75万', eval:'优于预期'},
      {name:'处置时长', expected:'10天', actual:'15天', eval:'略超预期'}
    ],
    improvements:[
      {action:'EOL成品库龄预警阈值从60天降至30天', owner:'系统组', deadline:'07/15', status:'已完成'},
      {action:'建立EOL成品三路径消化标准SOP', owner:'仓储部', deadline:'07/30', status:'进行中'},
      {action:'EOL通知发出后7天内必须启动消化评估', owner:'PMO', deadline:'08/01', status:'待启动'}
    ],
    summary:'EOL成品应在库龄30天即触发预警，7天内启动三路径消化（客户回购+促销+拆解），避免积压至60天才处置。',
    tags:['EOL呆滞','成品库存','高Aging','R04'],
    relatedCases:['E-0821','E-0850']
  },
  // ── 供应类 ──
  { eventId:'E-0842', title:'单源物料TTS<3天', closeDate:'06/27', status:'待复盘', days:3.3, effectiveness:'B+', score:85,
    timeline:[
      {time:'06/24 08:32', stage:'发现', text:'规则触发', duration:'43分钟'},
      {time:'06/24 09:15', stage:'响应', text:'王磊接单', duration:'5.25小时'},
      {time:'06/24 14:30', stage:'决策', text:'方案确认', duration:'2.3天'},
      {time:'06/26 11:00', stage:'物料到货', text:'空运到货', duration:'0.3天'},
      {time:'06/27 17:00', stage:'验证关闭', text:'生产恢复', duration:'总计3.3天'}
    ],
    why:[
      '供应商XX产能受限，且歌尔仅有该单一供应商',
      '2024年Q3双源计划中止，资源被抽调至NPI项目',
      '采购KPI未包含「双源覆盖率」考核指标',
      '控制塔上线前缺少全局风险度量机制',
      '双源认证资源优先级机制缺失'
    ],
    rootCauseTags:['流程根因：双源认证资源优先级机制缺失','制度根因：采购KPI未对齐韧性目标','系统根因：无自动预警触发双源启动'],
    metrics:[
      {name:'物料覆盖天数', expected:'14天', actual:'12天', eval:'基本达成'},
      {name:'AW01工单', expected:'不停产', actual:'延迟4小时', eval:'基本达成'},
      {name:'OTIF', expected:'≥95%', actual:'94.2%', eval:'未达成'},
      {name:'处置成本', expected:'¥80万', actual:'¥73万', eval:'优于预期'},
      {name:'处置时长', expected:'3天', actual:'3.3天', eval:'略超预期'}
    ],
    improvements:[
      {action:'将双源覆盖率纳入采购季度KPI', owner:'赵敏', deadline:'07/15', status:'进行中'},
      {action:'建立单源物料强制预警规则', owner:'系统组', deadline:'07/30', status:'待启动'},
      {action:'制定NPI期间双源保护机制', owner:'王磊', deadline:'08/01', status:'待启动'}
    ],
    summary:'单源物料在NPI资源抽调期间需设置自动保护机制，双源认证中止时应自动提升风险等级并触发预警。',
    tags:['单源依赖','NPI冲突','韧性管理','R08'],
    relatedCases:['E-0712','E-0698']
  },
  { eventId:'E-0825', title:'NPI工程变更影响BOM', closeDate:'06/24', status:'待复盘', days:6.0, effectiveness:'A', score:92,
    timeline:[
      {time:'06/18 10:00', stage:'发现', text:'人工上报', duration:'4小时'},
      {time:'06/18 14:00', stage:'响应', text:'冻结BOM', duration:'5.8天'},
      {time:'06/24 09:00', stage:'关闭', text:'首批重排完成', duration:'总计6.0天'}
    ],
    why:['ECN通知过晚','BOM冻结窗口未固化','变更影响评估流程缺失'],
    rootCauseTags:['流程根因：ECN影响评估流程缺失','制度根因：BOM变更窗口未纳入考核'],
    metrics:[
      {name:'物料呆滞风险', expected:'消除', actual:'消除', eval:'达成'},
      {name:'重排成本', expected:'¥50万', actual:'¥42万', eval:'优于预期'},
      {name:'交付延迟', expected:'≤3天', actual:'2.5天', eval:'达成'}
    ],
    improvements:[
      {action:'建立ECN影响评估Checklist', owner:'工程部', deadline:'07/10', status:'进行中'},
      {action:'BOM冻结窗口纳入项目KPI', owner:'PMO', deadline:'07/20', status:'待启动'}
    ],
    summary:'ECN需提前D-7完成影响评估，BOM变更冻结窗口必须纳入项目里程碑。',
    tags:['ECN','BOM','NPI','R02'],
    relatedCases:['E-0789']
  }
];

var selectedReview = REVIEW_DATA[0];

function priorityColor(p){ return p==='P1'?'var(--danger)':p==='P2'?'var(--warning)':'var(--info)'; }

function initPage_review(){
  var container = document.getElementById('page-review');
  if(!container) return;
  container.innerHTML =
    '<div class="filter-bar">'
      +'<span style="font-size:11px;color:var(--text-muted)">闭环复盘 · 验证关闭 · 萃取经验 · 降低复发</span>'
      +'<button class="cl-btn cl-btn-primary" style="margin-left:auto" onclick="window._rvStats()">复盘统计</button>'
    +'</div>'
    +'<div class="rv-layout">'
      +'<div class="rv-left">'
        +'<div class="rv-section-title">待复盘事件队列</div>'
        +'<div class="rv-queue" id="rvQueue"></div>'
      +'</div>'
      +'<div class="rv-right" id="rvReport"></div>'
    +'</div>'
    +'<div id="rvStatsPanel" style="display:none"></div>';
  renderQueue();
  renderReport();
}

function renderQueue(){
  var el = document.getElementById('rvQueue');
  if(!el) return;
  el.innerHTML = REVIEW_DATA.map(function(r){
    var active = selectedReview && selectedReview.eventId===r.eventId?'active':'';
    var due = r.status==='待复盘'?'复盘截止：07/10':'';
    return '<div class="rv-queue-item '+active+'" onclick="window._rvSelect(\''+r.eventId+'\')">'
      +'<div class="rv-queue-title">'+r.title+'</div>'
      +'<div class="rv-queue-meta">'+r.eventId+' · 关闭时间 '+r.closeDate+' · 处置 '+r.days+'天</div>'
      +'<div class="rv-queue-meta">有效性 <b>'+r.effectiveness+'</b> · '+due+'</div>'
      +'</div>';
  }).join('');
}

function renderReport(){
  var el = document.getElementById('rvReport');
  if(!el || !selectedReview) return;
  var r = selectedReview;
  el.innerHTML =
    '<div class="rv-report-card">'
      +'<div class="rv-report-header">'
        +'<div><div class="rv-report-title">'+r.title+'</div><div class="rv-report-sub">'+r.eventId+' · 关闭时间 '+r.closeDate+' · 处置天数 '+r.days+'天</div></div>'
        +'<div class="rv-effectiveness">综合有效性 <b>'+r.effectiveness+'</b></div>'
      +'</div>'
      +'<div class="rv-modules">'
        +'<div class="rv-module">'
          +'<div class="rv-module-title">事件回顾</div>'
          +'<div class="rv-timeline">'+r.timeline.map(function(t){
            return '<div class="rv-timeline-item"><div class="rv-timeline-dot"></div><div class="rv-timeline-content"><div class="rv-timeline-time">'+t.time+'</div><div>'+t.stage+'：'+t.text+'</div><div class="rv-timeline-duration">'+t.duration+'</div></div></div>';
          }).join('')+'</div>'
        +'</div>'
        +'<div class="rv-module">'
          +'<div class="rv-module-title">根因分析（5-Why）</div>'
          +'<div class="rv-why-list">'+r.why.map(function(w,i){return '<div class="rv-why-item"><span>Why'+(i+1)+'</span>'+w+'</div>';}).join('')+'</div>'
          +'<div class="rv-root-tags">'+r.rootCauseTags.map(function(t){return '<div class="rv-root-tag">'+t+'</div>';}).join('')+'</div>'
        +'</div>'
        +'<div class="rv-module">'
          +'<div class="rv-module-title">方案效果评估</div>'
          +'<table class="data-table rv-compare-table"><thead><tr><th>指标</th><th>方案预期</th><th>实际结果</th><th>评价</th></tr></thead><tbody>'
          +r.metrics.map(function(m){return '<tr><td>'+m.name+'</td><td>'+m.expected+'</td><td>'+m.actual+'</td><td><span class="rv-eval-'+m.eval+'">'+m.eval+'</span></td></tr>';}).join('')
          +'</tbody></table>'
        +'</div>'
        +'<div class="rv-module">'
          +'<div class="rv-module-title">改进行动</div>'
          +'<table class="data-table rv-improve-table"><thead><tr><th>改进行动</th><th>责任人</th><th>期限</th><th>状态</th></tr></thead><tbody>'
          +r.improvements.map(function(i){return '<tr><td>'+i.action+'</td><td>'+i.owner+'</td><td>'+i.deadline+'</td><td><span class="rv-status-'+i.status+'">'+i.status+'</span></td></tr>';}).join('')
          +'</tbody></table>'
        +'</div>'
        +'<div class="rv-module rv-lesson-module">'
          +'<div class="rv-module-title">经验沉淀</div>'
          +'<div class="rv-lesson-summary">'+r.summary+'</div>'
          +'<div class="rv-tags">'+r.tags.map(function(t){return '<span class="rv-tag">#'+t+'</span>';}).join('')+'</div>'
          +'<div class="rv-related">相关案例：'+r.relatedCases.map(function(c){return '<a onclick="alert(\'跳转案例 '+c+'\')">'+c+'</a>';}).join('、')+'</div>'
          +'<button class="cl-btn cl-btn-primary" style="margin-top:12px" onclick="window._rvSyncKnowledge()">提交并同步到知识中心 6.1</button>'
        +'</div>'
      +'</div>'
    +'</div>';
}

function renderStats(){
  var el = document.getElementById('rvStatsPanel');
  if(!el) return;
  el.style.display = el.style.display==='none'?'block':'none';
  el.innerHTML =
    '<div class="rv-stats-card">'
      +'<div class="rv-stats-header"><span>本季度复盘统计</span><button onclick="window._rvStats()" style="background:none;border:none;cursor:pointer;font-size:18px">×</button></div>'
      +'<div class="rv-stats-grid">'
        +'<div class="rv-stat"><div class="rv-stat-num">38</div><div class="rv-stat-label">总复盘数</div></div>'
        +'<div class="rv-stat"><div class="rv-stat-num">87%</div><div class="rv-stat-label">按期完成率</div></div>'
        +'<div class="rv-stat"><div class="rv-stat-num">71%</div><div class="rv-stat-label">改进行动完成率</div></div>'
        +'<div class="rv-stat"><div class="rv-stat-num">76%</div><div class="rv-stat-label">方案有效率</div></div>'
      +'</div>'
      +'<div class="rv-root-chart">'
        +'<div class="rv-chart-title">高频根因 TOP5</div>'
        +'<div class="rv-bar-row"><span>① 单源依赖管理缺失</span><div class="rv-bar-wrap"><div class="rv-bar" style="width:80%"></div></div><span>8次</span></div>'
        +'<div class="rv-bar-row"><span>② 预测偏差未及时修订</span><div class="rv-bar-wrap"><div class="rv-bar" style="width:60%"></div></div><span>6次</span></div>'
        +'<div class="rv-bar-row"><span>③ Tier2可视度不足</span><div class="rv-bar-wrap"><div class="rv-bar" style="width:50%"></div></div><span>5次</span></div>'
        +'<div class="rv-bar-row"><span>④ NPI与运营资源冲突</span><div class="rv-bar-wrap"><div class="rv-bar" style="width:40%"></div></div><span>4次</span></div>'
        +'<div class="rv-bar-row"><span>⑤ 外部政策变动响应滞后</span><div class="rv-bar-wrap"><div class="rv-bar" style="width:30%"></div></div><span>3次</span></div>'
      +'</div>'
    +'</div>';
}

window._rvSelect = function(eid){
  selectedReview = REVIEW_DATA.find(function(r){return r.eventId===eid;}) || selectedReview;
  renderQueue();
  renderReport();
};

window._rvSyncKnowledge = function(){
  alert('已同步至知识中心 6.1');
  switchPage('knowledge');
};

window._rvStats = function(){
  renderStats();
};

window.initPage_review = initPage_review;

})();
registerModule('review', window.initPage_review);
