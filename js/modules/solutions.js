// Module: solutions — 5.2 方案对策（事件作战室）
(function(){
"use strict";

var SOLUTIONS_DATA = [
  { eventId:'E-0842', eventTitle:'单源物料TTS<3天', priority:'P1', status:'执行中', owner:'王磊', deadline:'06/26', progress:20,
    decision:{person:'赵总', time:'2026-06-24 14:30', selected:'方案A+方案B组合'},
    plans:[
      {name:'方案A: 紧急空运补货', cost:'¥80万', time:'3天', effect:'高', recommend:true, desc:'紧急空运500K pcs，预计06/26到货'},
      {name:'方案B: 跨项目调拨', cost:'¥0', time:'1天', effect:'中', recommend:false, desc:'AW03可让出2天用量'},
      {name:'方案C: 降级替代方案', cost:'¥15万', time:'7天', effect:'中', recommend:false, desc:'使用替代料号，需客户确认'}
    ],
    tasks:[
      {name:'联系供应商确认空运库存', owner:'王磊', deadline:'06/24', status:'已完成'},
      {name:'财务审批紧急采购单', owner:'张敏', deadline:'06/24', status:'进行中'},
      {name:'安排AW01工单暂停计划', owner:'李强', deadline:'06/25', status:'待开始'},
      {name:'第二货源认证评审会', owner:'王磊', deadline:'06/25', status:'待开始'},
      {name:'库存到货确认', owner:'仓储组', deadline:'06/26', status:'待开始'},
      {name:'恢复生产计划', owner:'李强', deadline:'06/27', status:'待开始'}
    ],
    timeline:[
      {time:'06/24 17:20', user:'王磊', text:'已与供应商确认，可空运500K pcs，预计06/26到货'},
      {time:'06/24 15:10', user:'张敏', text:'财务审批已提交，等待VP审签'},
      {time:'06/24 14:30', user:'赵总', text:'批准方案A+B组合，授权¥80万紧急采购'},
      {time:'06/24 11:00', user:'王磊', text:'已完成跨项目调拨评估，AW03可让出2天用量'}
    ],
    metrics:[
      {name:'物料覆盖天数', current:2.8, target:14, unit:'天', trend:[2.8,3.1,3.5,5.0,8.0,12.0,14.0]},
      {name:'AW01工单状态', current:'暂停风险', target:'维持生产', unit:'', trend:[]},
      {name:'OTIF预测', current:92, target:95, unit:'%', trend:[92,91,93,94,94,95,95]}
    ],
    aiAdvice:{
      short:['立即启动空运或跨厂调拨，覆盖最低7天安全库存','通知受影响项目PM评估工单优先级排序'],
      mid:['加速第二货源认证，当前进度60%，需聚焦测试认证','与现有供应商谈判增加安全库存协议'],
      long:['将该料号列入双源强制策略清单，写入采购制度'],
      case:{id:'E-0712', date:'2025-11-18', desc:'单源类似处置，关闭用时14天，有效率92%'}
    }
  },
  { eventId:'E-0841', eventTitle:'贸易制裁新增物料', priority:'P1', status:'制定中', owner:'赵敏', deadline:'06/25', progress:10,
    decision:{person:'-', time:'-', selected:'待决策'},
    plans:[
      {name:'方案A: 替代料切换', cost:'¥200万', time:'30天', effect:'高', recommend:false, desc:'切换至非管制替代料'},
      {name:'方案B: 库存消化+客户沟通', cost:'¥50万', time:'14天', effect:'中', recommend:false, desc:'优先消耗在途库存并争取客户宽限'}
    ],
    tasks:[
      {name:'核查受影响物料清单', owner:'合规组', deadline:'06/24', status:'进行中'},
      {name:'评估替代料可行性', owner:'研发', deadline:'06/25', status:'待开始'},
      {name:'客户沟通预警', owner:'销售', deadline:'06/25', status:'待开始'}
    ],
    timeline:[
      {time:'06/24 07:15', user:'赵敏', text:'人工上报，启动合规评估'}
    ],
    metrics:[
      {name:'受影响项目数', current:3, target:0, unit:'个', trend:[3,3,3,2,2,1,0]},
      {name:'替代料覆盖度', current:15, target:80, unit:'%', trend:[15,20,30,45,60,75,80]}
    ],
    aiAdvice:{
      short:['立即冻结新增采购订单，锁定在途库存','启动客户沟通，争取宽限期'],
      mid:['加速替代料认证，聚焦核心料号','评估供应商产地切换可行性'],
      long:['建立涉管制物料预警清单，纳入采购前置审查'],
      case:{id:'E-0698', date:'2025-09-10', desc:'贸易合规事件，处置周期21天'}
    }
  },
  { eventId:'E-0839', eventTitle:'供应商延期7天', priority:'P2', status:'执行中', owner:'李强', deadline:'06/28', progress:65,
    decision:{person:'李强', time:'2026-06-23 16:30', selected:'方案A: 加急排产+空运'},
    plans:[
      {name:'方案A: 加急排产+空运', cost:'¥12万', time:'4天', effect:'高', recommend:true, desc:'供应商加急排产，部分空运到货'},
      {name:'方案B: 跨项目调拨', cost:'¥0', time:'2天', effect:'中', recommend:false, desc:'从其他项目调拨应急'}
    ],
    tasks:[
      {name:'供应商加急排产确认', owner:'李强', deadline:'06/23', status:'已完成'},
      {name:'安排加急物流', owner:'物流组', deadline:'06/25', status:'进行中'},
      {name:'到货入库验证', owner:'IQC', deadline:'06/27', status:'待开始'}
    ],
    timeline:[
      {time:'06/23 16:00', user:'李强', text:'联系供应商确认加急排产'},
      {time:'06/24 09:00', user:'物流组', text:'空运舱位已确认'}
    ],
    metrics:[
      {name:'交期偏差', current:7, target:0, unit:'天', trend:[7,6,5,3,1,0,0]},
      {name:'SW03齐套率', current:78, target:95, unit:'%', trend:[78,80,84,89,92,94,95]}
    ],
    aiAdvice:{
      short:['要求供应商提供每日产出计划','同步启动替代料评估'],
      mid:['评估该供应商产能弹性，建立预警阈值','将该物料纳入关键供应商日跟踪'],
      long:['推动该料号双源认证，降低单一供应商依赖'],
      case:{id:'E-0756', date:'2026-01-15', desc:'供应商延期处置，平均周期6天'}
    }
  }
];

var selectedSolution = SOLUTIONS_DATA[0];
var currentTab = 'overview';
var viewMode = 'kanban'; // kanban | list

function priorityColor(p){ return p==='P1'?'var(--danger)':p==='P2'?'var(--warning)':'var(--info)'; }
function statusColor(s){ return s==='制定中'?'var(--text-muted)':s==='执行中'?'var(--primary)':s==='验证中'?'var(--warning)':'var(--success)'; }

function initPage_solutions(){
  var container = document.getElementById('page-solutions');
  if(!container) return;
  container.innerHTML =
    '<div class="filter-bar">'
      +'<div class="filter-group"><label>优先级:</label><select id="solPriorityFilter"><option value="">全部</option><option value="P1">P1-紧急</option><option value="P2">P2-重要</option><option value="P3">P3-常规</option></select></div>'
      +'<div class="filter-group"><label>状态:</label><select id="solStatusFilter"><option value="">全部</option><option value="制定中">制定中</option><option value="执行中">执行中</option><option value="验证中">验证中</option><option value="已完成">已完成</option></select></div>'
      +'<span style="font-size:11px;color:var(--text-muted);margin-left:12px;">事件作战室 · 对策制定 · 任务拆解 · 执行跟踪</span>'
      +'<button class="cl-btn cl-btn-primary" style="margin-left:auto" onclick="window._solNew()">+ 新建方案</button>'
    +'</div>'
    +'<div id="solOverview"></div>'
    +'<div class="sol-main">'
      +'<div class="sol-left">'
        +'<div class="sol-view-toggle"><button onclick="window._solView(\'kanban\')" class="'+(viewMode==='kanban'?'active':'')+'">看板</button><button onclick="window._solView(\'list\')" class="'+(viewMode==='list'?'active':'')+'">列表</button></div>'
        +'<div id="solBoard"></div>'
      +'</div>'
      +'<div class="sol-right">'
        +'<div id="solDetail"></div>'
      +'</div>'
    +'</div>';

  document.getElementById('solPriorityFilter').onchange = renderAll;
  document.getElementById('solStatusFilter').onchange = renderAll;
  renderAll();
}

function renderAll(){
  renderOverview();
  renderBoard();
  renderDetail();
}

function getFiltered(){
  var pf = document.getElementById('solPriorityFilter').value;
  var sf = document.getElementById('solStatusFilter').value;
  return SOLUTIONS_DATA.filter(function(e){return(!pf||e.priority===pf)&&(!sf||e.status===sf);});
}

function renderOverview(){
  var el = document.getElementById('solOverview');
  if(!el) return;
  var active = SOLUTIONS_DATA.filter(function(e){return e.status!=='已完成';}).length;
  var p1 = SOLUTIONS_DATA.filter(function(e){return e.status!=='已完成' && e.priority==='P1';}).length;
  var avgDays = 6.2;
  var p1AvgDays = 3.8;
  var effectiveRate = 78;
  el.innerHTML =
    '<div class="sol-overview">'
      +'<div class="sol-overview-card"><div class="sol-overview-label">当前活跃方案</div><div class="sol-overview-num">'+active+' <span>个</span></div><div class="sol-overview-sub">P1方案：'+p1+'个</div></div>'
      +'<div class="sol-overview-card"><div class="sol-overview-label">平均执行天数</div><div class="sol-overview-num">'+avgDays+' <span>天</span></div><div class="sol-overview-sub">P1方案：'+p1AvgDays+'天</div></div>'
      +'<div class="sol-overview-card"><div class="sol-overview-label">方案有效率</div><div class="sol-overview-num">'+effectiveRate+'<span>%</span></div><div class="sol-overview-sub">上月：71%</div></div>'
    +'</div>';
}

function renderBoard(){
  var el = document.getElementById('solBoard');
  if(!el) return;
  var filtered = getFiltered();
  var cols = ['制定中','执行中','验证中','已完成'];

  if(viewMode==='kanban'){
    el.innerHTML = '<div class="sol-kanban">'+cols.map(function(c){
      var items = filtered.filter(function(e){return e.status===c;});
      return '<div class="sol-kanban-col">'
        +'<div class="sol-kanban-header">'+c+' <span class="sol-kanban-count">'+items.length+'</span></div>'
        +'<div class="sol-kanban-items">'+items.map(function(e){
          var active = selectedSolution && selectedSolution.eventId===e.eventId?'active':'';
          return '<div class="sol-kanban-card '+active+'" onclick="window._solSelect(\''+e.eventId+'\')">'
            +'<div class="sol-card-priority" style="background:'+priorityColor(e.priority)+'">'+e.priority+'</div>'
            +'<div class="sol-card-title">'+e.eventTitle+'</div>'
            +'<div class="sol-card-meta">'+e.owner+'</div>'
            +'<div class="sol-card-meta">截止'+e.deadline+'</div>'
            +'<div class="sol-progress"><div class="sol-progress-bar" style="width:'+e.progress+'%"></div></div><div class="sol-progress-text">进度 '+e.progress+'%</div>'
            +'</div>';
        }).join('')+'</div></div>';
    }).join('')+'</div>';
  } else {
    el.innerHTML = '<table class="data-table sol-list-table"><thead><tr><th>事件ID</th><th>事件标题</th><th>优先级</th><th>状态</th><th>责任人</th><th>截止</th><th>进度</th></tr></thead><tbody>'
      + filtered.map(function(e){
        return '<tr onclick="window._solSelect(\''+e.eventId+'\')">'
          +'<td>'+e.eventId+'</td><td>'+e.eventTitle+'</td>'
          +'<td><span class="cl-pill" style="background:'+priorityColor(e.priority)+'">'+e.priority+'</span></td>'
          +'<td><span class="cl-pill" style="background:'+statusColor(e.status)+'20;color:'+statusColor(e.status)+'">'+e.status+'</span></td>'
          +'<td>'+e.owner+'</td><td>'+e.deadline+'</td>'
          +'<td><div class="sol-progress" style="width:80px"><div class="sol-progress-bar" style="width:'+e.progress+'%"></div></div> '+e.progress+'%</td>'
          +'</tr>';
      }).join('')
      +'</tbody></table>';
  }
}

function renderDetail(){
  var el = document.getElementById('solDetail');
  if(!el || !selectedSolution) return;
  var s = selectedSolution;
  el.innerHTML =
    '<div class="sol-detail-card">'
      +'<div class="sol-detail-header">'
        +'<div><div class="sol-detail-title">'+s.eventTitle+'</div><div class="sol-detail-sub">'+s.eventId+' · '+s.priority+' · '+s.status+' · 责任人：'+s.owner+'</div></div>'
        +'<div class="sol-detail-status"><span class="cl-pill" style="background:'+statusColor(s.status)+'20;color:'+statusColor(s.status)+'">'+s.status+'</span></div>'
      +'</div>'
      +'<div class="sol-tabs">'
        +'<div class="sol-tab '+(currentTab==='overview'?'active':'')+'" onclick="window._solTab(\'overview\')">方案概述</div>'
        +'<div class="sol-tab '+(currentTab==='tasks'?'active':'')+'" onclick="window._solTab(\'tasks\')">任务分解</div>'
        +'<div class="sol-tab '+(currentTab==='progress'?'active':'')+'" onclick="window._solTab(\'progress\')">执行进展</div>'
        +'<div class="sol-tab '+(currentTab==='impact'?'active':'')+'" onclick="window._solTab(\'impact\')">影响跟踪</div>'
      +'</div>'
      +'<div class="sol-detail-body">'+renderTabContent(s)+'</div>'
      +'<div class="sol-ai-panel">'+renderAI(s.aiAdvice)+'</div>'
    +'</div>';
}

function renderTabContent(s){
  if(currentTab==='overview') return renderOverviewTab(s);
  if(currentTab==='tasks') return renderTasksTab(s);
  if(currentTab==='progress') return renderProgressTab(s);
  return renderImpactTab(s);
}

function renderOverviewTab(s){
  var rows = s.plans.map(function(p,i){
    return '<tr><td>'+(p.recommend?'<i class="fas fa-check-circle" style="color:var(--success)"></i>':'')+'</td><td>'+p.name+'</td><td>'+p.desc+'</td><td>'+p.cost+'</td><td>'+p.time+'</td><td>'+p.effect+'</td></tr>';
  }).join('');
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">关联事件</div><div class="sol-section-text">'+s.eventId+' '+s.eventTitle+'</div>'
    +'<div class="sol-section-title">处置思路</div><div class="sol-section-text">针对'+s.eventTitle+'，从成本、时效、有效性三个维度评估备选方案，优先选择推荐方案执行。</div>'
    +'<div class="sol-section-title">对策选项对比</div>'
    +'<table class="data-table sol-plan-table"><thead><tr><th>推荐</th><th>方案</th><th>描述</th><th>成本</th><th>时效</th><th>有效性</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="sol-decision-box">'
      +'<div><strong>已选方案：</strong>'+s.decision.selected+'</div>'
      +'<div><strong>决策人：</strong>'+s.decision.person+'</div>'
      +'<div><strong>决策时间：</strong>'+s.decision.time+'</div>'
    +'</div>'
  +'</div>';
}

function renderTasksTab(s){
  var rows = s.tasks.map(function(t){
    var statusColor = t.status==='已完成'?'var(--success)':t.status==='进行中'?'var(--warning)':'var(--text-muted)';
    return '<tr><td>'+t.name+'</td><td>'+t.owner+'</td><td>'+t.deadline+'</td><td style="color:'+statusColor+'">'+t.status+'</td></tr>';
  }).join('');
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">任务分解（WBS）</div>'
    +'<table class="data-table"><thead><tr><th>任务</th><th>责任人</th><th>截止日</th><th>状态</th></tr></thead><tbody>'+rows+'</tbody></table>'
  +'</div>';
}

function renderProgressTab(s){
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">执行进展时间轴</div>'
    +'<div class="sol-timeline">'+s.timeline.map(function(t){
      return '<div class="sol-timeline-item"><div class="sol-timeline-time">'+t.time+'</div><div class="sol-timeline-user">'+t.user+'</div><div class="sol-timeline-text">'+t.text+'</div></div>';
    }).join('')+'</div>'
    +'<div class="sol-comment-box"><input type="text" placeholder="输入进展更新..." style="flex:1"><button class="cl-btn cl-btn-primary">发送</button></div>'
  +'</div>';
}

function renderImpactTab(s){
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">关键指标变化</div>'
    +'<div class="sol-metrics">'+s.metrics.map(function(m){
      return '<div class="sol-metric-card">'
        +'<div class="sol-metric-name">'+m.name+'</div>'
        +'<div class="sol-metric-value">'+m.current+m.unit+' <span style="color:var(--text-muted)">→ 目标 '+m.target+m.unit+'</span></div>'
        +(m.trend.length?'<div class="sol-sparkline">'+m.trend.map(function(v,i){return '<div class="sol-spark-bar" style="height:'+(Math.max(10,Math.min(100,v)))+'%;left:'+(i*14)+'px"></div>';}).join('')+'</div>':'')
      +'</div>';
    }).join('')+'</div>'
  +'</div>';
}

function renderAI(ai){
  return '<div class="sol-ai-title"><i class="fas fa-robot"></i> AI对策建议</div>'
    +'<div class="sol-ai-section"><div class="sol-ai-sub">短期（0-7天）</div><ul>'+ai.short.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'
    +'<div class="sol-ai-section"><div class="sol-ai-sub">中期（7-30天）</div><ul>'+ai.mid.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'
    +'<div class="sol-ai-section"><div class="sol-ai-sub">长期（30天+）</div><ul>'+ai.long.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'
    +'<div class="sol-ai-case">参考相似案例：<b>'+ai.case.id+'</b>（'+ai.case.date+'）'+ai.case.desc+' <a onclick="switchPage(\'review\')">[查看详情]</a></div>';
}

window._solSelect = function(eid){
  selectedSolution = SOLUTIONS_DATA.find(function(e){return e.eventId===eid;}) || selectedSolution;
  renderBoard();
  renderDetail();
};

window._solTab = function(tab){ currentTab=tab; renderDetail(); };
window._solView = function(mode){ viewMode=mode; renderBoard(); };
window._solNew = function(){ alert('新建方案（后续对接表单）'); };

window.initPage_solutions = initPage_solutions;

})();
registerModule('solutions', window.initPage_solutions);
