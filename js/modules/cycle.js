/* ── v12.1 周期监控 — KPI重构 + 六段紧凑标签 + 因子标签 + 有效周期格式 ── */
registerModule('cycle', initPage_cycle);

var cycleCache = null;
var expandedCycles = {};
var _cycleTrendPeriod = 10; // 默认10期
var _cycleTrendSeg = 'ots'; // 段选择：ots|T1|T2|T3|T4|T5|T6

/* ── 6段周期定义（每段3个因子标签）── */
var CYCLE_DEF = [
  { code:'RESP', name:'T1 需求响应周期', short:'T1 需求响应', target:3, actual:4.5, diff:1.5, owner:'OC/OPM',
    nodes:[
      {code:'1.1', name:'需求接收与确认', target:1.0, actual:1.5, diff:0.5},
      {code:'1.2', name:'评估与交期承诺', target:2.0, actual:3.0, diff:1.0}
    ], factors:[
      {name:'需求变更率',val:'+23%',cls:'bad'},
      {name:'EDI自动化率',val:'96%',cls:'normal'},
      {name:'SO确认时效',val:'3.2h',cls:'normal'}
    ]},
  { code:'PLAN', name:'T2 计划运转周期', short:'T2 计划运转', target:5.5, actual:6.2, diff:0.7, owner:'OPM/PMC',
    nodes:[
      {code:'2.1', name:'S&OP评审', target:3.0, actual:3.2, diff:0.2},
      {code:'2.2', name:'MPS主计划制定', target:1.0, actual:1.2, diff:0.2},
      {code:'2.3', name:'物料计划生成', target:0.5, actual:0.6, diff:0.1},
      {code:'2.4', name:'计划下达', target:1.0, actual:1.2, diff:0.2}
    ], factors:[
      {name:'齐套达成率',val:'89%',cls:'normal'},
      {name:'冲销及时率',val:'92%',cls:'normal'},
      {name:'MPS锁定率',val:'85%',cls:'bad'}
    ]},
  { code:'PROC', name:'T3 物料采购周期', short:'T3 物料采购', target:6.5, actual:8.0, diff:1.5, owner:'采购/供应商',
    nodes:[
      {code:'3.1', name:'PR转PO', target:0.5, actual:0.6, diff:0.1},
      {code:'3.2', name:'采购下单与确认', target:1.0, actual:1.3, diff:0.3},
      {code:'3.3', name:'供应商生产/备货', target:3.0, actual:3.8, diff:0.8},
      {code:'3.4', name:'送货与到货接收', target:0.5, actual:0.6, diff:0.1},
      {code:'3.5', name:'IQC检验', target:1.0, actual:1.1, diff:0.1},
      {code:'3.6', name:'入库上架', target:0.5, actual:0.6, diff:0.1}
    ], factors:[
      {name:'紧急采购率',val:'15%',cls:'bad'},
      {name:'L/T达成率',val:'82%',cls:'bad'},
      {name:'IQC合格率',val:'96.8%',cls:'normal'}
    ]},
  { code:'MFG', name:'T4 生产制造周期', short:'T4 生产制造', target:6.0, actual:7.2, diff:1.2, owner:'制造/质量',
    nodes:[
      {code:'4.1', name:'制造准备', target:0.5, actual:0.6, diff:0.1},
      {code:'4.2', name:'SMT/前端加工', target:1.6, actual:1.9, diff:0.3},
      {code:'4.3', name:'组装测试', target:2.9, actual:3.5, diff:0.6},
      {code:'4.4', name:'FQC终检', target:0.5, actual:0.6, diff:0.1},
      {code:'4.5', name:'包装入库', target:0.5, actual:0.6, diff:0.1}
    ], factors:[
      {name:'产线良率',val:'94.2%',cls:'normal'},
      {name:'准时完工率',val:'87.4%',cls:'bad'},
      {name:'FQC一次通过率',val:'93.5%',cls:'normal'}
    ]},
  { code:'INV', name:'T5 库存在库周期', short:'T5 库存在库', target:1.5, actual:2.0, diff:0.5, owner:'仓储/供应链',
    nodes:[
      {code:'5.1', name:'工厂成品待发', target:0.5, actual:0.7, diff:0.2},
      {code:'5.2', name:'外部仓/VMI出库等待', target:1.0, actual:1.3, diff:0.3}
    ], factors:[
      {name:'呆滞金额',val:'190万',cls:'bad'},
      {name:'仓位使用率',val:'78%',cls:'normal'},
      {name:'包材及时率',val:'95%',cls:'normal'}
    ]},
  { code:'SHIP', name:'T6 物流发运周期', short:'T6 物流发运', target:3.5, actual:4.0, diff:0.5, owner:'物流/关务',
    nodes:[
      {code:'6.1', name:'出货拣配与装车', target:0.5, actual:0.6, diff:0.1},
      {code:'6.2', name:'报关与空运/干线', target:2.0, actual:2.3, diff:0.3},
      {code:'6.3', name:'目的地清关签收', target:1.0, actual:1.1, diff:0.1}
    ], factors:[
      {name:'空运溢价',val:'+8%',cls:'bad'},
      {name:'签收及时率',val:'91%',cls:'normal'},
      {name:'订舱及时率',val:'88.5%',cls:'bad'}
    ]}
];
var CYCLE_COLOR_MAP = {RESP:'#8b5cf6',PLAN:'#3b82f6',PROC:'#f59e0b',MFG:'#0ea5e9',INV:'#10b981',SHIP:'#6366f1'};

/* ── 工具 ── */
function cycleFmt(n){ return Math.round(n*10)/10; }
function cycleDiffText(n){ return (n>=0?'+':'')+cycleFmt(n); }
function cycleStatusClass(diff){ if(diff>=1.0)return'late';if(diff<=-1.0)return'good';return'normal'; }
function cycleTrendCls(label){
  var map={'持续恶化':'bad','首次变坏':'bad','高位波动':'bad','持续改善':'good','恢复正常':'recover','稳定正常':'normal','低位稳定':'normal'};
  return map[label]||'normal';
}

/* ── 数据生成 ── */
function buildCycleData(proj,periodDays){
  periodDays=periodDays||90;var factor=periodDays/90;
  var seed=0;for(var i=0;i<(proj.id||'').length;i++)seed+=(proj.id||'').charCodeAt(i);
  var jitter=function(base,f){return Math.max(0.3,cycleFmt(base*factor*(0.85+((seed*f)%30)/100)));};
  var targets={},actuals={};
  CYCLE_DEF.forEach(function(cd,idx){targets[cd.code]=jitter(cd.target,idx*7+1);actuals[cd.code]=jitter(cd.actual,idx*11+3);});
  var trends=buildTrends(proj);
  return{proj:proj,targets:targets,actuals:actuals,trends:trends,periodDays:periodDays};
}
function buildTrends(proj){
  var seed=0;for(var i=0;i<(proj.id||'').length;i++)seed+=(proj.id||'').charCodeAt(i);
  var trends={};
  CYCLE_DEF.forEach(function(cd,idx){
    var s=seed+idx*13,val=s%5;
    var l=val===0?'稳定正常':val===1?'首次变坏':val===2?'持续恶化':val===3?'高位波动':'恢复正常';
    if(proj.lifecycleRaw==='Mass Production'&&proj._ovKpi&&proj._ovKpi.health==='g'){if(l==='持续恶化'||l==='首次变坏')l='高位波动';}
    trends[cd.code]=l;
  });
  return trends;
}

/* ── 甘特图布局 ── */
function buildTimeline(d){
  var cycles=[];var otsTgt=0,otsAct=0;
  CYCLE_DEF.forEach(function(cd){
    var t=d.targets[cd.code]||cd.target,a=d.actuals[cd.code]||cd.actual;
    if(cd.code!=='RESP'){otsTgt+=t;otsAct+=a;}
    var nodes=cd.nodes.map(function(nd){
      var nt=t*(nd.target/cd.target),na=a*(nd.actual/cd.actual);
      return{code:nd.code,name:nd.name,target:cycleFmt(nt),actual:cycleFmt(na),diff:cycleFmt(na-nt)};
    });
    cycles.push({code:cd.code,name:cd.name,short:cd.short,target:cycleFmt(t),actual:cycleFmt(a),diff:cycleFmt(a-t),trend:d.trends[cd.code]||'稳定正常',nodes:nodes,factors:cd.factors||[],planStart:0,planDuration:0,planMetricDuration:0,actualStart:0,actualDuration:0,actualMetricDuration:0});
  });
  function assignCycle(c,kind,field,start,metricDuration,opts){opts=opts||{};var dur=c[field];c[kind+'Start']=cycleFmt(start);c[kind+'Duration']=Math.max(0.1,cycleFmt(opts.span||metricDuration));c[kind+'MetricDuration']=metricDuration;var cursor=cycleFmt(start);c.nodes.forEach(function(n){var frac=n[kind==='plan'?'target':'actual']/dur;n[kind+'Start']=cursor;n[kind+'Duration']=Math.max(0.1,cycleFmt(c[kind+'Duration']*frac));cursor=cycleFmt(cursor+n[kind+'Duration']);});}
  var cursor=0;cycles.forEach(function(c){assignCycle(c,'plan','target',cursor,c.target);cursor=cycleFmt(cursor+c.target);});
  cursor=0;cycles.forEach(function(c){assignCycle(c,'actual','actual',cursor,c.actual);cursor=cycleFmt(cursor+c.actual);});
  function applyP(kind){var bc={};cycles.forEach(function(c){bc[c.code]=c;});var t2=bc.PLAN,t3=bc.PROC,t4=bc.MFG;if(!t2||!t3||!t4)return;var s=t2[kind+'Start'],dd=t2[kind+'Duration'],e=cycleFmt(s+dd);assignCycle(t4,kind,kind==='plan'?'target':'actual',e,t4[kind==='plan'?'target':'actual']);var ts=cycleFmt(s+dd*0.5),t4s=t4[kind+'Start'],t4d=t4[kind+'Duration'],te=cycleFmt(t4s+t4d*0.5),sp=Math.max(0.2,cycleFmt(te-ts));assignCycle(t3,kind,kind==='plan'?'target':'actual',ts,t3[kind==='plan'?'target':'actual'],{span:sp});var c2=cycleFmt(t4s+t4d);['INV','SHIP'].forEach(function(code){var c=bc[code];if(c){assignCycle(c,kind,kind==='plan'?'target':'actual',c2,c[kind==='plan'?'target':'actual']);c2=cycleFmt(c2+c[kind+'Duration']);}});}
  applyP('plan');applyP('actual');
  var mx=0;cycles.forEach(function(c){mx=Math.max(mx,c.planStart+c.planDuration,c.actualStart+c.actualDuration);c.nodes.forEach(function(n){mx=Math.max(mx,(n.planStart||0)+(n.planDuration||0),(n.actualStart||0)+(n.actualDuration||0));});});
  return{cycles:cycles,totalDuration:Math.ceil(mx+2),otsTarget:cycleFmt(otsTgt),otsActual:cycleFmt(otsAct)};
}

/* ── 甘特条 ── */
function ticks(total){var step=total>35?5:total>18?3:2,arr=[];for(var i=step;i<=total;i+=step)arr.push(i);return arr;}
function gridHtml(total){return'<div class="cycle-grid">'+ticks(total).map(function(t){return'<span class="cycle-tick"><span>'+t+'</span></span>';}).join('')+'</div>';}
function barHtml(label,kind,start,duration,total,diff,metricDuration){
  var left=(start/total)*100,width=Math.max(1.2,(duration/total)*100),cls=kind==='actual'?cycleStatusClass(diff):'';
  return'<div class="cbar '+kind+' '+cls+'" style="left:'+left+'%;width:'+width+'%;"></div>';
}
function factorPillsHtml(factors){
  if(!factors||!factors.length)return'';
  return'<div class="cycle-factor-row">'+factors.map(function(f){var tone=f.cls==='bad'?'red':f.cls==='good'?'green':'normal';return'<span class="cycle-fpill '+tone+'"><span class="fp-label">'+f.name+'</span> <span class="fp-val">'+f.val+'</span></span>';}).join('')+'</div>';
}

/* ── OTS有效周期（=实际+质量损耗） ── */
function calcEffective(d){
  // 质量损耗 = T4段内容损（返修+待检+包装延迟）
  var mfg=d.actuals.MFG||7.0,tgtMfg=d.targets.MFG||6.0;
  var loss=cycleFmt(Math.max(0.2,(mfg-tgtMfg)*0.25));
  var otsAct=0; CYCLE_DEF.forEach(function(cd){if(cd.code!=='RESP')otsAct+=d.actuals[cd.code]||cd.actual;});
  return cycleFmt(otsAct+loss);
}

function cycleRowHtml(cycle,total){
  var expanded=!!expandedCycles[cycle.code];
  var effective=cycleFmt(cycle.actual+Math.max(0,(cycle.actual-cycle.target)*0.12));
  var trendCls=cycleTrendCls(cycle.trend);
  var html='<div class="cycle-gantt-row l1" data-cycle="'+cycle.code+'">';
  html+='<div class="cycle-cell"><div class="cycle-label-main">';
  html+='<button type="button" class="cycle-expander '+(expanded?'expanded':'')+'" onclick="toggleCycleExpand(\''+cycle.code+'\')">▶</button>';
  html+='<div><div class="cycle-label-title">'+cycle.short+'</div>';
  html+='<div class="cycle-label-sub">目标 '+cycle.target+'天｜实际 '+cycle.actual+'天｜差额 <span class="cycle-diff '+cycleStatusClass(cycle.diff)+'">'+cycleDiffText(cycle.diff)+'天</span></div>';
  html+=factorPillsHtml(cycle.factors)+'</div></div></div>';
  html+='<div class="cycle-cell"><div class="cycle-timeline">'+gridHtml(total);
  html+=barHtml(cycle.name,'plan',cycle.planStart,cycle.planDuration,total,cycle.diff,cycle.planMetricDuration);
  html+=barHtml(cycle.name,'actual',cycle.actualStart,cycle.actualDuration,total,cycle.diff,cycle.actualMetricDuration);
  html+='</div></div>';
  html+='<div class="cycle-cell" style="display:grid;place-items:center;"><span class="cycle-trend-tag '+trendCls+'">'+cycle.trend+'</span></div>';
  // 有效周期 — 较实际放大 / 较目标偏差
  var diffToTarget=cycleFmt(effective-cycle.target);
  var diffToActual=cycleFmt(effective-cycle.actual);
  var effCls=diffToTarget>=1?'late':diffToTarget<=-1?'good':'normal';
  html+='<div class="cycle-cell cycle-effective-cell"><div class="cycle-effective-main cycle-diff '+effCls+'">'+effective+'天</div>';
  html+='<div class="cycle-effective-meta">较实际放大 '+cycleDiffText(diffToActual)+'天<br>较目标偏差 '+cycleDiffText(diffToTarget)+'天</div></div>';
  html+='</div>';
  cycle.nodes.forEach(function(node){html+=nodeRowHtml(node,cycle,total,expanded);});
  return html;
}
function nodeRowHtml(node,cycle,total,expanded){
  var code=cycle.code.replace(/RESP/,'1').replace(/PLAN/,'2').replace(/PROC/,'3').replace(/MFG/,'4').replace(/INV/,'5').replace(/SHIP/,'6')+'.'+node.code.split('.').pop();
  var html='<div class="cycle-gantt-row l2 '+(expanded?'':'cycle-hidden')+'">';
  html+='<div class="cycle-cell"><div class="cycle-label-main"><div class="cycle-label-title" style="padding-left:32px;">'+code+' '+node.name+'</div></div></div>';
  html+='<div class="cycle-cell"><div class="cycle-timeline">'+gridHtml(total);
  if(node.planStart!==undefined)html+=barHtml(node.name,'plan',node.planStart,node.planDuration,total,node.diff,node.planDuration);
  if(node.actualStart!==undefined)html+=barHtml(node.name,'actual',node.actualStart,node.actualDuration,total,node.diff,node.actualDuration);
  html+='</div></div>';
  html+='<div class="cycle-cell" style="display:grid;place-items:center;"><span style="font-size:11px;color:var(--text-muted);">—</span></div>';
  var eNode=cycleFmt(node.actual+Math.max(0,(node.actual-node.target)*0.1));
  var da=cycleFmt(eNode-node.actual),dt=cycleFmt(eNode-node.target);
  html+='<div class="cycle-cell cycle-effective-cell"><div class="cycle-effective-main cycle-diff '+cycleStatusClass(node.diff)+'">'+eNode+'天</div>';
  html+='<div class="cycle-effective-meta">较实际 '+cycleDiffText(da)+'天</div></div>';
  html+='</div>';return html;
}
function toggleCycleExpand(code){expandedCycles[code]=!expandedCycles[code];if(!cycleCache)return;renderCycleGantt(cycleCache);}

/* ── KPI卡片 — 去掉瓶颈，新增六段紧凑状态 ── */
function renderCycleKpi(d){
  var el=document.getElementById('cycleKpiGrid');if(!el)return;
  var tl=buildTimeline(d);
  var act=tl.otsActual,tgt=tl.otsTarget,dev=cycleFmt(act-tgt);
  var effective=calcEffective(d);
  var qualityLoss=cycleFmt(effective-act);
  // 趋势汇总
  var badCount=0,worstTrend='';
  CYCLE_DEF.forEach(function(cd){var t=d.trends[cd.code];if(t==='持续恶化'||t==='首次变坏'){badCount++;worstTrend=worstTrend||t;}});
  var trendText=badCount>=2?'持续恶化':badCount===1?worstTrend:'稳定正常';
  var cards=[
    {lbl:'OTS实际周期',val:act+'天',sub:'目标 '+tgt+'天',badge:cycleDiffText(dev)+'天',badgeCls:dev>2?'late':dev>0?'normal':'good',color:dev>2?'var(--danger)':dev>0?'var(--warning)':'var(--success)',icon:'⏱'},
    {lbl:'OTS有效周期',val:effective+'天',sub:'内含质量损耗 +'+qualityLoss+'天',badge:'全链含损',badgeCls:'normal',color:'var(--primary)',icon:'✦'},
    {lbl:'质量损耗天数',val:qualityLoss+'天',sub:'T4段内返修/待检损耗',badge:'占比T4 '+cycleFmt(qualityLoss/(d.actuals.MFG||7.2)*100)+'%',badgeCls:qualityLoss>1?'late':qualityLoss>0.5?'normal':'good',color:qualityLoss>1?'var(--danger)':qualityLoss>0.5?'var(--warning)':'var(--success)',icon:'⊖'}
  ];
  var kpi4=renderCompactSix(d);
  var html=cards.map(function(it){
    return'<div class="kpi-card cycle-kpi">'+
      '<div class="cycle-kpi-top"><span class="cycle-kpi-icon" style="background:'+it.color+'">'+it.icon+'</span><span class="cycle-kpi-label">'+it.lbl+'</span></div>'+
      '<div class="cycle-kpi-value" style="color:'+it.color+'">'+it.val+'</div>'+
      '<div class="cycle-kpi-bottom"><span class="cycle-kpi-sub">'+it.sub+'</span><span class="cycle-kpi-badge '+it.badgeCls+'">'+it.badge+'</span></div>'+
      '</div>';
  }).join('');
  el.innerHTML=html+kpi4;
}

function renderCompactSix(d){
  var labels=[{code:'RESP',l:'T1'},{code:'PLAN',l:'T2'},{code:'PROC',l:'T3'},{code:'MFG',l:'T4'},{code:'INV',l:'T5'},{code:'SHIP',l:'T6'}];
  var chips=labels.map(function(l){
    var cd=CYCLE_DEF.find(function(c){return c.code===l.code;});
    var a=d.actuals[l.code]||cd.actual,t=d.targets[l.code]||cd.target,dev=cycleFmt(a-t);
    var cls=dev>=1?'late':dev<=-1?'good':'normal';
    var color=cls==='late'?'var(--danger)':cls==='good'?'var(--success)':'var(--primary)';
    return'<div class="cycle-mini-chip '+cls+'" onclick="scrollToCycleGantt(\''+l.code+'\')">'+
      '<span style="font-weight:800;color:'+CYCLE_COLOR_MAP[l.code]+'">'+l.l+'</span>'+
      '<span class="cycle-mini-num" style="color:'+color+'">'+cycleDiffText(dev)+'</span>'+
      '<span style="font-size:9px;color:var(--text-muted)">'+a+'天</span></div>';
  }).join('');
  var worstTrend='';CYCLE_DEF.forEach(function(cd){if(d.trends[cd.code]==='持续恶化')worstTrend=cd.short;});
  var trendText=worstTrend?worstTrend+' 持续恶化 ⚠':'无恶化趋势';
  return'<div class="kpi-card cycle-kpi" style="--accent:var(--primary)">'+
    '<div class="cycle-kpi-top"><span class="cycle-kpi-icon" style="background:var(--primary)">⊞</span><span class="cycle-kpi-label">六段周期状态</span></div>'+
    '<div class="cycle-mini-six">'+chips+'</div>'+
    '<div class="cycle-kpi-bottom"><span class="cycle-kpi-sub">'+trendText+'</span></div>'+
    '</div>';
}

/* ── 六段分段标签条 ── */
function renderCycleStrip(d){
  var el=document.getElementById('cycleStrip');if(!el)return;
  var labels=[{code:'RESP',l:'T1'},{code:'PLAN',l:'T2'},{code:'PROC',l:'T3'},{code:'MFG',l:'T4'},{code:'INV',l:'T5'},{code:'SHIP',l:'T6'}];
  el.innerHTML=labels.map(function(l){
    var cd=CYCLE_DEF.find(function(c){return c.code===l.code;});
    var a=d.actuals[l.code]||cd.actual,t=d.targets[l.code]||cd.target,dev=cycleFmt(a-t);
    var cls=dev>=1?'late':dev<=-1?'good':'normal';
    var color=dev>=1?'var(--danger)':dev<=-1?'var(--success)':'var(--primary)';
    var trend=d.trends[l.code]||'—';
    return'<div class="cycle-chip-card '+cls+'" onclick="scrollToCycleGantt(\''+l.code+'\')">'+
      '<div class="cycle-chip-code" style="color:'+CYCLE_COLOR_MAP[l.code]+'">'+l.l+'</div>'+
      '<div class="cycle-chip-num" style="color:'+color+'">'+cycleDiffText(dev)+'天</div>'+
      '<div class="cycle-chip-meta">'+a+'/'+t+'天</div>'+
      '<div class="cycle-chip-trend">'+trend+'</div></div>';
  }).join('');
}

/* ── 甘特图 ── */
function renderCycleGantt(d){
  var body=document.getElementById('cycleGanttBody');if(!body)return;
  var tl=buildTimeline(d);
  body.innerHTML=tl.cycles.map(function(c){return cycleRowHtml(c,tl.totalDuration);}).join('');
}

/* ── 偏差表 ── */
function renderDevTable(d){
  var el=document.getElementById('cycleDevTableBody');if(!el)return;
  var tl=buildTimeline(d);
  el.innerHTML=tl.cycles.map(function(c){
    var st=c.diff>=3?'异常':c.diff>=1?'关注':'正常';
    var stColor=c.diff>=3?'var(--danger)':c.diff>=1?'var(--warning)':'var(--success)';
    var trend=d.trends[c.code]||'—';
    var codeLabel=c.code.replace(/RESP/,'T1').replace(/PLAN/,'T2').replace(/PROC/,'T3').replace(/MFG/,'T4').replace(/INV/,'T5').replace(/SHIP/,'T6');
    var name=c.name.replace(/T\d\s*/,'');
    return'<tr style="background:'+(c.diff>=3?'var(--danger-bg)':c.diff>=1?'var(--warning-bg)':'')+'"><td style="font-size:11px;font-weight:600;color:'+stColor+'">'+codeLabel+'</td><td>'+name+'</td><td>'+c.target+'</td><td>'+c.actual+'</td><td style="font-weight:600;color:'+stColor+'">'+cycleDiffText(c.diff)+'</td><td>'+trend+'</td><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+stColor+';margin-right:4px;"></span>'+st+'</td></tr>';
  }).join('');
}

/* ── 趋势图 ── */
function drawTrendChart(d){
  var canvas=document.getElementById('cycleTrendChart');if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var tl=buildTimeline(d);
  var seg=_cycleTrendSeg;
  // 根据选择确定基值
  var segMap={'ots':'RESP','T1':'RESP','T2':'PLAN','T3':'PROC','T4':'MFG','T5':'INV','T6':'SHIP'};
  var code=segMap[seg]||'RESP';
  var baseAct,baseTgt,segLabel;
  if(seg==='ots'){
    baseAct=tl.otsActual;baseTgt=tl.otsTarget;segLabel='实际OTS';
  }else{
    baseAct=d.actuals[code]||CYCLE_DEF.find(function(c){return c.code===code;}).actual;
    baseTgt=d.targets[code]||CYCLE_DEF.find(function(c){return c.code===code;}).target;
    segLabel=seg+' '+(CYCLE_DEF.find(function(c){return c.code===code;}).name.replace(/T\d\s*/,''));
  }
  var seed=0;for(var i=0;i<(d.proj.id||'').length;i++)seed+=(d.proj.id||'').charCodeAt(i);
  var n=_cycleTrendPeriod;
  var labels=[],actuals=[],targets=[];
  var trendLabel='';if(seg==='ots'){CYCLE_DEF.forEach(function(cd){if(cd.code!=='RESP'){var t=d.trends[cd.code];if(t==='持续恶化'||t==='首次变坏')trendLabel='bad';if(!trendLabel&&t==='高位波动')trendLabel='wave';}});}
  else{var t=d.trends[code];if(t==='持续恶化'||t==='首次变坏')trendLabel='bad';if(!trendLabel&&t==='高位波动')trendLabel='wave';}
  for(var i=0;i<n;i++){
    labels.push('W'+(n===10?12+i:17+i));
    var v;if(trendLabel==='bad')v=Math.round(baseAct-2+((seed*(i+1))%8)-i*(n===10?0.6:1.2));
    else if(trendLabel==='wave')v=Math.round(baseAct-1+((seed*(i+1))%7)*(i<Math.floor(n/2)?1:-1));
    else v=Math.round(baseAct-1+((seed*(i+1))%4));
    actuals.push(v);targets.push(Math.round(baseTgt));
  }
  if(window._cycleTrendChart&&window._cycleTrendChart.destroy)window._cycleTrendChart.destroy();
  window._cycleTrendChart=new Chart(ctx,{type:'line',data:{labels:labels,datasets:[
    {label:segLabel,data:actuals,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',fill:true,tension:0.3,pointRadius:3,pointBackgroundColor:'#3b82f6'},
    {label:'目标OTS',data:targets,borderColor:'#94a3b8',borderDash:[5,5],backgroundColor:'transparent',tension:0,pointRadius:0}
  ]},options:{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:true,position:'top',labels:{font:{size:11},usePointStyle:true}}},
    scales:{x:{grid:{display:false},ticks:{font:{size:11},maxTicksLimit:10}},y:{grid:{color:'var(--border-light)'},ticks:{font:{size:11},callback:function(v){return v+'天';}}}}}});
}

/* ── 周期/趋势切换 ── */
function switchTrendPeriod(n){
  _cycleTrendPeriod=n;
  document.querySelectorAll('.ctg-btn').forEach(function(b){b.classList.remove('active');});
  var btns=document.querySelectorAll('.ctg-btn');if(btns[n===5?0:1])btns[n===5?0:1].classList.add('active');
  if(cycleCache){drawTrendChart(cycleCache);resizeCharts();}
}
window.switchTrendPeriod=switchTrendPeriod;

function switchTrendSeg(){
  var sel=document.getElementById('cycleTrendSeg');
  _cycleTrendSeg=sel?sel.value:'ots';
  if(cycleCache){drawTrendChart(cycleCache);resizeCharts();}
}
window.switchTrendSeg=switchTrendSeg;
function scrollToCycleGantt(code){
  var row=document.querySelector('[data-cycle="'+code+'"]');
  if(row){row.scrollIntoView({behavior:'smooth',block:'center'});row.style.background='var(--primary-bg)';setTimeout(function(){row.style.background='';},1500);}
}

/* ── 主流程 ── */
function onCycleProjectChange(){
  try{
    var fp=getFilteredProjects();if(!fp||!fp.length)return;
    var sel=document.getElementById('cycleProjectSelect');var perSel=document.getElementById('cyclePeriodSelect');
    var projId=sel?sel.value:'';var periodDays=perSel?parseInt(perSel.value):90;
    var proj=fp.find(function(p){return p.id===projId;})||fp[0];if(!proj)return;
    cycleCache=buildCycleData(proj,periodDays);renderAllCycle(cycleCache);
  }catch(e){console.error('cycle change error:',e);}
}
function renderAllCycle(d){
  renderCycleKpi(d);renderCycleGantt(d);renderDevTable(d);drawTrendChart(d);resizeCharts();
}
function initPage_cycle(){
  try{
    var fp=getFilteredProjects();if(!fp.length)return;
    var sel=document.getElementById('cycleProjectSelect');if(!sel)return;
    fillProjectSelect(sel,fp);consumeDrillDown('cycleProjectSelect');
    var perSel=document.getElementById('cyclePeriodSelect');var periodDays=90;if(perSel&&perSel.value)periodDays=parseInt(perSel.value);
    var proj=fp.find(function(p){return p.id===sel.value;})||fp[0];if(!proj)return;
    if(!sel.value&&fp.length)sel.value=proj.id;
    cycleCache=buildCycleData(proj,periodDays);renderAllCycle(cycleCache);
  }catch(e){console.error('cycle init error:',e);}
}
