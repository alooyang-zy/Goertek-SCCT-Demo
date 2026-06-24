// Module: risk — 风险雷达 v9.1 (SCOR敏捷×韧性·浅色平台风·ECharts)
(function(){
"use strict";

// ═══════════════ 风险数据目录（13类核心风险）══════════════
var RISK_CATALOG = [
  // ── 内部运营风险 ──────────────────────────────────────────
  { id:"R01", group:"内部运营", groupColor:"#3b82f6", name:"需求预测失准", desc:"客户PO与预测持续偏差，导致计划失效、备料错误", scor:"响应性", indicator:"需求预测偏差 MAPE", score:72, agility:68, resilience:58, tts:10, ttr:10, var:320, level:"P2", trend:"up", alertRule:"MAPE > 15% 连续3周", aiAdvice:"锁定未来4周滚动预测，触发S&OP紧急评审，同步备料计划" },
  { id:"R02", group:"内部运营", groupColor:"#3b82f6", name:"NPI/ECN工程变更冲击", desc:"新品导入或工程变更引发BOM变动、物料呆滞和产能重排", scor:"敏捷性", indicator:"SOP计划偏差天数 / ECN执行及时率", score:81, agility:42, resilience:40, tts:5, ttr:18, var:680, level:"P1", trend:"up", alertRule:"SOP偏差>7天 OR ECN执行率<95%", aiAdvice:"SOP节点评审提前至D-30，冻结BOM变更窗口，锁定首批物料" },
  { id:"R03", group:"内部运营", groupColor:"#3b82f6", name:"物料缺料断供", desc:"关键物料库存不足或断档，直接导致工单停产", scor:"可靠性", indicator:"缺料BOM占比 / 物料覆盖天数", score:88, agility:38, resilience:32, tts:3, ttr:22, var:920, level:"P1", trend:"up", alertRule:"缺料BOM占比>5% OR 覆盖天数<5天", aiAdvice:"48小时内触发紧急采购或跨项目调拨，优先保障P1项目工单" },
  { id:"R04", group:"内部运营", groupColor:"#3b82f6", name:"EOL/E&O库存风险", desc:"停产物料未消化或需求缩减导致呆滞库存持续积累", scor:"资产效率", indicator:"E&O金额占比 / EOL库存消化率", score:46, agility:44, resilience:70, tts:45, ttr:25, var:480, level:"P3", trend:"down", alertRule:"E&O占比>3% OR EOL消化率<80%", aiAdvice:"启动跨项目E&O消化评审，优先替代使用或协商供应商退货" },
  { id:"R05", group:"内部运营", groupColor:"#3b82f6", name:"出货履约风险", desc:"客户订单无法按时按量交付，影响OTIF和客户关系", scor:"可靠性", indicator:"OTIF完美订单率", score:69, agility:72, resilience:55, tts:8, ttr:10, var:350, level:"P2", trend:"up", alertRule:"OTIF<95% 连续2周 OR 单笔订单延迟>3天", aiAdvice:"触发交付预警，联动排产和物流资源优先保障，客户提前沟通" },
  // ── 供应网络风险 ──────────────────────────────────────────
  { id:"R06", group:"供应网络", groupColor:"#8b5cf6", name:"供应商交付稳定性", desc:"供应商交期承诺可靠性下降，来料延迟影响计划执行", scor:"可靠性", indicator:"供应商OTIF率 / 延迟频次", score:74, agility:65, resilience:52, tts:8, ttr:14, var:430, level:"P2", trend:"up", alertRule:"供应商OTIF<90% OR 单月延迟次数>3次", aiAdvice:"启动供应商约谈机制，同步激活备用供应商预案" },
  { id:"R07", group:"供应网络", groupColor:"#8b5cf6", name:"来料质量异常", desc:"来料批次不合格率上升，导致IQC拦截或直通率下降", scor:"可靠性", indicator:"IQC来料合格率 / 批次不合格率", score:66, agility:60, resilience:58, tts:7, ttr:14, var:290, level:"P2", trend:"stable", alertRule:"IQC合格率<99% 连续2批 OR 单批不合格率>5%", aiAdvice:"立即隔离问题批次，触发供应商8D响应，评估库存缓冲是否充足" },
  { id:"R08", group:"供应网络", groupColor:"#8b5cf6", name:"单源依赖断供", desc:"关键物料仅有单一供应商，一旦中断无替代来源", scor:"韧性", indicator:"单源物料占比 / 单源物料TTS", score:91, agility:28, resilience:22, tts:3, ttr:45, var:1200, level:"P1", trend:"up", alertRule:"单源物料 AND TTS<7天", aiAdvice:"72小时内启动第二货源认证，同步评估安全库存拉升至21天" },
  { id:"R09", group:"供应网络", groupColor:"#8b5cf6", name:"Tier-N隐性断链", desc:"二级及以上供应商中断，传导周期长且预警窗口极短", scor:"韧性", indicator:"Tier2+可视化覆盖率 / 隐性依赖节点数", score:85, agility:32, resilience:25, tts:4, ttr:40, var:1050, level:"P1", trend:"up", alertRule:"Tier2可视率<50% AND 该物料采购金额>总额5%", aiAdvice:"启动二级供应商穿透排查，重点关注台积电/大立光上游原材料节点" },
  // ── 外部宏观风险 ──────────────────────────────────────────
  { id:"R10", group:"外部宏观", groupColor:"#f97316", name:"干线物流中断", desc:"主要航运/陆运通道中断或严重延误，影响全球交付时效", scor:"响应性", indicator:"干线准时到港率 / 平均在途时长", score:76, agility:62, resilience:42, tts:6, ttr:18, var:620, level:"P2", trend:"up", alertRule:"干线准时率<85% OR 单条航线延迟>5天", aiAdvice:"评估空运替代成本，优先保障P1项目；中长期增加多港中转预案" },
  { id:"R11", group:"外部宏观", groupColor:"#f97316", name:"贸易合规与制裁", desc:"出口管制、关税政策或实体清单变动影响物料采购和产品出货", scor:"韧性", indicator:"受管制物料使用率 / 关税成本变动幅度", score:88, agility:30, resilience:28, tts:1, ttr:60, var:2100, level:"P1", trend:"up", alertRule:"涉管制物料被列入制裁清单 OR 关税单次变化>5%", aiAdvice:"立即核查受影响物料清单，启动合规替代评估，TTR长达60天须提前布局" },
  { id:"R12", group:"外部宏观", groupColor:"#f97316", name:"大客户审计准入", desc:"Apple/Meta等大客户质量或ESG审计不通过，影响准入资格", scor:"韧性", indicator:"大客户审计通过率 / 整改关闭及时率", score:78, agility:38, resilience:35, tts:5, ttr:30, var:1500, level:"P1", trend:"up", alertRule:"审计发现Major NC OR 整改超期未关闭", aiAdvice:"启动审计准备清单，对标客户要求逐项自评，预留30天整改缓冲期" },
  { id:"R13", group:"外部宏观", groupColor:"#f97316", name:"地缘与突发事件", desc:"台风/地震/疫情/战争等黑天鹅事件导致工厂或通道不可用", scor:"韧性", indicator:"受影响工厂产能占比 / 备用基地切换时效", score:82, agility:35, resilience:30, tts:2, ttr:35, var:1800, level:"P1", trend:"stable", alertRule:"外部预警信号触发（台风路径/地震/政策突发）", aiAdvice:"激活业务连续性计划(BCP)，评估歌尔潍坊/重庆备用基地覆盖能力" }
];

var LVL = {P1:{bg:'#dc2626',txt:'#fff',tag:'高危'},P2:{bg:'#f97316',txt:'#fff',tag:'中高'},P3:{bg:'#eab308',txt:'#1e293b',tag:'中等'},P4:{bg:'#22c55e',txt:'#fff',tag:'低危'}};
var TRD = {up:{icon:'↑',color:'#dc2626',label:'恶化'},stable:{icon:'→',color:'#eab308',label:'持平'},down:{icon:'↓',color:'#22c55e',label:'改善'}};
function allRisks(filter){
  if(!filter||filter==='all') return RISK_CATALOG.slice();
  var map={internal:'内部运营',supply:'供应网络',external:'外部宏观'};
  var target=map[filter]||'';
  return RISK_CATALOG.filter(function(r){return r.group===target;});
}

// ═══ 主入口 ═══
function initPage_risk(){
  var fp = getFilteredProjects();
  var sel = document.getElementById('riskProjectSelect');
  if(sel) fillProjectSelect(sel, fp);
  consumeDrillDown('riskProjectSelect');
  var pid = sel ? sel.value : '';
  var p = pid ? projects.find(function(x){return x.id===pid;}) : null;
  if(!p && fp.length){ p = fp[0]; pid = p.id; if(sel) sel.value = pid; }
  if(!p) return;

  function _renderCore(){
    var catF=document.getElementById('riskCatFilter');
    var filter=catF?catF.value:'all';
    var risks=allRisks(filter);
    var n=risks.length||1;

    var p1=0,p2=0,p3=0,ts=0,ta=0,trs=0,tts=0,ttr=0,alerts=0;
    risks.forEach(function(r){
      ts+=r.score; ta+=r.agility; trs+=r.resilience; tts+=r.tts; ttr+=r.ttr;
      if(r.level==='P1')p1++; else if(r.level==='P2')p2++; else p3++;
      if(r.tts<7)alerts++;
    });
    var avgS=Math.round(ts/n),avgA=Math.round(ta/n),avgR=Math.round(trs/n);
    var avgTts=Math.round(tts/n*10)/10,avgTtr=Math.round(ttr/n*10)/10;

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

    setTimeout(function(){
      if(App.charts.rrRadar)App.charts.rrRadar.resize();
      if(App.charts.rrTrend)App.charts.rrTrend.resize();
      if(App.charts.rrQuad)App.charts.rrQuad.resize();
    },200);
  }

  if(window.echarts){ _renderCore(); }
  else {
    var wait = setInterval(function(){
      if(window.echarts){ clearInterval(wait); _renderCore(); }
    }, 100);
    setTimeout(function(){ clearInterval(wait); }, 5000);
  }
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
    if(keys.indexOf(r.scor)>=0) dims[r.scor].push(r.score);
    else dims['资产韧性'].push(r.score);
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
function renderMatrix(fullList,filter){
  var el=document.getElementById('rrMatrixWrap'); if(!el) return;
  // group by group field
  var groups=[]; var seen={};
  ['内部运营','供应网络','外部宏观'].forEach(function(gname){
    var items=fullList.filter(function(r){return r.group===gname;});
    if(!items.length) return;
    var gc=items[0].groupColor;
    groups.push({label:gname,color:gc,items:items});
  });
  // filter groups
  if(filter!=='all'){
    var map={internal:'内部运营',supply:'供应网络',external:'外部宏观'};
    var target=map[filter]||'';
    groups=groups.filter(function(g){return g.label===target;});
  }
  var flat=[];
  groups.forEach(function(g){
    flat.push({type:'h',label:g.label,color:g.color});
    g.items.forEach(function(r){flat.push(r);});
  });
  var countEl=document.getElementById('rrMatrixCount');
  if(countEl) countEl.textContent='共 '+flat.filter(function(x){return!x.type;}).length+' 个风险领域';

  var h='<table style="width:100%;border-collapse:collapse;min-width:1200px;font-size:12px">'
    +'<thead><tr style="background:var(--primary-bg)">'
    +'<th style="padding:8px 10px;text-align:left;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">代码</th>'
    +'<th style="padding:8px 10px;text-align:left;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">风险领域</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">描述</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);cursor:pointer;white-space:nowrap" onclick="window._rrSort(\'score\')">综合 ▾</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);cursor:pointer;white-space:nowrap" onclick="window._rrSort(\'agility\')">敏捷性</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);cursor:pointer;white-space:nowrap" onclick="window._rrSort(\'resilience\')">韧性</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">TTS</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">TTR</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">VAR</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">趋势</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">SCOR</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">预警规则</th>'
    +'<th style="padding:8px 10px;text-align:center;color:var(--text-sec);font-size:10px;font-weight:600;border-bottom:1px solid var(--border);white-space:nowrap">操作</th>'
    +'</tr></thead><tbody>';

  flat.forEach(function(item){
    if(item.type==='h'){
      h+='<tr style="background:var(--primary-bg)"><td colspan="13" style="padding:7px 14px;font-size:11px;font-weight:700;color:var(--text-sec);letter-spacing:.04em;border-bottom:1px solid var(--border)"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+item.color+';margin-right:6px;vertical-align:middle"></span>'+item.label+'</td></tr>';
      return;
    }
    var r=item; var lcl=LVL[r.level]; var tr=TRD[r.trend];
    var ab=r.agility, ac=ab<40?'var(--danger)':ab<60?'var(--warning)':'var(--success)';
    var rb=r.resilience, rc=rb<40?'var(--danger)':rb<60?'var(--warning)':'var(--success)';
    var ttsW=r.tts<7?'<i class="fas fa-exclamation-triangle" style="color:var(--danger);font-size:9px;margin-right:2px"></i>':'';
    var ttrW=r.ttr>21?'<i class="fas fa-exclamation-triangle" style="color:var(--warning);font-size:9px;margin-right:2px"></i>':'';
    var vc=r.var>500?'var(--danger)':r.var>200?'var(--warning)':'var(--text)';
    var scorMap={可靠性:'var(--primary)',响应性:'var(--warning)',敏捷性:'var(--success)',成本:'var(--primary-light)',韧性:'var(--danger)',资产效率:'#8b5cf6'};
    var scl=scorMap[r.scor]||'var(--text)';
    h+='<tr style="transition:all .15s;border-bottom:1px solid var(--border-light)" onmouseenter="this.style.background=\'var(--primary-bg)\'" onmouseleave="this.style.background=\'\'">'
      +'<td style="padding:8px 8px"><span style="display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:22px;border-radius:5px;background:'+lcl.bg+';color:'+lcl.txt+';font-weight:700;font-size:10px;padding:0 6px">'+r.id+'</span></td>'
      +'<td style="padding:8px 8px"><div style="font-weight:600;color:var(--text)">'+r.name+'</div></td>'
      +'<td style="padding:8px 8px;max-width:200px"><div style="font-size:10px;color:var(--text-muted);line-height:1.3">'+r.desc+'</div></td>'
      +'<td style="padding:8px 6px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:22px;border-radius:5px;background:'+lcl.bg+';color:'+lcl.txt+';font-weight:700;font-size:11px">'+r.score+'</span></td>'
      +'<td style="padding:8px 4px;text-align:center"><div style="width:60px;margin:0 auto;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="width:'+ab+'%;height:100%;background:'+ac+';border-radius:3px"></div></div><div style="font-size:9px;color:'+ac+';margin-top:2px">'+ab+'</div></td>'
      +'<td style="padding:8px 4px;text-align:center"><div style="width:60px;margin:0 auto;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="width:'+rb+'%;height:100%;background:'+rc+';border-radius:3px"></div></div><div style="font-size:9px;color:'+rc+';margin-top:2px">'+rb+'</div></td>'
      +'<td style="padding:8px 4px;text-align:center;font-family:monospace;color:'+(r.tts<7?'var(--danger)':'var(--text)')+';font-weight:600">'+ttsW+r.tts+'天</td>'
      +'<td style="padding:8px 4px;text-align:center;font-family:monospace;color:'+(r.ttr>21?'var(--warning)':'var(--text)')+';font-weight:600">'+ttrW+r.ttr+'天</td>'
      +'<td style="padding:8px 4px;text-align:center;font-family:monospace;color:'+vc+';font-weight:600">¥'+r.var+'万</td>'
      +'<td style="padding:8px 4px;text-align:center"><span style="color:'+tr.color+';font-weight:700;font-size:13px">'+tr.icon+'</span><span style="font-size:9px;color:'+tr.color+'">'+tr.label+'</span></td>'
      +'<td style="padding:8px 4px;text-align:center"><span style="padding:2px 6px;border-radius:10px;font-size:9px;font-weight:600;background:'+scl+'22;color:'+scl+'">'+r.scor+'</span></td>'
      +'<td style="padding:8px 4px;text-align:center"><span style="font-size:9px;color:var(--text-muted);line-height:1.2;display:block;max-width:140px">'+r.alertRule+'</span></td>'
      +'<td style="padding:8px 4px;text-align:center"><button style="background:var(--primary);color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer" onclick="window._rrSim(\''+r.id+'\',\''+r.name.replace(/'/g,"\\'")+'\')">模拟</button></td>'
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

// ── Quadrant Scatter（敏捷性×韧性TTS）──
function renderQuad(risks){
  var dom=document.getElementById('rrQuadChart'); if(!dom||!window.echarts) return;
  dom.style.width='100%'; dom.style.height='400px';

  // 用户指定的四象限归属
  var quadMap = {
    R04:'A',R06:'A',R09:'A',R12:'A',
    R01:'B',R05:'B',
    R11:'C',R08:'C',R13:'C',
    R02:'D',R03:'D',R07:'D',R10:'D'
  };
  var quadColors = {A:'#22c55e',B:'#3b82f6',C:'#f97316',D:'#dc2626'};
  var quadLabels = {A:'A·韧性强+敏捷弱',B:'B·韧性强+敏捷强',C:'C·韧性弱+敏捷弱',D:'D·韧性弱+敏捷强（优先处置）'};

  var seriesData = {A:[],B:[],C:[],D:[]};
  risks.forEach(function(r){
    var q = quadMap[r.id]||'C';
    seriesData[q].push({name:r.id+' '+r.name,value:[r.agility,r.tts,r.var],itemStyle:{color:quadColors[q]}});
  });

  if(App.charts.rrQuad)try{App.charts.rrQuad.dispose();}catch(e){}
  var ch=echarts.init(dom);
  var seriesArr = ['A','B','C','D'].filter(function(q){return seriesData[q].length>0;}).map(function(q){
    return {name:quadLabels[q],type:'scatter',data:seriesData[q],
      symbolSize:function(v){return Math.max(14,Math.min(40,v[2]/40));},
      itemStyle:{color:quadColors[q],opacity:.85}
    };
  });
  ch.setOption({
    tooltip:{trigger:'item',
      formatter:function(p){var parts=(p.name||'').split(' ');return '<b>'+parts[0]+'</b> '+parts.slice(1).join(' ')+'<br/>敏捷性: '+p.value[0]+'%<br/>TTS: '+p.value[1]+'天<br/>VAR: ¥'+p.value[2]+'万<br/>象限: '+(quadLabels[quadMap[parts[0]]]||'C');}
    },
    legend:{bottom:0,textStyle:{fontSize:10}},
    grid:{left:60,right:30,top:20,bottom:50},
    xAxis:{name:'敏捷性 →（越高越好）',nameTextStyle:{fontSize:11},min:20,max:80},
    yAxis:{name:'韧性TTS ← 越高越强',nameTextStyle:{fontSize:11},min:0,max:50},
    series:seriesArr
  });
  App.charts.rrQuad=ch;
}

// ── TOP 8 Alerts ──
function renderTop8(risks){
  var el=document.getElementById('rrTopAlerts'); if(!el) return;
  var top=risks.filter(function(r){return r.score>75;}).sort(function(a,b){return b.score-a.score;}).slice(0,8);
  if(!top.length){el.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:30px">暂无高风险项</div>';return;}
  el.innerHTML=top.map(function(r){
    var lcl=LVL[r.level]; var tr=TRD[r.trend];
    return '<div style="background:var(--card);border:1px solid var(--border-light);border-radius:8px;padding:12px 14px;margin-bottom:8px;border-left:4px solid '+lcl.bg+'" onmouseenter="this.style.borderColor=\'var(--primary)\';this.style.boxShadow=\'var(--shadow-md)\'" onmouseleave="this.style.borderColor=\'var(--border-light)\';this.style.boxShadow=\'none\'">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<div><span style="background:'+lcl.bg+';color:'+lcl.txt+';padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;margin-right:6px">'+r.level+'</span><span style="font-weight:700;color:var(--text)">'+r.name+'</span></div>'
      +'<span style="color:'+tr.color+';font-weight:700;font-size:14px">'+tr.icon+'</span></div>'
      +'<div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;display:flex;gap:12px;flex-wrap:wrap">'
      +'<span>弹性: '+r.agility+'%</span><span>TTS: <b style="color:'+(r.tts<7?'var(--danger)':'var(--text)')+'">'+r.tts+'天</b>'+(r.tts<7?' ⚠':'')+'</span>'
      +'<span>TTR: <b style="color:'+(r.ttr>21?'var(--warning)':'var(--text)')+'">'+r.ttr+'天</b></span>'
      +'<span>VAR: <b style="color:'+(r.var>500?'var(--danger)':'var(--text)')+'">¥'+r.var+'万</b></span></div>'
      +'<div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">SCOR: ['+r.scor+'] '+r.indicator+'</div>'
      +'<div style="font-size:10px;color:var(--text-sec);font-style:italic;margin-bottom:8px">🤖 '+r.aiAdvice+'</div>'
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
