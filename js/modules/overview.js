// Module: overview v9.0 — 控制塔全局总览（11项优化版）
// 优化：全局筛选提示+KPI环比+雷达下钻+紧凑/详细模式+列设置+工厂地图+NPI转化率+重大项目预警明细+时间对比+排序箭头+分页增强+图表导出

/* ═══ 1. KPI 健康分模拟 ═══ */
function _ovSeededRand(seed){var s=seed;return function(){s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};}
function _ovGenKpi(name,isNpi){
  var rng=_ovSeededRand(name.split('').reduce(function(a,c){return a+c.charCodeAt(0);},0)*31);
  var dims=[];for(var i=0;i<5;i++){var base=isNpi?72:78;var v=Math.round(base+(rng()-0.35)*48);dims.push(Math.min(100,Math.max(30,v)));}
  var score=Math.round(dims.reduce(function(a,b){return a+b;},0)/5);
  var health=score>=80?'g':score>=65?'y':'r';
  // 模拟上月分数（用于环比）
  var prevScore=Math.max(30,Math.min(100,score+Math.round((rng()-0.5)*8)));
  return{dims:dims,score:score,health:health,prevScore:prevScore,mom:score-prevScore};
}

/* ═══ 2. 状态变量 ═══ */
var _ovFiltered=[];
var _ovSortKey='key',_ovSortDir=-1;
var _ovPage=1,_ovPageSize=15;
var _ovChartLifecycle=null,_ovChartRadar=null,_ovChartCustomer=null;
var _ovDebouncedFilter=null;
var _ovMode='compact'; // compact | detail
var _ovShowMom=false;  // 环比开关
var _ovFactoryMapInited=false;

/* ═══ 3. 工厂数据 ═══ */
var _OV_FACTORIES=[
  {name:'潍坊',x:35,y:45,cities:['潍坊','青岛']},
  {name:'青岛',x:38,y:42,cities:['青岛']},
  {name:'越南',x:72,y:58,cities:['越南','河内','胡志明']},
  {name:'北美',x:18,y:38,cities:['北美','美国','墨西哥']}
];

/* ═══ 4. 主入口 ═══ */
function initPage_overview(){
  try{
    if(!_ovDebouncedFilter)_ovDebouncedFilter=debounce(ovApplyFilters,300);
    ovUpdateGlobalHint();
    ovApplyFilters();
  }catch(e){console.error('overview init error:',e);}
}
registerModule('overview',initPage_overview);

/* ═══ 5. 全局筛选提示条 ═══ */
function ovUpdateGlobalHint(){
  var el=document.getElementById('ovGlobalHint');
  if(!el)return;
  var f=App.filter||{};
  var bgLabel={A01:'A01 声学BG',CEP:'CEP 消费电子BG',SAC:'SAC 微电子BG'};
  var html='<i class="fas fa-filter"></i> <b>全局筛选范围</b> · ';
  html+='BG: <span class="ov-gh-val">'+(f.bg?(bgLabel[f.bg]||f.bg):'全部')+'</span> · ';
  html+='BU: <span class="ov-gh-val">'+(f.bu||'全部')+'</span> · ';
  html+='客户: <span class="ov-gh-val">'+(f.customer||'全部')+'</span> · ';
  html+='产品: <span class="ov-gh-val">'+(f.product||'全部')+'</span>';
  html+=' <span style="margin-left:auto;font-size:10px;color:var(--text-muted)">↑ 筛选条件由顶部控制</span>';
  el.innerHTML=html;
}

/* ═══ 6. 筛选逻辑 ═══ */
function ovApplyFilters(){
  ovUpdateGlobalHint();
  var fp=getFilteredProjects();
  var lc=document.getElementById('ovFLifecycle')?document.getElementById('ovFLifecycle').value:'';
  var st=document.getElementById('ovFStage')?document.getElementById('ovFStage').value:'';
  var hl=document.getElementById('ovFHealth')?document.getElementById('ovFHealth').value:'';
  var key=document.getElementById('ovFKey')?document.getElementById('ovFKey').checked:false;
  var kw=document.getElementById('ovFSearch')?document.getElementById('ovFSearch').value.trim().toLowerCase():'';
  _ovFiltered=fp.filter(function(p){
    if(!p._ovKpi){var ds=DS.get(p.id);if(ds){p._ovKpi={dims:ds.dims,score:ds.score,health:ds.health,prevScore:Math.max(30,ds.score+Math.round((_ovSeededRand(p.id.charCodeAt(0)*7)()-0.5)*8)),mom:0};p._ovKpi.mom=p._ovKpi.score-p._ovKpi.prevScore;}else{p._ovKpi=_ovGenKpi(p.name,p.lifecycleRaw==='NPI');}}
    if(lc&&p.lifecycleRaw!==lc)return false;
    if(st&&p.engStage!==st)return false;
    if(hl&&p._ovKpi.health!==hl)return false;
    if(key&&!p.isMajor)return false;
    if(kw){var hay=(p.name+p.customer+p.productLine+p.bu+p.bg).toLowerCase();if(!hay.includes(kw))return false;}
    return true;
  });
  _ovPage=1;
  ovSortTable(_ovSortKey,true);
  ovUpdateSummary();
  ovUpdateFunnel();
  ovUpdateKeyProjects();
  ovUpdateCharts();
  ovUpdateFactoryMap();
  var countEl=document.getElementById('ovFilterCount');if(countEl)countEl.textContent=_ovFiltered.length;
}
function ovResetFilters(){
  ['ovFLifecycle','ovFStage','ovFHealth'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var keyEl=document.getElementById('ovFKey');if(keyEl)keyEl.checked=false;
  var searchEl=document.getElementById('ovFSearch');if(searchEl)searchEl.value='';
  ovApplyFilters();
}

/* ═══ 7. 汇总卡片（含环比） ═══ */
function ovUpdateSummary(){
  var total=_ovFiltered.length;
  var npi=_ovFiltered.filter(function(d){return d.lifecycleRaw==='NPI';}).length;
  var mp=_ovFiltered.filter(function(d){return d.lifecycleRaw!=='NPI';}).length;
  var major=_ovFiltered.filter(function(d){return d.isMajor;}).length;
  var yel=_ovFiltered.filter(function(d){return d._ovKpi&&d._ovKpi.health==='y';}).length;
  var red=_ovFiltered.filter(function(d){return d._ovKpi&&d._ovKpi.health==='r';}).length;
  var alert=yel+red;
  var bgSet=[...new Set(_ovFiltered.map(function(d){return d.bg;}))];
  // 计算环比（与上月比）
  var prevAlert=_ovFiltered.reduce(function(s,d){return s+(d._ovKpi&&d._ovKpi.prevScore<65?1:0);},0);
  var alertMom=alert-prevAlert;
  var avgScore=_ovFiltered.length?Math.round(_ovFiltered.reduce(function(s,d){return s+(d._ovKpi?d._ovKpi.score:0);},0)/_ovFiltered.length):0;
  var prevAvg=_ovFiltered.length?Math.round(_ovFiltered.reduce(function(s,d){return s+(d._ovKpi?d._ovKpi.prevScore:0);},0)/_ovFiltered.length):0;
  var scoreMom=avgScore-prevAvg;
  function momArrow(v,reverse){if(v===0)return'<span class="ov-mom flat">—</span>';var cls=reverse?(v>0?'down':'up'):(v>0?'up':'down');var arrow=v>0?'▲':'▼';return'<span class="ov-mom '+cls+'">'+arrow+Math.abs(v)+'</span>';}
  var grid=document.getElementById('ovSummaryGrid');if(!grid)return;
  grid.innerHTML=[
    {label:'BG 数量',value:bgSet.length,icon:'🏢',color:'c-blue',sub:bgSet.map(function(b){return'<span class="tag">'+b+'</span>';}).join(''),mom:''},
    {label:'项目总数',value:total,icon:'📁',color:'c-purple',sub:'筛选后显示',mom:''},
    {label:'NPI 项目',value:npi,icon:'🔬',color:'c-orange',sub:'EVT '+_ovFiltered.filter(function(d){return d.engStage==='EVT';}).length+' / DVT '+_ovFiltered.filter(function(d){return d.engStage==='DVT';}).length+' / PVT '+_ovFiltered.filter(function(d){return d.engStage==='PVT';}).length,mom:''},
    {label:'MP 项目',value:mp,icon:'🏗️',color:'c-green',sub:'Ramp '+_ovFiltered.filter(function(d){return d.lifecycleRaw==='Ramp-up';}).length+' / Mass '+_ovFiltered.filter(function(d){return d.lifecycleRaw==='Mass Production';}).length+' / EOL '+_ovFiltered.filter(function(d){return d.lifecycleRaw==='EOL';}).length,mom:''},
    {label:'重大项目',value:major,icon:'⭐',color:'c-yellow',sub:'需重点跟踪',mom:''},
    {label:'健康预警',value:alert,icon:'🚨',color:'c-red',sub:'<span style="color:#ca8a04">🟡 '+yel+'</span>&nbsp;<span style="color:var(--danger)">🔴 '+red+'</span> | 均分'+avgScore,mom:momArrow(alertMom,true)},
  ].map(function(k){
    return'<div class="ov-sum-card '+k.color+'"><div class="ov-sum-icon">'+k.icon+'</div><div class="ov-sum-label">'+k.label+'</div><div class="ov-sum-value">'+k.value+(k.mom?' <span style="font-size:11px">'+k.mom+'</span>':'')+'</div><div class="ov-sum-sub">'+k.sub+'</div></div>';
  }).join('');
}

/* ═══ 8. NPI 漏斗（含转化率+卡阶段提示） ═══ */
function ovUpdateFunnel(){
  var evt=_ovFiltered.filter(function(d){return d.engStage==='EVT';}).length;
  var dvt=_ovFiltered.filter(function(d){return d.engStage==='DVT';}).length;
  var pvt=_ovFiltered.filter(function(d){return d.engStage==='PVT';}).length;
  var ramp=_ovFiltered.filter(function(d){return d.lifecycleRaw==='Ramp-up';}).length;
  var mass=_ovFiltered.filter(function(d){return d.lifecycleRaw==='Mass Production';}).length;
  var eol=_ovFiltered.filter(function(d){return d.lifecycleRaw==='EOL';}).length;
  var maxNpi=Math.max(evt,dvt,pvt,1);
  var maxMp=Math.max(ramp,mass,eol,1);
  var funnelColors=['#16a34a','#3b82f6','#8b5cf6'];
  var steps=[{label:'EVT',val:evt},{label:'DVT',val:dvt},{label:'PVT',val:pvt}];
  var fwrap=document.getElementById('ovFunnelWrap');if(!fwrap)return;
  fwrap.innerHTML='';
  steps.forEach(function(s,i){
    var pct=Math.round((s.val/maxNpi)*100);
    var w=Math.max(pct,12);
    // 转化率
    var convRate=i>0&&steps[i-1].val>0?Math.round((s.val/steps[i-1].val)*100):100;
    var convHtml=i>0?'<span style="font-size:9px;color:var(--text-muted);margin-left:6px">转化率'+convRate+'%</span>':'';
    var row=document.createElement('div');
    row.className='ov-funnel-step';
    row.innerHTML='<div class="ov-funnel-label">'+s.label+convHtml+'</div><div class="ov-funnel-bar-wrap"><div class="ov-funnel-bar" style="width:'+w+'%;background:'+funnelColors[i]+';min-width:50px;">'+s.val+'</div></div><div class="ov-funnel-count">'+s.val+' 个</div>';
    fwrap.appendChild(row);
    if(i<2){var arr=document.createElement('div');arr.className='ov-funnel-arrow';arr.innerHTML='▼';fwrap.appendChild(arr);}
  });
  // 卡阶段提示
  var stuckCount=_ovFiltered.filter(function(d){return d.engStage!=='MP'&&d._ovKpi&&d._ovKpi.health==='r';}).length;
  var stuckTip=document.createElement('div');
  stuckTip.style.cssText='font-size:10px;color:var(--danger);margin-top:6px;text-align:center';
  stuckTip.innerHTML=stuckCount>0?'⚠ '+stuckCount+'个项目卡在NPI阶段且健康异常':'✓ 无卡阶段项目';
  fwrap.appendChild(stuckTip);
  var mpBars=document.getElementById('ovMpStageBars');if(!mpBars)return;
  mpBars.innerHTML='';
  [{label:'Ramp-up',val:ramp,color:'var(--primary-light)'},{label:'Mass Pro.',val:mass,color:'var(--success)'},{label:'EOL',val:eol,color:'var(--text-muted)'}].forEach(function(item){
    var pct=Math.round((item.val/maxMp)*100);
    mpBars.innerHTML+='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:10px;color:var(--text-sec);width:52px;flex-shrink:0;">'+item.label+'</span><div style="flex:1;background:var(--border-light);border-radius:3px;height:12px;overflow:hidden;"><div style="width:'+Math.max(pct,4)+'%;height:100%;background:'+item.color+';border-radius:3px;transition:width .4s;"></div></div><span style="font-size:11px;font-weight:700;color:'+item.color+';width:24px;text-align:right;">'+item.val+'</span></div>';
  });
}

/* ═══ 9. 重大项目红绿灯（含预警明细） ═══ */
function ovUpdateKeyProjects(){
  var keyList=_ovFiltered.filter(function(d){return d.isMajor;});
  var el=document.getElementById('ovKeyProjectList');
  var lb=document.getElementById('ovKeyCountLabel');if(lb)lb.textContent='共 '+keyList.length+' 个';
  if(!el)return;
  if(!keyList.length){el.innerHTML='<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;"><div style="font-size:28px;margin-bottom:8px;">⭐</div>当前筛选范围内无重大项目</div>';return;}
  // 生成预警文字
  function genAlertText(d){
    var kpi=d._ovKpi;if(!kpi)return'暂无预警';
    var texts=[];
    if(kpi.score<65)texts.push('健康分'+kpi.score+'偏低');
    var ds=DS.get(d.id);if(ds){
      if(ds.otd<90)texts.push('OTD '+ds.otd+'%');
      if(ds.kitRate<90)texts.push('齐套率'+ds.kitRate+'%');
      if(ds.otsGap>5)texts.push('OTS超'+ds.otsGap+'天');
    }
    if(d.lifecycleRaw==='NPI')texts.push('NPI阶段');
    return texts.length?texts.slice(0,2).join('·'):'指标正常';
  }
  el.innerHTML=keyList.map(function(d){
    var kpi=d._ovKpi||{health:'y',score:72};
    var lcLabel=d.lifecycleRaw==='NPI'?'<span class="ov-kp-badge npi-badge">NPI</span>':'<span class="ov-kp-badge mp-badge">MP</span>';
    var alertText=genAlertText(d);
    var alertColor=kpi.health==='r'?'var(--danger)':kpi.health==='y'?'var(--warning)':'var(--success)';
    return'<div class="ov-kp-item" onclick="ovDrillTo(\''+d.id+'\')" style="cursor:pointer">'+
      '<div class="ov-kp-dot '+kpi.health+'"></div>'+
      '<div class="ov-kp-info"><div class="ov-kp-name">'+d.name+'</div>'+
      '<div class="ov-kp-meta">'+d.customer+' · '+d.productLine+' · '+d.engStage+'</div>'+
      '<div style="font-size:10px;color:'+alertColor+';margin-top:2px">'+alertText+'</div></div>'+
      lcLabel+'<div class="ov-kp-score '+kpi.health+'">'+kpi.score+'</div></div>';
  }).join('');
}

/* ═══ 10. 图表渲染 ═══ */
var _OV_LC_COLORS={'NPI':'rgba(139,92,246,0.8)','Ramp-up':'rgba(59,130,246,0.8)','Mass Production':'rgba(34,197,94,0.8)','EOL':'rgba(148,163,184,0.8)'};
var _OV_BG_LIST=['A01','CEP','SAC'];
var _OV_DIM_LABELS=['可靠性','响应性','成本','资产','韧性'];
var _OV_RADAR_BG=['rgba(59,130,246,0.15)','rgba(139,92,246,0.15)','rgba(34,197,94,0.15)'];
var _OV_RADAR_BORDER=['rgba(59,130,246,0.9)','rgba(139,92,246,0.9)','rgba(34,197,94,0.9)'];

function ovUpdateCharts(){
  ovRenderLifecycleChart();
  ovRenderRadarChart();
  ovRenderCustomerChart();
  var t1=document.getElementById('ovChart1Total');if(t1)t1.textContent='共 '+_ovFiltered.length+' 个项目';
}

function ovRenderLifecycleChart(){
  var lcKeys=['NPI','Ramp-up','Mass Production','EOL'];
  var datasets=lcKeys.map(function(lc){
    return{label:lc==='Ramp-up'?'量产爬坡':lc==='Mass Production'?'稳定量产':lc,data:_OV_BG_LIST.map(function(bg){return _ovFiltered.filter(function(d){return d.bg===bg&&d.lifecycleRaw===lc;}).length;}),backgroundColor:_OV_LC_COLORS[lc],borderRadius:4,borderSkipped:false};
  });
  var ctx=document.getElementById('ovChartLifecycle');if(!ctx)return;
  if(_ovChartLifecycle)_ovChartLifecycle.destroy();
  _ovChartLifecycle=new Chart(ctx,{type:'bar',data:{labels:_OV_BG_LIST,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',align:'end',labels:{usePointStyle:true,font:{size:11}}},tooltip:{mode:'index',intersect:false}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:12,weight:'bold'}}},y:{stacked:true,title:{display:true,text:'项目数'},grid:{color:'#f1f5f9'}}}}});
}

function ovRenderRadarChart(){
  var datasets=_OV_BG_LIST.map(function(bg,i){
    var pool=_ovFiltered.filter(function(d){return d.bg===bg;});
    var avgs=pool.length?_OV_DIM_LABELS.map(function(_,di){return Math.round(pool.reduce(function(s,d){return s+(d._ovKpi?d._ovKpi.dims[di]:75);},0)/pool.length);}):[0,0,0,0,0];
    return{label:bg,data:avgs,backgroundColor:_OV_RADAR_BG[i],borderColor:_OV_RADAR_BORDER[i],borderWidth:2,pointBackgroundColor:_OV_RADAR_BORDER[i],pointRadius:3};
  });
  var lgd=document.getElementById('ovRadarLegend');
  if(lgd)lgd.innerHTML=_OV_BG_LIST.map(function(bg,i){return'<span style="font-size:10px;display:flex;align-items:center;gap:4px;color:'+_OV_RADAR_BORDER[i].replace('0.9','1')+';cursor:pointer" onclick="ovRadarDrill(\''+bg+'\')"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+_OV_RADAR_BORDER[i]+'"></span>'+bg+'</span>';}).join('');
  var ctx=document.getElementById('ovChartRadar');if(!ctx)return;
  if(_ovChartRadar)_ovChartRadar.destroy();
  _ovChartRadar=new Chart(ctx,{type:'radar',data:{labels:_OV_DIM_LABELS,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return' '+ctx.dataset.label+'：'+ctx.raw+' 分';}}}},scales:{r:{min:40,max:100,stepSize:15,ticks:{color:'#94a3b8',font:{size:9},backdropColor:'transparent'},grid:{color:'#e2e8f0'},pointLabels:{color:'#64748b',font:{size:11}},angleLines:{color:'#e2e8f0'}}}}});
}

// 雷达图下钻
function ovRadarDrill(bg){
  var pool=_ovFiltered.filter(function(d){return d.bg===bg;});
  if(!pool.length)return;
  // 弹出该BG项目列表
  var existing=document.getElementById('ovRadarModal');if(existing)existing.remove();
  var modal=document.createElement('div');
  modal.id='ovRadarModal';
  modal.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4)';
  var html='<div style="background:var(--card);border-radius:12px;padding:20px;width:420px;max-height:70vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;font-size:16px">'+bg+' BG 项目列表 ('+pool.length+')</h3><button onclick="document.getElementById(\'ovRadarModal\').remove()" style="border:0;background:var(--bg);border-radius:4px;width:28px;height:28px;cursor:pointer">✕</button></div>';
  pool.forEach(function(d){
    var kpi=d._ovKpi||{health:'y',score:72};
    var color=kpi.health==='g'?'var(--success)':kpi.health==='y'?'var(--warning)':'var(--danger)';
    html+='<div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--border-light);cursor:pointer" onclick="ovDrillTo(\''+d.id+'\')"><span style="width:8px;height:8px;border-radius:50%;background:'+color+'"></span><div style="flex:1"><div style="font-size:13px;font-weight:600">'+d.name+'</div><div style="font-size:11px;color:var(--text-muted)">'+d.customer+' · '+d.engStage+'</div></div><span style="font-weight:700;color:'+color+'">'+kpi.score+'</span></div>';
  });
  modal.innerHTML=html+'</div>';
  modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
  document.body.appendChild(modal);
}
window.ovRadarDrill=ovRadarDrill;

function ovRenderCustomerChart(){
  var cuMap={};
  _ovFiltered.forEach(function(d){cuMap[d.customer]=(cuMap[d.customer]||0)+1;});
  var sorted=Object.entries(cuMap).sort(function(a,b){return b[1]-a[1];});
  var labels=sorted.map(function(e){return e[0];});
  var values=sorted.map(function(e){return e[1];});
  var colors=labels.map(function(cu){
    var pool=_ovFiltered.filter(function(d){return d.customer===cu;});
    var gRate=pool.filter(function(d){return d._ovKpi&&d._ovKpi.health==='g';}).length/pool.length;
    if(gRate>0.75)return'rgba(34,197,94,0.80)';
    if(gRate>0.5)return'rgba(59,130,246,0.80)';
    if(gRate>0.3)return'rgba(234,179,8,0.80)';
    return'rgba(220,38,38,0.75)';
  });
  var ctx=document.getElementById('ovChartCustomer');if(!ctx)return;
  if(_ovChartCustomer)_ovChartCustomer.destroy();
  _ovChartCustomer=new Chart(ctx,{type:'bar',data:{labels:labels,datasets:[{label:'项目数',data:values,backgroundColor:colors,borderRadius:5,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){var cu=ctx.label;var pool=_ovFiltered.filter(function(d){return d.customer===cu;});var g=pool.filter(function(d){return d._ovKpi&&d._ovKpi.health==='g';}).length;var y=pool.filter(function(d){return d._ovKpi&&d._ovKpi.health==='y';}).length;var r=pool.filter(function(d){return d._ovKpi&&d._ovKpi.health==='r';}).length;return['总计：'+ctx.raw+' 个','🟢 '+g+'  🟡 '+y+'  🔴 '+r];}}}},scales:{x:{ticks:{color:'#94a3b8',font:{size:11}},grid:{color:'#f1f5f9'}},y:{ticks:{color:'#64748b',font:{size:11}},grid:{display:false}}}}});
}

/* ═══ 11. 工厂地理分布地图 ═══ */
function ovUpdateFactoryMap(){
  var el=document.getElementById('ovFactoryMap');if(!el)return;
  // 简易SVG世界地图（示意性）
  var w=1000,h=260;
  var factoryStats=_OV_FACTORIES.map(function(f){
    var pool=_ovFiltered.filter(function(d){
      // 按项目ID哈希分配工厂（模拟）
      var hash=d.id.split('').reduce(function(a,c){return a+c.charCodeAt(0);},0);
      var fi=hash%_OV_FACTORIES.length;
      return _OV_FACTORIES[fi].name===f.name;
    });
    var red=pool.filter(function(d){return d._ovKpi&&d._ovKpi.health==='r';}).length;
    var total=pool.length;
    return{factory:f,count:total,red:red};
  });
  var maxCount=Math.max.apply(null,factoryStats.map(function(f){return f.count;}).concat([1]));
  var html='<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:240px;background:linear-gradient(135deg,#e0f2fe,#f0f9ff);border-radius:8px">';
  // 简化大陆轮廓
  html+='<path d="M50,80 Q150,60 250,75 T450,70 Q500,65 550,75 L580,120 Q560,160 500,170 L300,165 Q200,160 150,150 L80,130 Z" fill="#cbd5e1" opacity="0.5"/>'; // 亚欧
  html+='<path d="M600,60 Q650,50 700,55 L730,90 Q720,120 690,130 L640,125 Q610,110 600,90 Z" fill="#cbd5e1" opacity="0.5"/>'; // 北美
  html+='<path d="M100,150 Q130,145 160,155 L170,190 Q150,210 120,205 L100,180 Z" fill="#cbd5e1" opacity="0.5"/>'; // 非洲
  html+='<path d="M700,170 Q730,165 760,175 L770,200 Q750,215 720,210 L700,195 Z" fill="#cbd5e1" opacity="0.5"/>'; // 南美
  html+='<path d="M750,200 Q800,195 820,205 L825,230 Q800,240 770,235 Z" fill="#cbd5e1" opacity="0.4"/>'; // 澳洲
  // 工厂气泡
  factoryStats.forEach(function(fs){
    var x=fs.factory.x/100*w,y=fs.factory.y/100*h;
    var r=Math.max(8,Math.min(32,(fs.count/maxCount)*30+8));
    var color=fs.red>0?'var(--danger)':fs.count>0?'var(--primary)':'var(--text-muted)';
    var bgColor=fs.red>0?'rgba(220,38,38,0.3)':'rgba(59,130,246,0.25)';
    html+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+bgColor+'" stroke="'+color+'" stroke-width="2"/>';
    html+='<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" font-size="11" font-weight="700" fill="'+(fs.red>0?'#dc2626':'#1e5cb3')+'">'+fs.count+'</text>';
    html+='<text x="'+x+'" y="'+(y+r+14)+'" text-anchor="middle" font-size="11" font-weight="600" fill="#475569">'+fs.factory.name+'</text>';
    if(fs.red>0)html+='<text x="'+x+'" y="'+(y+r+26)+'" text-anchor="middle" font-size="9" fill="#dc2626">⚠'+fs.red+'异常</text>';
  });
  html+='</svg>';
  // 图例
  html+='<div style="display:flex;gap:16px;font-size:11px;color:var(--text-sec);margin-top:6px"><span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:rgba(59,130,246,0.5);border:1px solid var(--primary)"></span> 正常工厂</span><span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:rgba(220,38,38,0.3);border:1px solid var(--danger)"></span> 有异常项目</span></div>';
  el.innerHTML=html;
}

/* ═══ 12. 图表导出 ═══ */
function ovExportChart(type,format){
  if(format==='PNG'){
    var canvasId=type==='lifecycle'?'ovChartLifecycle':type==='radar'?'ovChartRadar':'ovChartCustomer';
    var canvas=document.getElementById(canvasId);
    if(!canvas)return;
    var link=document.createElement('a');
    link.download='overview-'+type+'-'+Date.now()+'.png';
    link.href=canvas.toDataURL('image/png');
    link.click();
  }else if(format==='CSV'){
    var csv='';
    if(type==='lifecycle'){
      csv='BG,NPI,Ramp-up,Mass Production,EOL\n';
      _OV_BG_LIST.forEach(function(bg){
        csv+=bg+','+['NPI','Ramp-up','Mass Production','EOL'].map(function(lc){return _ovFiltered.filter(function(d){return d.bg===bg&&d.lifecycleRaw===lc;}).length;}).join(',')+'\n';
      });
    }
    var blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
    var link=document.createElement('a');
    link.download='overview-'+type+'-'+Date.now()+'.csv';
    link.href=URL.createObjectURL(blob);
    link.click();
  }
}
window.ovExportChart=ovExportChart;

/* ═══ 13. 紧凑/详细模式 + 环比 ═══ */
function ovSetMode(mode){
  _ovMode=mode;
  document.getElementById('ovModeCompact').classList.toggle('active',mode==='compact');
  document.getElementById('ovModeDetail').classList.toggle('active',mode==='detail');
  ovRenderTable();
}
window.ovSetMode=ovSetMode;

function ovToggleMom(){
  _ovShowMom=!_ovShowMom;
  document.getElementById('ovMomToggle').classList.toggle('active',_ovShowMom);
  ovRenderTable();
}
window.ovToggleMom=ovToggleMom;

/* ═══ 14. 表格排序（含箭头指示） ═══ */
function ovSortTable(key,keepDir){
  if(!keepDir){if(_ovSortKey===key)_ovSortDir*=-1;else{_ovSortKey=key;_ovSortDir=-1;}}
  var keyMap={key:'isMajor',bg:'bg',bu:'bu',customer:'customer',product:'productLine',name:'name',stage:'engStage',lifecycle:'lifecycleRaw',score:'_ovScore',health:'_ovHealth'};
  var field=keyMap[key]||key;
  _ovFiltered.sort(function(a,b){
    var va,vb;
    if(field==='_ovScore'){va=a._ovKpi?a._ovKpi.score:0;vb=b._ovKpi?b._ovKpi.score:0;}
    else if(field==='_ovHealth'){var ord={g:2,y:1,r:0};va=a._ovKpi?ord[a._ovKpi.health]||0:0;vb=b._ovKpi?ord[b._ovKpi.health]||0:0;}
    else if(field==='isMajor'){va=a.isMajor?1:0;vb=b.isMajor?1:0;}
    else{va=a[field];vb=b[field];}
    if(typeof va==='string')return va.localeCompare(vb)*_ovSortDir;
    return(va-vb)*_ovSortDir;
  });
  ovRenderTable();
}
window.ovSortTable=ovSortTable;

/* ═══ 15. 表格渲染（动态表头+紧凑/详细+环比+排序箭头） ═══ */
var _OV_LC_MAP={'NPI':'ov-lc-npi','Ramp-up':'ov-lc-ramp','Mass Production':'ov-lc-mass','EOL':'ov-lc-eol'};
var _OV_HEALTH_LABEL={g:'正常',y:'预警',r:'异常'};
var _OV_DIM_SHORT=['可靠','响应','成本','资产','韧性'];

function ovRenderTable(){
  // 动态表头
  var thead=document.getElementById('ovProjThead');
  if(thead){
    var sortIcon=function(key){if(_ovSortKey!==key)return'<span class="ov-sort-icon">↕</span>';return'<span class="ov-sort-icon active">'+(_ovSortDir>0?'↑':'↓')+'</span>';};
    var html='<tr>';
    html+='<th onclick="ovSortTable(\'key\')">⭐ '+sortIcon('key')+'</th>';
    if(_ovMode==='detail'){html+='<th onclick="ovSortTable(\'bg\')">BG '+sortIcon('bg')+'</th><th onclick="ovSortTable(\'bu\')">BU '+sortIcon('bu')+'</th>';}
    html+='<th onclick="ovSortTable(\'customer\')">客户 '+sortIcon('customer')+'</th>';
    if(_ovMode==='detail')html+='<th onclick="ovSortTable(\'product\')">产品 '+sortIcon('product')+'</th>';
    html+='<th onclick="ovSortTable(\'name\')">项目名称 '+sortIcon('name')+'</th>';
    html+='<th onclick="ovSortTable(\'stage\')">阶段 '+sortIcon('stage')+'</th>';
    if(_ovMode==='detail'){html+='<th onclick="ovSortTable(\'lifecycle\')">生命周期 '+sortIcon('lifecycle')+'</th>';html+='<th title="交付可靠性" style="cursor:help">①可靠</th><th title="响应速度" style="cursor:help">②响应</th><th title="盈利能力" style="cursor:help">③成本</th><th title="资产效率" style="cursor:help">④资产</th><th title="敏捷韧性" style="cursor:help">⑤韧性</th>';}
    html+='<th onclick="ovSortTable(\'score\')">综合评分 '+sortIcon('score')+'</th>';
    if(_ovShowMom)html+='<th>环比</th>';
    html+='<th onclick="ovSortTable(\'health\')">健康 '+sortIcon('health')+'</th>';
    html+='<th style="width:36px;text-align:center;">→</th>';
    html+='</tr>';
    thead.innerHTML=html;
  }
  // 表体
  var total=_ovFiltered.length;
  var pages=Math.max(1,Math.ceil(total/_ovPageSize));
  _ovPage=Math.min(_ovPage,pages);
  var start=(_ovPage-1)*_ovPageSize;
  var slice=_ovFiltered.slice(start,start+_ovPageSize);
  var tbody=document.getElementById('ovProjTbody');
  var empty=document.getElementById('ovTableEmpty');
  var titleCount=document.getElementById('ovTableTitleCount');
  if(titleCount)titleCount.textContent=total?('（共 '+total+' 条）'):'';
  if(!slice.length){if(tbody)tbody.innerHTML='';if(empty)empty.style.display='block';ovRenderPagination(0,0);var pi=document.getElementById('ovPageInfo');if(pi)pi.textContent='共 0 条';return;}
  if(empty)empty.style.display='none';
  if(!tbody)return;
  tbody.innerHTML=slice.map(function(d){
    var kpi=d._ovKpi||{dims:[75,75,75,75,75],score:75,health:'y',mom:0};
    var dimTds=_ovMode==='detail'?kpi.dims.map(function(v,i){var cls=v>=80?'g':v>=65?'y':'r';return'<td><div class="ov-dim-cell '+cls+'" style="width:auto;padding:0 5px;font-size:10px;" title="'+_OV_DIM_SHORT[i]+'维度：'+v+' 分">'+v+'</div></td>';}).join(''):'';
    var lcClass=_OV_LC_MAP[d.lifecycleRaw]||'ov-lc-npi';
    var lcText=d.lifecycleRaw==='Ramp-up'?'量产爬坡':d.lifecycleRaw==='Mass Production'?'稳定量产':d.lifecycleRaw==='EOL'?'量产EOL':d.lifecycleRaw;
    var drillTarget=kpi.health==='r'?'风险预警':d.lifecycleRaw==='NPI'?'物料状态':'项目进度';
    var momTd=_ovShowMom?(kpi.mom!==0?'<td><span style="color:'+(kpi.mom>0?'var(--success)':'var(--danger)')+';font-weight:700;font-size:11px">'+(kpi.mom>0?'▲':'▼')+Math.abs(kpi.mom)+'</span></td>':'<td><span style="color:var(--text-muted)">—</span></td>'):'';
    var lcTd=_ovMode==='detail'?'<td><span class="ov-lc-badge '+lcClass+'">'+lcText+'</span></td>':'';
    var bgTd=_ovMode==='detail'?'<td>'+d.bg+'</td><td style="color:var(--text-sec);">'+d.bu+'</td>':'';
    var prodTd=_ovMode==='detail'?'<td style="color:var(--text-sec);">'+d.productLine+'</td>':'';
    return'<tr class="ov-drill-row" onclick="ovDrillTo(\''+d.id+'\')" title="点击查看「'+drillTarget+'」详情">'+
      '<td style="text-align:center;width:32px;">'+(d.isMajor?'<span class="ov-star-mark">★</span>':'')+'</td>'+
      bgTd+'<td><strong>'+d.customer+'</strong></td>'+prodTd+
      '<td class="td-name">'+d.name+'</td>'+
      '<td><span class="ov-stage-badge ov-stage-'+d.engStage+'">'+d.engStage+'</span></td>'+
      lcTd+dimTds+
      '<td><span class="ov-score-pill '+kpi.health+'">'+kpi.score+'</span></td>'+
      momTd+
      '<td><span class="ov-health-dot '+kpi.health+'">'+_OV_HEALTH_LABEL[kpi.health]+'</span></td>'+
      '<td style="text-align:center;width:36px;"><i class="fa-solid fa-arrow-right" style="color:var(--text-muted);font-size:11px;"></i></td></tr>';
  }).join('');
  ovRenderPagination(total,pages);
  var pi=document.getElementById('ovPageInfo');if(pi)pi.textContent='第 '+(start+1)+'–'+Math.min(start+_ovPageSize,total)+' 条，共 '+total+' 条';
}

/* ═══ 16. 分页器（增强版：首末页+跳转） ═══ */
function ovRenderPagination(total,pages){
  var pg=document.getElementById('ovPagination');if(!pg)return;
  if(total===0){pg.innerHTML='';return;}
  var html='';
  html+='<button class="ov-page-btn" onclick="ovGoPage(1)" '+(_ovPage<=1?'disabled':'')+' title="首页">⟨⟨</button>';
  html+='<button class="ov-page-btn" onclick="ovGoPage('+(_ovPage-1)+')" '+(_ovPage<=1?'disabled':'')+'>‹</button>';
  var range=2;
  for(var i=1;i<=pages;i++){
    if(i===1||i===pages||Math.abs(i-_ovPage)<=range){
      html+='<button class="ov-page-btn'+(i===_ovPage?' active':'')+'" onclick="ovGoPage('+i+')">'+i+'</button>';
    }else if(Math.abs(i-_ovPage)===range+1){
      html+='<span style="color:var(--text-muted);padding:0 4px;font-size:12px;">…</span>';
    }
  }
  html+='<button class="ov-page-btn" onclick="ovGoPage('+(_ovPage+1)+')" '+(_ovPage>=pages?'disabled':'')+'>›</button>';
  html+='<button class="ov-page-btn" onclick="ovGoPage('+pages+')" '+(_ovPage>=pages?'disabled':'')+' title="末页">⟩⟩</button>';
  if(pages>5){
    html+='<input type="number" min="1" max="'+pages+'" value="'+_ovPage+'" style="width:42px;height:28px;border:1px solid var(--border);border-radius:4px;text-align:center;font-size:11px" onchange="ovGoPage(this.value)">';
  }
  pg.innerHTML=html;
}
function ovGoPage(p){
  p=parseInt(p);if(isNaN(p))return;
  var pages=Math.ceil(_ovFiltered.length/_ovPageSize);
  if(p<1||p>pages)return;
  _ovPage=p;ovRenderTable();
  var tableCard=document.querySelector('.ov-table-card');if(tableCard)tableCard.scrollIntoView({behavior:'smooth',block:'start'});
}
window.ovGoPage=ovGoPage;
function ovChangePageSize(){_ovPageSize=parseInt(document.getElementById('ovPageSize').value);_ovPage=1;ovRenderTable();}
window.ovChangePageSize=ovChangePageSize;
