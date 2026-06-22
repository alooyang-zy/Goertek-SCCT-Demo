// ===== 数据集成 =====
(function(){
"use strict";
var DATA_SOURCES = [
  {name:'SAP ERP',type:'ERP',url:'sap://goertek-erp:3200',freq:'实时',lastSync:'2026-06-22 08:30',status:'正常',records:'12.4万'},
  {name:'MES制造执行',type:'MES',url:'http://mes.goertek.local:8080',freq:'5分钟',lastSync:'2026-06-22 08:28',status:'正常',records:'8.7万'},
  {name:'WMS仓储管理',type:'WMS',url:'http://wms.goertek.local:9090',freq:'10分钟',lastSync:'2026-06-22 08:25',status:'正常',records:'5.2万'},
  {name:'TMS运输管理',type:'TMS',url:'http://tms.goertek.local:7070',freq:'15分钟',lastSync:'2026-06-22 08:20',status:'延迟',records:'3.1万'},
  {name:'SRM供应商关系',type:'SRM',url:'http://srm.goertek.local:6060',freq:'30分钟',lastSync:'2026-06-22 08:00',status:'正常',records:'2.8万'},
  {name:'CRM客户关系',type:'CRM',url:'http://crm.goertek.local:5050',freq:'1小时',lastSync:'2026-06-22 07:30',status:'正常',records:'1.5万'}
];
var SYNC_LOGS = [
  {task:'SAP物料主数据同步',src:'SAP ERP',tgt:'控制塔Gold层',start:'08:30:00',dur:'2.3s',status:'成功',records:12400},
  {task:'MES工单状态同步',src:'MES',tgt:'控制塔Silver层',start:'08:28:00',dur:'1.1s',status:'成功',records:8700},
  {task:'WMS库存快照同步',src:'WMS',tgt:'控制塔Bronze层',start:'08:25:00',dur:'0.8s',status:'成功',records:5200},
  {task:'TMS运单同步',src:'TMS',tgt:'控制塔Silver层',start:'08:20:00',dur:'5.2s',status:'超时',records:3100},
  {task:'SRM供应商评分同步',src:'SRM',tgt:'控制塔Gold层',start:'08:00:00',dur:'1.5s',status:'成功',records:2800},
  {task:'CRM客户预测同步',src:'CRM',tgt:'控制塔Bronze层',start:'07:30:00',dur:'0.6s',status:'成功',records:1500}
];
function initPage_configIntegration(container){
  container = container || document.getElementById('page-config-integration');
  if(!container) return;
  container.innerHTML =
    '<div class="kpi-grid" id="ciKpiGrid"></div>'
    + '<div class="chart-row" style="grid-template-columns:1fr">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-plug"></i> 数据源配置</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="ciSrcTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-database"></i> 同步任务日志</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="ciLogTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>';
  var kpiGrid = container.querySelector('#ciKpiGrid');
  if(kpiGrid){
    var normal = DATA_SOURCES.filter(function(s){return s.status==='正常';}).length;
    var totalRecords = DATA_SOURCES.reduce(function(a,s){return a+parseFloat(s.records);},0);
    kpiGrid.innerHTML = [
      {lbl:'已接入系统',val:DATA_SOURCES.length,unit:'个',color:'var(--primary)',icon:'fa-plug'},
      {lbl:'同步正常',val:normal,unit:'个',color:'var(--success)',icon:'fa-check-circle'},
      {lbl:'今日同步量',val:totalRecords.toFixed(1),unit:'万',color:'var(--info)',icon:'fa-database'},
      {lbl:'异常任务',val:DATA_SOURCES.length-normal,unit:'个',color:'var(--danger)',icon:'fa-triangle-exclamation'}
    ].map(function(k){return '<div class="kpi-card" style="border-top:3px solid '+k.color+'"><div style="display:flex;align-items:center;gap:8px"><i class="fas '+k.icon+'" style="color:'+k.color+'"></i><span style="font-size:11px;color:var(--text-sec);font-weight:600">'+k.lbl+'</span></div><div style="font-size:28px;font-weight:800;color:'+k.color+';margin-top:8px">'+k.val+'<span style="font-size:13px;color:var(--text-muted)"> '+k.unit+'</span></div></div>';}).join('');
  }
  var srcTable = container.querySelector('#ciSrcTable');
  if(srcTable){
    srcTable.querySelector('thead').innerHTML='<tr><th>系统名称</th><th>类型</th><th>接口地址</th><th>同步频率</th><th>最近同步</th><th>记录数</th><th>状态</th><th>操作</th></tr>';
    srcTable.querySelector('tbody').innerHTML=DATA_SOURCES.map(function(s){
      var stColor=s.status==='正常'?'var(--success)':'var(--danger)';
      return '<tr><td style="font-weight:600">'+s.name+'</td><td>'+s.type+'</td><td style="font-family:monospace;font-size:11px">'+s.url+'</td><td>'+s.freq+'</td><td>'+s.lastSync+'</td><td>'+s.records+'</td><td style="color:'+stColor+';font-weight:600">'+s.status+'</td><td><button class="btn btn-sm btn-outline" style="font-size:11px">配置</button></td></tr>';
    }).join('');
  }
  var logTable = container.querySelector('#ciLogTable');
  if(logTable){
    logTable.querySelector('thead').innerHTML='<tr><th>任务名</th><th>源系统</th><th>目标</th><th>开始时间</th><th>耗时</th><th>记录数</th><th>状态</th></tr>';
    logTable.querySelector('tbody').innerHTML=SYNC_LOGS.map(function(l){
      var stColor=l.status==='成功'?'var(--success)':'var(--danger)';
      return '<tr><td>'+l.task+'</td><td>'+l.src+'</td><td>'+l.tgt+'</td><td>'+l.start+'</td><td>'+l.dur+'</td><td>'+l.records.toLocaleString()+'</td><td style="color:'+stColor+';font-weight:600">'+l.status+'</td></tr>';
    }).join('');
  }
}
registerModule('config-integration', initPage_configIntegration);
})();
