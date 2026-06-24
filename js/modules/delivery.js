// Module: delivery — 客户交期答复 v8.0 (单项目·四维联动·交期承诺/延迟分析)
(function(){

// ═══════════════ 延迟原因 ═══════════════
var DELAY_REASONS = [
  {id:'material',name:'物料短缺',icon:'fa-box-open',color:'red'},
  {id:'capacity',name:'产能不足',icon:'fa-industry',color:'amber'},
  {id:'quality',name:'质量异常',icon:'fa-triangle-exclamation',color:'purple'},
  {id:'logistics',name:'物流延迟',icon:'fa-truck',color:'blue'},
  {id:'design',name:'设计变更',icon:'fa-rotate',color:'cyan'},
];

// ═══════════════ 数据生成 ═══════════════
var _delCache = {};
function getDeliveryData(pid){
  if(_delCache[pid]) return _delCache[pid];
  var p = projects.find(function(x){return x.id===pid;});
  if(!p){ _delCache[pid]={items:[],weekly:[]}; return _delCache[pid]; }
  var seed = parseInt(pid.replace(/\D/g,'')||'1');
  function rng(){seed=(seed*9301+49297)%233280;return seed/233280;}

  // 生成16周交期数据
  var weekly = [];
  for(var w=0;w<16;w++){
    var weekNum = 22+w;
    var custForecast = Math.floor(p.volume/4 * (0.7+rng()*0.6));
    var commit = Math.floor(custForecast * (0.6+rng()*0.45));
    var delayed = Math.floor(custForecast * (0.05+rng()*0.3));
    var onTime = commit - delayed;
    if(onTime<0) onTime=0;
    var reason = null;
    var delayDays = 0;
    if(delayed>0){
      var rIdx = Math.floor(rng()*5);
      reason = DELAY_REASONS[rIdx];
      delayDays = 3+Math.floor(rng()*14);
    }
    weekly.push({
      week: 'W'+weekNum,
      weekNum: weekNum,
      custForecast: custForecast,
      commit: commit,
      onTime: onTime,
      delayed: delayed,
      delayDays: delayDays,
      reason: reason,
      status: delayed===0?'满足':delayed<custForecast*0.15?'部分延迟':'严重延迟'
    });
  }

  // 交期答复明细
  var items = [];
  var poCount = 4+Math.floor(rng()*6);
  for(var i=0;i<poCount;i++){
    var w = weekly[Math.floor(rng()*weekly.length)];
    var reqQty = Math.floor(p.volume/(8+Math.floor(rng()*8)));
    var commitQty = Math.floor(reqQty*(0.7+rng()*0.35));
    if(commitQty>reqQty) commitQty=reqQty;
    var gap = reqQty - commitQty;
    var commitDate = '2026-W'+w.weekNum;
    var estDate = gap>0?'2026-W'+(w.weekNum+Math.ceil(gap/reqQty*2)):commitDate;
    var rsn = gap>0?DELAY_REASONS[Math.floor(rng()*5)]:null;
    items.push({
      poNo: 'PO-'+p.id.replace('P','')+'-'+String(i+1).padStart(3,'0'),
      week: w.week,
      reqQty: reqQty,
      commitQty: commitQty,
      gap: gap,
      commitDate: commitDate,
      estDate: estDate,
      reason: rsn,
      status: gap===0?'满足':gap<reqQty*0.2?'部分延迟':'推迟交付',
      atp: Math.floor(rng()*100)
    });
  }

  _delCache[pid] = {items:items, weekly:weekly};
  return _delCache[pid];
}

// ═══════════════ 渲染 ═══════════════
function initPage_delivery(){
  try{
  var fp = getFilteredProjects();
  var sel = document.getElementById('deliveryProjectSelect');
  if(sel) fillProjectSelect(sel, fp);
  var pid = sel ? sel.value : '';
  var p = pid ? projects.find(function(x){return x.id===pid;}) : null;
  if(!p && fp.length){ p=fp[0]; pid=p.id; if(sel) sel.value=pid; }
  if(!p) return;

  var data = getDeliveryData(pid);
  var totalForecast = data.weekly.reduce(function(s,w){return s+w.custForecast;},0);
  var totalCommit = data.weekly.reduce(function(s,w){return s+w.commit;},0);
  var totalDelayed = data.weekly.reduce(function(s,w){return s+w.delayed;},0);
  var totalOnTime = data.weekly.reduce(function(s,w){return s+w.onTime;},0);
  var atpRate = totalForecast?Math.round(totalOnTime/totalForecast*100):0;
  var delayWeeks = data.weekly.filter(function(w){return w.delayed>0;}).length;
  var avgDelayDays = delayWeeks?Math.round(data.weekly.filter(function(w){return w.delayDays>0;}).reduce(function(s,w){return s+w.delayDays;},0)/delayWeeks):0;
  var severeCount = data.weekly.filter(function(w){return w.status==='严重延迟';}).length;

  // 项目信息
  var info = document.getElementById('dlInfoItems');
  if(info) info.innerHTML =
    '<span style="font-weight:700;color:var(--primary);margin-right:8px">'+p.name+'</span>'
    +'<span class="dl-info-item"><b>客户</b> '+p.customer+'</span>'
    +'<span class="dl-info-item"><b>产品线</b> '+p.productLine+'</span>'
    +'<span class="dl-info-item"><b>生命周期</b> '+p.lifecycle+'</span>'
    +'<span class="dl-info-item"><b>PO数</b> '+data.items.length+'</span>';

  // KPI
  var kg = document.getElementById('dlCards');
  if(kg) kg.innerHTML = [
    {label:'客户预测总量',value:totalForecast.toLocaleString(),sub:'16周滚动',accent:'blue'},
    {label:'承诺满足',value:totalOnTime.toLocaleString(),sub:'ATP达标率 '+atpRate+'%',accent:atpRate>=85?'green':'amber'},
    {label:'延迟交付量',value:totalDelayed.toLocaleString(),sub:delayWeeks+'周有延迟',accent:totalDelayed>0?'red':'green'},
    {label:'ATP达标率',value:atpRate+'%',sub:'准时交付比例',accent:atpRate>=90?'green':atpRate>=75?'amber':'red'},
    {label:'平均延迟',value:avgDelayDays+'天',sub:'延迟周均值',accent:avgDelayDays>7?'red':avgDelayDays>3?'amber':'green'},
    {label:'严重延迟',value:severeCount+'周',sub:'需立即处理',accent:severeCount>2?'red':severeCount>0?'amber':'green'},
  ].map(function(k){return '<div class="dl-card"><div class="dl-card-accent '+k.accent+'"></div><div class="dl-card-label">'+k.label+'</div><div class="dl-card-value">'+k.value+'</div><div class="dl-card-sub">'+k.sub+'</div></div>';}).join('');

  // 交期趋势图
  renderTrendChart(data);

  // 延迟原因 + 催料行动
  renderDelayAnalysis(data);

  // 交期明细表
  renderTable(data);

  }catch(e){console.error('delivery init error:',e);}
}

function renderTrendChart(data){
  var ctx = document.getElementById('dlTimelineChart');
  if(!ctx) return;
  try{
  if(App.charts.dlTrend){App.charts.dlTrend.destroy();App.charts.dlTrend=null;}
  var recent = data.weekly.slice(-12);
  var labels = recent.map(function(w){return w.week;});
  App.charts.dlTrend = new Chart(ctx,{
    type:'bar',
    data:{
      labels:labels,
      datasets:[
        {label:'满足',data:recent.map(function(w){return w.onTime;}),backgroundColor:'rgba(34,197,94,0.75)',borderRadius:{topLeft:3,topRight:3},stack:'stack1',order:2},
        {label:'延迟',data:recent.map(function(w){return w.delayed;}),backgroundColor:'rgba(239,68,68,0.75)',borderRadius:{topLeft:3,topRight:3},stack:'stack1',order:2},
        {label:'预测',data:recent.map(function(w){return Math.max(0,w.custForecast-w.commit);}),backgroundColor:'rgba(59,130,246,0.3)',borderRadius:{topLeft:3,topRight:3},stack:'stack1',order:2},
        {type:'line',label:'ATP率',data:recent.map(function(w){return w.custForecast?Math.round(w.onTime/w.custForecast*100):0;}),borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.08)',borderWidth:2.5,pointRadius:5,pointBackgroundColor:'#f59e0b',pointBorderColor:'#fff',pointBorderWidth:2,pointHoverRadius:7,tension:0.35,fill:true,yAxisID:'y1',order:1}
      ]
    },
    options:{
      responsive:false,maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:true,position:'bottom',labels:{usePointStyle:true,pointStyleWidth:10,padding:20,font:{size:10},generateLabels:function(chart){var d=chart.data.datasets;return d.map(function(ds,i){return{text:ds.label,fillStyle:i<3?ds.backgroundColor:undefined,strokeStyle:i===3?ds.borderColor:undefined,lineWidth:i===3?3:undefined,pointStyle:i===3?'line':'rect',pointStyleWidth:i===3?20:10,hidden:false,index:i};});}}},
        tooltip:{callbacks:{label:function(ctx){var v=ctx.parsed.y;return ctx.dataset.label+': '+(ctx.datasetIndex===3?v+'%':v.toLocaleString());}}}},
      scales:{
        y:{stacked:true,grid:{color:'#f1f5f9'},title:{display:true,text:'数量'},ticks:{font:{size:10}}},
        y1:{position:'right',min:0,max:100,grid:{display:false},title:{display:true,text:'ATP率%'},ticks:{font:{size:10},callback:function(v){return v+'%'}}},
        x:{stacked:true,grid:{display:false},ticks:{font:{size:10}}}
      }
    }
  });
  }catch(e){console.error('dl chart error:',e);}
}

function renderDelayAnalysis(data){
  var el = document.getElementById('dlRootPanel');
  if(!el) return;
  
  // Part 1: delay reason distribution
  var reasonMap = {};
  data.weekly.filter(function(w){return w.reason;}).forEach(function(w){
    if(!reasonMap[w.reason.id]) reasonMap[w.reason.id]={reason:w.reason,count:0,total:0};
    reasonMap[w.reason.id].count++;
    reasonMap[w.reason.id].total+=w.delayed;
  });
  var reasons = Object.values(reasonMap).sort(function(a,b){return b.total-a.total;});
  
  // Part 2: delayed items
  var delayed = data.items.filter(function(d){return d.gap>0;});
  
  var part1 = reasons.length>0
    ?'<div class="dl-root-title">延迟原因分布</div><div class="dl-root-grid">'+reasons.map(function(r){
      return '<div class="dl-root-card">'
        +'<div class="dl-root-card-title"><i class="fas '+r.reason.icon+'" style="color:var(--'+(r.reason.color==='amber'?'warning':r.reason.color)+')"></i> '+r.reason.name+'</div>'
        +'<div class="dl-root-card-body"><b>'+r.count+'次</b> · 影响 <b style="color:var(--danger)">'+r.total.toLocaleString()+'</b></div>'
        +'</div>';
    }).join('')+'</div>'
    :'<div class="dl-root-title">延迟原因分布</div><div style="color:var(--success);padding:10px"><i class="fas fa-circle-check"></i> 无延迟</div>';
  
  var part2 = delayed.length>0
    ?'<div class="dl-root-title" style="margin-top:12px">延迟PO清单 & 催料行动</div><div class="dl-root-grid">'+delayed.slice(0,8).map(function(d){
      var priority = d.gap>d.reqQty*0.3?'紧急':d.gap>d.reqQty*0.15?'重要':'关注';
      var pCls = priority==='紧急'?'red':priority==='重要'?'amber':'blue';
      var action = d.reason?(d.reason.id==='material'?'催料到厂':d.reason.id==='capacity'?'调整排产':d.reason.id==='quality'?'推动放行':d.reason.id==='logistics'?'加急物流':'评估变更影响'):'跟进交期';
      return '<div class="dl-root-card">'
        +'<div class="dl-root-card-title"><span>'+d.poNo+'</span><span class="x-pill '+pCls+'">'+priority+'</span></div>'
        +'<div class="dl-root-card-body">'
        +'<div>缺口 <b style="color:var(--danger)">'+d.gap+'</b> / '+d.reqQty+'</div>'
        +'<div>原因：'+(d.reason?d.reason.name:'未知')+' · 建议：'+action+'</div>'
        +'</div></div>';
    }).join('')+'</div>'
    :'';
  
  el.innerHTML = part1 + part2;
}

function renderTable(data){
  var thead = document.getElementById('dlTHead');
  var tbody = document.getElementById('dlTBody');
  if(!thead||!tbody) return;
  thead.innerHTML = '<tr><th>PO号</th><th>周次</th><th>需求量</th><th>承诺量</th><th>缺口</th><th>承诺交期</th><th>预计交期</th><th>ATP%</th><th>延迟原因</th><th>状态</th></tr>';
  tbody.innerHTML = data.items.sort(function(a,b){return b.gap-a.gap;}).map(function(d){
    var sCls = d.status==='满足'?'green':d.status==='部分延迟'?'amber':'red';
    var atpColor = d.atp>=90?'var(--success)':d.atp>=70?'var(--warning)':'var(--danger)';
    return '<tr>'
      +'<td><strong>'+d.poNo+'</strong></td>'
      +'<td>'+d.week+'</td>'
      +'<td>'+d.reqQty.toLocaleString()+'</td>'
      +'<td>'+d.commitQty.toLocaleString()+'</td>'
      +'<td style="color:'+(d.gap>0?'var(--danger)':'var(--success)')+';font-weight:700">'+(d.gap>0?'-'+d.gap:'0')+'</td>'
      +'<td>'+d.commitDate+'</td>'
      +'<td>'+(d.estDate!==d.commitDate?'<span style="color:var(--danger)">'+d.estDate+'</span>':d.estDate)+'</td>'
      +'<td style="color:'+atpColor+';font-weight:700">'+d.atp+'%</td>'
      +'<td>'+(d.reason?'<span class="dl-reason-tag"><i class="fas '+d.reason.icon+'"></i> '+d.reason.name+'</span>':'-')+'</td>'
      +'<td><span class="dl-pill '+sCls+'">'+d.status+'</span></td>'
      +'</tr>';
  }).join('');
}

window.initPage_delivery = initPage_delivery;
})();
registerModule('delivery', initPage_delivery);
