// Module: risk — 风险雷达预警 v10.26 (双Tab·37字段风险目录·预警事件V2增强·双列重塑)
(function(){

// ===================== Risk Data =====================
var RISK_STUB = function(code,title,domain,cat,level,desc,impact){
  var seed=0;for(var si=0;si<code.length;si++)seed=(seed*31+code.charCodeAt(si))&0xffff;
  function _rng(n){seed=(seed*1664525+1013904223)&0xffffffff;return(seed>>>0)/0xffffffff;}
  var eCount=2+Math.floor(_rng(3)*3);

  // 量化评估
  var P=[2,3,4,5,3,4,5,4,3,2][Math.floor(_rng(5)*10)];
  var I=[2,3,4,5,4,5,3,4,5,3][Math.floor(_rng(7)*10)];
  var score=P*I;

  // 预警事件 V2
  var kpiPool=[
    {kpi:'批次库龄',unit:'天',dir:'desc',threshold:90,code:'AG',objType:'批次级',objScope:'所有原材料在库批次，含呆滞仓/普通仓/退货暂存仓；排除已冻结报废批次',formula:'库龄 = 当日 − GR入库日期；近7日出库量 = 该批次过去7个自然日WMS出库记录合计',auxKpis:'①近7日出库数量(件) ②在库数量(件) ③单价(元) ④估算Aging金额(万元) ⑤所属料号未来4周MRP需求量',health:'GR日期缺失时跳过并生成数据质量告警；出库数据缺失标注"异常"'},
    {kpi:'预测准确率',unit:'%',dir:'asc',threshold:85,code:'FA',objType:'项目级',objScope:'所有活跃项目未来4周客户滚动预测 vs 实际订单',formula:'FA% = (1 - |预测−实际|/实际) × 100%；按周/项目/产品线三维统计',auxKpis:'①实际订单量(K) ②预测偏差量(K) ③MAPE(%) ④近4周FA趋势',health:'实际订单为0时跳过该周期；预测数据缺失超过2周触发数据完整性告警'},
    {kpi:'OTD达成率',unit:'%',dir:'asc',threshold:92,code:'OT',objType:'项目级',objScope:'所有工单按承诺交期 vs 实际交付日期',formula:'OTD = 准时交付工单数 / 总交付工单数 × 100%',auxKpis:'①准时交付数 ②延迟交付数 ③平均延迟天数 ④按客户维度OTD',health:'承诺日期未维护的工单排除并告警；实际交付日期缺失暂按"未知"标记'},
    {kpi:'齐套率',unit:'%',dir:'asc',threshold:88,code:'KT',objType:'项目级',objScope:'所有生产工单的物料BOM齐套状态',formula:'齐套率 = 物料全覆盖工单数 / 总生产工单数 × 100%',auxKpis:'①缺料料号数 ②TOP5缺料物料 ③供应商承诺交期 ④齐套缺口趋势',health:'BOM未维护或缺失物料的工单排除并告警'},
    {kpi:'供应商交付偏差',unit:'天',dir:'desc',threshold:3,code:'SD',objType:'物料级',objScope:'所有PO已确认交期的物料行项，排除服务类PO',formula:'交付偏差 = 实际到货日期 − 供应商承诺交期；聚合至物料级均值',auxKpis:'①承诺交期 ②实际到货日期 ③偏差天数 ④供应商OTD排名',health:'承诺交期缺失的PO排除并生成数据质量工单'},
    {kpi:'来料合格率',unit:'%',dir:'asc',threshold:95,code:'IQ',objType:'物料级',objScope:'所有IQC检验批次的合格判定结果',formula:'合格率 = 合格批次数 / 总检验批次数 × 100%',auxKpis:'①不合格批次数 ②主要不良类型TOP3 ③供应商合格率排名 ④MRB处置周期',health:'检验结果缺失的批次排除并告警；巡检未完成的供应商标注"待检"'},
    {kpi:'物流准时率',unit:'%',dir:'asc',threshold:92,code:'LG',objType:'项目级',objScope:'所有发货批次(厂→客户/厂→厂)的准时达成率',formula:'物流准时率 = 准时到达批次数 / 总发货批次数 × 100%',auxKpis:'①延迟批次数 ②平均延迟天数 ③承运商准时率排名 ④空运紧急使用次数',health:'发货记录缺失的批次生成数据完整性提醒；运输中无GPS的标注"追踪缺失"'},
    {kpi:'产能利用率',unit:'%',dir:'asc',threshold:85,code:'CU',objType:'产线级',objScope:'SMT/组装/测试三大类产线的计划产能 vs 实际产出',formula:'利用率 = 实际产出 / 计划产能 × 100%',auxKpis:'①计划产能 ②实际产出 ③计划外停机时间 ④OEE综合效率',health:'产能数据缺失站别排除并告警；停线>30分钟自动记录原因'},
  ];
  var prefixMap={AG:'批次',FA:'预测',OT:'交付',KT:'齐套',SD:'供应',IQ:'来料',LG:'物流',CU:'产能'};
  var events=[];
  for(var e=0;e<eCount;e++){
    var s2=(seed+e*7919)&0xffff;
    var kpi=kpiPool[Math.floor(s2/65535*kpiPool.length)];
    var actualVal=Math.round(kpi.dir==='asc'?50+_rng(8)*48:Math.round(_rng(7)*50));
    var threshold=kpi.threshold;
    var gap=kpi.dir==='asc'?threshold-actualVal:actualVal-threshold;
    var light=gap<=0?'g':gap<=Math.abs(threshold*0.1)?'y':'r';
    var woCount=light==='r'?2+Math.floor(s2/16384):light==='y'?1+Math.floor(s2/32768):0;
    var wos=[];
    for(var w=0;w<woCount;w++)wos.push({id:'WO-R-'+code+'-E'+(e+1)+'-0'+(w+1),title:'处置:'+kpi.kpi+'异常',status:['处理中','待处理','已完成'][(s2+w*7)%3],step:1+Math.floor(s2/21845),riskCode:code});
    // V2扩展字段
    var lvl=light==='r'?'L3':light==='y'?'L2':'L1';
    var respTimes={L1:'3个工作日内响应确认',L2:'1个工作日内响应，5个工作日内提交处置方案',L3:'4小时内响应，48小时内提交处置方案'};
    var eventCode=prefixMap[kpi.code]+'-S0'+(1+Math.floor(s2/32768));
    events.push({
      // 基础
      eventId:'EVT-'+code+'-0'+(e+1),eventCode:eventCode,eventName:kpi.kpi+'到达阈值预警',riskCode:code,riskName:title,
      // 监控对象
      objType:kpi.objType,
      objScope:kpi.objScope,
      bizScope:'全BU；全产品线；全生命周期阶段',
      // 指标定义
      kpiName:kpi.kpi,unit:kpi.unit,direction:kpi.dir==='asc'?'不低于':'不超过',
      formula:kpi.formula, auxKpis:kpi.auxKpis, dataHealth:kpi.health,
      // 预警规则
      alertLevel:lvl, enabled:true,
      threshold:threshold, actualValue:actualVal, gap:Math.abs(gap), light:light,
      thresholdLogic:kpi.kpi+(kpi.dir==='asc'?'<=':'>=')+threshold+kpi.unit+'时触发'+lvl+'预警',
      triggerCond:kpi.kpi+'连续3周期'+(kpi.dir==='asc'?'低于':'高于')+'阈值'+threshold+kpi.unit,
      dedupRule:'同一批次/项目同日内仅触发一次；7日内同一事件编号不重复推送',
      // 推送通知
      pushMethod:'系统自动+人工确认', pushChannel:'企业微信+邮件+APP推送',
      primaryReceiver:'风险Owner(张明远)', ccReceiver:'供应链总监、相关项目经理、BI运营',
      msgTitle:'['+lvl+'预警] '+kpi.kpi+'异常 — '+eventCode,
      msgContent:eventCode+' | '+kpi.kpi+'='+actualVal+kpi.unit+'（阈值'+threshold+kpi.unit+'）偏差'+Math.abs(gap)+kpi.unit+' | 风险：'+title+' | 建议：立即确认数据准确性，判断业务影响并启动处置',
      pushFreq:'首次触发当日推送；每周一汇总推送存量未关闭预警（周报）；'+lvl+'每日推送直至关闭',
      // 响应
      respTime:respTimes[lvl],
      respActions:'①确认数据准确性；②判断业务影响范围；③启动应急处置（查-判-报-处）；④填报系统闭环记录',
      sopRefs:'SOP-RSK-00'+Math.floor(s2/10922)+'（风险处置规程）',
      needCloseRecord:lvl!=='L1'?'L2以上强制填报：根因分类 + 处置方式 + 预计完成时间':'可选',
      // 维护
      alertStatus:'启用', falseRate:Math.round(_rng(12)*100+1)/100,
      launchDate:'2024-0'+(Math.floor(s2/5461)+1)+'-01',
      lastUpdate:'2026-04-'+String(Math.floor(s2/2184)+1).padStart(2,'0'),
      // 关联
      workorders:wos, lastTrigger:'2026-05-'+String(15+Math.floor(s2/5461)).padStart(2,'0'),
      dataSource:['ERP/WMS实时','MES日报','SRM周报','BI看板'][Math.floor(s2/16384)],
      monitorFreq:['实时','每日','每周','每2小时'][Math.floor(s2/16384)]
    });
  }

  // 跟踪溯源
  var triggerCount=Math.floor(_rng(10)*15);
  var lastDates=['2026-05-22','2026-05-18','2026-05-10','2026-04-28','2026-04-15','2026-03-20'];
  var lastResults=['正常关闭','升级处置','仍在跟进','正常关闭','正常关闭','升级处置'];

  return {
    code:code,title:title,domain:domain,cat:cat,level:level,desc:desc,impact:impact,
    // 量化评估
    P:P,I:I,score:score,maxDuration:'48小时',financialLoss:'单次事件预估损失'+(score>=15?'200-500万':score>=8?'50-200万':'10-50万'),
    riskStrategy:level==='极高'?'规避':level==='高'?'降低':'转移',
    // 触发与监控
    triggerCondition:events[0]?events[0].triggerCond:'指标异常',
    monitorSource:'ERP/WMS/MES/BI多源',
    monitorFreq:level==='极高'?'实时':level==='高'?'每小时':'每日',
    // 责任与升级
    owner:'张明远',
    collabDepts:['采购部','质量部','计划部','生产部'].slice(0,1+Math.floor(_rng(13)*3)).join('、'),
    escalationPath:'L1→部门负责人(+2h)；L2→供应链总监(+4h)；L3→VP运营(+8h)；超时未响应→CEO办公室(+24h)',
    // 应对
    top5Actions:['立即通知相关责任人并启动应急预案','组织跨部门复盘会议，输出RCA报告','制定CAPA方案，落实责任人和期限','效果跟踪验证，确保问题不复发','经验教训录入知识库，更新SOP流程'],
    planDocId:['ERP-'+code+'-SOP-01','待建'][Math.floor(_rng(14)*2)],
    planB:'升级至上级管理层，启动跨BG资源协调',
    historyLinks:'http://scct.internal/event/'+code+'-history',
    // 追溯
    triggerFreq12m:triggerCount,
    lastTriggerDate:lastDates[Math.floor(_rng(15)*6)],
    lastResult:lastResults[Math.floor(_rng(16)*6)],
    // 关联
    relatedRisks:'R-'+(Math.floor(_rng(17)*11)+1)+'.'+(Math.floor(_rng(18)*3)+1)+', R-'+(Math.floor(_rng(19)*11)+1)+'.'+(Math.floor(_rng(20)*3)+1),
    applicableStages:level==='极高'?'NPI、Ramp-up':'全阶段',
    applicableBUs:'全BU',
    // 合规
    relatedDocs:'SOP-RSK-00'+(Math.floor(_rng(21)*9)+1)+'（风险管控规程）、ISO31000风险管理指南',
    complianceReqs:'年度审计需提供风险评估报告及处置记录',
    // 维护
    enteredBy:'李'+['明','伟','强','芳'][Math.floor(_rng(22)*4)],
    entryDate:'2024-'+(Math.floor(_rng(23)*12)+1).toString().padStart(2,'0')+'-15',
    lastUpdate:'2026-0'+(Math.floor(_rng(24)*5)+1)+'-'+String(Math.floor(_rng(25)*28)+1).padStart(2,'0'),
    nextReview:'2026-0'+(Math.floor(_rng(26)*6)+6)+'-'+String(Math.floor(_rng(27)*28)+1).padStart(2,'0'),
    riskStatus:'生效',

    // 事件
    events:events,
    // 兼容旧版
    kpis:[{label:'触发次数/月',val:triggerCount,cls:level==='极高'?'red':level==='高'?'amber':'green'},
         {label:'风险得分',val:score,cls:score>=15?'red':score>=8?'amber':'green'},
         {label:'预警接入率',val:Math.floor(Math.random()*30+65),cls:'blue'}],
    process:[{n:1,title:'识别',desc:'规则引擎+AI模型主动捕获',owner:'系统'},{n:2,title:'评估',desc:'影响范围+紧急度+概率三维评分',owner:'风险专员'},{n:3,title:'响应',desc:'自动触发预警→生成工单→推送责任人',owner:'系统'},{n:4,title:'处置',desc:'责任人5日内处理→升级机制',owner:'Owner'},{n:5,title:'关闭',desc:'复盘验证→知识入库→规则优化',owner:'QA'}],
    plan:['预案A: 提前备选方案','预案B: 升级处理流程','预案C: 知识库复盘归档']
  };
};

var RISKS = {};
function buildRisks(){
  if(Object.keys(RISKS).length) return;
  var cats = [
    {d:'一、内部运营风险',items:[
      {code:'R-1.1',name:'需求预测失准',level:'极高'},{code:'R-1.2',name:'主生产计划失效',level:'高'},{code:'R-1.3',name:'工单执行异常',level:'高'},
      {code:'R-2.1',name:'NPI导入风险',level:'极高'},{code:'R-2.2',name:'ECN变更执行风险',level:'极高'},{code:'R-2.3',name:'BOM准确性风险',level:'中'},
      {code:'R-3.1',name:'采购执行异常',level:'高'},{code:'R-3.2',name:'供应商交期可靠性',level:'极高'},{code:'R-3.3',name:'物料变更追溯',level:'中'},
      {code:'R-4.1',name:'制造执行异常',level:'高'},{code:'R-4.2',name:'品质异常',level:'高'},{code:'R-4.3',name:'OEE劣化',level:'中'},
      {code:'R-5.1',name:'库存健康度恶化',level:'中'},{code:'R-5.2',name:'Aging与E&O风险',level:'高'},{code:'R-5.3',name:'物流中断风险',level:'高'},
    ]},
    {d:'二、供应网络风险',items:[
      {code:'R-6.1',name:'供应商交付能力不足',level:'极高'},{code:'R-6.2',name:'供应连续性风险',level:'高'},{code:'R-6.3',name:'单源供应风险',level:'极高'},
      {code:'R-7.1',name:'多级供应网络中断',level:'高'},{code:'R-7.2',name:'二三级供应商风险',level:'高'},{code:'R-7.3',name:'原材料价格波动',level:'中'},
      {code:'R-8.1',name:'物流承运商异常',level:'中'},{code:'R-8.2',name:'跨境物流延误',level:'高'},
    ]},
    {d:'三、外部宏观风险',items:[
      {code:'R-9.1',name:'国际贸易政策变化',level:'高'},{code:'R-9.2',name:'汇率大幅波动',level:'中'},
      {code:'R-10.1',name:'客户需求骤变',level:'高'},{code:'R-10.2',name:'竞品冲击',level:'中'},
      {code:'R-11.1',name:'自然灾害影响',level:'中'},{code:'R-11.2',name:'地缘政治风险',level:'高'},
    ]}
  ];
  cats.forEach(function(c){
    c.items.forEach(function(it){
      var descArr={'R-1.1':'客户滚动预测与实际订单偏差超25%，导致计划失效','R-3.2':'供应商多次延迟交付，OTD<70%','R-6.1':'核心供应商产能利用率>95%，无弹性空间','R-6.3':'独家供料断供，无替代方案','R-2.1':'NPI项目里程碑延期，客户违约风险','R-5.2':'需求取消/ECN变更导致物料呆滞，高账龄库存持续累积','R-2.2':'客户ECN频繁且窗口极短，信息同步脱节导致旧料误用或新料未备','R-10.1':'客户砍单>30%，库存积压'};
      var impArr={'R-1.1':'交付延误>5天，客户投诉升级','R-3.2':'关键料号断供，生产线停线','R-6.1':'Tier-1断供，影响>5条产线','R-6.3':'独家供料断供，无替代方案','R-2.1':'NPI延期，客户里程碑违约','R-5.2':'库存直接沉淀为报废损失，持续侵蚀利润','R-2.2':'旧料误用/新料未备/批量报废，代工业利润损耗最高风险','R-10.1':'客户砍单>30%，库存积压'};
      RISKS[it.code]=RISK_STUB(it.code,it.name,c.d,c.d,it.level,
        descArr[it.code]||(it.name+'风险场景'),
        impArr[it.code]||('影响项目交付，需立即处置'));
    });
  });
}

// ===================== State =====================
var currentRiskCode='';
var _rrTab='detail';
var _expandedEvent=null;
var _domState={0:true,1:true,2:true},_catState={};

// ===================== Entry =====================
function initPage_risk(){
  var fp=getFilteredProjects();
  var sel=document.getElementById('riskProjectSelect');
  var pid='';
  if(sel){var cur=sel.value;sel.innerHTML=fp.map(function(p){return'<option value="'+p.id+'">'+p.name+'</option>'}).join('');if(cur&&fp.some(function(p){return p.id==cur}))sel.value=cur;else if(fp.length)sel.value=fp[0].id;pid=sel.value;}
  consumeDrillDown('riskProjectSelect');
  pid=sel?sel.value:pid;var proj=pid?fp.find(function(p){return p.id===pid}):(fp.length?fp[0]:null);
  if(proj){
    document.getElementById('rrInfoInline').innerHTML=[
      '<span class="npi-info-item"><b>'+proj.name+'</b></span>',
      '<span class="npi-info-item">BG/BU：<b>'+proj.bg+'/'+proj.bu+'</b></span>',
      '<span class="npi-info-item">客户：<b>'+proj.customer+'</b></span>',
      '<span class="npi-info-item">产品线：<b>'+proj.productLine+'</b></span>',
      '<span class="npi-info-item">生命周期：<b>'+(proj.lifecycleRaw||proj.lifecycle)+'</b></span>',
      '<span class="npi-info-item">阶段：<b>'+proj.engStage+'</b></span>'
    ].join('');
  }
  buildRisks();
  Object.values(RISKS).forEach(function(r){r.events.forEach(function(evt){evt.workorders.forEach(function(wo){if(window._clAddRiskWorkorder)window._clAddRiskWorkorder({id:wo.id,title:wo.title,riskCode:r.code,step:wo.step,status:wo.status});});});});
  renderKpiRow();
  if(!currentRiskCode)currentRiskCode=Object.keys(RISKS)[0];
  renderSidebar();
  renderDetail(currentRiskCode);
}

// ===================== KPI Cards (npi-card style) =====================
function renderKpiRow(){
  var all=Object.values(RISKS);
  var total=all.length,l3=all.filter(function(r){return r.level==='极高'}).length;
  var l2=all.filter(function(r){return r.level==='高'}).length,l1=all.filter(function(r){return r.level==='中'}).length;
  var events=all.reduce(function(s,r){return s+r.events.length;},0);
  var redEvents=all.reduce(function(s,r){return s+r.events.filter(function(e){return e.light==='r';}).length;},0);
  var cards=[{p:'三级风险场景池',l:'风险总数',v:total,s:'极高 '+l3+' / 高 '+l2+' / 中 '+l1,a:'blue'},{p:'需立即响应处理',l:'极高风险',v:l3,s:'红色警戒级别',a:'red'},{p:'需重点关注跟踪',l:'高风险',v:l2,s:'橙色预警级别',a:'amber'},{p:'常规监控观察',l:'中风险',v:l1,s:'黄色关注级别',a:'green'},{p:'触发预警事件',l:'预警事件',v:events,s:'红灯事件 '+redEvents+' 项',a:'purple'},{p:'自动规则接入',l:'自动监控',v:total,s:'29项全接入预警引擎',a:'cyan'}];
  var el=document.getElementById('rrKpiRow');if(!el)return;
  el.innerHTML=cards.map(function(c){return'<div class="npi-card"><div class="npi-card-accent '+c.a+'"></div><div class="npi-card-purpose">'+c.p+'</div><div class="npi-card-label">'+c.l+'</div><div class="npi-card-value">'+c.v+'</div><div class="npi-card-sub">'+c.s+'</div></div>'}).join('');
}

// ===================== Sidebar =====================
function renderSidebar(){
  var cats=[{d:'一、内部运营风险',idx:0,subs:[{n:'需求与计划',codes:['R-1.1','R-1.2','R-1.3']},{n:'产品与工程',codes:['R-2.1','R-2.2','R-2.3']},{n:'采购与供应',codes:['R-3.1','R-3.2','R-3.3']},{n:'制造与品质',codes:['R-4.1','R-4.2','R-4.3']},{n:'库存与仓储',codes:['R-5.1','R-5.2','R-5.3']}]},{d:'二、供应网络风险',idx:1,subs:[{n:'供应商能力',codes:['R-6.1','R-6.2','R-6.3']},{n:'多级供应网络',codes:['R-7.1','R-7.2','R-7.3']},{n:'物流承运商',codes:['R-8.1','R-8.2']}]},{d:'三、外部宏观风险',idx:2,subs:[{n:'政策与贸易',codes:['R-9.1','R-9.2']},{n:'市场与客户',codes:['R-10.1','R-10.2']},{n:'地缘与自然',codes:['R-11.1','R-11.2']}]}];
  var el=document.getElementById('rrSidebar');if(!el)return;
  el.innerHTML=cats.map(function(c){var domItems=[];c.subs.forEach(function(s){s.codes.forEach(function(cd){if(RISKS[cd])domItems.push(RISKS[cd]);});});
    return'<div class="rr-dom"><div class="rr-dom-header" onclick="window._rrDomToggle('+c.idx+')"><span>'+(c.idx+1)+'. '+c.d+'</span><span style="margin-left:auto;font-size:10px;color:var(--text-muted)">'+domItems.length+'项</span></div><div class="rr-dom-body'+(_domState[c.idx]?'':' collapsed')+'" id="rrDomBody'+c.idx+'">'+c.subs.map(function(s,i){var sItems=[];s.codes.forEach(function(cd){if(RISKS[cd])sItems.push(RISKS[cd]);});var skey=c.idx+'_'+i;if(_catState[skey]===undefined)_catState[skey]=true;return'<div class="rr-cat"><div class="rr-cat-header" onclick="window._rrCatToggle(\''+skey+'\')">'+s.n+'<span style="margin-left:auto;font-size:10px;color:var(--text-muted)">'+sItems.length+'项</span></div><div class="rr-cat-body'+(_catState[skey]?'':' collapsed')+'" id="rrCatBody'+skey+'">'+sItems.map(function(r){var lvl={极高:'l3',高:'l2',中:'l1'};return'<div class="rr-risk-item'+(r.code===currentRiskCode?' active':'')+'" data-code="'+r.code+'" onclick="window._rrSelect(\''+r.code+'\')"><span class="rr-risk-code">'+r.code+'</span>'+r.title+'<span class="rr-risk-lvl '+lvl[r.level]+'" style="margin-left:auto">'+r.level+'</span></div>'}).join('')+'</div></div>'}).join('')+'</div></div>'}).join('');
}
window._rrDomToggle=function(idx){_domState[idx]=!_domState[idx];var b=document.getElementById('rrDomBody'+idx);if(b)b.classList.toggle('collapsed');};
window._rrCatToggle=function(sk){_catState[sk]=!_catState[sk];var b=document.getElementById('rrCatBody'+sk);if(b)b.classList.toggle('collapsed');};
window._rrSelect=function(code){currentRiskCode=code;_rrTab='detail';renderSidebar();renderDetail(code);};
window._rrGoWorkorder=function(woId){switchPage('closedloop');};

// ===================== Field Renderers =====================
function _fd(label,value,cls){cls=cls||'';return'<div class="rr-fd-row"><span class="rr-fd-label">'+label+'</span><span class="rr-fd-value '+cls+'">'+value+'</span></div>';}
function _sec(title,body){return'<div class="rr-sec"><div class="rr-sec-header" onclick="this.parentElement.querySelector(\'.rr-sec-body\').classList.toggle(\'collapsed\')">'+title+'</div><div class="rr-sec-body">'+body+'</div></div>';}
function _lvlBadge(l){var bg=l==='极高'?'var(--danger-bg)':l==='高'?'var(--warning-bg)':'var(--primary-bg)';var c=l==='极高'?'var(--danger)':l==='高'?'var(--warning)':'var(--primary)';return'<span class="meta-tag" style="background:'+bg+';color:'+c+'">'+l+'</span>';}
function _scoreBadge(s){var c=s>=15?'var(--danger)':s>=8?'var(--warning)':'var(--success)';return'<span style="font-size:14px;font-weight:800;color:'+c+'">'+s+'</span> / 25';}

// ===================== Event Detail Panel (V2) =====================
function renderEventDetail(evt){
  var ec=evt.alertLevel==='L3'?'var(--danger)':evt.alertLevel==='L2'?'var(--warning)':'var(--primary)';
  return'<tr class="rr-event-detail-row"><td colspan="9"><div class="rr-event-detail-panel"><div class="rr-event-panel-header"><span style="color:'+ec+';font-weight:700">'+evt.alertLevel+'级预警详情</span><span style="font-size:10px;color:var(--text-muted)">'+evt.eventCode+' · '+evt.eventName+'</span></div>'+
    // 监控对象
    '<div class="rr-ed-group"><div class="rr-ed-gtitle">📡 监控对象</div>'+_fd2('对象类型',evt.objType)+_fd2('对象范围',evt.objScope)+_fd2('业务范围',evt.bizScope)+'</div>'+
    // 指标定义
    '<div class="rr-ed-group"><div class="rr-ed-gtitle">📊 指标定义</div>'+_fd2('核心指标',evt.kpiName)+_fd2('计算逻辑',evt.formula)+_fd2('单位',evt.unit)+_fd2('辅助参考',evt.auxKpis,'aux')+_fd2('数据健康检查',evt.dataHealth,'health')+'</div>'+
    // 预警规则
    '<div class="rr-ed-group"><div class="rr-ed-gtitle">⚙️ 预警规则</div>'+_fd2('预警级别',evt.alertLevel)+_fd2('是否启用','<span style="color:var(--success)">✅ 已启用</span>')+_fd2('阈值判断',evt.thresholdLogic)+_fd2('触发条件',evt.triggerCond)+_fd2('去重抑制',evt.dedupRule)+'</div>'+
    // 推送通知
    '<div class="rr-ed-group"><div class="rr-ed-gtitle">📨 推送通知</div>'+_fd2('推送方式',evt.pushMethod)+_fd2('推送渠道',evt.pushChannel)+_fd2('primary接收',evt.primaryReceiver)+_fd2('CC接收',evt.ccReceiver)+_fd2('消息标题','<code style="font-size:10px">'+evt.msgTitle+'</code>')+_fd2('消息内容','<div style="font-size:10px;line-height:1.6">'+evt.msgContent+'</div>')+_fd2('推送频率',evt.pushFreq)+'</div>'+
    // 响应
    '<div class="rr-ed-group"><div class="rr-ed-gtitle">🛡️ 响应要求</div>'+_fd2('响应时限',evt.respTime)+_fd2('响应动作',evt.respActions)+_fd2('关联SOP',evt.sopRefs)+_fd2('闭环记录',evt.needCloseRecord)+'</div>'+
    // 维护
    '<div class="rr-ed-group"><div class="rr-ed-gtitle">🔧 维护信息</div>'+_fd2('预警状态','<span style="color:var(--success)">'+evt.alertStatus+'</span>')+_fd2('近3月误报率','<span style="color:var(--success)">'+(evt.falseRate*100).toFixed(1)+'%</span>')+_fd2('数据来源',evt.dataSource)+_fd2('监控频率',evt.monitorFreq)+_fd2('上线日期',evt.launchDate)+_fd2('最近更新',evt.lastUpdate)+'</div>'+
    '</div></td></tr>';
}
function _fd2(label,value,cls){return'<div class="rr-ed-row"><span class="rr-ed-label">'+label+'</span><span class="rr-ed-value'+(cls?' '+cls:'')+'">'+(value||'-')+'</span></div>';}

window._rrToggleEvent=function(evtId){
  _expandedEvent=_expandedEvent===evtId?null:evtId;
  renderDetail(currentRiskCode);
};

// ===================== Render Detail =====================
function renderDetail(code){
  var r=RISKS[code];if(!r)return;
  var el=document.getElementById('rrDetail');
  var redCnt=r.events.filter(function(e){return e.light==='r';}).length;
  var yelCnt=r.events.filter(function(e){return e.light==='y';}).length;

  // Tab bar
  var redEmoji='&#x1F534;'; var yelEmoji='&#x1F7E1;'; var grnEmoji='&#x1F7E2;';
  var act0=(_rrTab==='detail'?' active':'');
  var act1=(_rrTab==='events'?' active':'');
  var tabBar='<div class="rr-tab-bar"><div class="rr-tab'+act0+'" onclick="window._rrSwitchTab(\'detail\')"><i class="fas fa-file-lines"></i> 风险详情</div>';
  tabBar+='<div class="rr-tab'+act1+'" onclick="window._rrSwitchTab(\'events\')"><i class="fas fa-bell"></i> 事件预警 <span style="font-size:10px;margin-left:4px">'+redEmoji+redCnt+' '+yelEmoji+yelCnt+'</span></div></div>';

  if(_rrTab==='events'){
    // ═══ 事件预警Tab V2 ═══
    el.innerHTML=tabBar+
      '<div class="rr-detail-header">['+r.code+'] '+r.title+' — 预警事件清单（共 '+r.events.length+' 项）<span style="font-size:10px;color:var(--text-muted);margin-left:8px">点击行展开完整事件详情</span></div>'+
      '<div class="rr-tab-content"><table class="rr-events-table"><thead><tr>'+
      '<th style="width:85px">预警编码</th><th style="width:95px">事件名称</th><th style="width:55px">级别</th><th>监控指标</th><th style="width:55px">阈值</th><th style="width:55px">实际值</th><th style="width:50px">偏差</th><th style="width:55px">状态</th><th>关联工单</th></tr></thead><tbody>'+
      r.events.map(function(evt){
        var em=evt.light==='r'?redEmoji:evt.light==='y'?yelEmoji:grnEmoji;
        var lbl=evt.light==='r'?'异常':evt.light==='y'?'预警':'正常';
        var cls=evt.light==='r'?'bad':evt.light==='y'?'warn':'good';
        var lvlCls=evt.alertLevel==='L3'?'bad':evt.alertLevel==='L2'?'warn':'good';
        var gs=evt.direction.indexOf('不')>=0?'+':'-';
        var woHtml=evt.workorders.length?evt.workorders.map(function(wo){
          return'<span class="rr-event-wo" onclick="event.stopPropagation();window._rrGoWorkorder(\''+wo.id+'\')" title="跳转闭环管理">'+wo.id+' ▶</span>';
        }).join(''):'<span class="rr-event-wo no-wo">-</span>';
        var isExp=_expandedEvent===evt.eventId;
        return'<tr class="rr-event-row '+cls+(isExp?' expanded':'')+'" onclick="window._rrToggleEvent(\''+evt.eventId+'\')" style="cursor:pointer" title="点击展开/收起详情">'+
          '<td><b style="font-size:11px;color:var(--primary-light)">'+evt.eventCode+'</b><br><span style="font-size:8px;color:var(--text-muted)">'+evt.lastTrigger+'</span></td>'+
          '<td>'+evt.eventName+'</td>'+
          '<td><span class="rr-event-lvl '+lvlCls+'">'+evt.alertLevel+'</span></td>'+
          '<td><b>'+evt.kpiName+'</b><br><span style="font-size:9px;color:var(--text-muted)">'+evt.objType+'</span></td>'+
          '<td><b>'+evt.threshold+'</b> '+evt.unit+'</td>'+
          '<td><b style="color:var(--'+(evt.light==='r'?'danger':'warning')+')">'+evt.actualValue+'</b> '+evt.unit+'</td>'+
          '<td style="color:var(--'+(evt.light==='r'?'danger':'text-muted')+')">'+gs+evt.gap+evt.unit+'</td>'+
          '<td style="text-align:center">'+em+'<br><span style="font-size:9px;font-weight:600;color:var(--'+(evt.light==='r'?'danger':evt.light==='y'?'warning':'success')+')">'+lbl+'</span></td>'+
          '<td>'+woHtml+'</td></tr>'+
          (isExp?renderEventDetail(evt):'');
      }).join('')+
      '</tbody></table></div>';
    return;
  }

  // ═══ 风险详情Tab v10.26 双列重塑 ═══
  var grnCnt=r.events.length-redCnt-yelCnt;
  var scoreCls=r.score>=15?'var(--danger)':r.score>=8?'var(--warning)':'var(--success)';
  el.innerHTML=tabBar+
    // Top Hero Bar
    '<div class="rr-detail-hero">'+
      '<div class="rr-hero-item" style="flex:0 0 auto"><span class="rr-hero-label">编码</span><span class="rr-hero-val">'+r.code+'</span></div>'+
      '<div class="rr-hero-item" style="flex:2;min-width:140px"><span class="rr-hero-label">名称</span><span class="rr-hero-val">'+r.title+'</span></div>'+
      '<div class="rr-hero-item"><span class="rr-hero-label">等级</span><span class="rr-hero-val" style="color:'+(r.level==='极高'?'var(--danger)':r.level==='高'?'var(--warning)':'var(--primary)')+'">'+r.level+'</span></div>'+
      '<div class="rr-hero-item"><span class="rr-hero-label">得分(P×I)</span><span class="rr-hero-val" style="color:'+scoreCls+'">'+r.score+'<span style="font-size:10px;font-weight:400;color:var(--text-muted)">/25</span></span></div>'+
      '<div class="rr-hero-item"><span class="rr-hero-label">策略</span><span class="rr-hero-val">'+r.riskStrategy+'</span></div>'+
      '<div class="rr-hero-item"><span class="rr-hero-label">Owner</span><span class="rr-hero-val">'+r.owner+'</span></div>'+
      '<div class="rr-hero-item"><span class="rr-hero-label">事件预警</span><span class="rr-hero-val" style="font-size:11px"><span style="color:var(--danger)">'+redEmoji+redCnt+'</span> <span style="color:var(--warning)">'+yelEmoji+yelCnt+'</span> <span style="color:var(--success)">'+grnEmoji+grnCnt+'</span></span></div>'+
    '</div>'+
    // 双列
    '<div class="rr-detail-grid">'+
      '<div class="rr-detail-col">'+
        _sec('风险识别与评估',
          _fd('风险类别',r.domain)+_fd('风险影响',r.impact)+_fd('风险定义','<div style="line-height:1.7;max-height:90px;overflow-y:auto">'+r.desc+'</div>','desc')
        )+
        _sec('量化评估',
          '<div class="rr-score-inline">'+_fd('发生可能性(P)',r.P+'/5')+_fd('影响严重度(I)',r.I+'/5')+_fd('风险得分(P×I)','<span style="color:'+scoreCls+';font-size:15px;font-weight:800">'+r.score+'</span><span style="font-size:10px;color:var(--text-muted)">/25</span>','score')+'</div>'+
          '<div class="rr-score-inline">'+_fd('潜在财务损失',r.financialLoss,'loss')+_fd('最大可承受时长',r.maxDuration)+'</div>'
        )+
        _sec('触发与监控',
          _fd('触发条件',r.triggerCondition)+_fd('关联预警事件',r.events.length+' 个事件')+
          _fd('监控数据来源','<span class="rr-freq-tag">'+r.monitorSource+'</span>')+'<div style="display:flex;gap:8px;padding-top:4px"><span class="rr-freq-tag">'+r.monitorFreq+'</span><span style="font-size:10px;color:var(--text-muted)">自动监控</span></div>'
        )+
        _sec('追溯记录',
          _fd('近12月触发',r.triggerFreq12m+' 次')+_fd('上次触发',r.lastTriggerDate)+_fd('上次结果',r.lastResult)
        )+
      '</div>'+
      '<div class="rr-detail-col">'+
        _sec('责任与升级',
          _fd('风险Owner','<b>'+r.owner+'</b>')+_fd('协同部门',r.collabDepts)+
          _fd('升级路径','<div style="font-size:10px;line-height:1.6;max-height:80px;overflow-y:auto">'+r.escalationPath+'</div>')
        )+
        _sec('应对措施',
          _fd('预案编号','<span style="color:var(--primary-light);font-weight:600">'+r.planDocId+'</span>')+
          '<div style="font-weight:600;margin:6px 0 4px;font-size:11px;color:var(--text)">管控动作TOP5</div>'+
          r.top5Actions.map(function(a,i){return'<div style="padding:2px 0;font-size:10.5px;color:var(--text-sec)"><span style="color:var(--primary);font-weight:600">'+(i+1)+'</span> '+a+'</div>'}).join('')+
          _fd('PlanB',r.planB)+_fd('历史记录',r.historyLinks,'link')
        )+
        _sec('关联与合规',
          _fd('关联风险',r.relatedRisks)+_fd('适用阶段',r.applicableStages)+_fd('适用BU',r.applicableBUs)+
          _fd('相关文件',r.relatedDocs,'docs')+_fd('合规要求',r.complianceReqs)
        )+
        _sec('维护信息',
          _fd('录入',r.enteredBy+' · '+r.entryDate)+_fd('更新',r.lastUpdate)+_fd('下次复核','<span style="color:var(--warning)">'+r.nextReview+'</span>','due')+_fd('状态',r.riskStatus,'status')
        )+
      '</div>'+
    '</div>';
}

// Tab切换
window._rrSwitchTab=function(tab){_rrTab=tab;_expandedEvent=null;renderDetail(currentRiskCode);};

window.initPage_risk=initPage_risk;
})();
registerModule('risk', initPage_risk);
