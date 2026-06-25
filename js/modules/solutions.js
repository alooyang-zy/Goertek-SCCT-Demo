// Module: solutions — 5.2 方案对策（事件作战室）
// 方案对策4大阶段：归因分析 → 方案制定 → 任务分解 → 执行反馈
// 事件状态统一：待响应(不进) → 处置中(在此页面) → 待复盘(完成离开) → 已归档
(function(){
"use strict";

var SOLUTIONS_DATA = [
  // ── E-0850 EOL专用料高Aging呆滞（处置中，归因分析→方案制定→任务分解→执行反馈）──
  { eventId:'E-0850', eventTitle:'EOL项目专用料高Aging预警（>90天呆滞）', priority:'P1', status:'处置中', owner:'吴芳', deadline:'06/28', progress:45, phase:'执行反馈',
    rootCause:'EOL项目AU01/AU02启动时未同步冻结新增采购，DOI>90天才触发预警，消化计划未纳入项目考核。库龄>180天的3个专用料号（外壳/FPC/专用镜片）无替代用途。',
    decision:{person:'刘总监', time:'2026-06-24 16:00', selected:'方案A+方案B+方案C组合执行'},
    plans:[
      {name:'方案A: 客户买单回购', cost:'¥0', time:'7天', effect:'高', recommend:true, desc:'推动客户按EOL协议回购3个超180天料号，预计回收¥180万'},
      {name:'方案B: 跨项目转用', cost:'¥5万', time:'3天', effect:'中', recommend:true, desc:'将通用料（螺丝包/密封圈/导热垫片）转用至AU03新项目，消化¥120万'},
      {name:'方案C: 供应商退货', cost:'¥8万', time:'10天', effect:'中', recommend:false, desc:'与供应商协商退货专用IC和FPC排线，预计回收¥90万，需支付8%手续费'},
      {name:'方案D: 报废处理', cost:'¥380万', time:'1天', effect:'低', recommend:false, desc:'无法消化的料号直接报废，损失¥380万（最后手段）'}
    ],
    tasks:[
      {name:'梳理8个料号的库存明细和库龄分布', owner:'吴芳', deadline:'06/24', status:'已完成'},
      {name:'与客户沟通EOL买单回购清单', owner:'销售组', deadline:'06/25', status:'进行中'},
      {name:'评估AU03项目转用可行性', owner:'计划部', deadline:'06/25', status:'进行中'},
      {name:'供应商退货谈判（专用IC/FPC）', owner:'采购组', deadline:'06/26', status:'待开始'},
      {name:'无法消化料号报废审批', owner:'财务部', deadline:'06/27', status:'待开始'},
      {name:'更新EOL物料消化周报', owner:'吴芳', deadline:'06/28', status:'待开始'}
    ],
    timeline:[
      {time:'06/24 15:00', user:'吴芳', text:'已与客户沟通买单清单，客户初步同意回购3个料号，等待正式确认'},
      {time:'06/24 10:00', user:'吴芳', text:'完成8个料号影响分析：3个超180天需优先处置，5个90-180天可转用'},
      {time:'06/24 16:00', user:'刘总监', text:'批准方案A+B+C组合，授权跨项目转用及供应商退货谈判'}
    ],
    metrics:[
      {name:'呆滞金额', current:520, target:150, unit:'万', trend:[520,480,420,380,320,280,150]},
      {name:'库龄>180天料号数', current:3, target:0, unit:'个', trend:[3,3,2,2,1,1,0]},
      {name:'消化回收率', current:35, target:75, unit:'%', trend:[0,8,15,25,30,35,75]}
    ],
    aiAdvice:{
      short:['优先推动客户买单回购，EOL协议中有回购条款可依据','通用料（螺丝包/密封圈）立即启动跨项目转用评估'],
      mid:['建立EOL项目物料库龄分级预警（90/150/180天三级）','EOL启动时同步冻结新增采购，仅允许消耗现有库存'],
      long:['将EOL呆滞率纳入项目移交考核指标，NPI→MP转移时需评估遗留库存风险'],
      case:{id:'E-0848', date:'2026-06-20', desc:'SP01成品呆滞三路径消化，回收率79%，关闭用时15天'}
    }
  },
  // ── E-0851 原材料DOI超标（处置中，归因分析阶段）──
  { eventId:'E-0851', eventTitle:'原材料DOI超标预警（>120天高Aging）', priority:'P2', status:'处置中', owner:'张敏', deadline:'07/05', progress:15, phase:'归因分析',
    rootCause:'HW01/HW02项目需求下修后采购计划未同步调整，导致5个通用料号系统性超采。蓝牙模块和电源管理IC因预测偏差累计超采25K/18K PCS。',
    decision:{person:'-', time:'-', selected:'待决策'},
    plans:[
      {name:'方案A: 冻结采购+跨项目转用', cost:'¥0', time:'5天', effect:'中', recommend:false, desc:'冻结5个料号新增采购，推动HW03/HW04项目转用消化'},
      {name:'方案B: 供应商协商退换', cost:'¥12万', time:'14天', effect:'中', recommend:false, desc:'与供应商协商退换或折价回收，预计回收¥120万'},
      {name:'方案C: 降级使用至低端产品', cost:'¥3万', time:'21天', effect:'低', recommend:false, desc:'评估蓝牙模块/电源IC降级用于低端产品线的可行性'}
    ],
    tasks:[
      {name:'核查5个料号在途订单和未来需求', owner:'张敏', deadline:'06/26', status:'进行中'},
      {name:'评估跨项目转用可行性', owner:'计划部', deadline:'06/28', status:'待开始'},
      {name:'供应商退换谈判方案准备', owner:'采购组', deadline:'07/01', status:'待开始'}
    ],
    timeline:[
      {time:'06/25 08:00', user:'系统', text:'规则自动触发：DOI>120天预警'},
      {time:'06/25 09:00', user:'张敏', text:'接单确认，启动库存核查'}
    ],
    metrics:[
      {name:'超龄料号数', current:5, target:0, unit:'个', trend:[5,5,4,3,2,1,0]},
      {name:'资金占用', current:185, target:50, unit:'万', trend:[185,180,160,130,100,70,50]}
    ],
    aiAdvice:{
      short:['立即冻结5个料号的新增PR/PO，防止库存继续膨胀','优先推动通用料（Type-C/FPC）跨项目转用'],
      mid:['建立DOI分级预警机制：90天提醒/120天预警/150天严重/180天呆滞','将DOI指标纳入采购员月度考核'],
      long:['推动需求预测与采购计划联动，避免因预测偏差导致系统性超采'],
      case:{id:'E-0821', date:'2026-06-22', desc:'EOL专用料消化，客户买单回收率85%'}
    }
  },
  // ── E-0848 成品呆滞（待复盘，处置已完成）──
  { eventId:'E-0848', eventTitle:'成品库存呆滞预警（EOL尾品>60天）', priority:'P2', status:'待复盘', owner:'周涛', deadline:'06/20', progress:100, phase:'执行反馈',
    rootCause:'SP01智能音箱EOL通知发出后未及时启动成品消化，成品库存库龄预警阈值60天过高，缺少EOL成品多路径消化标准流程。',
    decision:{person:'刘总监', time:'2026-06-05 14:30', selected:'三路径组合消化'},
    plans:[
      {name:'方案A: 客户尾单回购', cost:'¥0', time:'5天', effect:'高', recommend:true, desc:'客户按EOL协议回购4K台，回收¥120万'},
      {name:'方案B: 内部促销', cost:'¥20万', time:'10天', effect:'中', recommend:true, desc:'员工内购+渠道促销5K台，回收¥100万'},
      {name:'方案C: 拆解回收', cost:'¥15万', time:'5天', effect:'低', recommend:false, desc:'拆解3K台回收元器件，回收¥65万'}
    ],
    tasks:[
      {name:'客户尾单回购谈判', owner:'销售组', deadline:'06/10', status:'已完成'},
      {name:'内部促销方案执行', owner:'市场部', deadline:'06/15', status:'已完成'},
      {name:'拆解回收执行', owner:'仓储组', deadline:'06/20', status:'已完成'}
    ],
    timeline:[
      {time:'06/05 14:00', user:'周涛', text:'接单，制定三路径消化方案'},
      {time:'06/10 10:00', user:'销售组', text:'客户尾单回购4K台，回收¥120万'},
      {time:'06/15 16:00', user:'市场部', text:'内部促销5K台完成，回收¥100万'},
      {time:'06/20 18:00', user:'仓储组', text:'拆解回收3K台，回收¥65万，处置完成'}
    ],
    metrics:[
      {name:'成品库存', current:0, target:0, unit:'K台', trend:[12,8,3,0,0,0,0]},
      {name:'回收金额', current:285, target:285, unit:'万', trend:[0,120,220,285,285,285,285]},
      {name:'回收率', current:79, target:80, unit:'%', trend:[0,33,61,79,79,79,79]}
    ],
    aiAdvice:{
      short:['三路径消化已执行完毕','报废损失¥75万在可接受范围内'],
      mid:['EOL成品应提前30天启动消化，避免库龄超60天才处置'],
      long:['建立EOL成品库存预警机制，库龄>30天即触发消化评估'],
      case:{id:'E-0821', date:'2026-06-22', desc:'EOL专用料消化，客户买单回收率85%'}
    }
  },
  // ── E-0842 单源物料TTS<3天（处置中）──
  { eventId:'E-0842', eventTitle:'单源物料TTS<3天', priority:'P1', status:'处置中', owner:'王磊', deadline:'06/26', progress:20, phase:'任务分解',
    rootCause:'供应商XX产能受限且歌尔仅有该单一供应商，2024年Q3双源计划中止后资源被抽调至NPI项目，第二货源认证进度仅60%。',
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
  // ── E-0839 供应商延期7天（处置中，方案制定阶段）──
  { eventId:'E-0839', eventTitle:'供应商延期7天', priority:'P2', status:'处置中', owner:'李强', deadline:'06/28', progress:65, phase:'执行反馈',
    rootCause:'关键供应商产能临时受限，交期承诺推迟7天。该供应商为SW03项目声学模组唯一供应源，产能弹性不足。',
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
var currentTab = 'rootcause'; // rootcause | plan | tasks | feedback
var viewMode = 'kanban';

// 4大阶段
var PHASES = ['归因分析','方案制定','任务分解','执行反馈'];

function priorityColor(p){ return p==='P1'?'var(--danger)':p==='P2'?'var(--warning)':'var(--info)'; }
function statusColor(s){ return s==='待响应'?'var(--danger)':s==='处置中'?'var(--warning)':s==='待复盘'?'#8b5cf6':'var(--text-muted)'; }

function initPage_solutions(){
  var container = document.getElementById('page-solutions');
  if(!container) return;
  container.innerHTML =
    '<div class="filter-bar">'
      +'<div class="filter-group"><label>优先级:</label><select id="solPriorityFilter"><option value="">全部</option><option value="P1">P1-紧急</option><option value="P2">P2-重要</option><option value="P3">P3-常规</option></select></div>'
      +'<div class="filter-group"><label>状态:</label><select id="solStatusFilter"><option value="">全部</option><option value="处置中">处置中</option><option value="待复盘">待复盘</option><option value="已归档">已归档</option></select></div>'
      +'<span style="font-size:11px;color:var(--text-muted);margin-left:12px;">事件作战室 · 归因分析→方案制定→任务分解→执行反馈</span>'
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
  var active = SOLUTIONS_DATA.filter(function(e){return e.status==='处置中';}).length;
  var pendingReview = SOLUTIONS_DATA.filter(function(e){return e.status==='待复盘';}).length;
  var avgDays = 6.2;
  var effectiveRate = 78;
  el.innerHTML =
    '<div class="sol-overview">'
      +'<div class="sol-overview-card"><div class="sol-overview-label">处置中方案</div><div class="sol-overview-num">'+active+' <span>个</span></div><div class="sol-overview-sub">待复盘：'+pendingReview+'个</div></div>'
      +'<div class="sol-overview-card"><div class="sol-overview-label">平均执行天数</div><div class="sol-overview-num">'+avgDays+' <span>天</span></div><div class="sol-overview-sub">上月：7.5天</div></div>'
      +'<div class="sol-overview-card"><div class="sol-overview-label">方案有效率</div><div class="sol-overview-num">'+effectiveRate+'<span>%</span></div><div class="sol-overview-sub">上月：71%</div></div>'
    +'</div>';
}

function renderBoard(){
  var el = document.getElementById('solBoard');
  if(!el) return;
  var filtered = getFiltered();

  if(viewMode==='kanban'){
    // 按4大阶段分列
    el.innerHTML = '<div class="sol-kanban">'+PHASES.map(function(ph){
      var items = filtered.filter(function(e){return e.phase===ph;});
      return '<div class="sol-kanban-col">'
        +'<div class="sol-kanban-header">'+ph+' <span class="sol-kanban-count">'+items.length+'</span></div>'
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
    el.innerHTML = '<table class="data-table sol-list-table"><thead><tr><th>事件ID</th><th>事件标题</th><th>优先级</th><th>状态</th><th>阶段</th><th>责任人</th><th>截止</th><th>进度</th></tr></thead><tbody>'
      + filtered.map(function(e){
        return '<tr onclick="window._solSelect(\''+e.eventId+'\')">'
          +'<td>'+e.eventId+'</td><td>'+e.eventTitle+'</td>'
          +'<td><span class="cl-pill" style="background:'+priorityColor(e.priority)+'">'+e.priority+'</span></td>'
          +'<td><span class="cl-pill" style="background:'+statusColor(e.status)+'20;color:'+statusColor(e.status)+'">'+e.status+'</span></td>'
          +'<td><span class="cl-pill" style="background:var(--primary-bg);color:var(--primary)">'+e.phase+'</span></td>'
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
      // 4大阶段Tab
      +'<div class="sol-tabs">'
        +'<div class="sol-tab '+(currentTab==='rootcause'?'active':'')+'" onclick="window._solTab(\'rootcause\')">① 归因分析</div>'
        +'<div class="sol-tab '+(currentTab==='plan'?'active':'')+'" onclick="window._solTab(\'plan\')">② 方案制定</div>'
        +'<div class="sol-tab '+(currentTab==='tasks'?'active':'')+'" onclick="window._solTab(\'tasks\')">③ 任务分解</div>'
        +'<div class="sol-tab '+(currentTab==='feedback'?'active':'')+'" onclick="window._solTab(\'feedback\')">④ 执行反馈</div>'
      +'</div>'
      +'<div class="sol-detail-body">'+renderTabContent(s)+'</div>'
      +'<div class="sol-ai-panel">'+renderAI(s.aiAdvice)+'</div>'
      + (s.status==='待复盘'?'<div style="padding:12px 16px;text-align:center"><button class="cl-btn cl-btn-primary" onclick="switchPage(\'review\')">处置完成，进入闭环复盘 →</button></div>':'')
    +'</div>';
}

function renderTabContent(s){
  if(currentTab==='rootcause') return renderRootCauseTab(s);
  if(currentTab==='plan') return renderPlanTab(s);
  if(currentTab==='tasks') return renderTasksTab(s);
  return renderFeedbackTab(s);
}

// ① 归因分析
function renderRootCauseTab(s){
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">根因分析</div>'
    +'<div class="sol-section-text" style="background:var(--warning-bg);border:1px solid var(--warning);border-radius:8px;padding:12px">'+s.rootCause+'</div>'
    +'<div class="sol-section-title">影响路径</div>'
    +'<div class="sol-section-text">'+(s.metrics.length?'涉及关键指标：'+s.metrics.map(function(m){return m.name;}).join('、'):'')+'</div>'
    +'<div class="sol-section-title">关联事件信息</div>'
    +'<div class="sol-section-text">'+s.eventId+' · 优先级'+s.priority+' · 责任人'+s.owner+'</div>'
  +'</div>';
}

// ② 方案制定
function renderPlanTab(s){
  var rows = s.plans.map(function(p,i){
    return '<tr><td>'+(p.recommend?'<i class="fas fa-check-circle" style="color:var(--success)"></i>':'')+'</td><td>'+p.name+'</td><td>'+p.desc+'</td><td>'+p.cost+'</td><td>'+p.time+'</td><td>'+p.effect+'</td></tr>';
  }).join('');
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">对策选项对比</div>'
    +'<table class="data-table sol-plan-table"><thead><tr><th>推荐</th><th>方案</th><th>描述</th><th>成本</th><th>时效</th><th>有效性</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="sol-decision-box">'
      +'<div><strong>已选方案：</strong>'+s.decision.selected+'</div>'
      +'<div><strong>决策人：</strong>'+s.decision.person+'</div>'
      +'<div><strong>决策时间：</strong>'+s.decision.time+'</div>'
    +'</div>'
  +'</div>';
}

// ③ 任务分解
function renderTasksTab(s){
  var rows = s.tasks.map(function(t){
    var stColor = t.status==='已完成'?'var(--success)':t.status==='进行中'?'var(--warning)':'var(--text-muted)';
    return '<tr><td>'+t.name+'</td><td>'+t.owner+'</td><td>'+t.deadline+'</td><td style="color:'+stColor+'">'+t.status+'</td></tr>';
  }).join('');
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">任务分解（WBS）</div>'
    +'<table class="data-table"><thead><tr><th>任务</th><th>责任人</th><th>截止日</th><th>状态</th></tr></thead><tbody>'+rows+'</tbody></table>'
  +'</div>';
}

// ④ 执行反馈
function renderFeedbackTab(s){
  return '<div class="sol-tab-content">'
    +'<div class="sol-section-title">执行进展时间轴</div>'
    +'<div class="sol-timeline">'+s.timeline.map(function(t){
      return '<div class="sol-timeline-item"><div class="sol-timeline-time">'+t.time+'</div><div class="sol-timeline-user">'+t.user+'</div><div class="sol-timeline-text">'+t.text+'</div></div>';
    }).join('')+'</div>'
    +'<div class="sol-section-title">关键指标跟踪</div>'
    +'<div class="sol-metrics">'+s.metrics.map(function(m){
      return '<div class="sol-metric-card">'
        +'<div class="sol-metric-name">'+m.name+'</div>'
        +'<div class="sol-metric-value">'+m.current+m.unit+' <span style="color:var(--text-muted)">→ 目标 '+m.target+m.unit+'</span></div>'
        +(m.trend.length?'<div class="sol-sparkline">'+m.trend.map(function(v,i){return '<div class="sol-spark-bar" style="height:'+(Math.max(10,Math.min(100,v)))+'%;left:'+(i*14)+'px"></div>';}).join('')+'</div>':'')
      +'</div>';
    }).join('')+'</div>'
    +'<div class="sol-comment-box"><input type="text" placeholder="输入进展更新..." style="flex:1"><button class="cl-btn cl-btn-primary">发送</button></div>'
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
  // 根据阶段自动切换Tab
  var ph = selectedSolution.phase;
  if(ph==='归因分析') currentTab='rootcause';
  else if(ph==='方案制定') currentTab='plan';
  else if(ph==='任务分解') currentTab='tasks';
  else currentTab='feedback';
  renderBoard();
  renderDetail();
};

window._solTab = function(tab){ currentTab=tab; renderDetail(); };
window._solView = function(mode){ viewMode=mode; renderBoard(); };
window._solNew = function(){ alert('新建方案（后续对接表单）'); };

window.initPage_solutions = initPage_solutions;

})();
registerModule('solutions', window.initPage_solutions);
