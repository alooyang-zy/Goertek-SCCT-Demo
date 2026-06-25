// Module: knowledge — 6.1 知识中心（智慧沉淀系统）
// 五大板块：风险案例库 | 供应商知识库 | 计划交付库 | SOP流程库 | 知识图谱
(function(){
"use strict";

// ═══════════════ 板块1：风险案例库 ═══════════════
var CASES = [
  { id:'KC-R-0142', title:'单源NAND Flash断供事件处置', riskType:'R08 单源依赖', projects:['AW01','AW02'], bg:'消费电子BG', duration:'3.3天', cost:'¥73万', score:'B+', recur:'中',
    timeline:'D0发现(TTS=2.8天)→D0响应(43分钟✅)→D0决策(5.25h⚠️超标)→D2空运到货→D3恢复生产',
    rootCause:'直接：NAND供应商产能受限无备用；管理：双源认证NPI期间中止；制度：采购KPI未含双源覆盖率',
    solution:'方案A空运(¥80万/3天)+方案B调拨(¥0/1天)组合执行',
    lessons:['单源物料NPI资源挤占期风险×2','空运+调拨组合优于单一方案，成本省8.75%','决策延迟在财务审批，需预授权'],
    improvements:[{a:'双源覆盖率纳入采购KPI', owner:'赵敏', due:'07/15', status:'进行中'},{a:'紧急采购预授权机制', owner:'财务', due:'07/30', status:'进行中'}],
    related:{cases:['KC-R-0098','KC-R-0067'], risks:['R08','R09','R11'], sop:'SOP-R08-001', supplier:'供应商XX'},
    tags:['单源依赖','NAND','NPI冲突','紧急空运']
  },
  { id:'KC-R-0141', title:'EOL专用料高Aging呆滞消化', riskType:'R04 EOL库存风险', projects:['AU01','AU02'], bg:'消费电子BG', duration:'9天', cost:'¥11万', score:'A-', recur:'低',
    timeline:'D0发现(DOI>90天)→D0接单→D1方案确认→D7客户回购→D9转用完成',
    rootCause:'直接：EOL启动未冻结采购；管理：消化计划未纳入考核；系统：无DOI分级预警',
    solution:'方案A客户回购(回收¥180万)+方案B跨项目转用(¥120万)+方案C供应商退货(¥90万)',
    lessons:['EOL启动必须同步冻结采购','DOI>90天即应分级预警','消化计划纳入项目移交检查'],
    improvements:[{a:'EOL启动自动冻结PR/PO', owner:'系统组', due:'07/30', status:'进行中'},{a:'DOI分级预警90/150/180天', owner:'系统组', due:'08/15', status:'待启动'}],
    related:{cases:['KC-R-0048','KC-R-0021'], risks:['R04'], sop:'SOP-R04-001', supplier:'-'},
    tags:['EOL呆滞','高Aging','DOI预警','跨项目转用']
  },
  { id:'KC-R-0048', title:'EOL成品呆滞三路径消化', riskType:'R04 EOL库存风险', projects:['SP01'], bg:'消费电子BG', duration:'15天', cost:'¥35万', score:'B+', recur:'低',
    timeline:'D0发现(DOI>60天)→D0接单→D5客户回购4K→D10促销5K→D15拆解3K关闭',
    rootCause:'直接：EOL通知后未及时启动消化；制度：预警阈值60天过高；流程：缺多路径消化SOP',
    solution:'方案A客户回购(¥120万)+方案B内部促销(¥100万)+方案C拆解回收(¥65万)',
    lessons:['EOL成品库龄>30天即应触发预警','三路径并行优于单路径','拆解回收可挽回20%残值'],
    improvements:[{a:'成品预警阈值60天→30天', owner:'系统组', due:'07/15', status:'已完成'},{a:'EOL三路径消化SOP', owner:'仓储部', due:'07/30', status:'进行中'}],
    related:{cases:['KC-R-0141','KC-R-0021'], risks:['R04'], sop:'SOP-R04-002', supplier:'-'},
    tags:['EOL呆滞','成品库存','三路径消化']
  },
  { id:'KC-R-0098', title:'贸易制裁物料替代方案启动', riskType:'R11 贸易合规', projects:['HW01','HW02'], bg:'消费电子BG', duration:'21天', cost:'¥200万', score:'B', recur:'中',
    timeline:'D0发现(管制清单更新)→D1接单→D3替代料评估→D14首批替代料到货→D21切换完成',
    rootCause:'直接：涉管制料号未前置筛查；管理：ECCN分类未纳入采购审批；系统：无管制清单自动比对',
    solution:'方案A替代料切换(¥200万/30天)，部分库存消化+客户宽限',
    lessons:['涉管制物料需建立前置筛查机制','替代料认证需提前储备','ECCN分类纳入采购审批流程'],
    improvements:[{a:'ECCN前置审查纳入采购流程', owner:'合规组', due:'08/01', status:'进行中'},{a:'管制清单自动比对系统', owner:'IT', due:'09/01', status:'待启动'}],
    related:{cases:['KC-R-0142'], risks:['R11','R08'], sop:'SOP-R11-001', supplier:'-'},
    tags:['贸易制裁','ECCN','替代料','合规']
  },
  { id:'KC-R-0025', title:'NPI工程变更BOM冲击处置', riskType:'R02 NPI/ECN变更', projects:['XR01'], bg:'消费电子BG', duration:'6天', cost:'¥42万', score:'A', recur:'低',
    timeline:'D0发现(ECN)→D0冻结BOM→D3物料重排→D6首批交付',
    rootCause:'直接：ECN通知过晚；管理：BOM冻结窗口未固化；流程：变更影响评估缺失',
    solution:'方案A冻结BOM窗口+方案B物料重排组合',
    lessons:['ECN需提前D-7完成影响评估','BOM冻结窗口纳入项目里程碑','变更影响评估Checklist必备'],
    improvements:[{a:'ECN影响评估Checklist', owner:'工程部', due:'07/10', status:'进行中'},{a:'BOM冻结窗口纳入KPI', owner:'PMO', due:'07/20', status:'待启动'}],
    related:{cases:['KC-R-0078'], risks:['R02'], sop:'SOP-R02-001', supplier:'-'},
    tags:['ECN','BOM变更','NPI','冻结窗口']
  },
  { id:'KC-R-0021', title:'EOL库存消化滞后处置', riskType:'R04 EOL库存风险', projects:['AU01'], bg:'消费电子BG', duration:'7天', cost:'¥8万', score:'B', recur:'低',
    timeline:'D0发现(消化率<80%)→D1客户买单→D5消化达85%→D7关闭',
    rootCause:'直接：EOL预测偏差；管理：消化计划滞后；流程：无客户买单标准流程',
    solution:'方案A客户买单回购，消化率达85%',
    lessons:['EOL启动即应制定客户买单清单','消化率周报机制','预测偏差>10%触发消化评审'],
    improvements:[{a:'EOL客户买单标准流程', owner:'销售', due:'07/10', status:'已完成'},{a:'消化率周报', owner:'计划部', due:'07/01', status:'已完成'}],
    related:{cases:['KC-R-0141','KC-R-0048'], risks:['R04'], sop:'SOP-R04-001', supplier:'-'},
    tags:['EOL呆滞','客户买单','消化率']
  }
];

// ═══════════════ 板块2：供应商知识库 ═══════════════
var SUPPLIERS = [
  { id:'SUP-001', name:'联发科', tier:'战略级', materials:'主芯片/蓝牙模块', otf:94.2, quality:99.1, response:88, price:'中等', singleSource:0, events:2, resilience:79, grade:'B+',
    risks:['历史断供2次(2024Q2/2025Q4)','平均恢复8.5天','Tier2透明度低'], certs:['IATF','ISO9001','Apple认证'], payment:'月结60天',
    relatedCases:['KC-R-0142','KC-R-0098'], relatedSop:'SOP-R08-001'
  },
  { id:'SUP-002', name:'ADI', tier:'战略级', materials:'声学驱动IC', otf:96.5, quality:99.5, response:92, price:'偏高', singleSource:2, events:1, resilience:82, grade:'B+',
    risks:['单源料号2个','价格偏高','产能弹性中等'], certs:['IATF','ISO14001'], payment:'月结45天',
    relatedCases:['KC-R-0142'], relatedSop:'SOP-R08-001'
  },
  { id:'SUP-003', name:'歌尔微', tier:'优选级', materials:'MEMS麦克风', otf:89.0, quality:97.2, response:78, price:'中等', singleSource:1, events:3, resilience:65, grade:'B-',
    risks:['单源料号1个','IQC不合格率偏高','SPC监控不足','认证未完成'], certs:['ISO9001'], payment:'月结30天',
    relatedCases:['KC-R-0048'], relatedSop:'SOP-R07-001'
  },
  { id:'SUP-004', name:'ATL', tier:'战略级', materials:'电池模组', otf:95.8, quality:99.3, response:90, price:'中等', singleSource:0, events:0, resilience:88, grade:'A-',
    risks:['无重大风险','产能充足','交付稳定'], certs:['IATF','ISO45001','Apple认证'], payment:'月结60天',
    relatedCases:[], relatedSop:'-'
  },
  { id:'SUP-005', name:'蓝思', tier:'优选级', materials:'外壳组件', otf:91.5, quality:98.0, response:85, price:'中等', singleSource:0, events:1, resilience:75, grade:'B',
    risks:['产能季节性波动','EOL物料呆滞风险'], certs:['ISO9001'], payment:'月结45天',
    relatedCases:['KC-R-0141'], relatedSop:'SOP-R04-001'
  }
];

// ═══════════════ 板块3：计划交付知识库 ═══════════════
var PLAN_KNOWLEDGE = [
  { id:'FCST-P-023', type:'需求预测规律', title:'Apple AW系列Q4旺季预测系统性低估', desc:'2023-2025连续3年Q3末预测vs Q4实际MAPE=18%，方向一致全部低估',
    rootCause:'Apple促销信息披露晚(T-4周)，历史拉动效应未纳入模型', advice:'Q3末预测×1.15作为备货上限，追踪渠道库存为领先指标', verified:'已验证(2026Q4采用)', tags:['Apple','AW系列','Q4旺季'] },
  { id:'FCST-P-018', type:'需求预测规律', title:'EOL项目末期需求高估趋势', desc:'EOL通知后8周内预测平均高估23%，导致呆滞',
    rootCause:'客户EOL通知后仍有零星订单但模型未及时下调', advice:'EOL通知即触发预测×0.7修正，周度滚动复核', verified:'已验证', tags:['EOL','预测高估','呆滞'] },
  { id:'DLV-K-007', type:'交期承诺经验', title:'跨BG产线借用产能损失系数', desc:'12次历史借用统计：实际产能损失=名义损失×1.3',
    rootCause:'切换+调试+良率恢复时间被系统性低估', advice:'交期答复遇跨BG借产线，产能系数调为0.77', verified:'已验证', tags:['产能借用','交期误差'] },
  { id:'DLV-K-012', type:'交期承诺经验', title:'单源物料紧急交付空运时效基准', desc:'8次空运事件统计：下单到到货平均2.8天，最快1.5天',
    rootCause:'-', advice:'单源断供TTS<3天时直接启动空运，无需等待审批超2小时', verified:'已验证', tags:['空运','紧急交付','单源'] },
  { id:'KIT-B-005', type:'齐套最佳实践', title:'关键BOM层级齐套检查时机', desc:'NPI阶段应在T-7/T-3/T-1三个时点检查齐套',
    rootCause:'-', advice:'NPI工单开立前T-7预检，T-3确认，T-1冻结', verified:'已验证', tags:['齐套','NPI','BOM'] },
  { id:'KIT-B-009', type:'齐套最佳实践', title:'Leadtime波动期间备货缓冲策略', desc:'供应商LT波动>20%时，安全库存需上调至1.5倍',
    rootCause:'-', advice:'监控供应商LT标准差，>20%触发安全库存自动上调', verified:'已验证', tags:['Leadtime','安全库存','波动'] }
];

// ═══════════════ 板块4：SOP流程库 ═══════════════
var SOPS = [
  { id:'SOP-R08-001', name:'单源供应商断供紧急处置', trigger:'R08 P1事件 OR TTS<7天', owner:'采购经理+PM', sla:'决策≤4小时', steps:'评估影响→方案制定→决策授权→跟踪验证', effective:82, uses:14, lastUpdate:'06/27', relatedCases:['KC-R-0142','KC-R-0098'] },
  { id:'SOP-R04-001', name:'EOL物料呆滞消化处置', trigger:'R04 DOI>90天', owner:'仓储+销售', sla:'2周内启动', steps:'库龄分级→消化方案→客户买单→转用/退货/报废', effective:85, uses:8, lastUpdate:'06/25', relatedCases:['KC-R-0141','KC-R-0021'] },
  { id:'SOP-R04-002', name:'EOL成品呆滞三路径消化', trigger:'EOL成品DOI>30天', owner:'仓储+市场', sla:'7天启动', steps:'成品评估→客户回购/促销/拆解→回收确认', effective:79, uses:5, lastUpdate:'06/20', relatedCases:['KC-R-0048'] },
  { id:'SOP-R11-001', name:'贸易制裁物料替代方案启动', trigger:'R11 管制清单更新', owner:'合规+采购', sla:'48小时评估', steps:'影响核查→替代料评估→客户沟通→切换执行', effective:71, uses:3, lastUpdate:'06/24', relatedCases:['KC-R-0098'] },
  { id:'SOP-R02-001', name:'NPI物料ECN变更应急处置', trigger:'R02 ECN影响BOM', owner:'工程+计划', sla:'24小时评估', steps:'变更评估→BOM冻结→物料重排→首批验证', effective:88, uses:6, lastUpdate:'06/24', relatedCases:['KC-R-0025'] },
  { id:'SOP-R06-001', name:'供应商交期异常升级处理', trigger:'R06 延期>3天', owner:'采购经理', sla:'24小时响应', steps:'影响评估→加急/调拨→产线缓冲→到货验证', effective:80, uses:11, lastUpdate:'06/23', relatedCases:['KC-R-0142'] },
  { id:'SOP-R07-001', name:'来料IQC不合格8D处理', trigger:'R07 不合格率>5%', owner:'SQE+质量', sla:'7天8D关闭', steps:'批次隔离→8D启动→原因分析→整改验证', effective:76, uses:9, lastUpdate:'06/25', relatedCases:[] },
  { id:'SOP-购-012', name:'紧急采购处置流程(含预授权)', trigger:'P1事件紧急采购', owner:'采购+财务', sla:'2小时审批', steps:'紧急评估→预授权通道→下单→到货跟踪', effective:84, uses:18, lastUpdate:'06/27', relatedCases:['KC-R-0142'] }
];

// ═══════════════ 板块5：知识图谱（节点+边+分析视图） ═══════════════
var GRAPH_NODES = [
  // 风险节点
  {id:'R08', type:'risk', name:'R08 单源依赖', score:82, freq:7, trend:'up'},
  {id:'R04', type:'risk', name:'R04 EOL库存风险', score:46, freq:5, trend:'down'},
  {id:'R06', type:'risk', name:'R06 供应商交付', score:74, freq:9, trend:'up'},
  {id:'R11', type:'risk', name:'R11 贸易合规', score:88, freq:3, trend:'up'},
  {id:'R02', type:'risk', name:'R02 NPI/ECN变更', score:81, freq:4, trend:'up'},
  // 事件节点
  {id:'E-0842', type:'event', name:'单源TTS<3天', level:'P1', loss:480},
  {id:'E-0850', type:'event', name:'EOL呆滞¥520万', level:'P1', loss:520},
  {id:'E-0848', type:'event', name:'成品呆滞¥360万', level:'P2', loss:360},
  // 案例节点
  {id:'KC-R-0142', type:'case', name:'NAND断供处置', score:'B+', quality:85},
  {id:'KC-R-0141', type:'case', name:'EOL呆滞消化', score:'A-', quality:88},
  // 供应商节点
  {id:'SUP-001', type:'supplier', name:'联发科', grade:'B+', resilience:79},
  {id:'SUP-002', type:'supplier', name:'ADI', grade:'B+', resilience:82},
  // 物料节点
  {id:'MAT-NAND', type:'material', name:'NAND Flash', singleSource:true},
  {id:'MAT-MEMS', type:'material', name:'MEMS麦克风', singleSource:true},
  // 项目节点
  {id:'AW01', type:'project', name:'AW01 AR眼镜', bg:'CEP'},
  {id:'AU01', type:'project', name:'AU01 EOL项目', bg:'CEP'},
  // 根因节点
  {id:'RC-001', type:'rootcause', name:'双源认证未覆盖', freq:11, status:'未改进'},
  {id:'RC-002', type:'rootcause', name:'Tier2信息不透明', freq:9, status:'未改进'},
  {id:'RC-003', type:'rootcause', name:'NPI资源争用无仲裁', freq:7, status:'进行中'},
  {id:'RC-004', type:'rootcause', name:'紧急采购授权链长', freq:6, status:'进行中'},
  {id:'RC-005', type:'rootcause', name:'EOL启动未冻结采购', freq:5, status:'已解决'},
];

var GRAPH_EDGES = [
  {from:'R08', to:'E-0842', rel:'触发'},
  {from:'R04', to:'E-0850', rel:'触发'},
  {from:'R04', to:'E-0848', rel:'触发'},
  {from:'E-0842', to:'KC-R-0142', rel:'产出'},
  {from:'E-0850', to:'KC-R-0141', rel:'产出'},
  {from:'E-0848', to:'KC-R-0141', rel:'产出'},
  {from:'E-0842', to:'AW01', rel:'影响'},
  {from:'E-0850', to:'AU01', rel:'影响'},
  {from:'R08', to:'SUP-001', rel:'关联'},
  {from:'R08', to:'MAT-NAND', rel:'影响'},
  {from:'SUP-001', to:'MAT-NAND', rel:'供应'},
  {from:'MAT-NAND', to:'AW01', rel:'属于BOM'},
  {from:'KC-R-0142', to:'RC-001', rel:'发现'},
  {from:'KC-R-0142', to:'RC-004', rel:'发现'},
  {from:'KC-R-0141', to:'RC-005', rel:'发现'},
  {from:'R08', to:'RC-001', rel:'根因'},
  {from:'R04', to:'RC-005', rel:'根因'},
  {from:'R06', to:'RC-003', rel:'根因'},
];

// ═══════════════ 状态 ═══════════════
var currentTab = 'cases';
var selectedCase = null;
var selectedSupplier = null;

var TABS = [
  {id:'cases', name:'风险案例库', icon:'fa-folder-open'},
  {id:'suppliers', name:'供应商知识库', icon:'fa-building'},
  {id:'plan', name:'计划交付库', icon:'fa-chart-line'},
  {id:'sop', name:'SOP流程库', icon:'fa-list-check'},
  {id:'graph', name:'知识图谱', icon:'fa-network-wired'},
];

function initPage_knowledge(){
  var container = document.getElementById('page-knowledge');
  if(!container) return;
  container.innerHTML =
    '<div class="filter-bar">'
      +'<span style="font-size:12px;color:var(--text-sec)">将个人经验沉淀为组织智慧 · 让控制塔越用越聪明</span>'
    +'</div>'
    // 概览KPI
    +'<div class="kb-overview">'
      +'<div class="kb-ov-card"><div class="kb-ov-icon" style="background:var(--danger-bg);color:var(--danger)"><i class="fas fa-folder-open"></i></div><div><div class="kb-ov-num">'+CASES.length+'</div><div class="kb-ov-label">风险案例</div></div></div>'
      +'<div class="kb-ov-card"><div class="kb-ov-icon" style="background:var(--primary-bg);color:var(--primary)"><i class="fas fa-building"></i></div><div><div class="kb-ov-num">'+SUPPLIERS.length+'</div><div class="kb-ov-label">供应商画像</div></div></div>'
      +'<div class="kb-ov-card"><div class="kb-ov-icon" style="background:var(--info-bg);color:var(--info)"><i class="fas fa-chart-line"></i></div><div><div class="kb-ov-num">'+PLAN_KNOWLEDGE.length+'</div><div class="kb-ov-label">计划交付知识</div></div></div>'
      +'<div class="kb-ov-card"><div class="kb-ov-icon" style="background:var(--success-bg);color:var(--success)"><i class="fas fa-list-check"></i></div><div><div class="kb-ov-num">'+SOPS.length+'</div><div class="kb-ov-label">SOP流程</div></div></div>'
      +'<div class="kb-ov-card"><div class="kb-ov-icon" style="background:#f2f1fb;color:#8250df"><i class="fas fa-network-wired"></i></div><div><div class="kb-ov-num">'+GRAPH_NODES.length+'</div><div class="kb-ov-label">图谱节点</div></div></div>'
    +'</div>'
    // Tab栏
    +'<div class="kb-tabs">'+TABS.map(function(t){
      return '<div class="kb-tab '+(currentTab===t.id?'active':'')+'" onclick="window._kbTab(\''+t.id+'\')"><i class="fas '+t.icon+'"></i> '+t.name+'</div>';
    }).join('')+'</div>'
    // 内容区
    +'<div id="kbContent"></div>';

  renderContent();
}

function renderContent(){
  var el = document.getElementById('kbContent');
  if(!el) return;
  if(currentTab==='cases') el.innerHTML = renderCases();
  else if(currentTab==='suppliers') el.innerHTML = renderSuppliers();
  else if(currentTab==='plan') el.innerHTML = renderPlan();
  else if(currentTab==='sop') el.innerHTML = renderSop();
  else el.innerHTML = renderGraph();
}

// ── 板块1：风险案例库 ──
function renderCases(){
  if(selectedCase) return renderCaseDetail(selectedCase);
  return '<div class="kb-section-title">风险案例库 · 结构化沉淀历史事件（来源：5.3闭环复盘自动流转）</div>'
    +'<table class="data-table kb-table"><thead><tr><th>案例ID</th><th>标题</th><th>风险类型</th><th>影响项目</th><th>处置时长</th><th>成本</th><th>评分</th><th>复发</th><th>操作</th></tr></thead><tbody>'
    + CASES.map(function(c){
      return '<tr onclick="window._kbCase(\''+c.id+'\')" style="cursor:pointer">'
        +'<td style="font-weight:600;color:var(--primary)">'+c.id+'</td>'
        +'<td>'+c.title+'</td>'
        +'<td>'+c.riskType+'</td>'
        +'<td>'+c.projects.join('/')+'</td>'
        +'<td>'+c.duration+'</td>'
        +'<td>'+c.cost+'</td>'
        +'<td><span class="cl-pill" style="background:'+(c.score.startsWith('A')?'var(--success-bg)':c.score.startsWith('B')?'var(--warning-bg)':'var(--danger-bg)')+';color:'+(c.score.startsWith('A')?'var(--success)':c.score.startsWith('B')?'var(--warning)':'var(--danger)')+'">'+c.score+'</span></td>'
        +'<td>'+(c.recur==='高'?'<span style="color:var(--danger)">高</span>':c.recur==='中'?'<span style="color:var(--warning)">中</span>':'<span style="color:var(--success)">低</span>')+'</td>'
        +'<td><button class="cl-btn-sm">查看</button></td>'
        +'</tr>';
    }).join('')
    +'</tbody></table>';
}

function renderCaseDetail(c){
  return '<div style="margin-bottom:12px"><button class="cl-btn" onclick="window._kbCase(null)">← 返回案例列表</button></div>'
    +'<div class="chart-card"><div class="card-header"><h3>'+c.id+' · '+c.title+'</h3><span class="cl-pill" style="background:var(--primary-bg);color:var(--primary)">'+c.score+'</span></div><div class="card-body">'
    +'<div class="kb-detail-section"><div class="kb-detail-title">基础信息</div>'
    +'<div class="kb-info-grid">'
    +'<div><label>风险类型</label><span>'+c.riskType+'</span></div>'
    +'<div><label>影响项目</label><span>'+c.projects.join(' / ')+'</span></div>'
    +'<div><label>影响BG</label><span>'+c.bg+'</span></div>'
    +'<div><label>处置时长</label><span>'+c.duration+'</span></div>'
    +'<div><label>处置成本</label><span>'+c.cost+'</span></div>'
    +'<div><label>综合评分</label><span>'+c.score+'</span></div>'
    +'<div><label>复发可能</label><span>'+c.recur+'</span></div>'
    +'</div></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">事件经过（时间轴）</div><div style="font-size:12px;color:var(--text-sec);line-height:1.8">'+c.timeline+'</div></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">根因分析</div><div style="font-size:12px;color:var(--text-sec);line-height:1.6;background:var(--warning-bg);border:1px solid var(--warning);border-radius:8px;padding:12px">'+c.rootCause+'</div></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">处置方案</div><div style="font-size:12px;color:var(--text-sec)">'+c.solution+'</div></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">💡 经验要点</div><ul style="font-size:12px;color:var(--text-sec);padding-left:20px">'+c.lessons.map(function(l){return '<li style="margin-bottom:4px">'+l+'</li>';}).join('')+'</ul></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">改进动作追踪</div>'
    +'<table class="data-table"><thead><tr><th>改进动作</th><th>责任人</th><th>期限</th><th>状态</th></tr></thead><tbody>'
    +c.improvements.map(function(i){return '<tr><td>'+i.a+'</td><td>'+i.owner+'</td><td>'+i.due+'</td><td>'+(i.status==='已完成'?'<span style="color:var(--success)">✅ '+i.status+'</span>':i.status==='进行中'?'<span style="color:var(--warning)">⏳ '+i.status+'</span>':'<span style="color:var(--text-muted)">⬜ '+i.status+'</span>')+'</td></tr>';}).join('')
    +'</tbody></table></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">关联知识</div>'
    +'<div style="font-size:12px;color:var(--text-sec);display:flex;gap:16px;flex-wrap:wrap">'
    +'<div>相似案例：'+c.related.cases.map(function(x){return '<a style="color:var(--primary);cursor:pointer" onclick="window._kbCase(\''+x+'\')">'+x+'</a>';}).join('、')+'</div>'
    +'<div>关联风险：'+c.related.risks.join('、')+'</div>'
    +'<div>关联SOP：'+c.related.sop+'</div>'
    +'<div>关联供应商：'+c.related.supplier+'</div>'
    +'</div></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">标签</div><div>'+c.tags.map(function(t){return '<span class="kb-tag">#'+t+'</span>';}).join('')+'</div></div>'
    +'</div></div>';
}

// ── 板块2：供应商知识库 ──
function renderSuppliers(){
  if(selectedSupplier) return renderSupplierDetail(selectedSupplier);
  return '<div class="kb-section-title">供应商知识库 · 档案+画像+风险信号（战略供应商TOP20）</div>'
    +'<table class="data-table kb-table"><thead><tr><th>供应商</th><th>等级</th><th>主供物料</th><th>OTIF</th><th>质量合格率</th><th>响应率</th><th>单源料号</th><th>关联事件</th><th>韧性评分</th><th>评级</th><th>操作</th></tr></thead><tbody>'
    + SUPPLIERS.map(function(s){
      return '<tr onclick="window._kbSup(\''+s.id+'\')" style="cursor:pointer">'
        +'<td style="font-weight:600">'+s.name+'</td>'
        +'<td><span class="cl-pill" style="background:'+(s.tier==='战略级'?'var(--primary-bg)':'var(--info-bg)')+';color:'+(s.tier==='战略级'?'var(--primary)':'var(--info)')+'">'+s.tier+'</span></td>'
        +'<td>'+s.materials+'</td>'
        +'<td>'+(s.otf>=92?'<span style="color:var(--success)">'+s.otf+'%</span>':'<span style="color:var(--danger)">'+s.otf+'%</span>')+'</td>'
        +'<td>'+s.quality+'%</td>'
        +'<td>'+s.response+'%</td>'
        +'<td>'+(s.singleSource>0?'<span style="color:var(--danger);font-weight:700">'+s.singleSource+'</span>':'0')+'</td>'
        +'<td>'+s.events+'</td>'
        +'<td><span style="font-weight:700;color:'+(s.resilience>=80?'var(--success)':s.resilience>=65?'var(--warning)':'var(--danger)')+'">'+s.resilience+'</span></td>'
        +'<td>'+s.grade+'</td>'
        +'<td><button class="cl-btn-sm">画像</button></td>'
        +'</tr>';
    }).join('')
    +'</tbody></table>';
}

function renderSupplierDetail(s){
  return '<div style="margin-bottom:12px"><button class="cl-btn" onclick="window._kbSup(null)">← 返回供应商列表</button></div>'
    +'<div class="chart-card"><div class="card-header"><h3>'+s.name+' · 供应商画像</h3><span class="cl-pill" style="background:'+(s.resilience>=80?'var(--success-bg)':'var(--warning-bg)')+';color:'+(s.resilience>=80?'var(--success)':'var(--warning)')+'">'+s.grade+' ('+s.resilience+')</span></div><div class="card-body">'
    +'<div class="kb-detail-section"><div class="kb-detail-title">基础档案</div>'
    +'<div class="kb-info-grid">'
    +'<div><label>战略等级</label><span>'+s.tier+'</span></div>'
    +'<div><label>主供物料</label><span>'+s.materials+'</span></div>'
    +'<div><label>付款条件</label><span>'+s.payment+'</span></div>'
    +'<div><label>认证状态</label><span>'+s.certs.join('、')+'</span></div>'
    +'</div></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">交付表现（滚动12个月）</div>'
    +'<div class="kb-metrics-row">'
    +'<div class="kb-metric-card"><div class="kb-metric-val" style="color:'+(s.otf>=92?'var(--success)':'var(--danger)')+'">'+s.otf+'%</div><div class="kb-metric-lbl">OTIF准时率</div><div style="font-size:10px;color:var(--text-muted)">行业均值92%</div></div>'
    +'<div class="kb-metric-card"><div class="kb-metric-val" style="color:var(--success)">'+s.quality+'%</div><div class="kb-metric-lbl">质量合格率</div><div style="font-size:10px;color:var(--text-muted)">行业均值98%</div></div>'
    +'<div class="kb-metric-card"><div class="kb-metric-val">'+s.response+'%</div><div class="kb-metric-lbl">响应及时率</div><div style="font-size:10px;color:var(--text-muted)">行业均值85%</div></div>'
    +'<div class="kb-metric-card"><div class="kb-metric-val">'+s.price+'</div><div class="kb-metric-lbl">价格稳定性</div></div>'
    +'</div></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">⚠️ 风险信号记录</div><ul style="font-size:12px;color:var(--text-sec);padding-left:20px">'+s.risks.map(function(r){return '<li style="margin-bottom:4px">'+r+'</li>';}).join('')+'</ul></div>'
    +'<div class="kb-detail-section"><div class="kb-detail-title">关联知识</div>'
    +'<div style="font-size:12px;color:var(--text-sec)">关联案例：'+(s.relatedCases.length?s.relatedCases.join('、'):'无')+' | 关联SOP：'+s.relatedSop+'</div></div>'
    +'</div></div>';
}

// ── 板块3：计划交付库 ──
function renderPlan(){
  return '<div class="kb-section-title">计划交付知识库 · 需求预测规律 + 交期承诺经验 + 齐套管理最佳实践</div>'
    +'<div class="kb-plan-grid">'+PLAN_KNOWLEDGE.map(function(p){
      var typeColor = p.type==='需求预测规律'?'var(--primary)':p.type==='交期承诺经验'?'var(--info)':'var(--success)';
      return '<div class="kb-plan-card">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        +'<span class="cl-pill" style="background:'+typeColor+'20;color:'+typeColor+'">'+p.type+'</span>'
        +'<span style="font-size:10px;color:var(--text-muted)">'+p.id+'</span></div>'
        +'<div style="font-weight:700;font-size:13px;margin-bottom:8px">'+p.title+'</div>'
        +'<div style="font-size:11px;color:var(--text-sec);margin-bottom:6px;line-height:1.5">'+p.desc+'</div>'
        +'<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px"><b>根因：</b>'+p.rootCause+'</div>'
        +'<div style="font-size:11px;color:var(--primary);margin-bottom:8px"><b>建议：</b>'+p.advice+'</div>'
        +'<div style="display:flex;justify-content:space-between;align-items:center">'
        +'<span style="font-size:10px;color:'+(p.verified.startsWith('已')?'var(--success)':'var(--warning)')+'">'+p.verified+'</span>'
        +'<div>'+p.tags.map(function(t){return '<span class="kb-tag">#'+t+'</span>';}).join('')+'</div></div>'
        +'</div>';
    }).join('')+'</div>';
}

// ── 板块4：SOP流程库 ──
function renderSop(){
  return '<div class="kb-section-title">SOP流程库 · 风险处置标准操作流程（与13类风险对应）</div>'
    +'<table class="data-table kb-table"><thead><tr><th>SOP编号</th><th>名称</th><th>触发场景</th><th>责任人</th><th>处置时限</th><th>处置步骤</th><th>有效率</th><th>执行次数</th><th>最近更新</th></tr></thead><tbody>'
    + SOPS.map(function(s){
      return '<tr>'
        +'<td style="font-weight:600;color:var(--primary)">'+s.id+'</td>'
        +'<td>'+s.name+'</td>'
        +'<td style="font-size:11px">'+s.trigger+'</td>'
        +'<td>'+s.owner+'</td>'
        +'<td>'+s.sla+'</td>'
        +'<td style="font-size:11px;color:var(--text-sec)">'+s.steps+'</td>'
        +'<td><span style="font-weight:700;color:'+(s.effective>=80?'var(--success)':s.effective>=70?'var(--warning)':'var(--danger)')+'">'+s.effective+'%</span></td>'
        +'<td>'+s.uses+'</td>'
        +'<td>'+s.lastUpdate+'</td>'
        +'</tr>';
    }).join('')
    +'</tbody></table>';
}

// ── 板块5：知识图谱 ──
function renderGraph(){
  // 节点类型颜色
  var typeColor = {risk:'#dc2626',event:'#f97316',case:'#eab308',supplier:'#3b82f6',material:'#16a34a',project:'#8b5cf6',rootcause:'#64748b'};
  var typeIcon = {risk:'🔴',event:'🟠',case:'🟡',supplier:'🔵',material:'🟢',project:'🟣',rootcause:'⚪'};
  var typeName = {risk:'风险',event:'事件',case:'案例',supplier:'供应商',material:'物料',project:'项目',rootcause:'根因'};

  // 根因聚类TOP5
  var rootCauses = GRAPH_NODES.filter(function(n){return n.type==='rootcause';}).sort(function(a,b){return b.freq-a.freq;});
  var rcStatusColor = {'未改进':'var(--danger)','进行中':'var(--warning)','已解决':'var(--success)'};

  return '<div class="kb-section-title">知识图谱 · 7类实体节点 · 关联推理引擎 · 越用越聪明</div>'
    // 图谱可视化（简化版：关系列表）
    +'<div style="display:grid;grid-template-columns:1fr 320px;gap:14px">'
    +'<div class="chart-card"><div class="card-header"><h3><i class="fas fa-network-wired"></i> 知识图谱关联视图</h3></div><div class="card-body" style="max-height:500px;overflow:auto">'
    +'<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">点击节点查看关联，当前展示'+GRAPH_NODES.length+'个节点 / '+GRAPH_EDGES.length+'条关系</div>'
    + GRAPH_EDGES.map(function(e){
      var fromNode = GRAPH_NODES.find(function(n){return n.id===e.from;});
      var toNode = GRAPH_NODES.find(function(n){return n.id===e.to;});
      if(!fromNode||!toNode) return '';
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid var(--border-light);font-size:11px">'
        +'<span class="kb-graph-node" style="background:'+typeColor[fromNode.type]+'20;color:'+typeColor[fromNode.type]+'">'+typeIcon[fromNode.type]+' '+fromNode.name+'</span>'
        +'<span style="color:var(--text-muted);font-size:10px;white-space:nowrap">─['+e.rel+']→</span>'
        +'<span class="kb-graph-node" style="background:'+typeColor[toNode.type]+'20;color:'+typeColor[toNode.type]+'">'+typeIcon[toNode.type]+' '+toNode.name+'</span>'
        +'</div>';
    }).join('')
    +'</div></div>'
    // 右侧分析面板
    +'<div style="display:flex;flex-direction:column;gap:12px">'
    // 根因聚类
    +'<div class="chart-card"><div class="card-header"><h3><i class="fas fa-layer-group"></i> 根因聚类 TOP5</h3></div><div class="card-body">'
    + rootCauses.map(function(rc,i){
      return '<div style="margin-bottom:10px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
        +'<span style="font-size:11px;font-weight:600">'+(i+1)+'. '+rc.name+'</span>'
        +'<span style="font-size:10px;padding:1px 6px;border-radius:99px;background:'+rcStatusColor[rc.status]+'20;color:'+rcStatusColor[rc.status]+'">'+rc.status+'</span>'
        +'</div>'
        +'<div style="display:flex;align-items:center;gap:8px">'
        +'<div style="flex:1;height:6px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+(rc.freq*8)+'%;background:'+rcStatusColor[rc.status]+';border-radius:3px"></div></div>'
        +'<span style="font-size:10px;color:var(--text-muted);min-width:30px">'+rc.freq+'次</span>'
        +'</div></div>';
    }).join('')
    +'</div></div>'
    // 图谱健康度
    +'<div class="chart-card"><div class="card-header"><h3><i class="fas fa-heart-pulse"></i> 图谱健康度</h3></div><div class="card-body">'
    +'<div style="text-align:center;margin-bottom:12px"><div style="font-size:32px;font-weight:800;color:var(--warning)">73<span style="font-size:14px;color:var(--text-muted)">/100</span></div><div style="font-size:11px;color:var(--text-muted)">较上月78分↓</div></div>'
    +'<div style="font-size:11px;color:var(--text-sec);line-height:1.8">'
    +'<div>✅ 项目覆盖率：100%</div>'
    +'<div>✅ 案例覆盖率：100%（P1事件全沉淀）</div>'
    +'<div>⚠️ 物料覆盖率：72%（目标≥80%）</div>'
    +'<div>✅ SOP覆盖率：100%（13类风险覆盖）</div>'
    +'<div>⚠️ 案例录入时效：5.2天（目标≤5天）</div>'
    +'</div></div></div>'
    // 节点类型统计
    +'<div class="chart-card"><div class="card-header"><h3><i class="fas fa-circle-nodes"></i> 节点统计</h3></div><div class="card-body">'
    + Object.keys(typeName).map(function(t){
      var cnt = GRAPH_NODES.filter(function(n){return n.type===t;}).length;
      return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);font-size:11px"><span>'+typeIcon[t]+' '+typeName[t]+'</span><span style="font-weight:700">'+cnt+'</span></div>';
    }).join('')
    +'</div></div>'
    +'</div>'
    +'</div>';
}

// ═══════════════ 交互 ═══════════════
window._kbTab = function(tab){ currentTab=tab; selectedCase=null; selectedSupplier=null; renderContent(); };
window._kbCase = function(id){ selectedCase = id?CASES.find(function(c){return c.id===id;}):null; renderContent(); };
window._kbSup = function(id){ selectedSupplier = id?SUPPLIERS.find(function(s){return s.id===id;}):null; renderContent(); };

window.initPage_knowledge = initPage_knowledge;

})();
registerModule('knowledge', window.initPage_knowledge);
