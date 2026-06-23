// ===== 绩效对比 v2 — 多项目供应链指标对比分析 =====
// 按《Project Comparison Dashboard》规范实现
// 原生JS + Chart.js 4.4，IIFE模块
(function(){
"use strict";

/* ═══ 1. 指标配置（6大类20指标+综合健康分）═══ */
var METRICS=[
  // 交付类
  {id:'D1',name:'OTIF率',cat:'delivery',unit:'%',target:95,warn:90,crit:85,higher:true,desc:'按时足量交付比例'},
  {id:'D2',name:'客户交付准时率',cat:'delivery',unit:'%',target:98,warn:93,crit:88,higher:true,desc:'实际交货日≤承诺交货日'},
  {id:'D3',name:'平均交付延期天数',cat:'delivery',unit:'天',target:2,warn:5,crit:10,higher:false,desc:'延期订单平均延期天数'},
  {id:'D4',name:'SOP达成偏差',cat:'delivery',unit:'天',target:0,warn:7,crit:14,higher:false,desc:'NPI专属·实际vs计划SOP偏差',npiOnly:true},
  // 供应类
  {id:'S1',name:'BOM齐套率',cat:'supply',unit:'%',target:97,warn:93,crit:88,higher:true,desc:'BOM物料齐套比例'},
  {id:'S2',name:'供应商OTIF',cat:'supply',unit:'%',target:95,warn:90,crit:85,higher:true,desc:'供应商按时足量交货'},
  {id:'S3',name:'关键物料缺料天数',cat:'supply',unit:'天',target:0,warn:1,crit:3,higher:false,desc:'缺料导致停线天数'},
  {id:'S4',name:'供应商集中度风险',cat:'supply',unit:'%',target:20,warn:30,crit:45,higher:false,desc:'单一来源物料占比'},
  // 库存类
  {id:'I1',name:'关键物料库存覆盖天数',cat:'inventory',unit:'天',target:15,warn:8,crit:5,higher:true,desc:'库存/日需求·取最小值'},
  {id:'I2',name:'呆滞库存占比',cat:'inventory',unit:'%',target:3,warn:5,crit:10,higher:false,desc:'180天未动库存金额占比'},
  {id:'I3',name:'库存周转率',cat:'inventory',unit:'次/年',target:12,warn:8,crit:6,higher:true,desc:'年化库存周转次数'},
  // 质量类
  {id:'Q1',name:'来料合格率',cat:'quality',unit:'%',target:99,warn:97,crit:95,higher:true,desc:'IQC一次通过率'},
  {id:'Q2',name:'试产良率',cat:'quality',unit:'%',target:85,warn:75,crit:65,higher:true,desc:'NPI专属·试产直通率',npiOnly:true},
  {id:'Q3',name:'量产DPPM',cat:'quality',unit:'PPM',target:50,warn:100,crit:300,higher:false,desc:'客诉每百万件缺陷数'},
  // 计划类
  {id:'P1',name:'需求预测准确率',cat:'planning',unit:'%',target:85,warn:75,crit:65,higher:true,desc:'1-|预测-实际|/实际'},
  {id:'P2',name:'排产计划达成率',cat:'planning',unit:'%',target:95,warn:90,crit:85,higher:true,desc:'实际产出/计划产出'},
  {id:'P3',name:'产能利用率',cat:'planning',unit:'%',target:82,warn:60,crit:95,higher:true,desc:'75-90%最佳·双向预警',bidir:true},
  // 响应类
  {id:'R1',name:'异常平均响应时长',cat:'responsiveness',unit:'小时',target:2,warn:4,crit:12,higher:false,desc:'P1异常首次响应时长'},
  {id:'R2',name:'供应链变更响应周期',cat:'responsiveness',unit:'天',target:5,warn:7,crit:14,higher:false,desc:'需求变更到调整完成'},
  // 综合
  {id:'H0',name:'项目供应链健康综合评分',cat:'overall',unit:'分',target:80,warn:65,crit:50,higher:true,desc:'六维加权综合评分',alwaysVisible:true}
];
var METRIC_MAP={};METRICS.forEach(function(m){METRIC_MAP[m.id]=m;});
var CAT_LABELS={delivery:'交付类',supply:'供应类',inventory:'库存类',quality:'质量类',planning:'计划类',responsiveness:'响应类',overall:'综合'};
var CAT_COLORS={delivery:'#2563eb',supply:'#0b9e6e',inventory:'#d97706',quality:'#dc2626',planning:'#8b5cf6',responsiveness:'#0891b2',overall:'#1e293b'};

/* ═══ 2. Mock项目数据（12个项目·3BG·6BU·6客户）═══ */
var MOCK_PROJECTS=[
  {id:'P001',name:'AirPods Pro 3代声学模组',bg:'智能声学BG',bu:'消费声学BU',customer:'Apple',phase:'MP',healthScore:94,sopDate:'2025-09-01'},
  {id:'P002',name:'AirPods Max 2代耳机',bg:'智能声学BG',bu:'消费声学BU',customer:'Apple',phase:'RAMP_UP',healthScore:78,sopDate:'2026-03-15'},
  {id:'P003',name:'QuietComfort Ultra耳机',bg:'智能声学BG',bu:'消费声学BU',customer:'Bose',phase:'MP',healthScore:88,sopDate:'2025-06-01'},
  {id:'P004',name:'WH-1000XM6头戴耳机',bg:'智能声学BG',bu:'专业声学BU',customer:'Sony',phase:'NPI',healthScore:72,sopDate:'2026-09-01'},
  {id:'P005',name:'LinkBuds S 2代',bg:'智能声学BG',bu:'专业声学BU',customer:'Sony',phase:'RAMP_UP',healthScore:85,sopDate:'2026-04-01'},
  {id:'P006',name:'Quest 4光学模组',bg:'智能硬件BG',bu:'XR设备BU',customer:'Meta',phase:'MP',healthScore:91,sopDate:'2025-10-01'},
  {id:'P007',name:'Ray-Ban Smart Glasses 3代',bg:'智能硬件BG',bu:'XR设备BU',customer:'Meta',phase:'NPI',healthScore:65,sopDate:'2026-11-01'},
  {id:'P008',name:'Pico 5 VR整机',bg:'智能硬件BG',bu:'XR设备BU',customer:'字节跳动',phase:'RAMP_UP',healthScore:70,sopDate:'2026-05-01'},
  {id:'P009',name:'Watch Series 11传感器模组',bg:'智能硬件BG',bu:'智能穿戴BU',customer:'Apple',phase:'MP',healthScore:96,sopDate:'2025-08-01'},
  {id:'P010',name:'Band 9智能手环',bg:'智能硬件BG',bu:'智能穿戴BU',customer:'华为',phase:'ECO',healthScore:82,sopDate:'2024-06-01'},
  {id:'P011',name:'iPhone 17精密结构件',bg:'精密零组件BG',bu:'精密结构件BU',customer:'Apple',phase:'RAMP_UP',healthScore:88,sopDate:'2026-06-01'},
  {id:'P012',name:'Galaxy S26铰链组件',bg:'精密零组件BG',bu:'精密结构件BU',customer:'Samsung',phase:'MP',healthScore:90,sopDate:'2025-12-01'}
];
var PHASE_LABELS={MP:'量产MP',RAMP_UP:'爬坡',NPI:'NPI',ECO:'ECO',EOL:'EOL'};
var PHASE_COLORS={MP:'#16a34a',RAMP_UP:'#d97706',NPI:'#2563eb',ECO:'#64748b',EOL:'#dc2626'};

/* ═══ 3. 颜色板 & 归一化 ═══ */
var COLOR_PALETTE=['#4A9EFF','#FF6B35','#00D68F','#FFD700','#B44FFF','#FF3B3B','#00CED1','#FF69B4'];
var MONTHS=['2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
var MONTH_LABELS=['25-07','25-08','25-09','25-10','25-11','25-12','26-01','26-02','26-03','26-04','26-05','26-06'];

function hashStr(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h)+s.charCodeAt(i);return h>>>0;}
function rng(seed){var s=seed;return function(){s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};}

// 归一化到0-100分
function normalizeMetric(metricId,value){
  var m=METRIC_MAP[metricId];if(!m)return 50;
  if(m.bidir){
    // 产能利用率：75-90最佳
    var optimalLow=75,optimalHigh=90;
    if(value>=optimalLow&&value<=optimalHigh)return 100;
    var dist=value<optimalLow?(optimalLow-value):(value-optimalHigh);
    return Math.max(0,100-dist*3);
  }
  if(m.higher){
    return Math.min(100,(value/m.target)*100);
  }else{
    // 越低越好：0→100分，target→80分，warn→60分，crit→30分
    if(value<=m.target)return 100;
    if(value<=m.warn)return 80-(value-m.target)/(m.warn-m.target)*20;
    if(value<=m.crit)return 60-(value-m.warn)/(m.crit-m.warn)*30;
    return Math.max(0,30-(value-m.crit)/(m.crit*0.5)*30);
  }
}

function getStatus(metricId,value){
  var m=METRIC_MAP[metricId];if(!m)return 'normal';
  var score=normalizeMetric(metricId,value);
  if(score>=80)return 'normal';
  if(score>=50)return 'warning';
  return 'critical';
}

// 生成单个项目单个指标的12个月数据
function genMetricData(proj,metric){
  var seed=hashStr(proj.id+metric.id);
  var r=rng(seed);
  var base=metric.target;
  var healthFactor=proj.healthScore/100; // 0.65-0.96
  var isNPI=proj.phase==='NPI'||proj.phase==='RAMP_UP';
  
  // NPI专属指标非NPI项目返回null
  if(metric.npiOnly&&proj.phase!=='NPI'&&proj.phase!=='RAMP_UP')return null;
  
  // 基础值偏移：健康分越低偏离目标越大
  var offset=(1-healthFactor)*(metric.higher?-1:1)*(metric.target*0.15+r()*metric.target*0.1);
  var baseVal=base+offset;
  
  // NPI项目波动更大
  var volatility=isNPI?0.08:0.03;
  
  // 趋势：RAMP_UP项目近3月改善
  var trendFactor=0;
  if(proj.phase==='RAMP_UP')trendFactor=0.5; // 改善趋势
  if(proj.phase==='NPI')trendFactor=-0.3; // NPI早期略恶化
  
  // 特殊场景注入
  var scenarioAdjust=0;
  if(proj.id==='P003'&&metric.id==='Q3')scenarioAdjust=100; // Bose DPPM偏高
  if(proj.id==='P007'&&metric.id==='S1')scenarioAdjust=-12; // NPI齐套率低
  if(proj.id==='P008'&&(metric.id==='I1'||metric.id==='S2'))scenarioAdjust=-5; // 越南物流影响
  if(proj.id==='P002'&&metric.id==='D1')trendFactor=0.8; // 改善趋势明显
  
  var data=[];
  for(var i=0;i<12;i++){
    var trendI=trendFactor*(i-9)/3; // 近3月趋势
    var noise=(r()-0.5)*2*volatility*baseVal;
    var val=baseVal+trendI*baseVal*0.05+noise+scenarioAdjust*(1-i/12);
    // 确保百分比类指标在合理范围
    if(metric.unit==='%')val=Math.max(0,Math.min(100,val));
    if(metric.unit==='PPM')val=Math.max(10,val);
    if(metric.id==='D3'||metric.id==='S3'||metric.id==='R1'||metric.id==='R2')val=Math.max(0,val);
    val=Math.round(val*10)/10;
    var prev=i>0?data[i-1].value:val;
    var trend=val>prev?'up':val<prev?'down':'flat';
    data.push({period:MONTHS[i],value:val,status:getStatus(metric.id,val),trend:trend,trendValue:i>0?Math.round((val-prev)*10)/10:0});
  }
  return data;
}

// 缓存：项目×指标→月度数据
var _dataCache={};
function getMetricData(projId,metricId){
  var key=projId+'_'+metricId;
  if(_dataCache[key])return _dataCache[key];
  var proj=MOCK_PROJECTS.find(function(p){return p.id===projId;});
  var metric=METRIC_MAP[metricId];
  if(!proj||!metric)return null;
  _dataCache[key]=genMetricData(proj,metric);
  return _dataCache[key];
}

// 获取项目综合健康分
function getHealthScore(projId){
  var proj=MOCK_PROJECTS.find(function(p){return p.id===projId;});
  return proj?proj.healthScore:75;
}

/* ═══ 4. 状态 ═══ */
var st={
  selectedPids:[],       // 最多8个
  projectColors:{},      // pid→color
  colorPool:[],          // 已用颜色索引
  selectedMetricIds:[],  // 最多10个（H0不计入）
  viewMode:'trend',      // trend|fullMatrix|dimension|heatmap
  timeRange:'6m',        // 4w|3m|6m|1y
  granularity:'month',   // week|month|quarter
  dimCut:'customer',     // customer|bg|bu|phase
  showTarget:true,
  showBest:false,
  expandedMetric:null,
  charts:{},             // Chart.js实例缓存
  searchKeyword:'',
  filters:{customer:[],bg:[],phase:[],health:[]}
};

var PRESETS={
  'deliveryHealth':['D1','D2','D3','S1','S2'],
  'npiSpecial':['D4','S1','Q2','P2','P3'],
  'supplyRisk':['S2','S3','S4','I1','R1','R2'],
  'qualityFocus':['Q1','Q2','Q3','I2','S2'],
  'all20':METRICS.filter(function(m){return m.id!=='H0';}).map(function(m){return m.id;})
};

/* ═══ 5. 初始化 ═══ */
function initPage_benchmark(container){
  container=container||document.getElementById('page-benchmark');
  if(!container)return;
  
  // 默认选中前3个项目
  st.selectedPids=['P001','P006','P009'];
  assignColors();
  // 默认选中交付健康套餐
  st.selectedMetricIds=PRESETS.deliveryHealth.slice();
  
  renderLayout(container);
  bindEvents(container);
  renderAll(container);
}

function assignColors(){
  st.projectColors={};
  st.colorPool=[];
  st.selectedPids.forEach(function(pid,i){
    var ci=i%COLOR_PALETTE.length;
    st.projectColors[pid]=COLOR_PALETTE[ci];
    st.colorPool.push(ci);
  });
}

/* ═══ 6. 布局渲染 ═══ */
function renderLayout(container){
  container.innerHTML=
    '<div style="display:flex;flex-direction:column;height:calc(100vh - 100px);">'
    // 顶部控制栏
    +'<div class="bm-topbar">'
    +'<div class="bm-view-tabs">'
    +'<button class="bm-vtab active" data-view="trend">指标趋势对比</button>'
    +'<button class="bm-vtab" data-view="fullMatrix">项目全量对比</button>'
    +'<button class="bm-vtab" data-view="dimension">维度切片分析</button>'
    +'<button class="bm-vtab" data-view="heatmap">综合热力矩阵</button>'
    +'</div>'
    +'<div class="bm-top-right">'
    +'<select class="bm-sel" id="bm-timeRange"><option value="4w">近4周</option><option value="3m">近3月</option><option value="6m" selected>近6月</option><option value="1y">近1年</option></select>'
    +'<label class="bm-chk"><input type="checkbox" id="bm-showTarget" checked> 目标线</label>'
    +'<label class="bm-chk"><input type="checkbox" id="bm-showBest"> 历史最优</label>'
    +'</div>'
    +'</div>'
    // 三栏
    +'<div class="bm-three-col">'
    // 左侧项目选择器
    +'<div class="bm-left-panel">'
    +'<div class="bm-panel-head">项目选择器</div>'
    +'<div class="bm-search"><input type="text" id="bm-search" placeholder="搜索项目/客户/BG..." class="bm-input"></div>'
    +'<div class="bm-quick-filters" id="bm-quickFilters"></div>'
    +'<div class="bm-tree" id="bm-projectTree"></div>'
    +'<div class="bm-selected-bar" id="bm-selectedBar"></div>'
    +'</div>'
    // 中央图表区
    +'<div class="bm-center-panel" id="bm-centerPanel"></div>'
    // 右侧指标选择器
    +'<div class="bm-right-panel">'
    +'<div class="bm-panel-head">指标选择器</div>'
    +'<div class="bm-preset"><select id="bm-preset" class="bm-sel">'
    +'<option value="">— 预设方案 —</option>'
    +'<option value="deliveryHealth">交付健康套餐</option>'
    +'<option value="npiSpecial">NPI项目专属</option>'
    +'<option value="supplyRisk">供应风险套餐</option>'
    +'<option value="qualityFocus">质量专项套餐</option>'
    +'<option value="all20">全量20指标</option>'
    +'</select></div>'
    +'<div class="bm-metric-list" id="bm-metricList"></div>'
    +'</div>'
    +'</div>'
    +'</div>';
}

/* ═══ 7. 项目选择器 ═══ */
function renderQuickFilters(){
  var el=document.getElementById('bm-quickFilters');
  if(!el)return;
  var customers=[...new Set(MOCK_PROJECTS.map(function(p){return p.customer;}))];
  var bgs=[...new Set(MOCK_PROJECTS.map(function(p){return p.bg;}))];
  var html='<div class="bm-qf-group"><b>客户:</b>';
  customers.forEach(function(c){
    var active=st.filters.customer.indexOf(c)>=0?' active':'';
    html+='<span class="bm-qf-tag'+active+'" data-ft="customer" data-val="'+c+'">'+c+'</span>';
  });
  html+='</div><div class="bm-qf-group"><b>BG:</b>';
  bgs.forEach(function(c){
    var active=st.filters.bg.indexOf(c)>=0?' active':'';
    html+='<span class="bm-qf-tag'+active+'" data-ft="bg" data-val="'+c+'">'+c+'</span>';
  });
  html+='</div><div class="bm-qf-group"><b>阶段:</b>';
  Object.keys(PHASE_LABELS).forEach(function(c){
    var active=st.filters.phase.indexOf(c)>=0?' active':'';
    html+='<span class="bm-qf-tag'+active+'" data-ft="phase" data-val="'+c+'">'+PHASE_LABELS[c]+'</span>';
  });
  html+='</div>';
  el.innerHTML=html;
}

function renderProjectTree(){
  var el=document.getElementById('bm-projectTree');
  if(!el)return;
  var kw=st.searchKeyword.toLowerCase();
  var filtered=MOCK_PROJECTS.filter(function(p){
    if(kw){
      var text=(p.id+p.name+p.customer+p.bg+p.bu).toLowerCase();
      if(text.indexOf(kw)<0)return false;
    }
    if(st.filters.customer.length&&st.filters.customer.indexOf(p.customer)<0)return false;
    if(st.filters.bg.length&&st.filters.bg.indexOf(p.bg)<0)return false;
    if(st.filters.phase.length&&st.filters.phase.indexOf(p.phase)<0)return false;
    if(st.filters.health.length){
      var h=p.healthScore>=80?'normal':p.healthScore>=65?'warning':'critical';
      if(st.filters.health.indexOf(h)<0)return false;
    }
    return true;
  });
  
  // 按BG→BU分组
  var tree={};
  filtered.forEach(function(p){
    if(!tree[p.bg])tree[p.bg]={};
    if(!tree[p.bg][p.bu])tree[p.bg][p.bu]=[];
    tree[p.bg][p.bu].push(p);
  });
  
  var html='';
  Object.keys(tree).forEach(function(bg){
    html+='<div class="bm-tree-bg">'+bg+'</div>';
    Object.keys(tree[bg]).forEach(function(bu){
      html+='<div class="bm-tree-bu">└ '+bu+'</div>';
      tree[bg][bu].forEach(function(p){
        var checked=st.selectedPids.indexOf(p.id)>=0?'checked':'';
        var color=st.projectColors[p.id]||'#ccc';
        var hScore=p.healthScore;
        var hColor=hScore>=80?'#16a34a':hScore>=65?'#d97706':'#dc2626';
        var pColor=PHASE_COLORS[p.phase]||'#64748b';
        html+='<div class="bm-tree-proj">'
          +'<label><input type="checkbox" data-pid="'+p.id+'" '+checked+'>'
          +'<span class="bm-color-dot" style="background:'+color+'"></span>'
          +'<span class="bm-proj-name">'+p.name+'</span>'
          +'<span class="bm-phase-tag" style="background:'+pColor+'20;color:'+pColor+'">'+PHASE_LABELS[p.phase]+'</span>'
          +'<span class="bm-health-dot" style="background:'+hColor+'" title="健康分:'+hScore+'"></span>'
          +'</label></div>';
      });
    });
  });
  if(!html)html='<div style="padding:20px;text-align:center;color:var(--text-muted)">无匹配项目</div>';
  el.innerHTML=html;
}

function renderSelectedBar(){
  var el=document.getElementById('bm-selectedBar');
  if(!el)return;
  var html='<div class="bm-sb-title">已选 '+st.selectedPids.length+'/8 个项目</div>';
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    if(!p)return;
    var color=st.projectColors[pid]||'#ccc';
    html+='<div class="bm-sb-item" style="border-left:3px solid '+color+'">'
      +'<span style="color:'+color+';font-weight:700">●</span> '
      +'<span class="bm-sb-name">'+p.name+'</span>'
      +'<button class="bm-sb-x" data-pid="'+pid+'">✕</button></div>';
  });
  el.innerHTML=html;
}

function toggleProject(pid){
  var idx=st.selectedPids.indexOf(pid);
  if(idx>=0){
    st.selectedPids.splice(idx,1);
    delete st.projectColors[pid];
  }else{
    if(st.selectedPids.length>=8){
      alert('最多同时对比8个项目');
      return;
    }
    st.selectedPids.push(pid);
    // 分配颜色
    for(var i=0;i<COLOR_PALETTE.length;i++){
      if(st.colorPool.indexOf(i)<0){
        st.projectColors[pid]=COLOR_PALETTE[i];
        st.colorPool.push(i);
        break;
      }
    }
    if(!st.projectColors[pid]){
      st.projectColors[pid]=COLOR_PALETTE[st.selectedPids.length%8];
    }
  }
  renderProjectTree();
  renderSelectedBar();
  renderAll(document.getElementById('page-benchmark'));
}

/* ═══ 8. 指标选择器 ═══ */
function renderMetricList(){
  var el=document.getElementById('bm-metricList');
  if(!el)return;
  var cats=['delivery','supply','inventory','quality','planning','responsiveness'];
  var html='';
  // H0 置顶
  var h0=METRIC_MAP['H0'];
  html+='<div class="bm-ml-cat" style="border-color:var(--primary)">'
    +'<div class="bm-ml-cat-title" style="color:var(--primary)">综合（始终可见）</div>'
    +'<div class="bm-ml-item"><label><input type="checkbox" checked disabled> <b>H0</b> '+h0.name+' <span class="bm-ml-unit">('+h0.unit+')</span></label></div>'
    +'</div>';
  cats.forEach(function(cat){
    var metrics=METRICS.filter(function(m){return m.cat===cat;});
    if(!metrics.length)return;
    html+='<div class="bm-ml-cat">';
    html+='<div class="bm-ml-cat-title" style="color:'+CAT_COLORS[cat]+'">'+CAT_LABELS[cat]+'</div>';
    metrics.forEach(function(m){
      var checked=st.selectedMetricIds.indexOf(m.id)>=0?'checked':'';
      var npiNote=m.npiOnly?' <span class="bm-npi-note">(NPI)</span>':'';
      html+='<div class="bm-ml-item"><label><input type="checkbox" data-mid="'+m.id+'" '+checked+'> <b>'+m.id+'</b> '+m.name+npiNote+' <span class="bm-ml-unit">('+m.unit+')</span></label></div>';
    });
    html+='</div>';
  });
  html+='<div class="bm-ml-count">已选 '+st.selectedMetricIds.length+'/10 个指标</div>';
  el.innerHTML=html;
}

function toggleMetric(mid){
  var idx=st.selectedMetricIds.indexOf(mid);
  if(idx>=0){
    st.selectedMetricIds.splice(idx,1);
  }else{
    if(st.selectedMetricIds.length>=10){
      alert('趋势对比视图最多选择10个指标');
      return;
    }
    st.selectedMetricIds.push(mid);
  }
  renderMetricList();
  renderAll(document.getElementById('page-benchmark'));
}

/* ═══ 9. 视图渲染 ═══ */
function renderAll(container){
  disposeCharts();
  var center=container.querySelector('#bm-centerPanel');
  if(!center)return;
  if(!st.selectedPids.length){
    center.innerHTML='<div class="bm-empty">请在左侧选择至少一个项目进行对比</div>';
    return;
  }
  if(st.viewMode==='trend')renderTrendView(center);
  else if(st.viewMode==='fullMatrix')renderFullMatrixView(center);
  else if(st.viewMode==='dimension')renderDimensionView(center);
  else if(st.viewMode==='heatmap')renderHeatmapView(center);
}

function disposeCharts(){
  Object.keys(st.charts).forEach(function(k){
    if(st.charts[k]){st.charts[k].destroy();delete st.charts[k];}
  });
}

// 视图一：指标趋势对比
function renderTrendView(center){
  if(!st.selectedMetricIds.length){
    center.innerHTML='<div class="bm-empty">请在右侧选择至少一个指标</div>';
    return;
  }
  var range=getRangeMonths();
  // 摘要条
  var bestProj='',improveProj='',worsenProj='';
  var bestScore=-1,improveVal=-99,worsenVal=99;
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    if(p&&p.healthScore>bestScore){bestScore=p.healthScore;bestProj=p.name;}
    // 用D1近3月变化判断改善/恶化
    var d1=getMetricData(pid,'D1');
    if(d1&&d1.length>=4){
      var change=d1[d1.length-1].value-d1[d1.length-4].value;
      if(change>improveVal){improveVal=change;improveProj=p.name;}
      if(change<worsenVal){worsenVal=change;worsenProj=p.name;}
    }
  });
  
  var summary='<div class="bm-summary-bar">'
    +'<span>'+st.selectedPids.length+'个项目对比 | '+st.selectedMetricIds.length+'个指标</span>'
    +(bestProj?'<span class="bm-sm-tag">🏆 最优: '+bestProj+' ('+bestScore+'分)</span>':'')
    +(improveProj?'<span class="bm-sm-tag" style="color:var(--success)">📈 改善: '+improveProj+'</span>':'')
    +(worsenProj?'<span class="bm-sm-tag" style="color:var(--danger)">📉 恶化: '+worsenProj+'</span>':'')
    +'</div>';
  
  var cardsHtml='';
  st.selectedMetricIds.forEach(function(mid){
    var m=METRIC_MAP[mid];
    if(!m)return;
    cardsHtml+='<div class="bm-trend-card">'
      +'<div class="bm-trend-head"><span class="bm-trend-title" style="color:'+CAT_COLORS[m.cat]+'">'+mid+' '+m.name+'</span>'
      +'<span class="bm-trend-unit">'+m.unit+' | 目标:'+m.target+m.unit+'</span></div>'
      +'<div class="bm-trend-chart-wrap"><canvas id="bm-chart-'+mid+'" height="160"></canvas></div>'
      +'</div>';
  });
  
  center.innerHTML=summary+'<div class="bm-trend-grid">'+cardsHtml+'</div>';
  
  // 渲染每个指标的折线图
  st.selectedMetricIds.forEach(function(mid){
    renderTrendChart(mid,range);
  });
}

function renderTrendChart(mid,range){
  var m=METRIC_MAP[mid];
  if(!m)return;
  var canvas=document.getElementById('bm-chart-'+mid);
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var labels=range.map(function(mi){return mi.replace('20','');});
  
  var datasets=[];
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    if(!p)return;
    var data=getMetricData(pid,mid);
    if(!data)return;
    var vals=range.map(function(mi){
      var d=data.find(function(x){return x.period===mi;});
      return d?d.value:null;
    });
    datasets.push({
      label:p.name,
      data:vals,
      borderColor:st.projectColors[pid],
      backgroundColor:st.projectColors[pid]+'20',
      borderWidth:2,
      pointRadius:3,
      pointHoverRadius:5,
      tension:0.3,
      fill:false
    });
  });
  
  // 目标线
  if(st.showTarget){
    datasets.push({
      label:'目标',
      data:labels.map(function(){return m.target;}),
      borderColor:'#94a3b8',
      borderDash:[6,4],
      borderWidth:1.5,
      pointRadius:0,
      fill:false
    });
  }
  
  st.charts['chart-'+mid]=new Chart(ctx,{
    type:'line',
    data:{labels:labels,datasets:datasets},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:12,font:{size:10}}}},
      scales:{
        y:{beginAtZero:m.higher?false:true,ticks:{font:{size:10}}},
        x:{ticks:{font:{size:9}}}
      }
    }
  });
}

// 视图二：项目全量对比（雷达图+热力矩阵）
function renderFullMatrixView(center){
  var metrics=st.selectedMetricIds.length?st.selectedMetricIds:['D1','S1','Q1','P1','P2'];
  var html='<div class="bm-fm-layout">';
  
  // 雷达图区域
  html+='<div class="bm-fm-radar-card"><div class="bm-card-head">项目雷达图对比（归一化0-100分）</div><div class="bm-radar-wrap"><canvas id="bm-radarChart" height="300"></canvas></div></div>';
  
  // 热力矩阵
  html+='<div class="bm-fm-heat-card"><div class="bm-card-head">指标得分热力矩阵</div><div class="bm-heat-table-wrap" id="bm-heatTableWrap"></div></div>';
  html+='</div>';
  center.innerHTML=html;
  
  // 渲染雷达图
  renderRadarChart(metrics);
  // 渲染热力表
  renderHeatTable(metrics);
}

function renderRadarChart(metrics){
  var canvas=document.getElementById('bm-radarChart');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var datasets=[];
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    if(!p)return;
    var vals=metrics.map(function(mid){
      var data=getMetricData(pid,mid);
      if(!data||!data.length)return 0;
      var latest=data[data.length-1].value;
      return normalizeMetric(mid,latest);
    });
    datasets.push({
      label:p.name,
      data:vals,
      backgroundColor:st.projectColors[pid]+'30',
      borderColor:st.projectColors[pid],
      borderWidth:2,
      pointBackgroundColor:st.projectColors[pid],
      pointRadius:3
    });
  });
  st.charts['radar']=new Chart(ctx,{
    type:'radar',
    data:{labels:metrics.map(function(mid){return METRIC_MAP[mid]?METRIC_MAP[mid].id:'';}),datasets:datasets},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:10}}}},
      scales:{r:{beginAtZero:true,max:100,ticks:{font:{size:9},stepSize:20},pointLabels:{font:{size:11}}}}
    }
  });
}

function renderHeatTable(metrics){
  var wrap=document.getElementById('bm-heatTableWrap');
  if(!wrap)return;
  var html='<table class="bm-heat-table"><thead><tr><th>指标</th>';
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    html+='<th style="color:'+st.projectColors[pid]+'">'+(p?p.name:pid)+'</th>';
  });
  html+='<th>均值</th></tr></thead><tbody>';
  
  metrics.forEach(function(mid){
    var m=METRIC_MAP[mid];if(!m)return;
    html+='<tr><td class="bm-ht-label"><b>'+mid+'</b> '+m.name+'</td>';
    var sum=0,cnt=0;
    st.selectedPids.forEach(function(pid){
      var data=getMetricData(pid,mid);
      var val=data?data[data.length-1].value:null;
      if(val!==null){sum+=val;cnt++;}
      var score=val!==null?normalizeMetric(mid,val):0;
      var bg=score>=80?'#dcfce7':score>=50?'#fef9c3':'#fef2f2';
      var color=score>=80?'#16a34a':score>=50?'#d97706':'#dc2626';
      var trend=data?data[data.length-1].trend:'flat';
      var arrow=trend==='up'?'▲':trend==='down'?'▼':'—';
      html+='<td style="background:'+bg+';color:'+color+'">'+(val!==null?val+m.unit:'N/A')+'<span class="bm-ht-arrow">'+arrow+'</span></td>';
    });
    var avg=cnt>0?Math.round(sum/cnt*10)/10:0;
    html+='<td style="font-weight:700">'+avg+m.unit+'</td></tr>';
  });
  // 综合健康分行
  html+='<tr class="bm-ht-total"><td><b>H0</b> 综合健康分</td>';
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    var score=p?p.healthScore:0;
    var bg=score>=80?'#dcfce7':score>=65?'#fef9c3':'#fef2f2';
    var color=score>=80?'#16a34a':score>=65?'#d97706':'#dc2626';
    html+='<td style="background:'+bg+';color:'+color+';font-weight:800">'+score+'分</td>';
  });
  var hSum=st.selectedPids.reduce(function(a,pid){var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});return a+(p?p.healthScore:0);},0);
  html+='<td style="font-weight:800">'+Math.round(hSum/st.selectedPids.length)+'分</td></tr>';
  html+='</tbody></table>';
  wrap.innerHTML=html;
}

// 视图三：维度切片分析
function renderDimensionView(center){
  var metrics=st.selectedMetricIds.length?st.selectedMetricIds:['D1','S1','Q1'];
  var html='<div class="bm-dim-layout">';
  // 维度切换
  html+='<div class="bm-dim-tabs">';
  ['customer','bg','bu','phase'].forEach(function(d){
    var active=st.dimCut===d?'active':'';
    var label=d==='customer'?'按客户':d==='bg'?'按BG':d==='bu'?'按BU':'按阶段';
    html+='<button class="bm-dim-tab '+active+'" data-dim="'+d+'">'+label+'</button>';
  });
  html+='</div>';
  
  // 分组柱状图
  html+='<div class="bm-dim-chart-card"><div class="bm-card-head">分组柱状图 · 按'+(st.dimCut==='customer'?'客户':st.dimCut==='bg'?'BG':st.dimCut==='bu'?'BU':'阶段')+'切片</div><div style="height:320px"><canvas id="bm-dimBarChart"></canvas></div></div>';
  
  // 散点气泡图
  html+='<div class="bm-dim-chart-card"><div class="bm-card-head">散点气泡图（X:'+METRIC_MAP[metrics[0]].name+' / Y:'+(METRIC_MAP[metrics[1]||metrics[0]].name)+' / 大小:库存周转）</div><div style="height:300px"><canvas id="bm-dimScatterChart"></canvas></div></div>';
  html+='</div>';
  center.innerHTML=html;
  
  renderDimBarChart(metrics);
  renderDimScatterChart(metrics);
}

function renderDimBarChart(metrics){
  var canvas=document.getElementById('bm-dimBarChart');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  // 按维度分组
  var groups={};
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    if(!p)return;
    var key=p[st.dimCut];
    if(!groups[key])groups[key]=[];
    groups[key].push(p);
  });
  var groupKeys=Object.keys(groups);
  var datasets=[];
  metrics.forEach(function(mid,i){
    var m=METRIC_MAP[mid];if(!m)return;
    var vals=groupKeys.map(function(gk){
      var projs=groups[gk];
      var sum=0,cnt=0;
      projs.forEach(function(p){
        var data=getMetricData(p.id,mid);
        if(data&&data.length){sum+=data[data.length-1].value;cnt++;}
      });
      return cnt>0?Math.round(sum/cnt*10)/10:0;
    });
    datasets.push({
      label:mid+' '+m.name,
      data:vals,
      backgroundColor:CAT_COLORS[m.cat]+'80',
      borderColor:CAT_COLORS[m.cat],
      borderWidth:1
    });
  });
  st.charts['dimBar']=new Chart(ctx,{
    type:'bar',
    data:{labels:groupKeys,datasets:datasets},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:10}}}},
      scales:{y:{ticks:{font:{size:10}}},x:{ticks:{font:{size:10}}}}
    }
  });
}

function renderDimScatterChart(metrics){
  var canvas=document.getElementById('bm-dimScatterChart');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var xMid=metrics[0],yMid=metrics[1]||metrics[0];
  var datasets={};
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    if(!p)return;
    var key=p[st.dimCut];
    if(!datasets[key])datasets[key]={label:key,data:[],backgroundColor:st.projectColors[pid]+'60',borderColor:st.projectColors[pid]};
    var xData=getMetricData(pid,xMid),yData=getMetricData(pid,yMid),zData=getMetricData(pid,'I3');
    if(xData&&yData){
      var xVal=xData[xData.length-1].value;
      var yVal=yData[yData.length-1].value;
      var zVal=zData?zData[zData.length-1].value:12;
      datasets[key].data.push({x:xVal,y:yVal,r:Math.max(4,Math.min(20,zVal*1.5)),pid:pid,pname:p.name});
    }
  });
  st.charts['dimScatter']=new Chart(ctx,{
    type:'bubble',
    data:{datasets:Object.values(datasets)},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}},
        tooltip:{callbacks:{label:function(ctx){var d=ctx.raw;return d.pname+': ('+d.x+', '+d.y+', r='+d.r+')';}}}},
      scales:{x:{title:{display:true,text:METRIC_MAP[xMid].name+' ('+METRIC_MAP[xMid].unit+')'},ticks:{font:{size:10}}},
              y:{title:{display:true,text:METRIC_MAP[yMid].name+' ('+METRIC_MAP[yMid].unit+')'},ticks:{font:{size:10}}}}
    }
  });
}

// 视图四：综合热力矩阵
function renderHeatmapView(center){
  var metrics=st.selectedMetricIds.length?st.selectedMetricIds:METRICS.filter(function(m){return m.id!=='H0';}).map(function(m){return m.id;}).slice(0,10);
  
  // AI洞察
  var insights=genInsights(metrics);
  var insightHtml='<div class="bm-insight-box">';
  insights.forEach(function(ins){
    insightHtml+='<div class="bm-insight-item '+ins.type+'"><span class="bm-ins-icon">'+ins.icon+'</span><span>'+ins.text+'</span></div>';
  });
  insightHtml+='</div>';
  
  var html='<div class="bm-hm-layout">'
    +'<div class="bm-hm-main"><div class="bm-card-head">综合热力矩阵 · 当前月快照</div><div class="bm-heat-table-wrap" id="bm-hmTableWrap"></div></div>'
    +'<div class="bm-hm-side">'
    +'<div class="bm-card-head">排行榜</div>'
    +'<div id="bm-hmRanking"></div>'
    +'</div>'
    +'</div>'
    +insightHtml;
  center.innerHTML=html;
  
  renderHeatmapTable(metrics);
  renderRanking(metrics);
}

function renderHeatmapTable(metrics){
  var wrap=document.getElementById('bm-hmTableWrap');
  if(!wrap)return;
  var html='<table class="bm-heat-table bm-hm-table"><thead><tr><th>项目</th>';
  metrics.forEach(function(mid){var m=METRIC_MAP[mid];if(m)html+='<th title="'+m.desc+'"><b>'+mid+'</b></th>';});
  html+='<th>健康分</th></tr></thead><tbody>';
  
  // 按健康分排序
  var sortedPids=st.selectedPids.slice().sort(function(a,b){
    return getHealthScore(b)-getHealthScore(a);
  });
  
  sortedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    if(!p)return;
    var color=st.projectColors[pid]||'#ccc';
    html+='<tr><td class="bm-ht-proj" style="border-left:3px solid '+color+'"><b>'+p.name+'</b><br><span style="font-size:10px;color:var(--text-muted)">'+p.customer+' · '+PHASE_LABELS[p.phase]+'</span></td>';
    metrics.forEach(function(mid){
      var data=getMetricData(pid,mid);
      var val=data?data[data.length-1].value:null;
      var score=val!==null?normalizeMetric(mid,val):0;
      var bg=score>=80?'#dcfce7':score>=50?'#fef9c3':'#fef2f2';
      var color=score>=80?'#16a34a':score>=50?'#d97706':'#dc2626';
      html+='<td style="background:'+bg+';color:'+color+';text-align:center;font-weight:600;font-size:11px">'+(val!==null?val:'N/A')+'</td>';
    });
    var hScore=p.healthScore;
    var hBg=hScore>=80?'#dcfce7':hScore>=65?'#fef9c3':'#fef2f2';
    var hColor=hScore>=80?'#16a34a':hScore>=65?'#d97706':'#dc2626';
    html+='<td style="background:'+hBg+';color:'+hColor+';font-weight:800;text-align:center">'+hScore+'</td></tr>';
  });
  html+='</tbody></table>';
  wrap.innerHTML=html;
}

function renderRanking(metrics){
  var el=document.getElementById('bm-hmRanking');
  if(!el)return;
  // 项目健康排行
  var ranked=st.selectedPids.map(function(pid){return MOCK_PROJECTS.find(function(p){return p.id===pid;});}).filter(Boolean).sort(function(a,b){return b.healthScore-a.healthScore;});
  var html='<div class="bm-rank-section"><div class="bm-rank-title">项目健康排行</div>';
  ranked.forEach(function(p,i){
    var color=st.projectColors[p.id]||'#ccc';
    var hColor=p.healthScore>=80?'#16a34a':p.healthScore>=65?'#d97706':'#dc2626';
    html+='<div class="bm-rank-item"><span class="bm-rank-num">'+(i+1)+'</span><span style="color:'+color+'">●</span> <span class="bm-rank-name">'+p.name+'</span> <span style="color:'+hColor+';font-weight:700">'+p.healthScore+'</span></div>';
  });
  html+='</div>';
  // 指标均分排行
  html+='<div class="bm-rank-section"><div class="bm-rank-title">指标均分排行（越低越需关注）</div>';
  var metricAvgs=metrics.map(function(mid){
    var sum=0,cnt=0;
    st.selectedPids.forEach(function(pid){
      var data=getMetricData(pid,mid);
      if(data&&data.length){sum+=normalizeMetric(mid,data[data.length-1].value);cnt++;}
    });
    return{mid:mid,avg:cnt>0?Math.round(sum/cnt):0};
  }).sort(function(a,b){return a.avg-b.avg;});
  metricAvgs.forEach(function(ma,i){
    var m=METRIC_MAP[ma.mid];if(!m)return;
    var color=ma.avg>=80?'#16a34a':ma.avg>=50?'#d97706':'#dc2626';
    html+='<div class="bm-rank-item"><span class="bm-rank-num">'+(i+1)+'</span><span style="color:'+CAT_COLORS[m.cat]+';font-weight:700">'+ma.mid+'</span> <span class="bm-rank-name">'+m.name+'</span> <span style="color:'+color+';font-weight:700">'+ma.avg+'分</span></div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

function genInsights(metrics){
  var insights=[];
  var worst=st.selectedPids.map(function(pid){return MOCK_PROJECTS.find(function(p){return p.id===pid;});}).filter(Boolean).sort(function(a,b){return a.healthScore-b.healthScore;})[0];
  if(worst){
    var worstMetric=null,worstScore=999;
    metrics.forEach(function(mid){
      var data=getMetricData(worst.id,mid);
      if(data&&data.length){
        var val=data[data.length-1].value;
        var score=normalizeMetric(mid,val);
        if(score<worstScore){worstScore=score;worstMetric=mid;}
      }
    });
    insights.push({type:'danger',icon:'⚠️',text:'当前最需关注：'+worst.name+' 健康分仅'+worst.healthScore+'分'+(worstMetric?'，'+worstMetric+'指标最差('+worstScore+'分)':'')});
  }
  var best=st.selectedPids.map(function(pid){return MOCK_PROJECTS.find(function(p){return p.id===pid;});}).filter(Boolean).sort(function(a,b){return b.healthScore-a.healthScore;})[0];
  if(best)insights.push({type:'success',icon:'🏆',text:'表现最优：'+best.name+' 健康分'+best.healthScore+'分，所有指标均达目标'});
  
  // 改善最快
  var improveProj=null,improveVal=-99;
  st.selectedPids.forEach(function(pid){
    var p=MOCK_PROJECTS.find(function(x){return x.id===pid;});
    var d1=getMetricData(pid,'D1');
    if(d1&&d1.length>=4){
      var change=d1[d1.length-1].value-d1[d1.length-4].value;
      if(change>improveVal){improveVal=change;improveProj=p;}
    }
  });
  if(improveProj)insights.push({type:'info',icon:'📈',text:'改善最快：'+improveProj.name+' 近3月D1 OTIF提升'+improveVal.toFixed(1)+'%'});
  
  // 跨项目共性问题
  var commonBad={};
  metrics.forEach(function(mid){
    var badCount=0;
    st.selectedPids.forEach(function(pid){
      var data=getMetricData(pid,mid);
      if(data&&data.length){
        var score=normalizeMetric(mid,data[data.length-1].value);
        if(score<50)badCount++;
      }
    });
    if(badCount>=Math.ceil(st.selectedPids.length*0.4))commonBad[mid]=badCount;
  });
  Object.keys(commonBad).forEach(function(mid){
    var m=METRIC_MAP[mid];
    insights.push({type:'warn',icon:'⚡',text:'跨项目共性问题：'+mid+' '+m.name+' 在'+commonBad[mid]+'个项目中超预警'});
  });
  return insights;
}

/* ═══ 10. 工具函数 ═══ */
function getRangeMonths(){
  if(st.timeRange==='4w')return MONTHS.slice(-1);
  if(st.timeRange==='3m')return MONTHS.slice(-3);
  if(st.timeRange==='6m')return MONTHS.slice(-6);
  return MONTHS;
}

/* ═══ 11. 事件绑定 ═══ */
function bindEvents(container){
  // 视图切换
  container.addEventListener('click',function(e){
    var vtab=e.target.closest('.bm-vtab');
    if(vtab){st.viewMode=vtab.dataset.view;container.querySelectorAll('.bm-vtab').forEach(function(t){t.classList.remove('active');});vtab.classList.add('active');renderAll(container);return;}
    
    var qf=e.target.closest('.bm-qf-tag');
    if(qf){
      var ft=qf.dataset.ft,val=qf.dataset.val;
      var idx=st.filters[ft].indexOf(val);
      if(idx>=0)st.filters[ft].splice(idx,1);else st.filters[ft].push(val);
      qf.classList.toggle('active');
      renderProjectTree();return;
    }
    
    var sbx=e.target.closest('.bm-sb-x');
    if(sbx){toggleProject(sbx.dataset.pid);return;}
    
    var dimTab=e.target.closest('.bm-dim-tab');
    if(dimTab){st.dimCut=dimTab.dataset.dim;renderAll(container);return;}
  });
  
  // 项目复选框
  container.addEventListener('change',function(e){
    if(e.target.type==='checkbox'&&e.target.dataset.pid){
      toggleProject(e.target.dataset.pid);
    }
    if(e.target.type==='checkbox'&&e.target.dataset.mid){
      toggleMetric(e.target.dataset.mid);
    }
  });
  
  // 搜索
  var search=document.getElementById('bm-search');
  if(search)search.addEventListener('input',function(){st.searchKeyword=this.value;renderProjectTree();});
  
  // 预设方案
  var preset=document.getElementById('bm-preset');
  if(preset)preset.addEventListener('change',function(){
    var val=this.value;
    if(val&&PRESETS[val]){
      st.selectedMetricIds=PRESETS[val].slice();
      renderMetricList();renderAll(container);
    }
  });
  
  // 时间范围
  var timeRange=document.getElementById('bm-timeRange');
  if(timeRange)timeRange.addEventListener('change',function(){st.timeRange=this.value;renderAll(container);});
  
  // 目标线/历史最优
  var showTarget=document.getElementById('bm-showTarget');
  if(showTarget)showTarget.addEventListener('change',function(){st.showTarget=this.checked;renderAll(container);});
  var showBest=document.getElementById('bm-showBest');
  if(showBest)showBest.addEventListener('change',function(){st.showBest=this.checked;renderAll(container);});
  
  // 初始化子组件
  renderQuickFilters();
  renderProjectTree();
  renderSelectedBar();
  renderMetricList();
}

window.initPage_benchmark=initPage_benchmark;
})();
registerModule('benchmark', initPage_benchmark);
