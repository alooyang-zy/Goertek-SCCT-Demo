// Module: suppliercollab — 供方协同 v1.0 (关键料·供方库存/在制/质量/风险一体化)
(function(){
"use strict";

// ═══════════════ 供应商池 ═══════════════
var SUPPLIER_POOL = [
  {name:'楼氏电子',tier:1,region:'华东',capability:'声学器件',relSensitivity:'高'},
  {name:'瑞声科技',tier:1,region:'华南',capability:'声学模组',relSensitivity:'高'},
  {name:'瀛通通讯',tier:2,region:'华中',capability:'线材/连接器',relSensitivity:'中'},
  {name:'欧菲光',tier:1,region:'华东',capability:'光学模组',relSensitivity:'高'},
  {name:'舜宇光学',tier:1,region:'华东',capability:'镜头/光学',relSensitivity:'高'},
  {name:'三星电机',tier:1,region:'海外',capability:'MLCC/被动件',relSensitivity:'极高'},
  {name:'索尼精密',tier:1,region:'海外',capability:'传感器/芯片',relSensitivity:'极高'},
  {name:'欣旺达',tier:1,region:'华南',capability:'电池/电源',relSensitivity:'中'},
  {name:'立讯精密',tier:1,region:'华东',capability:'连接器/模组',relSensitivity:'中'},
  {name:'歌尔微电子',tier:2,region:'华东',capability:'MEMS芯片',relSensitivity:'高'},
  {name:'京东方',tier:2,region:'华北',capability:'显示模组',relSensitivity:'中'},
  {name:'村田制作所',tier:1,region:'海外',capability:'被动元件',relSensitivity:'极高'},
  {name:'德州仪器',tier:1,region:'海外',capability:'IC/芯片',relSensitivity:'极高'},
  {name:'高通',tier:1,region:'海外',capability:'SoC/基带',relSensitivity:'极高'},
  {name:'联发科',tier:1,region:'海外',capability:'主控芯片',relSensitivity:'极高'},
];

// ═══════════════ 备料链路阶段 ═══════════════
var PIPELINE_STAGES = [
  {id:'stockup',name:'供方备料',icon:'fa-warehouse'},
  {id:'wip',name:'在制生产',icon:'fa-industry'},
  {id:'complete',name:'完工待检',icon:'fa-circle-check'},
  {id:'transit',name:'在途运输',icon:'fa-truck'},
  {id:'receive',name:'到厂收货',icon:'fa-box-open'},
  {id:'iqc',name:'IQC检验',icon:'fa-microscope'},
  {id:'putaway',name:'入库齐套',icon:'fa-cubes'}
];

// ═══════════════ 风险标签 ═══════════════
var RISK_LABELS = {
  delay:{name:'交期延迟',icon:'fa-clock',color:'red'},
  capacity:{name:'产能不足',icon:'fa-gauge-high',color:'amber'},
  quality:{name:'质量异常',icon:'fa-triangle-exclamation',color:'red'},
  material:{name:'材料短缺',icon:'fa-box-open',color:'amber'},
  single:{name:'单源风险',icon:'fa-link-slash',color:'purple'},
  ecr:{name:'工程变更',icon:'fa-rotate',color:'blue'},
};

// ═══════════════ 数据生成 ═══════════════
var _cache = {};
function getCollabData(pid){
  if(_cache[pid]) return _cache[pid];
  var p = (typeof projects!=='undefined') ? projects.find(function(x){return x.id===pid;}) : null;
  if(!p){ _cache[pid]={materials:[],suppliers:[]}; return _cache[pid]; }
  var seed = parseInt(pid.replace(/\D/g,'')||'1');
  function rng(){ seed=(seed*9301+49297)%233280; return seed/233280; }

  var matTypes = [
    {prefix:'30',cat:'关键定制',ci:true,suppliers:['楼氏电子','瑞声科技','索尼精密']},
    {prefix:'31',cat:'关键标准',ci:false,suppliers:['三星电机','村田制作所','德州仪器']},
    {prefix:'32',cat:'定制件',ci:true,suppliers:['欧菲光','舜宇光学','京东方']},
    {prefix:'33',cat:'通用件',ci:false,suppliers:['瀛通通讯','欣旺达','立讯精密']},
    {prefix:'34',cat:'芯片类',ci:false,suppliers:['高通','联发科','德州仪器']},
  ];
  var matNames = ['主芯片','声学驱动IC','蓝牙模块','电源管理IC','MEMS传感器','射频前端','存储芯片','显示屏模组','电池模组','光学镜头','连接器','被动元件','天线模组','保护器件','声学腔体','FPC排线','硅胶按键','屏蔽罩','导热材料','结构外壳'];
  var matCount = 12 + Math.floor(rng()*8);
  var materials = [];

  for(var i=0;i<matCount;i++){
    var mt = matTypes[i%5];
    var sup = mt.suppliers[Math.floor(rng()*mt.suppliers.length)];
    var demand = Math.floor(p.volume * (0.8+rng()*0.4));
    // 供方库存 & 在制
    var stockup = Math.floor(demand * (0.35+rng()*0.5));    // 供应商备料
    var wip = Math.floor(stockup * (0.3+rng()*0.5));        // 在制
    var complete = Math.floor(wip * (0.4+rng()*0.5));       // 完工待检
    var transit = Math.floor(complete * (0.4+rng()*0.5));   // 在途
    var receive = Math.floor(transit * (0.5+rng()*0.4));    // 到厂收货
    var iqc = Math.floor(receive * (0.6+rng()*0.4));        // IQC
    var putaway = Math.floor(iqc * (0.75+rng()*0.25));      // 入库齐套
    // 质量数据
    var ppm = Math.floor(20 + rng()*450);                   // 供方PPM
    var iqcNG = Math.floor(receive * rng()*0.05);           // IQC不合格数
    // 产能利用
    var capUtil = Math.floor(65 + rng()*35);                // 供方产能利用率%
    // 风险标签
    var isSingle = rng()>0.7;
    var riskTags = [];
    if(rng()>0.7) riskTags.push('delay');
    if(rng()>0.85) riskTags.push('capacity');
    if(rng()>0.88) riskTags.push('quality');
    if(rng()>0.8) riskTags.push('material');
    if(isSingle && rng()>0.5) riskTags.push('single');
    if(rng()>0.92) riskTags.push('ecr');
    // WIP状态判定
    var wipStatus = riskTags.indexOf('delay')>=0 ? '延期' : (riskTags.indexOf('capacity')>=0 ? '产能紧张' : (rng()>0.5 ? '正常' : '关注'));
    var otd = Math.floor(70+rng()*30);

    materials.push({
      partNo: mt.prefix+'10-'+String(i+1).padStart(4,'0'),
      name: matNames[i%matNames.length],
      category: mt.cat,
      ci: mt.ci?'CI件':'标准件',
      supplier: sup,
      singleSource: isSingle,
      demand: demand,
      stockup: stockup, wip: wip, complete: complete,
      transit: transit, receive: receive, iqc: iqc, putaway: putaway,
      ppm: ppm, iqcNG: iqcNG, capUtil: capUtil,
      wipStatus: wipStatus,
      commitDate: '2026-W'+(23+Math.floor(rng()*8)),
      riskTags: riskTags, otd: otd,
      leadTime: 7+Math.floor(rng()*25)
    });
  }

  // 按供应商汇总
  var supMap = {};
  materials.forEach(function(m){
    if(!supMap[m.supplier]){
      var sp = SUPPLIER_POOL.find(function(s){return s.name===m.supplier;});
      supMap[m.supplier] = {
        name: m.supplier,
        tier: sp?sp.tier:2,
        region: sp?sp.region:'',
        sensitivity: sp?sp.relSensitivity:'中',
        materials: [],
        totalDemand: 0, totalPutaway: 0,
        avgPPM: 0, avgCapUtil: 0,
        riskCount: 0, delayCount: 0
      };
    }
    var sm = supMap[m.supplier];
    sm.materials.push(m);
    sm.totalDemand += m.demand;
    sm.totalPutaway += m.putaway;
    sm.riskCount += m.riskTags.length;
    if(m.riskTags.indexOf('delay')>=0) sm.delayCount++;
  });
  // 计算平均值
  var suppliers = [];
  for(var k in supMap){
    var sm = supMap[k];
    sm.avgPPM = Math.round(sm.materials.reduce(function(s,m){return s+m.ppm;},0)/sm.materials.length);
    sm.avgCapUtil = Math.round(sm.materials.reduce(function(s,m){return s+m.capUtil;},0)/sm.materials.length);
    suppliers.push(sm);
  }

  _cache[pid] = {materials:materials, suppliers:suppliers};
  return _cache[pid];
}

// ═══════════════ 渲染 ═══════════════
function initPage_suppliercollab(){
  try{
  var fp = (typeof getFilteredProjects==='function') ? getFilteredProjects() : (typeof projects!=='undefined'?projects:[]);
  var sel = document.getElementById('scProjectSelect');
  if(sel && typeof fillProjectSelect==='function') fillProjectSelect(sel, fp);
  if(typeof consumeDrillDown==='function') consumeDrillDown('scProjectSelect');
  var pid = sel ? sel.value : '';
  var p = pid ? projects.find(function(x){return x.id===pid;}) : null;
  if(!p && fp.length){ p=fp[0]; pid=p.id; if(sel) sel.value=pid; }
  if(!p) return;

  var data = getCollabData(pid);
  var totalDemand = data.materials.reduce(function(s,m){return s+m.demand;},0);
  var totalPutaway = data.materials.reduce(function(s,m){return s+m.putaway;},0);
  var totalWIP = data.materials.reduce(function(s,m){return s+m.wip;},0);
  var totalRisk = data.materials.reduce(function(s,m){return s+m.riskTags.length;},0);
  var avgPPM = Math.round(data.materials.reduce(function(s,m){return s+m.ppm;},0)/data.materials.length);
  var delayMats = data.materials.filter(function(m){return m.wipStatus==='延期'||m.wipStatus==='产能紧张';}).length;

  // ── 信息条 ──
  var info = document.getElementById('scInfoItems');
  if(info) info.innerHTML =
    '<span style="font-weight:700;color:var(--primary);margin-right:8px">'+p.name+'</span>'
    +'<span class="sc-info-item"><b>客户</b> '+p.customer+'</span>'
    +'<span class="sc-info-item"><b>产品线</b> '+p.productLine+'</span>'
    +'<span class="sc-info-item"><b>阶段</b> '+p.engStage+'</span>'
    +'<span class="sc-info-item"><b>关键料</b> '+data.materials.length+'</span>'
    +'<span class="sc-info-item"><b>供应商</b> '+data.suppliers.length+'</span>'
    +'<span class="sc-info-item"><b>风险项</b> <em style="color:var(--danger);font-style:normal;font-weight:700">'+totalRisk+'</em></span>';

  // ── KPI卡片 ──
  var kg = document.getElementById('scCards');
  if(kg){
    var putawayRate = totalDemand?Math.round(totalPutaway/totalDemand*100):0;
    var kpiData = [
      {label:'关键物料',value:data.materials.length,sub:'总计',accent:'blue',icon:'fa-cubes'},
      {label:'供应商',value:data.suppliers.length,sub:'涉及供方',accent:'purple',icon:'fa-building'},
      {label:'备料齐套率',value:putawayRate+'%',sub:totalPutaway.toLocaleString()+'/'+totalDemand.toLocaleString(),accent:putawayRate>75?'green':'red',icon:'fa-circle-check'},
      {label:'质量DPPM',value:avgPPM,sub:'供方PPM',accent:avgPPM<150?'green':'red',icon:'fa-microscope'},
      {label:'在制延期',value:delayMats,sub:'延期/产能紧张',accent:delayMats>3?'red':'amber',icon:'fa-clock'},
      {label:'供方风险',value:totalRisk+'项',sub:'影响歌尔链路',accent:totalRisk>5?'red':'amber',icon:'fa-shield-halved'},
    ];
    kg.innerHTML = kpiData.map(function(k){
      return '<div class="sc-card"><div class="sc-card-accent '+k.accent+'"></div>'
        +'<div class="sc-card-icon"><i class="fas '+k.icon+'"></i></div>'
        +'<div class="sc-card-label">'+k.label+'</div>'
        +'<div class="sc-card-value">'+k.value+'</div>'
        +'<div class="sc-card-sub">'+k.sub+'</div></div>';
    }).join('');
  }

  // ── 备料链路进度 ──
  renderPipeline(data, totalDemand);

  // ── 供方库存&在制表 ──
  renderWipTable(data);

  // ── 质量绩效图 ──
  renderQualityChart(data);

  // ── 供方风险影响评估 ──
  renderRiskPanel(data);

  // ── 关键物料明细表 ──
  renderDetailTable(data);

  }catch(e){console.error('suppliercollab init error:',e);}
}

// ── Pipeline ──
function renderPipeline(data, totalDemand){
  var el = document.getElementById('scPipeline');
  if(!el) return;
  totalDemand = totalDemand||1;
  var keys = ['stockup','wip','complete','transit','receive','iqc','putaway'];
  el.innerHTML = '<div class="sc-pipe-bg">'+PIPELINE_STAGES.map(function(st,i){
    var total = data.materials.reduce(function(s,m){return s+m[st.id];},0);
    var pct = Math.round(total/totalDemand*100);
    var barColor = pct>=80?'#22c55e':pct>=60?'#eab308':pct>=40?'#3b82f6':'#ef4444';
    var color = pct>=80?'var(--success)':pct>=60?'var(--warning)':'var(--danger)';
    return '<div class="sc-stage" data-stage="'+st.id+'">'
      +'<div class="sc-stage-name"><i class="fas '+st.icon+'"></i> '+st.name+'</div>'
      +'<div class="sc-stage-pct" style="color:'+color+'">'+pct+'%</div>'
      +'<div class="sc-stage-val">'+total.toLocaleString()+'<span style="font-size:10px;color:var(--text-muted)">/'+totalDemand.toLocaleString()+'</span></div>'
      +'<div class="sc-stage-bar"><div class="sc-stage-bar-fill" style="width:'+pct+'%;background:'+barColor+'"></div></div>'
      +(i<keys.length-1?'<div class="sc-stage-arrow">▸</div>':'')
      +'</div>';
  }).join('')+'</div>';
}

// ── WIP/库存表 ──
function renderWipTable(data){
  var thead = document.getElementById('scWipTHead');
  var tbody = document.getElementById('scWipTBody');
  if(!thead||!tbody) return;
  thead.innerHTML = '<tr><th>供应商</th><th>物料</th><th>需求量</th><th>供方库存</th><th>在制WIP</th><th>产能利用率</th><th>在制状态</th><th>预警</th></tr>';
  var rows = data.materials
    .filter(function(m){return m.wip===0?m.demand:(m.wip/m.demand)<1;})  // still show all
    .sort(function(a,b){return b.riskTags.length-a.riskTags.length;})
    .slice(0,16)
    .map(function(m){
      var stockRate = m.demand?Math.round(m.stockup/m.demand*100):0;
      var wipRate = m.demand?Math.round(m.wip/m.demand*100):0;
      var stockColor = stockRate>=60?'var(--success)':stockRate>=35?'var(--warning)':'var(--danger)';
      var capColor = m.capUtil>=95?'var(--danger)':m.capUtil>=80?'var(--warning)':'var(--success)';
      var stColor = m.wipStatus==='延期'?'var(--danger)':m.wipStatus==='产能紧张'?'var(--warning)':m.wipStatus==='关注'?'var(--text-sec)':'var(--success)';
      return '<tr>'
        +'<td style="font-weight:600">'+m.supplier+'</td>'
        +'<td>'+m.name+'<span style="font-size:10px;color:var(--text-muted);margin-left:4px">'+m.partNo+'</span></td>'
        +'<td><b>'+m.demand.toLocaleString()+'</b></td>'
        +'<td><span style="color:'+stockColor+';font-weight:600">'+m.stockup.toLocaleString()+'</span><span style="font-size:10px;color:var(--text-muted)"> ('+stockRate+'%)</span></td>'
        +'<td><span style="font-weight:600">'+m.wip.toLocaleString()+'</span><span style="font-size:10px;color:var(--text-muted)"> ('+wipRate+'%)</span></td>'
        +'<td><span style="color:'+capColor+';font-weight:600">'+m.capUtil+'%</span></td>'
        +'<td style="color:'+stColor+';font-weight:600"><i class="fas '+(m.wipStatus==='延期'?'fa-circle-exclamation':m.wipStatus==='产能紧张'?'fa-circle-dot':'fa-circle')+'" style="font-size:8px;margin-right:4px"></i>'+m.wipStatus+'</td>'
        +'<td>'+m.riskTags.map(function(t){var rl=RISK_LABELS[t];return rl?'<span class="sc-risk-tag '+rl.color+'"><i class="fas '+rl.icon+'"></i></span>':'';}).join(' ')+'</td>'
        +'</tr>';
    });
  tbody.innerHTML = rows.join('');
}

// ── 质量绩效图 ──
function renderQualityChart(data){
  if(!window.Chart) return;
  var ctx = document.getElementById('scQualityChart');
  if(!ctx) return;
  if(App.charts.scQuality) App.charts.scQuality.destroy();
  // 取前6供应商
  var top6 = data.suppliers.sort(function(a,b){return b.avgPPM-a.avgPPM;}).slice(0,6);
  App.charts.scQuality = new Chart(ctx,{
    type:'bar',
    data:{
      labels: top6.map(function(s){return s.name;}),
      datasets: [
        {label:'DPPM',data:top6.map(function(s){return s.avgPPM;}),backgroundColor:'rgba(239,68,68,0.6)',borderColor:'rgba(239,68,68,1)',borderWidth:1,yAxisID:'y'},
        {label:'评分',data:top6.map(function(s){return Math.round(Math.max(50,100-s.avgPPM/10));}),backgroundColor:'rgba(34,197,94,0.4)',borderColor:'rgba(34,197,94,1)',borderWidth:1,yAxisID:'y1'}
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{position:'bottom'}},
      scales:{
        y:{type:'linear',position:'left',title:{display:true,text:'DPPM'},beginAtZero:true},
        y1:{type:'linear',position:'right',title:{display:true,text:'评分'},beginAtZero:true,max:100,grid:{drawOnChartArea:false}}
      }
    }
  });
}

// ── 供方风险影响评估 ──
function renderRiskPanel(data){
  var el = document.getElementById('scRiskGrid');
  if(!el) return;
  el.innerHTML = data.suppliers
    .filter(function(s){return s.riskCount>0||s.delayCount>0;})
    .sort(function(a,b){return b.riskCount-a.riskCount;})
    .map(function(s){
      var rate = s.totalDemand?Math.round(s.totalPutaway/s.totalDemand*100):0;
      var impact = s.sensitivity==='极高'?'严重':s.sensitivity==='高'?'重大':'中等';
      var impactColor = s.sensitivity==='极高'?'red':s.sensitivity==='高'?'amber':'blue';
      return '<div class="sc-risk-item">'
        +'<div class="sc-risk-item-head">'
        +'<span class="sc-risk-sup-name">'+s.name+'</span>'
        +'<span style="font-size:10px;color:var(--text-muted)">Tier-'+s.tier+' · '+s.region+'</span>'
        +'<span class="sc-pill '+impactColor+'">影响'+impact+'</span>'
        +'</div>'
        +'<div class="sc-risk-item-body">'
        +'<div class="sc-risk-metrics">'
        +'<span>物料 <b>'+s.materials.length+'</b>种</span>'
        +'<span>齐套率 <b style="color:'+(rate>=70?'var(--success)':'var(--danger)')+'">'+rate+'%</b></span>'
        +'<span>PPM <b style="color:'+(s.avgPPM<150?'var(--success)':'var(--danger)')+'">'+s.avgPPM+'</b></span>'
        +'<span>产能 <b style="color:'+(s.avgCapUtil>=90?'var(--danger)':s.avgCapUtil>=75?'var(--warning)':'var(--success)')+'">'+s.avgCapUtil+'%</b></span>'
        +'<span>延期 <b style="color:'+(s.delayCount>0?'var(--danger)':'var(--text-sec)')+'">'+s.delayCount+'项</b></span>'
        +'<span>风险 <b style="color:'+(s.riskCount>0?'var(--danger)':'var(--success)')+'">'+s.riskCount+'项</b></span>'
        +'</div>'
        +'<div class="sc-risk-chain">'
        +'<span style="font-size:10px;color:var(--text-muted)">影响链: </span>'
        +'<span class="sc-chain-node">供方'+s.name+'</span>▸'
        +'<span class="sc-chain-node warn">'+ (s.delayCount>0?'交期风险·停线':'供应风险') +'</span>▸'
        +'<span class="sc-chain-node danger">歌尔'+ (s.sensitivity==='极高'?'产线中断':s.sensitivity==='高'?'交付延误':'成本上升') +'</span>'
        +'</div>'
        +'</div></div>';
    }).join('');
}

// ── 明细表 ──
function renderDetailTable(data){
  var thead = document.getElementById('scTHead');
  var tbody = document.getElementById('scTBody');
  if(!thead||!tbody) return;
  thead.innerHTML = '<tr>'
    +'<th>料号</th><th>物料名称</th><th>分类</th><th>CI</th><th>供应商</th><th>单源</th>'
    +'<th>需求量</th><th>供方库存</th><th>在制</th><th>产能%</th>'
    +'<th>PPM</th><th>OTD%</th><th>在制状态</th><th>风险</th>'
    +'</tr>';
  tbody.innerHTML = data.materials
    .sort(function(a,b){return b.riskTags.length-a.riskTags.length;})
    .map(function(m){
      var stockRate = m.demand?Math.round(m.stockup/m.demand*100):0;
      var stockColor = stockRate>=60?'var(--success)':stockRate>=35?'var(--warning)':'var(--danger)';
      var capColor = m.capUtil>=95?'var(--danger)':m.capUtil>=80?'var(--warning)':'var(--success)';
      var ppmColor = m.ppm<100?'var(--success)':m.ppm<300?'var(--warning)':'var(--danger)';
      var otdColor = m.otd>=90?'var(--success)':m.otd>=80?'var(--warning)':'var(--danger)';
      var stColor = m.wipStatus==='延期'?'var(--danger)':m.wipStatus==='产能紧张'?'var(--warning)':m.wipStatus==='关注'?'var(--text-sec)':'var(--success)';
      return '<tr>'
        +'<td><strong>'+m.partNo+'</strong></td>'
        +'<td>'+m.name+'</td>'
        +'<td>'+m.category+'</td>'
        +'<td><span class="sc-pill '+(m.ci==='CI件'?'amber':'blue')+'">'+m.ci+'</span></td>'
        +'<td>'+m.supplier+'</td>'
        +'<td>'+(m.singleSource?'<span class="sc-pill red">单源</span>':'<span style="color:var(--text-muted);font-size:11px">多源</span>')+'</td>'
        +'<td><b>'+m.demand.toLocaleString()+'</b></td>'
        +'<td style="color:'+stockColor+';font-weight:600">'+m.stockup.toLocaleString()+'</td>'
        +'<td>'+m.wip.toLocaleString()+'</td>'
        +'<td style="color:'+capColor+';font-weight:600">'+m.capUtil+'%</td>'
        +'<td style="color:'+ppmColor+';font-weight:600">'+m.ppm+'</td>'
        +'<td style="color:'+otdColor+';font-weight:600">'+m.otd+'%</td>'
        +'<td style="color:'+stColor+';font-weight:600">'+m.wipStatus+'</td>'
        +'<td>'+m.riskTags.map(function(t){var rl=RISK_LABELS[t];return rl?'<span class="sc-risk-tag '+rl.color+'" title="'+rl.name+'"><i class="fas '+rl.icon+'"></i> '+rl.name+'</span>':'';}).join(' ')+'</td>'
        +'</tr>';
    }).join('');
  var countEl = document.getElementById('scTableCount');
  if(countEl) countEl.textContent = '共 '+data.materials.length+' 条';
}

window.initPage_suppliercollab = initPage_suppliercollab;
})();
registerModule('suppliercollab', initPage_suppliercollab);
