// Module: sandtable v2 — 履约经营版·浅色（基于沙盘全景-新.html）
// 融合全局筛选 App.filter，IIFE模块化
(function(){
"use strict";

var RAIL_W=185, GUT=12, LANE_W=310, LANE_GAP=10;
var LANES_X0=RAIL_W+GUT;
function laneLeft(i){return LANES_X0+i*(LANE_W+LANE_GAP);}
function laneCx(i){return laneLeft(i)+LANE_W/2;}
var HEAD_H=50, ROW_Y0=HEAD_H+40, ROW_GAP=94;
function rowY(r){return ROW_Y0+r*ROW_GAP;}
var NODE_W=164, NODE_H=54, WH_W=74, WH_H=80;
var CANVAS_W=laneLeft(4)+LANE_W+6;
var CANVAS_H=rowY(5)+NODE_H+8;
var FACTOR=1.0;
var refreshTimer=null;
var clockTimer=null;

function trendHtml(m){
  var map={flow:["↑","st-up"],slowflow:["↑","st-up"],drain:["↓","st-down"],slow:["↑","st-up"],fixed:["–","st-flat"],stock:["–","st-flat"]};
  var t=map[m]||map.stock;
  return '<u class="st-tr '+t[1]+'">'+t[0]+'</u>';
}

var KPI=[["需求总量","12,544","件","","fixed"],["订单总量","11,200","件","","slowflow"],["未交付","4,000","件","st-warn","drain"],
  ["成品可发","1,920","件","st-ok","stock"],["承诺缺口","1,340","件","st-alert","drain"],["超期订单","680","件","st-alert","slow"]];

var LANES=[
  {code:"1",name:"需求→订单",main:[
    {id:"1.1",name:"客户预测",m:["客户预测数量","12,544","件"]},
    {id:"1.2",name:"客户订单",m:["客户PO数量","11,200","件"]},
    {id:"1.3",name:"交期承诺",m:["已承诺SO数量","9,860","件"]},
    {id:"1.4",name:"内部SO",m:["SO下达数量","11,200","件"]}],side:[]},
  {code:"2",name:"计划→备料",main:[
    {id:"2.1",name:"S&OP计划",m:["S&OP计划产量","12,544","件"]},
    {id:"2.2",name:"主需求计划",m:["成品需求计划","12,293","件"]},
    {id:"2.3",name:"主生产计划",m:["MPS计划产量","9,860","件"]},
    {id:"2.4",name:"物料计划",m:["PR创建数量","8,640","单"]},
    {id:"2.5",name:"物料齐套",m:["工单齐套率","82","%"],risk:"red"}],side:[]},
  {code:"3",name:"采购→入库",main:[
    {id:"3.1",name:"采购下单",m:["采购PO数量","35,840","件"]},
    {id:"3.2",name:"供应商协同",m:["准时交货率","79","%"],risk:"warn"},
    {id:"3.4",name:"送货计划",m:["ASN送货数量","13,440","件"]},
    {id:"3.5",name:"到料收货",m:["收货数量","12,096","件"]},
    {id:"3.6",name:"检验入库",m:["待检验数量","536","件"]},
    {id:"3.7",name:"材料库存",m:["在库数量","7,420","件"],wh:true}],
    side:[{id:"3.3",name:"供应商库存",m:["供应商库存","6,480","件"],wh:true,dir:"right",row:2}]},
  {code:"4",name:"生产→成品",main:[
    {id:"4.1",name:"生产排程",m:["排程计划数量","11,200","件"]},
    {id:"4.2",name:"物料配送",m:["已配送数量","740","件"]},
    {id:"4.3",name:"生产制造",m:["在制工单数","860","单"]},
    {id:"4.5",name:"成品入库",m:["工单入库数量","1,920","件"]},
    {id:"4.6",name:"质量检验",m:["入库待检量","240","件"]},
    {id:"4.7",name:"成品库存",m:["可用库存量","1,920","件"],wh:true}],
    side:[{id:"4.4",name:"半成品库存",m:["半成品库存","1,260","件"],wh:true,dir:"left",row:3}]},
  {code:"5",name:"物流→客户",main:[
    {id:"5.1",name:"发货指令",m:["发货计划数量","4,000","件"]},
    {id:"5.2",name:"出货拣配",m:["拣配差异","0","件"]},
    {id:"5.3",name:"报关订舱",m:["待报关票数","1","票"]},
    {id:"5.4",name:"发运离厂",m:["已发运数量","7,200","件"]},
    {id:"5.6",name:"交付签收",m:["OTD准时率","88","%"],risk:"red"},
    {id:"5.7",name:"售后退换",m:["RMA数量","12","单"]}],
    side:[{id:"5.5",name:"在途库存",m:["在途库存","3,180","件"],wh:true,dir:"left",row:3.5}]}
];

var CYC={"1":["2.0","2.2","↑"],"2":["2.5","3.3","↑"],"3":["4.0","4.6","↑"],"4":["3.5","3.9","↑"],"5":["2.0","2.0","→"]};
var CONN=[
  ["1.1","1.2","v"],["1.3","1.4","v"],
  ["2.1","2.2","v"],["2.2","2.3","v"],["2.3","2.4","v"],["2.4","2.5","v"],
  ["3.1","3.2","v"],["3.2","3.4","v"],["3.4","3.5","v"],["3.5","3.6","v"],["3.6","3.7","v"],
  ["4.1","4.2","v"],["4.2","4.3","v"],["4.3","4.5","v"],["4.5","4.6","v"],["4.6","4.7","v"],
  ["5.1","5.2","v"],["5.2","5.3","v"],["5.3","5.4","v"],["5.4","5.6","v"],["5.6","5.7","v"],
  ["1.1","2.1","x"],["2.4","3.1","x"],["2.2","4.1","topR"],["2.5","3.4","x"],["3.7","4.2","x"],["4.7","5.2","x"],
  ["3.2","3.3","wh"],["3.3","3.5","whO"],["4.3","4.4","wh"],["4.4","4.6","whO"],["5.4","5.5","wh"],["5.5","5.6","whO"],
  ["1.4","5.1","loop"]
];

function makePOS(){
  var pos={};
  LANES.forEach(function(L,i){
    L.main.forEach(function(n,r){
      if(n.wh) pos[n.id]={x:laneCx(i)-WH_W/2,y:rowY(r)+(NODE_H-WH_H)/2,w:WH_W,h:WH_H};
      else pos[n.id]={x:laneCx(i)-NODE_W/2,y:rowY(r),w:NODE_W,h:NODE_H};
    });
    L.side.forEach(function(s){
      var x=s.dir==="right"? laneLeft(i)+LANE_W-WH_W+12 : laneLeft(i)-12;
      pos[s.id]={x:x,y:rowY(s.row)+(NODE_H-WH_H)/2,w:WH_W,h:WH_H,side:true};
    });
  });
  return pos;
}
function boxFor(id,pos){var p=pos[id];return {cx:p.x+p.w/2,cy:p.y+p.h/2,left:p.x,right:p.x+p.w,top:p.y,bottom:p.y+p.h};}
function pathFor(a,b,pos,off){
  off=off||0;var A=boxFor(a,pos),B=boxFor(b,pos);
  if(Math.abs(A.cx-B.cx)<6){var y1=A.cy<B.cy?A.bottom:A.top,y2=A.cy<B.cy?B.top-1:B.bottom+1;return "M "+A.cx+" "+y1+" L "+B.cx+" "+y2;}
  var goRight=B.cx>A.cx, sx=goRight?A.right:A.left, tx=goRight?B.left-1:B.right+1, midX=(sx+tx)/2+off;
  return "M "+sx+" "+A.cy+" H "+midX+" V "+B.cy+" H "+tx;
}

var pktColor={v:"#2563eb",x:"#3b82f6",wh:"#0d9488"};
var yTop=rowY(0)-18;
function loopPath(a,b,pos){var A=boxFor(a,pos),B=boxFor(b,pos),yBot=CANVAS_H-8,xR=laneLeft(4)+LANE_W-8;return "M "+A.cx+" "+A.bottom+" V "+yBot+" H "+xR+" V "+B.cy+" H "+(B.right+1);}
function topRight(a,b,pos){var A=boxFor(a,pos),B=boxFor(b,pos);return "M "+A.right+" "+A.cy+" H "+(A.right+20)+" V "+yTop+" H "+B.cx+" V "+(B.top-1);}
function whOut(a,b,pos){var W=boxFor(a,pos),T=boxFor(b,pos);var side=W.cx>T.cx?(T.right+1):(T.left-1);return "M "+W.cx+" "+W.bottom+" V "+T.cy+" H "+side;}
function whIn(a,b,pos){var S=boxFor(a,pos),W=boxFor(b,pos);var sx=W.cx<S.cx?S.left:S.right;var mx=sx+(W.cx<S.cx?-16:16);var yH=Math.min(S.cy,W.top-20);return "M "+sx+" "+S.cy+" H "+mx+" V "+yH+" H "+W.cx+" V "+(W.top-1);}

var special={loop:loopPath,topR:topRight};
var xOff={"2.4>3.1":-12,"2.5>3.4":12};

var BEH={
  "1.1":"fixed","1.2":"slowflow","1.3":"slowflow","1.4":"slowflow",
  "2.1":"fixed","2.2":"fixed","2.3":"fixed","2.4":"fixed","2.5":"stock",
  "3.1":"flow","3.2":"stock","3.4":"flow","3.5":"flow","3.6":"stock","3.7":"stock","3.3":"stock",
  "4.1":"fixed","4.2":"flow","4.3":"stock","4.5":"flow","4.6":"stock","4.7":"stock","4.4":"stock",
  "5.1":"drain","5.2":"fixed","5.3":"stock","5.4":"flow","5.6":"stock","5.7":"slow","5.5":"stock"
};

var COUNT_UNIT=/件|单|票|行|条|个/;
var NUMS=[];
var FRAMES=8, FRAME=0;
function fmt(n){return Math.round(n).toLocaleString("zh-CN");}
function deltaFor(base){var d=base*0.012;if(base>=2000)d=Math.round(d/10)*10;else if(base>=200)d=Math.round(d/5)*5;else d=Math.round(d);return Math.max(1,d);}
function targetFor(o,f){if(f===0)return o.base;var b=o.base,d=o.delta;switch(o.mode){case"fixed":return b;case"flow":return b+d*f;case"slowflow":return b+Math.max(1,Math.round(d*0.4))*f;case"drain":return Math.max(Math.round(b*0.35),b-d*f);case"slow":return b+Math.max(1,Math.round(d*0.25))*Math.floor(f/2);default:return b;}}
function animateTo(o,to,dur){
  var from=o.cur, t0=performance.now();
  function step(t){var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3),v=from+(to-from)*e;o.cur=v;o.el.firstChild.nodeValue=fmt(v);if(p<1)requestAnimationFrame(step);else{o.cur=to;o.el.firstChild.nodeValue=fmt(to);}}
  requestAnimationFrame(step);
}

var DETAIL={
"1.1":{s:"需求→订单",qty:[["客户预测数量","12,544","件"]],tim:[],wrn:[["预测准确率","92.4","%","目标≥85%"]],j:"预测准确率 92.4%，需求计划质量正常。",o:"OC",l:"肖坤"},
"1.2":{s:"需求→订单",qty:[["客户PO数量","11,200","件"]],tim:[["PO平均回复时效","0.8","天"]],wrn:[["项目料号关联完整率","100","%","目标100%"]],j:"PO 回复 0.8 天，料号关联完整率 100%。",o:"OC",l:"肖坤"},
"1.3":{s:"需求→订单",qty:[["已承诺客户PO数量","11,200","件"],["已承诺预测数量","9,860","件"]],tim:[["ATP平均答复时效","3.2","小时"]],wrn:[["ATP承诺达成率","92","%","目标≥90%"]],j:"ATP 答复 3.2 小时，承诺达成率 92%。",o:"OC",l:"肖坤"},
"1.4":{s:"需求→订单",qty:[["SO下达数量","11,200","件"],["SO未结数量","4,000","件"]],tim:[],wrn:[["料号关联缺失","0","条"]],j:"SO 未结积压 4,000 件。",o:"OC",l:"肖坤"},
"2.1":{s:"计划→备料",qty:[["S&OP计划产量","12,544","件"]],tim:[],wrn:[],j:"与销售预测偏差 2%，S&OP 评审正常。",o:"PC",l:"王菲/李阳"},
"2.2":{s:"计划→备料",qty:[["成品需求计划量","12,293","件"]],tim:[],wrn:[],j:"主需求计划已发布，版本完整。",o:"计划专员",l:"计划拉通"},
"2.3":{s:"计划→备料",qty:[["MPS计划产量","9,860","件"],["MPS转工单数","9,400","单"]],tim:[],wrn:[["MPS达成率","96","%","目标≥95%"]],j:"MPS 达成率 96%，计划执行正常。",o:"PC",l:"王菲/李阳"},
"2.4":{s:"计划→备料",qty:[["PR创建数量","8,640","单"],["PR积压数量","120","单"]],tim:[],wrn:[],j:"PR 积压 120 单，物料计划正常推进。",o:"物控",l:"OPO"},
"2.5":{s:"计划→备料",qty:[["缺料工单数","18","单"],["缺料料号数","3","个"],["齐套工单数","842","单"]],tim:[["缺料工单平均等待","2.6","天"]],wrn:[["工单齐套率","82","%","红线<85%"],["计划单齐套率","76.5","%","红线<80%"]],j:"缺料影响 2 单承诺交期；工单齐套率 82% 低于 85% 红线，需缺料专项拉动。",im:"2 单 / 缺料料号 3 个 / 1,340 件缺口",o:"MC",l:"OPO",a:"缺料专项拉动+紧急采购",due:"2026-05-29"},
"3.1":{s:"采购→入库",qty:[["采购PO数量","35,840","件"],["未结PO数量","6,200","件"]],tim:[],wrn:[["供应商交期确认率","96.2","%","目标≥90%"]],j:"交期确认率 96.2%，采购下单正常。",o:"Buyer",l:"CEP"},
"3.2":{s:"采购→入库",qty:[["逾期未到货PO","8","行"],["PO确认数量","3,710","行"]],tim:[["供应商平均交期延误","1.8","天"]],wrn:[["供应商准时交货率","78.6","%","红线<90%"]],j:"供应商要货计划未及时回复、晚于需求1天；准时交货率 78.6% 低于 90%，需重排承诺交期。",im:"1,340 件承诺缺口",o:"Buyer",l:"CEP",a:"供应商提醒+绩效改善",due:"2026-05-30"},
"3.3":{s:"采购→入库",qty:[["供应商库存数量","6,480","件"]],tim:[["供应商库存平均库龄","12","天"]],wrn:[["供应商库存覆盖天数","8.2","天","≥安全阈值"]],j:"覆盖 8.2 天，供应端备货充足。",o:"采购专员",l:"采购拉通"},
"3.4":{s:"采购→入库",qty:[["ASN送货数量","13,440","件"]],tim:[["送货计划平均响应","6.5","小时"]],wrn:[["ASN提交及时率","91.5","%","目标≥85%"]],j:"ASN 及时率 91.5%，送货计划响应正常。",o:"Buyer",l:"CEP"},
"3.5":{s:"采购→入库",qty:[["收货数量","12,096","件"],["到料数量","12,200","件"]],tim:[["到料平均延误天数","1.2","天"]],wrn:[],j:"到料延误 1.2 天，收货差异 0。",o:"Buyer",l:"CEP"},
"3.6":{s:"采购→入库",qty:[["待检验数量","536","件"],["已检验数量","11,560","件"]],tim:[["IQC平均检验时效","6.4","小时"]],wrn:[["IQC检验及时率","90","%","目标≥90%"],["入库及时率","94","%","目标≥95%"]],j:"IQC 待检 536 件，检验及时率 90%，备料节奏正常受控。",o:"Buyer",l:"CEP"},
"3.7":{s:"采购→入库",qty:[["在库库存数量","7,420","件"],["在途库存数量","3,180","件"],["VMI库存数量","6,480","件"]],tim:[],wrn:[["呆滞库存占比","4.3","%","关注阈值"]],j:"无需求 PO 420 件、超期 OPO 160 件需处置；呆滞占比 4.3%。",o:"物控",l:"OPO"},
"4.1":{s:"生产→成品",qty:[["排程计划数量","11,200","件"],["工单下达数量","11,000","单"]],tim:[],wrn:[["排程达成率","100","%","目标100%"]],j:"排程覆盖完整，达成率 100%。",o:"PC",l:"王菲/李阳"},
"4.2":{s:"生产→成品",qty:[["已配送数量","740","件"],["缺料未配送积压","12","单"]],tim:[],wrn:[["物料配送及时率","98.4","%","目标≥95%"]],j:"配送及时率 98.4%，少量缺料待补。",o:"物控",l:"OPO"},
"4.3":{s:"生产→成品",qty:[["在制工单总数","860","单"],["工单完工数量","740","单"]],tim:[["超计划平均延误","2.6","天"]],wrn:[["工单准时完工率","94","%","目标≥95%"]],j:"准时完工率 94%，36 单超计划需关注。",o:"PC",l:"王菲/李阳"},
"4.4":{s:"生产→成品",qty:[["半成品库存数量","1,260","件"]],tim:[["半成品平均滞留","3.1","天"]],wrn:[["半成品滞留占比","6.0","%","关注阈值"]],j:"半成品滞留 3.1 天，占比 6%。",o:"生产计划员",l:"生产拉通"},
"4.5":{s:"生产→成品",qty:[["工单入库数量","1,920","件"]],tim:[["成品平均入库时效","1.6","小时"]],wrn:[["成品入库及时率","95.8","%","目标≥95%"]],j:"入库及时率 95.8%，完工未入库 80 件。",o:"OC",l:"肖坤"},
"4.6":{s:"生产→成品",qty:[["入库待检总量","240","件"]],tim:[["FQC平均检验时效","5.2","小时"]],wrn:[["FQC检验及时率","92.5","%","目标≥95%"]],j:"FQC 待检 240 件，检验及时率 92.5%，成品入库节奏正常。",o:"QC",l:"SQE"},
"4.7":{s:"生产→成品",qty:[["可用库存量","1,920","件"],["成品库存总量","2,100","件"],["承诺交付缺口","1,340","件"]],tim:[["成品Hold平均冻结","3.4","天"]],wrn:[["成品可发率","91.4","%","目标≥95%"]],j:"承诺交付缺口 1,340 件、可发率 91.4%。",im:"承诺缺口 1,340 件",o:"OC",l:"肖坤"},
"5.1":{s:"物流→客户",qty:[["发货计划总数量","4,000","件"]],tim:[["发货指令平均确认","2.0","小时"]],wrn:[],j:"发货指令确认 2 小时，无超期未确认。",o:"OC",l:"肖坤"},
"5.2":{s:"物流→客户",qty:[["拣配差异异常数量","0","件"]],tim:[["拣配平均完成时效","3.2","小时"]],wrn:[["拣货准确率","100","%","目标100%"]],j:"拣货准确率 100%，无拣配差异。",o:"WH",l:"央仓"},
"5.3":{s:"物流→客户",qty:[["计划报关总票数","6","票"]],tim:[["报关平均时效","1.2","天"]],wrn:[["报关及时率","83.3","%","目标≥95%"]],j:"1 票报关超期，报关及时率 83.3%。",o:"关务",l:"关务"},
"5.4":{s:"物流→客户",qty:[["已发运数量","7,200","件"]],tim:[["发运平均延误时效","2.4","小时"]],wrn:[["发运及时率","98.4","%","目标≥98%"]],j:"发运及时率 98.4%，当日待发 120 件。",o:"物流",l:"物流"},
"5.5":{s:"物流→客户",qty:[["在途库存量","3,180","件"]],tim:[["在途平均停留天数","4.2","天"]],wrn:[["在途库存超期占比","5.0","%","关注阈值"]],j:"在途停留 4.2 天，超期占比 5%。",o:"物流",l:"物流"},
"5.6":{s:"物流→客户",qty:[["超期订单数量","680","件"],["已签收单数","42","单"]],tim:[["超期订单平均超期","3.4","天"]],wrn:[["客户准时交货率OTD","88.4","%","目标≥95%"]],j:"有效承诺交期超期 680 件，OTD 88.4% 低于目标，需交付专项推进。",im:"超期订单 680 件·影响履约信誉",o:"OC",l:"肖坤",a:"POD回传+延期关闭闭环",due:"2026-05-30"},
"5.7":{s:"物流→客户",qty:[["RMA数量","12","单"]],tim:[["退换货平均处理周期","6","天"]],wrn:[["退换货闭环率","83","%","目标≥90%"]],j:"退换闭环率 83%，12 单 RMA 处理中。",o:"售后",l:"售后"}
};
var PERIODS=["W18","W19","W20","W21","W22","W23","W24","当周"];

function nodeOf(id){for(var i=0;i<LANES.length;i++){var L=LANES[i];for(var j=0;j<L.main.length;j++){if(L.main[j].id===id)return L.main[j];}for(var k=0;k<L.side.length;k++){if(L.side[k].id===id)return L.side[k];}}return null;}

function sparkSVG(base,mode,seed,thr){
  var st=seed||1;function rnd(){st=(st*9301+49297)%233280;return st/233280;}
  var dir=mode==='down'?-1:(mode==='up'?1:0);var pts=[];var v=base||100;
  for(var i=0;i<8;i++){pts.push(v);v=v*(1+dir*0.015+(rnd()-0.5)*0.05);}pts.reverse();
  var mn=Math.min.apply(null,pts),mx=Math.max.apply(null,pts);if(thr!=null){mn=Math.min(mn,thr);mx=Math.max(mx,thr);}
  var pad=(mn===mx?Math.abs(mn)*0.1+1:(mx-mn)*0.18);mn-=pad;mx+=pad;
  var w=520,h=92,px=8,py=10;function xs(i){return px+i*(w-2*px)/7;}function ys(p){return h-py-((p-mn)/((mx-mn)||1))*(h-2*py);}
  var dl=pts.map(function(p,i){return (i?'L':'M')+' '+xs(i).toFixed(1)+' '+ys(p).toFixed(1);}).join(' ');
  var area=dl+' L '+(w-px).toFixed(1)+' '+(h-py).toFixed(1)+' L '+px+' '+(h-py).toFixed(1)+' Z';
  var tl='';if(thr!=null){var ty=ys(thr).toFixed(1);tl='<line x1="'+px+'" y1="'+ty+'" x2="'+(w-px)+'" y2="'+ty+'" stroke="#e11d48" stroke-width="1" stroke-dasharray="4 3" opacity="0.75"/><text x="'+(w-px).toFixed(1)+'" y="'+(ys(thr)-3).toFixed(1)+'" text-anchor="end" font-size="9" fill="#e11d48">阈值 '+thr+'</text>';}
  var dots=pts.map(function(p,i){return '<circle cx="'+xs(i).toFixed(1)+'" cy="'+ys(p).toFixed(1)+'" r="'+(i===7?3.2:2)+'" fill="'+(i===7?'#1f6bff':'#9bbcf5')+'"/>';}).join('');
  return '<svg class="st-nd-spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><path d="'+area+'" fill="rgba(31,107,255,0.10)" stroke="none"/><path d="'+dl+'" fill="none" stroke="#1f6bff" stroke-width="2"/>'+tl+dots+'</svg>';
}

function modeFor(it,nd){if(it.cat==='wrn'&&(nd.risk==='red'||nd.risk==='warn'))return'down';if(it.cat==='qty'&&/数量|收货|发运|配送|入库|PO|签收|下达/.test(it.name))return'up';return'osc';}

function renderTrend(){
  var st=window._nd;if(!st)return;var it=st.items[st.sel];var base=parseFloat(String(it.val).replace(/,/g,''))||100;
  var thrP=it.thr?parseFloat(String(it.thr).match(/-?\d+(\.\d+)?/)?.[0]):null;var mode=modeFor(it,st.nd);
  var ok=(thrP==null||it.unit!=='%')?null:(/红线|目标|≥/.test(it.thr||'')?base>=thrP:base<=thrP);
  var interp=document.getElementById('st-nd-interp');
  if(interp)interp.innerHTML='<span class="st-ii-n">'+it.name+'</span><span class="st-ii-v">'+it.val+'<i>'+(it.unit||'')+'</i></span>'+(it.thr?'<span class="st-ii-t">阈值 '+it.thr+'</span>':'')+(ok===null?'':'<span class="st-ii-b '+(ok?'st-good':'st-bad')+'">'+(ok?'达标':'未达标')+'</span>');
  var tt=document.getElementById('st-nd-trend-t');if(tt)tt.textContent='近期趋势 · '+it.name;
  var ts=document.getElementById('st-nd-trend-svg');if(ts)ts.innerHTML=sparkSVG(base,mode,st.seed+st.sel*13,thrP);
  var tx=document.getElementById('st-nd-trend-x');if(tx)tx.innerHTML=PERIODS.map(function(p){return'<span>'+p+'</span>';}).join('');
  var its=document.querySelectorAll('.st-nd-it[data-i]');
  for(var i=0;i<its.length;i++){var isel=+its[i].getAttribute('data-i')===st.sel;its[i].classList.toggle('st-sel',isel);}
}
window.stSelectInd=function(i){if(!window._nd)return;window._nd.sel=i;renderTrend();};

function grp(cls,title,arr,off){
  var ck=arr.length?'onclick="stSelectInd('+off+')"':'';
  var html='<div class="st-nd-grp'+(arr.length?' st-clk':'')+'" '+ck+'><div class="st-gt '+cls+'">'+title+'</div>';
  if(arr.length){
    html+=arr.map(function(it,k){return'<div class="st-nd-it" data-i="'+(off+k)+'" onclick="event.stopPropagation();stSelectInd('+(off+k)+')"><span class="st-n">'+it[0]+'</span><span class="st-v">'+it[1]+'<i>'+(it[2]||'')+'</i>'+(it[3]?'<span class="st-thr">'+it[3]+'</span>':'')+'</span></div>';}).join('');
  }else{html+='<div class="st-nd-it"><span class="st-n">本节点无此类指标</span></div>';}
  return html+'</div>';
}

function openNode(id){
  var d=DETAIL[id],nd=nodeOf(id);if(!d||!nd)return;
  var badge=nd.risk==='red'?'st-red':nd.risk==='warn'?'st-warn':'st-ok';
  var blab=nd.risk==='red'?'红风险':nd.risk==='warn'?'黄风险':'正常';
  function sc(row){if(COUNT_UNIT.test(row[2]||'')){var nn=parseFloat(String(row[1]).replace(/,/g,''));if(!isNaN(nn))return[row[0],Math.round(nn*FACTOR).toLocaleString('zh-CN'),row[2],row[3]];}return row;}
  var SQ=d.qty.map(sc),ST=d.tim.map(sc),SW=d.wrn.map(sc);
  var items=[];SQ.forEach(function(x){items.push({cat:'qty',name:x[0],val:x[1],unit:x[2],thr:x[3]});});
  ST.forEach(function(x){items.push({cat:'tim',name:x[0],val:x[1],unit:x[2],thr:x[3]});});
  SW.forEach(function(x){items.push({cat:'wrn',name:x[0],val:x[1],unit:x[2],thr:x[3]});});
  var sel=items.findIndex(function(x){return x.cat==='wrn';});if(sel<0)sel=items.findIndex(function(x){return x.cat==='tim';});if(sel<0)sel=0;
  window._nd={id:id,nd:nd,items:items,sel:sel,seed:id.charCodeAt(0)*7+id.charCodeAt(2)};
  var acts=[];if(d.im)acts.push(['影响范围',d.im]);acts.push(['责任岗位',d.o||'—'],['拉通负责人',d.l||'—']);if(d.a)acts.push(['处理动作',d.a]);if(d.due)acts.push(['要求完成',d.due]);
  var oT=SQ.length,oW=SQ.length+ST.length;
  var html='<button class="st-nd-x" onclick="stCloseNode()">×</button>'+
    '<div class="st-nd-head"><span class="st-nd-id">'+id+'</span><h3>'+nd.name+'</h3><span class="st-nd-badge '+badge+'">'+blab+'</span><span class="st-nd-st">'+d.s+' · 经营体检</span></div>'+
    '<div class="st-nd-body">'+
    '<div class="st-nd-sec"><h5>节点体检<em class="st-nd-st" style="margin-left:8px">点击任一指标，下方解读与趋势联动</em></h5><div class="st-nd-groups">'+grp('st-q','数量·看进度',SQ,0)+grp('st-t','时效·看堵点',ST,oT)+grp('st-w','预警·看风险',SW,oW)+'</div></div>'+
    '<div class="st-nd-interp" id="st-nd-interp"></div>'+
    '<div class="st-nd-sec"><h5>经营判断 / 卡点</h5><p class="st-nd-judge">'+d.j+'</p></div>'+
    '<div class="st-nd-sec"><h5>影响与去向</h5><div class="st-nd-act">'+acts.map(function(c){return'<div class="st-ac"><small>'+c[0]+'</small><b>'+c[1]+'</b></div>';}).join('')+'</div></div>'+
    '<div class="st-nd-sec"><h5 id="st-nd-trend-t">近期趋势</h5><div id="st-nd-trend-svg"></div><div class="st-nd-xaxis" id="st-nd-trend-x"></div></div>'+
    '<div class="st-nd-foot">本视图面向经营决策；单据级执行明细（要货计划 / PO / 工单 / ASN 等）由计划、采购、生产在业务系统中下钻查看。</div>'+
    '</div>';
  var m=document.getElementById('stNdModal');m.querySelector('.st-nd-card').innerHTML=html;m.classList.add('st-open');renderTrend();
}
function closeNode(){var m=document.getElementById('stNdModal');if(m)m.classList.remove('st-open');}
window.stCloseNode=closeNode;

function cycleChart(act,tgt,labels){
  var w=640,h=200,pl=34,pr=12,pt=14,pb=26;var all=act.concat([tgt]);var mn=Math.floor(Math.min.apply(null,all)-1),mx=Math.ceil(Math.max.apply(null,all)+1);
  function xs(i){return pl+i*(w-pl-pr)/(act.length-1);}function ys(v){return h-pb-((v-mn)/((mx-mn)||1))*(h-pt-pb);}
  var grid='';for(var i=0;i<=4;i++){var val=mn+(mx-mn)*i/4,y=ys(val).toFixed(1);grid+='<line x1="'+pl+'" y1="'+y+'" x2="'+(w-pr)+'" y2="'+y+'" stroke="rgba(30,90,180,0.10)" stroke-width="1"/><text x="'+(pl-6)+'" y="'+(+y+3).toFixed(1)+'" text-anchor="end" font-size="9" fill="#7790ac">'+val.toFixed(0)+'</text>';}
  var dAct=act.map(function(v,i){return (i?'L':'M')+' '+xs(i).toFixed(1)+' '+ys(v).toFixed(1);}).join(' ');
  var yT=ys(tgt).toFixed(1);var tgtLine='<line x1="'+pl+'" y1="'+yT+'" x2="'+(w-pr)+'" y2="'+yT+'" stroke="#0aa2c0" stroke-width="2"/>';
  var dots=act.map(function(v,i){return'<circle cx="'+xs(i).toFixed(1)+'" cy="'+ys(v).toFixed(1)+'" r="'+(i===act.length-1?3.5:2.5)+'" fill="#f5803e"/>';}).join('');
  var xl=labels.map(function(l,i){return'<text x="'+xs(i).toFixed(1)+'" y="'+(h-9)+'" text-anchor="middle" font-size="9" fill="#7790ac">'+l+'</text>';}).join('');
  return '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:200px"><rect x="'+pl+'" y="'+pt+'" width="'+(w-pl-pr)+'" height="'+(h-pt-pb)+'" fill="rgba(31,107,255,0.03)"/>'+grid+tgtLine+'<path d="'+dAct+'" fill="none" stroke="#f5803e" stroke-width="2.5"/>'+dots+xl+'</svg>';
}
function openCycle(){
  var ST=[["需求→订单",2.2,2.0],["计划→备料",3.3,2.5],["采购→入库",4.6,4.0],["生产→成品",3.9,3.5],["物流→客户",2.0,2.0]];
  var cards=ST.map(function(x){var ov=x[1]>x[2];return'<div class="st-cyc-stage'+(ov?' st-over':'')+'"><div class="st-cs-n">'+x[0]+'</div><div class="st-cs-v">'+x[1].toFixed(1)+'<small>d</small></div><div class="st-cs-t">目标 '+x[2].toFixed(1)+'d '+(ov?'<span class="st-cs-d">+'+(x[1]-x[2]).toFixed(1)+'</span>':'<span class="st-cs-ok">达标</span>')+'</div></div>';}).join('<span class="st-cyc-plus">+</span>');
  var series=[14.5,15.2,16.8,15.0,14.2,15.5,16.2,16.0],labels=["04-09","04-16","04-23","04-30","05-07","05-14","05-21","05-28"];
  var html='<button class="st-nd-x" onclick="stCloseNode()">×</button>'+
    '<div class="st-nd-head"><span class="st-nd-id">周期</span><h3>履约周期分析</h3><span class="st-nd-badge st-red">实际 16d / 目标 14d · 超 2d</span><span class="st-nd-st">OTS · 端到端</span></div>'+
    '<div class="st-nd-body">'+
    '<div class="st-nd-sec"><h5>周期构成 · 各阶段拆解</h5><div class="st-cyc-eq"><div class="st-cyc-total"><div class="st-cs-n">履约周期</div><div class="st-cs-v">16.0<small>d</small></div><div class="st-cs-t">目标 14.0d</div></div><span class="st-cyc-eqs">=</span>'+cards+'</div></div>'+
    '<div class="st-nd-sec"><h5>历史趋势 · 履约周期（天）</h5><div class="st-cyc-legend"><span class="st-lg-a">实际</span><span class="st-lg-t">目标线 14d</span></div>'+cycleChart(series,14,labels)+'</div>'+
    '<div class="st-nd-sec"><h5>经营结论</h5><p class="st-nd-judge">履约周期 16 天、超目标 2 天；主要拖累为 <b>计划→备料（+0.8d，缺料齐套）</b> 与 <b>采购→入库（+0.6d，供应商交期）</b>。压缩这两段是缩短整体交期的关键。</p></div>'+
    '</div>';
  var m=document.getElementById('stNdModal');m.querySelector('.st-nd-card').innerHTML=html;m.classList.add('st-open');
}

function refreshSweep(container){
  FRAME=(FRAME+1)%FRAMES;
  var kcs=container.querySelectorAll(".st-kc");
  for(var i=0;i<kcs.length;i++){(function(c,j){setTimeout(function(){c.classList.remove("st-flash");void c.offsetWidth;c.classList.add("st-flash");},j*50);})(kcs[i],i);}
  NUMS.forEach(function(o,i){setTimeout(function(){animateTo(o,targetFor(o,FRAME),650);},(i%6)*50);});
}

function setRail(container){
  var g=container.querySelector('#st-rk-gap');if(g)g.firstChild.nodeValue=Math.round(1340*FACTOR).toLocaleString('zh-CN');
  var r=container.querySelector('#st-rk-risk');if(r)r.firstChild.nodeValue=Math.round(32*FACTOR);
}

function buildAll(container){
  container.innerHTML='';
  var gf=(typeof App!=='undefined'&&App.filter)?App.filter:{};
  var gHint='<b>全局筛选</b>';
  gHint+=' BG:<span class="st-val">'+(gf.bg||'全部')+'</span>';
  gHint+=' BU:<span class="st-val">'+(gf.bu||'全部')+'</span>';
  gHint+=' 客户:<span class="st-val">'+(gf.customer||'全部')+'</span>';
  gHint+=' 产品:<span class="st-val">'+(gf.product||'全部')+'</span>';

  var stageHtml=LANES.map(function(L,i){
    return'<div class="st-lane-col c'+i+'" style="left:'+laneLeft(i)+'px;top:'+(HEAD_H+6)+'px;width:'+LANE_W+'px;height:'+(CANVAS_H-HEAD_H-12)+'px;"></div>';
  }).join('');
  var headsHtml=LANES.map(function(L,i){
    return'<div class="st-lane-head" style="left:'+laneLeft(i)+'px;top:0;width:'+LANE_W+'px;height:'+HEAD_H+'px;"><div class="st-lh"><span class="st-num">'+L.code+'</span><strong>'+L.name+'</strong></div><span class="st-sub">目标 '+CYC[L.code][0]+'d · 实际 '+CYC[L.code][1]+'d</span></div>';
  }).join('');

  var POS=makePOS();
  var whSvg='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9.5l9-5 9 5V20H3z"/><rect x="9" y="13" width="6" height="7"/></svg>';
  function whboxMarkup(id,name,m,p){return'<button class="st-node st-whbox" data-id="'+id+'" style="left:'+p.x+'px;top:'+p.y+'px;width:'+p.w+'px;height:'+p.h+'px;"><span class="st-barL"></span><span class="st-whico">'+whSvg+'</span><span class="st-nid">'+id+'</span><span class="st-nnm">'+name+'</span><span class="st-mv" data-num="'+m[1]+'" data-mode="'+(BEH[id]||'stock')+'">0<i>'+m[2]+'</i></span></button>';}

  var nodesHtml='';
  LANES.forEach(function(L){
    L.main.forEach(function(n,r){
      var p=POS[n.id];
      if(n.wh){nodesHtml+=whboxMarkup(n.id,n.name,n.m,p);return;}
      var st=n.risk||"ok";
      nodesHtml+='<button class="st-node st-s-'+st+'" data-id="'+n.id+'" style="left:'+p.x+'px;top:'+p.y+'px;width:'+p.w+'px;height:'+p.h+'px;--st-d:'+(r*0.12).toFixed(2)+'s"><span class="st-barL"></span><span class="st-nh"><span class="st-led"></span><span class="st-nid">'+n.id+'</span><span class="st-nnm">'+n.name+'</span></span><span class="st-nb"><span class="st-ml">'+n.m[0]+'</span><span class="st-mv" data-num="'+n.m[1]+'" data-mode="'+(BEH[n.id]||'stock')+'">0<i>'+n.m[2]+'</i>'+trendHtml(BEH[n.id]||'stock')+'</span></span></button>';
    });
    L.side.forEach(function(s){nodesHtml+=whboxMarkup(s.id,s.name,s.m,POS[s.id]);});
  });

  // 构建SVG连线
  var paths='',pkts='';
  CONN.forEach(function(c){
    var isWh=(c[2]==="wh"||c[2]==="whO");
    var cls=isWh?"st-wh":(special[c[2]]?"st-x":"st-"+c[2]);
    var d;
    if(c[2]==="wh")d=whIn(c[0],c[1],POS);else if(c[2]==="whO")d=whOut(c[0],c[1],POS);else if(special[c[2]])d=special[c[2]](c[0],c[1],POS);else d=pathFor(c[0],c[1],POS,xOff[c[0]+">"+c[1]]||0);
    var mk=isWh?"st-arwW":"st-arw";
    paths+='<path class="st-lnk '+cls+'" d="'+d+'" marker-end="url(#'+mk+')"/>';
    var dur=(c[2]==="loop"?4.5:(1.5+Math.random()*1.2)).toFixed(2),beg=(-Math.random()*2.5).toFixed(2),col=pktColor[isWh?"wh":c[2]]||pktColor.x,r=isWh?3.5:2.5;
    pkts+='<circle class="st-pkt" r="'+r+'" fill="'+col+'" style="color:'+col+'"><animateMotion dur="'+dur+'s" begin="'+beg+'s" repeatCount="indefinite" path="'+d+'"/></circle>';
  });
  var svgHtml='<svg class="st-links" width="'+CANVAS_W+'" height="'+CANVAS_H+'" viewBox="0 0 '+CANVAS_W+' '+CANVAS_H+'"><defs><marker id="st-arw" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1f6bff"/></marker><marker id="st-arwW" markerWidth="12" markerHeight="12" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#0d9488"/></marker></defs>'+paths+pkts+'</svg>';

  var railHtml='<div class="st-rail" style="width:'+RAIL_W+'px;">'+
    '<div class="st-rail-ots" id="st-cyc-cell" style="height:'+HEAD_H+'px;cursor:pointer;"><span class="st-rt">履约周期</span><span class="st-nums"><span>目标<b>14</b></span><span>实际<b class="st-act">16</b></span></span></div>'+
    '<div class="st-rail-card"><h4>履约总览</h4>'+
    '<div class="st-hp-row"><span>OTD准时率</span><b class="st-bad">88%</b></div>'+
    '<div class="st-hp-row"><span>承诺缺口</span><b class="st-bad" id="st-rk-gap">1,340<i>件</i></b></div>'+
    '<div class="st-hp-row"><span>风险订单</span><b class="st-bad" id="st-rk-risk">32<i>单</i></b></div></div>'+
    '<div class="st-rail-card"><h4>风险分布</h4>'+
    '<div class="st-dist"><span class="st-seg-r" style="flex:2"></span><span class="st-seg-y" style="flex:1"></span><span class="st-seg-g" style="flex:27"></span></div>'+
    '<div class="st-warnrail"><div class="st-wr"><span class="st-led2 st-led-r"></span>红风险 · 2</div><div class="st-wr"><span class="st-led2 st-led-y"></span>黄风险 · 1</div><div class="st-wr"><span class="st-led2 st-led-g"></span>正常 · 27</div></div></div>'+
    '<div class="st-rail-card"><h4>TOP 风险卡点</h4>'+
    '<div class="st-top3" data-go="2.5"><span class="st-d st-d-r"></span><span class="st-t3"><b>2.5 物料齐套</b><em>缺料 2 单 · MC</em></span></div>'+
    '<div class="st-top3" data-go="5.6"><span class="st-d st-d-r"></span><span class="st-t3"><b>5.6 交付签收</b><em>超期 680 · OC</em></span></div>'+
    '<div class="st-top3" data-go="3.2"><span class="st-d st-d-y"></span><span class="st-t3"><b>3.2 供应商协同</b><em>准时 78.6% · Buyer</em></span></div></div>'+
    '<div class="st-rail-card"><h4>风险闭环</h4>'+
    '<div class="st-hp-row"><span>未关闭重大风险</span><b>2<i>项</i></b></div>'+
    '<div class="st-hp-row"><span>平均关闭周期</span><b>4.6<i>天</i></b></div>'+
    '<div class="st-hp-row"><span>关闭及时率</span><b>66.7%</b></div></div>'+
    '</div>';

  container.innerHTML='<div class="st-wrap">'+
    '<div class="st-global-hint">'+gHint+'</div>'+
    '<div class="st-kribbon" id="stKribbon">'+KPI.map(function(k){return'<div class="st-kc '+(k[3]||'')+'"><span class="st-sheen"></span><label>'+k[0]+'</label><b data-num="'+k[1]+'" data-mode="'+k[4]+'">0<i>'+k[2]+'</i>'+trendHtml(k[4])+'</b></div>';}).join("")+'</div>'+
    '<div class="st-board st-brk">'+
    '<span class="st-c st-tl"></span><span class="st-c st-tr"></span><span class="st-c st-bl"></span><span class="st-c st-br"></span>'+
    '<div class="st-board-head"><div class="st-bt"><i></i>端到端履约节点拓扑<em>A01 智能整机项目 · 点击任意节点查看经营体检</em></div>'+
    '<div class="st-legend"><span class="st-lg st-ok"><i></i>正常级</span><span class="st-lg st-warn"><i></i>次高风险</span><span class="st-lg st-red"><i></i>极端风险</span><span class="st-lg st-wh"><i></i>仓储节点</span></div></div>'+
    '<div class="st-canvas-wrap"><div class="st-canvas" id="stCanvas" style="width:'+CANVAS_W+'px;height:'+CANVAS_H+'px"><span class="st-beam"></span>'+stageHtml+svgHtml+headsHtml+railHtml+nodesHtml+'</div></div>'+
    '</div>'+
    '<div class="st-foot"><div class="st-pills"><span class="st-pill">履约节点: 30</span><span class="st-pill">缓冲库: 3</span><span class="st-pill" style="border-color:var(--st-red);color:var(--st-red)">红风险: 2</span><span class="st-pill" style="border-color:var(--st-warn);color:var(--st-warn)">黄风险: 1</span></div><span>Data Node Stream Alignment Matrix · Virtual Simulation Demo Data</span></div>'+
    '</div>';

  // 弹窗容器
  var modal=document.getElementById('stNdModal');
  if(!modal){modal=document.createElement('div');modal.id='stNdModal';modal.className='st-nd-modal';modal.innerHTML='<div class="st-nd-card"></div>';document.body.appendChild(modal);modal.addEventListener('click',function(e){if(e.target.id==='stNdModal')closeNode();});}
  else{modal.querySelector('.st-nd-card').innerHTML='';modal.classList.remove('st-open');}
}

function initMetrics(container){
  NUMS=[].slice.call(container.querySelectorAll("[data-num]")).map(function(el){
    return{el:el,base:parseFloat(el.dataset.num.replace(/,/g,""))||0,mode:el.dataset.mode||"stock",cur:0,seed:Math.random()*6.28};
  }).map(function(o){o.delta=deltaFor(o.base);o.base0=o.base;o.unit=((o.el.querySelector("i")||{}).textContent)||"";o.scalable=COUNT_UNIT.test(o.unit);return o;});
  NUMS.forEach(function(o){animateTo(o,o.base,950);});
}

function bindEvents(container){
  container.addEventListener('click',function(e){
    var n=e.target.closest('.st-node');
    if(n&&n.dataset.id){openNode(n.dataset.id);return;}
    var go= e.target.closest('[data-go]');
    if(go)openNode(go.getAttribute('data-go'));
  });
  var cc=container.querySelector('#st-cyc-cell');
  if(cc)cc.addEventListener('click',openCycle);
}

var currentProjectId=null;
var currentTimeRange='累计';

// 项目数据
var PROJECTS=[
  {id:'P001',name:'HW-TWS-A1001',customer:'华为',bg:'A01',bu:'A01-BU1',productLine:'真无线耳机',engStage:'EVT',pm:'张明远',scale:1.0},
  {id:'P002',name:'HW-TWS-A1002',customer:'华为',bg:'A01',bu:'A01-BU1',productLine:'真无线耳机',engStage:'DVT',pm:'李建国',scale:0.85},
  {id:'P004',name:'HW-TWS-A1004',customer:'华为',bg:'A01',bu:'A01-BU1',productLine:'真无线耳机',engStage:'MP',pm:'赵丽',scale:1.2},
  {id:'P005',name:'HW-TWS-A1005',customer:'华为',bg:'A01',bu:'A01-BU1',productLine:'真无线耳机',engStage:'MP',pm:'陈伟',scale:1.15},
  {id:'P009',name:'HW-OHP-A1003',customer:'华为',bg:'A01',bu:'A01-BU1',productLine:'头戴耳机',engStage:'MP',pm:'郑凯',scale:0.9},
  {id:'P038',name:'HW-ARG-C2001',customer:'华为',bg:'CEP',bu:'CEP-BU1',productLine:'AR眼镜',engStage:'EVT',pm:'吴芳',scale:0.65}
];
var TIMEF={"累计":1.0,"本年":0.85,"本月":0.24,"本周":0.065};

function initPage_sandtable(container){
  container=container||document.getElementById('page-sandtable');
  if(!container)return;
  container.innerHTML='';
  
  // 默认第一个项目
  currentProjectId=PROJECTS[0].id;

  container.innerHTML=
    '<div class="sandtable-shell">'+
    '<div class="st-wrap">'+
    // 筛选栏：项目 + 时间范围
    '<div class="st-filter-bar">'+
    '<div class="st-fl"><b>项目号</b><select class="st-sel" id="st-proj-select">'+PROJECTS.map(function(p){return'<option value="'+p.id+'">'+p.id+' · '+p.name+'</option>';}).join('')+'</select></div>'+
    '<div class="st-fl"><b>时间范围</b><select class="st-sel" id="st-time-select"><option value="累计" selected>累计</option><option value="本年">本年</option><option value="本月">本月</option><option value="本周">本周</option></select></div>'+
    '<div class="st-proj-info" id="st-proj-info"></div>'+
    '</div>'+
    '<div class="st-kribbon" id="stKribbon">'+KPI.map(function(k){return'<div class="st-kc '+(k[3]||'')+'"><span class="st-sheen"></span><label>'+k[0]+'</label><b data-num="'+k[1]+'" data-mode="'+k[4]+'">0<i>'+k[2]+'</i>'+trendHtml(k[4])+'</b></div>';}).join("")+'</div>'+
    '<div class="st-board st-brk">'+
    '<span class="st-c st-tl"></span><span class="st-c st-tr"></span><span class="st-c st-bl"></span><span class="st-c st-br"></span>'+
    '<div class="st-board-head"><div class="st-bt"><i></i>端到端履约节点拓扑<em>A01 智能整机项目 · 点击任意节点查看经营体检</em></div>'+
    '<div class="st-legend"><span class="st-lg st-ok"><i></i>正常级</span><span class="st-lg st-warn"><i></i>次高风险</span><span class="st-lg st-red"><i></i>极端风险</span><span class="st-lg st-wh"><i></i>仓储节点</span></div></div>'+
    '<div class="st-canvas-wrap"><div class="st-canvas" id="stCanvas" style="width:'+CANVAS_W+'px;height:'+CANVAS_H+'px"><span class="st-beam"></span>'+
    LANES.map(function(L,i){return'<div class="st-lane-col c'+i+'" style="left:'+laneLeft(i)+'px;top:'+(HEAD_H+6)+'px;width:'+LANE_W+'px;height:'+(CANVAS_H-HEAD_H-12)+'px;"></div>';}).join('')+
    '<svg class="st-links" width="'+CANVAS_W+'" height="'+CANVAS_H+'" viewBox="0 0 '+CANVAS_W+' '+CANVAS_H+'"><defs><marker id="st-arw" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1f6bff"/></marker><marker id="st-arwW" markerWidth="12" markerHeight="12" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#0d9488"/></marker></defs></svg>'+
    LANES.map(function(L,i){return'<div class="st-lane-head" style="left:'+laneLeft(i)+'px;top:0;width:'+LANE_W+'px;height:'+HEAD_H+'px;"><div class="st-lh"><span class="st-num">'+L.code+'</span><strong>'+L.name+'</strong></div><span class="st-sub">目标 '+CYC[L.code][0]+'d · 实际 '+CYC[L.code][1]+'d</span></div>';}).join('')+
    '<div class="st-rail" style="width:'+RAIL_W+'px;">'+
    '<div class="st-rail-ots" id="st-cyc-cell" style="height:'+HEAD_H+'px;cursor:pointer;"><span class="st-rt">履约周期</span><span class="st-nums"><span>目标<b>14</b></span><span>实际<b class="st-act">16</b></span></span></div>'+
    '<div class="st-rail-card"><h4>履约总览</h4><div class="st-hp-row"><span>OTD准时率</span><b class="st-bad">88%</b></div><div class="st-hp-row"><span>承诺缺口</span><b class="st-bad" id="st-rk-gap">1,340<i>件</i></b></div><div class="st-hp-row"><span>风险订单</span><b class="st-bad" id="st-rk-risk">32<i>单</i></b></div></div>'+
    '<div class="st-rail-card"><h4>风险分布</h4><div class="st-dist"><span class="st-seg-r" style="flex:2"></span><span class="st-seg-y" style="flex:1"></span><span class="st-seg-g" style="flex:27"></span></div><div class="st-warnrail"><div class="st-wr"><span class="st-led2 st-led-r"></span>红风险 · 2</div><div class="st-wr"><span class="st-led2 st-led-y"></span>黄风险 · 1</div><div class="st-wr"><span class="st-led2 st-led-g"></span>正常 · 27</div></div></div>'+
    '<div class="st-rail-card"><h4>TOP 风险卡点</h4><div class="st-top3" data-go="2.5"><span class="st-d st-d-r"></span><span class="st-t3"><b>2.5 物料齐套</b><em>缺料 2 单 · MC</em></span></div><div class="st-top3" data-go="5.6"><span class="st-d st-d-r"></span><span class="st-t3"><b>5.6 交付签收</b><em>超期 680 · OC</em></span></div><div class="st-top3" data-go="3.2"><span class="st-d st-d-y"></span><span class="st-t3"><b>3.2 供应商协同</b><em>准时 78.6% · Buyer</em></span></div></div>'+
    '<div class="st-rail-card"><h4>风险闭环</h4><div class="st-hp-row"><span>未关闭重大风险</span><b>2<i>项</i></b></div><div class="st-hp-row"><span>平均关闭周期</span><b>4.6<i>天</i></b></div><div class="st-hp-row"><span>关闭及时率</span><b>66.7%</b></div></div>'+
    '</div>'+
    buildNodesHTML()+
    '</div></div>'+
    '</div>'+
    '<div class="st-foot"><div class="st-pills"><span class="st-pill">履约节点: 30</span><span class="st-pill">缓冲库: 3</span><span class="st-pill" style="border-color:var(--st-red);color:var(--st-red)">红风险: 2</span><span class="st-pill" style="border-color:var(--st-warn);color:var(--st-warn)">黄风险: 1</span></div><span>Data: Virtual Simulation Demo</span></div>'+
    '</div></div>';

  setupSVGLinks(container);
  initMetrics(container);
  bindEvents(container);
  updateProjectInfo(container);

  // 项目/时间联动
  var projSel=container.querySelector('#st-proj-select');
  var timeSel=container.querySelector('#st-time-select');
  if(projSel){projSel.addEventListener('change',function(){currentProjectId=this.value;onFilterChange(container);});}
  if(timeSel){timeSel.addEventListener('change',function(){currentTimeRange=this.value;onFilterChange(container);});}

  // 初始渲染数据
  NUMS.forEach(function(o){animateTo(o,o.base,950);});
  fitAll(container);
  window.addEventListener("resize",function(){fitAll(container);});
  // 5秒刷新
  if(refreshTimer)clearInterval(refreshTimer);
  refreshTimer=setInterval(function(){refreshSweep(container);},5000);

  // 存储清理引用
  container._stRefresh=refreshTimer;
}

function onFilterChange(container){
  var proj=PROJECTS.find(function(p){return p.id===currentProjectId;});
  var scale=proj?proj.scale:1.0;
  var timeScale=TIMEF[currentTimeRange]||1.0;
  FACTOR=scale*timeScale;
  updateProjectInfo(container);
  setRail(container);
  // 刷新可缩放数据
  NUMS.forEach(function(o){if(o.scalable){o.base=Math.max(0,Math.round(o.base0*FACTOR));o.delta=deltaFor(o.base);animateTo(o,o.base,600);}});
}

function updateProjectInfo(container){
  var proj=PROJECTS.find(function(p){return p.id===currentProjectId;});
  var info=container.querySelector('#st-proj-info');
  if(info&&proj){
    info.innerHTML='<span>BG: <b>'+proj.bg+'</b></span><span>BU: <b>'+proj.bu+'</b></span><span>客户: <b>'+proj.customer+'</b></span><span>产品: <b>'+proj.productLine+'</b></span><span>阶段: <b>'+proj.engStage+'</b></span><span>PM: <b>'+proj.pm+'</b></span>';
  }
}

function fitAll(container){
  var wrap=container.querySelector(".st-canvas-wrap");
  var canvas=container.querySelector(".st-canvas");
  if(!wrap||!canvas)return;
  var s=Math.min(1,wrap.clientWidth/CANVAS_W);
  canvas.style.transform="scale("+s+")";
  // 给适当高度，确保占满可用空间
  wrap.style.height=Math.max(CANVAS_H*s,400)+"px";
}

function buildNodesHTML(){
  var POS=makePOS();
  var whSvg='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9.5l9-5 9 5V20H3z"/><rect x="9" y="13" width="6" height="7"/></svg>';
  function whbox(id,name,m,p){return'<button class="st-node st-whbox" data-id="'+id+'" style="left:'+p.x+'px;top:'+p.y+'px;width:'+p.w+'px;height:'+p.h+'px;"><span class="st-barL"></span><span class="st-whico">'+whSvg+'</span><span class="st-nid">'+id+'</span><span class="st-nnm">'+name+'</span><span class="st-mv" data-num="'+m[1]+'" data-mode="'+(BEH[id]||'stock')+'">0<i>'+m[2]+'</i></span></button>';}
  var h='';
  LANES.forEach(function(L){
    L.main.forEach(function(n,r){
      var p=POS[n.id];
      if(n.wh){h+=whbox(n.id,n.name,n.m,p);return;}
      var st=n.risk||"ok";
      h+='<button class="st-node st-s-'+st+'" data-id="'+n.id+'" style="left:'+p.x+'px;top:'+p.y+'px;width:'+p.w+'px;height:'+p.h+'px;--st-d:'+(r*0.12).toFixed(2)+'s"><span class="st-barL"></span><span class="st-nh"><span class="st-led"></span><span class="st-nid">'+n.id+'</span><span class="st-nnm">'+n.name+'</span></span><span class="st-nb"><span class="st-ml">'+n.m[0]+'</span><span class="st-mv" data-num="'+n.m[1]+'" data-mode="'+(BEH[n.id]||'stock')+'">0<i>'+n.m[2]+'</i>'+trendHtml(BEH[n.id]||'stock')+'</span></span></button>';
    });
    L.side.forEach(function(s){h+=whbox(s.id,s.name,s.m,POS[s.id]);});
  });
  return h;
}

function setupSVGLinks(container){
  var POS=makePOS();
  var svg=container.querySelector('.st-links');
  if(!svg)return;
  var paths='',pkts='';
  CONN.forEach(function(c){
    var isWh=(c[2]==="wh"||c[2]==="whO");
    var cls=isWh?"st-wh":(special[c[2]]?"st-x":"st-"+c[2]);
    var d;
    if(c[2]==="wh")d=whIn(c[0],c[1],POS);else if(c[2]==="whO")d=whOut(c[0],c[1],POS);else if(special[c[2]])d=special[c[2]](c[0],c[1],POS);else d=pathFor(c[0],c[1],POS,xOff[c[0]+">"+c[1]]||0);
    var mk=isWh?"st-arwW":"st-arw";
    paths+='<path class="st-lnk '+cls+'" d="'+d+'" marker-end="url(#'+mk+')"/>';
    var dur=(c[2]==="loop"?4.5:(1.5+Math.random()*1.2)).toFixed(2),beg=(-Math.random()*2.5).toFixed(2),col=pktColor[isWh?"wh":c[2]]||pktColor.x,r=isWh?3.5:2.5;
    pkts+='<circle class="st-pkt" r="'+r+'" fill="'+col+'" style="color:'+col+'"><animateMotion dur="'+dur+'s" begin="'+beg+'s" repeatCount="indefinite" path="'+d+'"/></circle>';
  });
  svg.innerHTML+=paths+pkts;
}

// 确保弹窗存在
(function ensureModal(){
  var m=document.getElementById('stNdModal');
  if(!m){m=document.createElement('div');m.id='stNdModal';m.className='st-nd-modal';m.innerHTML='<div class="st-nd-card"></div>';document.body.appendChild(m);m.addEventListener('click',function(e){if(e.target.id==='stNdModal')closeNode();});}
})();
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeNode();});

window.initPage_sandtable=initPage_sandtable;
})();
registerModule('sandtable', initPage_sandtable);
