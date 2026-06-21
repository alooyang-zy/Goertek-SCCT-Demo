// Module: settings

const settingsData = {
  // 告警阈值配置
  alertThresholds: [
    { metric:'OTD准时率', threshold:'≤93%', unit:'%', level:'警告', enabled:true },
    { metric:'OTD准时率', threshold:'≤88%', unit:'%', level:'严重', enabled:true },
    { metric:'物料齐套率', threshold:'≤90%', unit:'%', level:'警告', enabled:true },
    { metric:'物料齐套率', threshold:'≤85%', unit:'%', level:'严重', enabled:true },
    { metric:'库存周转天数', threshold:'≥25天', unit:'天', level:'警告', enabled:true },
    { metric:'库存周转天数', threshold:'≥35天', unit:'天', level:'严重', enabled:true },
    { metric:'成本偏差率', threshold:'≥5%', unit:'%', level:'警告', enabled:true },
    { metric:'成本偏差率', threshold:'≥10%', unit:'%', level:'严重', enabled:true },
    { metric:'供应商OTD', threshold:'≤90%', unit:'%', level:'警告', enabled:true },
    { metric:'SMT稼动率', threshold:'≤80%', unit:'%', level:'警告', enabled:false },
  ],
  // 数据源管理
  dataSources: [
    { name:'ERP(SAP)', type:'SAP RFC', syncFreq:'实时', lastSync:'2026-05-23 18:00', status:'正常' },
    { name:'MES制造执行', type:'REST API', syncFreq:'5分钟', lastSync:'2026-05-23 17:55', status:'正常' },
    { name:'WMS仓储系统', type:'REST API', syncFreq:'10分钟', lastSync:'2026-05-23 17:50', status:'正常' },
    { name:'SRM供应商平台', type:'EDI', syncFreq:'1小时', lastSync:'2026-05-23 17:00', status:'延迟' },
    { name:'客户订单系统', type:'REST API', syncFreq:'15分钟', lastSync:'2026-05-23 17:45', status:'正常' },
    { name:'物流跟踪(TMS)', type:'Webhook', syncFreq:'实时', lastSync:'2026-05-23 18:01', status:'正常' },
    { name:'财务系统(Oracle)', type:'ODBC', syncFreq:'每日', lastSync:'2026-05-23 06:00', status:'正常' },
    { name:'歌尔微MES', type:'REST API', syncFreq:'5分钟', lastSync:'2026-05-23 17:58', status:'正常' },
  ],
  // 角色权限配置
  rolePermissions: [
    { role:'供应链总监', scope:'全部BG/项目', approval:'全量审批', users:3 },
    { role:'BG运营总监', scope:'本BG全部项目', approval:'BG级审批', users:6 },
    { role:'OC订单协调', scope:'本BU项目订单', approval:'交期变更审批', users:12 },
    { role:'PC计划', scope:'本BU项目计划', approval:'MPS调整审批', users:18 },
    { role:'MC物料', scope:'本BU项目物料', approval:'缺料升级审批', users:15 },
    { role:'Buyer采购', scope:'本BU供应商', approval:'PO审批', users:22 },
    { role:'QE质量', scope:'本BU来料质量', approval:'让步接收审批', users:10 },
    { role:'物流专员', scope:'本BU出货物流', approval:'—', users:8 },
  ],
  // 通知策略配置
  notifyPolicies: [
    { eventType:'严重缺料告警', channel:'企业微信+短信+邮件', recipients:'MC+PC+BG总监', frequency:'即时', enabled:true },
    { eventType:'OTD低于阈值', channel:'企业微信+邮件', recipients:'OC+PC+项目PM', frequency:'即时', enabled:true },
    { eventType:'供应商交付延迟', channel:'企业微信', recipients:'Buyer+MC', frequency:'每日汇总', enabled:true },
    { eventType:'库存超期预警', channel:'邮件', recipients:'MC+仓库', frequency:'每周一', enabled:true },
    { eventType:'成本超支预警', channel:'企业微信+邮件', recipients:'PC+财务', frequency:'每日汇总', enabled:true },
    { eventType:'需求预测偏差', channel:'邮件', recipients:'OC+需求计划', frequency:'每周三', enabled:false },
    { eventType:'NPI物料认证异常', channel:'企业微信+邮件', recipients:'R&D+MC+QE', frequency:'即时', enabled:true },
    { eventType:'系统数据同步异常', channel:'企业微信', recipients:'IT运维', frequency:'即时', enabled:true },
  ],
  // 系统参数设置
  sysParams: [
    { name:'MPS滚动周期', value:'13周', desc:'主生产计划滚动展望期', module:'计划管理', updatedAt:'2026-05-20' },
    { name:'安全库存策略', value:'动态(SS=1.5×σ×√LT)', desc:'基于需求波动和提前期的安全库存公式', module:'库存管理', updatedAt:'2026-04-15' },
    { name:'ATP检查深度', value:'3级(BOM+产能+物料)', desc:'可承诺量检查层级', module:'交期管理', updatedAt:'2026-05-10' },
    { name:'风险评分权重', value:'影响度0.4+紧迫度0.3+概率0.3', desc:'风险雷达综合评分权重分配', module:'风险管理', updatedAt:'2026-03-28' },
    { name:'供应商评级周期', value:'月度', desc:'供应商绩效评级计算周期', module:'供方协同', updatedAt:'2026-05-01' },
    { name:'需求预测模型', value:'Holt-Winters+ML集成', desc:'需求预测算法选择', module:'需求预测', updatedAt:'2026-04-20' },
    { name:'数据保留策略', value:'明细180天/汇总36个月', desc:'历史数据归档和保留周期', module:'系统管理', updatedAt:'2026-02-10' },
    { name:'沙盘节点数', value:'14(标准端到端)', desc:'一单到底沙盘默认节点数', module:'进度跟踪', updatedAt:'2026-05-15' },
    { name:'AI助手模型', value:'deepseek-v4-flash', desc:'智能员工助手底层模型', module:'AI助手', updatedAt:'2026-05-23' },
    { name:'告警升级时效', value:'严重30min/警告4h/提示24h', desc:'各级别告警升级超时时间', module:'风险管理', updatedAt:'2026-05-18' },
  ],
};

function initPage_settings(){
  const d=settingsData;
  // KPI
  const kg=document.getElementById('settingsKpiGrid');
  if(kg)kg.innerHTML=[
    {label:'数据源接入',value:d.dataSources.length,icon:'fa-database',color:'blue'},
    {label:'告警规则',value:d.alertThresholds.length,icon:'fa-bell',color:'amber'},
    {label:'角色配置',value:d.rolePermissions.length,icon:'fa-users-gear',color:'purple'},
    {label:'通知策略',value:d.notifyPolicies.length,icon:'fa-paper-plane',color:'teal'}
  ].map(function(k){return '<div class="kpi-card"><div class="kpi-icon '+k.color+'"><i class="fas '+k.icon+'"></i></div><div class="kpi-content"><div class="kpi-value">'+k.value+'</div><div class="kpi-label">'+k.label+'</div></div></div>'}).join('');

  // Tab switching
  initSettingsTabs();

  // 告警阈值
  var atb=document.getElementById('alertThresholdBody');
  if(atb)atb.innerHTML=d.alertThresholds.map(function(a){return '<tr><td><strong>'+a.metric+'</strong></td><td>'+a.threshold+'</td><td>'+a.unit+'</td><td><span class="st-badge '+(a.level==='严重'?'red':'amber')+'">'+a.level+'</span></td><td><span class="st-badge '+(a.enabled?'green':'gray')+'">'+(a.enabled?'启用':'停用')+'</span></td><td><button class="btn btn-sm btn-outline" onclick="alert(\'配置编辑：'+a.metric+'\')"><i class="fas fa-pen"></i> 编辑</button></td></tr>'}).join('');

  // 数据源
  var dsb=document.getElementById('dataSourceBody');
  if(dsb)dsb.innerHTML=d.dataSources.map(function(s){return '<tr><td><strong>'+s.name+'</strong></td><td>'+s.type+'</td><td>'+s.syncFreq+'</td><td>'+s.lastSync+'</td><td><span class="st-badge '+(s.status==='正常'?'green':s.status==='延迟'?'amber':'red')+'"><span class="x-dot '+(s.status==='正常'?'green':'amber')+'" style="width:6px;height:6px"></span> '+s.status+'</span></td></tr>'}).join('');

  // 角色权限
  var rpb=document.getElementById('rolePermBody');
  if(rpb)rpb.innerHTML=d.rolePermissions.map(function(r){return '<tr><td><strong>'+r.role+'</strong></td><td>'+r.scope+'</td><td>'+r.approval+'</td><td>'+r.users+'</td><td><span class="st-badge green">启用</span></td></tr>'}).join('');

  // 通知策略
  var npb=document.getElementById('notifyPolicyBody');
  if(npb)npb.innerHTML=d.notifyPolicies.map(function(n){return '<tr><td><strong>'+n.eventType+'</strong></td><td>'+n.channel+'</td><td>'+n.recipients+'</td><td>'+n.frequency+'</td><td><span class="st-badge '+(n.enabled?'green':'gray')+'">'+(n.enabled?'启用':'停用')+'</span></td></tr>'}).join('');

  // 系统参数
  var spb=document.getElementById('sysParamBody');
  if(spb)spb.innerHTML=d.sysParams.map(function(p){return '<tr><td><strong>'+p.name+'</strong></td><td style="font-family:monospace;color:var(--primary)">'+p.value+'</td><td>'+p.desc+'</td><td><span class="st-badge blue">'+p.module+'</span></td><td style="color:var(--text-muted)">'+p.updatedAt+'</td></tr>'}).join('');
}

function initSettingsTabs(){
  var counts={'alerts':settingsData.alertThresholds.length,'datasource':settingsData.dataSources.length,'roles':settingsData.rolePermissions.length,'notify':settingsData.notifyPolicies.length,'params':settingsData.sysParams.length};
  var tabs=document.querySelectorAll('#stTabBar .st-tab');
  tabs.forEach(function(tab){
    var orig=tab.getAttribute('data-orig')||tab.textContent.replace(/\s*\(\d+\)\s*$/,'');
    tab.setAttribute('data-orig',orig);
    tab.innerHTML=orig+' <span style="font-size:9px;opacity:.7">('+counts[tab.dataset.tab]+')</span>';
    tab.onclick=function(){
      tabs.forEach(function(t){t.classList.remove('active')});
      this.classList.add('active');
      document.querySelectorAll('.st-panel').forEach(function(p){p.classList.remove('active')});
      var target=document.getElementById('stPanel-'+this.dataset.tab);
      if(target)target.classList.add('active');
    };
  });
}

window.initPage_settings = initPage_settings;

registerModule('settings', initPage_settings);
