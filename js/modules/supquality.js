// ===== 质量协同 =====
(function(){
"use strict";
function initPage_supquality(container){
  container = container || document.getElementById('page-supquality');
  if(!container) return;
  var fp = (typeof getFilteredProjects==='function') ? getFilteredProjects() : (typeof projects!=='undefined'?projects:[]);
  if(!fp.length) return;

  container.innerHTML =
    '<div class="filter-bar"><div class="filter-group"><label>项目:</label><select id="supqProjectSelect" onchange="initPage_supquality()"></select></div>'
    + '<span style="font-size:11px;color:var(--text-muted);margin-left:12px;">来料IQC · 8D协作 · 供应商质量绩效</span></div>'
    + '<div class="kpi-grid" id="supqKpiGrid"></div>'
    + '<div class="chart-row" style="grid-template-columns:1fr 1fr">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-clipboard-check"></i> IQC检验结果</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="supqIqcTable"><thead></thead><tbody></tbody></table></div></div>'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-chart-bar"></i> 供应商质量绩效排名</h3></div><div class="card-body"><div style="height:300px"><canvas id="supqPerfChart"></canvas></div></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-bug"></i> 8D协作处理</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="supq8dTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>';

  var sel = container.querySelector('#supqProjectSelect');
  if(sel){ if(typeof fillProjectSelect==='function') fillProjectSelect(sel,fp); else sel.innerHTML=fp.map(function(p){return'<option value="'+p.id+'">'+p.name+'</option>';}).join(''); }
  var pid = sel?sel.value:'';
  var d = (window.DS && pid)?DS.get(pid):null;
  var seed = pid?pid.charCodeAt(4)||0:0;

  // KPI
  var kpiGrid = container.querySelector('#supqKpiGrid');
  if(kpiGrid){
    var passRate = d?Math.round(96+Math.random()*3):98;
    var dppm = 50+seed%200;
    var d8dPending = 1+seed%4;
    var score = d?Math.round(85+Math.random()*10):89;
    kpiGrid.innerHTML = [
      {lbl:'来料合格率',val:passRate,unit:'%',color:passRate>=98?'var(--success)':'var(--warning)',icon:'fa-check-circle'},
      {lbl:'DPPM',val:dppm,unit:'ppm',color:dppm<100?'var(--success)':'var(--warning)',icon:'fa-microscope'},
      {lbl:'8D待处理',val:d8dPending,unit:'项',color:d8dPending>2?'var(--danger)':'var(--warning)',icon:'fa-tasks'},
      {lbl:'质量评分',val:score,unit:'分',color:score>=85?'var(--success)':'var(--warning)',icon:'fa-star'}
    ].map(function(k){return '<div class="kpi-card" style="border-top:3px solid '+k.color+'"><div style="display:flex;align-items:center;gap:8px"><i class="fas '+k.icon+'" style="color:'+k.color+'"></i><span style="font-size:11px;color:var(--text-sec);font-weight:600">'+k.lbl+'</span></div><div style="font-size:28px;font-weight:800;color:'+k.color+';margin-top:8px">'+k.val+'<span style="font-size:13px;color:var(--text-muted)"> '+k.unit+'</span></div></div>';}).join('');
  }

  // IQC表
  var supNames = ['歌尔电子(潍坊)','山东富冠','苏州立讯','青岛海信','东莞比亚迪'];
  var matNames = ['BES2300YP','PCBA模组','电池组','扬声器','FPC软板'];
  var iqcTable = container.querySelector('#supqIqcTable');
  if(iqcTable){
    iqcTable.querySelector('thead').innerHTML = '<tr><th>批次号</th><th>供应商</th><th>物料</th><th>到货日期</th><th>检验数量</th><th>不合格</th><th>结果</th><th>状态</th></tr>';
    var rows=[];
    for(var i=0;i<10;i++){
      var batch='IQC-'+(2000+seed+i);
      var sup=supNames[i%supNames.length];
      var mat=matNames[i%matNames.length];
      var qty=500+(seed+i)*100;
      var ng=i<2?Math.round(qty*0.02):0;
      var result=ng>0?'不合格':'合格';
      var color=ng>0?'var(--danger)':'var(--success)';
      var status=ng>0?'已退回':'已入库';
      rows.push('<tr><td>'+batch+'</td><td>'+sup+'</td><td>'+mat+'</td><td>2026-06-'+(12+i)+'</td><td>'+qty+'</td><td style="color:'+(ng>0?'var(--danger)':'var(--text-muted)')+';font-weight:600">'+ng+'</td><td style="color:'+color+';font-weight:600">'+result+'</td><td>'+status+'</td></tr>');
    }
    iqcTable.querySelector('tbody').innerHTML = rows.join('');
  }

  // 8D表
  var d8dTable = container.querySelector('#supq8dTable');
  if(d8dTable){
    d8dTable.querySelector('thead').innerHTML = '<tr><th>8D编号</th><th>事件描述</th><th>供应商</th><th>责任人</th><th>发起日期</th><th>截止日期</th><th>状态</th></tr>';
    var events=['来料 solder 不良','尺寸超差','功能测试Fail','包装破损'];
    var statuses=['D3-临时措施','D5-根本原因','D7-预防措施','已关闭'];
    var scolors=['var(--warning)','var(--warning)','var(--info)','var(--success)'];
    var rows8d=[];
    for(var j=0;j<6;j++){
      rows8d.push('<tr><td>8D-'+(300+seed+j)+'</td><td>'+events[j%events.length]+'</td><td>'+supNames[j%supNames.length]+'</td><td>'+['张工','李工','王工'][j%3]+'</td><td>2026-06-'+(10+j)+'</td><td>2026-06-'+(20+j)+'</td><td style="color:'+scolors[j%4]+';font-weight:600">'+statuses[j%4]+'</td></tr>');
    }
    d8dTable.querySelector('tbody').innerHTML = rows8d.join('');
  }

  // 绩效排名图
  if(window.Chart){
    var ctx = container.querySelector('#supqPerfChart');
    if(ctx){
      if(App.charts.supqPerf) App.charts.supqPerf.destroy();
      App.charts.supqPerf = new Chart(ctx,{type:'bar',data:{
        labels:supNames,
        datasets:[{label:'质量评分',data:[92,88,85,90,86],backgroundColor:['rgba(34,197,94,0.7)','rgba(59,130,246,0.7)','rgba(245,158,11,0.7)','rgba(34,197,94,0.7)','rgba(59,130,246,0.7)'],borderColor:['rgba(34,197,94,1)','rgba(59,130,246,1)','rgba(245,158,11,1)','rgba(34,197,94,1)','rgba(59,130,246,1)'],borderWidth:1}]
      },options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,max:100}}}});
    }
  }
}
registerModule('supquality', initPage_supquality);
})();
