// Module: supplier — 供方深度协同 v8.0 (单项目·四维联动·供应商备料/在制/在途追踪)
(function(){

// ═══════════════ 供应商池 ═══════════════
var SUPPLIER_POOL = [
  {name:'楼氏电子',tier:1,region:'华东',leadTime:14,capability:'声学器件'},
  {name:'瑞声科技',tier:1,region:'华南',leadTime:12,capability:'声学模组'},
  {name:'瀛通通讯',tier:2,region:'华中',leadTime:18,capability:'线材/连接器'},
  {name:'欧菲光',tier:1,region:'华东',leadTime:10,capability:'光学模组'},
  {name:'舜宇光学',tier:1,region:'华东',leadTime:15,capability:'镜头/光学'},
  {name:'三星电机',tier:1,region:'海外',leadTime:28,capability:'MLCC/被动件'},
  {name:'索尼精密',tier:1,region:'海外',leadTime:25,capability:'传感器/芯片'},
  {name:'欣旺达',tier:1,region:'华南',leadTime:10,capability:'电池/电源'},
  {name:'立讯精密',tier:1,region:'华东',leadTime:12,capability:'连接器/模组'},
  {name:'歌尔微电子',tier:2,region:'华东',leadTime:8,capability:'MEMS芯片'},
  {name:'京东方',tier:2,region:'华北',leadTime:20,capability:'显示模组'},
  {name:'村田制作所',tier:1,region:'海外',leadTime:30,capability:'被动元件'},
  {name:'德州仪器',tier:1,region:'海外',leadTime:35,capability:'IC/芯片'},
  {name:'高通',tier:1,region:'海外',leadTime:21,capability:'SoC/基带'},
  {name:'联发科',tier:1,region:'海外',leadTime:18,capability:'主控芯片'},
];

// ═══════════════ 备料链路阶段 ═══════════════
var PIPELINE_STAGES = [
  {id:'stockup',name:'供应商备料',icon:'fa-warehouse',desc:'原材料采购与库存'},
  {id:'wip',name:'在制生产',icon:'fa-industry',desc:'供应商产线在制'},
  {id:'complete',name:'完工待检',icon:'fa-circle-check',desc:'生产完成待检验'},
  {id:'transit',name:'在途运输',icon:'fa-truck',desc:'物流运输中'},
  {id:'receive',name:'到厂收货',icon:'fa-box-open',desc:'仓库已接收'},
  {id:'iqc',name:'IQC检验',icon:'fa-microscope',desc:'来料质量检验'},
  {id:'putaway',name:'入库齐套',icon:'fa-cubes',desc:'合格入库可齐套'}
];

// ═══════════════ 风险标签 ═══════════════
var RISK_LABELS = [
  {id:'delay',name:'交期延迟',icon:'fa-clock',color:'red'},
  {id:'capacity',name:'产能不足',icon:'fa-gauge-high',color:'amber'},
  {id:'quality',name:'质量异常',icon:'fa-triangle-exclamation',color:'red'},
  {id:'material',name:'材料短缺',icon:'fa-box-open',color:'amber'},
  {id:'single',name:'单源风险',icon:'fa-link-slash',color:'purple'},
  {id:'ecr',name:'工程变更',icon:'fa-rotate',color:'blue'},
];

// ═══════════════ 数据生成 ═══════════════
var _supCache = {};
function getSupplierData(pid){
  if(_supCache[pid]) return _supCache[pid];
  var p = projects.find(function(x){return x.id===pid;});
  if(!p){ _supCache[pid]={materials:[],suppliers:[]}; return _supCache[pid]; }
  var seed = parseInt(pid.replace(/\D/g,'')||'1');
  function rng(n){ seed=(seed*9301+49297)%233280; return seed/233280; }
  var matTypes = [
    {prefix:'30',cat:'关键定制',ci:true,suppliers:['楼氏电子','瑞声科技','索尼精密']},
    {prefix:'31',cat:'关键标准',ci:false,suppliers:['三星电机','村田制作所','德州仪器']},
    {prefix:'32',cat:'定制件',ci:true,suppliers:['欧菲光','舜宇光学','京东方']},
    {prefix:'33',cat:'通用件',ci:false,suppliers:['瀛通通讯','欣旺达','立讯精密']},
    {prefix:'34',cat:'芯片类',ci:false,suppliers:['高通','联发科','德州仪器']},
  ];
  var materials = [];
  var matNames = ['主芯片','声学驱动IC','蓝牙模块','电源管理IC','MEMS传感器','射频前端','存储芯片','显示屏模组','电池模组','光学镜头','连接器','被动元件','天线模组','保护器件','声学腔体','FPC排线','硅胶按键','屏蔽罩','导热材料','结构外壳'];
  var matCount = 12 + Math.floor(rng()*8);
  for(var i=0;i<matCount;i++){
    var mt = matTypes[i%5];
    var sup = mt.suppliers[Math.floor(rng()*mt.suppliers.length)];
    var demand = Math.floor(p.volume * (0.8+rng()*0.4));
    var stockup = Math.floor(demand * (0.5+rng()*0.5));
    var wip = Math.floor(stockup * (0.4+rng()*0.5));
    var complete = Math.floor(wip * (0.5+rng()*0.4));
    var transit = Math.floor(complete * (0.4+rng()*0.5));
    var receive = Math.floor(transit * (0.5+rng()*0.4));
    var iqc = Math.floor(receive * (0.7+rng()*0.3));
    var putaway = Math.floor(iqc * (0.8+rng()*0.2));
    var isSingle = rng()>0.7;
    var riskTags = [];
    if(rng()>0.7) riskTags.push('delay');
    if(rng()>0.85) riskTags.push('capacity');
    if(rng()>0.9) riskTags.push('quality');
    if(rng()>0.8) riskTags.push('material');
    if(isSingle && rng()>0.5) riskTags.push('single');
    if(rng()>0.9) riskTags.push('ecr');
    materials.push({
      partNo: mt.prefix+'10-'+ + String(i+1).padStart(4,'0'),
      name: matNames[i%matNames.length],
      category: mt.cat,
      ci: mt.ci?'CI件':'标准件',
      supplier: sup,
      singleSource: isSingle,
      demand: demand,
      stockup: stockup,
      wip: wip,
      complete: complete,
      transit: transit,
      receive: receive,
      iqc: iqc,
      putaway: putaway,
      commitDate: '2026-W'+(23+Math.floor(rng()*8)),
      riskTags: riskTags,
      otd: Math.floor(75+rng()*25),
      leadTime: 7+Math.floor(rng()*25)
    });
  }
  // 计算供应商汇总
  var supMap = {};
  materials.forEach(function(m){
    if(!supMap[m.supplier]) supMap[m.supplier] = {name:m.supplier, materials:[], totalDemand:0, totalPutaway:0, riskCount:0};
    supMap[m.supplier].materials.push(m);
    supMap[m.supplier].totalDemand += m.demand;
    supMap[m.supplier].totalPutaway += m.putaway;
    supMap[m.supplier].riskCount += m.riskTags.length;
  });
  var suppliers = Object.values(supMap);
  _supCache[pid] = {materials:materials, suppliers:suppliers};
  return _supCache[pid];
}

// ═══════════════ 渲染 ═══════════════
function initPage_supplier(){
  try{
  var fp = getFilteredProjects();
  var sel = document.getElementById('supplierProjectSelect');
  if(sel) fillProjectSelect(sel, fp);
  consumeDrillDown('supplierProjectSelect');
  var pid = sel ? sel.value : '';
  var p = pid ? projects.find(function(x){return x.id===pid;}) : null;
  if(!p && fp.length){ p=fp[0]; pid=p.id; if(sel) sel.value=pid; }
  if(!p) return;

  var data = getSupplierData(pid);
  var totalDemand = data.materials.reduce(function(s,m){return s+m.demand;},0);
  var totalPutaway = data.materials.reduce(function(s,m){return s+m.putaway;},0);
  var totalRisk = data.materials.reduce(function(s,m){return s+m.riskTags.length;},0);
  var avgOTD = Math.round(data.materials.reduce(function(s,m){return s+m.otd;},0)/data.materials.length);
  var totalTransit = data.materials.reduce(function(s,m){return s+m.transit;},0);
  var totalWIP = data.materials.reduce(function(s,m){return s+m.wip;},0);

  // 项目信息条
  var info = document.getElementById('spInfoBar');
  if(info) info.innerHTML =
    '<span class="sp-info-name">'+p.name+'</span>'
    +'<span class="sp-info-items">'
    +'<span class="sp-info-item"><b>客户</b> '+p.customer+'</span>'
    +'<span class="sp-info-item"><b>产品线</b> '+p.productLine+'</span>'
    +'<span class="sp-info-item"><b>阶段</b> '+p.engStage+'</span>'
    +'<span class="sp-info-item"><b>关键物料</b> '+data.materials.length+'</span>'
    +'<span class="sp-info-item"><b>供应商</b> '+data.suppliers.length+'</span>'
    +'<span class="sp-info-item"><b>风险项</b> <em style="color:var(--danger);font-style:normal;font-weight:700">'+totalRisk+'</em></span>'
    +'</span>';

  // KPI
  var kg = document.getElementById('spCards');
  if(kg) kg.innerHTML = [
    {label:'关键物料',value:data.materials.length,sub:'总计',accent:'blue'},
    {label:'供应商数',value:data.suppliers.length,sub:'参与项目',accent:'purple'},
    {label:'齐套入库率',value:(totalDemand?Math.round(totalPutaway/totalDemand*100):0)+'%',sub:totalPutaway.toLocaleString()+' / '+totalDemand.toLocaleString(),accent:totalPutaway/totalDemand>0.7?'green':'red'},
    {label:'平均OTD',value:avgOTD+'%',sub:'供应商准时交付',accent:avgOTD>90?'green':'amber'},
    {label:'在制/在途',value:(totalWIP+totalTransit).toLocaleString(),sub:'WIP '+totalWIP.toLocaleString()+' / 在途 '+totalTransit.toLocaleString(),accent:'cyan'},
    {label:'风险预警',value:totalRisk,sub:'需关注物料',accent:totalRisk>5?'red':'amber'},
  ].map(function(k){return '<div class="sp-card"><div class="sp-card-accent '+k.accent+'"></div><div class="sp-card-purpose"></div><div class="sp-card-label">'+k.label+'</div><div class="sp-card-value">'+k.value+'</div><div class="sp-card-sub">'+k.sub+'</div></div>';}).join('');

  // 链路进度
  renderPipeline(data);

  // 供应商风险概览
  renderSupplierRisk(data);

  // 关键物料明细表
  renderMaterialTable(data);

  // 催料行动
  renderExpedite(data);

  }catch(e){console.error('supplier init error:',e);}
}

function renderPipeline(data){
  var el = document.getElementById('spPipeline');
  if(!el) return;
  var keys = ['stockup','wip','complete','transit','receive','iqc','putaway'];
  var totalDemand = data.materials.reduce(function(s,m){return s+m.demand;},0)||1;
  el.innerHTML = PIPELINE_STAGES.map(function(st,i){
    var total = data.materials.reduce(function(s,m){return s+m[st.id];},0);
    var pct = Math.round(total/totalDemand*100);
    var color = pct>=80?'var(--success)':pct>=60?'var(--warning)':pct>=40?'var(--primary-light)':'var(--danger)';
    var barColor = pct>=80?'#22c55e':pct>=60?'#eab308':pct>=40?'#3b82f6':'#ef4444';
    return '<div class="sp-stage" data-stage="'+st.id+'">'
      +'<div class="sp-stage-name"><i class="fas '+st.icon+'"></i> '+st.name+'</div>'
      +'<div class="sp-stage-pct" style="color:'+color+'">'+pct+'%</div>'
      +'<div class="sp-stage-val">'+total.toLocaleString()+' <span style="font-size:10px;color:var(--text-muted)">/ '+totalDemand.toLocaleString()+'</span></div>'
      +'<div class="sp-stage-bar"><div class="sp-stage-bar-fill" style="width:'+pct+'%;background:'+barColor+'"></div></div>'
      +(i<PIPELINE_STAGES.length-1?'<div class="sp-stage-arrow">▸</div>':'')
      +'</div>';
  }).join('');
}

function renderSupplierRisk(data){
  var el = document.getElementById('spRiskGrid');
  if(!el) return;
  el.innerHTML = data.suppliers.sort(function(a,b){return b.riskCount-a.riskCount;}).map(function(s){
    var rate = s.totalDemand?Math.round(s.totalPutaway/s.totalDemand*100):0;
    var hCls = rate>=80?'green':rate>=60?'amber':'red';
    return '<div class="sp-risk-item">'
      +'<div class="sp-risk-item-title"><span>'+s.name+'</span><span class="x-dot '+hCls+'"></span><span style="font-weight:700;color:var(--'+(hCls==='green'?'success':hCls==='amber'?'warning':'danger')+')">'+rate+'%</span></div>'
      +'<div class="sp-risk-item-body">'
      +'<div>物料数 <b>'+s.materials.length+'</b> · 需求 <b>'+s.totalDemand.toLocaleString()+'</b></div>'
      +'<div>入库 <b>'+s.totalPutaway.toLocaleString()+'</b> · 风险 <b style="color:'+(s.riskCount>0?'var(--danger)':'var(--success)')+'">'+s.riskCount+'项</b></div>'
      +'</div></div>';
  }).join('');
}

function renderMaterialTable(data){
  var thead = document.getElementById('spTHead');
  var tbody = document.getElementById('spTBody');
  if(!thead||!tbody) return;
  thead.innerHTML = '<tr>'
    +'<th>料号</th><th>物料名称</th><th>分类</th><th>CI属性</th><th>供应商</th><th>单源</th>'
    +'<th>需求量</th><th>备料</th><th>在制</th><th>完工</th><th>在途</th><th>收货</th><th>IQC</th><th>入库</th>'
    +'<th>OTD%</th><th>交期承诺</th><th>风险</th>'
    +'</tr>';
  tbody.innerHTML = data.materials.sort(function(a,b){return b.riskTags.length-a.riskTags.length;}).map(function(m){
    var rate = m.demand?Math.round(m.putaway/m.demand*100):0;
    var rateColor = rate>=80?'var(--success)':rate>=60?'var(--warning)':'var(--danger)';
    var otdColor = m.otd>=95?'var(--success)':m.otd>=85?'var(--warning)':'var(--danger)';
    var riskHtml = m.riskTags.length ? m.riskTags.map(function(t){
      var rl = RISK_LABELS.find(function(r){return r.id===t;});
      return rl?'<span class="sp-risk-tag '+rl.color+'"><i class="fas '+rl.icon+'"></i> '+rl.name+'</span>':'';
    }).join('') : '<span style="color:var(--success);font-size:11px">✓ 无风险</span>';
    return '<tr>'
      +'<td><strong>'+m.partNo+'</strong></td>'
      +'<td>'+m.name+'</td>'
      +'<td>'+m.category+'</td>'
      +'<td><span class="sp-pill '+(m.ci==='CI件'?'amber':'blue')+'">'+m.ci+'</span></td>'
      +'<td>'+m.supplier+'</td>'
      +'<td>'+(m.singleSource?'<span class="sp-pill red">单源</span>':'<span style="color:var(--text-muted)">多源</span>')+'</td>'
      +'<td><b>'+m.demand.toLocaleString()+'</b></td>'
      +'<td>'+m.stockup.toLocaleString()+'</td>'
      +'<td>'+m.wip.toLocaleString()+'</td>'
      +'<td>'+m.complete.toLocaleString()+'</td>'
      +'<td>'+m.transit.toLocaleString()+'</td>'
      +'<td>'+m.receive.toLocaleString()+'</td>'
      +'<td>'+m.iqc.toLocaleString()+'</td>'
      +'<td style="color:'+rateColor+';font-weight:700">'+m.putaway.toLocaleString()+'</td>'
      +'<td style="color:'+otdColor+';font-weight:700">'+m.otd+'%</td>'
      +'<td>'+m.commitDate+'</td>'
      +'<td>'+riskHtml+'</td>'
      +'</tr>';
  }).join('');
  var countEl = document.getElementById('spTableCount');
  if(countEl) countEl.textContent = '共 '+data.materials.length+' 条';
}

function renderExpedite(data){
  var el = document.getElementById('spExpeditePanel');
  if(!el) return;
  var riskMats = data.materials.filter(function(m){return m.riskTags.length>0;});
  el.innerHTML = '<div class="sp-risk-title">催料行动看板</div>'+
    (riskMats.length===0
    ?'<div style="text-align:center;padding:30px;color:var(--success);"><i class="fas fa-circle-check" style="font-size:24px"></i><div style="margin-top:8px">当前无催料需求</div></div>'
    :'<div class="sp-risk-grid">'+riskMats.slice(0,12).map(function(m){
    var mainRisk = m.riskTags[0];
    var rl = RISK_LABELS.find(function(r){return r.id===mainRisk;});
    var action = mainRisk==='delay'?'催回交期承诺':mainRisk==='capacity'?'确认排产计划':mainRisk==='quality'?'推动IQC放行':mainRisk==='material'?'确认备料进度':mainRisk==='single'?'开发二供':'确认变更影响';
    var priority = m.otd<80?'紧急':m.otd<90?'重要':'关注';
    var pCls = priority==='紧急'?'red':priority==='重要'?'amber':'blue';
    return '<div class="sp-risk-item">'
      +'<div class="sp-risk-item-title"><span>'+m.partNo+'</span><span class="x-pill '+pCls+'">'+priority+'</span></div>'
      +'<div class="sp-risk-item-body">'
      +'<div><b>物料：</b>'+m.name+' ('+m.supplier+')</div>'
      +'<div><b>风险：</b>'+(rl?rl.name:mainRisk)+' <b>OTD：</b><span style="color:'+(m.otd<85?'var(--danger)':'var(--warning)')+'">'+m.otd+'%</span></div>'
      +'<div><b>行动：</b>'+action+'</div>'
      +'<div><b>承诺：</b>'+m.commitDate+'</div>'
      +'</div></div>';
  }).join('')+'</div>');
}

window.initPage_supplier = initPage_supplier;
})();
registerModule('supplier', initPage_supplier);
