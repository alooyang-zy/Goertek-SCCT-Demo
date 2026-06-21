// Module: progress — 项目进度跟踪 v9.0 (5阶段30节点 · SCOR加权 · 参照项目进度-参考)
(function(){

/* ═══════════════ Phase Config ═══════════════ */
var PHASES = [
  {id:1,icon:'📋',name:'需求→订单',desc:'预测·订单·交期·变更',color:'blue'},
  {id:2,icon:'📐',name:'计划→备料',desc:'S&OP·产能·MPS·齐套',color:'purple'},
  {id:3,icon:'📦',name:'采购→入库',desc:'PO·供方·来料·IQC',color:'green'},
  {id:4,icon:'🏭',name:'生产→成品',desc:'SMT·组装·测试·包装',color:'orange'},
  {id:5,icon:'🚚',name:'物流→客户',desc:'发运·关务·签收·售后',color:'red'},
];

/* ═══════════════ 30-Node KPI Config ═══════════════ */
var NODE_CONFIG = {
  '1-1':{name:'客户预测',phase:1,kpis:[
    {key:'forecastTotal',label:'客户预测总量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'forecastChange',label:'预测变动量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'uploadDelay',label:'预测上传延误天数',type:'time',unit:'天',fmt:'num',alertKey:'uploadDelay',alertY:1,alertR:3},
    {key:'forecastAccuracy',label:'预测准确率',type:'stat',unit:'%',fmt:'pct',alertKey:'forecastAccuracy',alertY:85,alertR:75,dir:'desc'},
    {key:'forecastWave',label:'预测波动率',type:'stat',unit:'%',fmt:'pct',alertKey:'forecastWave',alertY:15,alertR:25,dir:'asc'},
  ]},
  '1-2':{name:'内部需求',phase:1,kpis:[
    {key:'internalForecast',label:'内部预测总量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'forecastDeviation',label:'预测偏差量',type:'qty',unit:'K PCS',fmt:'num',alertKey:'forecastDeviation',alertY:500,alertR:1000},
    {key:'internalAccuracy',label:'内部预测准确率',type:'stat',unit:'%',fmt:'pct',alertKey:'internalAccuracy',alertY:85,alertR:75,dir:'desc'},
  ]},
  '1-3':{name:'客户订单',phase:1,kpis:[
    {key:'poTotal',label:'客户PO总数量',type:'qty',unit:'张',fmt:'num'},
    {key:'poUnreplied',label:'未回复PO数量',type:'qty',unit:'张',fmt:'num',alertKey:'poUnreplied',alertY:3,alertR:8},
    {key:'poReplyDays',label:'PO平均回复时效',type:'time',unit:'天',fmt:'num',alertKey:'poReplyDays',alertY:2,alertR:5},
    {key:'poLandRate',label:'PO落单率',type:'stat',unit:'%',fmt:'pct',alertKey:'poLandRate',alertY:90,alertR:80,dir:'desc'},
    {key:'poReplyTimely',label:'PO回复及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'poReplyTimely',alertY:90,alertR:80,dir:'desc'},
  ]},
  '1-4':{name:'内部订单',phase:1,kpis:[
    {key:'soTotal',label:'SO总数量',type:'qty',unit:'张',fmt:'num'},
    {key:'soBacklog',label:'未结SO积压量',type:'qty',unit:'张',fmt:'num',alertKey:'soBacklog',alertY:5,alertR:15},
    {key:'soOverdue',label:'超期未建SO数量',type:'qty',unit:'张',fmt:'num',alertKey:'soOverdue',alertY:2,alertR:5},
    {key:'soCreateTimely',label:'SO创建及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'soCreateTimely',alertY:90,alertR:80,dir:'desc'},
    {key:'soBacklogRate',label:'SO积压率',type:'stat',unit:'%',fmt:'pct',alertKey:'soBacklogRate',alertY:10,alertR:20,dir:'asc'},
  ]},
  '1-5':{name:'交期承诺',phase:1,kpis:[
    {key:'atpConfirmed',label:'已承诺SO数量',type:'qty',unit:'张',fmt:'num'},
    {key:'atpOverdue',label:'超期未承诺SO数量',type:'qty',unit:'张',fmt:'num',alertKey:'atpOverdue',alertY:3,alertR:8},
    {key:'atpHours',label:'ATP平均答复时效',type:'time',unit:'小时',fmt:'num',alertKey:'atpHours',alertY:4,alertR:8},
    {key:'atpTimely',label:'ATP答复及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'atpTimely',alertY:90,alertR:80,dir:'desc'},
    {key:'atpAchieve',label:'ATP承诺达成率',type:'stat',unit:'%',fmt:'pct',alertKey:'atpAchieve',alertY:88,alertR:78,dir:'desc'},
  ]},
  '1-6':{name:'需求变更',phase:1,kpis:[
    {key:'changeWoImpact',label:'变更影响工单数',type:'qty',unit:'张',fmt:'num'},
    {key:'changeUnclosed',label:'未关闭变更数量',type:'qty',unit:'项',fmt:'num',alertKey:'changeUnclosed',alertY:3,alertR:8},
    {key:'changeCloseDays',label:'变更平均关闭周期',type:'time',unit:'天',fmt:'num',alertKey:'changeCloseDays',alertY:5,alertR:10},
    {key:'changeRespTimely',label:'变更响应及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'changeRespTimely',alertY:88,alertR:75,dir:'desc'},
  ]},
  '2-1':{name:'S&OP计划',phase:2,kpis:[
    {key:'sopPlanQty',label:'S&OP计划产量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'sopDeviation',label:'计划与实际偏差量',type:'qty',unit:'K PCS',fmt:'num',alertKey:'sopDeviation',alertY:500,alertR:1500},
    {key:'sopDelay',label:'S&OP评审发布滞后',type:'time',unit:'天',fmt:'num',alertKey:'sopDelay',alertY:1,alertR:3},
    {key:'sopAchieve',label:'S&OP计划达成率',type:'stat',unit:'%',fmt:'pct',alertKey:'sopAchieve',alertY:88,alertR:78,dir:'desc'},
  ]},
  '2-2':{name:'产能计划',phase:2,kpis:[
    {key:'planCapacity',label:'计划产能量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'availCapacity',label:'实际可用产能量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'capacityGap',label:'产能缺口数量',type:'qty',unit:'K PCS',fmt:'num',alertKey:'capacityGap',alertY:500,alertR:1500},
    {key:'capacityLoad',label:'产能负荷率',type:'stat',unit:'%',fmt:'pct',alertKey:'capacityLoad',alertY:90,alertR:100,dir:'asc'},
    {key:'capacityUtil',label:'产能利用率',type:'stat',unit:'%',fmt:'pct',alertKey:'capacityUtil',alertY:70,alertR:60,dir:'desc'},
  ]},
  '2-3':{name:'主生产计划',phase:2,kpis:[
    {key:'mpsPlanQty',label:'MPS计划产量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'mpsUnachievedWo',label:'MPS未达成工单数',type:'qty',unit:'张',fmt:'num',alertKey:'mpsUnachievedWo',alertY:3,alertR:8},
    {key:'mpsDelay',label:'MPS发布滞后天数',type:'time',unit:'天',fmt:'num',alertKey:'mpsDelay',alertY:1,alertR:3},
    {key:'mpsAchieve',label:'MPS达成率',type:'stat',unit:'%',fmt:'pct',alertKey:'mpsAchieve',alertY:88,alertR:78,dir:'desc'},
  ]},
  '2-4':{name:'委外计划',phase:2,kpis:[
    {key:'outsourceTotal',label:'委外任务总数量',type:'qty',unit:'张',fmt:'num'},
    {key:'outsourceOverdue',label:'超期未回料数量',type:'qty',unit:'张',fmt:'num',alertKey:'outsourceOverdue',alertY:2,alertR:5},
    {key:'outsourceReturnDelay',label:'委外平均回料延误',type:'time',unit:'天',fmt:'num',alertKey:'outsourceReturnDelay',alertY:2,alertR:5},
    {key:'outsourceTimely',label:'委外回料及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'outsourceTimely',alertY:88,alertR:78,dir:'desc'},
  ]},
  '2-5':{name:'物料计划',phase:2,kpis:[
    {key:'mrpSuggestTotal',label:'MRP建议总数量',type:'qty',unit:'条',fmt:'num'},
    {key:'mrpBacklogPo',label:'未转PO积压数量',type:'qty',unit:'条',fmt:'num',alertKey:'mrpBacklogPo',alertY:5,alertR:15},
    {key:'prApproveHours',label:'PR平均审批时效',type:'time',unit:'小时',fmt:'num',alertKey:'prApproveHours',alertY:4,alertR:8},
    {key:'mrpExecRate',label:'MRP建议执行率',type:'stat',unit:'%',fmt:'pct',alertKey:'mrpExecRate',alertY:88,alertR:78,dir:'desc'},
  ]},
  '2-6':{name:'物料齐套',phase:2,kpis:[
    {key:'kitFullWo',label:'齐套工单数量',type:'qty',unit:'张',fmt:'num'},
    {key:'shortageWo',label:'缺料工单数量',type:'qty',unit:'张',fmt:'num',alertKey:'shortageWo',alertY:5,alertR:15},
    {key:'shortagePN',label:'缺料料号数',type:'qty',unit:'个',fmt:'num',alertKey:'shortagePN',alertY:3,alertR:10},
    {key:'shortageWaitDays',label:'缺料工单平均等待天',type:'time',unit:'天',fmt:'num',alertKey:'shortageWaitDays',alertY:3,alertR:7},
    {key:'woKitRate',label:'工单齐套率',type:'stat',unit:'%',fmt:'pct',alertKey:'woKitRate',alertY:88,alertR:78,dir:'desc'},
  ]},
  '3-1':{name:'采购订单',phase:3,kpis:[
    {key:'openPoTotal',label:'未结PO总数量',type:'qty',unit:'张',fmt:'num'},
    {key:'poOverdueRelease',label:'超期未下达PO数量',type:'qty',unit:'张',fmt:'num',alertKey:'poOverdueRelease',alertY:3,alertR:8},
    {key:'poReleaseDays',label:'PO下达平均时效',type:'time',unit:'天',fmt:'num',alertKey:'poReleaseDays',alertY:2,alertR:5},
    {key:'poReleaseTimely',label:'采购订单下达及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'poReleaseTimely',alertY:90,alertR:80,dir:'desc'},
    {key:'supplierConfirmRate',label:'供应商交期确认率',type:'stat',unit:'%',fmt:'pct',alertKey:'supplierConfirmRate',alertY:90,alertR:80,dir:'desc'},
  ]},
  '3-2':{name:'供方协同',phase:3,kpis:[
    {key:'supplierOTD',label:'供应商OTD',type:'stat',unit:'%',fmt:'pct',alertKey:'supplierOTD',alertY:90,alertR:80,dir:'desc'},
    {key:'supplierDelayDays',label:'供方平均延迟天数',type:'time',unit:'天',fmt:'num',alertKey:'supplierDelayDays',alertY:3,alertR:7},
    {key:'singleSourceCnt',label:'单源风险料号数',type:'qty',unit:'个',fmt:'num',alertKey:'singleSourceCnt',alertY:3,alertR:8},
    {key:'supplierRespTimely',label:'供应商响应及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'supplierRespTimely',alertY:88,alertR:78,dir:'desc'},
  ]},
  '3-3':{name:'来料预测',phase:3,kpis:[
    {key:'incomingPlan',label:'预计来料量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'incomingGap',label:'来料缺口量',type:'qty',unit:'K PCS',fmt:'num',alertKey:'incomingGap',alertY:200,alertR:500},
    {key:'incomingOnTime',label:'来料准时率',type:'stat',unit:'%',fmt:'pct',alertKey:'incomingOnTime',alertY:88,alertR:78,dir:'desc'},
  ]},
  '3-4':{name:'收货入库',phase:3,kpis:[
    {key:'receiveTotal',label:'收货总批次',type:'qty',unit:'批',fmt:'num'},
    {key:'receiveOverdue',label:'超期未收货批次',type:'qty',unit:'批',fmt:'num',alertKey:'receiveOverdue',alertY:3,alertR:8},
    {key:'receiveHours',label:'平均收货时效',type:'time',unit:'小时',fmt:'num',alertKey:'receiveHours',alertY:4,alertR:8},
  ]},
  '3-5':{name:'IQC检验',phase:3,kpis:[
    {key:'iqcTotal',label:'IQC检验总批次',type:'qty',unit:'批',fmt:'num'},
    {key:'iqcFail',label:'不合格批次数',type:'qty',unit:'批',fmt:'num',alertKey:'iqcFail',alertY:2,alertR:5},
    {key:'iqcHours',label:'平均检验时效',type:'time',unit:'小时',fmt:'num',alertKey:'iqcHours',alertY:8,alertR:16},
    {key:'iqcPassRate',label:'IQC合格率',type:'stat',unit:'%',fmt:'pct',alertKey:'iqcPassRate',alertY:95,alertR:90,dir:'desc'},
  ]},
  '3-6':{name:'来料异常',phase:3,kpis:[
    {key:'mrbfindCnt',label:'MRB发现数量',type:'qty',unit:'件',fmt:'num'},
    {key:'mrbPending',label:'待处理MRB数量',type:'qty',unit:'件',fmt:'num',alertKey:'mrbPending',alertY:2,alertR:5},
    {key:'mrbDays',label:'MRB平均处理时效',type:'time',unit:'天',fmt:'num',alertKey:'mrbDays',alertY:3,alertR:7},
    {key:'mrbCloseRate',label:'MRB闭环率',type:'stat',unit:'%',fmt:'pct',alertKey:'mrbCloseRate',alertY:88,alertR:78,dir:'desc'},
  ]},
  '4-1':{name:'SMT贴片',phase:4,kpis:[
    {key:'smtPlanQty',label:'SMT计划产量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'smtActualQty',label:'SMT实际产量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'smtDefectPPM',label:'SMT不良PPM',type:'qty',unit:'PPM',fmt:'num',alertKey:'smtDefectPPM',alertY:500,alertR:1000},
    {key:'smtYield',label:'SMT直通率',type:'stat',unit:'%',fmt:'pct',alertKey:'smtYield',alertY:95,alertR:90,dir:'desc'},
  ]},
  '4-2':{name:'组装线',phase:4,kpis:[
    {key:'assyPlanQty',label:'组装计划产量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'assyActualQty',label:'组装实际产量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'assyLineBal',label:'产线平衡率',type:'stat',unit:'%',fmt:'pct',alertKey:'assyLineBal',alertY:85,alertR:75,dir:'desc'},
    {key:'assyYield',label:'组装直通率',type:'stat',unit:'%',fmt:'pct',alertKey:'assyYield',alertY:96,alertR:92,dir:'desc'},
  ]},
  '4-3':{name:'测试工序',phase:4,kpis:[
    {key:'testPlanQty',label:'测试计划量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'testDefect',label:'测试不良数',type:'qty',unit:'台',fmt:'num',alertKey:'testDefect',alertY:50,alertR:150},
    {key:'testYield',label:'测试良率',type:'stat',unit:'%',fmt:'pct',alertKey:'testYield',alertY:95,alertR:90,dir:'desc'},
  ]},
  '4-4':{name:'FQC检验',phase:4,kpis:[
    {key:'fqcTotal',label:'FQC检验总数',type:'qty',unit:'台',fmt:'num'},
    {key:'fqcFail',label:'FQC不良数',type:'qty',unit:'台',fmt:'num',alertKey:'fqcFail',alertY:10,alertR:30},
    {key:'fqcPassRate',label:'FQC合格率',type:'stat',unit:'%',fmt:'pct',alertKey:'fqcPassRate',alertY:97,alertR:94,dir:'desc'},
  ]},
  '4-5':{name:'包装入库',phase:4,kpis:[
    {key:'packPlanQty',label:'包装计划量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'packBacklog',label:'待包装积压量',type:'qty',unit:'K PCS',fmt:'num',alertKey:'packBacklog',alertY:1,alertR:3},
    {key:'packTimely',label:'包装及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'packTimely',alertY:95,alertR:90,dir:'desc'},
  ]},
  '4-6':{name:'在制库存',phase:4,kpis:[
    {key:'wipTotal',label:'在制总量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'wipAging',label:'超期在制量',type:'qty',unit:'K PCS',fmt:'num',alertKey:'wipAging',alertY:0.5,alertR:2},
    {key:'wipTurnover',label:'在制周转天数',type:'time',unit:'天',fmt:'num',alertKey:'wipTurnover',alertY:5,alertR:10},
  ]},
  '5-1':{name:'发运计划',phase:5,kpis:[
    {key:'shipPlanQty',label:'发运计划量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'shipUrgent',label:'紧急发运批次数',type:'qty',unit:'批',fmt:'num',alertKey:'shipUrgent',alertY:3,alertR:8},
    {key:'shipPlanAchieve',label:'发运计划达成率',type:'stat',unit:'%',fmt:'pct',alertKey:'shipPlanAchieve',alertY:92,alertR:85,dir:'desc'},
  ]},
  '5-2':{name:'关务处理',phase:5,kpis:[
    {key:'customTotal',label:'报关总批数',type:'qty',unit:'批',fmt:'num'},
    {key:'customDelay',label:'报关延误批数',type:'qty',unit:'批',fmt:'num',alertKey:'customDelay',alertY:2,alertR:5},
    {key:'customHours',label:'关务平均处理时效',type:'time',unit:'小时',fmt:'num',alertKey:'customHours',alertY:24,alertR:48},
  ]},
  '5-3':{name:'物流运输',phase:5,kpis:[
    {key:'logisTotal',label:'物流运输总批数',type:'qty',unit:'批',fmt:'num'},
    {key:'logisDelay',label:'运输延迟批数',type:'qty',unit:'批',fmt:'num',alertKey:'logisDelay',alertY:2,alertR:5},
    {key:'logisOTD',label:'物流准时率',type:'stat',unit:'%',fmt:'pct',alertKey:'logisOTD',alertY:92,alertR:85,dir:'desc'},
  ]},
  '5-4':{name:'客户交货',phase:5,kpis:[
    {key:'custDeliveryTotal',label:'客户交付总量',type:'qty',unit:'K PCS',fmt:'num'},
    {key:'custShort',label:'交付缺少数',type:'qty',unit:'K PCS',fmt:'num',alertKey:'custShort',alertY:0.2,alertR:1},
    {key:'shipOutTimely',label:'发运及时率',type:'stat',unit:'%',fmt:'pct',alertKey:'shipOutTimely',alertY:90,alertR:80,dir:'desc'},
  ]},
  '5-5':{name:'客户签收',phase:5,kpis:[
    {key:'signedCnt',label:'已签收单数',type:'qty',unit:'单',fmt:'num'},
    {key:'signOverdue',label:'超期未签收单数',type:'qty',unit:'单',fmt:'num',alertKey:'signOverdue',alertY:2,alertR:5},
    {key:'signDelayDays',label:'签收平均延误天数',type:'time',unit:'天',fmt:'num',alertKey:'signDelayDays',alertY:2,alertR:5},
    {key:'otd',label:'客户订单准时交货率(OTD)',type:'stat',unit:'%',fmt:'pct',alertKey:'otd',alertY:92,alertR:85,dir:'desc'},
  ]},
  '5-6':{name:'售后处理',phase:5,kpis:[
    {key:'rmaTotal',label:'RMA申请数量',type:'qty',unit:'件',fmt:'num'},
    {key:'rmaPending',label:'已接收待处理数量',type:'qty',unit:'件',fmt:'num',alertKey:'rmaPending',alertY:3,alertR:10},
    {key:'rmaDays',label:'RMA平均处理时效',type:'time',unit:'天',fmt:'num',alertKey:'rmaDays',alertY:5,alertR:10},
    {key:'rmaCloseTimely',label:'RMA及时关闭率',type:'stat',unit:'%',fmt:'pct',alertKey:'rmaCloseTimely',alertY:88,alertR:78,dir:'desc'},
  ]},
};

/* ═══════════════ Data Generation ═══════════════ */
var _prgCache = {};

function hashStr(str){var h=5381;for(var i=0;i<str.length;i++)h=((h<<5)+h)+str.charCodeAt(i);return (h>>>0);}
function sRand(seed,min,max,decimal){
  var s=seed;s=(s*1664525+1013904223)&0xffffffff;var r=(s>>>0)/0xffffffff;
  var v=min+r*(max-min);return decimal?parseFloat(v.toFixed(decimal)):Math.round(v);
}

function generateProjectData(proj){
  if(_prgCache[proj.id]) return _prgCache[proj.id];
  var base=hashStr(proj.id);
  var isNPI=proj.lifecycle==='NPI',isRamp=proj.lifecycle==='Ramp-up';
  var perfMod=isNPI?0.82:isRamp?0.91:0.96;
  var d={};
  Object.keys(NODE_CONFIG).forEach(function(nk,ni){
    var cfg=NODE_CONFIG[nk],s0=base+ni*997,kpiVals={};
    cfg.kpis.forEach(function(kpi,ki){
      var s2=s0+ki*113,val;
      if(kpi.fmt==='pct'){
        val=sRand(s2,Math.round(70*perfMod),Math.round(99*perfMod),1);
      }else if(kpi.unit==='K PCS') val=sRand(s2,50,8000);
      else if(kpi.unit==='天') val=sRand(s2,0,12,1);
      else if(kpi.unit==='小时') val=sRand(s2,1,16,1);
      else val=sRand(s2,0,200);
      kpiVals[kpi.key]=val;
    });
    var worst='g';cfg.kpis.forEach(function(k){if(!k.alertKey)return;
      var l=getKpiLevel(kpiVals[k.key],k);if(l==='r')worst='r';else if(l==='y'&&worst!=='r')worst='y';});
    d[nk]={kpiVals:kpiVals,status:worst};
  });
  _prgCache[proj.id]=d;
  return d;
}

function getKpiLevel(val,kpi){
  if(!kpi.alertKey)return'g';
  var y=kpi.alertY,r=kpi.alertR;
  if(kpi.dir==='asc'){if(val>=r)return'r';if(val>=y)return'y';return'g';}
  else{if(val<=r)return'r';if(val<=y)return'y';return'g';}
}

function formatVal(val,kpi){
  if(kpi.fmt==='pct')return val+'%';
  if(kpi.unit==='K PCS')return val.toLocaleString()+' K';
  return val+' '+kpi.unit;
}

/* ═══════════════ State ═══════════════ */
var ringChart=null;
var _phCollapsed={};

/* ═══════════════ Entry ═══════════════ */
function renderProgressPage(){
  var fp=getFilteredProjects();
  var sel=document.getElementById('progressProjectSelect');
  if(sel){var cur=sel.value;
    sel.innerHTML=fp.map(function(p){return '<option value="'+p.id+'">'+p.name+' ['+p.bg+'·'+p.customer+']</option>'}).join('');
    if(cur&&fp.some(function(p){return p.id==cur}))sel.value=cur;
    else if(fp.length)sel.value=fp[0].id;
  }
  // 消费穿透跳转上下文
  consumeDrillDown('progressProjectSelect');
  var pid=sel?sel.value:'';
  var proj=pid?fp.find(function(p){return p.id==pid}):null;
  if(!proj&&fp.length){proj=fp[0];if(sel)sel.value=proj.id;}
  if(proj) loadProject(proj);
}

function loadProject(proj){
  if(!proj)return;
  var data=generateProjectData(proj);

  // Hero
  var heroName=document.getElementById('prgHeroName');
  if(heroName)heroName.textContent=proj.name||'--';
  var heroPills=document.getElementById('prgHeroPills');
  if(heroPills)heroPills.innerHTML=[
    {l:'BG',v:proj.bg},{l:'BU',v:proj.bu},{l:'客户',v:proj.customer},{l:'产品',v:proj.productLine},{l:'阶段',v:proj.engStage},{l:'生命周期',v:proj.lifecycle}
  ].map(function(x){return '<span class="sc-hero-pill"><b>'+x.l+':</b> '+(x.v||'--')+'</span>'}).join('');

  // Count statuses
  var gC=0,yC=0,rC=0,alerts=[],total=0;
  Object.keys(NODE_CONFIG).forEach(function(nk){
    var cfg=NODE_CONFIG[nk],nd=data[nk];total++;
    if(nd.status==='g')gC++;else if(nd.status==='y')yC++;else rC++;
    cfg.kpis.forEach(function(kpi){
      if(!kpi.alertKey)return;var l=getKpiLevel(nd.kpiVals[kpi.key],kpi);
      if(l==='r'||l==='y')alerts.push({nodeName:cfg.name,kpiLabel:kpi.label,val:nd.kpiVals[kpi.key],unit:kpi.unit,fmt:kpi.fmt,level:l,phase:cfg.phase});
    });
  });
  var score=Math.round((gC*100+yC*50+rC*10)/total);

  // Overview cards
  var ov=document.getElementById('prgOverview');
  ov.innerHTML=[
    {l:'供应链节点总数',v:total,sub:'覆盖5大阶段·30个核心节点',c:'blue'},
    {l:'节点正常',v:gC,sub:'绿色健康节点',c:'green'},
    {l:'节点预警',v:yC,sub:'需关注处理',c:'amber'},
    {l:'节点异常',v:rC,sub:'需立即处置',c:'red'},
    {l:'综合健康评分',v:score,sub:'满分100·SCOR加权',c:'purple'},
    {l:'待处理异常',v:alerts.length,sub:'跨节点异常事项',c:'orange'},
  ].map(function(c){return '<div class="prg-ov-card '+c.c+'"><div class="prg-ov-label">'+c.l+'</div><div class="prg-ov-value">'+c.v+'</div><div class="prg-ov-sub">'+c.sub+'</div></div>'}).join('');

  // Phase panels
  var pc=document.getElementById('prgPhasesCol');
  pc.innerHTML=PHASES.map(function(ph){
    var phNodes=Object.keys(NODE_CONFIG).filter(function(k){return NODE_CONFIG[k].phase===ph.id});
    var pgC=0,pyC=0,prC=0;
    phNodes.forEach(function(nk){var s=data[nk].status;if(s==='g')pgC++;else if(s==='y')pyC++;else prC++;});

    // Progress bar
    var pbhtml='<div class="prg-phase-progress" id="ph'+ph.id+'-progress">'+phNodes.map(function(nk,i){
      var nd=data[nk],lv=nd.status,cfg=NODE_CONFIG[nk];
      var out='<div class="prg-pb-step"><div class="prg-pb-inner"><div class="prg-pb-dot '+lv+'">'+(i+1)+'</div><div class="prg-pb-label">'+cfg.name+'</div></div>';
      if(i<phNodes.length-1){var nl=data[phNodes[i+1]].status,ll=(lv==='r'||nl==='r')?'r':(lv==='y'||nl==='y')?'y':'g';out+='<div class="prg-pb-line '+ll+'"></div>';}
      out+='</div>';return out;
    }).join('')+'</div>';

    // Badges
    var badges='';
    if(pgC)badges+='<span class="prg-phase-badge g">正常 '+pgC+'</span>';
    if(pyC)badges+='<span class="prg-phase-badge y">预警 '+pyC+'</span>';
    if(prC)badges+='<span class="prg-phase-badge r">异常 '+prC+'</span>';

    // Node cards
    var body='<div class="prg-phase-body" id="ph'+ph.id+'-body">'+phNodes.map(function(nk,i){
      var cfg=NODE_CONFIG[nk],nd=data[nk];
      var sIcon=nd.status==='g'?'✓':nd.status==='y'?'!':'✕';
      var groups={qty:[],time:[],stat:[]};
      cfg.kpis.forEach(function(k){groups[k.type].push(k);});
      var kpiHTML='';
      ['qty','time','stat'].forEach(function(typ){
        var kpis=groups[typ];
        if(!kpis.length)return;
        var titles={qty:'📦 数量指标',time:'⏱ 时效指标',stat:'📊 统计指标'};
        kpiHTML+='<div class="prg-kpi-section"><div class="prg-kpi-section-title">'+titles[typ]+'</div>';
        kpis.forEach(function(kpi){
          var val=nd.kpiVals[kpi.key],lv=kpi.alertKey?getKpiLevel(val,kpi):'g';
          var rowCls=lv==='r'?'alert-row':lv==='y'?'warn-row':'';
          var vCls=typ==='time'?(lv==='g'?'blue':lv):lv;
          kpiHTML+='<div class="prg-kpi-row '+rowCls+'"><span class="prg-kpi-label" title="'+kpi.label+'">'+kpi.label+'</span><span class="prg-kpi-val '+vCls+'">'+formatVal(val,kpi)+'</span></div>';
          if(kpi.fmt==='pct'){var bp=Math.min(val,100);kpiHTML+='<div class="prg-kpi-bar-wrap"><div class="prg-kpi-bar '+lv+'" style="width:'+bp+'%"></div></div>';}
        });
        kpiHTML+='</div>';
      });
      // Alert tags
      var alertKpis=cfg.kpis.filter(function(k){if(!k.alertKey)return false;var l=getKpiLevel(nd.kpiVals[k.key],k);return l==='r'||l==='y';});
      var tagsHTML='';
      if(alertKpis.length){
        tagsHTML='<div class="prg-node-tags">'+alertKpis.map(function(k){
          var l=getKpiLevel(nd.kpiVals[k.key],k);return '<span class="prg-node-tag '+l+'">'+(l==='r'?'🚨':'⚠️')+' '+k.label+'</span>';
        }).join('')+'</div>';
      }
      var isLastInRow=(i+1)%3===0;
      return '<div class="prg-node'+(isLastInRow?' no-right':'')+'"><div class="prg-node-header"><div><div class="prg-node-id">节点 '+nk+'</div><div class="prg-node-name">'+cfg.name+'</div></div><div class="prg-node-status '+nd.status+'">'+sIcon+'</div></div>'+kpiHTML+tagsHTML+'</div>';
    }).join('')+'</div>';

    return '<div class="prg-phase ph'+ph.id+'" id="phase-'+ph.id+'"><div class="prg-phase-header" onclick="window._prgTogglePhase('+ph.id+')"><div class="prg-phase-icon">'+ph.icon+'</div><div class="prg-phase-title"><div class="prg-phase-name">阶段'+ph.id+'：'+ph.name+'</div><div class="prg-phase-desc">'+ph.desc+'</div></div><div class="prg-phase-badges" id="ph'+ph.id+'-badges">'+badges+'</div><div class="prg-phase-toggle">▾</div></div>'+pbhtml+body+'</div>';
  }).join('');

  // Score ring
  updateScoreRing(gC,yC,rC,score,alerts.length);

  // Alert list
  renderAlertList(alerts);
}

/* ═══════════════ Score Ring ═══════════════ */
function updateScoreRing(gC,yC,rC,score,alertCnt){
  var ctx=document.getElementById('prgScoreRing');
  if(!ctx)return;
  var cctx=ctx.getContext('2d');
  if(!ringChart){
    ringChart=new Chart(cctx,{type:'doughnut',
      data:{datasets:[{data:[0,0,0],backgroundColor:['#22c55e','#eab308','#ef4444'],borderWidth:0}]},
      options:{cutout:'75%',responsive:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return ['正常','预警','异常'][ctx.dataIndex]+': '+ctx.parsed}}}}}
    });
  }
  ringChart.data.datasets[0].data=[gC,yC,rC];
  ringChart.update();
  var rs=document.getElementById('prgRingScore');
  rs.textContent=score;rs.className='prg-ring-score '+(rC>0?'r':yC>0?'y':'g');
  document.getElementById('prgRingG').textContent=gC;
  document.getElementById('prgRingY').textContent=yC;
  document.getElementById('prgRingR').textContent=rC;
  document.getElementById('prgRingAlerts').textContent=alertCnt;
}

/* ═══════════════ Alert List ═══════════════ */
function renderAlertList(alerts){
  var el=document.getElementById('prgAlertList');
  var cnt=document.getElementById('prgAlertCount');
  if(cnt)cnt.textContent=alerts.length;
  if(!alerts.length){el.innerHTML='<div style="text-align:center;color:var(--success);padding:20px;font-size:12px">当前项目无异常事项</div>';return;}
  alerts.sort(function(a,b){return (a.level==='r'?0:1)-(b.level==='r'?0:1)});
  el.innerHTML=alerts.slice(0,20).map(function(a){
    var displayVal=a.fmt==='pct'?a.val+'%':a.val+' '+a.unit;
    return '<div class="prg-alert-item"><div class="prg-alert-dot '+a.level+'"></div><div class="prg-alert-content"><div class="prg-alert-item-title">'+a.nodeName+' · '+a.kpiLabel+'</div><div class="prg-alert-item-desc">当前值：<strong>'+displayVal+'</strong></div></div><span class="prg-alert-tag '+a.level+'">'+(a.level==='r'?'🚨异常':'⚠️预警')+'</span></div>';
  }).join('');
}

/* ═══════════════ Toggle Phase ═══════════════ */
window._prgTogglePhase = function(ph){
  if(_phCollapsed[ph]===undefined)_phCollapsed[ph]=false;
  _phCollapsed[ph]=!_phCollapsed[ph];
  var panel=document.getElementById('phase-'+ph);
  var body=document.getElementById('ph'+ph+'-body');
  var prog=document.getElementById('ph'+ph+'-progress');
  var toggle=panel?panel.querySelector('.prg-phase-toggle'):null;
  if(_phCollapsed[ph]){
    if(body)body.style.display='none';
    if(prog)prog.style.display='none';
    if(toggle)toggle.textContent='▸';
    if(panel)panel.classList.add('collapsed');
  }else{
    if(body)body.style.display='';
    if(prog)prog.style.display='';
    if(toggle)toggle.textContent='▾';
    if(panel)panel.classList.remove('collapsed');
  }
};

window.renderProgressPage = renderProgressPage;
window.initPage_progress = renderProgressPage;
})();
registerModule('progress', renderProgressPage);
