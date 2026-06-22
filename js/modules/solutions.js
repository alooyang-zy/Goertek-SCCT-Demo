// ===== 方案对策 =====
(function(){
"use strict";
var SOLUTION_EVENTS = [
  {id:'EV-001',title:'XR模组A01 紧急采购溢价',priority:'P1',status:'处理中',source:'系统触发',date:'06-12',owner:'采购经理'},
  {id:'EV-002',title:'TWS整机B09 齐套缺口',priority:'P1',status:'处理中',source:'人工上报',date:'06-13',owner:'物料计划'},
  {id:'EV-003',title:'车载传感E12 供应商份额切换',priority:'P2',status:'方案评审',source:'系统触发',date:'06-14',owner:'采购经理'},
  {id:'EV-004',title:'专业音频G66 EOL呆滞料',priority:'P2',status:'处理中',source:'系统触发',date:'06-10',owner:'IP/销售'},
  {id:'EV-005',title:'VR光学J31 长周期料断供',priority:'P1',status:'紧急',source:'人工上报',date:'06-15',owner:'采购/IP'},
  {id:'EV-006',title:'IoT传感器K08 交期偏差',priority:'P3',status:'观察',source:'系统触发',date:'06-11',owner:'项目经理'}
];
var SOLUTIONS = {
  'EV-001':[
    {name:'方案A: 启动备用源',impact:'高',cost:'¥8万',difficulty:'中',effect:'7天内恢复供应',rootCause:'主力供应商产能不足'},
    {name:'方案B: 加急空运',impact:'中',cost:'¥15万',difficulty:'低',effect:'3天到货但成本高',rootCause:'物流周期长'},
    {name:'方案C: 需求转移',impact:'低',cost:'¥2万',difficulty:'高',effect:'无溢价但需客户同意',rootCause:'需求分配不均'}
  ],
  'EV-002':[
    {name:'方案A: 跨项目调拨',impact:'高',cost:'¥1万',difficulty:'低',effect:'48小时齐套',rootCause:'BOM共用件管理缺失'},
    {name:'方案B: 替代料认证',impact:'中',cost:'¥5万',difficulty:'高',effect:'2周完成认证',rootCause:'替代料预认证不足'}
  ],
  'EV-005':[
    {name:'方案A: 现货采购',impact:'高',cost:'¥12万',difficulty:'低',effect:'5天到货',rootCause:'长周期料安全库存不足'},
    {name:'方案B: 产能预留',impact:'中',cost:'¥3万',difficulty:'中',effect:'4周后稳定供应',rootCause:'供应商产能规划滞后'},
    {name:'方案C: 设计变更',impact:'低',cost:'¥20万',difficulty:'高',effect:'8周后切换',rootCause:'单源物料风险'}
  ]
};

function initPage_solutions(container){
  container = container || document.getElementById('page-solutions');
  if(!container) return;
  container.innerHTML =
    '<div class="filter-bar"><div class="filter-group"><label>优先级:</label><select id="solPriorityFilter"><option value="">全部</option><option value="P1">P1-紧急</option><option value="P2">P2-重要</option><option value="P3">P3-常规</option></select></div>'
    + '<div class="filter-group"><label>状态:</label><select id="solStatusFilter"><option value="">全部</option><option value="处理中">处理中</option><option value="方案评审">方案评审</option><option value="紧急">紧急</option><option value="观察">观察</option></select></div>'
    + '<span style="font-size:11px;color:var(--text-muted);margin-left:12px;">在途事件方案对比 · 归因分析 · 任务拆解</span></div>'
    + '<div style="display:grid;grid-template-columns:380px 1fr;gap:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-bell"></i> 在途事件</h3></div><div class="card-body" style="padding:0" id="solEventList"></div></div>'
    + '<div id="solDetailPanel"><div style="padding:40px;text-align:center;color:var(--text-muted)">点击左侧事件查看方案对比</div></div>'
    + '</div>';

  var listEl = container.querySelector('#solEventList');
  function renderList(){
    var pf = container.querySelector('#solPriorityFilter').value;
    var sf = container.querySelector('#solStatusFilter').value;
    var filtered = SOLUTION_EVENTS.filter(function(e){return(!pf||e.priority===pf)&&(!sf||e.status===sf);});
    listEl.innerHTML = filtered.map(function(e){
      var pColor = e.priority==='P1'?'var(--danger)':e.priority==='P2'?'var(--warning)':'var(--info)';
      return '<div class="sol-event-item" data-id="'+e.id+'" style="padding:12px 14px;border-bottom:1px solid var(--border-light);cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'var(--primary-bg)\'" onmouseout="this.style.background=\'\'" onclick="window._solSelect(\''+e.id+'\')">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-weight:700;font-size:13px">'+e.title+'</span><span style="font-size:10px;padding:2px 8px;border-radius:99px;background:'+pColor+';color:#fff;font-weight:700">'+e.priority+'</span></div>'
        + '<div style="font-size:11px;color:var(--text-muted)">'+e.id+' · '+e.source+' · '+e.date+' · '+e.owner+'</div>'
        + '<div style="margin-top:4px"><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:var(--bg);color:var(--text-sec);border:1px solid var(--border)">'+e.status+'</span></div>'
        + '</div>';
    }).join('') || '<div style="padding:30px;text-align:center;color:var(--text-muted)">无匹配事件</div>';
  }
  container.querySelector('#solPriorityFilter').onchange = renderList;
  container.querySelector('#solStatusFilter').onchange = renderList;
  renderList();

  window._solSelect = function(eid){
    var ev = SOLUTION_EVENTS.find(function(e){return e.id===eid;});
    if(!ev) return;
    var sols = SOLUTIONS[eid] || [
      {name:'方案A: 标准处置',impact:'中',cost:'¥3万',difficulty:'低',effect:'按标准流程处置',rootCause:'常规事件'},
      {name:'方案B: 加强监控',impact:'低',cost:'¥0.5万',difficulty:'低',effect:'持续跟踪观察',rootCause:'需进一步观察'}
    ];
    var detailEl = container.querySelector('#solDetailPanel');
    var impactColor = {高:'var(--danger)',中:'var(--warning)',低:'var(--success)'};
    var diffColor = {高:'var(--danger)',中:'var(--warning)',低:'var(--success)'};
    detailEl.innerHTML =
      '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-lightbulb"></i> '+ev.title+' — 方案对比</h3><span style="font-size:11px;color:var(--text-muted)">'+ev.id+' · '+ev.priority+' · '+ev.status+'</span></div>'
      + '<div class="card-body">'
      + '<div style="display:grid;grid-template-columns:repeat('+sols.length+',1fr);gap:12px;margin-bottom:18px">'
      + sols.map(function(s,i){
        return '<div style="border:1px solid var(--border);border-radius:8px;padding:14px;'+(i===0?'border-color:var(--primary);background:var(--primary-bg)':'')+'">'
          + '<div style="font-weight:800;font-size:14px;margin-bottom:10px;color:'+(i===0?'var(--primary)':'var(--text)')+'">'+s.name+(i===0?' <span style="font-size:10px;padding:1px 6px;border-radius:4px;background:var(--primary);color:#fff">推荐</span>':'')+'</div>'
          + '<div style="display:grid;gap:6px;font-size:12px">'
          + '<div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">影响范围</span><span style="font-weight:700;color:'+impactColor[s.impact]+'">'+s.impact+'</span></div>'
          + '<div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">处置成本</span><span style="font-weight:700">'+s.cost+'</span></div>'
          + '<div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">执行难度</span><span style="font-weight:700;color:'+diffColor[s.difficulty]+'">'+s.difficulty+'</span></div>'
          + '<div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">预期效果</span><span style="font-weight:700;color:var(--success)">'+s.effect+'</span></div>'
          + '</div></div>';
      }).join('')
      + '</div>'
      + '<div style="background:var(--warning-bg);border:1px solid var(--warning);border-radius:8px;padding:14px;margin-bottom:18px"><div style="font-weight:700;color:var(--warning);margin-bottom:8px"><i class="fas fa-magnifying-glass"></i> 归因分析</div><div style="font-size:12px;color:var(--text-sec);line-height:1.6"><strong>根因：</strong>'+sols[0].rootCause+'</div><div style="font-size:12px;color:var(--text-muted);margin-top:6px">关联知识库：'+['物料管理SOP-007','供应商风险管理指引','紧急采购流程V3'].slice(0,2).join('、')+'</div></div>'
      + '<div><div style="font-weight:700;font-size:13px;margin-bottom:10px">方案执行任务拆解</div><table class="data-table"><thead><tr><th>任务</th><th>责任人</th><th>截止日</th><th>状态</th></tr></thead><tbody>'
      + '<tr><td>启动备用源认证</td><td>采购/SQE</td><td>06-20</td><td style="color:var(--warning)">待启动</td></tr>'
      + '<tr><td>小批量试产验证</td><td>质量</td><td>06-25</td><td style="color:var(--text-muted)">未开始</td></tr>'
      + '<tr><td>客户沟通确认</td><td>项目经理</td><td>06-18</td><td style="color:var(--success)">已完成</td></tr>'
      + '<tr><td>批量切换执行</td><td>采购/计划</td><td>06-30</td><td style="color:var(--text-muted)">未开始</td></tr>'
      + '</tbody></table></div>'
      + '</div></div>';
  };
  // 默认选中第一个
  window._solSelect('EV-001');
}
registerModule('solutions', initPage_solutions);
})();
