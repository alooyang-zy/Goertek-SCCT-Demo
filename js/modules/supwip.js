// ===== 在制协同 =====
(function(){
"use strict";
function initPage_supwip(container){
  container = container || document.getElementById('page-supwip');
  if(!container) return;
  var fp = (typeof getFilteredProjects==='function') ? getFilteredProjects() : (typeof projects!=='undefined'?projects:[]);
  if(!fp.length) return;

  container.innerHTML =
    '<div class="filter-bar"><div class="filter-group"><label>项目:</label><select id="supwipProjectSelect" onchange="initPage_supwip()"></select></div>'
    + '<span style="font-size:11px;color:var(--text-muted);margin-left:12px;">供应商在制WIP进度 · 交期预警 · 产能预留</span></div>'
    + '<div class="kpi-grid" id="supwipKpiGrid"></div>'
    + '<div class="chart-row" style="grid-template-columns:1fr">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-industry"></i> 供应商在制WIP明细</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="supwipTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr 1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-chart-line"></i> 在制工单趋势</h3></div><div class="card-body"><div style="height:260px"><canvas id="supwipTrendChart"></canvas></div></div></div>'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-calendar-check"></i> 产能预留确认</h3></div><div class="card-body" id="supwipCapacity"></div></div>'
    + '</div>';

  var sel = container.querySelector('#supwipProjectSelect');
  if(sel){ if(typeof fillProjectSelect==='function') fillProjectSelect(sel,fp); else sel.innerHTML=fp.map(function(p){return'<option value="'+p.id+'">'+p.name+'</option>';}).join(''); }

  var pid = sel?sel.value:'';
  var d = (window.DS && pid)?DS.get(pid):null;
  var seed = pid?pid.charCodeAt(4)||0:0;

  // KPI卡
  var kpiGrid = container.querySelector('#supwipKpiGrid');
  if(kpiGrid){
    var wipOrders = 20+seed%30;
    var suppliers = 8+seed%6;
    var warnings = 2+seed%5;
    var onTimeRate = d?Math.round(d.otd*0.9):88;
    kpiGrid.innerHTML = [
      {lbl:'在制工单',val:wipOrders,unit:'单',color:'var(--primary)',icon:'fa-clipboard-list'},
      {lbl:'涉及供应商',val:suppliers,unit:'家',color:'var(--info)',icon:'fa-building'},
      {lbl:'交期预警',val:warnings,unit:'项',color:'var(--danger)',icon:'fa-triangle-exclamation'},
      {lbl:'准时完工率',val:onTimeRate,unit:'%',color:onTimeRate>=90?'var(--success)':'var(--warning)',icon:'fa-clock'}
    ].map(function(k){return '<div class="kpi-card" style="border-top:3px solid '+k.color+'"><div style="display:flex;align-items:center;gap:8px"><i class="fas '+k.icon+'" style="color:'+k.color+'"></i><span style="font-size:11px;color:var(--text-sec);font-weight:600">'+k.lbl+'</span></div><div style="font-size:28px;font-weight:800;color:'+k.color+';margin-top:8px">'+k.val+'<span style="font-size:13px;color:var(--text-muted)"> '+k.unit+'</span></div></div>';}).join('');
  }

  // WIP明细表
  var supNames = ['歌尔电子(潍坊)','歌尔光电','山东富冠','潍坊德信','青岛海信视讯','苏州立讯精密','东莞比亚迪','深圳富士康'];
  var matNames = ['BES2300YP','麦克风PCBA','电池模组','扬声器单元','FPC软板','天线模组','摄像头模组','结构件壳体'];
  var table = container.querySelector('#supwipTable');
  if(table){
    table.querySelector('thead').innerHTML = '<tr><th>供应商</th><th>物料</th><th>工单号</th><th>排产日期</th><th>数量</th><th>预计完工</th><th>状态</th><th>预警</th></tr>';
    var rows = [];
    for(var i=0;i<12;i++){
      var sup = supNames[(seed+i)%supNames.length];
      var mat = matNames[(seed+i*2)%matNames.length];
      var wo = 'WO-'+(1000+seed+i);
      var qty = 500+(seed*7+i*131)%3000;
      var daysAhead = (seed+i*3)%14;
      var status = i<3?'delayed':i<7?'in_progress':'completed';
      var stColor = status==='delayed'?'var(--danger)':status==='in_progress'?'var(--warning)':'var(--success)';
      var stText = status==='delayed'?'延期':status==='in_progress'?'在制':'已完工';
      var warn = status==='delayed'?'<span style="color:var(--danger);font-weight:700">交期风险</span>':status==='in_progress'?'<span style="color:var(--warning)">关注</span>':'<span style="color:var(--success)">正常</span>';
      rows.push('<tr><td>'+sup+'</td><td>'+mat+'</td><td>'+wo+'</td><td>D-'+daysAhead+'</td><td>'+qty+'</td><td>D+'+(daysAhead+2)+'</td><td style="color:'+stColor+';font-weight:600">'+stText+'</td><td>'+warn+'</td></tr>');
    }
    table.querySelector('tbody').innerHTML = rows.join('');
  }

  // 趋势图
  if(window.Chart){
    var trendCtx = container.querySelector('#supwipTrendChart');
    if(trendCtx){
      if(App.charts.supwipTrend) App.charts.supwipTrend.destroy();
      App.charts.supwipTrend = new Chart(trendCtx,{type:'line',data:{labels:['W1','W2','W3','W4','W5','W6','W7','W8'],datasets:[
        {label:'在制工单',data:[15,18,22,20,25,28,24,21],borderColor:'rgba(59,130,246,1)',backgroundColor:'rgba(59,130,246,0.1)',borderWidth:2,tension:0.3},
        {label:'延期工单',data:[3,4,2,5,3,4,2,3],borderColor:'rgba(239,68,68,1)',backgroundColor:'rgba(239,68,68,0.1)',borderWidth:2,tension:0.3}
      ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
    }
  }

  // 产能预留
  var capEl = container.querySelector('#supwipCapacity');
  if(capEl){
    var caps = [
      {sup:'歌尔电子(潍坊)',reserved:85,total:100,status:'ok'},
      {sup:'山东富冠',reserved:95,total:100,status:'warn'},
      {sup:'苏州立讯精密',reserved:100,total:100,status:'full'}
    ];
    capEl.innerHTML = caps.map(function(c){
      var color = c.status==='full'?'var(--danger)':c.status==='warn'?'var(--warning)':'var(--success)';
      return '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:12px;font-weight:600">'+c.sup+'</span><span style="font-size:12px;color:'+color+';font-weight:700">'+c.reserved+'/'+c.total+'%</span></div><div style="height:8px;background:var(--border-light);border-radius:4px;overflow:hidden"><div style="width:'+c.reserved+'%;height:100%;background:'+color+';border-radius:4px"></div></div></div>';
    }).join('');
  }
}
registerModule('supwip', initPage_supwip);
})();
