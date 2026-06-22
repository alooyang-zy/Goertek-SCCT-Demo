// ===== 监控审计 =====
(function(){
"use strict";
var AUDIT_LOGS = [
  {time:'08:30:15',user:'张三',module:'规则配置',action:'修改',target:'OTIF目标值',detail:'98.0% → 98.5%',ip:'10.20.1.105',status:'正常'},
  {time:'08:25:42',user:'李四',module:'项目运营',action:'查看',target:'XR模组A01',detail:'项目详情页',ip:'10.20.2.38',status:'正常'},
  {time:'08:20:03',user:'郑十',module:'数据集成',action:'配置',target:'TMS接口',detail:'同步频率 30分钟→15分钟',ip:'10.20.1.8',status:'正常'},
  {time:'08:15:28',user:'王五',module:'计划交付',action:'导出',target:'需求预测报告',detail:'PDF导出 2.3MB',ip:'10.20.3.12',status:'正常'},
  {time:'08:10:55',user:'赵六',module:'供应协同',action:'修改',target:'供应商评分',detail:'歌尔电子 88→92',ip:'10.20.2.45',status:'正常'},
  {time:'08:05:12',user:'unknown',module:'配置管理',action:'越权',target:'角色权限',detail:'尝试删除高管角色',ip:'192.168.1.200',status:'拦截'},
  {time:'07:58:30',user:'孙七',module:'风险闭环',action:'创建',target:'8D事件',detail:'8D-305 创建',ip:'10.20.3.28',status:'正常'},
  {time:'07:50:44',user:'李四',module:'项目运营',action:'修改',target:'B09库存水位',detail:'安全库存 800→950',ip:'10.20.2.38',status:'正常'},
  {time:'07:45:20',user:'郑十',module:'配置管理',action:'修改',target:'预警阈值',detail:'呆滞料 8万→10万',ip:'10.20.1.8',status:'正常'},
  {time:'07:30:15',user:'unknown',module:'数据集成',action:'篡改',target:'SAP接口配置',detail:'尝试修改SAP连接地址',ip:'192.168.1.201',status:'拦截'},
  {time:'07:20:08',user:'张三',module:'控制塔总览',action:'查看',target:'全局总览',detail:'首页访问',ip:'10.20.1.105',status:'正常'},
  {time:'06-21 18:30',user:'周八',module:'供应协同',action:'导出',target:'供应商列表',detail:'Excel导出',ip:'10.20.3.15',status:'正常'},
  {time:'06-21 17:15',user:'吴九',module:'控制塔总览',action:'查看',target:'绩效对比',detail:'多项目对比',ip:'10.20.1.200',status:'正常'},
  {time:'06-21 16:40',user:'李四',module:'项目运营',action:'修改',target:'A01交期承诺',detail:'06-25→06-28',ip:'10.20.2.38',status:'正常'},
  {time:'06-21 15:20',user:'unknown',module:'角色权限',action:'越权',target:'用户列表',detail:'尝试批量导出用户数据',ip:'192.168.1.202',status:'拦截'},
  {time:'06-21 14:30',user:'赵六',module:'供应协同',action:'创建',target:'采购订单',detail:'PO-5082 创建',ip:'10.20.2.45',status:'正常'},
  {time:'06-21 13:15',user:'孙七',module:'风险闭环',action:'关闭',target:'8D-298',detail:'8D事件关闭',ip:'10.20.3.28',status:'正常'},
  {time:'06-21 11:00',user:'郑十',module:'配置管理',action:'配置',target:'数据同步',detail:'WMS同步任务重启',ip:'10.20.1.8',status:'正常'},
  {time:'06-21 10:30',user:'张三',module:'规则配置',action:'修改',target:'SCOR权重',detail:'可靠性 20%→25%',ip:'10.20.1.105',status:'正常'},
  {time:'06-21 09:15',user:'王五',module:'计划交付',action:'创建',target:'需求预测',detail:'6月滚动预测创建',ip:'10.20.3.12',status:'正常'}
];
function initPage_configAudit(container){
  container = container || document.getElementById('page-config-audit');
  if(!container) return;
  container.innerHTML =
    '<div class="kpi-grid" id="caKpiGrid"></div>'
    + '<div class="chart-row" style="grid-template-columns:1fr">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-list-alt"></i> 操作日志</h3><span style="font-size:11px;color:var(--text-muted)">最近20条</span></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="caLogTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header" style="background:linear-gradient(90deg,var(--danger-bg),var(--card));border-left:4px solid var(--danger)"><h3 style="color:var(--danger)"><i class="fas fa-shield-halved"></i> 审计告警</h3></div><div class="card-body" id="caAlerts"></div></div>'
    + '</div>';
  var kpiGrid = container.querySelector('#caKpiGrid');
  if(kpiGrid){
    var today = AUDIT_LOGS.filter(function(l){return l.time.indexOf(':')>0;}).length;
    var blocked = AUDIT_LOGS.filter(function(l){return l.status==='拦截';}).length;
    var sensitive = AUDIT_LOGS.filter(function(l){return l.action==='修改'||l.action==='配置';}).length;
    kpiGrid.innerHTML = [
      {lbl:'今日操作',val:today,unit:'次',color:'var(--primary)',icon:'fa-list-alt'},
      {lbl:'异常操作',val:blocked,unit:'次',color:'var(--danger)',icon:'fa-triangle-exclamation'},
      {lbl:'敏感变更',val:sensitive,unit:'次',color:'var(--warning)',icon:'fa-pen-to-square'},
      {lbl:'合规风险',val:blocked,unit:'项',color:blocked>2?'var(--danger)':'var(--warning)',icon:'fa-shield-halved'}
    ].map(function(k){return '<div class="kpi-card" style="border-top:3px solid '+k.color+'"><div style="display:flex;align-items:center;gap:8px"><i class="fas '+k.icon+'" style="color:'+k.color+'"></i><span style="font-size:11px;color:var(--text-sec);font-weight:600">'+k.lbl+'</span></div><div style="font-size:28px;font-weight:800;color:'+k.color+';margin-top:8px">'+k.val+'<span style="font-size:13px;color:var(--text-muted)"> '+k.unit+'</span></div></div>';}).join('');
  }
  var table = container.querySelector('#caLogTable');
  if(table){
    table.querySelector('thead').innerHTML='<tr><th>时间</th><th>用户</th><th>模块</th><th>操作</th><th>对象</th><th>变更内容</th><th>IP</th><th>状态</th></tr>';
    table.querySelector('tbody').innerHTML=AUDIT_LOGS.map(function(l){
      var stColor=l.status==='正常'?'var(--success)':'var(--danger)';
      var actColor=l.action==='修改'||l.action==='配置'?'var(--warning)':l.action==='越权'||l.action==='篡改'?'var(--danger)':'var(--text-sec)';
      return '<tr><td>'+l.time+'</td><td style="font-weight:600">'+l.user+'</td><td>'+l.module+'</td><td style="color:'+actColor+';font-weight:600">'+l.action+'</td><td>'+l.target+'</td><td style="font-size:11px;color:var(--text-muted)">'+l.detail+'</td><td style="font-family:monospace;font-size:11px">'+l.ip+'</td><td style="color:'+stColor+';font-weight:600">'+l.status+'</td></tr>';
    }).join('');
  }
  var alertsEl = container.querySelector('#caAlerts');
  if(alertsEl){
    var alerts = AUDIT_LOGS.filter(function(l){return l.status==='拦截';});
    alertsEl.innerHTML = alerts.map(function(a){
      return '<div style="padding:12px;border-left:3px solid var(--danger);background:var(--danger-bg);border-radius:0 8px 8px 0;margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-weight:700;color:var(--danger);font-size:13px"><i class="fas fa-ban"></i> '+a.action+' — '+a.target+'</span><span style="font-size:11px;color:var(--text-muted)">'+a.time+' · '+a.ip+'</span></div><div style="font-size:12px;color:var(--text-sec)">'+a.detail+'</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px">用户：'+a.user+' · 模块：'+a.module+' · 已自动拦截并记录</div></div>';
    }).join('') || '<div style="padding:20px;text-align:center;color:var(--success)"><i class="fas fa-check-circle"></i> 无审计告警</div>';
  }
}
registerModule('config-audit', initPage_configAudit);
})();
