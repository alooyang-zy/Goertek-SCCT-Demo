// Module: risk — 风险雷达 v9.1 (SCOR敏捷×韧性·浅色平台风·ECharts)
(function(){
"use strict";

// ═══════════════ 风险数据目录 ═══════════════
var RISK_CATALOG = {
  internal: { label: "内部运营风险", categories: [
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
  ]},
  supply: { label: "供应网络风险", categories: [
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
  ]},
  external: { label: "外部宏观风险", categories: [
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
  ]}
};

var LVL = {P1:{bg:'#dc2626',txt:'#fff',tag:'高危'},P2:{bg:'#f97316',txt:'#fff',tag:'中高'},P3:{bg:'#eab308',txt:'#1e293b',tag:'中等'},P4:{bg:'#22c55e',txt:'#fff',tag:'低危'}};
var TRD = {up:{icon:'↑',color:'#dc2626',label:'恶化'},stable:{icon:'→',color:'#eab308',label:'持平'},down:{icon:'↓',color:'#22c55e',label:'改善'}};
var AI = {
  '7.2':'建议72小时内启动第二货源认证，当前TTS仅3天，缺货风险极高',
  '10.1':'立即核查受管制物料清单，启动合规替代方案评估，TTR达60天',
  '8.1':'启动二级供应商穿透排查，重点关注台积电/大立光上游节点',
  '2.1':'SOP节点评审提前至D-30，锁定V1 BOM并冻结变更窗口',
  '11.3':'启动审计准备清单，对标客户要求逐项自评，预留30天整改期',
  d:'建议在48小时内完成影响范围评估，优先保障P1项目连续性'
};

function allRisks(filter){
  var a=[];
  ['internal','supply','external'].forEach(function(ck){
    if(filter&&filter!=='all'&&filter!==ck) return;
    var cat=RISK_CATALOG[ck];
    cat.categories.forEach(function(c){
      c.risks.forEach(function(r){ a.push({catKey:ck,catLabel:cat.label,catName:c.name,catId:c.id,risk:r}); });
    });
  });
  return a;
}

// ═══ 主入口 ═══
function initPage_risk(){
  try{
    var fp=(typeof getFilteredProjects==='function')?getFilteredProjects():(typeof projects!=='undefined'?projects:[]);
    var sel=document.getElementById('riskProjectSelect');
    if(sel&&typeof fillProjectSelect==='function') fillProjectSelect(sel,fp);
    if(typeof consumeDrillDown==='function') consumeDrillDown('riskProjectSelect');
    var pid=sel?sel.value:'';
    var p=pid&&typeof projects!=='undefined'?projects.find(function(x){return x.id===pid;}):null;
    if(!p&&fp.length){p=fp[0];pid=p.id;if(sel)sel.value=pid;}

    var catF=document.getElementById('riskCatFilter');
    var filter=catF?catF.value:'all';
    var risks=allRisks(filter);
    var n=risks.length||1;

    var p1=0,p2=0,p3=0,ts=0,ta=0,trs=0,tts=0,ttr=0,alerts=0;
    risks.forEach(function(r){
      var rr=r.risk; ts+=rr.score; ta+=rr.agility; trs+=rr.resilience; tts+=rr.tts; ttr+=rr.ttr;
      if(rr.level==='P1')p1++; else if(rr.level==='P2')p2++; else p3++;
      if(rr.tts<7)alerts++;
    });
    var avgS=Math.round(ts/n),avgA=Math.round(ta/n),avgR=Math.round(trs/n);
    var avgTts=Math.round(tts/n*10)/10,avgTtr=Math.round(ttr/n*10)/10;

    // Info inline
    var inf=document.getElementById('rrInfoInline');
    if(inf && p){inf.innerHTML='<span style="font-weight:700;color:var(--primary);margin-right:8px">'+p.name+'</span>'
      +'<span style="font-size:11px;color:var(--text-sec)"><b>客户</b> '+p.customer+'</span>'
      +'<span style="font-size:11px;color:var(--text-sec)"><b>产品线</b> '+p.productLine+'</span>'
      +'<span style="font-size:11px;color:var(--text-sec)"><b>风险项</b> <em style="color:var(--danger);font-style:normal;font-weight:700">'+risks.length+'</em></span>';}

    renderKpi(avgS,avgA,avgR,p1,p2,p3,avgTts,avgTtr,alerts);
    renderRadar(risks);
    renderTrend();
    renderMatrix(risks,filter);
    renderQuad(risks);
    renderTop8(risks);
    renderRules();

    // resize charts after DOM update
    setTimeout(function(){
      if(App.charts.rrRadar)App.charts.rrRadar.resize();
      if(App.charts.rrTrend)App.charts.rrTrend.resize();
      if(App.charts.rrQuad)App.charts.rrQuad.resize();
    },200);

  }catch(e){console.error('risk init error:',e);}
}

// ── KPI Cards ──
function renderKpi(avgS,avgA,avgR,p1,p2,p3,avgTts,avgTtr,alerts){
  var el=document.getElementById('rrKpiRow'); if(!el) return;
  var sc=avgS>=70?'var(--danger)':avgS>=50?'var(--warning)':'var(--success)';
  var ac=avgA>=60?'var(--success)':avgA>=40?'var(--warning)':'var(--danger)';
  var rc=avgR>=60?'var(--success)':avgR>=40?'var(--warning)':'var(--danger)';
  var st=avgS>=70?'高危':avgS>=50?'中高':'中等';
  var at=avgA<40?'脆弱':avgA<60?'需关注':'健康';
  var rt=avgR<40?'韧性脆弱':avgR<60?'需加固':'稳健';
  el.innerHTML=[
    {v:avgS,sub:'较昨日 ▲+3  较上周 ▲+8',label:'综合风险指数',tag:st,tc:sc,bar:avgS,bc:sc,ic:'fa-gauge-high',vv:avgS>=70?'var(--danger)':avgS>=50?'var(--warning)':'var(--success)'},
    {v:avgA,sub:'上行弹性+18% / 下行弹性-22%',label:'SCOR敏捷性评分',tag:at,tc:ac,bar:100-avgA,bc:ac,ic:'fa-bolt',vv:ac,extra:'最弱项：单源依赖导致弹性受限',extraC:'var(--text-muted)'},
    {v:avgR,sub:'平均TTS: '+avgTts+'天 / 平均TTR: '+avgTtr+'天',label:'SCOR韧性评分',tag:rt,tc:rc,bar:100-avgR,bc:rc,ic:'fa-shield-halved',vv:rc,extra:alerts+'个节点TTS&lt;7天处于危险区',extraC:'var(--text-muted)'},
    {v:p1+p2+p3,sub:'<span style=\"color:var(--danger);font-weight:700\">P1:'+p1+'</span>  <span style=\"color:var(--warning);font-weight:700\">P2:'+p2+'</span>  <span style=\"color:var(--text-muted);font-weight:700\">P3:'+p3+'</span>',label:'活跃风险事件',tag:'本周新增4项',tc:'var(--warning)',bar:0,bc:'',ic:'fa-triangle-exclamation',vv:'var(--text)',unit:'项'}
  ].map(function(k){
    return '<div class="npi-card" style="border-top:3px solid '+k.tc+'">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
      +'<i class="fas '+k.ic+'" style="color:'+k.tc+';font-size:14px"></i>'
      +'<span class="x-pill" style="font-size:10px;padding:2px 8px;border-radius:10px;background:'+k.tc+';color:#fff">'+k.tag+'</span></div>'
      +'<div style="font-size:28px;font-weight:800;line-height:1.1;color:'+k.vv+'">'+k.v+(k.unit||'')+'</div>'
      +'<div style="font-size:11px;color:var(--text-muted);margin:4px 0;line-height:1.5">'+k.sub+'</div>'
      +(k.extra?'<div style="font-size:10px;color:'+(k.extraC||'var(--text-muted)')+';margin-bottom:4px">'+k.extra+'</div>':'')
      +(k.bar>0?'<div style="height:3px;background:var(--border-light);border-radius:2px;margin-top:6px;overflow:hidden"><div style="width:'+k.bar+'%;height:100%;background:'+k.bc+';border-radius:2px"></div></div>':'')
      +'</div>';
  }).join('');
}

// ── SCOR Radar ──
function renderRadar(risks){
  var dom=document.getElementById('rrRadarChart'); if(!dom||!window.echarts) return;
  dom.style.width='100%'; dom.style.height='320px';
  var dims={可靠性:[],响应性:[],敏捷性:[],成本:[],资产韧性:[]};
  var keys=['可靠性','响应性','敏捷性','成本','资产韧性'];
  risks.forEach(function(r){
    var imp=r.risk.scor.impact;
    if(keys.indexOf(imp)>=0) dims[imp].push(r.risk.score);
    else dims['资产韧性'].push(r.risk.score); // fallback
  });
  var cur=[],base=[];
  keys.forEach(function(k){
    var arr=dims[k]; var avg=arr.length?Math.round(arr.reduce(function(a,b){return a+b;},0)/arr.length):50;
    cur.push(avg); base.push(Math.max(30,avg-15));
  });
  if(App.charts.rrRadar)try{App.charts.rrRadar.dispose();}catch(e){}
  var ch=echarts.init(dom);
  ch.setOption({
    tooltip:{},
    legend:{bottom:0,textStyle:{fontSize:11}},
    radar:{center:['50%','45%'],radius:'60%',axisName:{fontSize:11},
      indicator:keys.map(function(k){return{name:k,max:100};})},
    series:[
      {name:'当前风险',type:'radar',data:[{value:cur,name:'当前'}],symbol:'circle',symbolSize:6,
        lineStyle:{color:'#dc2626',width:2},areaStyle:{color:'rgba(220,38,38,.1)'},itemStyle:{color:'#dc2626'}},
      {name:'目标基线',type:'radar',data:[{value:base,name:'目标'}],symbol:'diamond',symbolSize:5,
        lineStyle:{color:'#3b82f6',width:2,type:'dashed'},areaStyle:{color:'rgba(59,130,246,.05)'},itemStyle:{color:'#3b82f6'}}
    ]
  });
  App.charts.rrRadar=ch;
}

// ── Trend Chart ──
function renderTrend(){
  var dom=document.getElementById('rrTrendChart'); if(!dom||!window.echarts) return;
  dom.style.width='100%'; dom.style.height='320px';
  var days=30,comp=[],agi=[],resil=[],labels=[];
  for(var i=0;i<days;i++){
    var d=days-i; labels.push('6/'+d);
    comp.push(Math.round(62+i*0.5+Math.sin(i*0.5)*5+(i>20?4:0)));
    agi.push(Math.round(48+i*0.3+Math.cos(i*0.8)*4+(i>18?6:0)));
    resil.push(Math.round(38+i*0.35+Math.sin(i*0.6)*6+(i>22?8:0)));
  }
  if(App.charts.rrTrend)try{App.charts.rrTrend.dispose();}catch(e){}
  var ch=echarts.init(dom);
  ch.setOption({
    tooltip:{trigger:'axis'},
    legend:{bottom:0},
    grid:{left:50,right:30,top:20,bottom:40},
    xAxis:{type:'category',data:labels,axisLabel:{fontSize:9,rotate:-45,interval:4}},
    yAxis:{type:'value',min:0,max:100},
    series:[
      {name:'综合风险',type:'line',data:comp,smooth:true,lineStyle:{color:'#dc2626',width:2},itemStyle:{color:'#dc2626'},symbol:'circle',symbolSize:4},
      {name:'敏捷性风险',type:'line',data:agi,smooth:true,lineStyle:{color:'#f97316',width:2},itemStyle:{color:'#f97316'},symbol:'diamond',symbolSize:4},
      {name:'韧性风险',type:'line',data:resil,smooth:true,lineStyle:{color:'#3b82f6',width:2},itemStyle:{color:'#3b82f6'},symbol:'triangle',symbolSize:5}
    ]
  });
  App.charts.rrTrend=ch;
}

// ── Heat Matrix ──
function renderMatrix(risks,filter){
  var el=document.getElementById('rrMatrixWrap'); if(!el) return;
  var groups=[];
  ['internal','supply','external'].forEach(function(ck){
    if(filter!=='all'&&filter!==ck)return;
    var cat=RISK_CATALOG[ck]; var items=[];
    cat.categories.forEach(function(c){c.risks.forEach(function(r){items.push({risk:r,catName:c.name,catId:c.id});});});
    if(items.length) groups.push({label:cat.label,items:items});
  });
  var flat=[];
  groups.forEach(function(g){
    flat.push({type:'h',label:g.label});
    g.items.forEach(function(r){flat.push(r);});
  });
  var countEl=document.getElementById('rrMatrixCount');
  if(countEl) countEl.textContent='共 '+flat.filter(function(x){return!x.type;}).length+' 个风险领域';

  var h='<table style="width:100%;border-collapse:collapse;min-width:1200px;font-size:12px">'
    +'<thead><tr style="background:var(--primary-bg)">'
    +'<th style="padding:8px 10px;text-align:left;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">风险代码</th>'
    +'<th style="padding:8px 10px;text-align:left;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">风险领域</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);cursor:pointer" onclick="window._rrSort(\'score\')">综合评分 ▾</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);cursor:pointer" onclick="window._rrSort(\'agility\')">敏捷性</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);cursor:pointer" onclick="window._rrSort(\'resilience\')">韧性</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">TTS存活</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">TTR恢复</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">VAR损失</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">趋势</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">SCOR维度</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border)">操作</th>'
    +'</tr></thead><tbody>';

  flat.forEach(function(item){
    if(item.type==='h'){
      h+='<tr style="background:var(--primary-bg)"><td colspan="11" style="padding:7px 14px;font-size:11px;font-weight:700;color:var(--text-sec);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--border)">'+item.label+'</td></tr>';
      return;
    }
    var r=item.risk; var lcl=LVL[r.level];
    var tr=TRD[r.trend];
    var ab=r.agility, ac=ab<40?'var(--danger)':ab<60?'var(--warning)':'var(--success)';
    var rb=r.resilience, rc=rb<40?'var(--danger)':rb<60?'var(--warning)':'var(--success)';
    var ttsW=r.tts<7?'<i class="fas fa-exclamation-triangle" style="color:var(--danger);font-size:9px;margin-right:2px"></i>':'';
    var ttrW=r.ttr>21?'<i class="fas fa-exclamation-triangle" style="color:var(--warning);font-size:9px;margin-right:2px"></i>':'';
    var vc=r.var>500?'var(--danger)':r.var>200?'var(--warning)':'var(--text)';
    var scorMap={可靠性:'var(--primary)',响应性:'var(--warning)',敏捷性:'var(--success)',成本:'#8b5cf6',韧性:'var(--danger)'};
    var scl=scorMap[r.scor.impact]||'var(--text)';
    h+='<tr style="transition:all .15s;border-bottom:1px solid var(--border-light)" onmouseenter="this.style.background=\'var(--primary-bg)\'" onmouseleave="this.style.background=\'\'">'
      +'<td style="padding:10px 10px"><span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:'+lcl.bg+';color:'+lcl.txt+';font-weight:700;font-size:10px">'+r.id+'</span><span style="font-size:10px;color:var(--text-muted);margin-left:4px">'+item.catId+'</span></td>'
      +'<td style="padding:10px 10px"><div style="font-weight:600;color:var(--text)">'+r.name+'</div><div style="font-size:10px;color:var(--text-muted)">'+item.catName+'</div></td>'
      +'<td style="padding:10px 10px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:24px;border-radius:6px;background:'+lcl.bg+';color:'+lcl.txt+';font-weight:700;font-size:12px">'+r.score+'</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><div style="width:70px;margin:0 auto;height:6px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="width:'+ab+'%;height:100%;background:'+ac+';border-radius:3px"></div></div><div style="font-size:9px;color:'+ac+';margin-top:2px">'+ab+'</div></td>'
      +'<td style="padding:10px 8px;text-align:center"><div style="width:70px;margin:0 auto;height:6px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="width:'+rb+'%;height:100%;background:'+rc+';border-radius:3px"></div></div><div style="font-size:9px;color:'+rc+';margin-top:2px">'+rb+'</div></td>'
      +'<td style="padding:10px 8px;text-align:center;font-family:monospace;color:'+(r.tts<7?'var(--danger)':'var(--text)')+';font-weight:600">'+ttsW+r.tts+'<span style="font-size:9px;color:var(--text-muted)"> 天</span></td>'
      +'<td style="padding:10px 8px;text-align:center;font-family:monospace;color:'+(r.ttr>21?'var(--warning)':'var(--text)')+';font-weight:600">'+ttrW+r.ttr+'<span style="font-size:9px;color:var(--text-muted)"> 天</span></td>'
      +'<td style="padding:10px 8px;text-align:center;font-family:monospace;color:'+vc+';font-weight:600">¥'+r.var+'<span style="font-size:9px;color:var(--text-muted)"> 万</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><span style="color:'+tr.color+';font-weight:700;font-size:14px">'+tr.icon+'</span><span style="font-size:10px;color:'+tr.color+'"> '+tr.label+'</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:'+scl+'22;color:'+scl+';border:1px solid '+scl+'44">'+r.scor.impact+'</span></td>'
      +'<td style="padding:10px 8px;text-align:center"><button style="background:var(--primary);color:#fff;border:none;border-radius:4px;padding:2px 8px;font-size:10px;cursor:pointer" onclick="window._rrSim(\''+r.id+'\',\''+r.name.replace(/'/g,"\\'")+'\')">模拟</button></td>'
      +'</tr>';
  });
  h+='</tbody></table>';
  el.innerHTML=h;
}

window._rrSort=function(key){
  window._rrSortKey=key; window._rrSortDir=-(window._rrSortDir||1);
  initPage_risk();
};
window._rrSim=function(id,name){
  alert('【'+name+'】蒙特卡洛模拟\n\n中断持续时间: 14天 | 覆盖范围: 60%\n迭代次数: 100\n\nP10: -8% OTIF\nP50: -23% OTIF\nP90: -41% OTIF\n缺货概率: 34%\n\n（模拟功能后端API对接中）');
};

// ── Quadrant Scatter ──
function renderQuad(risks){
  var dom=document.getElementById('rrQuadChart'); if(!dom||!window.echarts) return;
  dom.style.width='100%'; dom.style.height='360px';
  var p1d=[],p2d=[],p3d=[];
  risks.forEach(function(r){
    var rr=r.risk; if(rr.tts>30||rr.ttr>60)return;
    var pt={name:rr.name,value:[rr.ttr,rr.tts,rr.var]};
    if(rr.level==='P1')p1d.push(pt); else if(rr.level==='P2')p2d.push(pt); else p3d.push(pt);
  });
  if(App.charts.rrQuad)try{App.charts.rrQuad.dispose();}catch(e){}
  var ch=echarts.init(dom);
  ch.setOption({
    tooltip:{trigger:'item',formatter:function(p){return '<b>'+p.name+'</b><br/>TTR: '+p.value[0]+'天<br/>TTS: '+p.value[1]+'天<br/>VAR: ¥'+p.value[2]+'万';}},
    legend:{bottom:0},
    grid:{left:55,right:20,top:20,bottom:40},
    xAxis:{name:'TTR 恢复时间（天）',max:60},
    yAxis:{name:'TTS 存活时间（天）',max:30},
    series:[
      {name:'P1高危',type:'scatter',data:p1d,symbolSize:function(v){return Math.max(10,Math.min(40,v[2]/50));},itemStyle:{color:'#dc2626',opacity:.8}},
      {name:'P2中高',type:'scatter',data:p2d,symbolSize:function(v){return Math.max(8,Math.min(32,v[2]/50));},itemStyle:{color:'#f97316',opacity:.8}},
      {name:'P3中等',type:'scatter',data:p3d,symbolSize:function(v){return Math.max(6,Math.min(26,v[2]/50));},itemStyle:{color:'#eab308',opacity:.8}},
    ]
  });
  App.charts.rrQuad=ch;
}

// ── TOP 8 Alerts ──
function renderTop8(risks){
  var el=document.getElementById('rrTopAlerts'); if(!el) return;
  var top=risks.filter(function(r){return r.risk.score>75;}).sort(function(a,b){return b.risk.score-a.risk.score;}).slice(0,8);
  if(!top.length){el.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:30px">暂无高风险项</div>';return;}
  el.innerHTML=top.map(function(item){
    var r=item.risk; var lcl=LVL[r.level]; var tr=TRD[r.trend];
    var tip=AI[r.id]||AI.d;
    return '<div style="background:var(--card);border:1px solid var(--border-light);border-radius:8px;padding:12px 14px;margin-bottom:8px;border-left:4px solid '+lcl.bg+'" onmouseenter="this.style.borderColor=\'var(--primary)\';this.style.boxShadow=\'var(--shadow-md)\'" onmouseleave="this.style.borderColor=\'var(--border-light)\';this.style.boxShadow=\'none\'">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<div><span style="background:'+lcl.bg+';color:'+lcl.txt+';padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;margin-right:6px">'+r.level+'</span><span style="font-weight:700;color:var(--text)">'+r.name+'</span></div>'
      +'<span style="color:'+tr.color+';font-weight:700;font-size:14px">'+tr.icon+'</span></div>'
      +'<div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;display:flex;gap:12px;flex-wrap:wrap">'
      +'<span>弹性: '+r.agility+'%</span><span>TTS: <b style="color:'+(r.tts<7?'var(--danger)':'var(--text)')+'">'+r.tts+'天</b>'+(r.tts<7?' ⚠':'')+'</span>'
      +'<span>TTR: <b style="color:'+(r.ttr>21?'var(--warning)':'var(--text)')+'">'+r.ttr+'天</b></span>'
      +'<span>VAR: <b style="color:'+(r.var>500?'var(--danger)':'var(--text)')+'">¥'+r.var+'万</b></span></div>'
      +'<div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">SCOR: ['+r.scor.impact+'] '+r.scor.indicator+'</div>'
      +'<div style="font-size:10px;color:var(--text-sec);font-style:italic;margin-bottom:8px">🤖 '+tip+'</div>'
      +'<div style="display:flex;gap:6px">'
      +'<button style="background:var(--primary);color:#fff;border:none;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer" onclick="window._rrSim(\''+r.id+'\',\''+r.name.replace(/'/g,"\\'")+'\')">模拟</button>'
      +'<button style="background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger);border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer" onclick="alert(\'事件创建中...\')">创建事件</button>'
      +'</div></div>';
  }).join('');
}

// ── Alert Rules ──
function renderRules(){
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
  var stMap={triggered:{tag:'🔴 已触发',color:'var(--danger)',bg:'var(--danger-bg)'},critical:{tag:'🟡 临界',color:'var(--warning)',bg:'var(--warning-bg)'},normal:{tag:'🟢 正常',color:'var(--success)',bg:'var(--success-bg)'}};
  el.innerHTML=rules.map(function(r){
    var st=stMap[r.status];
    return '<div style="min-width:200px;flex-shrink:0;background:var(--card);border:1px solid var(--border-light);border-radius:8px;padding:12px 14px;transition:all .15s" onmouseenter="this.style.borderColor=\'#8b5cf6\'" onmouseleave="this.style.borderColor=\'var(--border-light)\'">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="font-size:12px;font-weight:700;color:var(--text)">'+r.name+'</span><span style="font-size:9px;font-weight:600;padding:1px 6px;border-radius:4px;color:'+st.color+';background:'+st.bg+'">'+st.tag+'</span></div>'
      +'<div style="font-size:9px;color:var(--text-muted);margin-bottom:6px">'+r.logic+'</div>'
      +'<div style="display:flex;gap:12px;font-size:9px;color:var(--text-muted)"><span>最近: '+r.time+'</span><span>本月: <b style="color:'+(r.count>5?'var(--danger)':'var(--text)')+'">'+r.count+'次</b></span></div>'
      +'</div>';
  }).join('');
}

window.initPage_risk=initPage_risk;
})();
registerModule('risk', initPage_risk);
