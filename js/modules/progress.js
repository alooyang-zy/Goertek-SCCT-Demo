// Module: progress — 履约跟踪 v10.1 (订单履约跟踪 + NPI物料跟踪)
// 订单履约数据结构参考：项目履行全景追踪Demo-V1.8
(function(){
"use strict";

// ═══════════════ 工具函数 ═══════════════
function fmt(n){ return Number(n||0).toLocaleString('zh-CN'); }
function amount(n){ return '¥'+Number(n||0).toLocaleString('zh-CN',{maximumFractionDigits:1})+'万'; }
function pct(a,b){ return b?((a/b)*100).toFixed(1)+'%':'0.0%'; }
function hashStr(str){var h=5381;for(var i=0;i<str.length;i++)h=((h<<5)+h)+str.charCodeAt(i);return (h>>>0);}
function sRand(seed,min,max,decimal){var s=seed;s=(s*1664525+1013904223)&0xffffffff;var r=(s>>>0)/0xffffffff;var v=min+r*(max-min);return decimal?parseFloat(v.toFixed(decimal)):Math.round(v);}

// ═══════════════ 订单数据（参考V1.8的orders+projectMeta） ═══════════════
var PROJECT_META = [
  { id:"PJ-A01-2605", name:"A01 智能整机项目", property:"重大项目", bg:"智能声学BG", customer:"客户A", model:"TWS整机-A01", material:"FG-A01-300", phase:"量产", month:"2026-05", unitPrice:0.148, risk:"red", riskNodes:["2.5","3.6","4.7","5.6"], riskCopy:"库存需按项目需求匹配，当前可满足量不足，影响承诺交期。" },
  { id:"PJ-C07-2605", name:"C07 组件拉动项目", property:"重大项目", bg:"精密零件BG", customer:"客户C", model:"结构组件-C07", material:"FG-C07-112", phase:"爬坡", month:"2026-05", unitPrice:0.036, risk:"red", riskNodes:["2.5","3.6","3.7"], riskCopy:"IQC待检占用备料窗口，VMI库存覆盖不足。" },
  { id:"PJ-E15-2605", name:"E15 声学模组项目", property:"重点项目", bg:"智能声学BG", customer:"客户E", model:"声学模组-E15", material:"FG-E15-510", phase:"试产", month:"2026-05", unitPrice:0.052, risk:"yellow", riskNodes:["2.5","3.2"], riskCopy:"计划单缺料，供应商要货计划回复待确认。" },
  { id:"PJ-B18-2606", name:"B18 可穿戴项目", property:"重点项目", bg:"智能硬件BG", customer:"客户B", model:"智能手表-B18", material:"FG-B18-028", phase:"量产", month:"2026-06", unitPrice:0.226, risk:"yellow", riskNodes:["5.2"], riskCopy:"拣配批次需要拆分，仓配执行方案待确认。" },
  { id:"PJ-D22-2606", name:"D22 精密件项目", property:"常规项目", bg:"精密零件BG", customer:"客户D", model:"精密件-D22", material:"FG-D22-077", phase:"量产", month:"2026-06", unitPrice:0.021, risk:"green", riskNodes:[], riskCopy:"链路节点执行正常，无显著履约卡点。" },
  { id:"PJ-F09-2606", name:"F09 车载模组项目", property:"常规项目", bg:"智能硬件BG", customer:"客户F", model:"车载模组-F09", material:"FG-F09-688", phase:"爬坡", month:"2026-06", unitPrice:0.184, risk:"green", riskNodes:[], riskCopy:"当前承诺交期与库存可满足量匹配。" }
];

var ORDERS = [
  // ── A01 智能整机项目（红风险）── 进行中
  { no:"SO-A01-0521", projectId:"PJ-A01-2605", demandDate:"2026-05-23", promiseDate:"2026-05-25", qty:6400, delivered:4400, available:980, completable:380, overdue:420, risk:"red", node:"4.7 成品库存", status:"进行中" },
  { no:"SO-A01-0528", projectId:"PJ-A01-2605", demandDate:"2026-05-30", promiseDate:"2026-05-30", qty:4800, delivered:2800, available:940, completable:360, overdue:260, risk:"red", node:"5.6 交付达成与客户签收", status:"进行中" },
  // A01 已关闭
  { no:"SO-A01-0501", projectId:"PJ-A01-2605", demandDate:"2026-04-15", promiseDate:"2026-04-15", qty:5200, delivered:5200, available:0, completable:0, overdue:0, risk:"green", node:"5.6 交付达成与客户签收", status:"已关闭" },
  { no:"SO-A01-0418", projectId:"PJ-A01-2605", demandDate:"2026-03-28", promiseDate:"2026-03-30", qty:3800, delivered:3800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-A01-0405", projectId:"PJ-A01-2605", demandDate:"2026-03-10", promiseDate:"2026-03-12", qty:4500, delivered:4500, available:0, completable:0, overdue:0, risk:"yellow", node:"5.6 交付达成与客户签收", status:"已关闭" },
  { no:"SO-A01-0322", projectId:"PJ-A01-2605", demandDate:"2026-02-25", promiseDate:"2026-02-25", qty:6000, delivered:6000, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-A01-0315", projectId:"PJ-A01-2605", demandDate:"2026-02-10", promiseDate:"2026-02-12", qty:3200, delivered:3200, available:0, completable:0, overdue:80, risk:"yellow", node:"5.6 交付达成与客户签收", status:"已关闭" },
  { no:"SO-A01-0228", projectId:"PJ-A01-2605", demandDate:"2026-01-20", promiseDate:"2026-01-22", qty:4800, delivered:4800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-A01-0210", projectId:"PJ-A01-2605", demandDate:"2026-01-05", promiseDate:"2026-01-05", qty:5500, delivered:5500, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-A01-0115", projectId:"PJ-A01-2605", demandDate:"2025-12-20", promiseDate:"2025-12-22", qty:4200, delivered:4200, available:0, completable:0, overdue:120, risk:"yellow", node:"5.6 交付达成与客户签收", status:"已关闭" },

  // ── C07 组件拉动项目（红风险）── 进行中
  { no:"SO-C07-0518", projectId:"PJ-C07-2605", demandDate:"2026-05-20", promiseDate:"2026-05-22", qty:3600, delivered:2200, available:430, completable:270, overdue:420, risk:"red", node:"3.5 检验入库", status:"进行中" },
  { no:"SO-C07-0526", projectId:"PJ-C07-2605", demandDate:"2026-05-29", promiseDate:"2026-05-29", qty:3300, delivered:2000, available:480, completable:250, overdue:0, risk:"yellow", node:"2.5 物料齐套", status:"进行中" },
  // C07 已关闭
  { no:"SO-C07-0420", projectId:"PJ-C07-2605", demandDate:"2026-04-05", promiseDate:"2026-04-05", qty:2800, delivered:2800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-C07-0328", projectId:"PJ-C07-2605", demandDate:"2026-03-15", promiseDate:"2026-03-15", qty:3100, delivered:3100, available:0, completable:0, overdue:60, risk:"yellow", node:"5.6 交付达成", status:"已关闭" },
  { no:"SO-C07-0305", projectId:"PJ-C07-2605", demandDate:"2026-02-22", promiseDate:"2026-02-22", qty:3500, delivered:3500, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-C07-0218", projectId:"PJ-C07-2605", demandDate:"2026-01-25", promiseDate:"2026-01-26", qty:2600, delivered:2600, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-C07-0110", projectId:"PJ-C07-2605", demandDate:"2025-12-15", promiseDate:"2025-12-15", qty:3000, delivered:3000, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },

  // ── E15 声学模组项目（黄风险）── 进行中
  { no:"SO-E15-0527", projectId:"PJ-E15-2605", demandDate:"2026-06-03", promiseDate:"2026-06-05", qty:4200, delivered:1300, available:1210, completable:1260, overdue:0, risk:"yellow", node:"2.5 物料齐套", status:"进行中" },
  // E15 已关闭
  { no:"SO-E15-0412", projectId:"PJ-E15-2605", demandDate:"2026-04-20", promiseDate:"2026-04-20", qty:3600, delivered:3600, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-E15-0318", projectId:"PJ-E15-2605", demandDate:"2026-03-05", promiseDate:"2026-03-06", qty:2800, delivered:2800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-E15-0220", projectId:"PJ-E15-2605", demandDate:"2026-01-28", promiseDate:"2026-01-30", qty:3200, delivered:3200, available:0, completable:0, overdue:90, risk:"yellow", node:"5.6 交付达成", status:"已关闭" },
  { no:"SO-E15-0105", projectId:"PJ-E15-2605", demandDate:"2025-12-18", promiseDate:"2025-12-18", qty:2400, delivered:2400, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },

  // ── B18 可穿戴项目（黄风险）── 进行中
  { no:"SO-B18-0605", projectId:"PJ-B18-2606", demandDate:"2026-06-08", promiseDate:"2026-06-10", qty:5200, delivered:1200, available:2380, completable:1460, overdue:0, risk:"yellow", node:"5.2 出货拣配", status:"进行中" },
  // B18 已关闭
  { no:"SO-B18-0425", projectId:"PJ-B18-2606", demandDate:"2026-04-28", promiseDate:"2026-04-28", qty:4800, delivered:4800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-B18-0401", projectId:"PJ-B18-2606", demandDate:"2026-03-20", promiseDate:"2026-03-22", qty:3600, delivered:3600, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-B18-0228", projectId:"PJ-B18-2606", demandDate:"2026-02-05", promiseDate:"2026-02-05", qty:4200, delivered:4200, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-B18-0115", projectId:"PJ-B18-2606", demandDate:"2025-12-22", promiseDate:"2025-12-24", qty:3800, delivered:3800, available:0, completable:0, overdue:70, risk:"yellow", node:"5.6 交付达成", status:"已关闭" },

  // ── D22 精密件项目（绿风险）── 进行中
  { no:"SO-D22-0603", projectId:"PJ-D22-2606", demandDate:"2026-06-12", promiseDate:"2026-06-12", qty:8600, delivered:4600, available:2190, completable:1810, overdue:0, risk:"green", node:"5.1 发货指令", status:"进行中" },
  // D22 已关闭
  { no:"SO-D22-0420", projectId:"PJ-D22-2606", demandDate:"2026-04-15", promiseDate:"2026-04-15", qty:7800, delivered:7800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-D22-0325", projectId:"PJ-D22-2606", demandDate:"2026-03-08", promiseDate:"2026-03-08", qty:8200, delivered:8200, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-D22-0218", projectId:"PJ-D22-2606", demandDate:"2026-01-22", promiseDate:"2026-01-22", qty:7500, delivered:7500, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-D22-0108", projectId:"PJ-D22-2606", demandDate:"2025-12-10", promiseDate:"2025-12-10", qty:6800, delivered:6800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },

  // ── F09 车载模组项目（绿风险）── 进行中
  { no:"SO-F09-0610", projectId:"PJ-F09-2606", demandDate:"2026-06-18", promiseDate:"2026-06-19", qty:2900, delivered:900, available:1120, completable:880, overdue:0, risk:"green", node:"4.5 成品入库", status:"进行中" },
  // F09 已关闭
  { no:"SO-F09-0428", projectId:"PJ-F09-2606", demandDate:"2026-04-25", promiseDate:"2026-04-25", qty:3200, delivered:3200, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-F09-0320", projectId:"PJ-F09-2606", demandDate:"2026-03-12", promiseDate:"2026-03-12", qty:2800, delivered:2800, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" },
  { no:"SO-F09-0225", projectId:"PJ-F09-2606", demandDate:"2026-02-08", promiseDate:"2026-02-08", qty:2600, delivered:2600, available:0, completable:0, overdue:50, risk:"yellow", node:"5.6 交付达成", status:"已关闭" },
  { no:"SO-F09-0118", projectId:"PJ-F09-2606", demandDate:"2025-12-20", promiseDate:"2025-12-20", qty:2400, delivered:2400, available:0, completable:0, overdue:0, risk:"green", node:"5.5 客户签收", status:"已关闭" }
];

var riskLabel = { red:"红风险", yellow:"黄风险", green:"绿风险", gray:"待统一" };
var riskColor = { red:"var(--danger)", yellow:"var(--warning)", green:"var(--success)", gray:"var(--text-muted)" };
var riskBg = { red:"var(--danger-bg)", yellow:"var(--warning-bg)", green:"var(--success-bg)", gray:"var(--border-light)" };

function usableStock(o){ return Math.round(o.available*1.35); }
function holdStock(o){ if(o.risk==='red') return Math.round(o.available*0.18); if(o.risk==='yellow') return Math.round(o.available*0.08); return 0; }
function metadata(id){ return PROJECT_META.find(function(p){return p.id===id;}); }
function toneBadge(tone){ return '<span class="prg-badge '+tone+'" style="background:'+riskBg[tone]+';color:'+riskColor[tone]+'">'+riskLabel[tone]+'</span>'; }

// ═══════════════ 状态 ═══════════════
var currentRiskFilter = 'all';
var currentStatusFilter = '进行中'; // 进行中 | 已关闭 | 全部

// ═══════════════ 入口 ═══════════════
function renderProgressPage(){
  var sel=document.getElementById('progressProjectSelect');
  if(sel){var cur=sel.value;
    sel.innerHTML=PROJECT_META.map(function(p){return '<option value="'+p.id+'">'+p.name+' ['+p.bg+'·'+p.customer+']</option>'}).join('');
    if(cur&&PROJECT_META.some(function(p){return p.id===cur;}))sel.value=cur;
    else if(PROJECT_META.length) sel.value=PROJECT_META[0].id;
  }
  consumeDrillDown('progressProjectSelect');
  loadOrders();
  // 同步刷新NPI（如果已初始化）
  if(window._prgNpiInited && typeof initPage_material==='function'){
    setTimeout(function(){ initPage_material(); }, 50);
  }
}

function loadOrders(){
  var sel=document.getElementById('progressProjectSelect');
  var pid=sel?sel.value:'';
  var info=document.getElementById('prgHeroInfo');
  if(info){
    var p = pid ? metadata(pid) : null;
    if(p){
      info.innerHTML='<span style="font-weight:700;color:var(--primary)">'+p.name+'</span> · 客户：<b>'+p.customer+'</b> · BG：<b>'+p.bg+'</b> · 产品：<b>'+p.model+'</b> · 阶段：<b>'+p.phase+'</b>';
    } else {
      info.innerHTML='请选择项目';
    }
  }

  // 按选中项目过滤订单
  var filtered = pid ? ORDERS.filter(function(o){return o.projectId===pid;}) : ORDERS.slice();

  // 按订单状态过滤
  if(currentStatusFilter!=='全部'){
    filtered = filtered.filter(function(o){return o.status===currentStatusFilter;});
  }

  // 按风险过滤
  if(currentRiskFilter!=='all'){
    filtered = filtered.filter(function(o){return o.risk===currentRiskFilter;});
  }

  renderOrderKpi(filtered);
  renderRiskTags(filtered);
  renderOrderTable(filtered);
}

// ── KPI指标卡 ──
function renderOrderKpi(os){
  var el=document.getElementById('prgOrderKpi');
  if(!el) return;
  var ordered=os.reduce(function(n,o){return n+o.qty;},0);
  var delivered=os.reduce(function(n,o){return n+o.delivered;},0);
  var undelivered=ordered-delivered;
  var available=os.reduce(function(n,o){return n+o.available;},0);
  var usable=os.reduce(function(n,o){return n+usableStock(o);},0);
  var hold=os.reduce(function(n,o){return n+holdStock(o);},0);
  var completable=os.reduce(function(n,o){return n+o.completable;},0);
  var overdue=os.reduce(function(n,o){return n+o.overdue;},0);
  var gap=os.reduce(function(n,o){return n+Math.max(o.qty-o.delivered-o.available-o.completable,0);},0);
  var orderAmount=os.reduce(function(n,o){var p=metadata(o.projectId);return n+o.qty*(p?p.unitPrice:0);},0);
  var redCount=os.filter(function(o){return o.risk==='red';}).length;
  var yellowCount=os.filter(function(o){return o.risk==='yellow';}).length;

  el.innerHTML='<div class="npi-cards">'+
    [
    {l:'订单总数',p:'当前范围内销售订单',v:os.length+' 个',s:'订单量 '+fmt(ordered)+' 件 · 金额 '+amount(orderAmount),a:'blue',ic:'fa-clipboard-list'},
    {l:'已交付量',p:'已完成客户交付',v:fmt(delivered)+' 件',s:pct(delivered,ordered)+' · 未交付 '+fmt(undelivered)+' 件',a:'green',ic:'fa-circle-check'},
    {l:'齐套数量',p:'库存可满足+承诺期可完工',v:fmt(available+completable)+' 件',s:'库存可满足 '+fmt(available)+' · 可完工 '+fmt(completable),a:(available+completable)>=undelivered?'green':'amber',ic:'fa-boxes-stacked'},
    {l:'可用库存量',p:'扣除Hold等不可发状态',v:fmt(usable)+' 件',s:'Hold冻结 '+fmt(hold)+' 件',a:'blue',ic:'fa-warehouse'},
    {l:'承诺缺口量',p:'齐套+可完工 < 未交付',v:fmt(gap)+' 件',s:gap>0?'⚠ 存在缺口':'✅ 无缺口',a:gap>0?'red':'green',ic:'fa-triangle-exclamation'},
    {l:'超期订单量',p:'依据承诺交期判定',v:fmt(overdue)+' 件',s:'红风险 '+redCount+' · 黄风险 '+yellowCount,a:overdue>0?'red':'green',ic:'fa-clock'}
  ].map(function(k){
    return '<div class="npi-card"><div class="npi-card-accent '+k.a+'"></div><div class="npi-card-purpose">'+k.p+'</div><div class="npi-card-label">'+k.l+'</div><div class="npi-card-value">'+k.v+'</div><div class="npi-card-sub">'+k.s+'</div></div>';
  }).join('')+'</div>';
}

// ── 风险标签栏 ──
function renderRiskTags(allOrders){
  var el=document.getElementById('prgOrderRiskTags');
  if(!el) return;
  // 先统计项目下全部订单的状态分布（不受风险筛选影响）
  var pid=document.getElementById('progressProjectSelect').value;
  var projOrders = pid ? ORDERS.filter(function(o){return o.projectId===pid;}) : ORDERS.slice();
  var inProgress = projOrders.filter(function(o){return o.status==='进行中';}).length;
  var closed = projOrders.filter(function(o){return o.status==='已关闭';}).length;
  // 当前筛选后的风险分布
  var red=allOrders.filter(function(o){return o.risk==='red';}).length;
  var yellow=allOrders.filter(function(o){return o.risk==='yellow';}).length;
  var green=allOrders.filter(function(o){return o.risk==='green';}).length;

  el.innerHTML='<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">'
    +'<span style="font-size:12px;font-weight:600;color:var(--text-sec);margin-right:4px">订单状态：</span>'
    +'<span class="prg-risk-pill '+(currentStatusFilter==='进行中'?'active':'')+'" onclick="window._prgFilterStatus(\'进行中\')" style="cursor:pointer;background:'+(currentStatusFilter==='进行中'?'var(--primary)':'var(--primary-bg)')+';color:'+(currentStatusFilter==='进行中'?'#fff':'var(--primary)')+';border:1px solid var(--primary)">进行中 ('+inProgress+')</span>'
    +'<span class="prg-risk-pill '+(currentStatusFilter==='已关闭'?'active':'')+'" onclick="window._prgFilterStatus(\'已关闭\')" style="cursor:pointer;background:'+(currentStatusFilter==='已关闭'?'var(--text-muted)':'var(--border-light)')+';color:'+(currentStatusFilter==='已关闭'?'#fff':'var(--text-sec)')+';border:1px solid var(--border)">已关闭 ('+closed+')</span>'
    +'<span class="prg-risk-pill '+(currentStatusFilter==='全部'?'active':'')+'" onclick="window._prgFilterStatus(\'全部\')" style="cursor:pointer;background:'+(currentStatusFilter==='全部'?'var(--text)':'var(--bg)')+';color:'+(currentStatusFilter==='全部'?'#fff':'var(--text-sec)')+';border:1px solid var(--border)">全部 ('+projOrders.length+')</span>'
    +'</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
    +'<span style="font-size:12px;font-weight:600;color:var(--text-sec);margin-right:4px">风险筛选：</span>'
    +'<span class="prg-risk-pill '+(currentRiskFilter==='all'?'active':'')+'" onclick="window._prgFilterRisk(\'all\')" style="cursor:pointer">全部 ('+allOrders.length+')</span>'
    +'<span class="prg-risk-pill danger '+(currentRiskFilter==='red'?'active':'')+'" onclick="window._prgFilterRisk(\'red\')" style="cursor:pointer;background:'+riskBg.red+';color:'+riskColor.red+';border:1px solid '+riskColor.red+'">🔴 红风险 ('+red+')</span>'
    +'<span class="prg-risk-pill '+(currentRiskFilter==='yellow'?'active':'')+'" onclick="window._prgFilterRisk(\'yellow\')" style="cursor:pointer;background:'+riskBg.yellow+';color:'+riskColor.yellow+';border:1px solid '+riskColor.yellow+'">🟡 黄风险 ('+yellow+')</span>'
    +'<span class="prg-risk-pill '+(currentRiskFilter==='green'?'active':'')+'" onclick="window._prgFilterRisk(\'green\')" style="cursor:pointer;background:'+riskBg.green+';color:'+riskColor.green+';border:1px solid '+riskColor.green+'">🟢 绿风险 ('+green+')</span>'
    +'</div>';
}

window._prgFilterRisk = function(risk){
  currentRiskFilter = currentRiskFilter===risk?'all':risk;
  loadOrders();
};

window._prgFilterStatus = function(status){
  currentStatusFilter = status;
  loadOrders();
};

// ── 订单明细表（参考V1.8的renderOrderTable） ──
function renderOrderTable(os){
  var el=document.getElementById('prgOrderDetail');
  if(!el) return;
  var rows = os.map(function(o){
    var p=metadata(o.projectId);
    var undelivered=o.qty-o.delivered;
    var gap=Math.max(undelivered-o.available-o.completable,0);
    var usable=usableStock(o);
    var hold=holdStock(o);
    var orderAmount=o.qty*(p?p.unitPrice:0);
    return '<tr>'
      +'<td>'+toneBadge(o.risk)+'</td>'
      +'<td style="font-weight:600;color:var(--primary)">'+o.no+'</td>'
      +'<td><div class="cell-main">'+(p?p.id:'')+'</div><div class="cell-sub" style="font-size:10px;color:var(--text-muted)">'+(p?p.name:'')+'</div></td>'
      +'<td>'+(p?p.bg:'')+'</td>'
      +'<td>'+(p?p.customer:'')+'</td>'
      +'<td><div>'+(p?p.model:'')+'</div><div class="cell-sub" style="font-size:10px;color:var(--text-muted)">'+(p?p.material:'')+'</div></td>'
      +'<td>'+o.demandDate+'</td>'
      +'<td style="'+(o.promiseDate>o.demandDate?'color:var(--danger);font-weight:600':'')+'">'+o.promiseDate+(o.promiseDate>o.demandDate?' ⚠':'')+'</td>'
      +'<td class="number">'+fmt(o.qty)+'</td>'
      +'<td class="number" style="color:var(--success);font-weight:600">'+fmt(o.delivered)+'</td>'
      +'<td class="number" style="color:'+(undelivered>0?'var(--warning)':'var(--text-muted)')+';font-weight:600">'+fmt(undelivered)+'</td>'
      +'<td class="number">'+fmt(usable)+'</td>'
      +'<td class="number">'+fmt(o.available)+'</td>'
      +'<td class="number" style="color:'+(hold>0?'var(--warning)':'var(--text-muted)')+'">'+fmt(hold)+'</td>'
      +'<td class="number" style="color:'+(gap>0?'var(--danger)':'var(--success)')+';font-weight:700">'+fmt(gap)+'</td>'
      +'<td class="number" style="color:'+(o.overdue>0?'var(--danger)':'var(--success)')+';font-weight:'+(o.overdue>0?'700':'400')+'">'+fmt(o.overdue)+'</td>'
      +'<td><span class="cl-pill" style="background:'+(o.status==='进行中'?'var(--primary-bg)':'var(--border-light)')+';color:'+(o.status==='进行中'?'var(--primary)':'var(--text-muted)')+'">'+o.status+'</span></td>'
      +'<td><span style="font-size:10px;color:var(--text-muted)">'+o.node+'</span></td>'
      +'</tr>';
  }).join('');

  el.innerHTML =
    '<div class="chart-card" style="margin-bottom:0">'
    +'<div class="card-header"><h3><i class="fas fa-list"></i> 订单履约明细</h3><span style="font-size:11px;color:var(--text-muted)">共'+os.length+'个订单 · 按风险状态排序</span></div>'
    +'<div class="card-body" style="padding:0;overflow-x:auto">'
    +'<table class="prg-order-table">'
    +'<thead><tr>'
    +'<th>风险状态</th><th>订单号</th><th>所属项目</th><th>BG</th><th>客户</th><th>产品型号 / 成品料号</th>'
    +'<th>需求交期</th><th>承诺交期</th><th class="number">订单数量</th><th class="number">已交付量</th>'
    +'<th class="number">未交付量</th><th class="number">可用库存量</th><th class="number">库存可满足量</th><th class="number">Hold冻结</th>'
    +'<th class="number">承诺缺口量</th><th class="number">超期量</th><th>订单状态</th><th>风险节点</th>'
    +'</tr></thead><tbody>'
    + (rows || '<tr><td colspan="18" style="text-align:center;padding:30px;color:var(--text-muted)">当前筛选范围内无订单数据</td></tr>')
    +'</tbody></table>'
    +'</div></div>';
}

// ═══════════════ Tab切换 ═══════════════
window._prgSwitchTab = function(tabId){
  var panels = document.querySelectorAll('.prg-tab-panel');
  var tabs = document.querySelectorAll('.prg-tab');
  panels.forEach(function(p){ p.style.display = 'none'; });
  tabs.forEach(function(t){
    t.classList.remove('active');
    t.style.color = 'var(--text-muted)';
    t.style.borderBottomColor = 'transparent';
  });
  var panel = document.getElementById('prg-tab-'+tabId);
  if(panel) panel.style.display = 'block';
  var activeTab = document.querySelector('.prg-tab[data-prgtab="'+tabId+'"]');
  if(activeTab){
    activeTab.classList.add('active');
    activeTab.style.color = 'var(--primary)';
    activeTab.style.borderBottomColor = 'var(--primary)';
  }
  if(tabId === 'npi' && !window._prgNpiInited){
    window._prgNpiInited = true;
    var npiContainer = document.getElementById('prg-npi-container');
    if(npiContainer){
      npiContainer.innerHTML =
        '<div class="npi-cards" id="npiCards"></div>'
        + '<div class="npi-pipeline-panel"><div class="npi-stage-head"><span class="npi-pipeline-panel-title">项目物料进度百分比</span></div><div class="npi-pipeline" id="npiPipeline"></div></div>'
        + '<div class="npi-risk-panel"><div class="npi-risk-panel-header"><span class="npi-risk-panel-title">风险标签命中分布</span><span id="npiDistFilterHint" style="font-size:11px;color:var(--primary);display:none;">已筛选 · 点击标签取消</span></div><div class="npi-risk-categories" id="npiRiskDist"></div></div>'
        + '<div class="npi-table-panel"><div class="npi-table-head"><span class="npi-table-title">物料全链路明细状态</span><span id="npiTableCount" style="font-size:11px;color:var(--text-muted)"></span></div><div class="npi-table-wrap"><table><thead id="npiTHead"></thead><tbody id="npiTBody"></tbody></table></div></div>';
      if(typeof initPage_material === 'function'){
        setTimeout(function(){ initPage_material(); }, 50);
      }
    }
  }
  if(tabId === 'npi' && window._prgNpiInited){
    // 切回NPI时刷新数据（项目可能已切换）
    if(typeof initPage_material === 'function') initPage_material();
  }
};

window.renderProgressPage = renderProgressPage;
window.initPage_progress = renderProgressPage;

})();
registerModule('progress', renderProgressPage);
