// Module: closedloop — 5.1 事件中心（风险接警台）
(function(){
"use strict";

// ═══════════════ 事件数据 ═══════════════
var EVENTS = [
  { id:'E-0842', title:'单源物料TTS<3天', priority:'P1', source:'自动触发', riskCode:'R08', projects:['AW01'], owner:'王磊', deadline:'06/26', status:'处置中', desc:'供应商XX当前库存仅可支撑2.8天，第二货源认证尚未完成（进度60%）。', materials:['NAND Flash A1-2024（3个料号）'], potentialLoss:480, discoveredAt:'2026-06-24 08:32',
    timeline:[
      {time:'06/24 08:32', text:'规则自动触发', type:'auto'},
      {time:'06/24 09:15', text:'王磊接单确认', type:'owner'},
      {time:'06/24 11:00', text:'已联系供应商紧急补货', type:'done'}
    ],
    impactPath:'NAND缺料 → AW01工单停产 → OTIF下降，预计06/27起停产，波及3条产线'
  },
  { id:'E-0841', title:'贸易制裁新增物料', priority:'P1', source:'人工上报', riskCode:'R11', projects:['多项目'], owner:'赵敏', deadline:'06/25', status:'待响应', desc:'新增涉管制物料清单，需立即核查受影响项目范围。', materials:['涉管制芯片组'], potentialLoss:2100, discoveredAt:'2026-06-24 07:15',
    timeline:[{time:'06/24 07:15', text:'人工上报', type:'manual'}],
    impactPath:'出口管制 → 物料采购受限 → 多项目出货受阻'
  },
  { id:'E-0839', title:'供应商延期7天', priority:'P2', source:'自动触发', riskCode:'R06', projects:['SW03'], owner:'李强', deadline:'06/28', status:'处置中', desc:'关键供应商交期承诺推迟7天，影响SW03项目工单齐套。', materials:['声学模组B09'], potentialLoss:430, discoveredAt:'2026-06-23 14:20',
    timeline:[
      {time:'06/23 14:20', text:'规则自动触发', type:'auto'},
      {time:'06/23 16:00', text:'李强接单并联系供应商', type:'owner'}
    ],
    impactPath:'供应商延期 → SW03齐套缺口 → 产线换线损失'
  },
  { id:'E-0838', title:'需求预测偏差连续3周>15%', priority:'P2', source:'自动触发', riskCode:'R01', projects:['HW01'], owner:'张敏', deadline:'06/27', status:'处置中', desc:'客户PO与预测持续偏差，已连续3周MAPE超过15%。', materials:[''], potentialLoss:320, discoveredAt:'2026-06-22 09:00',
    timeline:[
      {time:'06/22 09:00', text:'规则自动触发', type:'auto'},
      {time:'06/22 10:30', text:'触发S&OP评审', type:'owner'}
    ],
    impactPath:'预测偏差 → 备料错误 → 库存积压或缺料'
  },
  { id:'E-0835', title:'大客户审计发现Major NC', priority:'P1', source:'人工上报', riskCode:'R12', projects:['AP01'], owner:'陈晨', deadline:'06/30', status:'处置中', desc:'Apple质量审计发现Major不符合项，需30天内完成整改。', materials:[''], potentialLoss:1500, discoveredAt:'2026-06-20 16:00',
    timeline:[
      {time:'06/20 16:00', text:'人工上报', type:'manual'},
      {time:'06/21 09:00', text:'成立整改小组', type:'owner'}
    ],
    impactPath:'Major NC → 客户准入风险 → 订单冻结风险'
  },
  { id:'E-0831', title:'供应商延期3天', priority:'P2', source:'自动触发', riskCode:'R06', projects:['HW02'], owner:'李强', deadline:'06/27', status:'待验证', desc:'供应商交付已恢复正常，等待IQC验收入库确认。', materials:['麦克风模组'], potentialLoss:290, discoveredAt:'2026-06-21 08:00',
    timeline:[
      {time:'06/21 08:00', text:'规则自动触发', type:'auto'},
      {time:'06/21 10:00', text:'李强联系供应商加急', type:'owner'},
      {time:'06/23 18:00', text:'物料到货，待IQC验证', type:'done'}
    ],
    impactPath:'供应商延期 → 在途物料紧张 → 已缓解'
  },
  { id:'E-0825', title:'NPI工程变更影响BOM', priority:'P1', source:'人工上报', riskCode:'R02', projects:['XR01'], owner:'周涛', deadline:'06/24', status:'已关闭', desc:'ECN导致BOM变动，已冻结变更窗口并重新备料。', materials:['专用镜片'], potentialLoss:680, discoveredAt:'2026-06-18 10:00',
    timeline:[
      {time:'06/18 10:00', text:'人工上报', type:'manual'},
      {time:'06/18 14:00', text:'冻结BOM变更窗口', type:'owner'},
      {time:'06/24 09:00', text:'完成首批物料重排，关闭事件', type:'done'}
    ],
    impactPath:'ECN → BOM变动 → 物料呆滞/重排'
  },
  { id:'E-0821', title:'EOL库存消化滞后', priority:'P3', source:'自动触发', riskCode:'R04', projects:['AU01'], owner:'吴芳', deadline:'07/05', status:'已关闭', desc:'EOL项目专用料消化率低于80%，已协商客户买单。', materials:['EOL专用料'], potentialLoss:480, discoveredAt:'2026-06-15 09:00',
    timeline:[
      {time:'06/15 09:00', text:'规则自动触发', type:'auto'},
      {time:'06/18 10:00', text:'客户买单清单确认', type:'owner'},
      {time:'06/22 16:00', text:'消化率达85%，关闭事件', type:'done'}
    ],
    impactPath:'EOL预测偏差 → 库存积压 → 已消化'
  }
];

var STATUS_LIST = ['待响应','处置中','待验证','已关闭'];
var selectedEvent = null;
var currentStatusFilter = 'all';

// ═══════════════ 工具函数 ═══════════════
function priorityColor(p){ return p==='P1'?'var(--danger)':p==='P2'?'var(--warning)':'var(--info)'; }
function statusColor(s){ return s==='待响应'?'var(--danger)':s==='处置中'?'var(--warning)':s==='待验证'?'var(--warning)':'var(--success)'; }
function sourceIcon(s){ return s==='自动触发'?'fa-robot':s==='人工上报'?'fa-user-pen':'fa-file-import'; }
function isOverdue(d){ return d==='06/24' || d==='06/25'; } // 简化判断

// ═══════════════ 入口 ═══════════════
function initPage_closedloop(){
  var container = document.getElementById('page-closedloop');
  if(!container) return;

  // 消费穿透跳转
  consumeDrillDown('closedloopProjectSelect');

  renderStatusBoard();
  renderEventList();
  renderDetailDrawer();
}

function renderStatusBoard(){
  var counts = {待响应:0,处置中:0,待验证:0,已关闭:0};
  EVENTS.forEach(function(e){ counts[e.status]++; });
  var overdue = EVENTS.filter(function(e){return e.status!=='已关闭' && isOverdue(e.deadline);}).length;
  var newThisWeek = EVENTS.filter(function(e){return e.source==='自动触发' && e.status==='处置中';}).length;
  var avgClose = Math.round(EVENTS.filter(function(e){return e.status==='已关闭';}).length * 3.8 / 4 * 10)/10;
  var closedThisMonth = EVENTS.filter(function(e){return e.status==='已关闭';}).length;

  var el = document.getElementById('clStatusBoard');
  if(!el) return;
  el.innerHTML = STATUS_LIST.map(function(s){
    var meta = s==='待响应'?'🔴 超期'+overdue+'件':s==='处置中'?'🟠 本周新增'+newThisWeek:s==='待验证'?'🟡 平均'+avgClose+'天':'本月关闭'+closedThisMonth+'件';
    return '<div class="cl-status-card '+(currentStatusFilter===s?'active':'')+'" data-status="'+s+'" onclick="window._clFilterStatus(\''+s+'\')">'
      +'<div class="cl-status-label">'+s+'</div>'
      +'<div class="cl-status-num">'+counts[s]+' <span>件</span></div>'
      +'<div class="cl-status-meta">'+meta+'</div>'
      +'</div>';
  }).join('');
}

window._clFilterStatus = function(s){
  currentStatusFilter = currentStatusFilter===s?'all':s;
  renderStatusBoard();
  renderEventList();
};

function renderEventList(){
  var el = document.getElementById('clEventList');
  if(!el) return;
  var filtered = currentStatusFilter==='all'?EVENTS:EVENTS.filter(function(e){return e.status===currentStatusFilter;});

  el.innerHTML = '<table class="cl-event-table"><thead><tr>'
    +'<th>优先级</th><th>事件ID</th><th>事件标题</th><th>来源</th><th>归属风险</th><th>影响项目</th><th>责任人</th><th>期限</th><th>状态</th><th>操作</th>'
    +'</tr></thead><tbody>'
    + filtered.map(function(e){
      var overdueClass = isOverdue(e.deadline)?'cl-overdue':'';
      return '<tr class="'+(selectedEvent&&selectedEvent.id===e.id?'active':'')+' '+overdueClass+'" onclick="window._clSelectEvent(\''+e.id+'\')">'
        +'<td><span class="cl-pill" style="background:'+priorityColor(e.priority)+'">'+e.priority+'</span></td>'
        +'<td>'+e.id+'</td>'
        +'<td><div class="cl-event-title">'+e.title+'</div></td>'
        +'<td><i class="fas '+sourceIcon(e.source)+'" style="margin-right:4px;color:var(--text-muted)"></i>'+e.source+'</td>'
        +'<td>'+e.riskCode+'</td>'
        +'<td>'+e.projects.join(' / ')+'</td>'
        +'<td>'+e.owner+'</td>'
        +'<td class="cl-deadline '+overdueClass+'">'+e.deadline+(isOverdue(e.deadline)?' ⚠':'')+'</td>'
        +'<td><span class="cl-pill" style="background:'+statusColor(e.status)+'20;color:'+statusColor(e.status)+'">'+e.status+'</span></td>'
        +'<td><button class="cl-btn-sm" onclick="event.stopPropagation();window._clDetail(\''+e.id+'\')">详情</button>'
          +(e.status==='待响应'?'<button class="cl-btn-sm cl-btn-primary" onclick="event.stopPropagation();window._clTake(\''+e.id+'\')">接单</button>':'')
          +(e.status==='处置中'?'<button class="cl-btn-sm cl-btn-warn" onclick="event.stopPropagation();window._clUrge(\''+e.id+'\')">催办</button>':'')
          +'</td>'
        +'</tr>';
    }).join('')
    +'</tbody></table>';
}

function renderDetailDrawer(){
  var el = document.getElementById('clDetailDrawer');
  if(!el) return;
  if(!selectedEvent){ el.classList.remove('open'); el.innerHTML=''; return; }
  var e = selectedEvent;
  el.classList.add('open');
  el.innerHTML =
    '<div class="cl-drawer-header">'
      +'<div><div class="cl-drawer-title">'+e.id+'  '+e.title+'</div>'
      +'<div class="cl-drawer-sub"><span class="cl-pill" style="background:'+priorityColor(e.priority)+'">'+e.priority+'</span>'
      +'<span class="cl-pill" style="background:'+statusColor(e.status)+'20;color:'+statusColor(e.status)+'">'+e.status+'</span>'
      +'<span style="color:var(--text-muted)">责任人：'+e.owner+'</span></div></div>'
      +'<button class="cl-drawer-close" onclick="window._clCloseDrawer()">×</button></div>'
    +'<div class="cl-drawer-body">'
      +'<div class="cl-drawer-section"><div class="cl-drawer-sec-title">基本信息</div>'
      +'<div class="cl-info-row"><label>触发规则</label><div>'+riskName(e.riskCode)+'（'+e.riskCode+'）</div></div>'
      +'<div class="cl-info-row"><label>归属风险</label><div>'+e.riskCode+' '+riskName(e.riskCode)+'</div></div>'
      +'<div class="cl-info-row"><label>影响物料</label><div>'+(e.materials.join('、')||'-')+'</div></div>'
      +'<div class="cl-info-row"><label>影响项目</label><div>'+e.projects.join(' / ')+'</div></div>'
      +'<div class="cl-info-row"><label>潜在损失</label><div style="color:var(--danger);font-weight:700">¥'+e.potentialLoss+'万</div></div>'
      +'<div class="cl-info-row"><label>发现时间</label><div>'+e.discoveredAt+'</div></div>'
      +'</div>'
      +'<div class="cl-drawer-section"><div class="cl-drawer-sec-title">事件描述</div>'
      +'<div style="font-size:12px;color:var(--text-sec);line-height:1.6">'+e.desc+'</div></div>'
      +'<div class="cl-drawer-section"><div class="cl-drawer-sec-title">影响路径</div>'
      +'<div style="font-size:12px;color:var(--text-sec);line-height:1.6">'+e.impactPath+'</div></div>'
      +'<div class="cl-drawer-section"><div class="cl-drawer-sec-title">处置进展时间轴</div>'
      +'<div class="cl-timeline">'+e.timeline.map(function(t){
        return '<div class="cl-timeline-item"><div class="cl-timeline-dot '+t.type+'"></div>'
          +'<div class="cl-timeline-content"><div class="cl-timeline-time">'+t.time+'</div><div>'+t.text+'</div></div></div>';
      }).join('')+'</div></div>'
      +'<div class="cl-drawer-actions">'
        +'<button class="cl-btn" onclick="switchPage(\'solutions\')">查看关联方案</button>'
        +'<button class="cl-btn" onclick="switchPage(\'sandtable\')">跳转沙盘模拟</button>'
        +'<button class="cl-btn cl-btn-danger" onclick="window._clUpgrade(\''+e.id+'\')">升级事件</button>'
      +'</div>'
    +'</div>';
}

function riskName(code){
  var map = {R01:'需求预测失准',R02:'NPI/ECN工程变更冲击',R03:'物料缺料断供',R04:'EOL/E&O库存风险',R05:'出货履约风险',
    R06:'供应商交付稳定性',R07:'来料质量异常',R08:'单源依赖断供',R09:'Tier-N隐性断链',R10:'干线物流中断',
    R11:'贸易合规与制裁',R12:'大客户审计准入',R13:'地缘与突发事件'};
  return map[code]||code;
}

window._clSelectEvent = function(id){
  selectedEvent = EVENTS.find(function(e){return e.id===id;});
  renderEventList();
  renderDetailDrawer();
};

window._clDetail = function(id){
  selectedEvent = EVENTS.find(function(e){return e.id===id;});
  renderEventList();
  renderDetailDrawer();
};

window._clCloseDrawer = function(){
  selectedEvent = null;
  renderEventList();
  renderDetailDrawer();
};

window._clTake = function(id){
  var e = EVENTS.find(function(x){return x.id===id;});
  if(e){ e.status='处置中'; e.timeline.push({time:'现在', text:'已接单', type:'owner'}); renderStatusBoard(); renderEventList(); renderDetailDrawer(); }
};

window._clUrge = function(id){
  alert('已发送催办通知给事件 '+id+' 责任人');
};

window._clUpgrade = function(id){
  alert('事件 '+id+' 已升级至管理层');
};

window._clNewEvent = function(){
  var form = document.getElementById('clNewEventForm');
  if(form) form.classList.add('open');
};

window._clCloseForm = function(){
  var form = document.getElementById('clNewEventForm');
  if(form) form.classList.remove('open');
};

window._clSubmitEvent = function(){
  alert('事件已上报');
  window._clCloseForm();
};

// ═══════════════ 初始化页面结构（为空容器时渲染） ═══════════════
function ensurePageStructure(){
  var container = document.getElementById('page-closedloop');
  if(!container || container.querySelector('#clStatusBoard')) return;
  container.innerHTML =
    '<div class="filter-bar">'
      +'<div class="filter-group"><label>项目:</label><select id="closedloopProjectSelect" onchange="initPage_closedloop()">'+projects.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>';}).join('')+'</select></div>'
      +'<span style="font-size:11px;color:var(--text-muted);margin-left:12px;">风险接警台 · 把风险信号转化为有主人、有状态、有时限的事件</span>'
      +'<button class="cl-btn cl-btn-primary" style="margin-left:auto" onclick="window._clNewEvent()">+ 上报风险事件</button>'
    +'</div>'
    +'<div id="clStatusBoard" class="cl-status-board"></div>'
    +'<div class="cl-main-layout">'
      +'<div class="cl-list-panel"><div id="clEventList"></div></div>'
      +'<div id="clDetailDrawer" class="cl-detail-drawer"></div>'
    +'</div>'
    +'<div id="clNewEventForm" class="cl-modal">'
      +'<div class="cl-modal-content">'
        +'<div class="cl-modal-header"><span>上报风险事件</span><button onclick="window._clCloseForm()">×</button></div>'
        +'<div class="cl-modal-body">'
          +'<div class="cl-form-row"><label>事件标题</label><input type="text" placeholder="请输入事件标题"></div>'
          +'<div class="cl-form-row"><label>优先级</label><select><option>P1</option><option>P2</option><option>P3</option></select></div>'
          +'<div class="cl-form-row"><label>归属风险</label><select><option>R01 需求预测失准</option><option>R08 单源依赖断供</option></select></div>'
          +'<div class="cl-form-row"><label>影响项目</label><input type="text" placeholder="多项目用/分隔"></div>'
          +'<div class="cl-form-row"><label>责任人</label><input type="text" placeholder=""></div>'
          +'<div class="cl-form-row"><label>期望期限</label><input type="text" placeholder="MM/DD"></div>'
          +'<div class="cl-form-row"><label>事件描述</label><textarea rows="3"></textarea></div>'
        +'</div>'
        +'<div class="cl-modal-footer">'
          +'<button class="cl-btn" onclick="window._clCloseForm()">取消</button>'
          +'<button class="cl-btn cl-btn-primary" onclick="window._clSubmitEvent()">提交</button>'
        +'</div>'
      +'</div>'
    +'</div>';
}

function initPage_closedloop(){
  ensurePageStructure();
  var container = document.getElementById('page-closedloop');
  if(!container) return;
  consumeDrillDown('closedloopProjectSelect');
  renderStatusBoard();
  renderEventList();
  renderDetailDrawer();
}

window.initPage_closedloop = initPage_closedloop;

})();
registerModule('closedloop', window.initPage_closedloop);

