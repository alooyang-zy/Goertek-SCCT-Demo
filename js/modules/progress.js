// Module: progress — 履约跟踪 v10.0 (订单履约跟踪 + NPI物料跟踪)
(function(){
"use strict";

// ═══════════════ 数据生成 ═══════════════
function hashStr(str){var h=5381;for(var i=0;i<str.length;i++)h=((h<<5)+h)+str.charCodeAt(i);return (h>>>0);}
function sRand(seed,min,max,decimal){var s=seed;s=(s*1664525+1013904223)&0xffffffff;var r=(s>>>0)/0xffffffff;var v=min+r*(max-min);return decimal?parseFloat(v.toFixed(decimal)):Math.round(v);}

var _orderCache = {};
function getOrders(pid){
  if(_orderCache[pid]) return _orderCache[pid];
  var p = projects.find(function(x){return x.id===pid;});
  if(!p) return [];
  var seed = hashStr(pid);
  var isNPI = p.lifecycleRaw==='NPI', isRamp = p.lifecycleRaw==='Ramp-up';
  var perfMod = isNPI?0.82:isRamp?0.91:0.96;

  // 风险标签池
  var riskPool = [
    {tag:'缺料风险',color:'danger',desc:'关键物料齐套率<85%'},
    {tag:'交期风险',color:'warning',desc:'承诺交期晚于客户需求'},
    {tag:'质量风险',color:'danger',desc:'IQC或FQC不合格率偏高'},
    {tag:'产能瓶颈',color:'warning',desc:'产线利用率>95%'},
    {tag:'物流延误',color:'warning',desc:'干线运输延迟>2天'},
    {tag:'需求变更',color:'info',desc:'客户PO变更未关闭'},
    {tag:'EOL呆滞',color:'danger',desc:'成品/物料库龄超期'},
    {tag:'单源风险',color:'danger',desc:'关键料号单源供应'}
  ];

  var orderCount = 8 + Math.floor(sRand(seed,0,8));
  var orders = [];
  for(var i=0;i<orderCount;i++){
    var s = seed + i*997;
    var qty = sRand(s, 500, 50000);
    var delivered = Math.round(qty * (0.5 + sRand(s+1,0,0.5,2)) * perfMod);
    var otd = sRand(s+2, Math.round(75*perfMod), 99, 1);
    var statusRoll = sRand(s+3,1,100);
    var status, statusColor, progress;
    if(delivered>=qty){status='已交付';statusColor='success';progress=100;}
    else if(delivered>qty*0.8){status='交付中';statusColor='primary';progress=Math.round(delivered/qty*100);}
    else if(delivered>qty*0.3){status='生产中';statusColor='warning';progress=Math.round(delivered/qty*100);}
    else{status='待生产';statusColor='text-muted';progress=Math.round(delivered/qty*100);}

    var hasRisk = sRand(s+4,1,100) > (perfMod*100-10);
    var riskTag = hasRisk ? riskPool[sRand(s+5,0,riskPool.length-1)] : null;
    var riskLevel = 'normal';
    if(riskTag){
      riskLevel = riskTag.color==='danger'?'danger':'warning';
    }
    var customerPO = 'PO-' + p.customer.substring(0,2).toUpperCase() + '-' + String(sRand(s+6,10000,99999));
    var soNum = 'SO-' + pid.replace(/\D/g,'') + '-' + String(i+1).padStart(2,'0');
    var reqDate = '2026-06-' + String(sRand(s+7,5,28)).padStart(2,'0');
    var commitDate = sRand(s+8,1,100) > 80 ? '2026-06-' + String(sRand(s+9,28,30)).padStart(2,'0') : reqDate;
    var isLate = commitDate > reqDate;
    var lineItems = 1 + Math.floor(sRand(s+10,0,4));
    var materials = ['主板组件','显示屏模组','电池模组','外壳组件','声学模组','FPC排线','螺丝包'];
    var lineData = [];
    for(var j=0;j<lineItems;j++){
      var ls = s + j*131;
      lineData.push({
        lineNo: j+1,
        material: materials[sRand(ls,0,materials.length-1)],
        reqQty: sRand(ls+1,100,5000),
        readyQty: sRand(ls+2,0,100,2),
        kitStatus: sRand(ls+3,1,100)>85?'齐套':sRand(ls+4,1,100)>60?'部分齐套':'缺料',
        supplier: ['联发科','ADI','歌尔微','ATL','蓝思','立讯','鹏鼎'][sRand(ls+5,0,6)],
        eta: '2026-06-' + String(sRand(ls+6,10,28)).padStart(2,'0')
      });
    }
    orders.push({
      idx:i, soNum:soNum, customerPO:customerPO, customer:p.customer,
      product:p.productLine, qty:qty, delivered:delivered, unit:'PCS',
      status:status, statusColor:statusColor, progress:progress,
      reqDate:reqDate, commitDate:commitDate, isLate:isLate,
      otd:otd, riskTag:riskTag, riskLevel:riskLevel,
      lines:lineData, potentialLoss: hasRisk ? sRand(s+11,20,500) : 0
    });
  }
  _orderCache[pid] = orders;
  return orders;
}

// ═══════════════ 状态 ═══════════════
var _phCollapsed={};

// ═══════════════ 入口 ═══════════════
function renderProgressPage(){
  var fp=getFilteredProjects();
  var sel=document.getElementById('progressProjectSelect');
  if(sel){var cur=sel.value;
    sel.innerHTML=fp.map(function(p){return '<option value="'+p.id+'">'+p.name+' ['+p.bg+'·'+p.customer+']</option>'}).join('');
    if(cur&&fp.some(function(p){return p.id==cur}))sel.value=cur;
    else if(fp.length)sel.value=fp[0].id;
  }
  consumeDrillDown('progressProjectSelect');
  var pid=sel?sel.value:'';
  var proj=pid?fp.find(function(p){return p.id==pid}):null;
  if(!proj&&fp.length){proj=fp[0];if(sel)sel.value=proj.id;}
  if(proj) loadProject(proj);
}

function loadProject(proj){
  if(!proj)return;
  // 项目信息条
  var info=document.getElementById('prgHeroInfo');
  if(info){
    info.innerHTML='<span style="font-weight:700;color:var(--primary)">'+proj.name+'</span>'
      +' · 客户：<b>'+proj.customer+'</b>'
      +' · BG：<b>'+proj.bg+'</b>'
      +' · 产品线：<b>'+proj.productLine+'</b>'
      +' · 阶段：<b>'+proj.engStage+'</b>'
      +' · 生命周期：<b>'+proj.lifecycle+'</b>';
  }
  var orders = getOrders(proj.id);
  renderOrderKpi(orders, proj);
  renderRiskTags(orders);
  renderOrderDetail(orders);
}

// ── KPI指标卡 ──
function renderOrderKpi(orders, proj){
  var el=document.getElementById('prgOrderKpi');
  if(!el) return;
  var total=orders.length;
  var delivered=orders.filter(function(o){return o.status==='已交付';}).length;
  var inProgress=orders.filter(function(o){return o.status==='交付中'||o.status==='生产中';}).length;
  var waiting=orders.filter(function(o){return o.status==='待生产';}).length;
  var riskOrders=orders.filter(function(o){return o.riskTag;}).length;
  var avgOtd=Math.round(orders.reduce(function(s,o){return s+o.otd;},0)/total*10)/10;
  var totalQty=orders.reduce(function(s,o){return s+o.qty;},0);
  var deliveredQty=orders.reduce(function(s,o){return s+o.delivered;},0);
  var fulfillmentRate=Math.round(deliveredQty/totalQty*100*10)/10;
  var lateOrders=orders.filter(function(o){return o.isLate;}).length;

  el.innerHTML=[
    {l:'订单总数',v:total,sub:'已交付'+delivered+' · 交付中'+inProgress+' · 待生产'+waiting,c:'blue',ic:'fa-clipboard-list'},
    {l:'履约完成率',v:fulfillmentRate+'%',sub:'已交付'+deliveredQty.toLocaleString()+' / 总量'+totalQty.toLocaleString()+' PCS',c:'green',ic:'fa-circle-check'},
    {l:'平均OTD',v:avgOtd+'%',sub:(avgOtd>=90?'✅ 达标':'⚠️ 低于90%目标'),c:avgOtd>=90?'green':'amber',ic:'fa-truck-fast'},
    {l:'风险订单',v:riskOrders,sub:'占总订单'+Math.round(riskOrders/total*100)+'%',c:riskOrders>0?'red':'green',ic:'fa-triangle-exclamation'},
    {l:'交期延迟',v:lateOrders,sub:'承诺晚于需求日期',c:lateOrders>0?'amber':'green',ic:'fa-clock'},
    {l:'潜在损失',v:'¥'+orders.reduce(function(s,o){return s+o.potentialLoss;},0)+'万',sub:'风险订单预估损失',c:'red',ic:'fa-coins'}
  ].map(function(k){
    var color='var(--'+(k.c==='blue'?'primary':k.c===''?'primary':k.c)+')';
    return '<div class="prg-ov-card '+k.c+'"><div style="display:flex;justify-content:space-between;align-items:center"><div class="prg-ov-label">'+k.l+'</div><i class="fas '+k.ic+'" style="color:'+color+';font-size:14px"></i></div><div class="prg-ov-value">'+k.v+'</div><div class="prg-ov-sub">'+k.sub+'</div></div>';
  }).join('');
}

// ── 风险订单标签 ──
function renderRiskTags(orders){
  var el=document.getElementById('prgOrderRiskTags');
  if(!el) return;
  var riskOrders=orders.filter(function(o){return o.riskTag;});
  if(!riskOrders.length){
    el.innerHTML='<div style="padding:14px;background:var(--success-bg);border:1px solid var(--success);border-radius:8px;display:flex;align-items:center;gap:8px;margin-bottom:14px"><i class="fas fa-circle-check" style="color:var(--success)"></i><span style="color:var(--success);font-weight:600">当前项目无风险订单</span></div>';
    return;
  }
  // 按风险类型分组统计
  var tagMap={};
  riskOrders.forEach(function(o){
    if(!o.riskTag) return;
    if(!tagMap[o.riskTag.tag]) tagMap[o.riskTag.tag]={count:0,color:o.riskTag.color,desc:o.riskTag.desc,orders:[]};
    tagMap[o.riskTag.tag].count++;
    tagMap[o.riskTag.tag].orders.push(o.soNum);
  });
  el.innerHTML='<div style="padding:14px;background:var(--danger-bg);border:1px solid var(--danger);border-radius:8px;margin-bottom:14px">'
    +'<div style="font-weight:700;color:var(--danger);margin-bottom:10px;font-size:13px"><i class="fas fa-triangle-exclamation"></i> 风险订单标签（'+riskOrders.length+'个风险订单）</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
    +Object.keys(tagMap).map(function(tag){
      var t=tagMap[tag];
      return '<span class="prg-risk-pill '+t.color+'" onclick="window._prgFilterRisk(\''+tag+'\')" style="cursor:pointer">'+tag+' ('+t.count+')</span>';
    }).join('')
    +'</div></div>';
}

window._prgFilterRisk = function(tag){
  var rows = document.querySelectorAll('#prgOrderDetail table tbody tr');
  rows.forEach(function(r){
    if(r.dataset.risk===tag || tag==='') r.style.display='';
    else r.style.display='none';
  });
};

// ── 订单明细行 ──
function renderOrderDetail(orders){
  var el=document.getElementById('prgOrderDetail');
  if(!el) return;
  el.innerHTML =
    '<div class="chart-card" style="margin-bottom:0">'
    +'<div class="card-header"><h3><i class="fas fa-list"></i> 订单履约明细</h3><span style="font-size:11px;color:var(--text-muted)">共'+orders.length+'个订单 · 点击行展开明细</span></div>'
    +'<div class="card-body" style="padding:0;overflow-x:auto">'
    +'<table class="prg-order-table">'
    +'<thead><tr>'
    +'<th>SO号</th><th>客户PO</th><th>客户</th><th>产品</th><th>订单量</th><th>已交付</th><th>进度</th><th>需求日期</th><th>承诺日期</th><th>OTD</th><th>状态</th><th>风险标签</th>'
    +'</tr></thead><tbody>'
    + orders.map(function(o){
      var lateMark = o.isLate?'<span style="color:var(--danger);font-weight:700">⚠ '+o.commitDate+'</span>':o.commitDate;
      var riskBadge = o.riskTag?'<span class="cl-pill" style="background:var(--'+o.riskTag.color+'-bg);color:var(--'+o.riskTag.color+')">'+o.riskTag.tag+'</span>':'<span style="color:var(--success)">✓</span>';
      var progressColor = o.progress===100?'var(--success)':o.progress>=60?'var(--primary)':o.progress>=30?'var(--warning)':'var(--danger)';
      return '<tr class="prg-order-row" data-risk="'+(o.riskTag?o.riskTag.tag:'')+'" onclick="window._prgToggleOrder('+o.idx+')">'
        +'<td style="font-weight:600;color:var(--primary)">'+o.soNum+'</td>'
        +'<td>'+o.customerPO+'</td>'
        +'<td>'+o.customer+'</td>'
        +'<td>'+o.product+'</td>'
        +'<td>'+o.qty.toLocaleString()+'</td>'
        +'<td>'+o.delivered.toLocaleString()+'</td>'
        +'<td><div style="display:flex;align-items:center;gap:6px"><div style="width:60px;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="width:'+o.progress+'%;height:100%;background:'+progressColor+';border-radius:3px"></div></div><span style="font-size:10px;color:var(--text-muted)">'+o.progress+'%</span></div></td>'
        +'<td>'+o.reqDate+'</td>'
        +'<td>'+lateMark+'</td>'
        +'<td><span style="font-weight:700;color:'+(o.otd>=90?'var(--success)':o.otd>=80?'var(--warning)':'var(--danger)')+'">'+o.otd+'%</span></td>'
        +'<td><span class="cl-pill" style="background:var(--'+o.statusColor+'-bg);color:var(--'+o.statusColor+')">'+o.status+'</span></td>'
        +'<td>'+riskBadge+'</td>'
        +'</tr>'
        +'<tr class="prg-order-expand" id="prg-expand-'+o.idx+'" style="display:none">'
        +'<td colspan="12" style="padding:0;background:var(--bg)">'
        +'<div style="padding:12px 20px">'
        +'<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:8px">📋 行项目明细（'+o.lines.length+'行）</div>'
        +'<table class="prg-line-table"><thead><tr><th>行号</th><th>物料</th><th>需求量</th><th>齐套率</th><th>齐套状态</th><th>供应商</th><th>预计到货</th></tr></thead><tbody>'
        +o.lines.map(function(l){
          var kitColor = l.kitStatus==='齐套'?'var(--success)':l.kitStatus==='部分齐套'?'var(--warning)':'var(--danger)';
          return '<tr><td>'+l.lineNo+'</td><td style="font-weight:600">'+l.material+'</td><td>'+l.reqQty.toLocaleString()+'</td><td><span style="color:'+kitColor+';font-weight:700">'+l.readyQty+'%</span></td><td><span class="cl-pill" style="background:'+kitColor+'20;color:'+kitColor+'">'+l.kitStatus+'</span></td><td>'+l.supplier+'</td><td>'+l.eta+'</td></tr>';
        }).join('')
        +'</tbody></table>'
        +(o.riskTag?'<div style="margin-top:10px;padding:8px 12px;background:var(--'+o.riskTag.color+'-bg);border-radius:6px;font-size:11px;color:var(--'+o.riskTag.color+')"><b>⚠️ '+o.riskTag.tag+'</b>：'+o.riskTag.desc+' · 潜在损失¥'+o.potentialLoss+'万</div>':'')
        +'</div></div></td></tr>';
    }).join('')
    +'</tbody></table>'
    +'</div></div>';
}

window._prgToggleOrder = function(idx){
  var row = document.getElementById('prg-expand-'+idx);
  if(row) row.style.display = row.style.display==='none'?'table-row':'none';
};

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
        '<div class="filter-bar" style="gap:0">'
        + '<div class="filter-group"><label>项目:</label><select id="materialProjectSelect" onchange="initPage_material()"></select></div>'
        + '<span id="npiInfoInline" style="font-size:11px;color:var(--text-sec);display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-left:14px"></span>'
        + '</div>'
        + '<div class="npi-cards" id="npiCards"></div>'
        + '<div class="npi-pipeline-panel"><div class="npi-stage-head"><span class="npi-pipeline-panel-title">项目物料进度百分比</span></div><div class="npi-pipeline" id="npiPipeline"></div></div>'
        + '<div class="npi-risk-panel"><div class="npi-risk-panel-header"><span class="npi-risk-panel-title">风险标签命中分布</span><span id="npiDistFilterHint" style="font-size:11px;color:var(--primary);display:none;">已筛选 · 点击标签取消</span></div><div class="npi-risk-categories" id="npiRiskDist"></div></div>'
        + '<div class="npi-table-panel"><div class="npi-table-head"><span class="npi-table-title">物料全链路明细状态</span><span id="npiTableCount" style="font-size:11px;color:var(--text-muted)"></span></div><div class="npi-table-wrap"><table><thead id="npiTHead"></thead><tbody id="npiTBody"></tbody></table></div></div>';
      if(typeof initPage_material === 'function'){
        setTimeout(function(){ initPage_material(); }, 50);
      }
    }
  }
};

window.renderProgressPage = renderProgressPage;
window.initPage_progress = renderProgressPage;

})();
registerModule('progress', renderProgressPage);
