// ===== 知识中心 =====
(function(){
"use strict";
var KNOWLEDGE_DOCS = [
  {id:'KB-001',title:'供应链风险管理SOP-007',cat:'SOP',tags:['风险','预警','处置'],update:'06-10',views:128,status:'已发布'},
  {id:'KB-002',title:'紧急采购流程V3',cat:'SOP',tags:['采购','加急','溢价'],update:'06-08',views:96,status:'已发布'},
  {id:'KB-003',title:'XR模组A01 紧采溢价事件复盘',cat:'案例',tags:['紧采','溢价','NPI'],update:'06-10',views:45,status:'已归档'},
  {id:'KB-004',title:'TWS整机B09 齐套缺口案例',cat:'案例',tags:['齐套','缺料','BOM'],update:'06-08',views:38,status:'已归档'},
  {id:'KB-005',title:'NPI项目物料预认证最佳实践',cat:'最佳实践',tags:['NPI','认证','物料'],update:'05-28',views:72,status:'已发布'},
  {id:'KB-006',title:'供应商双源管理指引',cat:'最佳实践',tags:['供应商','双源','风险'],update:'05-25',views:64,status:'已发布'},
  {id:'KB-007',title:'库存安全水位设定规范',cat:'SOP',tags:['库存','安全','水位'],update:'05-20',views:89,status:'已发布'},
  {id:'KB-008',title:'EOL项目呆滞料处置流程',cat:'SOP',tags:['EOL','呆滞','处置'],update:'05-15',views:51,status:'已发布'},
  {id:'KB-009',title:'BOM变更冻结窗口管理',cat:'制度文档',tags:['BOM','变更','冻结'],update:'05-10',views:42,status:'已发布'},
  {id:'KB-010',title:'供应商质量绩效评分规则V2',cat:'制度文档',tags:['质量','评分','供应商'],update:'04-28',views:67,status:'已发布'},
  {id:'KB-011',title:'空运审批与责任事件绑定机制',cat:'SOP',tags:['空运','审批','物流'],update:'04-20',views:33,status:'已发布'},
  {id:'KB-012',title:'PVT阶段日计划会最佳实践',cat:'最佳实践',tags:['PVT','计划','日清'],update:'04-15',views:55,status:'已发布'},
  {id:'KB-013',title:'8D协作处理流程',cat:'SOP',tags:['8D','质量','协作'],update:'04-10',views:78,status:'已发布'},
  {id:'KB-014',title:'MRP执行率考核管理办法',cat:'制度文档',tags:['MRP','考核','执行'],update:'03-28',views:41,status:'已发布'},
  {id:'KB-015',title:'跨项目产能协调机制',cat:'最佳实践',tags:['产能','协调','排产'],update:'03-20',views:48,status:'已发布'}
];
function initPage_knowledge(container){
  container = container || document.getElementById('page-knowledge');
  if(!container) return;
  container.innerHTML =
    '<div class="filter-bar"><div class="filter-group" style="flex:1"><label>搜索:</label><input id="kbSearch" type="search" placeholder="输入关键词搜索知识文档..." style="width:100%;min-width:300px" oninput="initPage_knowledge()"></div>'
    + '<div class="filter-group"><label>分类:</label><select id="kbCatFilter" onchange="initPage_knowledge()"><option value="">全部分类</option><option value="SOP">SOP</option><option value="案例">案例</option><option value="最佳实践">最佳实践</option><option value="制度文档">制度文档</option></select></div></div>'
    + '<div class="kpi-grid" id="kbKpiGrid"></div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-book"></i> 知识文档库</h3><span id="kbCount" style="font-size:11px;color:var(--text-muted)"></span></div><div class="card-body" style="padding:0"><table class="data-table" id="kbTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-fire"></i> 热门案例推荐</h3></div><div class="card-body" id="kbHotCases"></div></div>'
    + '</div>';

  // KPI
  var cats = {}; KNOWLEDGE_DOCS.forEach(function(d){cats[d.cat]=(cats[d.cat]||0)+1;});
  var kpiGrid = container.querySelector('#kbKpiGrid');
  if(kpiGrid){
    kpiGrid.innerHTML = [
      {lbl:'SOP',val:cats['SOP']||0,unit:'篇',color:'var(--primary)',icon:'fa-list-check'},
      {lbl:'案例',val:cats['案例']||0,unit:'篇',color:'var(--warning)',icon:'fa-folder-open'},
      {lbl:'最佳实践',val:cats['最佳实践']||0,unit:'篇',color:'var(--success)',icon:'fa-trophy'},
      {lbl:'制度文档',val:cats['制度文档']||0,unit:'篇',color:'var(--info)',icon:'fa-file-contract'}
    ].map(function(k){return '<div class="kpi-card" style="border-top:3px solid '+k.color+'"><div style="display:flex;align-items:center;gap:8px"><i class="fas '+k.icon+'" style="color:'+k.color+'"></i><span style="font-size:11px;color:var(--text-sec);font-weight:600">'+k.lbl+'</span></div><div style="font-size:28px;font-weight:800;color:'+k.color+';margin-top:8px">'+k.val+'<span style="font-size:13px;color:var(--text-muted)"> '+k.unit+'</span></div></div>';}).join('');
  }

  // 搜索过滤
  var search = container.querySelector('#kbSearch').value.toLowerCase();
  var catFilter = container.querySelector('#kbCatFilter').value;
  var filtered = KNOWLEDGE_DOCS.filter(function(d){
    if(catFilter && d.cat!==catFilter) return false;
    if(search){ var text=(d.title+d.tags.join('')+d.cat).toLowerCase(); if(text.indexOf(search)<0) return false; }
    return true;
  });
  container.querySelector('#kbCount').textContent = filtered.length+' 篇文档';

  // 文档表
  var table = container.querySelector('#kbTable');
  if(table){
    var catColors = {SOP:'var(--primary)',案例:'var(--warning)','最佳实践':'var(--success)','制度文档':'var(--info)'};
    table.querySelector('thead').innerHTML = '<tr><th>编号</th><th>标题</th><th>分类</th><th>标签</th><th>更新时间</th><th>浏览</th><th>状态</th><th>操作</th></tr>';
    table.querySelector('tbody').innerHTML = filtered.map(function(d){
      return '<tr><td>'+d.id+'</td><td style="font-weight:600">'+d.title+'</td><td><span style="color:'+(catColors[d.cat]||'var(--text-muted)')+';font-weight:600">'+d.cat+'</span></td><td>'+d.tags.map(function(t){return'<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:var(--bg);color:var(--text-sec);margin-right:3px">'+t+'</span>';}).join('')+'</td><td>'+d.update+'</td><td>'+d.views+'</td><td style="color:var(--success)">'+d.status+'</td><td><button class="btn btn-sm btn-outline" style="font-size:11px">查看</button></td></tr>';
    }).join('') || '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">无匹配文档</td></tr>';
  }

  // 热门案例
  var hotEl = container.querySelector('#kbHotCases');
  if(hotEl){
    var hotCases = KNOWLEDGE_DOCS.filter(function(d){return d.cat==='案例';}).sort(function(a,b){return b.views-a.views;}).slice(0,3);
    hotEl.innerHTML = hotCases.map(function(d){
      return '<div style="display:flex;gap:12px;padding:14px;border:1px solid var(--border);border-radius:8px;margin-bottom:10px;cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--border)\'">'
        + '<div style="width:40px;height:40px;border-radius:8px;background:var(--warning-bg);display:grid;place-items:center;flex-shrink:0"><i class="fas fa-fire" style="color:var(--warning)"></i></div>'
        + '<div style="flex:1"><div style="font-weight:700;font-size:13px;margin-bottom:4px">'+d.title+'</div><div style="font-size:11px;color:var(--text-muted)">'+d.tags.join(' · ')+' · '+d.views+'次浏览 · 更新 '+d.update+'</div></div>'
        + '</div>';
    }).join('');
  }
}
registerModule('knowledge', initPage_knowledge);
})();
