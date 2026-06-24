// Module: risk — 风险雷达 v9.0 (SCOR敏捷×韧性双维度·深色科技风·ECharts)
(function(){
"use strict";

// ═══════════════ 风险数据目录 ═══════════════
var RISK_CATALOG = {
  internal: {
    label: "内部运营风险", categories: [
      { id:"C1", name:"需求与计划", risks:[
        {id:"1.1",name:"需求预测失准",score:72,agility:68,resilience:45,trend:"up",level:"P2",scor:{impact:"响应性",indicator:"需求预测偏差MAPE"},tts:8,ttr:12,var:320},
        {id:"1.2",name:"主生产计划失效",score:65,agility:71,resilience:52,trend:"stable",level:"P2",scor:{impact:"可靠性",indicator:"计划达成率"},tts:12,ttr:8,var:180},
        {id:"1.3",name:"工单执行异常",score:48,agility:55,resilience:60,trend:"down",level:"P3",scor:{impact:"响应性",indicator:"工单准时完工率"},tts:15,ttr:5,var:90}
      ]},
      { id:"C2", name:"研发与工程变更", risks:[
        {id:"2.1",name:"NPI导入风险",score:81,agility:45,resilience:38,trend:"up",level:"P1",scor:{impact:"敏捷性",indicator:"SOP偏差天数"},tts:3,ttr:21,var:680},
        {id:"2.2",name:"ECN变更执行风险",score:58,agility:62,resilience:55,trend:"stable",level:"P2",scor:{impact:"可靠性",indicator:"ECN执行及时率"},tts:10,ttr:7,var:150},
        {id:"2.3",name:"EOL退市管理风险",score:44,agility:48,resilience:70,trend:"down",level:"P3",scor:{impact:"资产效率",indicator:"EOL库存消化率"},tts:30,ttr:14,var:220}
      ]},
      { id:"C3", name:"物料与采购执行", risks:[
        {id:"3.1",name:"物料计划覆盖风险",score:77,agility:72,resilience:48,trend:"up",level:"P2",scor:{impact:"响应性",indicator:"物料覆盖天数"},tts:6,ttr:14,var:410},
        {id:"3.2",name:"采购执行效率风险",score:61,agility:65,resilience:58,trend:"stable",level:"P2",scor:{impact:"成本",indicator:"PO执行及时率"},tts:9,ttr:10,var:230},
        {id:"3.x",name:"物料缺料风险",score:88,agility:35,resilience:30,trend:"up",level:"P1",scor:{impact:"可靠性",indicator:"缺料BOM占比"},tts:2,ttr:28,var:920},
        {id:"3.3",name:"备料协同风险",score:55,agility:60,resilience:62,trend:"stable",level:"P2",scor:{impact:"响应性",indicator:"备料齐套率"},tts:11,ttr:9,var:170}
      ]},
      { id:"C4", name:"制造与品质执行", risks:[
        {id:"4.1",name:"制造过程稳定性风险",score:53,agility:58,resilience:65,trend:"down",level:"P3",scor:{impact:"可靠性",indicator:"过程良率CPK"},tts:18,ttr:6,var:140},
        {id:"4.2",name:"出货履约风险",score:69,agility:73,resilience:55,trend:"up",level:"P2",scor:{impact:"可靠性",indicator:"OTIF完美订单率"},tts:7,ttr:11,var:350}
      ]},
      { id:"C5", name:"库存与仓储健康", risks:[
        {id:"5.1",name:"库存水位失控风险",score:62,agility:55,resilience:60,trend:"stable",level:"P2",scor:{impact:"资产效率",indicator:"库存周转天数DOI"},tts:14,ttr:21,var:280},
        {id:"5.2",name:"Aging与E&O风险",score:45,agility:40,resilience:72,trend:"down",level:"P3",scor:{impact:"资产效率",indicator:"E&O金额占比"},tts:60,ttr:30,var:480},
        {id:"5.3",name:"异常库存处置风险",score:38,agility:42,resilience:75,trend:"down",level:"P3",scor:{impact:"资产效率",indicator:"异常库存处置周期"},tts:45,ttr:15,var:190},
        {id:"5.4",name:"VMI库存管控风险",score:56,agility:50,resilience:63,trend:"stable",level:"P2",scor:{impact:"资产效率",indicator:"VMI库存准确率"},tts:20,ttr:8,var:120}
      ]}
    ]
  },
  supply: {
    label: "供应网络风险", categories: [
      { id:"C6", name:"供应商交付能力", risks:[
        {id:"6.1",name:"交期承诺可靠性风险",score:74,agility:70,resilience:52,trend:"up",level:"P2",scor:{impact:"可靠性",indicator:"供应商OTIF率"},tts:7,ttr:14,var:430},
        {id:"6.2",name:"来料质量稳定性风险",score:66,agility:60,resilience:58,trend:"stable",level:"P2",scor:{impact:"可靠性",indicator:"来料合格率IQC"},tts:10,ttr:12,var:290}
      ]},
      { id:"C7", name:"供应连续性保障", risks:[
        {id:"7.1",name:"供应商稳定性风险",score:79,agility:42,resilience:35,trend:"up",level:"P1",scor:{impact:"韧性",indicator:"供应商稳定性评分"},tts:5,ttr:30,var:750},
        {id:"7.2",name:"单源依赖风险",score:91,agility:28,resilience:22,trend:"up",level:"P1",scor:{impact:"韧性",indicator:"单源物料占比"},tts:3,ttr:45,var:1200},
        {id:"7.3",name:"供应商经营持续性风险",score:83,agility:35,resilience:28,trend:"up",level:"P1",scor:{impact:"韧性",indicator:"供应商财务健康度"},tts:4,ttr:35,var:880}
      ]},
      { id:"C8", name:"多级供应网络", risks:[
        {id:"8.1",name:"Tier-N隐性断链风险",score:85,agility:32,resilience:25,trend:"up",level:"P1",scor:{impact:"韧性",indicator:"Tier2+可视化覆盖率"},tts:4,ttr:40,var:1050},
        {id:"8.2",name:"大宗原材料波动风险",score:68,agility:55,resilience:50,trend:"stable",level:"P2",scor:{impact:"成本",indicator:"大宗价格波动系数"},tts:8,ttr:18,var:540}
      ]}
    ]
  },
  external: {
    label: "外部宏观风险", categories: [
      { id:"C9", name:"全球物流与通道", risks:[
        {id:"9.1",name:"干线物流中断风险",score:76,agility:62,resilience:45,trend:"up",level:"P2",scor:{impact:"响应性",indicator:"干线准时到港率"},tts:6,ttr:18,var:620},
        {id:"9.2",name:"运力资源短缺风险",score:58,agility:52,resilience:55,trend:"stable",level:"P2",scor:{impact:"成本",indicator:"运力紧张指数"},tts:10,ttr:15,var:340}
      ]},
      { id:"C10", name:"贸易与政策合规", risks:[
        {id:"10.1",name:"出口管制与制裁风险",score:88,agility:30,resilience:28,trend:"up",level:"P1",scor:{impact:"韧性",indicator:"受管制物料使用率"},tts:1,ttr:60,var:2100},
        {id:"10.2",name:"关税与清关政策风险",score:71,agility:45,resilience:42,trend:"up",level:"P2",scor:{impact:"成本",indicator:"关税成本占比"},tts:5,ttr:25,var:780}
      ]},
      { id:"C11", name:"ESG与大客户合规", risks:[
        {id:"11.1",name:"供应链ESG合规风险",score:52,agility:48,resilience:65,trend:"stable",level:"P3",scor:{impact:"韧性",indicator:"供应商ESG评分"},tts:30,ttr:45,var:360},
        {id:"11.2",name:"碳中和达标风险",score:46,agility:40,resilience:60,trend:"down",level:"P3",scor:{impact:"成本",indicator:"碳排放达标率"},tts:90,ttr:60,var:420},
        {id:"11.3",name:"大客户审计准入风险",score:78,agility:38,resilience:35,trend:"up",level:"P1",scor:{impact:"韧性",indicator:"大客户审计通过率"},tts:5,ttr:30,var:1500}
      ]}
    ]
  }
};

// ═══════════════ 常量 ═══════════════
var LEVEL_COLORS = {P1:'#ef4444',P2:'#f97316',P3:'#eab308',P4:'#22c55e'};
var LEVEL_TAGS  = {P1:'🔴高危',P2:'🟠中高',P3:'🟡中等',P4:'🟢低危'};
var TREND_CFG   = {up:{icon:'↑',color:'#ef4444',label:'恶化'},stable:{icon:'→',color:'#eab308',label:'持平'},down:{icon:'↓',color:'#22c55e',label:'改善'}};
// AI建议
var AI_TIPS = {
  '7.2':'建议72小时内启动第二货源认证，当前TTS仅3天，缺货风险极高',
  '10.1':'立即核查受管制物料清单，启动合规替代方案评估，TTR达60天',
  '8.1':'启动二级供应商穿透排查，重点关注台积电/大立光上游节点',
  '2.1':'SOP节点评审提前至D-30，锁定V1 BOM并冻结变更窗口',
  '11.3':'启动审计准备清单，对标客户要求逐项自评，预留30天整改期',
  default:'建议在48小时内完成影响范围评估，优先保障P1项目连续性'
};

function flattenRisks(filter){
  var all = [];
  ['internal','supply','external'].forEach(function(catKey){
    var cat = RISK_CATALOG[catKey];
    cat.categories.forEach(function(c){
      c.risks.forEach(function(r){
        if(!filter || filter==='all' || filter===catKey) all.push({catKey:catKey,catLabel:cat.label,catName:c.name,catId:c.id,risk:r});
      });
    });
  });
  return all;
}

// ═══════════════ 主初始化 ═══════════════
function initPage_risk(){
  try{
    var fp = (typeof getFilteredProjects==='function')?getFilteredProjects():(typeof projects!=='undefined'?projects:[]);
    var sel = document.getElementById('riskProjectSelect');
    if(sel && typeof fillProjectSelect==='function') fillProjectSelect(sel, fp);
    if(typeof consumeDrillDown==='function') consumeDrillDown('riskProjectSelect');
    var filter = document.getElementById('riskCatFilter');
    var catFilter = filter?filter.value:'all';
    var allRisks = flattenRisks(catFilter);

    // KPI summary
    var p1Count=0,p2Count=0,p3Count=0,totalScore=0,totalAgility=0,totalResilience=0,totalTts=0,totalTtr=0,activeAlerts=0;
    allRisks.forEach(function(r){
      var rr=r.risk;
      totalScore+=rr.score; totalAgility+=rr.agility; totalResilience+=rr.resilience;
      totalTts+=rr.tts; totalTtr+=rr.ttr;
      if(rr.level==='P1') p1Count++;
      else if(rr.level==='P2') p2Count++;
      else p3Count++;
      if(rr.tts<7) activeAlerts++;
    });
    var n=allRisks.length||1;
    var avgScore=Math.round(totalScore/n), avgAgility=Math.round(totalAgility/n);
    var avgResilience=Math.round(totalResilience/n), avgTts=Math.round(totalTts/n*10)/10;
    var avgTtr=Math.round(totalTtr/n*10)/10, activeCount=p1Count+p2Count+p3Count;

    // ── Row 1: KPI Cards ──
    renderKpiCards(avgScore, avgAgility, avgResilience, activeCount, p1Count, p2Count, p3Count, activeAlerts);

    // ── Row 2: Charts ──
    renderScorRadar(allRisks);
    renderTrendChart(allRisks);

    // ── Row 3: Heat Matrix ──
    renderHeatMatrix(allRisks, catFilter);

    // ── Row 4: Quadrant + TOP 8 ──
    renderQuadChart(allRisks);
    renderTopAlerts(allRisks);

    // ── Row 5: Alert Rules ──
    renderAlertRules();

  }catch(e){console.error('risk init error:',e);}
}

// ── KPI Cards ──
function renderKpiCards(avgScore, avgAgility, avgResilience, activeCount, p1, p2, p3, alerts){
  var el=document.getElementById('rrKpiRow'); if(!el) return;
  var scoreColor=avgScore>=70?'#ef4444':avgScore>=50?'#f97316':'#22c55e';
  var agiColor=avgAgility>=60?'#22c55e':avgAgility>=40?'#f97316':'#ef4444';
  var resColor=avgResilience>=60?'#22c55e':avgResilience>=40?'#f97316':'#ef4444';
  el.innerHTML=[
    {v:avgScore,sub:'较昨日 <span style="color:#ef4444">▲+3</span> 较上周 <span style="color:#ef4444">▲+8</span>',label:'综合风险指数',tag:avgScore>=70?'高危':avgScore>=50?'中高':'中等',tagBg:scoreColor,bar:avgScore,barColor:scoreColor,icon:'fa-gauge-high'},
    {v:avgAgility,sub:'上行弹性+18% / 下行弹性-22%',label:'SCOR敏捷性评分',tag:avgAgility<40?'脆弱':avgAgility<60?'需关注':'健康',tagBg:agiColor,bar:100-avgAgility,barColor:agiColor,icon:'fa-bolt',weakness:'最弱项：单源依赖导致弹性受限'},
    {v:avgResilience,sub:'平均TTS: '+avgTts+'天 / 平均TTR: '+avgTtr+'天',label:'SCOR韧性评分',tag:avgResilience<40?'韧性脆弱':avgResilience<60?'需加固':'稳健',tagBg:resColor,bar:100-avgResilience,barColor:resColor,icon:'fa-shield-halved',weakness:alerts+'个节点TTS&lt;7天处于危险区'},
    {v:activeCount,sub:'P1: <b style="color:#ef4444">'+p1+'</b>  P2: <b style="color:#f97316">'+p2+'</b>  P3: <b style="color:#eab308">'+p3+'</b>',label:'活跃风险事件',tag:'本周新增4项',tagBg:'#f97316',bar:0,barColor:'#64748b',icon:'fa-triangle-exclamation',unit:'项'}
  ].map(function(k,i){
    return '<div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px 18px;position:relative;overflow:hidden;transition:all .2s;cursor:default" onmouseenter="this.style.borderColor=\'rgba(59,130,246,.5)\';this.style.transform=\'translateY(-2px)\'" onmouseleave="this.style.borderColor=\'#334155\';this.style.transform=\'none\'">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'
      +'<i class="fas '+k.icon+'" style="color:'+k.barColor+';font-size:16px"></i>'
      +(k.tag?'<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:'+k.tagBg+';color:#fff;font-weight:600">'+k.tag+'</span>':'')
      +'</div>'
      +'<div style="font-size:36px;font-weight:800;color:'+k.barColor+';line-height:1;margin-bottom:6px">'+k.v+(k.unit||'')+'</div>'
      +'<div style="font-size:10px;color:#64748b;margin-bottom:8px">'+k.sub+'</div>'
      +(k.weakness?'<div style="font-size:10px;color:#475569;margin-bottom:8px">'+k.weakness+'</div>':'')
      +(k.bar>0?'<div style="height:3px;background:#334155;border-radius:2px"><div style="width:'+k.bar+'%;height:100%;background:'+k.barColor+';border-radius:2px"></div></div>':'')
      +'</div>';
  }).join('');
}

// ── SCOR Radar Chart ──
function renderScorRadar(allRisks){
  var dom=document.getElementById('rrRadarChart'); if(!dom||!window.echarts) return;
  // Aggregate SCOR dimensions
  var dims={可靠性:[],响应性:[],敏捷性:[],成本:[],韧性:[]};
  var dimKeys=['可靠性','响应性','敏捷性','成本','韧性'];
  allRisks.forEach(function(r){
    var imp=r.risk.scor.impact;
    if(dimKeys.indexOf(imp)>=0) dims[imp].push(r.risk.score);
  });
  var current=[], baseline=[];
  dimKeys.forEach(function(k){
    var arr=dims[k];
    var avg=arr.length?Math.round(arr.reduce(function(a,b){return a+b;},0)/arr.length):50;
    current.push(avg);
    baseline.push(Math.max(30,avg-15));
  });
  var chart=echarts.init(dom);
  chart.setOption({
    tooltip:{},
    legend:{bottom:0,textStyle:{color:'#94a3b8'}},
    radar:{center:['50%','45%'],radius:'65%',axisName:{color:'#94a3b8',fontSize:11},
      indicator:dimKeys.map(function(k,i){return{name:k,max:100};}),
      axisLine:{lineStyle:{color:'#334155'}},splitLine:{lineStyle:{color:'#334155'}},
      splitArea:{areaStyle:{color:['rgba(59,130,246,.05)','rgba(59,130,246,.02)']}}},
    series:[
      {name:'当前风险',type:'radar',data:[{value:current,name:'当前'}],symbol:'circle',symbolSize:6,
        lineStyle:{color:'#ef4444',width:2},areaStyle:{color:'rgba(239,68,68,.15)'},
        itemStyle:{color:'#ef4444'}},
      {name:'目标基线',type:'radar',data:[{value:baseline,name:'目标'}],symbol:'diamond',symbolSize:5,
        lineStyle:{color:'#3b82f6',width:2,type:'dashed'},areaStyle:{color:'rgba(59,130,246,.05)'},
        itemStyle:{color:'#3b82f6'}}
    ]
  });
  if(App.charts.rrRadar) App.charts.rrRadar.dispose();
  App.charts.rrRadar=chart;
}

// ── Trend Chart ──
function renderTrendChart(allRisks){
  var dom=document.getElementById('rrTrendChart'); if(!dom||!window.echarts) return;
  var d=30; var comp=[], agi=[], res=[], labels=[];
  for(var i=0;i<d;i++){
    var day=d-i; labels.push('6/'+day);
    var cBase=62+i*0.5, aBase=48+i*0.3, rBase=38+i*0.35;
    comp.push(Math.round(cBase + (Math.sin(i*0.5)*5) + (i>20?4:0)));
    agi.push(Math.round(aBase + (Math.cos(i*0.8)*4) + (i>18?6:0)));
    res.push(Math.round(rBase + (Math.sin(i*0.6)*6) + (i>22?8:0)));
  }
  var chart=echarts.init(dom);
  chart.setOption({
    tooltip:{trigger:'axis',backgroundColor:'#1e293b',borderColor:'#334155',textStyle:{color:'#e2e8f0'}},
    legend:{bottom:0,textStyle:{color:'#94a3b8'}},
    grid:{left:50,right:30,top:20,bottom:35},
    xAxis:{type:'category',data:labels,axisLabel:{color:'#64748b',fontSize:9,rotate:-45,interval:4},axisLine:{lineStyle:{color:'#334155'}}},
    yAxis:{type:'value',min:0,max:100,axisLabel:{color:'#64748b'},splitLine:{lineStyle:{color:'#334155',type:'dashed'}}},
    series:[
      {name:'综合风险',type:'line',data:comp,smooth:true,lineStyle:{color:'#ef4444',width:2},itemStyle:{color:'#ef4444'},symbol:'circle',symbolSize:4},
      {name:'敏捷性风险',type:'line',data:agi,smooth:true,lineStyle:{color:'#f97316',width:2},itemStyle:{color:'#f97316'},symbol:'diamond',symbolSize:4},
      {name:'韧性风险',type:'line',data:res,smooth:true,lineStyle:{color:'#3b82f6',width:2},itemStyle:{color:'#3b82f6'},symbol:'triangle',symbolSize:5}
    ],
    markLine:{silent:true,data:[{yAxis:70,lineStyle:{color:'#ef4444',type:'dashed',width:1},label:{formatter:'预警线70',color:'#ef4444',fontSize:10}}]}
  });
  if(App.charts.rrTrend) App.charts.rrTrend.dispose();
  App.charts.rrTrend=chart;
}

// ── Heat Matrix ──
function renderHeatMatrix(allRisks, filter){
  var el=document.getElementById('rrMatrixWrap'); if(!el) return;
  var sortKey='score', sortDir=-1; // default sort
  // Build grouped structure
  var groups=[];
  ['internal','supply','external'].forEach(function(ck){
    if(filter!=='all' && filter!==ck) return;
    var cat=RISK_CATALOG[ck];
    var items=[];
    cat.categories.forEach(function(c){
      c.risks.forEach(function(r){ items.push({risk:r,catName:c.name,catId:c.id}); });
    });
    if(items.length) groups.push({label:cat.label,items:items});
  });

  // Flatten with sort
  var flat=[];
  groups.forEach(function(g){
    flat.push({type:'header',label:g.label});
    g.items.sort(function(a,b){return (b.risk[sortKey]-a.risk[sortKey])*sortDir;}).forEach(function(r){flat.push(r);});
  });

  var countEl=document.getElementById('rrMatrixCount');
  if(countEl) countEl.textContent='共 '+flat.filter(function(x){return!x.type;}).length+' 个风险领域';

  var html='<table style="width:100%;border-collapse:collapse;min-width:1200px;font-size:12px">'
    +'<thead><tr style="background:#0f172a">'
    +'<th style="padding:8px 10px;text-align:left;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">风险代码</th>'
    +'<th style="padding:8px 10px;text-align:left;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">风险领域</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;cursor:pointer;white-space:nowrap" onclick="window._rrSortMatrix(\'score\')">综合评分 ▾</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;cursor:pointer;white-space:nowrap" onclick="window._rrSortMatrix(\'agility\')">敏捷性</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;cursor:pointer;white-space:nowrap" onclick="window._rrSortMatrix(\'resilience\')">韧性</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">TTS存活</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">TTR恢复</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">VAR损失</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">趋势</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">SCOR维度</th>'
    +'<th style="padding:8px 10px;text-align:center;color:#64748b;font-size:10px;font-weight:600;border-bottom:1px solid #334155;white-space:nowrap">操作</th>'
    +'</tr></thead><tbody>';

  flat.forEach(function(item,idx){
    if(item.type==='header'){
      html+='<tr style="background:#0f172a"><td colspan="11" style="padding:8px 14px;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #334155">'+item.label+'</td></tr>';
      return;
    }
    var r=item.risk;
    var levelColor=LEVEL_COLORS[r.level];
    var tr=TREND_CFG[r.trend];
    var agiBar=r.agility, agiColor=agiBar<40?'#ef4444':agiBar<60?'#f97316':'#22c55e';
    var resBar=r.resilience, resColor=resBar<40?'#ef4444':resBar<60?'#f97316':'#22c55e';
    var ttsWarn=r.tts<7?'<i class="fas fa-exclamation-triangle" style="color:#ef4444;font-size:9px;margin-right:2px"></i>':'';
    var ttrWarn=r.ttr>21?'<i class="fas fa-exclamation-triangle" style="color:#f97316;font-size:9px;margin-right:2px"></i>':'';
    var varColor=r.var>500?'#ef4444':r.var>200?'#f97316':'#64748b';
    var scorDims={'可靠性':'#3b82f6','响应性':'#f97316','敏捷性':'#22c55e','成本':'#8b5cf6','韧性':'#ef4444'};
    var scorColor=scorDims[r.scor.impact]||'#64748b';

    html+='<tr style="transition:all .15s;cursor:default;border-bottom:1px solid rgba(51,65,85,.4)" onmouseenter="this.style.background=\'rgba(59,130,246,.08)\';this.style.outline=\'1px solid rgba(59,130,246,.3)\';this.style.outlineOffset=\'-1px\'" onmouseleave="this.style.background=\'\';this.style.outline=\'none\'">'
      +'<td style="padding:10px 10px"><span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:'+levelColor+';color:#fff;font-weight:700;font-size:11px">'+r.id+'</span><span style="font-size:10px;color:#64748b;margin-left:4px">'+item.catId+'</span></td>'
      +'<td style="padding:10px 10px"><div style="font-weight:600;color:#f8fafc">'+r.name+'</div><div style="font-size:10px;color:#475569">'+item.catName+'</div></td>'
      +'<td style="padding:10px 10px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:28px;border-radius:6px;background:'+levelColor+';color:#fff;font-weight:700;font-size:13px">'+r.score+'</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><div style="width:80px;margin:0 auto;height:6px;background:#334155;border-radius:3px;overflow:hidden"><div style="width:'+agiBar+'%;height:100%;background:'+agiColor+';border-radius:3px"></div></div><div style="font-size:9px;color:'+agiColor+';margin-top:2px">'+agiBar+'</div></td>'
      +'<td style="padding:10px 8px;text-align:center"><div style="width:80px;margin:0 auto;height:6px;background:#334155;border-radius:3px;overflow:hidden"><div style="width:'+resBar+'%;height:100%;background:'+resColor+';border-radius:3px"></div></div><div style="font-size:9px;color:'+resColor+';margin-top:2px">'+resBar+'</div></td>'
      +'<td style="padding:10px 8px;text-align:center;font-family:monospace;color:'+(r.tts<7?'#ef4444':'#94a3b8')+'">'+ttsWarn+r.tts+'<span style="font-size:9px;color:#64748b"> 天</span></td>'
      +'<td style="padding:10px 8px;text-align:center;font-family:monospace;color:'+(r.ttr>21?'#f97316':'#94a3b8')+'">'+ttrWarn+r.ttr+'<span style="font-size:9px;color:#64748b"> 天</span></td>'
      +'<td style="padding:10px 8px;text-align:center;font-family:monospace;color:'+varColor+';font-weight:600">¥'+r.var+'<span style="font-size:9px;color:#64748b"> 万</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><span style="color:'+tr.color+';font-weight:700;font-size:14px">'+tr.icon+'</span><span style="font-size:10px;color:'+tr.color+'"> '+tr.label+'</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:'+scorColor+'22;color:'+scorColor+';border:1px solid '+scorColor+'44">'+r.scor.impact+'</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><button style="background:rgba(59,130,246,.2);color:#60a5fa;border:1px solid rgba(59,130,246,.3);border-radius:4px;padding:2px 8px;font-size:10px;cursor:pointer;margin-right:3px" onclick="window._rrSimRisk(\''+r.id+'\',\''+r.name.replace(/'/g,"\\'")+'\')">模拟</button></td>'
      +'</tr>';
  });
  html+='</tbody></table>';
  el.innerHTML=html;
}
window._rrSortMatrix=function(key){
  window._rrSortKey=key;
  window._rrSortDir=-(window._rrSortDir||1);
  initPage_risk();
};
window._rrSimRisk=function(id,name){
  alert('【'+name+'】蒙特卡洛模拟\n\n中断持续时间: 14天\n覆盖范围: 60%\n迭代次数: 100\n\nP10: -8% OTIF\nP50: -23% OTIF\nP90: -41% OTIF\n缺货概率: 34%\n\n（模拟功能后端API对接中）');
};

// ── Quadrant Scatter Chart ──
function renderQuadChart(allRisks){
  var dom=document.getElementById('rrQuadChart'); if(!dom||!window.echarts) return;
  var data=[];
  allRisks.forEach(function(r){
    var rr=r.risk; if(rr.tts>30||rr.ttr>60) return;
    var q=rr.ttr>21?(rr.tts>14?'B':'D'):(rr.tts>14?'A':'C');
    data.push({name:rr.name,value:[rr.ttr,rr.tts,rr.var],level:rr.level,quad:q});
  });
  var chart=echarts.init(dom);
  chart.setOption({
    tooltip:{trigger:'item',backgroundColor:'#1e293b',borderColor:'#334155',textStyle:{color:'#e2e8f0'},
      formatter:function(p){return '<b>'+p.name+'</b><br/>TTR恢复: '+p.value[0]+'天<br/>TTS存活: '+p.value[1]+'天<br/>VAR损失: ¥'+p.value[2]+'万';}},
    legend:{bottom:0,textStyle:{color:'#94a3b8',fontSize:10}},
    grid:{left:55,right:20,top:20,bottom:40},
    xAxis:{name:'TTR 恢复时间（天）',nameTextStyle:{color:'#64748b',fontSize:11},max:60,axisLabel:{color:'#64748b'},splitLine:{lineStyle:{color:'#334155',type:'dashed'}}},
    yAxis:{name:'TTS 存活时间（天）',nameTextStyle:{color:'#64748b',fontSize:11},max:30,axisLabel:{color:'#64748b'},splitLine:{lineStyle:{color:'#334155',type:'dashed'}}},
    series:[
      {name:'P1高危',type:'scatter',data:data.filter(function(d){return d.level==='P1';}).map(function(d){return d.value;}),
        symbolSize:function(v){return Math.max(12,Math.min(40,v[2]/50));},itemStyle:{color:'#ef4444',opacity:.8}},
      {name:'P2中高',type:'scatter',data:data.filter(function(d){return d.level==='P2';}).map(function(d){return d.value;}),
        symbolSize:function(v){return Math.max(10,Math.min(35,v[2]/50));},itemStyle:{color:'#f97316',opacity:.8}},
      {name:'P3中等',type:'scatter',data:data.filter(function(d){return d.level==='P3';}).map(function(d){return d.value;}),
        symbolSize:function(v){return Math.max(8,Math.min(30,v[2]/50));},itemStyle:{color:'#eab308',opacity:.8}},
    ],
    markLine:{silent:true,data:[{xAxis:21,lineStyle:{color:'#ef4444',type:'dashed',width:1},label:{formatter:'TTR=21天',color:'#ef4444',fontSize:10,position:'end'}},
      {yAxis:7,lineStyle:{color:'#ef4444',type:'dashed',width:1},label:{formatter:'TTS=7天',color:'#ef4444',fontSize:10,position:'start'}}]}
  });
  if(App.charts.rrQuad) App.charts.rrQuad.dispose();
  App.charts.rrQuad=chart;
}

// ── TOP 8 Alerts ──
function renderTopAlerts(allRisks){
  var el=document.getElementById('rrTopAlerts'); if(!el) return;
  var top=allRisks.filter(function(r){return r.risk.score>75;}).sort(function(a,b){return b.risk.score-a.risk.score;}).slice(0,8);
  if(!top.length){el.innerHTML='<div style="text-align:center;color:#64748b;padding:40px">暂无高风险项</div>';return;}
  el.innerHTML=top.map(function(item){
    var r=item.risk; var lc=LEVEL_COLORS[r.level]; var tr=TREND_CFG[r.trend];
    var tip=AI_TIPS[r.id]||AI_TIPS.default;
    return '<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px 14px;margin-bottom:8px;border-left:3px solid '+lc+';transition:all .15s" onmouseenter="this.style.borderColor=\'rgba(59,130,246,.5)\';this.style.transform=\'translateX(2px)\'" onmouseleave="this.style.borderColor=\'#334155\';this.style.transform=\'none\'">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<div><span style="background:'+lc+';color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;margin-right:6px">'+r.level+'</span><span style="font-weight:700;color:#f8fafc">'+r.name+'</span></div>'
      +'<span style="color:'+tr.color+';font-weight:700;font-size:14px">'+tr.icon+'</span></div>'
      +'<div style="font-size:10px;color:#64748b;margin-bottom:4px;display:flex;gap:12px;flex-wrap:wrap">'
      +'<span>上行弹性: '+r.agility+'%</span><span>TTS: <b style="color:'+(r.tts<7?'#ef4444':'#94a3b8')+'">'+r.tts+'天</b>'+(r.tts<7?' ⚠':'')+'</span>'
      +'<span>TTR: <b style="color:'+(r.ttr>21?'#f97316':'#94a3b8')+'">'+r.ttr+'天</b></span>'
      +'<span>VAR: <b style="color:'+(r.var>500?'#ef4444':'#94a3b8')+'">¥'+r.var+'万</b></span></div>'
      +'<div style="font-size:10px;color:#64748b;margin-bottom:4px">SCOR: ['+r.scor.impact+'] '+r.scor.indicator+'</div>'
      +'<div style="font-size:10px;color:#475569;font-style:italic;margin-bottom:6px">🤖 '+tip+'</div>'
      +'<div style="display:flex;gap:6px">'
      +'<button style="background:rgba(59,130,246,.2);color:#60a5fa;border:1px solid rgba(59,130,246,.3);border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer" onclick="window._rrSimRisk(\''+r.id+'\',\''+r.name.replace(/'/g,"\\'")+'\')">模拟</button>'
      +'<button style="background:rgba(239,68,68,.2);color:#f87171;border:1px solid rgba(239,68,68,.3);border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer" onclick="alert(\'事件创建中...\')">创建事件</button>'
      +'</div></div>';
  }).join('');
}

// ── Alert Rules ──
function renderAlertRules(){
  var el=document.getElementById('rrRulesBody'); if(!el) return;
  var rules=[
    {name:'单源高危联合预警',logic:'单源物料 AND TTS<7天',status:'triggered',time:'12:58',count:14},
    {name:'需求预测持续偏差',logic:'MAPE>15% 连续3周',status:'critical',time:'11:42',count:8},
    {name:'供应商双失效叠加',logic:'同类物料2家以上延迟',status:'normal',time:'--',count:0},
    {name:'产能利用率顶格',logic:'利用率>90% 持续3天',status:'triggered',time:'12:15',count:11},
    {name:'VAR超限预警',logic:'单项风险VAR>1000万',status:'triggered',time:'12:30',count:6},
    {name:'跨项目物料竞争',logic:'3个以上项目竞争同料号',status:'critical',time:'10:22',count:5},
    {name:'地缘风险叠加',logic:'外部政策风险 AND 关键物料',status:'triggered',time:'12:05',count:9},
    {name:'Tier2穿透盲区',logic:'Tier2可视率<50% AND 采购金额>5%',status:'triggered',time:'11:18',count:12},
    {name:'ESG违规传导',logic:'供应商ESG低评分 AND 大客户审计期',status:'critical',time:'09:55',count:3},
    {name:'库存极端水位',logic:'DOI>90天 OR DOI<5天',status:'critical',time:'12:22',count:7},
  ];
  var stMap={triggered:{tag:'🔴 已触发',color:'#ef4444'},critical:{tag:'🟡 临界',color:'#eab308'},normal:{tag:'🟢 正常',color:'#22c55e'}};
  el.innerHTML=rules.map(function(r){
    var st=stMap[r.status];
    return '<div style="min-width:200px;flex-shrink:0;background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px 14px;transition:all .15s" onmouseenter="this.style.borderColor=\'rgba(139,92,246,.4)\'" onmouseleave="this.style.borderColor=\'#334155\'">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="font-size:12px;font-weight:700;color:#f8fafc">'+r.name+'</span><span style="font-size:9px;color:'+st.color+'">'+st.tag+'</span></div>'
      +'<div style="font-size:9px;color:#64748b;margin-bottom:6px">'+r.logic+'</div>'
      +'<div style="display:flex;gap:12px;font-size:9px;color:#475569"><span>最近: '+r.time+'</span><span>本月: <b style="color:'+(r.count>5?'#ef4444':'#94a3b8')+'">'+r.count+'次</b></span></div>'
      +'</div>';
  }).join('');
}

window.initPage_risk=initPage_risk;
})();
registerModule('risk', initPage_risk);
