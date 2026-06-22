// Module: sandtable — 项目全景沙盘（歌尔SCCT全链路全景）
// 参考《沙盘demo》全流程项目沙盘，改造为歌尔供应链控制塔项目全链路全景
(function(){
"use strict";

/* ════════════════════════════════════════════════
   1. 沙盘流程配置（5阶段·30节点·全链路供应链）
   ════════════════════════════════════════════════ */
const stageTitles = [
  "1 需求→订单",
  "2 计划→备料",
  "3 采购→入库",
  "4 生产→成品",
  "5 物流→客户"
];

const nodes = [
  { id:"n11", col:1, row:1, label:"1.1 客户预测", metric:"预测准确率 91.2%" },
  { id:"n12", col:1, row:2, label:"1.2 交期承诺", metric:"ATP达成 94.5%" },
  { id:"n13", col:1, row:4, label:"1.3 客户PO", metric:"今日：2,012单", current:true },
  { id:"n14", col:1, row:5, label:"1.4 销售SO", metric:"登记：3,048单", current:true },

  { id:"n21", col:2, row:1, label:"2.1 S&OP计划", metric:"计划达成率 92.6%" },
  { id:"n22", col:2, row:2, label:"2.2 主生产计划", metric:"MPS达成 90.3%" },
  { id:"n23", col:2, row:3, label:"2.3 MDS主需求", metric:"需求变动 8.4%" },
  { id:"n24", col:2, row:5, label:"2.4 物料计划", metric:"MRP建议 588条" },
  { id:"n25", col:2, row:6, label:"2.5 齐套检查", metric:"齐套率 82.4%", current:true },

  { id:"n31", col:3, row:1, label:"3.1 采购订单", metric:"逾期PO 18单" },
  { id:"n32", col:3, row:2, label:"3.2 供方协同", metric:"供方回复 74/91" },
  { id:"n33", col:3, row:3, label:"3.3 供方库存", metric:"供应缺口 4,800pcs", variant:"stock", x:74 },
  { id:"n34", col:3, row:3, label:"3.4 要货计划", metric:"ASN响应 86.0%" },
  { id:"n35", col:3, row:4, label:"3.5 到货接收", metric:"待收 31批次" },
  { id:"n36", col:3, row:5, label:"3.6 检验入库", metric:"IQC超期 6批" },
  { id:"n37", col:3, row:6, label:"3.7 材料在库", metric:"安全缺口 4,800pcs", variant:"inventory" },

  { id:"n41", col:4, row:1, label:"4.1 生产工单", metric:"未关闭 26单" },
  { id:"n42", col:4, row:2, label:"4.2 物料配送", metric:"缺料配送 14单" },
  { id:"n43", col:4, row:3, label:"4.3 生产在制", metric:"WIP超期 9单" },
  { id:"n44", col:4, row:4, label:"4.4 半成品库存", metric:"半成品积压 820pcs", variant:"stock", x:-82 },
  { id:"n45", col:4, row:4, label:"4.5 质量检验", metric:"FQC待检 12批", x:22 },
  { id:"n46", col:4, row:5, label:"4.6 完工入库", metric:"完工：2,880pcs" },
  { id:"n47", col:4, row:6, label:"4.7 成品在库", metric:"库存：3,000pcs", variant:"inventory" },

  { id:"n51", col:5, row:1, label:"5.1 发货指令", metric:"发放：2,835pcs" },
  { id:"n52", col:5, row:2, label:"5.2 出货拣配", metric:"拣配未完 21单" },
  { id:"n53", col:5, row:3, label:"5.3 报关/订舱", metric:"订舱及时率 88.5%" },
  { id:"n54", col:5, row:4, label:"5.4 发运离厂", metric:"出库：2,750pcs" },
  { id:"n55", col:5, row:4, label:"5.5 在途库存", metric:"在途：800pcs", variant:"stock", x:-86 },
  { id:"n56", col:5, row:5, label:"5.6 客户签收", metric:"签收：2,500pcs" },
  { id:"n57", col:5, row:6, label:"5.7 售后退换", metric:"RMA关闭 96.4%" }
];

const metricsByNodeId = {
  n11:[{label:"客户预测总量",value:"18,420"},{label:"预测准确率",value:"91.2%"},{label:"预测波动率",value:"7.6%"}],
  n12:[{label:"已承诺需求数量",value:"1,486"},{label:"ATP答复及时率",value:"96.1%"},{label:"ATP承诺达成率",value:"94.5%"}],
  n13:[{label:"客户PO总数量",value:"2,012"},{label:"客户PO落单率",value:"98.6%"}],
  n14:[{label:"销售SO总数量",value:"3,048"},{label:"超期未关SO数量",value:"37"},{label:"SO积压率",value:"3.8%"}],
  n21:[{label:"S&OP计划产量",value:"19,800"},{label:"S&OP计划达成率",value:"92.6%"}],
  n22:[{label:"MPS计划产量",value:"18,960"},{label:"MPS达成率",value:"90.3%"},{label:"MPS计划波动率",value:"6.8%"}],
  n23:[{label:"MDS总需求量",value:"21,240"},{label:"MDS需求变动率",value:"8.4%"},{label:"预测冲销异常率",value:"2.7%"}],
  n24:[{label:"长交期关键料缺口数",value:"4,800"},{label:"MRP建议执行率",value:"88.7%"},{label:"PR转PO及时率",value:"86.9%"}],
  n25:[{label:"工单齐套率",value:"82.4%"},{label:"欠料平均等待天数",value:"3.6d"},{label:"紧急采购单占比",value:"14.8%"}],
  n31:[{label:"超期未下达PO数",value:"18"},{label:"采购订单下达及时率",value:"88.4%"},{label:"供应商交期确认率",value:"74.2%"}],
  n32:[{label:"逾期未到货PO数量",value:"21"},{label:"供应商准时交货率",value:"86.5%"},{label:"供应商LT达成率",value:"83.7%"}],
  n34:[{label:"要货计划总数量",value:"1,276"},{label:"ASN创建数量",value:"1,084"},{label:"送货计划平均响应时效",value:"4.2h"}],
  n35:[{label:"到料批次数总数",value:"318"},{label:"逾期未到货批次数",value:"31"},{label:"收货及时率",value:"89.6%"}],
  n36:[{label:"IQC待检批数",value:"46"},{label:"超期未检批数",value:"6"},{label:"IQC检验及时率",value:"91.8%"}],
  n37:[{label:"安全库存缺口数",value:"4,800"},{label:"材料库存周转天数",value:"18.6d"},{label:"呆滞物料占比",value:"6.4%"}],
  n41:[{label:"未关闭工单数量",value:"26"},{label:"日生产排程达成率",value:"91.5%"}],
  n42:[{label:"计划配送总单数",value:"412"},{label:"缺料未配送积压单数",value:"14"},{label:"物料配送及时率",value:"89.2%"},{label:"配送准确率",value:"96.8%"}],
  n43:[{label:"在制工单总数量",value:"522"},{label:"工单准时完工率",value:"87.4%"},{label:"在制品周转天数",value:"4.8d"},{label:"WIP停留超期率",value:"9.1%"}],
  n45:[{label:"FQC完工待检总量",value:"128"},{label:"不合格数量",value:"9"},{label:"超期未检积压量",value:"12"},{label:"返工/返修率",value:"3.2%"}],
  n46:[{label:"当日完工数量",value:"2,880"},{label:"已入库数量",value:"2,740"},{label:"超期未入库积压量",value:"140"}],
  n47:[{label:"工单关闭率",value:"94.8%"},{label:"成品库存总量",value:"3,000"},{label:"成品库存周转天数",value:"9.5d"},{label:"成品呆滞率",value:"2.1%"},{label:"可发成品占比",value:"83.4%"}],
  n51:[{label:"发货计划总数量",value:"2,835"},{label:"超期未确认发货单数",value:"17"},{label:"发货计划达成率",value:"93.2%"}],
  n52:[{label:"拣配平均完成时效",value:"5.6h"},{label:"拣货准确率",value:"97.4%"},{label:"出货及时率",value:"91.1%"}],
  n53:[{label:"报关平均时效",value:"10.4h"},{label:"报关及时率",value:"90.6%"},{label:"订舱及时率",value:"88.5%"}],
  n54:[{label:"计划发运总数量",value:"2,750"},{label:"当日未完成发运数量",value:"48"}],
  n56:[{label:"已签收单数",value:"2,500"},{label:"超期未签收单数",value:"36"}],
  n57:[{label:"RMA申请数量",value:"42"},{label:"已接收待处理数量",value:"11"},{label:"RMA及时关闭率",value:"96.4%"}]
};

const nodesWithMetrics = nodes.map(function(n){ return Object.assign({}, n, { metrics: metricsByNodeId[n.id] || [] }); });

const links = [
  {from:"n11",to:"n12",status:"normal"},{from:"n11",to:"n21",status:"normal"},
  {from:"n13",to:"n14",status:"normal"},{from:"n14",to:"n57",status:"normal"},
  {from:"n21",to:"n22",status:"normal"},{from:"n22",to:"n23",status:"normal"},
  {from:"n23",to:"n24",status:"normal"},{from:"n24",to:"n25",status:"alert"},
  {from:"n21",to:"n31",status:"normal"},{from:"n25",to:"n34",status:"alert"},
  {from:"n31",to:"n32",status:"alert"},{from:"n31",to:"n41",status:"normal"},
  {from:"n32",to:"n33",status:"alert"},{from:"n32",to:"n34",status:"normal"},
  {from:"n33",to:"n35",status:"alert"},{from:"n34",to:"n35",status:"alert"},
  {from:"n35",to:"n36",status:"alert"},{from:"n36",to:"n37",status:"alert"},
  {from:"n37",to:"n47",status:"normal"},{from:"n41",to:"n42",status:"normal"},
  {from:"n42",to:"n43",status:"alert"},{from:"n42",to:"n52",status:"normal"},
  {from:"n43",to:"n44",status:"alert"},{from:"n43",to:"n45",status:"normal"},
  {from:"n44",to:"n46",status:"alert"},{from:"n45",to:"n46",status:"normal"},
  {from:"n46",to:"n47",status:"normal"},{from:"n47",to:"n52",status:"normal"},
  {from:"n51",to:"n52",status:"normal"},{from:"n52",to:"n53",status:"alert"},
  {from:"n53",to:"n54",status:"normal"},{from:"n53",to:"n55",status:"alert"},
  {from:"n54",to:"n56",status:"normal"},{from:"n55",to:"n56",status:"alert"},
  {from:"n56",to:"n57",status:"alert"}
];

const nodeIconById = {
  n11:"trend",n12:"clock",n13:"doc",n14:"doc",
  n21:"calendar",n22:"calendar",n23:"list",n24:"box",n25:"shield",
  n31:"cart",n32:"users",n33:"warehouse",n34:"calendar",n35:"inbox",n36:"shield",n37:"warehouse",
  n41:"doc",n42:"truck",n43:"gear",n44:"warehouse",n45:"shield",n46:"inbox",n47:"warehouse",
  n51:"doc",n52:"box",n53:"doc",n54:"truck",n55:"truck",n56:"check",n57:"check"
};

const riskNodeIds = new Set(["n25","n31","n32","n33","n34","n35","n36","n37","n42","n43","n44","n52","n53","n55","n56","n57"]);
const riskKpiIds = new Set(["ots","plan","purchase","storage","production","settle"]);

const iconDefs = {
  trend:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M4 17h16"/><path d="M6 14l4-4 4 3 4-7"/><path d="M18 6h-4"/></svg>',
  clock:'<svg class="st-node-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
  doc:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M7 4h7l3 3v13H7z"/><path d="M14 4v4h4"/><path d="M9 12h6M9 16h5"/></svg>',
  calendar:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M5 6h14v13H5z"/><path d="M8 4v4M16 4v4M5 10h14"/></svg>',
  list:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M8 7h11M8 12h11M8 17h11"/><path d="M5 7h.1M5 12h.1M5 17h.1"/></svg>',
  box:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M5 8l7-4 7 4v8l-7 4-7-4z"/><path d="M5 8l7 4 7-4M12 12v8"/></svg>',
  cart:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M5 5h2l2 10h8l2-6H8"/><circle cx="10" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>',
  users:'<svg class="st-node-icon" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="16" cy="10" r="2.5"/><path d="M4 19c1-4 8-4 10 0"/><path d="M13 18c1-3 5-3 7 0"/></svg>',
  inbox:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="M5 13h4l2 3h2l2-3h4"/></svg>',
  shield:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M12 4l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V7z"/><path d="M9 12l2 2 4-5"/></svg>',
  gear:'<svg class="st-node-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2.1 2.1M15.4 15.4l2.1 2.1M17.5 6.5l-2.1 2.1M8.6 15.4l-2.1 2.1"/></svg>',
  truck:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M4 7h10v8H4z"/><path d="M14 10h4l2 3v2h-6z"/><circle cx="8" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>',
  check:'<svg class="st-node-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M8 12l3 3 5-6"/></svg>',
  warehouse:'<svg class="st-node-icon" viewBox="0 0 24 24"><path d="M4 10l8-5 8 5"/><path d="M6 10v9h12v-9"/><path d="M9 19v-5h6v5"/><path d="M8 12h8"/></svg>'
};

/* ════════════════════════════════════════════════
   2. 状态
   ════════════════════════════════════════════════ */
let stState = {
  pid: null,
  riskActive: false,
  rush: 42, sub: 35, overtime: 6
};

/* ════════════════════════════════════════════════
   3. KPI 配置（根据项目动态生成实际值）
   ════════════════════════════════════════════════ */
function buildKpis(d){
  // d = DS.get(pid) 返回的项目数据
  if(!d) return getDefaultKpis();
  var otsActual = (d.otsTotal||40) + '天';
  var otsTarget = (d.otsTarget||28) + '天';
  var otsGap = ((d.otsTotal||40) - (d.otsTarget||28));
  return [
    {id:"ots",title:"OTS周期",rank:"0",target:otsTarget,actual:otsActual,trend:"目标偏差 "+(otsGap>0?"+":"")+otsGap.toFixed(1)+"天"},
    {id:"sales",title:"销售",rank:"1",target:"98.5%",actual:(d.otd||95)+"%",trend:"订单承诺偏差 "+Math.abs((d.otd||95)-98.5).toFixed(1)+"%"},
    {id:"plan",title:"计划",rank:"2",target:"220h",actual:(220+Math.round(otsGap*2))+"h",trend:"MPS延迟 "+(otsGap*2).toFixed(1)+"h"},
    {id:"purchase",title:"采购",rank:"3",target:"96.0%",actual:(d.kitRate||88)+"%",trend:"PO逾期 "+Math.round((100-(d.kitRate||88))*0.4)+"单"},
    {id:"storage",title:"仓储",rank:"4",target:"72h",actual:(72+Math.round(otsGap*1.5))+"h",trend:"周转增加 "+(otsGap*1.5).toFixed(1)+"h"},
    {id:"production",title:"生产",rank:"5",target:"12h",actual:(12+Math.round(otsGap*0.2))+"h",trend:"在制等待 "+(otsGap*0.2).toFixed(1)+"h"},
    {id:"logistics",title:"物流",rank:"6",target:"72h",actual:"66.5h",trend:"运输提前 3.0h"},
    {id:"settle",title:"结算",rank:"7",target:"3.5d",actual:(3.5+Math.round(otsGap*0.08))+"d",trend:"签收回传延迟 "+(otsGap*0.08).toFixed(1)+"d"}
  ];
}
function getDefaultKpis(){
  return [
    {id:"ots",title:"OTS周期",rank:"0",target:"14.0天",actual:"16.0天",trend:"月环比增加 2.0天"},
    {id:"sales",title:"销售",rank:"1",target:"98.5%",actual:"96.8%",trend:"订单承诺偏差 1.7%"},
    {id:"plan",title:"计划",rank:"2",target:"220h",actual:"240.8h",trend:"MPS延迟 12.2h"},
    {id:"purchase",title:"采购",rank:"3",target:"96.0%",actual:"88.4%",trend:"PO逾期 18单"},
    {id:"storage",title:"仓储",rank:"4",target:"72h",actual:"86.5h",trend:"周转增加 8.5h"},
    {id:"production",title:"生产",rank:"5",target:"12h",actual:"12.5h",trend:"在制等待 0.5h"},
    {id:"logistics",title:"物流",rank:"6",target:"72h",actual:"66.5h",trend:"运输提前 3.0h"},
    {id:"settle",title:"结算",rank:"7",target:"3.5d",actual:"4.1d",trend:"签收回传延迟 0.6d"}
  ];
}

/* ════════════════════════════════════════════════
   4. 推演计算
   ════════════════════════════════════════════════ */
function getSimulation(){
  var rush = stState.rush, sub = stState.sub, overtime = stState.overtime;
  var otsGain = rush*0.026 + sub*0.018 + overtime*0.11;
  var kitGain = rush*0.035 + sub*0.082;
  var deliveryGain = rush*0.067 + sub*0.025;
  var signGain = rush*0.03 + overtime*0.07;
  return {
    rush:rush, sub:sub, overtime:overtime,
    ots: Math.max(10.8, 16.8 - otsGain), otsGain: otsGain,
    kit: Math.min(98.6, 82.4 + kitGain), kitGain: kitGain,
    delivery: Math.min(98.8, 88.4 + deliveryGain), deliveryGain: deliveryGain,
    sign: Math.min(99.2, 91.2 + signGain), signGain: signGain,
    score: Math.min(99, Math.round(64 + rush*0.16 + sub*0.13 + overtime*0.6))
  };
}

function getAdjustedActual(kpi, plan){
  if(!stState.riskActive) return kpi.actual;
  var map = {
    ots: plan.ots.toFixed(1)+"天",
    plan: Math.max(220, 240.8 - plan.overtime*1.8).toFixed(1)+"h",
    purchase: plan.delivery.toFixed(1)+"%",
    storage: Math.max(72, 86.5 - plan.rush*0.09).toFixed(1)+"h",
    production: Math.max(11.2, 12.5 - plan.overtime*0.035).toFixed(1)+"h",
    settle: Math.max(3.2, 4.1 - plan.signGain*0.035).toFixed(1)+"d"
  };
  return map[kpi.id] || kpi.actual;
}

function getRiskTrend(kpi){
  var map = {
    ots:"红色预警：关键路径仍超目标",
    sales:"客户需求锁定，订单口径稳定",
    plan:"推演后计划等待下降",
    purchase:"加急采购正在回收风险",
    storage:"入库与配送节拍需压缩",
    production:"加班窗口可覆盖短缺批次",
    logistics:"干线运输保持可控",
    settle:"签收回传仍影响关闭"
  };
  return map[kpi.id];
}

/* ════════════════════════════════════════════════
   5. 渲染
   ════════════════════════════════════════════════ */
function renderAll(container){
  var d = stState.pid ? (window.DS ? DS.get(stState.pid) : null) : null;
  var kpis = buildKpis(d);
  var plan = getSimulation();
  renderKpis(container, kpis, plan);
  renderNodes(container);
  renderAlertSummary(container, d);
  renderWarnings(container);
  renderChangedMetrics(container, plan);
  requestAnimationFrame(function(){ drawConnectors(container); });
}

function renderKpis(container, kpis, plan){
  var html = kpis.map(function(kpi){
    var alert = stState.riskActive && riskKpiIds.has(kpi.id) ? " alert" : "";
    var actual = getAdjustedActual(kpi, plan);
    var trend = stState.riskActive ? getRiskTrend(kpi) : kpi.trend;
    return '<article class="st-kpi-card'+alert+'">'
      + '<div class="st-kpi-head"><strong>'+kpi.title+'</strong><span class="st-kpi-rank">'+kpi.rank+'</span></div>'
      + '<div class="st-kpi-body"><span>目标 <b>'+kpi.target+'</b></span><span>实际 <b>'+actual+'</b></span></div>'
      + '<div class="st-kpi-trend">'+trend+'</div>'
      + '</article>';
  }).join("");
  var el = container.querySelector("#stKpiStrip");
  if(el) el.innerHTML = html;
}

function renderNodes(container){
  var hasProject = !!stState.pid;
  var html = nodesWithMetrics.map(function(node){
    var cls = [
      node.variant ? "variant-"+node.variant : "",
      node.current ? "current" : "",
      hasProject && node.metrics.length ? "with-metrics" : "",
      stState.riskActive && riskNodeIds.has(node.id) ? "alert" : ""
    ].filter(Boolean).join(" ");
    var x = Number(node.x||0), y = Number(node.y||0);
    var metrics = hasProject ? node.metrics.map(function(m){
      return '<span class="st-node-metric-line"><em>'+m.label+'</em><strong>'+m.value+'</strong></span>';
    }).join("") : "";
    return '<button class="st-flow-node '+cls+'" data-node-id="'+node.id+'" data-col="'+node.col+'" data-row="'+node.row+'" type="button" '
      + 'style="grid-column:'+node.col+';grid-row:'+node.row+';--node-x:'+x+'px;--node-y:'+y+'px;">'
      + (iconDefs[nodeIconById[node.id]] || iconDefs.list)
      + '<span class="st-node-label">'+node.label+'</span>'
      + (metrics ? '<span class="st-node-metrics-popover">'+metrics+'</span>' : '')
      + '</button>';
  }).join("");
  var el = container.querySelector("#stMapGrid");
  if(el) el.innerHTML = html;
}

function drawConnectors(container){
  var panel = container.querySelector(".st-map-panel");
  var layer = container.querySelector("#stConnectorLayer");
  if(!panel || !layer) return;
  var pr = panel.getBoundingClientRect();
  if(pr.width === 0) return;
  layer.setAttribute("viewBox", "0 0 "+pr.width+" "+pr.height);
  layer.innerHTML = '<defs>'
    + '<marker id="stArrowNormal" markerWidth="8" markerHeight="8" refX="7.2" refY="4" orient="auto" markerUnits="userSpaceOnUse">'
    + '<path d="M0,0 L8,4 L0,8 Z" fill="rgba(64,207,255,.95)"></path></marker>'
    + '<marker id="stArrowAlert" markerWidth="8" markerHeight="8" refX="7.2" refY="4" orient="auto" markerUnits="userSpaceOnUse">'
    + '<path d="M0,0 L8,4 L0,8 Z" fill="rgba(255,83,118,.98)"></path></marker>'
    + '</defs>';

  links.forEach(function(link){
    var from = container.querySelector('[data-node-id="'+link.from+'"]');
    var to = container.querySelector('[data-node-id="'+link.to+'"]');
    if(!from || !to) return;
    var fr = from.getBoundingClientRect(), tr = to.getBoundingClientRect();
    var fc = { x: fr.left+fr.width/2-pr.left, y: fr.top+fr.height/2-pr.top };
    var tc = { x: tr.left+tr.width/2-pr.left, y: tr.top+tr.height/2-pr.top };
    var vertical = Math.abs(fc.x-tc.x) < 18;
    var path;
    if(vertical){
      var sy = fr.bottom-pr.top+2, ey = tr.top-pr.top-3;
      path = "M "+fc.x+" "+sy+" L "+tc.x+" "+ey;
    } else {
      var forward = tc.x > fc.x;
      var sx = (forward?fr.right:fr.left)-pr.left+(forward?3:-3);
      var ex = (forward?tr.left:tr.right)-pr.left+(forward?-3:3);
      var mx = (sx+ex)/2;
      path = "M "+sx+" "+fc.y+" L "+mx+" "+fc.y+" L "+mx+" "+tc.y+" L "+ex+" "+tc.y;
    }
    var alert = stState.riskActive && link.status === "alert" ? " alert" : "";
    var el = document.createElementNS("http://www.w3.org/2000/svg","path");
    el.setAttribute("class","st-connector-path"+alert);
    el.setAttribute("d", path);
    layer.appendChild(el);
  });
}

function renderAlertSummary(container, d){
  var el = container.querySelector("#stAlertSummary");
  if(!el) return;
  var code = stState.pid || "未选择项目";
  var projName = d && d.proj ? d.proj.name : code;
  if(!stState.riskActive){
    el.innerHTML = '<div class="st-alert-state"><h2>项目监控</h2><span>蓝色运行</span></div>'
      + '<p>'+projName+' 当前处于常规监控态，业务链路按计划节奏滚动。</p>'
      + '<div class="st-impact-grid"><div><small>风险等级</small><strong>低</strong></div>'
      + '<div><small>影响订单</small><strong>0</strong></div>'
      + '<div><small>OTS偏差</small><strong>+0.0d</strong></div></div>';
    return;
  }
  var impactOrders = d ? Math.round((100-(d.otd||95))*1.5) : 148;
  el.innerHTML = '<div class="st-alert-state"><h2>红色预警</h2><span class="red">'+projName+'</span></div>'
    + '<p>项目主材到货、齐套检查、物料配送和客户签收形成串联风险，预计影响 '
    + (d ? d.proj.engStage : 'MP') +' 交付窗口。</p>'
    + '<div class="st-impact-grid"><div><small>风险等级</small><strong>高</strong></div>'
    + '<div><small>影响订单</small><strong>'+impactOrders+'</strong></div>'
    + '<div><small>OTS偏差</small><strong>+6.2d</strong></div></div>';
}

function renderWarnings(container){
  var el = container.querySelector("#stWarningList");
  var cnt = container.querySelector("#stWarningCount");
  if(!el) return;
  var warnings = stState.riskActive ? [
    ["red","3.1 采购订单","超期未下达PO 18单，供应商交期确认率低于阈值。"],
    ["red","2.5 齐套检查","长交期关键料缺口4,800pcs，齐套率降至82.4%。"],
    ["red","4.2 物料配送","缺料配送14单，预计拉长在制等待。"],
    ["amber","5.3 报关/订舱","订舱及时率88.5%，需锁定备选舱位。"],
    ["amber","5.6 客户签收","签收回传延迟0.6天，影响结算关闭。"]
  ] : [
    ["amber","计划滚动","重点项目按日刷新，当前未触发红色预警。"],
    ["amber","物流回传","海外签收回传仍需保持跟踪。"]
  ];
  if(cnt) cnt.textContent = warnings.length+" 条";
  el.innerHTML = warnings.map(function(w){
    return '<article class="st-warning-item '+w[0]+'"><strong>'+w[1]+'</strong><span>'+w[2]+'</span></article>';
  }).join("");
}

function renderChangedMetrics(container, plan){
  var el = container.querySelector("#stChangedMetrics");
  var stamp = container.querySelector("#stMetricStamp");
  var badge = container.querySelector("#stScoreBadge");
  if(!el) return;
  if(stamp) stamp.textContent = stState.riskActive ? "实时推演" : "基线";
  if(badge) badge.textContent = plan.score;
  var rushOut = container.querySelector("#stRushOutput");
  var subOut = container.querySelector("#stSubOutput");
  var otOut = container.querySelector("#stOtOutput");
  if(rushOut) rushOut.textContent = plan.rush+"%";
  if(subOut) subOut.textContent = plan.sub+"%";
  if(otOut) otOut.textContent = plan.overtime+"h";

  var rows = stState.riskActive ? [
    ["OTS周期", plan.ots.toFixed(1)+"天", "缩短 "+plan.otsGain.toFixed(1)+"天"],
    ["齐套率", plan.kit.toFixed(1)+"%", "提升 "+plan.kitGain.toFixed(1)+"%"],
    ["采购到货及时率", plan.delivery.toFixed(1)+"%", "提升 "+plan.deliveryGain.toFixed(1)+"%"],
    ["客户准时签收", plan.sign.toFixed(1)+"%", "提升 "+plan.signGain.toFixed(1)+"%"]
  ] : [
    ["OTS周期","16.0天","基线"],
    ["齐套率","91.8%","基线"],
    ["采购到货及时率","94.2%","基线"],
    ["客户准时签收","96.4%","基线"]
  ];
  el.innerHTML = rows.map(function(r){
    return '<div class="st-metric-row"><div><small>'+r[0]+'</small><strong>'+r[1]+'</strong></div><em>'+r[2]+'</em></div>';
  }).join("");
}

/* ════════════════════════════════════════════════
   6. 初始化
   ════════════════════════════════════════════════ */
function initPage_sandtable(container){
  container = container || document.getElementById('page-sandtable');
  if(!container) return;

  // 优先使用顶部全局筛选选中的项目，否则取第一个项目
  var defaultPid = (typeof App !== 'undefined' && App.drillDown && App.drillDown.projectId) ? App.drillDown.projectId
    : (typeof projects !== 'undefined' && projects.length ? projects[0].id : null);
  stState.pid = defaultPid;
  // 根据项目健康状态自动决定是否进入风险态
  if(defaultPid && window.DS){
    var d = DS.get(defaultPid);
    if(d && d.health === 'r') stState.riskActive = true;
  }

  // 构建项目下拉
  var projOpts = "";
  if(typeof projects !== 'undefined'){
    projOpts = projects.map(function(p){
      var sel = p.id === stState.pid ? " selected" : "";
      return '<option value="'+p.id+'"'+sel+'>'+p.name+' · '+p.customer+' · '+p.productLine+'</option>';
    }).join("");
  }

  // 阶段条
  var stageHtml = stageTitles.map(function(t){ return '<div>'+t+'</div>'; }).join("");

  container.innerHTML = `
    <div class="sandtable-shell">
      <div class="st-topbar">
        <div class="st-brand">
          <div class="st-brand-mark">G</div>
          <div><span>G-SCT</span><small>项目全景沙盘</small></div>
        </div>
        <h1 class="st-title">歌尔供应链控制塔 · 项目全链路全景沙盘</h1>
        <div class="st-status-box">
          <span class="st-status-dot ${stState.riskActive ? 'alert' : ''}" id="stStatusDot"></span>
          <span id="stStatusText">${stState.riskActive ? '红色预警' : '常规监控'}</span>
        </div>
      </div>

      <div class="st-query-panel">
        <label><span>项目</span>
          <select id="stProjectSelect">${projOpts}</select>
        </label>
        <label><span>BG</span>
          <select id="stFilterBg"><option>全部BG</option><option>A01 声学BG</option><option>CEP 消费电子BG</option><option>SAC 微电子BG</option></select>
        </label>
        <label><span>客户</span>
          <select id="stFilterCustomer"><option>全部客户</option></select>
        </label>
        <label><span>产品线</span>
          <select id="stFilterProduct"><option>全部产品线</option></select>
        </label>
        <label class="st-project-field"><span>项目号</span>
          <input id="stProjectInput" value="${stState.pid || 'G-SCT-MP-2406'}" autocomplete="off" />
        </label>
        <label><span>项目阶段</span>
          <select id="stFilterStage"><option>MP</option><option>PVT</option><option>DVT</option><option>EVT</option></select>
        </label>
        <button id="stDiagnoseBtn" class="st-diagnose-btn" type="button">🔍 项目诊断</button>
        <button id="stResetBtn" class="st-diagnose-btn reset" type="button">↺ 重置</button>
      </div>

      <div class="st-kpi-strip" id="stKpiStrip"></div>

      <div class="st-stage-ribbon" id="stStageRibbon">${stageHtml}</div>

      <div class="st-workspace">
        <div class="st-map-panel">
          <svg class="st-connector-layer" id="stConnectorLayer"></svg>
          <div class="st-map-grid" id="stMapGrid"></div>
        </div>

        <aside class="st-inspector">
          <section class="st-alert-summary" id="stAlertSummary"></section>

          <section class="st-metric-editor">
            <div class="st-section-title"><span>方案推演</span><strong id="stScoreBadge">86</strong></div>
            <label><span>加急采购覆盖</span><input id="stRushSlider" type="range" min="0" max="100" value="${stState.rush}" /><output id="stRushOutput">${stState.rush}%</output></label>
            <label><span>替代料覆盖</span><input id="stSubSlider" type="range" min="0" max="100" value="${stState.sub}" /><output id="stSubOutput">${stState.sub}%</output></label>
            <label><span>产线加班小时</span><input id="stOtSlider" type="range" min="0" max="24" value="${stState.overtime}" /><output id="stOtOutput">${stState.overtime}h</output></label>
          </section>

          <section class="st-changed-metrics">
            <div class="st-section-title"><span>调整后指标</span><small id="stMetricStamp">未应用</small></div>
            <div id="stChangedMetrics"></div>
          </section>

          <section class="st-warning-feed">
            <div class="st-section-title"><span>异常明细</span><small id="stWarningCount">0 条</small></div>
            <div class="st-warning-list" id="stWarningList"></div>
          </section>
        </aside>
      </div>
    </div>`;

  // 绑定事件
  bindEvents(container);
  // 首次渲染
  renderAll(container);
}

function bindEvents(container){
  var projSel = container.querySelector("#stProjectSelect");
  if(projSel){
    projSel.addEventListener("change", function(){
      stState.pid = this.value || null;
      var inp = container.querySelector("#stProjectInput");
      if(inp) inp.value = stState.pid || "";
      // 根据健康状态重置风险态
      if(stState.pid && window.DS){
        var d = DS.get(stState.pid);
        stState.riskActive = (d && d.health === 'r');
      } else {
        stState.riskActive = false;
      }
      updateStatusBox(container);
      renderAll(container);
    });
  }

  var inp = container.querySelector("#stProjectInput");
  if(inp){
    inp.addEventListener("keydown", function(e){
      if(e.key === "Enter"){ setRiskActive(container, true); }
    });
    inp.addEventListener("input", function(){
      if(!this.value.trim()){
        stState.pid = null;
        setRiskActive(container, false);
      }
    });
  }

  var diagBtn = container.querySelector("#stDiagnoseBtn");
  if(diagBtn){
    diagBtn.addEventListener("click", function(){ setRiskActive(container, true); });
  }
  var resetBtn = container.querySelector("#stResetBtn");
  if(resetBtn){
    resetBtn.addEventListener("click", function(){
      stState.rush = 42; stState.sub = 35; stState.overtime = 6;
      var rs = container.querySelector("#stRushSlider"); if(rs) rs.value = 42;
      var ss = container.querySelector("#stSubSlider"); if(ss) ss.value = 35;
      var os = container.querySelector("#stOtSlider"); if(os) os.value = 6;
      setRiskActive(container, false);
    });
  }

  ["#stRushSlider","#stSubSlider","#stOtSlider"].forEach(function(sel){
    var sl = container.querySelector(sel);
    if(!sl) return;
    sl.addEventListener("input", function(){
      if(sel === "#stRushSlider") stState.rush = Number(this.value);
      else if(sel === "#stSubSlider") stState.sub = Number(this.value);
      else stState.overtime = Number(this.value);
      if(!stState.riskActive) stState.riskActive = true;
      updateStatusBox(container);
      renderAll(container);
    });
  });

  // 窗口resize重绘连接线
  var resizeHandler = function(){ requestAnimationFrame(function(){ drawConnectors(container); }); };
  window.addEventListener("resize", resizeHandler);
  // 容器销毁时清理（简易处理）
  container._stResizeHandler = resizeHandler;
}

function setRiskActive(container, next){
  stState.riskActive = next;
  updateStatusBox(container);
  renderAll(container);
}

function updateStatusBox(container){
  var dot = container.querySelector("#stStatusDot");
  var txt = container.querySelector("#stStatusText");
  if(dot){ dot.className = "st-status-dot"+(stState.riskActive ? " alert" : ""); }
  if(txt){ txt.textContent = stState.riskActive ? "红色预警" : "常规监控"; }
}

window.initPage_sandtable = initPage_sandtable;
})();
registerModule('sandtable', initPage_sandtable);
