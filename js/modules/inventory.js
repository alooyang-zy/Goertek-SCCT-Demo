// Module: inventory — 项目库存健康 v11.0 (4-L1拓扑地图 + 新文件结构同步)
(function(){

// ═══════════════ 指标定义 ═══════════════
var metricDefs = [
  { key:'ito',      label:'ITO',    header:'库存周转率',      unit:'x',  definition:'年度COGS / 项目平均库存金额',                 orangeRule:'4.0~5.0 或低于BG均值10~30%',              redRule:'低于4.0 或低于BG均值超30%',                    diagnosis:'库存周转偏慢，优先压降高占压库存' },
  { key:'fgDos',    label:'FG-DOS', header:'成品供应天数',    unit:'天', definition:'当前FG库存量 / 近30天日均出货量',             orangeRule:'低于7天或14~21天之间',                     redRule:'低于5天或超过21天',                            diagnosis:'成品节奏失衡，优先确认出货与去库存节拍' },
  { key:'rmDos',    label:'RM-DOS', header:'原材料供应天数',  unit:'天', definition:'当前RM可用库存量 / 近30天日均消耗量',         orangeRule:'低于7天或30~45天之间',                     redRule:'低于3天或超过45天',                            diagnosis:'原材料配置失衡，需同步看缺料和超储' },
  { key:'aging',    label:'Aging%', header:'异常账龄库存比率', unit:'%',  definition:'账龄>90天库存金额 / 项目全部库存金额 × 100%', orangeRule:'10%~20% 或高于BG均值50%以上',              redRule:'超过20% 或高于BG均值100%以上',                 diagnosis:'高账龄库存偏高，需尽快识别沉淀节点' },
  { key:'eo',       label:'E&O%',   header:'E&O呆滞率',       unit:'%',  definition:'确认E&O库存金额 / 项目总库存金额 × 100%',    orangeRule:'5%~10%之间',                              redRule:'超过10%',                                      diagnosis:'已确认呆滞偏高，优先安排处置资源' },
  { key:'stockout', label:'Stockout%',header:'缺货概率',       unit:'%',  definition:'低于安全库存水位SKU数 / 全部SKU数 × 100%',    orangeRule:'15%~30%之间',                             redRule:'超过30%',                                      diagnosis:'供应保障脆弱，需优先拉通补货计划' },
  { key:'forecast', label:'FA%',     header:'需求预测准确率',  unit:'%',  definition:'1 - |实际需求 - 预测需求| / 实际需求 × 100%',  orangeRule:'80%~90%之间',                             redRule:'低于80%',                                      diagnosis:'预测精度偏弱，库存异常根因更可能在计划' },
  { key:'mrb',      label:'MRB%',    header:'来料异常处置及时率',unit:'%', definition:'7天内完成处置的MRB批次 / 全部MRB批次 × 100%',  orangeRule:'75%~90%之间',                            redRule:'低于75%',                                      diagnosis:'质量处置偏慢，已影响库存转可用节奏' }
];

// ═══════════════ 链路节点目录 v11 ═══════════════
var chainNodeCatalog = [
  // L1: 供应商库存
  { id:'supplier', level:'L1', title:'供应商库存', qtyLabel:'项目专用锁定总量', amountLabel:'锁定金额合计', timeLabel:'最早到期交货日距今天数', riskLabel:'锁定量覆盖率', group:'supplier', children:['supplier-raw','supplier-wip','supplier-fg','supplier-it'] },
  { id:'supplier-raw', level:'L2', parentId:'supplier', title:'供应商原材料', qtyLabel:'锁定备料量', amountLabel:'锁定备料货值', timeLabel:'备料覆盖天数', riskLabel:'超计划备料SKU数', baseCode:'SRM', group:'supplier' },
  { id:'supplier-wip', level:'L2', parentId:'supplier', title:'供应商在制', qtyLabel:'在产数量', amountLabel:'在产货值(含原材料+工时)', timeLabel:'承诺交期延误天数', riskLabel:'交期准时达成率', baseCode:'SS', group:'supplier' },
  { id:'supplier-fg', level:'L2', parentId:'supplier', title:'供应商成品在库', qtyLabel:'锁定待发量', amountLabel:'锁定货值', timeLabel:'距承诺交货日剩余天数', riskLabel:'超期锁定批次数', baseCode:'SS', group:'supplier' },
  { id:'supplier-it', level:'L2', parentId:'supplier', title:'供应商在途', qtyLabel:'在途总量', amountLabel:'在途总货值', timeLabel:'平均在途天数(vs标准时效)', riskLabel:'在途延误批次数', baseCode:'IT', group:'supplier' },
  // L1: 原材料库存 (含IQC/MRB)
  { id:'raw', level:'L1', title:'原材料库存', qtyLabel:'原材料总量', amountLabel:'RM总金额', timeLabel:'RM-DOS(库存天数)', riskLabel:'低于安全库存SKU数', group:'raw', children:['iqc','mrb','raw-special','raw-common'] },
  { id:'iqc', level:'L2', parentId:'raw', title:'IQC待检', qtyLabel:'待检批次数量', amountLabel:'待检货值', timeLabel:'平均IQC等待天数', riskLabel:'超1.5天未开检批次数', baseCode:'IQC', group:'abnormal' },
  { id:'mrb', level:'L2', parentId:'raw', title:'MRB品质异常', qtyLabel:'MRB暂扣数量', amountLabel:'MRB暂扣货值', timeLabel:'平均MRB扣押天数', riskLabel:'来料批次不良率', baseCode:'MRB', group:'abnormal' },
  { id:'raw-special', level:'L2', parentId:'raw', title:'项目专用料', qtyLabel:'专用可用量', amountLabel:'专用料金额', timeLabel:'专用料DOS', riskLabel:'在库齐套率', baseCode:'RM', group:'raw' },
  { id:'raw-common', level:'L2', parentId:'raw', title:'项目通用料', qtyLabel:'项目分摊量', amountLabel:'分摊金额', timeLabel:'共用料DOS', riskLabel:'需求预测准确率(FA%)', baseCode:'RM', group:'raw' },
  // L1: 在制和半成品
  { id:'wip', level:'L1', title:'在制和半成品', qtyLabel:'WIP总量', amountLabel:'WIP总金额(含原材料+工时+制费)', timeLabel:'WIP周转天数', riskLabel:'短料停线工单数', group:'wip', children:['wip-front','wip-back','sfg'] },
  { id:'wip-front', level:'L2', parentId:'wip', title:'SMT', qtyLabel:'在制板数', amountLabel:'前段工序金额', timeLabel:'工序积压天数', riskLabel:'超节拍积压批次数', baseCode:'WIP', group:'wip' },
  { id:'wip-back', level:'L2', parentId:'wip', title:'FATP', qtyLabel:'在制数量', amountLabel:'后段工序金额', timeLabel:'平均延期完工天数', riskLabel:'不良返工率(%)', baseCode:'WIP', group:'wip' },
  { id:'sfg', level:'L2', parentId:'wip', title:'半成品', qtyLabel:'SFG总量', amountLabel:'SFG总金额', timeLabel:'工序间滞留天数', riskLabel:'超阈值滞留占比', baseCode:'SFG', group:'wip' },
  // L1: 成品库存
  { id:'finished', level:'L1', title:'成品库存', qtyLabel:'FG总量', amountLabel:'FG总金额', timeLabel:'成品供应天数(FG-DOS)', riskLabel:'E&O呆滞率', group:'finished', children:['fg','fg-it','vmi','cs','rtv'] },
  { id:'fg', level:'L2', parentId:'finished', title:'厂内现货成品', qtyLabel:'厂内库存量', amountLabel:'厂内货值', timeLabel:'账龄分布中位天数', riskLabel:'近7天出货缺口SKU数', baseCode:'FG', group:'finished' },
  { id:'fg-it', level:'L2', parentId:'finished', title:'成品在途', qtyLabel:'在途成品量', amountLabel:'在途成品货值', timeLabel:'平均在途天数(vs标准运输时效)', riskLabel:'在途延误批次数', baseCode:'IT', group:'finished' },
  { id:'vmi', level:'L2', parentId:'finished', title:'VMI客户仓', qtyLabel:'客户仓未拉料量', amountLabel:'未结算货值', timeLabel:'客户仓库龄天数', riskLabel:'客户侧库存周转率', baseCode:'VMI', group:'finished' },
  { id:'cs', level:'L2', parentId:'finished', title:'寄售未结算', qtyLabel:'寄售在库量', amountLabel:'待结算金额', timeLabel:'超账期未结算天数', riskLabel:'超账期未结算SKU数', baseCode:'CS', group:'finished' },
  { id:'rtv', level:'L2', parentId:'finished', title:'客户退货', qtyLabel:'退回数量', amountLabel:'退货货值', timeLabel:'平均处置周期(天)', riskLabel:'重复退货率', baseCode:'RTV', group:'finished' }
];

var chainStageWeights = {
  NPI:          { supplier:27, raw:37, wip:23, finished:13 },
  'Ramp-up':    { supplier:19, raw:35, wip:19, finished:27 },
  'Mass Production':{ supplier:19, raw:35, wip:19, finished:27 },
  EOL:          { supplier:10, raw:27, wip:15, finished:48 }
};
var chainChildWeights = {
  supplier:   { 'supplier-raw':28, 'supplier-wip':27, 'supplier-fg':25, 'supplier-it':20 },
  raw:        { iqc:16, mrb:14, 'raw-special':40, 'raw-common':30 },
  wip:        { 'wip-front':34, 'wip-back':38, sfg:28 },
  finished:   { fg:38, 'fg-it':12, vmi:22, cs:13, rtv:15 }
};
var materialTemplatesByNode = {
  'supplier-raw':['供应商锁定IC','供应商锁定电池芯','供应商锁定镜片','供应商锁定FPC'],
  'supplier-wip':['MEMS麦克风在产','FPC软板在产','结构件待完工','镜片模组在制'],
  'supplier-fg':['供应商待发喇叭','供应商待发镜片','供应商待发FPC','供应商待发连接器'],
  'supplier-it':['海运在途主板','空运在途麦克风','跨境在途结构件','在途光学模组'],
  iqc:['待检MEMS料','待检扬声器','待检光学件','待检FPC'],
  mrb:['MRB异常声学件','MRB批退主板','MRB返修待判件','MRB来料Hold料'],
  'raw-special':['项目专用MEMS','项目专用电池芯','项目专用镜片','项目专用FPC'],
  'raw-common':['通用螺丝件','通用包材','通用连接器','通用标准辅料'],
  'wip-front':['SMT贴片在制板','SMT回流焊在制件','SMT点胶待过站板','SMT测试待转板'],
  'wip-back':['FATP组装在制件','FATP功能测试件','FATP包装待入库件','FATP老化测试件'],
  sfg:['声学前壳半成品','显示模组半成品','主板半成品','电池Pack半成品'],
  fg:['厂内现货整机','厂内现货耳机','厂内现货音箱','厂内现货光机模组'],
  'fg-it':['出厂在途整机','出厂在途耳机','出厂在途音箱','出厂在途模组'],
  vmi:['客户仓整机','客户仓声学模组','海外VMI整机','渠道前置仓备机'],
  cs:['寄售连接器','寄售线材','寄售包材','寄售备件'],
  rtv:['客户退回整机','客户退回耳机','售后退回件','返厂分析样机']
};
var riskTagPool = {
  supplier:['供应缺口风险','供应商交期延误','市场性供应短缺','在途运输延误','清关异常'],
  abnormal:['IQC待检积压','MRB扣押待判','来料高不良率','质量批次追溯'],
  raw:['需求异常波动','预测持续偏差','无需求物料','库存超配','高账龄库存','ECN变更冻结','物料停产EOL'],
  wip:['高账龄库存','ECN变更冻结','库存超配','质量批次追溯'],
  finished:['确认呆滞','临期物料','账实不符','超额资金占用','市场跌价风险','物料停产EOL']
};
var versionPool = ['A01','A02','B01','B02','C00','EVT','DVT','PVT'];
var ownerPool = ['物控 赵琳','PMC 李晨','采购 周楠','质量 韩雪','项目 王哲','仓储 陈浩'];

// ═══════════════ 工具函数 ═══════════════
function avg(arr){ return arr.length ? arr.reduce(function(s,v){return s+v;},0)/arr.length : 0; }
function distribute(total, weights){
  var entries = Object.keys(weights).map(function(k){return [k, weights[k]];});
  var result = {}, allocated = 0;
  entries.forEach(function(e,i){
    var raw = total * e[1] / 100;
    var rounded = i === entries.length-1 ? total - allocated : Math.round(raw);
    result[e[0]] = rounded; allocated += rounded;
  });
  return result;
}
function formatWan(v){ return Math.round(v).toLocaleString(); }

// ═══════════════ 风险等级/原因/处置 ═══════════════
function riskLevelFor(tags, ageDays){
  var score=tags.length*14+ageDays*0.35;
  if(tags.some(function(t){return /确认呆滞|供应缺口风险|清关异常/.test(t);}))score+=20;
  if(score>=70)return'P0';if(score>=52)return'P1';if(score>=32)return'P2';return'P3';
}
function riskReasonFromTags(tags, p){
  if(tags.some(function(t){return /确认呆滞|物料停产EOL/.test(t);}))return (p.lifecycleRaw==='EOL'||p.lifecycle==='EOL')?'项目退市/停产尾库存':'需求消失或版本切换';
  if(tags.some(function(t){return /预测持续偏差|需求异常波动/.test(t);}))return'需求预测偏差';
  if(tags.some(function(t){return /IQC待检积压|MRB扣押待判|来料高不良率/.test(t);}))return'质量冻结/待判积压';
  if(tags.some(function(t){return /供应商交期延误|在途运输延误|清关异常/.test(t);}))return'供应与物流异常';
  if(tags.some(function(t){return /高账龄库存|库存超配/.test(t);}))return'超储与高账龄沉淀';
  return'库存结构异常';
}
function actionPathFromTags(tags){
  if(tags.some(function(t){return /确认呆滞|物料停产EOL/.test(t);}))return'转用/折价/报废';
  if(tags.some(function(t){return /IQC待检积压|MRB扣押待判|来料高不良率/.test(t);}))return'判定释放/退供/索赔';
  if(tags.some(function(t){return /供应商交期延误|在途运输延误|清关异常/.test(t);}))return'催交/加急/替代';
  if(tags.some(function(t){return /预测持续偏差|需求异常波动/.test(t);}))return'调整计划/降采/去化';
  return'消耗/转用/清理';
}

// ═══════════════ 为每个项目生成库存数据 ═══════════════
function generateInventoryData(p){
  var i = parseInt(p.id.replace(/\D/g,'')||'1');
  var stage = p.lifecycleRaw || p.lifecycle || 'Mass Production';
  var ito      = Math.round((3.5 + (i%7)*0.8 + Math.random()*1.5)*10)/10;
  var fgDos    = Math.round(5 + (i%9)*2.5 + Math.random()*8);
  var rmDos    = Math.round(8 + (i%11)*3.5 + Math.random()*12);
  var aging    = Math.round((2 + (i%6)*4 + Math.random()*10)*10)/10;
  var eo       = Math.round((0.5 + (i%5)*1.5 + Math.random()*5)*10)/10;
  var stockout = Math.round((2 + (i%7)*3 + Math.random()*10)*10)/10;
  var forecast = Math.round((70 + (i%8)*3.5 + Math.random()*10)*10)/10;
  var mrb      = Math.round((65 + (i%9)*3 + Math.random()*12)*10)/10;
  var inventory = Math.round(3000 + (i%20)*800 + Math.random()*5000);
  return { ito:ito, fgDos:fgDos, rmDos:rmDos, aging:aging, eo:eo, stockout:stockout, forecast:Math.min(forecast,99), mrb:Math.min(mrb,99), inventory:inventory, stage:stage };
}

// 缓存
var _invCache = {};
function getInvData(p){
  if(!_invCache[p.id]) _invCache[p.id] = generateInventoryData(p);
  return _invCache[p.id];
}

// ═══════════════ 指标状态判断 ═══════════════
function bgMean(bg, key){
  var peers = projects.filter(function(p){return p.bg===bg;});
  return avg(peers.map(function(p){return getInvData(p)[key];}));
}
function metricStatus(p, key){
  var d = getInvData(p);
  var v = d[key], bgAvg = bgMean(p.bg, key);
  if(key==='ito'){ return v<4||v<bgAvg*0.7?'red': v<5||v<bgAvg*0.9?'orange':'green'; }
  if(key==='fgDos'){ return v<5||v>21?'red': v<7||v>14?'orange':'green'; }
  if(key==='rmDos'){ return v<3||v>45?'red': v<7||v>30?'orange':'green'; }
  if(key==='aging'){ return v>20||v>bgAvg*2?'red': (v>=10&&v<=20)||v>bgAvg*1.5?'orange':'green'; }
  if(key==='eo'){ return v>10?'red': v>=5?'orange':'green'; }
  if(key==='stockout'){ return v>30?'red': v>=15?'orange':'green'; }
  if(key==='forecast'){ return v<80?'red': v<90?'orange':'green'; }
  if(key==='mrb'){ return v<75?'red': v<90?'orange':'green'; }
  return 'green';
}
function compositeState(p){
  var red=0, orange=0;
  metricDefs.forEach(function(m){
    var t = metricStatus(p, m.key);
    if(t==='red') red++; if(t==='orange') orange++;
  });
  if(red>=4) return {label:'危急',tone:'critical',rank:4,red:red,orange:orange};
  if(red>=2) return {label:'预警',tone:'warn',rank:3,red:red,orange:orange};
  if(red===1||orange>=3) return {label:'关注',tone:'focus',rank:2,red:red,orange:orange};
  return {label:'健康',tone:'good',rank:1,red:red,orange:orange};
}
function projectVerdict(p){
  var reds=[], oranges=[];
  metricDefs.forEach(function(m){
    var t=metricStatus(p,m.key);
    if(t==='red') reds.push(m); if(t==='orange') oranges.push(m);
  });
  var focus = reds[0]||oranges[0];
  return focus ? focus.diagnosis : '整体稳定，优先保持当前节奏';
}
function formatMetricValue(m, v){
  if(m.key==='ito') return v.toFixed(1)+' x';
  return v + m.unit;
}

// ═══════════════ 链路构建 ═══════════════
var _selectedNodeId = 'supplier';

function toneForTag(tag){
  if(/供应缺口风险|市场性供应短缺|清关异常|确认呆滞|临期物料/.test(tag)) return 'red';
  if(/供应商交期延误|在途运输延误|需求异常波动|预测持续偏差|库存超配|高账龄库存|超额资金占用|市场跌价风险/.test(tag)) return 'orange';
  if(/IQC待检积压|MRB扣押待判|来料高不良率|质量批次追溯/.test(tag)) return 'purple';
  if(/ECN变更冻结|物料停产EOL/.test(tag)) return 'yellow'; if(/账实不符/.test(tag)) return 'gray'; return 'blue';
}
function storageStatus(group, ageDays){
  if(group==='abnormal') return ageDays>35?'待判':'待检';
  if(group==='supplier') return ageDays>55?'超期':'锁定';
  if(group==='finished'&&ageDays>110) return '确认滞销';
  if(group==='raw'&&ageDays>95) return '冻结';
  return'可用';
}
function nodeRiskTags(node, p, ageDays, index){
  var basePool = riskTagPool[node.group]||[];
  var selected = [];
  if(node.group==='supplier'){
    if(index===0||(p.lifecycleRaw||p.lifecycle)==='NPI') selected.push('供应缺口风险');
    if(ageDays>55) selected.push('供应商交期延误');
    if(node.id==='supplier-raw') selected.push((p.forecast||80)<82?'市场性供应短缺':'供应商交期延误');
    if(node.id.includes('it')) selected.push(ageDays>70?'清关异常':'在途运输延误');
  } else if(node.group==='abnormal'){
    selected.push(node.id==='iqc'?'IQC待检积压':'MRB扣押待判');
    if(ageDays>40) selected.push('来料高不良率');
  } else if(node.group==='raw'){
    if(node.id==='raw-common') selected.push('预测持续偏差');
    if(ageDays>90) selected.push('高账龄库存');
    if((p.lifecycleRaw||p.lifecycle)==='EOL') selected.push('物料停产EOL');
  } else if(node.group==='wip'){
    selected.push('高账龄库存');
    if(ageDays>65) selected.push('ECN变更冻结');
  } else if(node.group==='finished'){
    if((p.lifecycleRaw||p.lifecycle)==='EOL'||ageDays>120) selected.push('确认呆滞');
    if(node.id==='cs') selected.push('超额资金占用');
    if(node.id==='rtv') selected.push('账实不符');
  }
  for(var off=0; off<basePool.length && selected.length<2; off++){
    var c = basePool[(index+off)%basePool.length];
    if(selected.indexOf(c)===-1) selected.push(c);
  }
  return selected.slice(0,3);
}
function buildMaterialsForNode(p, node, amount, seed){
  var templates = materialTemplatesByNode[node.id] || ['物料A','物料B','物料C','物料D'];
  var shares = [0.32, 0.26, 0.22, 0.20];
  return templates.map(function(name, index){
    var matAmt = index===templates.length-1 ? Math.max(18, amount - Math.round(amount*0.8)) : Math.max(16, Math.round(amount*shares[index]));
    var qty = Math.max(90, Math.round(matAmt * (node.group==='raw'?18.2:node.group==='finished'?7.2:10.4)));
    var stage0 = (p.lifecycleRaw||p.lifecycle);
    var ageDays = Math.max(6, Math.round((stage0==='EOL'?70:stage0==='NPI'?24:38) + seed*4 + index*13));
    var demand30 = Math.max(0, Math.round(qty*(stage0==='EOL'?0.24:stage0==='Mass Production'||stage0==='稳定量产'?0.72:0.9) - index*18));
    var reservedQty = Math.max(0, Math.round(qty*(node.id==='supplier-raw'?0.42:node.group==='finished'?0.2:node.group==='abnormal'?0.08:0.12)));
    var availableQty = Math.max(0, Math.round(qty*(node.group==='abnormal'?0.2:node.id==='supplier-raw'?0.46:0.74)));
    var tags = nodeRiskTags(node, p, ageDays, index);
    var riskLevel = riskLevelFor(tags, ageDays);
    var riskReason = riskReasonFromTags(tags, p);
    var actionPath = actionPathFromTags(tags);
    var releaseAmount = Math.round(matAmt * (riskLevel==='P0'?0.72:riskLevel==='P1'?0.58:riskLevel==='P2'?0.36:0.18));
    return {
      code: node.id.toUpperCase().replace(/-/g,'') + '-' + (p.bu||'BU').replace(/[^A-Za-z0-9]/g,'').slice(0,3) + '-' + String(index+1).padStart(3,'0'),
      inventoryName: node.title, name: name,
      spec: (p.productLine||'') + '/' + versionPool[(seed+index)%versionPool.length],
      quantity: qty, uom: node.group==='supplier'||node.group==='finished'?'EA':'PCS',
      amount: matAmt,
      subinventory: node.title + '-' + ((index%3)+1),
      ageDays: ageDays, availableQty: availableQty, reservedQty: reservedQty, demand30: demand30,
      status: storageStatus(node.group, ageDays),
      tags: tags,
      owner: ownerPool[(seed+index)%ownerPool.length],
      riskLevel: riskLevel,
      riskReason: riskReason,
      actionPath: actionPath,
      releaseAmount: releaseAmount,
      nextAction: actionPath
    };
  });
}
function metricValueForNode(label, amount, materials){
  var totalQty = materials.reduce(function(s,m){return s+m.quantity;},0);
  var avgAge = Math.round(avg(materials.map(function(m){return m.ageDays;})));
  var demand30 = materials.reduce(function(s,m){return s+m.demand30;},0);
  var riskQty = materials.reduce(function(s,m){return s+m.tags.length;},0);
  var riskRate = materials.length ? Math.round((riskQty/(materials.length*3))*100) : 0;
  if(/金额|货值/.test(label)) return formatWan(amount)+' 万';
  if(/覆盖率/.test(label)) return Math.max(78, Math.min(132, Math.round((totalQty/Math.max(demand30,1))*100)))+'%';
  if(/概率|不良率|占比|周转率|完工率/.test(label)){
    if(/客户侧库存周转率/.test(label)) return Math.max(1.8,(demand30/Math.max(totalQty/4,1))).toFixed(1)+'x';
    return Math.max(4, Math.min(98, riskRate))+'%';
  }
  if(/天数|天/.test(label)) return Math.max(2, avgAge)+'天';
  if(/批次/.test(label)) return Math.max(1, Math.round(materials.length*1.5))+'批';
  if(/数量|总量|库存量|锁定量|量/.test(label)) return Math.max(totalQty, materials.reduce(function(s,m){return s+m.reservedQty;},0), materials.reduce(function(s,m){return s+m.availableQty;},0)).toLocaleString();
  if(/SKU/.test(label)) return materials.length+'个';
  return Math.max(1, Math.round(totalQty/10)).toLocaleString();
}
function buildChainForProject(p){
  var d = getInvData(p);
  var stage = d.stage || 'Mass Production';
  var weights = chainStageWeights[stage] || chainStageWeights['Mass Production'];
  var l1Weights = distribute(d.inventory, weights);
  var nodesById = {};
  var l1Ids = [];
  chainNodeCatalog.forEach(function(node){
    if(node.level==='L1'){
      l1Ids.push(node.id);
      nodesById[node.id] = Object.assign({}, node, {amount: l1Weights[node.id], children: node.children.slice()});
    }
  });
  chainNodeCatalog.forEach(function(node, idx){
    if(node.level!=='L1'){
      var parentId = node.parentId;
      var parent = nodesById[parentId];
      var share = distribute(parent.amount, chainChildWeights[parentId])[node.id];
      var materials = buildMaterialsForNode(p, node, share, idx+1);
      nodesById[node.id] = Object.assign({}, node, {amount: share, materials: materials});
    }
  });
  l1Ids.forEach(function(parentId){
    var parent = nodesById[parentId];
    parent.materials = parent.children.reduce(function(arr, cid){return arr.concat(nodesById[cid].materials);}, []);
  });
  return { l1Ids:l1Ids, nodesById:nodesById };
}

// ═══════════════ 拓扑地图渲染 ═══════════════
var _topoColors = {
  supplier:'#2f6fa9', raw:'#4f8f64', wip:'#b78434', finished:'#9a6b2f'
};

function invRenderChain(p){
  var chain = buildChainForProject(p);
  var selectedNode = chain.nodesById[_selectedNodeId] || chain.nodesById.supplier;
  var layout = document.getElementById('invChainLayout');
  if(!layout) return;

  // 5个L1节点按供应链顺序排列
  var l1Order = ['supplier','raw','wip','finished'];
  var selectedParentId = selectedNode.level==='L1' ? selectedNode.id : selectedNode.parentId;

  var cols = l1Order.map(function(pid, colIdx){
    var parent = chain.nodesById[pid];
    var l1Sel = selectedParentId===pid;
    var color = _topoColors[pid] || '#2f6fa9';
    var children = parent.children.map(function(cid){return chain.nodesById[cid];});

    // L1 卡片
    var l1Html = '<div class="inv-topo-l1 '+(l1Sel?'selected':'')+'" data-inv-node="'+parent.id+'" style="--tc:'+color+'">'
      +'<div class="inv-topo-l1-label">'+parent.title+'</div>'
      +'<div class="inv-topo-l1-val">'+formatWan(parent.amount)+' 万</div>'
      +'<div class="inv-topo-l1-meta">'
        +'<span>'+metricValueForNode(parent.qtyLabel, parent.amount, parent.materials)+'</span>'
        +'<span>'+metricValueForNode(parent.timeLabel, parent.amount, parent.materials)+'</span>'
        +'<span>'+metricValueForNode(parent.riskLabel, parent.amount, parent.materials)+'</span>'
      +'</div>'
      +'<div class="inv-topo-l1-tags">'+parent.qtyLabel+' | '+parent.timeLabel+' | '+parent.riskLabel+'</div>'
      +'</div>';

    // L2 子卡片
    var l2Html = children.map(function(child){
      var sel = _selectedNodeId===child.id;
      var riskCount = child.materials.filter(function(m){return m.tags.some(function(t){return toneForTag(t)==='red';});}).length;
      return '<div class="inv-topo-l2 '+(sel?'selected':'')+'" data-inv-node="'+child.id+'" style="--tc:'+color+'">'
        +'<div class="inv-topo-l2-name">'+child.title+'</div>'
        +'<div class="inv-topo-l2-val">'+formatWan(child.amount)+' 万</div>'
        +'<div class="inv-topo-l2-meta">'
          +(riskCount>0?'<span class="inv-topo-risk">⚠'+riskCount+'</span>':'')
          +'<span>'+metricValueForNode(child.timeLabel, child.amount, child.materials)+'</span>'
        +'</div>'
        +'</div>';
    }).join('');

    // 流程箭头（最后一列不需要）
    var arrow = colIdx < l1Order.length-1
      ? '<div class="inv-topo-arrow">→</div>'
      : '';

    return '<div class="inv-topo-col">'
      + l1Html
      + '<div class="inv-topo-l2-list">' + l2Html + '</div>'
      + arrow
      + '</div>';
  }).join('');

  layout.innerHTML = '<div class="inv-topo-flow">' + cols + '</div>';

  // 绑定点击事件
  layout.querySelectorAll('[data-inv-node]').forEach(function(el){
    el.onclick = function(){
      _selectedNodeId = el.dataset.invNode;
      invRenderChain(p);
      invRenderMaterials(p);
    };
  });
}

function invRenderMaterials(p){
  var chain = buildChainForProject(p);
  var selectedNode = chain.nodesById[_selectedNodeId] || chain.nodesById.supplier;
  var materials = selectedNode.materials || [];
  var pill = document.getElementById('invMaterialPill');
  if(pill) pill.innerHTML = '<i class="fas fa-cubes"></i> '+selectedNode.title+' · <b>'+materials.length+'</b> 条物料';
  var tbody = document.getElementById('invMatTbody');
  var emptyEl = document.getElementById('invMatEmpty');
  if(!tbody) return;
  if(!materials.length){
    tbody.innerHTML = '';
    if(emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if(emptyEl) emptyEl.style.display = 'none';
  tbody.innerHTML = materials.map(function(m){
    var statusCls = m.status==='可用'?'green':m.status==='超期'||m.status==='确认滞销'?'orange':m.status==='待检'||m.status==='待判'?'purple':m.status==='冻结'?'cyan':'gray';
    var riskCls = m.riskLevel==='P0'?'red':m.riskLevel==='P1'?'orange':m.riskLevel==='P2'?'purple':'blue';
    return '<tr>'
      +'<td>'+m.code+'</td>'
      +'<td><div class="inv-mat-name"><div class="inv-mat-title">'+m.name+'</div><div class="inv-mat-code">'+m.inventoryName+'</div></div></td>'
      +'<td>'+m.spec+'</td>'
      +'<td>'+m.quantity.toLocaleString()+' '+m.uom+'</td>'
      +'<td>'+formatWan(m.amount)+' 万</td>'
      +'<td>'+m.subinventory+'</td>'
      +'<td>'+m.ageDays+' 天</td>'
      +'<td><span class="inv-pill '+riskCls+'">'+m.riskLevel+'</span></td>'
      +'<td>'+m.riskReason+'</td>'
      +'<td>'+m.availableQty.toLocaleString()+'</td>'
      +'<td>'+m.reservedQty.toLocaleString()+'</td>'
      +'<td>'+m.demand30.toLocaleString()+'</td>'
      +'<td><span class="inv-pill '+statusCls+'">'+m.status+'</span></td>'
      +'<td><div class="inv-tag-group">'+m.tags.map(function(t){return '<span class="inv-pill '+toneForTag(t)+'">'+t+'</span>';}).join('')+'</div></td>'
      +'<td>'+m.owner+'</td>'
      +'<td>'+m.actionPath+'</td>'
      +'<td>'+formatWan(m.releaseAmount)+' 万</td>'
      +'</tr>';
  }).join('');
}

// ═══════════════ 主入口 ═══════════════
window.initPage_inventory = function(){
  try {
    var fp = getFilteredProjects();
    var sel = document.getElementById('inventoryProjectSelect');
    if(sel) fillProjectSelect(sel, fp);
    consumeDrillDown('inventoryProjectSelect');
    var pid = sel && sel.value ? sel.value : (fp.length ? fp[0].id : null);
    if(!pid) return;
    var p = projects.find(function(x){return x.id===pid;});
    if(!p) return;
    var d = getInvData(p);
    var st = compositeState(p);

    // ① Hero
    var hero = document.getElementById('invHero');
    if(hero){
      var toneCls = st.tone==='good'?'green':st.tone==='focus'?'orange':st.tone==='warn'?'orange':'red';
      hero.innerHTML = '<div class="inv-hero-left"><h2 class="inv-hero-title">'+p.name+' — 项目库存健康</h2>'
        +'<div class="inv-hero-sub">'+p.bg+' · '+p.bu+' · '+p.customer+' · '+p.productLine+' · '+(p.lifecycleRaw||p.lifecycle)+' · '+(p.engStage||'')+'</div></div>'
        +'<div class="inv-hero-right"><span class="inv-judge-pill-lg '+toneCls+'">'+st.label+'</span><span class="inv-hero-verdict">'+projectVerdict(p)+'</span></div>';
    }

    // ② 8指标汇总
    var sg = document.getElementById('invSummaryGrid');
    if(sg){
      sg.innerHTML = metricDefs.map(function(m){
        var v = d[m.key];
        var t = metricStatus(p, m.key);
        var colorCls = t==='red'?'c-red':t==='orange'?'c-yellow':'c-green';
        var dot = t==='green' ? '' : '<span class="inv-sum-signal '+t+'"></span>';
        return '<div class="inv-sum-card '+colorCls+'" title="'+m.header+'&#10;定义：'+m.definition+'&#10;计算：'+m.formula+'&#10;橙灯：'+m.orangeRule+'&#10;红灯：'+m.redRule+'">'
          +'<div class="inv-sum-label">'+m.header+'</div>'
          +'<div class="inv-sum-value">'+formatMetricValue(m, v)+'</div>'
          +'<div class="inv-sum-sub">'+dot+' '+m.label+'</div>'
          +'</div>';
      }).join('');
    }

    // ④ 链路
    invRenderChain(p);

    // ⑤ 物料明细
    invRenderMaterials(p);

  } catch(e){ console.error('inventory init error:', e); }
};

registerModule('inventory', initPage_inventory);

})();
