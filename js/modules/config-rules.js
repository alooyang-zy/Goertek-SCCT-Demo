// ===== 规则配置 =====
(function(){
"use strict";
var RULES = {
  '交付':[
    {metric:'OTIF目标值',current:'98.5%',unit:'%',level:'警告',bg:'全部',status:'启用'},
    {metric:'客户交付准时率',current:'95.0%',unit:'%',level:'严重',bg:'全部',status:'启用'},
    {metric:'延期天数阈值',current:'3',unit:'天',level:'警告',bg:'消费电子BG',status:'启用'},
    {metric:'延期天数阈值',current:'5',unit:'天',level:'严重',bg:'全部',status:'启用'}
  ],
  '库存':[
    {metric:'安全库存天数',current:'30',unit:'天',level:'正常',bg:'全部',status:'启用'},
    {metric:'库存周转天数上限',current:'45',unit:'天',level:'警告',bg:'全部',status:'启用'},
    {metric:'呆滞料金额阈值',current:'10',unit:'万元',level:'严重',bg:'全部',status:'启用'},
    {metric:'安全库存达标率',current:'90%',unit:'%',level:'警告',bg:'消费电子BG',status:'启用'}
  ],
  '成本':[
    {metric:'成本达成率上限',current:'100%',unit:'%',level:'警告',bg:'全部',status:'启用'},
    {metric:'成本达成率上限',current:'110%',unit:'%',level:'严重',bg:'全部',status:'启用'},
    {metric:'紧急采购溢价阈值',current:'10',unit:'万元',level:'严重',bg:'全部',status:'启用'},
    {metric:'隐性成本率上限',current:'5%',unit:'%',level:'严重',bg:'全部',status:'启用'}
  ],
  '质量':[
    {metric:'DPPM目标值',current:'100',unit:'ppm',level:'警告',bg:'全部',status:'启用'},
    {metric:'DPPM目标值',current:'200',unit:'ppm',level:'严重',bg:'全部',status:'启用'},
    {metric:'来料合格率下限',current:'98%',unit:'%',level:'警告',bg:'全部',status:'启用'}
  ],
  '周期':[
    {metric:'OTS周期上限',current:'30',unit:'天',level:'警告',bg:'全部',status:'启用'},
    {metric:'OTS周期上限',current:'45',unit:'天',level:'严重',bg:'全部',status:'启用'},
    {metric:'采购提前期偏差',current:'3',unit:'天',level:'警告',bg:'消费电子BG',status:'启用'}
  ]
};
var SCOR_WEIGHTS = [
  {dim:'①可靠性',weight:25},
  {dim:'②响应性',weight:20},
  {dim:'③成本',weight:20},
  {dim:'④资产效率',weight:20},
  {dim:'⑤敏捷韧性',weight:15}
];
function initPage_configRules(container){
  container = container || document.getElementById('page-config-rules');
  if(!container) return;
  var tabs = Object.keys(RULES);
  container.innerHTML =
    '<div class="chart-row" style="grid-template-columns:1fr">'
    + '<div class="chart-card"><div class="card-header" id="crTabBar" style="display:flex;gap:4px"></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="crRuleTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-sliders"></i> SCOR健康评分权重配置</h3><span style="font-size:11px;color:var(--text-muted)">权重总和需=100%</span></div><div class="card-body" id="crWeights"></div></div>'
    + '</div>';
  var tabBar = container.querySelector('#crTabBar');
  var ruleTable = container.querySelector('#crRuleTable');
  var currentTab = tabs[0];
  function renderTab(){
    tabBar.innerHTML = tabs.map(function(t,i){
      return '<button class="btn '+(t===currentTab?'btn-primary':'btn-outline')+'" style="font-size:12px;padding:6px 16px;border-radius:6px 6px 0 0" onclick="window._crSwitchTab(\''+t+'\')">'+t+'</button>';
    }).join('');
    var rules = RULES[currentTab];
    ruleTable.querySelector('thead').innerHTML='<tr><th>指标名</th><th>当前阈值</th><th>单位</th><th>预警级别</th><th>适用BG</th><th>状态</th><th>操作</th></tr>';
    ruleTable.querySelector('tbody').innerHTML=rules.map(function(r){
      var lvColor=r.level==='严重'?'var(--danger)':'var(--warning)';
      return '<tr><td style="font-weight:600">'+r.metric+'</td><td style="font-weight:700;color:var(--primary)">'+r.current+'</td><td>'+r.unit+'</td><td><span style="color:'+lvColor+';font-weight:600">'+r.level+'</span></td><td>'+r.bg+'</td><td style="color:var(--success)">'+r.status+'</td><td><button class="btn btn-sm btn-outline" style="font-size:11px">编辑</button></td></tr>';
    }).join('');
  }
  window._crSwitchTab = function(tab){ currentTab=tab; renderTab(); };
  renderTab();
  var wEl = container.querySelector('#crWeights');
  if(wEl){
    wEl.innerHTML = SCOR_WEIGHTS.map(function(w){
      return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;font-weight:600">'+w.dim+'</span><span style="font-size:13px;font-weight:700;color:var(--primary)">'+w.weight+'%</span></div><div style="height:8px;background:var(--border-light);border-radius:4px;overflow:hidden"><div style="width:'+w.weight+'%;height:100%;background:linear-gradient(90deg,var(--primary),var(--primary-light));border-radius:4px"></div></div></div>';
    }).join('') + '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;color:var(--text-muted)">权重总和</span><span style="font-size:18px;font-weight:800;color:var(--success)">100%</span></div>';
  }
}
registerModule('config-rules', initPage_configRules);
})();
