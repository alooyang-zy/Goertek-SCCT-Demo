// ===== 闭环复盘 =====
(function(){
"use strict";
var REVIEW_EVENTS = [
  {id:'CL-001',title:'XR模组A01 紧采溢价事件',cat:'物料',rootCause:'安全库存不足',measure:'建立长周期料安全库存机制',closeDate:'06-10',recur:false,lesson:'NPI项目长周期料需提前8周锁定'},
  {id:'CL-002',title:'TWS整机B09 齐套缺口',cat:'计划',rootCause:'BOM变更未同步',measure:'BOM变更冻结窗口+齐套预检',closeDate:'06-08',recur:false,lesson:'BOM变更需48小时前通知计划'},
  {id:'CL-003',title:'车载传感E12 供应商份额切换',cat:'供应商',rootCause:'单源依赖',measure:'备用源预认证+份额缓冲',closeDate:'06-05',recur:false,lesson:'车规模组必须保持双源'},
  {id:'CL-004',title:'专业音频G66 呆滞料',cat:'物料',rootCause:'EOL预测偏差',measure:'EOL前8周启动呆滞预警',closeDate:'06-03',recur:true,lesson:'EOL项目需建立呆滞周报'},
  {id:'CL-005',title:'VR光学J31 空运追交',cat:'物流',rootCause:'排产延误',measure:'PVT阶段日计划会+风险料预警',closeDate:'05-30',recur:false,lesson:'PVT空运需绑定责任事件'},
  {id:'CL-006',title:'IoT传感器K08 交期偏差',cat:'计划',rootCause:'产能分配冲突',measure:'跨项目产能协调机制',closeDate:'05-28',recur:false,lesson:'高峰期需预留15%产能缓冲'},
  {id:'CL-007',title:'麦克风D05 IQC批量不良',cat:'质量',rootCause:'供应商工艺偏移',measure:'SPC监控+首件确认加强',closeDate:'05-25',recur:false,lesson:'NPI供应商需加强SPC'},
  {id:'CL-008',title:'音箱模组C18 缺料停线',cat:'物料',rootCause:'MRP建议未执行',measure:'MRP执行率纳入考核',closeDate:'05-20',recur:true,lesson:'MRP执行率需日清日结'}
];

function initPage_review(container){
  container = container || document.getElementById('page-review');
  if(!container) return;
  container.innerHTML =
    '<div class="kpi-grid" id="rvKpiGrid"></div>'
    + '<div class="chart-row" style="grid-template-columns:1fr 1fr">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-chart-pie"></i> 根因分布</h3></div><div class="card-body"><div style="height:280px"><canvas id="rvRootChart"></canvas></div></div></div>'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-chart-line"></i> 复发率趋势</h3></div><div class="card-body"><div style="height:280px"><canvas id="rvRecurChart"></canvas></div></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-clipboard-check"></i> 已关闭事件归档</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="rvTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-book"></i> 经验教训沉淀</h3></div><div class="card-body" id="rvLessons"></div></div>'
    + '</div>';

  // KPI
  var kpiGrid = container.querySelector('#rvKpiGrid');
  if(kpiGrid){
    var closed = REVIEW_EVENTS.length;
    var recur = REVIEW_EVENTS.filter(function(e){return e.recur;}).length;
    var recurRate = Math.round(recur/closed*100);
    kpiGrid.innerHTML = [
      {lbl:'本月关闭事件',val:closed,unit:'件',color:'var(--primary)',icon:'fa-circle-check'},
      {lbl:'平均关闭时长',val:4.2,unit:'天',color:'var(--info)',icon:'fa-clock'},
      {lbl:'复发率',val:recurRate,unit:'%',color:recurRate>20?'var(--danger)':'var(--warning)',icon:'fa-rotate-right'},
      {lbl:'知识库沉淀',val:closed,unit:'条',color:'var(--success)',icon:'fa-book'}
    ].map(function(k){return '<div class="kpi-card" style="border-top:3px solid '+k.color+'"><div style="display:flex;align-items:center;gap:8px"><i class="fas '+k.icon+'" style="color:'+k.color+'"></i><span style="font-size:11px;color:var(--text-sec);font-weight:600">'+k.lbl+'</span></div><div style="font-size:28px;font-weight:800;color:'+k.color+';margin-top:8px">'+k.val+'<span style="font-size:13px;color:var(--text-muted)"> '+k.unit+'</span></div></div>';}).join('');
  }

  // 归档表
  var table = container.querySelector('#rvTable');
  if(table){
    var catColors = {物料:'var(--danger)',计划:'var(--warning)',供应商:'var(--info)',质量:'var(--purple)',物流:'var(--teal)'};
    table.querySelector('thead').innerHTML = '<tr><th>事件ID</th><th>事件描述</th><th>根因分类</th><th>根因</th><th>改善措施</th><th>关闭日期</th><th>复发</th></tr>';
    table.querySelector('tbody').innerHTML = REVIEW_EVENTS.map(function(e){
      var catColor = catColors[e.cat]||'var(--text-muted)';
      return '<tr><td>'+e.id+'</td><td>'+e.title+'</td><td><span style="color:'+catColor+';font-weight:600">'+e.cat+'</span></td><td>'+e.rootCause+'</td><td>'+e.measure+'</td><td>'+e.closeDate+'</td><td>'+(e.recur?'<span style="color:var(--danger);font-weight:700">是</span>':'<span style="color:var(--success)">否</span>')+'</td></tr>';
    }).join('');
  }

  // 根因饼图
  if(window.Chart){
    var cats = {}; REVIEW_EVENTS.forEach(function(e){cats[e.cat]=(cats[e.cat]||0)+1;});
    var ctx1 = container.querySelector('#rvRootChart');
    if(ctx1){ if(App.charts.rvRoot)App.charts.rvRoot.destroy(); App.charts.rvRoot=new Chart(ctx1,{type:'doughnut',data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats),backgroundColor:['rgba(239,68,68,0.7)','rgba(245,158,11,0.7)','rgba(59,130,246,0.7)','rgba(124,58,237,0.7)','rgba(20,184,166,0.7)']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right'}}}}); }
    // 复发率趋势
    var ctx2 = container.querySelector('#rvRecurChart');
    if(ctx2){ if(App.charts.rvRecur)App.charts.rvRecur.destroy(); App.charts.rvRecur=new Chart(ctx2,{type:'line',data:{labels:['1月','2月','3月','4月','5月','6月'],datasets:[{label:'复发率%',data:[28,25,22,18,20,16],borderColor:'rgba(239,68,68,1)',backgroundColor:'rgba(239,68,68,0.1)',borderWidth:2,tension:0.3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}}); }
  }

  // 经验教训
  var lessonsEl = container.querySelector('#rvLessons');
  if(lessonsEl){
    lessonsEl.innerHTML = REVIEW_EVENTS.map(function(e){
      return '<div style="padding:12px;border-left:3px solid '+(e.recur?'var(--danger)':'var(--success)')+';background:var(--bg);border-radius:0 8px 8px 0;margin-bottom:8px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">'+e.title+'</div><div style="font-size:12px;color:var(--text-sec)"><strong>教训：</strong>'+e.lesson+'</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px">'+e.id+' · 关闭 '+e.closeDate+(e.recur?' · <span style="color:var(--danger);font-weight:600">已复发</span>':'')+'</div></div>';
    }).join('');
  }
}
registerModule('review', initPage_review);
})();
