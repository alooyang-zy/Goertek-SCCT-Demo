// ===== 项目成本可视 V5.6 — 供应链总成本看板 =====
// 基于《歌尔供应链控制塔项目_供应链总成本_原型设计V5.6.html》
// IIFE 模块，平台融合版
(function(){
"use strict";

var periodMeta = { day:{factor:0.08,label:"今日",suffix:"今日"}, week:{factor:0.32,label:"本周",suffix:"本周"}, month:{factor:1,label:"本月",suffix:"本月"} };

var metricNames = {
  S1:"供应链总成本",S2:"供应链总成本率",S3:"总成本基线偏差",S4:"CLP成本结构占比",
  C0:"供应链运营成本",C1:"采购与供应商运营成本",C2:"库存持有成本",C3:"正常仓储与物流运营成本",C4:"计划运营与协调成本",
  L0:"供应链损失成本",L1:"呆滞物料损失成本",L2:"报废物料损失成本",L3:"紧急采购现货溢价损失",L4:"供应商份额偏差损失成本",L5:"缺料停线损失成本",L6:"跳票/突发品质不良异常处理损失成本",L7:"加急运输与空运增量成本",L8:"客户交付类罚款与索赔",
  P0:"供应链前瞻投入成本",P1:"策略储备库存投入成本",P2:"供应资源与供应商能力提升投入成本",
  D1:"供应链总成本采购强度",D2:"单位供应链总成本",D3:"损失成本占比",D4:"前瞻投入占比",D5:"采购与供应商运营成本率",D6:"库存持有成本率",D7:"正常仓储物流成本率",D8:"计划运营协调成本率",D9:"库存周转天数",D10:"损失成本率",D11:"呆滞报废损失率",D12:"紧急采购溢价率",D13:"缺料停线损失率",D14:"异常物流费用占比",D15:"客户交付索赔率",D16:"前瞻投入率",D17:"P类投入回报率"
};

var dGroups = [
  {key:"经营总览",metrics:["D1","D2","D3","D4"]},
  {key:"运营效率",metrics:["D5","D6","D7","D8","D9"]},
  {key:"损失风险",metrics:["D10","D11","D12","D13","D14","D15"]},
  {key:"前瞻投入",metrics:["D16","D17"]}
];

var projects = [
  {id:"XR-26-NPI-A01",name:"XR声学模组A01",bg:"消费电子BG",bu:"声学BU",customer:"海外客户A",stage:"PVT爬坡",owner:"IP-声学一部",revenue:620,procurement:360,output:12800,baseline:45.5,inventory:96,shipAmount:515,lineValue:118,standardTransport:4.4,emergencyPurchase:10.5,pBenefit:3.8,invDays:48,c:{C1:9.6,C2:11.8,C3:7.4,C4:4.9},l:{L1:5.8,L2:2.6,L3:2.9,L4:1.4,L5:2.7,L6:1.8,L7:1.9,L8:0.7},p:{P1:5.6,P2:2.2},trend:[42,43,44,45,47,48,50,51,53,54,55,54,53,52],cTrend:[30,31,32,32,33,34,34,34,35,35,35,34,34,34],lTrend:[8,8.5,9,9.5,10.8,11.6,12.7,13.4,14.5,15.2,16,15,14,19.8],actions:[{metric:"L1",reason:"客户预测下修后专用镜片库存进入无需求区间",action:"锁定客户买单清单，同步推动跨项目转用与退供谈判",owner:"IP/销售/采购",saving:4.8,due:"06-24",status:"处理中"},{metric:"L7",reason:"爬坡延误导致连续三批次空运追交",action:"把缺料风险提前到日计划会，空运申请需绑定责任事件",owner:"物流/IP",saving:1.3,due:"06-18",status:"已启动"}]},
  {id:"AIR-25-MP-B09",name:"TWS整机B09",bg:"消费电子BG",bu:"整机BU",customer:"海外客户B",stage:"MP量产",owner:"IP-整机平台",revenue:1180,procurement:690,output:56200,baseline:62.0,inventory:138,shipAmount:980,lineValue:260,standardTransport:7.2,emergencyPurchase:8.8,pBenefit:3.0,invDays:32,c:{C1:13.2,C2:10.6,C3:11.9,C4:4.8},l:{L1:2.1,L2:1.2,L3:1.1,L4:0.9,L5:1.4,L6:1.1,L7:0.8,L8:0.3},p:{P1:2.1,P2:1.2},trend:[52,53,54,55,57,58,59,60,60,61,60,61,62,63],cTrend:[38,39,40,40,41,41,41,42,42,42,42,42,41,41],lTrend:[7,7,7.2,7.3,7.5,7.7,8,8.2,8.3,8.5,8.4,8.6,8.7,8.9],actions:[{metric:"D7",reason:"海外出货频次高，标准物流单位成本高于同类项目",action:"合并同客户同区域出货窗口，降低零散出运比例",owner:"物流",saving:1.1,due:"06-20",status:"执行中"},{metric:"D2",reason:"单位供应链总成本略高于量产稳定项目均值",action:"复盘仓储作业、采购管理和计划协同三项单位成本",owner:"IP/计划",saving:0.9,due:"06-25",status:"待评审"}]},
  {id:"SPK-25-MOD-C18",name:"智能音箱模组C18",bg:"智能硬件BG",bu:"声学BU",customer:"国内客户C",stage:"MP量产",owner:"IP-智能硬件",revenue:760,procurement:430,output:36500,baseline:43.2,inventory:82,shipAmount:630,lineValue:145,standardTransport:5.4,emergencyPurchase:5.4,pBenefit:1.9,invDays:29,c:{C1:10.7,C2:7.9,C3:8.6,C4:3.2},l:{L1:1.3,L2:0.8,L3:0.6,L4:0.4,L5:1.2,L6:0.7,L7:0.5,L8:0.1},p:{P1:1.6,P2:0.8},trend:[39,40,40,41,42,41,42,43,42,43,43,44,43,43],cTrend:[29,30,30,30,31,30,31,31,30,31,31,31,31,30],lTrend:[5,5,5,5,5.4,5.2,5.3,5.5,5.3,5.4,5.5,5.8,5.6,5.6],actions:[{metric:"D5",reason:"供应商认证与维护活动集中发生",action:"把共用供应商活动按受益项目拆分，避免单项目承担",owner:"采购",saving:0.8,due:"06-16",status:"已启动"},{metric:"L5",reason:"低频缺料停线，影响小时数可控",action:"纳入风险雷达观察，暂不生成专项工单",owner:"IP",saving:0.5,due:"06-19",status:"观察"}]},
  {id:"MIC-26-NPI-D05",name:"MEMS麦克风NPI D05",bg:"零组件BG",bu:"微电子BU",customer:"海外客户D",stage:"DVT试产",owner:"IP-微电子",revenue:280,procurement:155,output:5200,baseline:29.8,inventory:52,shipAmount:205,lineValue:65,standardTransport:2.3,emergencyPurchase:3.6,pBenefit:2.2,invDays:55,c:{C1:6.3,C2:5.8,C3:4.1,C4:3.7},l:{L1:1.0,L2:0.6,L3:0.7,L4:0.6,L5:0.5,L6:1.2,L7:0.4,L8:0.0},p:{P1:3.0,P2:4.6},trend:[25,26,27,28,29,31,30,31,32,32,33,34,33,34],cTrend:[18,18,19,19,20,20,20,20,21,21,21,21,20,20],lTrend:[4,4,4.2,4.5,4.6,4.8,4.6,4.9,5,5,5.1,5.2,5,5],actions:[{metric:"D16",reason:"备用源认证与样品测试集中发生，前瞻投入强度偏高",action:"与研发里程碑绑定，DVT后复盘P2投入收益",owner:"采购/研发",saving:1.2,due:"06-30",status:"执行中"},{metric:"D8",reason:"试产变更频次高，计划协调成本偏高",action:"建立NPI变更冻结窗口，超窗变更进入成本看板",owner:"计划/研发",saving:0.9,due:"06-21",status:"处理中"}]},
  {id:"AUTO-24-SENS-E12",name:"车载声学传感E12",bg:"汽车电子BG",bu:"车载BU",customer:"主机厂E",stage:"MP量产",owner:"IP-车载",revenue:930,procurement:560,output:18200,baseline:58.0,inventory:128,shipAmount:780,lineValue:220,standardTransport:6.2,emergencyPurchase:12.0,pBenefit:2.5,invDays:43,c:{C1:13.4,C2:12.1,C3:9.9,C4:4.6},l:{L1:2.4,L2:1.9,L3:2.7,L4:2.2,L5:2.1,L6:1.6,L7:1.2,L8:0.8},p:{P1:4.2,P2:1.9},trend:[55,56,57,58,58,60,59,61,62,62,63,62,63,62],cTrend:[37,38,38,39,39,40,39,40,41,40,41,40,40,40],lTrend:[12,12,12.4,12.6,12.8,13.4,13,13.5,14,14,14.1,14,14.2,14.9],actions:[{metric:"L4",reason:"车规器件供应商份额临时切换，替代报价高于原价",action:"恢复主力供应商周交付份额，备用源只保留风险缓冲",owner:"采购/质量",saving:1.7,due:"06-22",status:"处理中"},{metric:"L8",reason:"客户OTIF未达成产生预计索赔",action:"建立主机厂交付红线订单每日复盘",owner:"客服/IP",saving:0.6,due:"06-18",status:"已启动"}]},
  {id:"AUD-25-PRO-G66",name:"专业音频G66",bg:"消费电子BG",bu:"声学BU",customer:"欧洲客户G",stage:"EOL尾期",owner:"IP-声学二部",revenue:360,procurement:220,output:11200,baseline:31.0,inventory:112,shipAmount:310,lineValue:76,standardTransport:2.8,emergencyPurchase:2.9,pBenefit:0.6,invDays:92,c:{C1:5.6,C2:8.9,C3:4.8,C4:2.1},l:{L1:8.4,L2:3.8,L3:0.6,L4:0.3,L5:0.2,L6:0.4,L7:0.2,L8:0.0},p:{P1:0.5,P2:0.2},trend:[29,30,31,32,34,35,36,37,38,39,40,41,41,42],cTrend:[19,20,20,21,21,21,21,21,22,22,22,21,21,21],lTrend:[9,9.4,10,10.5,12,13,14,15,15.5,16,17,18,18,13.9],actions:[{metric:"L1",reason:"EOL尾期预测下修，长库龄专用料无法消耗",action:"冻结新增采购，推动客户买单与跨项目转用",owner:"IP/销售/财务",saving:6.5,due:"06-24",status:"处理中"},{metric:"L2",reason:"旧版本结构件进入报废判定",action:"按残值回收、供应商退换和客户索赔三路径处置",owner:"仓储/质量",saving:1.9,due:"06-28",status:"已启动"}]},
  {id:"CAM-26-OPT-H22",name:"微型摄像模组H22",bg:"零组件BG",bu:"光学BU",customer:"国内客户H",stage:"EVT验证",owner:"IP-光学NPI",revenue:210,procurement:118,output:2800,baseline:24.2,inventory:46,shipAmount:168,lineValue:42,standardTransport:1.6,emergencyPurchase:2.1,pBenefit:1.5,invDays:61,c:{C1:4.8,C2:3.9,C3:3.2,C4:3.4},l:{L1:0.4,L2:0.3,L3:0.4,L4:0.2,L5:0.2,L6:0.8,L7:0.2,L8:0.0},p:{P1:2.2,P2:3.9},trend:[19,20,20,21,22,22,23,23,24,24,25,25,25,25],cTrend:[13,13.5,14,14,14.5,15,15,15,15.2,15.3,15.5,15.4,15.3,15.3],lTrend:[2,2,2.1,2.1,2.2,2.2,2.3,2.3,2.4,2.4,2.5,2.5,2.5,2.5],actions:[{metric:"P2",reason:"关键镜头备用源开发投入较高",action:"区分一次性认证投入与量产采购溢价，建立ROI追踪",owner:"采购/研发",saving:0.8,due:"06-30",status:"执行中"},{metric:"C4",reason:"EVT阶段变更频繁，计划协调成本偏高",action:"把BOM冻结点前置到试制评审节点",owner:"计划/研发",saving:0.5,due:"06-19",status:"处理中"}]},
  {id:"PAD-25-HAPT-F09",name:"平板触觉模组F09",bg:"智能硬件BG",bu:"精密结构BU",customer:"海外客户F",stage:"MP量产",owner:"IP-结构",revenue:540,procurement:310,output:24500,baseline:36.5,inventory:68,shipAmount:440,lineValue:108,standardTransport:3.7,emergencyPurchase:3.2,pBenefit:1.1,invDays:35,c:{C1:8.9,C2:6.4,C3:6.8,C4:2.7},l:{L1:1.1,L2:0.7,L3:0.5,L4:0.3,L5:0.6,L6:0.6,L7:0.4,L8:0.0},p:{P1:1.2,P2:0.6},trend:[31,32,32,33,34,34,35,35,35,36,35,35,36,36],cTrend:[23,23,24,24,24,25,25,25,25,25,25,25,25,25],lTrend:[3.5,3.6,3.6,3.7,3.8,3.8,3.9,4,4,4.1,4,4.1,4.2,4.2],actions:[{metric:"C3",reason:"跨仓调拨批次较多，标准物流费用偏高",action:"合并同客户同区域运输批次，降低单台仓配成本",owner:"物流",saving:0.7,due:"06-17",status:"执行中"},{metric:"C2",reason:"安全库存水位高于当前订单覆盖量",action:"把覆盖天数从9天下调到7天，观察断供风险",owner:"计划",saving:0.9,due:"06-20",status:"待评审"}]},
  {id:"VR-26-OPT-J31",name:"VR光学模组J31",bg:"智能硬件BG",bu:"光学BU",customer:"海外客户J",stage:"PVT爬坡",owner:"IP-VR光学",revenue:480,procurement:285,output:8600,baseline:38.5,inventory:88,shipAmount:390,lineValue:95,standardTransport:3.3,emergencyPurchase:6.8,pBenefit:2.6,invDays:58,c:{C1:7.4,C2:9.2,C3:5.8,C4:4.2},l:{L1:3.2,L2:1.1,L3:1.8,L4:1.0,L5:1.4,L6:1.5,L7:1.1,L8:0.2},p:{P1:4.9,P2:3.1},trend:[35,36,37,38,39,41,42,43,44,45,46,45,44,46],cTrend:[24,25,25,26,26,27,27,27,27,27,27,27,27,27],lTrend:[6,6.4,6.7,7.1,7.6,8.3,8.8,9.4,10,10.6,11,10.6,10.4,11.3],actions:[{metric:"D12",reason:"长周期光学件现货采购溢价高",action:"锁定未来四周需求，审批超框架价采购的触发原因",owner:"采购/IP",saving:1.4,due:"06-23",status:"处理中"},{metric:"D16",reason:"PVT阶段策略储备和供应能力提升投入同时发生",action:"按爬坡里程碑释放P1库存，P2投入纳入供应商能力复盘",owner:"计划/采购",saving:1.0,due:"06-27",status:"执行中"}]},
  {id:"IOT-25-SENS-K08",name:"IoT传感器K08",bg:"零组件BG",bu:"微电子BU",customer:"国内客户K",stage:"MP量产",owner:"IP-IoT",revenue:390,procurement:225,output:43800,baseline:24.8,inventory:44,shipAmount:318,lineValue:72,standardTransport:2.1,emergencyPurchase:1.8,pBenefit:0.9,invDays:26,c:{C1:5.1,C2:3.8,C3:4.4,C4:1.9},l:{L1:0.6,L2:0.2,L3:0.2,L4:0.1,L5:0.3,L6:0.2,L7:0.1,L8:0.0},p:{P1:0.8,P2:0.5},trend:[22,22.4,22.7,23,23.2,23.4,23.6,23.8,24,24.2,24.4,24.6,24.7,24.8],cTrend:[14.8,15,15.1,15.1,15.2,15.2,15.3,15.3,15.3,15.4,15.4,15.3,15.2,15.2],lTrend:[1.2,1.2,1.3,1.3,1.4,1.4,1.5,1.5,1.6,1.6,1.6,1.7,1.6,1.7],actions:[{metric:"D2",reason:"单位供应链总成本低于组合均值，作为对标项目",action:"沉淀低仓储低损失的标准作业方式",owner:"IP/物流",saving:0.3,due:"06-26",status:"复盘中"},{metric:"D9",reason:"库存周转保持健康，暂无管理红灯",action:"维持当前安全库存策略",owner:"计划",saving:0.2,due:"06-30",status:"观察"}]}
];

var thresholds = { D1:[12,16],D2:[28,48],D3:[18,28],D4:[10,18],D5:[2.2,3.2],D6:[8,12],D7:[1.3,1.8],D8:[0.8,1.3],D9:[45,70],D10:[1.6,3.2],D11:[6,11],D12:[18,28],D13:[1.2,2.2],D14:[12,22],D15:[0.05,0.12],D16:[1.2,2.4],D17:[45,25] };

var currentView = "overview";
var selectedProjectId = projects[0].id;
var selectedDomain = "L";
var selectedMetric = "L1";
var selectedLoss = "L1";
var els = {};

function sum(obj){ return Object.values(obj).reduce(function(a,b){return a+b;},0); }
function total(p){ return sum(p.c)+sum(p.l)+sum(p.p); }
function c0(p){ return sum(p.c); }
function l0(p){ return sum(p.l); }
function p0(p){ return sum(p.p); }
function scaleValue(v){ return v*periodMeta[els.period.value].factor; }
function fmtWan(v,d){ d=d||1; return v.toFixed(d)+"万"; }
function fmtPct(v,d){ d=d||1; return v.toFixed(d)+"%"; }
function fmtYuan(v,d){ d=d||1; return v.toFixed(d)+"元/件"; }

function calcD(p){
  var s=total(p);
  return {D1:s/p.procurement*100,D2:s*10000/p.output,D3:l0(p)/s*100,D4:p0(p)/s*100,D5:p.c.C1/p.procurement*100,D6:p.c.C2/p.inventory*100,D7:p.c.C3/p.shipAmount*100,D8:p.c.C4/p.revenue*100,D9:p.invDays,D10:l0(p)/p.revenue*100,D11:(p.l.L1+p.l.L2)/p.inventory*100,D12:p.emergencyPurchase?p.l.L3/p.emergencyPurchase*100:0,D13:p.l.L5/p.lineValue*100,D14:p.l.L7/(p.standardTransport+p.l.L7)*100,D15:p.l.L8/p.revenue*100,D16:p0(p)/p.revenue*100,D17:p0(p)?p.pBenefit/p0(p)*100:0};
}

function statusFor(metric,value){
  var t=thresholds[metric]||[999,999]; var amber=t[0],red=t[1];
  if(metric==="D17"){ if(value<red)return"red"; if(value<amber)return"amber"; return"green"; }
  if(value>=red)return"red"; if(value>=amber)return"amber"; return"green";
}
function statusText(s){ return s==="red"?"红色异常":s==="amber"?"黄色关注":"正常可控"; }

function projectStatus(p){
  var d=calcD(p);
  var red=Object.keys(d).filter(function(k){return statusFor(k,d[k])==="red";}).length;
  var amber=Object.keys(d).filter(function(k){return statusFor(k,d[k])==="amber";}).length;
  var gap=(total(p)-p.baseline)/p.baseline*100;
  if(red>=2||gap>=22||d.D10>=3.5)return"red";
  if(red===1||amber>=3||gap>=10)return"amber";
  return"green";
}

function topD(p,limit){
  limit=limit||3;
  var d=calcD(p);
  return Object.entries(d).map(function(e){return{metric:e[0],value:e[1],status:statusFor(e[0],e[1])};}).filter(function(item){return item.status!=="green";}).sort(function(a,b){return (a.status==="red"?-1:1)-(b.status==="red"?-1:1)||b.value-a.value;}).slice(0,limit);
}

function dValue(metric,value){
  if(metric==="D2")return fmtYuan(value);
  if(metric==="D9")return value.toFixed(0)+"天";
  return fmtPct(value);
}

function filteredProjects(){
  var projId = els.project.value;
  return projects.filter(function(p){
    if(projId && p.id !== projId) return false;
    // 全局筛选条件（BG/BU/客户/产品）- 使用 App.filter
    var gf = (typeof App!=='undefined' && App.filter) ? App.filter : {};
    if(gf.bg && p.bg !== gf.bg) return false;
    if(gf.bu && p.bu !== gf.bu) return false;
    if(gf.customer && p.customer !== gf.customer) return false;
    if(gf.product && p.productLine !== gf.product) return false;
    // 本地筛选条件
    if(els.stage.value&&p.stage!==els.stage.value)return false;
    if(els.status.value&&projectStatus(p)!==els.status.value)return false;
    return true;
  });
}

function selectedProject(){ return projects.find(function(p){return p.id===selectedProjectId;})||projects[0]; }
function uniqueValues(key){ return [...new Set(projects.map(function(p){return p[key];}))]; }
function fillSelect(select,values,allText){ select.innerHTML='<option value="">'+allText+'</option>'+values.map(function(v){return'<option value="'+v+'">'+v+'</option>';}).join(""); }

function sparkline(values,color){
  color=color||"#2364d8";
  var w=96,h=28,pad=3,min=Math.min.apply(null,values),max=Math.max.apply(null,values),range=max-min||1;
  var pts=values.map(function(v,i){var x=pad+i*((w-pad*2)/(values.length-1));var y=h-pad-(v-min)/range*(h-pad*2);return x.toFixed(1)+","+y.toFixed(1);}).join(" ");
  var last=pts.split(" ").slice(-1)[0].split(",");
  return '<svg class="v56-spark" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="2.6" fill="'+color+'"/></svg>';
}

function lineChart(seriesList,labels){
  labels=labels||[];
  var w=860,h=240,left=42,right=18,top=20,bottom=30;
  var all=[]; seriesList.forEach(function(s){all=all.concat(s.values);});
  var min=Math.min.apply(null,all)*0.92,max=Math.max.apply(null,all)*1.08,range=max-min||1;
  function x(i){return left+i*((w-left-right)/(seriesList[0].values.length-1));}
  function y(v){return h-bottom-(v-min)/range*(h-top-bottom);}
  var grid=[0,1,2,3].map(function(i){var gy=top+i*((h-top-bottom)/3);return'<line x1="'+left+'" y1="'+gy+'" x2="'+(w-right)+'" y2="'+gy+'" stroke="#e8eef6"/><text x="8" y="'+(gy+4)+'" fill="#617089" font-size="11">'+(max-i*range/3).toFixed(0)+'</text>';}).join("");
  var paths=seriesList.map(function(s){var d=s.values.map(function(v,i){return(i===0?"M":"L")+x(i).toFixed(1)+","+y(v).toFixed(1);}).join(" ");return'<path d="'+d+'" fill="none" stroke="'+s.color+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';}).join("");
  var legend=seriesList.map(function(s,i){return'<g transform="translate('+(w-260+i*120)+',10)"><circle cx="0" cy="0" r="4" fill="'+s.color+'"/><text x="8" y="4" fill="#617089" font-size="12">'+s.name+'</text></g>';}).join("");
  var axisLabels=labels.length?labels.map(function(label,i){return'<text x="'+x(i)+'" y="'+(h-8)+'" text-anchor="middle" fill="#617089" font-size="10">'+label+'</text>';}).join(""):"";
  return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="趋势图">'+grid+'<line x1="'+left+'" y1="'+(h-bottom)+'" x2="'+(w-right)+'" y2="'+(h-bottom)+'" stroke="#cbd5e1"/>'+paths+axisLabels+legend+'</svg>';
}

function barChart(items,color,unit){
  color=color||"#2364d8";unit=unit||"万";
  var w=860,h=240,left=148,right=32,top=14,rowH=24,max=Math.max.apply(null,items.map(function(i){return i.value;}).concat([1]));
  var bars=items.map(function(item,i){var y=top+i*rowH;var bw=(w-left-right)*item.value/max;return'<g><text x="0" y="'+(y+15)+'" fill="#172033" font-size="12">'+item.name+'</text><rect x="'+left+'" y="'+(y+4)+'" width="'+bw+'" height="14" rx="7" fill="'+(item.color||color)+'"/><text x="'+(left+bw+8)+'" y="'+(y+15)+'" fill="#617089" font-size="12">'+item.value.toFixed(1)+unit+'</text></g>';}).join("");
  return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="柱状图">'+bars+'</svg>';
}

function donutChart(items){
  var cx=132,cy=118,r=78,sw=30;
  var totalValue=items.reduce(function(a,b){return a+b.value;},0)||1;
  var circumference=2*Math.PI*r,offset=0;
  var arcs=items.map(function(item){var len=circumference*item.value/totalValue;var dash=len+" "+(circumference-len);var arc='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+item.color+'" stroke-width="'+sw+'" stroke-dasharray="'+dash+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';offset+=len;return arc;}).join("");
  var legend=items.map(function(item,i){return'<g transform="translate(282,'+(62+i*38)+')"><rect x="0" y="0" width="12" height="12" rx="3" fill="'+item.color+'"/><text x="20" y="11" fill="#172033" font-size="13" font-weight="700">'+item.name+'</text><text x="150" y="11" fill="#617089" font-size="13">'+fmtWan(scaleValue(item.value))+'｜'+fmtPct(item.value/totalValue*100)+'</text></g>';}).join("");
  return '<svg viewBox="0 0 620 250" role="img" aria-label="成本构成饼状图"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#edf2f7" stroke-width="'+sw+'"/>'+arcs+'<text x="'+cx+'" y="'+(cy-4)+'" text-anchor="middle" fill="#172033" font-size="18" font-weight="800">S1</text><text x="'+cx+'" y="'+(cy+18)+'" text-anchor="middle" fill="#617089" font-size="12">'+fmtWan(scaleValue(totalValue))+'</text>'+legend+'</svg>';
}

function movingAverage(seriesList){
  var len=seriesList[0].length;
  return Array.from({length:len},function(_,i){return seriesList.reduce(function(a,s){return a+s[i];},0)/seriesList.length;});
}

function riskScore(p){
  var d=calcD(p);
  var red=Object.keys(d).filter(function(k){return statusFor(k,d[k])==="red";}).length;
  var amber=Object.keys(d).filter(function(k){return statusFor(k,d[k])==="amber";}).length;
  var gap=Math.max((total(p)-p.baseline)/p.baseline*100,0);
  return red*18+amber*7+gap+l0(p)/total(p)*20+p.actions.reduce(function(a,b){return a+b.saving;},0);
}

function metricsForDomain(domain){
  if(domain==="C")return["C1","C2","C3","C4"];
  if(domain==="L")return["L1","L2","L3","L4","L5","L6","L7","L8"];
  return["P1","P2"];
}
function domainObj(p,domain){ return domain==="C"?p.c:domain==="L"?p.l:p.p; }
function domainTrend(p,domain){
  if(domain==="C")return p.cTrend;
  if(domain==="L")return p.lTrend;
  var base=p0(p);
  return p.trend.map(function(v,i){return +(base*(0.86+v/p.trend[p.trend.length-1]*0.13+Math.cos(i/2.6)*0.015)).toFixed(2);});
}

function metricSeries(p,metric){
  var base=domainObj(p,metric[0])[metric]||1;
  var pattern=p.trend.map(function(v,i){return 0.88+(v/p.trend[p.trend.length-1])*0.14+Math.sin(i/2)*0.018;});
  return pattern.map(function(x){return +(base*x).toFixed(2);});
}

function diagnosisSuggestion(metric,status){
  var s={D1:"采购强度偏高时，应回看C1供应商管理投入和L3紧急采购溢价。",D2:"单位成本偏高时，应区分产量爬坡、物流频次和损失成本三类因素。",D3:"损失占比偏高时，优先下钻L1-L8并建立责任事件。",D10:"损失成本率偏高时，需要同时看营收规模和损失事件金额。",D11:"呆滞报废损失率偏高时，应联动Aging、ECN和客户预测偏差。",D12:"紧急采购溢价率偏高时，检查长周期料、断供和插单触发原因。",D14:"异常物流费用占比偏高时，检查加急审批、标准线路基准和交付承诺。",D16:"前瞻投入率偏高时，需要明确受益项目和释放节奏。",D17:"投入回报偏低时，应建立基线、观察周期和收益确认规则。"};
  return s[metric]||(status==="green"?"当前处于可控区间，保持监控。":"建议进入项目复盘，确认业务原因和责任组织。");
}

// ===== 渲染函数 =====
function renderKpis(list){
  var s=list.reduce(function(a,p){return a+total(p);},0);
  var c=list.reduce(function(a,p){return a+c0(p);},0);
  var l=list.reduce(function(a,p){return a+l0(p);},0);
  var pVal=list.reduce(function(a,p){return a+p0(p);},0);
  var revenue=list.reduce(function(a,p){return a+p.revenue;},0);
  var output=list.reduce(function(a,p){return a+p.output;},0);
  var baseline=list.reduce(function(a,p){return a+p.baseline;},0);
  var red=list.filter(function(p){return projectStatus(p)==="red";}).length;
  var improve=list.reduce(function(a,p){return a+p.actions.reduce(function(x,c){return x+c.saving;},0);},0);
  var cards=[
    {cls:"s",label:periodMeta[els.period.value].suffix+" S1供应链总成本",value:fmtWan(scaleValue(s)),sub:"较基线 "+fmtPct((s-baseline)/baseline*100)},
    {cls:"c",label:"C0运营成本",value:fmtWan(scaleValue(c)),sub:"占S1 "+fmtPct(c/s*100)},
    {cls:"l",label:"L0损失成本",value:fmtWan(scaleValue(l)),sub:"占S1 "+fmtPct(l/s*100)},
    {cls:"p",label:"P0前瞻投入",value:fmtWan(scaleValue(pVal)),sub:"占S1 "+fmtPct(pVal/s*100)},
    {cls:"d",label:"D2单位供应链总成本",value:fmtYuan(s*10000/output),sub:"跨项目效率对比"},
    {cls:"warn",label:"红色异常项目",value:red+"个",sub:"预计改善 "+fmtWan(scaleValue(improve))}
  ];
  document.getElementById("v56-kpiGrid").innerHTML=cards.map(function(card){
    return '<div class="v56-kpi-card '+card.cls+'"><div class="v56-label">'+card.label+'</div><div class="v56-value">'+card.value+'</div><div class="v56-sub"><span>'+card.sub+'</span><span class="v56-pill '+(card.cls==="l"||card.cls==="warn"?"red":"gray")+'">'+periodMeta[els.period.value].label+'</span></div></div>';
  }).join("");
}

function renderStructureBars(list){
  var rows=[...list].sort(function(a,b){return total(b)-total(a);});
  document.getElementById("v56-structureBars").innerHTML=rows.map(function(p){
    var s=total(p);var c=c0(p)/s*100;var l=l0(p)/s*100;var pr=p0(p)/s*100;
    return '<div class="v56-stack-row"><div class="v56-name">'+p.name+'</div><div class="v56-stackbar" title="C '+fmtPct(c)+' / L '+fmtPct(l)+' / P '+fmtPct(pr)+'"><span class="v56-seg c" style="width:'+c+'%"></span><span class="v56-seg l" style="width:'+l+'%"></span><span class="v56-seg p" style="width:'+pr+'%"></span></div><div class="v56-num">'+fmtWan(scaleValue(s))+'</div><span class="v56-pill '+projectStatus(p)+'">'+statusText(projectStatus(p))+'</span></div>';
  }).join("")||'<div class="v56-empty">当前筛选条件下没有项目数据</div>';
}

function renderAlerts(list){
  var alerts=[...list].sort(function(a,b){return riskScore(b)-riskScore(a);}).slice(0,5);
  document.getElementById("v56-alertList").innerHTML=alerts.map(function(p){
    var top=topD(p,2);var main=top[0];
    return '<div class="v56-alert-item"><div><strong>'+p.name+'</strong><p>'+(main?main.metric+" "+metricNames[main.metric]+" "+dValue(main.metric,main.value)+"，"+statusText(main.status)+"。":"当前D类指标整体可控。")+'</p><p>建议关注：'+(p.actions[0]?p.actions[0].reason:"维持当前管理节奏")+'</p></div><span class="v56-pill '+projectStatus(p)+'">'+statusText(projectStatus(p))+'</span></div>';
  }).join("");
}

function renderProjectTable(list){
  document.getElementById("v56-projectCount").textContent=list.length+" 个项目";
  document.getElementById("v56-projectTableBody").innerHTML=list.map(function(p){
    var s=total(p);var status=projectStatus(p);var c=c0(p)/s*100;var l=l0(p)/s*100;var pr=p0(p)/s*100;var top=topD(p,3);
    return '<tr><td><div class="v56-project-name">'+p.name+'</div><div class="v56-project-sub">'+p.id+'｜'+p.customer+'｜'+p.owner+'</div></td><td>'+p.bg+'<div class="v56-project-sub">'+p.bu+'</div></td><td><span class="v56-pill gray">'+p.stage+'</span></td><td class="v56-num">'+fmtWan(scaleValue(s))+'</td><td class="v56-num">'+fmtPct(s/p.revenue*100)+'</td><td class="v56-num"><span class="v56-pill '+status+'">'+fmtPct((s-p.baseline)/p.baseline*100)+'</span></td><td><div class="v56-mini-stack"><span class="v56-seg c" style="width:'+c+'%"></span><span class="v56-seg l" style="width:'+l+'%"></span><span class="v56-seg p" style="width:'+pr+'%"></span></div><div class="v56-project-sub">C '+fmtPct(c,0)+' / L '+fmtPct(l,0)+' / P '+fmtPct(pr,0)+'</div></td><td>'+(top.length?top.map(function(item){return'<span class="v56-pill '+item.status+'" style="margin:2px 4px 2px 0;">'+item.metric+'</span>';}).join(""):'<span class="v56-pill green">无红黄灯</span>')+'<div class="v56-project-sub">'+(top[0]?metricNames[top[0].metric]:"D类诊断可控")+'</div></td><td>'+sparkline(p.trend,status==="red"?"#dc2626":status==="amber"?"#d97706":"#15a05d")+'</td><td><button class="v56-btn" onclick="window.v56selectProject(\''+p.id+'\',\'drill\')">下钻</button></td></tr>';
  }).join("")||'<tr><td colspan="10"><div class="v56-empty">当前筛选条件下没有项目数据</div></td></tr>';
}

function renderDiagnosisCards(list){
  var metrics=["D1","D2","D3","D10","D11","D12","D14","D16","D17","D9"];
  document.getElementById("v56-diagnosisCards").innerHTML=metrics.map(function(metric){
    var vals=list.map(function(p){return calcD(p)[metric];});
    var avg=vals.reduce(function(a,b){return a+b;},0)/Math.max(vals.length,1);
    var status=statusFor(metric,avg);
    var redCount=list.filter(function(p){return statusFor(metric,calcD(p)[metric])==="red";}).length;
    return '<div class="v56-diagnosis-card '+status+'"><div class="v56-metric"><span>'+metric+" "+metricNames[metric]+'</span><span class="v56-pill '+status+'">'+redCount+'红灯</span></div><div class="v56-value">'+dValue(metric,avg)+'</div><div class="v56-hint">组合均值｜'+statusText(status)+"；用于筛出需要下钻的项目和责任方向。</div></div>";
  }).join("");
}

function renderHeatmap(list){
  var metrics=dGroups.reduce(function(a,g){return a.concat(g.metrics);},[]);
  document.getElementById("v56-heatmapHead").innerHTML='<tr><th style="width:190px;">项目</th>'+metrics.map(function(m){return'<th style="width:70px;">'+m+'</th>';}).join("")+'</tr>';
  document.getElementById("v56-heatmapBody").innerHTML=list.map(function(p){
    var d=calcD(p);
    return '<tr onclick="window.v56selectProject(\''+p.id+'\',\'drill\')" style="cursor:pointer;"><td><div class="v56-project-name">'+p.name+'</div><div class="v56-project-sub">'+p.stage+'｜'+p.customer+'</div></td>'+metrics.map(function(m){var status=statusFor(m,d[m]);return'<td><span class="v56-heat-cell '+status+'" title="'+metricNames[m]+'：'+dValue(m,d[m])+'">'+(status==="red"?"高":status==="amber"?"中":"低")+'</span></td>';}).join("")+'</tr>';
  }).join("");
}

function renderRankList(list){
  var ranked=[...list].sort(function(a,b){return riskScore(b)-riskScore(a);}).slice(0,6);
  document.getElementById("v56-rankList").innerHTML=ranked.map(function(p,idx){
    var top=topD(p,3);
    return '<div class="v56-rank-card"><strong>'+(idx+1)+". "+p.name+'</strong><p>风险分 '+riskScore(p).toFixed(1)+"｜"+(top.map(function(item){return item.metric+" "+dValue(item.metric,item.value);}).join("；")||"D类指标可控")+'</p><p>优先动作：'+(p.actions[0]?p.actions[0].action:"维持当前节奏")+'</p></div>';
  }).join("");
}

function renderDomainSummaryPage(domain,containers){
  var list=filteredProjects();
  var metrics=metricsForDomain(domain);
  var color=domain==="C"?"#0e9f9c":"#15a05d";
  var pill=domain==="C"?"teal":"green";
  var objGetter=function(p){return domainObj(p,domain);};
  if(!list.length){
    document.getElementById(containers.cards).innerHTML='<div class="v56-empty" style="grid-column:1/-1;">当前筛选范围内没有项目数据</div>';
    document.getElementById(containers.rank).innerHTML='<div class="v56-empty">当前筛选范围内没有项目数据</div>';
    document.getElementById(containers.trend).innerHTML='<div class="v56-empty">当前筛选范围内没有趋势数据</div>';
    return;
  }
  document.getElementById(containers.cards).innerHTML=metrics.map(function(metric){
    var amount=list.reduce(function(a,p){return a+(objGetter(p)[metric]||0);},0);
    var topProject=[...list].sort(function(a,b){return (objGetter(b)[metric]||0)-(objGetter(a)[metric]||0);})[0];
    var domainTotal=list.reduce(function(a,p){return a+sum(objGetter(p));},0)||1;
    return '<div class="v56-domain-card"><div class="v56-top"><span>'+metric+" "+metricNames[metric]+'</span><span class="v56-pill '+pill+'">'+fmtPct(amount/domainTotal*100)+'</span></div><div class="v56-amount">'+fmtWan(scaleValue(amount))+'</div><div class="v56-foot">最高项目：'+(topProject?topProject.name:"-")+"。点击单项目下钻可看趋势和责任动作。</div></div>";
  }).join("");
  var ranked=[...list].sort(function(a,b){return sum(objGetter(b))-sum(objGetter(a));}).slice(0,7);
  document.getElementById(containers.rank).innerHTML=ranked.map(function(p,idx){
    var domainAmount=sum(objGetter(p));var d=calcD(p);
    var focus=domain==="C"?["D5 "+dValue("D5",d.D5),"D6 "+dValue("D6",d.D6),"D7 "+dValue("D7",d.D7),"D8 "+dValue("D8",d.D8)]:["D16 "+dValue("D16",d.D16),"D17 "+dValue("D17",d.D17)];
    return '<div class="v56-rank-card"><strong>'+(idx+1)+". "+p.name+"｜"+fmtWan(scaleValue(domainAmount))+'</strong><p>'+(domain==="C"?"运营效率":"投入复盘")+"："+focus.join("；")+'</p><p>关联动作：'+(p.actions.find(function(a){return metrics.includes(a.metric)||a.metric.startsWith(domain);})?.action||p.actions[0]?.action||"维持当前管理节奏")+'</p></div>';
  }).join("")||'<div class="v56-empty">当前筛选范围内没有项目数据</div>';
  document.getElementById(containers.trend).innerHTML=lineChart([{name:domain+"类组合",values:movingAverage(list.map(function(p){return domainTrend(p,domain);})),color:color},{name:"S1组合",values:movingAverage(list.map(function(p){return p.trend;})),color:"#94a3b8"}],["D-13","","","","","","D-7","","","","","","","D"]);
}

function renderDomainCards(p){
  var cards=[
    {key:"C",label:"C0运营成本",amount:c0(p),ratio:c0(p)/total(p)*100,hint:"看正常资源投入是否高于同类项目",pill:"teal"},
    {key:"L",label:"L0损失成本",amount:l0(p),ratio:l0(p)/total(p)*100,hint:"看异常损失、责任归因和止损动作",pill:"red"},
    {key:"P",label:"P0前瞻投入",amount:p0(p),ratio:p0(p)/total(p)*100,hint:"看投入强度、受益项目和后续ROI",pill:"green"}
  ];
  document.getElementById("v56-domainCards").innerHTML=cards.map(function(card){
    return '<div class="v56-domain-card '+(selectedDomain===card.key?"active":"")+'" onclick="window.v56selectDomain(\''+card.key+'\')"><div class="v56-top"><span>'+card.label+'</span><span class="v56-pill '+card.pill+'">'+fmtPct(card.ratio)+'</span></div><div class="v56-amount">'+fmtWan(scaleValue(card.amount))+'</div><div class="v56-foot">'+card.hint+'</div></div>';
  }).join("");
}

function renderMetricBreakdown(p){
  var metrics=metricsForDomain(selectedDomain);var obj=domainObj(p,selectedDomain);var domainTotal=sum(obj);
  document.getElementById("v56-domainExplain").textContent=selectedDomain==="C"?"正常运营投入":selectedDomain==="L"?"异常损失止损":"前瞻投入复盘";
  document.getElementById("v56-metricBreakdown").innerHTML=metrics.map(function(metric){
    var amount=obj[metric];var ratio=amount/domainTotal*100;
    var rank=[...projects].sort(function(a,b){return (domainObj(b,selectedDomain)[metric]||0)-(domainObj(a,selectedDomain)[metric]||0);}).findIndex(function(x){return x.id===p.id;})+1;
    return '<div class="v56-metric-card '+(selectedMetric===metric?"active":"")+'" onclick="window.v56selectMetric(\''+metric+'\')"><div class="v56-metric-row"><strong>'+metric+" "+metricNames[metric]+'</strong><span class="v56-pill '+(selectedDomain==="L"?"red":selectedDomain==="P"?"green":"teal")+'">第'+rank+'名</span></div><div class="v56-metric-row" style="margin-top:10px;"><div class="v56-amount">'+fmtWan(scaleValue(amount))+'</div><span class="v56-pill gray">占'+selectedDomain+" "+fmtPct(ratio)+'</span></div><p style="margin-top:8px;">点击查看该指标的趋势、项目排名和关联行动。</p></div>';
  }).join("");
}

function renderProjectDiagnosis(p){
  var top=topD(p,6);
  var list=top.length?top:Object.entries(calcD(p)).slice(0,4).map(function(e){return{metric:e[0],value:e[1],status:"green"};});
  document.getElementById("v56-projectDiagnosisList").innerHTML=list.map(function(item){
    return '<div class="v56-diag-item"><strong>'+item.metric+" "+metricNames[item.metric]+' <span class="v56-pill '+item.status+'">'+statusText(item.status)+'</span></strong><p>当前值 '+dValue(item.metric,item.value)+"。"+diagnosisSuggestion(item.metric,item.status)+'</p></div>';
  }).join("");
}

function renderProjectActions(p){
  document.getElementById("v56-projectActionList").innerHTML=p.actions.map(function(a){
    return '<div class="v56-action-card"><strong>'+a.metric+" "+metricNames[a.metric]+"｜"+a.owner+'</strong><p>'+a.reason+'</p><p style="margin-top:6px;">动作：'+a.action+'</p><p style="margin-top:6px;">预计改善 '+fmtWan(a.saving)+"｜计划完成 "+a.due+"｜"+a.status+'</p></div>';
  }).join("");
}

function renderDrill(){
  var p=selectedProject();
  document.getElementById("v56-selectedProjectSummary").textContent=p.name+"｜"+p.id+"｜"+p.bg+"/"+p.bu+"｜"+p.customer+"｜"+p.stage+"｜S1 "+fmtWan(scaleValue(total(p)))+"｜S2 "+fmtPct(total(p)/p.revenue*100)+"｜状态 "+statusText(projectStatus(p));
  renderDomainCards(p);
  document.getElementById("v56-projectPieChart").innerHTML=donutChart([{name:"C0运营成本",value:c0(p),color:"#0e9f9c"},{name:"L0损失成本",value:l0(p),color:"#dc2626"},{name:"P0前瞻投入",value:p0(p),color:"#15a05d"}]);
  document.getElementById("v56-projectOverallTrend").innerHTML=lineChart([{name:"S1总成本",values:p.trend,color:"#2364d8"},{name:"C0运营",values:p.cTrend,color:"#0e9f9c"},{name:"L0损失",values:p.lTrend,color:"#dc2626"}],["D-13","","","","","","D-7","","","","","","","D"]);
  renderMetricBreakdown(p);
  renderProjectDiagnosis(p);
  renderProjectActions(p);
  document.getElementById("v56-selectedMetricName").textContent=selectedMetric+" "+metricNames[selectedMetric];
  var series=metricSeries(p,selectedMetric);
  var portfolio=movingAverage(projects.map(function(x){return metricSeries(x,selectedMetric);}));
  document.getElementById("v56-metricTrend").innerHTML=lineChart([{name:p.name,values:series,color:selectedMetric.startsWith("L")?"#dc2626":selectedMetric.startsWith("P")?"#15a05d":"#0e9f9c"},{name:"组合均值",values:portfolio,color:"#94a3b8"}],["D-13","","","","","","D-7","","","","","","","D"]);
}

function renderLossCards(list){
  var lossMetrics=["L1","L2","L3","L4","L5","L6","L7","L8"];
  document.getElementById("v56-lossCards").innerHTML=lossMetrics.map(function(metric){
    var amount=list.reduce(function(a,p){return a+p.l[metric];},0);
    var topProject=[...list].sort(function(a,b){return b.l[metric]-a.l[metric];})[0];
    return '<div class="v56-loss-card '+(selectedLoss===metric?"active":"")+'" onclick="window.v56selectLoss(\''+metric+'\')"><strong>'+metric+" "+metricNames[metric]+'</strong><div class="v56-metric-row" style="margin-top:10px;"><div class="v56-amount">'+fmtWan(scaleValue(amount))+'</div><span class="v56-pill red">L类</span></div><p style="margin-top:8px;">最高项目：'+(topProject?topProject.name:"-")+"，点击后下方联动项目展开与多维分析。</p></div>";
  }).join("");
}

function renderLossDimensions(list){
  var totalLoss=list.reduce(function(a,p){return a+(p.l[selectedLoss]||0);},0)||1;
  function by(key){var map=new Map();list.forEach(function(p){map.set(p[key],(map.get(p[key])||0)+(p.l[selectedLoss]||0));});return [...map.entries()].sort(function(a,b){return b[1]-a[1];})[0]||["-",0];}
  var topBg=by("bg"),topBu=by("bu"),topStage=by("stage"),topCustomer=by("customer");
  var redProjects=list.filter(function(p){return (p.l[selectedLoss]||0)/total(p)>0.08;}).length;
  var cards=[
    {title:"最高BG",value:topBg[0],body:fmtWan(scaleValue(topBg[1]))+"，占该损失 "+fmtPct(topBg[1]/totalLoss*100)},
    {title:"最高BU",value:topBu[0],body:fmtWan(scaleValue(topBu[1]))+"，说明责任组织需要优先介入"},
    {title:"集中阶段",value:topStage[0],body:fmtPct(topStage[1]/totalLoss*100)+" 的损失发生在该阶段"},
    {title:"重点客户",value:topCustomer[0],body:fmtWan(scaleValue(topCustomer[1]))+"，需要与客户承诺和订单波动联动分析"},
    {title:"红色项目",value:redProjects+"个",body:"按该损失占S1比例超过8%识别"}
  ];
  document.getElementById("v56-lossDimCards").innerHTML=cards.map(function(card){
    return '<div class="v56-diag-item"><strong>'+card.title+"｜"+card.value+'</strong><p>'+card.body+'</p></div>';
  }).join("");
}

function renderLoss(){
  var list=filteredProjects();
  renderLossCards(list);
  var sorted=[...list].sort(function(a,b){return b.l[selectedLoss]-a.l[selectedLoss];});
  var items=sorted.slice(0,8).map(function(p){return{name:p.name,value:scaleValue(p.l[selectedLoss]),color:projectStatus(p)==="red"?"#dc2626":"#d97706"};});
  document.getElementById("v56-lossFocusTitle").textContent=selectedLoss+" "+metricNames[selectedLoss]+"｜按项目贡献排序";
  document.getElementById("v56-lossChart").innerHTML=barChart(items,"#dc2626","万");
  renderLossDimensions(list);
  document.getElementById("v56-lossProjectBody").innerHTML=sorted.map(function(p){
    var amount=p.l[selectedLoss]||0;
    var action=p.actions.find(function(a){return a.metric===selectedLoss;})||p.actions.find(function(a){return a.metric.startsWith("L");})||p.actions[0];
    return '<tr><td><div class="v56-project-name">'+p.name+'</div><div class="v56-project-sub">'+p.id+"｜"+p.customer+'</div></td><td>'+p.bg+'<div class="v56-project-sub">'+p.bu+'</div></td><td><span class="v56-pill gray">'+p.stage+'</span></td><td class="v56-num">'+fmtWan(scaleValue(amount))+'</td><td class="v56-num">'+fmtPct(amount/l0(p)*100)+'</td><td class="v56-num"><span class="v56-pill '+(amount/total(p)>0.08?"red":amount/total(p)>0.04?"amber":"green")+'">'+fmtPct(amount/total(p)*100)+'</span></td><td>'+sparkline(metricSeries(p,selectedLoss),amount/total(p)>0.08?"#dc2626":"#d97706")+'</td><td>'+(action?action.reason+'<div class="v56-project-sub">下一步：'+action.action+'</div>':"暂无专项归因，建议进入单项目复盘")+'</td><td><button class="v56-btn" onclick="window.v56selectProject(\''+p.id+'\',\'drill\')">下钻</button></td></tr>';
  }).join("")||'<tr><td colspan="9"><div class="v56-empty">当前筛选范围内没有项目数据</div></td></tr>';
}

function renderCurrent(){
  var list=filteredProjects();
  if(currentView==="overview"){renderKpis(list);renderStructureBars(list);renderAlerts(list);renderProjectTable(list);}
  if(currentView==="cCost")renderDomainSummaryPage("C",{cards:"v56-cCostCards",rank:"v56-cCostRankList",trend:"v56-cCostTrend"});
  if(currentView==="pInvest")renderDomainSummaryPage("P",{cards:"v56-pInvestCards",rank:"v56-pInvestRankList",trend:"v56-pInvestTrend"});
  if(currentView==="loss")renderLoss();
  if(currentView==="diagnosis"){renderDiagnosisCards(list);renderHeatmap(list);renderRankList(list);}
  if(currentView==="drill")renderDrill();
}

function switchView(id){
  currentView=id;
  document.querySelectorAll("#page-cost .v56-tab").forEach(function(tab){tab.classList.toggle("active",tab.dataset.view===id);});
  document.querySelectorAll("#page-cost .v56-view").forEach(function(view){view.classList.toggle("active",view.id==="v56-view-"+id);});
  renderCurrent();
}

function selectProject(id,view){
  selectedProjectId=id;
  if(view)switchView(view);else renderCurrent();
}
function selectDomain(domain){selectedDomain=domain;selectedMetric=metricsForDomain(domain)[0];renderDrill();}
function selectMetric(metric){selectedMetric=metric;renderDrill();}
function selectLoss(metric){selectedLoss=metric;renderLoss();}

// 暴露给 onclick
window.v56selectProject=selectProject;
window.v56selectDomain=selectDomain;
window.v56selectMetric=selectMetric;
window.v56selectLoss=selectLoss;

function initPage_cost(){
  var container=document.getElementById("page-cost");
  if(!container)return;

  container.innerHTML='<div class="v56-page">'+
    '<div class="v56-toolbar">'+
    '<div class="v56-field"><label>统计范围</label><select id="v56-periodFilter"><option value="day">今日发生</option><option value="week">本周累计</option><option value="month">本月累计</option></select></div>'+
    '<div class="v56-field"><label>项目阶段</label><select id="v56-stageFilter"><option value="">全部阶段</option></select></div>'+
    '<div class="v56-field"><label>成本状态</label><select id="v56-statusFilter"><option value="">全部状态</option><option value="red">红色异常</option><option value="amber">黄色关注</option><option value="green">正常可控</option></select></div>'+
    '<div class="v56-field" style="min-width:220px"><label>项目</label><select id="v56-projectFilter"><option value="">全部项目</option></select></div>'+
    '<button class="v56-btn" id="v56-resetFilter" type="button" style="padding:6px 14px;font-size:12px;height:32px;margin-top:18px">重置</button>'+
    '</div>'+
    '<nav class="v56-nav">'+
    '<button class="v56-tab active" data-view="overview" type="button">管理总览</button>'+
    '<button class="v56-tab" data-view="cCost" type="button">C运营成本</button>'+
    '<button class="v56-tab" data-view="loss" type="button">L损失专项</button>'+
    '<button class="v56-tab" data-view="pInvest" type="button">P前瞻投入</button>'+
    '<button class="v56-tab" data-view="diagnosis" type="button">D诊断矩阵</button>'+
    '<button class="v56-tab" data-view="drill" type="button">项目分析</button>'+
    '</nav>'+

    '<section id="v56-view-overview" class="v56-view active">'+
    '<div id="v56-kpiGrid" class="v56-grid v56-kpi-grid"></div>'+
    '<div class="v56-two-col">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>项目供应链总成本结构</h2><p>每行一个项目，同时看总成本规模、C/L/P结构和D类诊断状态。</p></div><div class="v56-legend"><span><i class="v56-dot c"></i>C 运营</span><span><i class="v56-dot l"></i>L 损失</span><span><i class="v56-dot p"></i>P 前瞻投入</span></div></div><div id="v56-structureBars" class="v56-stack-wrap"></div></section>'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>今日管理关注</h2><p>从基线偏差、损失成本率、呆滞报废、异常物流和客户索赔中自动识别优先级。</p></div><span class="v56-pill blue">系统推荐</span></div><div id="v56-alertList" class="v56-alert-list"></div></section>'+
    '</div>'+
    '<section class="v56-card" style="margin-top:14px;"><div class="v56-section-head"><div><h2>多项目对比</h2><p>D类指标进入项目列表，管理者可以直接看到项目异常来自成本强度、单位成本、损失成本、库存质量还是交付索赔。</p></div><span class="v56-pill gray" id="v56-projectCount">0 个项目</span></div><div style="overflow-x:auto;"><table class="v56-table"><thead><tr><th style="width:220px;">项目</th><th style="width:150px;">BG / BU</th><th style="width:86px;">阶段</th><th class="v56-num" style="width:98px;">S1总成本</th><th class="v56-num" style="width:88px;">S2成本率</th><th class="v56-num" style="width:92px;">S3偏差</th><th style="width:142px;">CLP结构</th><th style="width:208px;">D类主要异常</th><th style="width:112px;">趋势</th><th style="width:88px;">操作</th></tr></thead><tbody id="v56-projectTableBody"></tbody></table></div></section>'+
    '</section>'+

    '<section id="v56-view-cCost" class="v56-view">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>C类运营成本：正常运营投入的效率管理</h2><p>C类页面只看正常供应链运转投入，重点比较C1-C4在不同项目、阶段、客户下的单位效率、占比结构和趋势变化。</p></div><span class="v56-pill teal">C0 = C1 + C2 + C3 + C4</span></div><div id="v56-cCostCards" class="v56-domain-cards"></div></section>'+
    '<div class="v56-two-col">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>C类项目展开</h2><p>按C类运营成本规模、单位成本和D5-D9诊断排序，定位采购、库存、物流、计划运营的效率问题。</p></div></div><div id="v56-cCostRankList" class="v56-diag-list"></div></section>'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>C类趋势与行动</h2><p>趋势和动作不再单独成页，而是在对应成本域内直接看到变化与动作。</p></div></div><div id="v56-cCostTrend" class="v56-chart-box"></div></section>'+
    '</div></section>'+

    '<section id="v56-view-loss" class="v56-view">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>L损失专项：点击L1-L8后联动展开项目明细</h2><p>损失专项是止损入口。选择任一损失指标后，下方联动展示该指标的项目贡献、维度拆解、趋势和项目级归因。</p></div><span class="v56-pill red">止损优先</span></div><div id="v56-lossCards" class="v56-loss-grid"></div></section>'+
    '<div class="v56-two-col">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>损失指标项目贡献</h2><p id="v56-lossFocusTitle">-</p></div></div><div id="v56-lossChart" class="v56-chart-box"></div></section>'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>多维度拆解</h2><p>从BG/BU、项目阶段、客户和责任方向判断这项损失到底集中在哪里。</p></div></div><div id="v56-lossDimCards" class="v56-diag-list"></div></section>'+
    '</div>'+
    '<section class="v56-card" style="margin-top:14px;"><div class="v56-section-head"><div><h2>该损失指标的项目展开</h2><p>每一行是一个项目在当前损失指标上的表现，支持继续进入单项目下钻。</p></div></div><div style="overflow-x:auto;"><table class="v56-table"><thead><tr><th style="width:220px;">项目</th><th style="width:150px;">BG / BU</th><th style="width:88px;">阶段</th><th class="v56-num" style="width:110px;">损失金额</th><th class="v56-num" style="width:110px;">占L0</th><th class="v56-num" style="width:110px;">占S1</th><th style="width:130px;">趋势</th><th>主要归因 / 下一步动作</th><th style="width:90px;">操作</th></tr></thead><tbody id="v56-lossProjectBody"></tbody></table></div></section>'+
    '</section>'+

    '<section id="v56-view-pInvest" class="v56-view">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>P类前瞻投入：从费用看板进入投资复盘</h2><p>P类页面关注策略储备库存和供应能力提升投入，管理重点是投入强度、受益项目、释放节奏和后续回报。</p></div><span class="v56-pill green">P0 = P1 + P2</span></div><div id="v56-pInvestCards" class="v56-domain-cards"></div></section>'+
    '<div class="v56-two-col">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>P类项目展开</h2><p>按P类投入强度、D16前瞻投入率和D17投入回报率判断项目是否存在投入过重或回报不清。</p></div></div><div id="v56-pInvestRankList" class="v56-diag-list"></div></section>'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>P类趋势与复盘</h2><p>查看前瞻投入是否随项目阶段释放，并对后续损失下降或效率提升形成复盘输入。</p></div></div><div id="v56-pInvestTrend" class="v56-chart-box"></div></section>'+
    '</div></section>'+

    '<section id="v56-view-diagnosis" class="v56-view">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>D类效率诊断：从金额看板进入问题定位</h2><p>D类不再作为指标解释，而是用于判断"异常在哪里"：采购强度、单位成本、损失占比、库存周转、异常物流、客户索赔、前瞻投入回报。</p></div><span class="v56-pill purple">D1-D17</span></div><div id="v56-diagnosisCards" class="v56-diagnosis-grid"></div></section>'+
    '<div class="v56-two-col">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>项目诊断热力图</h2><p>红色代表管理层需要介入，黄色代表业务关注，绿色代表当前可控。点击项目可进入单项目下钻。</p></div></div><div class="v56-heatmap-wrap"><table class="v56-heatmap"><thead id="v56-heatmapHead"></thead><tbody id="v56-heatmapBody"></tbody></table></div></section>'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>优先治理排序</h2><p>按D类红灯数量、损失成本率、基线偏差和可改善金额综合排序。</p></div></div><div id="v56-rankList" class="v56-diag-list"></div></section>'+
    '</div></section>'+

    '<section id="v56-view-drill" class="v56-view">'+
    '<section class="v56-card"><div class="v56-section-head"><div><h2>单项目下钻：构成、诊断、趋势、行动</h2><p id="v56-selectedProjectSummary">-</p></div><button class="v56-btn primary" id="v56-backToOverview" type="button">返回总览</button></div>'+
    '<div id="v56-domainCards" class="v56-domain-cards"></div>'+
    '<div class="v56-two-col">'+
    '<section class="v56-card"><div class="v56-panel-title"><h3>成本构成饼状图</h3><span class="v56-pill gray">C/L/P结构</span></div><div id="v56-projectPieChart" class="v56-chart-box"></div></section>'+
    '<section class="v56-card"><div class="v56-panel-title"><h3>项目总成本趋势</h3><span class="v56-pill blue">S1 / C0 / L0</span></div><div id="v56-projectOverallTrend" class="v56-chart-box"></div></section>'+
    '</div>'+
    '<div class="v56-split">'+
    '<section class="v56-card"><div class="v56-panel-title"><h3>成本构成下钻</h3><span id="v56-domainExplain" class="v56-pill gray">-</span></div><div id="v56-metricBreakdown" class="v56-metric-grid"></div></section>'+
    '<section class="v56-card"><div class="v56-panel-title"><h3>D类诊断与管理动作</h3><span class="v56-pill purple">定位问题</span></div><div id="v56-projectDiagnosisList" class="v56-diag-list"></div></section>'+
    '</div>'+
    '<div class="v56-two-col">'+
    '<section class="v56-card"><div class="v56-panel-title"><h3>选中指标趋势</h3><span id="v56-selectedMetricName" class="v56-pill blue">-</span></div><div id="v56-metricTrend" class="v56-chart-box"></div></section>'+
    '<section class="v56-card"><div class="v56-panel-title"><h3>归因与责任追踪</h3><span class="v56-pill amber">行动闭环</span></div><div id="v56-projectActionList" class="v56-diag-list"></div></section>'+
    '</div>'+
    '</section>'+
    '</div>';

  els={
    period:document.getElementById("v56-periodFilter"),
    stage:document.getElementById("v56-stageFilter"),
    status:document.getElementById("v56-statusFilter"),
    project:document.getElementById("v56-projectFilter")
  };

  fillSelect(els.stage,uniqueValues("stage"),"全部阶段");
  // 项目下拉框
  var projOpts = projects.map(function(p){return '<option value="'+p.id+'">'+p.name+' ('+p.id+')</option>';});
  els.project.innerHTML = '<option value="">全部项目</option>' + projOpts.join('');

  document.querySelectorAll("#page-cost .v56-tab").forEach(function(tab){tab.addEventListener("click",function(){switchView(tab.dataset.view);});});
  Object.values(els).forEach(function(el){el.addEventListener("input",renderCurrent);});
  document.getElementById("v56-resetFilter").addEventListener("click",function(){
    els.period.value="day";els.stage.value="";els.status.value="";els.project.value="";
    renderCurrent();
  });
  document.getElementById("v56-backToOverview").addEventListener("click",function(){switchView("overview");});

  renderCurrent();
}

registerModule('cost', initPage_cost);
})();
