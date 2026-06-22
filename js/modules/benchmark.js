// ===== 绩效对比 =====
(function(){
"use strict";
function initPage_benchmark(container){
  container = container || document.getElementById('page-benchmark');
  if(!container) return;
  var fp = (typeof getFilteredProjects==='function') ? getFilteredProjects() : (typeof projects!=='undefined'?projects:[]);
  if(!fp.length) fp = [{id:'',name:'无项目',bg:'',customer:'',productLine:'',engStage:''}];
  var top5 = fp.slice(0,5);

  container.innerHTML =
    '<div class="filter-bar"><div class="filter-group"><label>对比项目:</label><select id="bmProj1" onchange="initPage_benchmark()"></select></div>'
    + '<div class="filter-group"><label>对比项目:</label><select id="bmProj2" onchange="initPage_benchmark()"></select></div>'
    + '<div class="filter-group"><label>对比项目:</label><select id="bmProj3" onchange="initPage_benchmark()"></select></div>'
    + '<span style="font-size:11px;color:var(--text-muted);margin-left:12px;">多项目跨维度SCOR绩效对比 · 趋势 · 热力矩阵</span></div>'
    + '<div class="kpi-grid" id="bmKpiGrid"></div>'
    + '<div class="chart-row" style="grid-template-columns:1fr 1fr">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-radar"></i> SCOR五维雷达对比</h3></div><div class="card-body"><div style="height:320px"><canvas id="bmRadarChart"></canvas></div></div></div>'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-chart-line"></i> 近12周综合评分趋势</h3></div><div class="card-body"><div style="height:320px"><canvas id="bmTrendChart"></canvas></div></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-table-cells"></i> 热力矩阵 · 项目×指标红黄绿灯</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="bmHeatTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>';

  // 填充下拉
  ['bmProj1','bmProj2','bmProj3'].forEach(function(selId,idx){
    var sel = container.querySelector('#'+selId);
    if(sel){ sel.innerHTML = fp.map(function(p){ return '<option value="'+p.id+'"'+(p.id===(top5[idx]?top5[idx].id:'')?' selected':'')+'>'+p.name+' ['+p.bg+']</option>'; }).join(''); }
  });

  var pids = ['bmProj1','bmProj2','bmProj3'].map(function(id){ var s=container.querySelector('#'+id); return s?s.value:''; }).filter(Boolean);
  var dsList = pids.map(function(pid){ return DS?DS.get(pid):null; }).filter(Boolean);

  // KPI对比卡
  var kpiGrid = container.querySelector('#bmKpiGrid');
  if(kpiGrid){
    var metrics = [
      {lbl:'综合评分',getVal:function(d){return d.score;},unit:'分'},
      {lbl:'OTD准时率',getVal:function(d){return d.otd;},unit:'%'},
      {lbl:'齐套率',getVal:function(d){return d.kitRate;},unit:'%'},
      {lbl:'OTS周期',getVal:function(d){return d.otsTotal;},unit:'天'},
      {lbl:'库存周转',getVal:function(d){return d.ito;},unit:'次/月'}
    ];
    kpiGrid.innerHTML = metrics.map(function(m){
      var cards = dsList.map(function(d){ var v=m.getVal(d); var health=d.health; var color=health==='r'?'var(--danger)':health==='y'?'var(--warning)':'var(--success)'; return '<div style="text-align:center"><div style="font-size:11px;color:var(--text-muted)">'+d.proj.name.substring(0,8)+'</div><div style="font-size:22px;font-weight:800;color:'+color+'">'+v+'<span style="font-size:11px">'+m.unit+'</span></div></div>'; }).join('');
      return '<div class="kpi-card" style="border-top:3px solid var(--primary)"><div style="font-size:11px;color:var(--text-sec);font-weight:600;margin-bottom:8px">'+m.lbl+'</div><div style="display:flex;justify-content:space-around">'+cards+'</div></div>';
    }).join('');
  }

  // 雷达图
  if(window.Chart && dsList.length){
    var radarCtx = container.querySelector('#bmRadarChart');
    if(radarCtx){
      if(App.charts.bmRadar) App.charts.bmRadar.destroy();
      var colors = ['rgba(59,130,246,0.3)','rgba(239,68,68,0.3)','rgba(34,197,94,0.3)'];
      var borderColors = ['rgba(59,130,246,1)','rgba(239,68,68,1)','rgba(34,197,94,1)'];
      App.charts.bmRadar = new Chart(radarCtx,{type:'radar',data:{labels:['可靠①','响应②','成本③','资产④','韧性⑤'],datasets:dsList.map(function(d,i){return{label:d.proj.name,data:d.dims,backgroundColor:colors[i%3],borderColor:borderColors[i%3],borderWidth:2,pointRadius:4};})},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{r:{beginAtZero:true,max:100}}}});
    }
    // 趋势图
    var trendCtx = container.querySelector('#bmTrendChart');
    if(trendCtx){
      if(App.charts.bmTrend) App.charts.bmTrend.destroy();
      var weeks = Array.from({length:12},function(_,i){return 'W'+(i+1);});
      App.charts.bmTrend = new Chart(trendCtx,{type:'line',data:{labels:weeks,datasets:dsList.map(function(d,i){var base=d.score;return{label:d.proj.name,data:Array.from({length:12},function(_,j){return Math.round(base+(Math.random()-0.5)*10);}),borderColor:borderColors[i%3],backgroundColor:colors[i%3],borderWidth:2,tension:0.3};})},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}}});
    }
  }

  // 热力矩阵
  var heatTable = container.querySelector('#bmHeatTable');
  if(heatTable){
    var indicators = ['综合评分','OTD','齐套率','OTS周期','库存周转','成本达成','隐性成本','健康状态'];
    var thead = '<tr><th>项目</th>'+indicators.map(function(i){return'<th>'+i+'</th>';}).join('')+'</tr>';
    var tbody = dsList.map(function(d){
      var vals = [d.score,d.otd,d.kitRate,d.otsTotal,d.ito,d.costAchieve,d.hiddenCostRate];
      var healths = ['g','g','g','g','g','g','g'];
      var cells = vals.map(function(v,idx){
        var st = 'green';
        if(idx===0) st = v>=80?'green':v>=65?'amber':'red';
        if(idx===1||idx===2||idx===5) st = v>=95?'green':v>=85?'amber':'red';
        if(idx===3) st = v<=30?'green':v<=45?'amber':'red';
        if(idx===4) st = v>=5?'green':v>=3?'amber':'red';
        if(idx===6) st = v<=2?'green':v<=5?'amber':'red';
        var bg = st==='red'?'var(--danger-bg)':st==='amber'?'var(--warning-bg)':'var(--success-bg)';
        var color = st==='red'?'var(--danger)':st==='amber'?'var(--warning)':'var(--success)';
        return '<td style="text-align:center;background:'+bg+';color:'+color+';font-weight:700">'+v+'</td>';
      }).join('');
      var hColor = d.health==='r'?'var(--danger)':d.health==='y'?'var(--warning)':'var(--success)';
      var hText = d.health==='r'?'异常':d.health==='y'?'预警':'正常';
      return '<tr><td><strong>'+d.proj.name+'</strong><br><span style="font-size:11px;color:var(--text-muted)">'+d.proj.bg+' · '+d.proj.customer+'</span></td>'+cells+'<td style="text-align:center;color:'+hColor+';font-weight:700">'+hText+'</td></tr>';
    }).join('');
    heatTable.querySelector('thead').innerHTML = thead;
    heatTable.querySelector('tbody').innerHTML = tbody;
  }
}
registerModule('benchmark', initPage_benchmark);
})();
