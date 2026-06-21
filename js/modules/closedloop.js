// Module: closedloop — 事件闭环管理 v10.14 (六步流程·工单追踪·PDCA·风险联动)
(function(){

/* ═══════════════ Workorder Data ═══════════════ */
var FLOW_STEPS = [
  {id:'detect',name:'风险识别',icon:'fa-magnifying-glass'},
  {id:'evaluate',name:'影响评估',icon:'fa-scale-balanced'},
  {id:'respond',name:'应急响应',icon:'fa-bolt'},
  {id:'resolve',name:'根因处置',icon:'fa-wrench'},
  {id:'verify',name:'效果验证',icon:'fa-circle-check'},
  {id:'close',name:'复盘关闭',icon:'fa-book'},
];

// 风险来源的工单池（由风险模块写入）
var _riskWorkorders = [];

// 注册风险来源的工单，供风险模块调用
window._clAddRiskWorkorder = function(wo) {
  // 去重
  if (!_riskWorkorders.some(function(w) { return w.id === wo.id; })) {
    _riskWorkorders.push(wo);
  }
};

var _woCache = {};
function getWorkorderData(pid){
  if(_woCache[pid]) return _woCache[pid];
  var seed = parseInt(pid.replace(/\D/g,'')||'1')*7;
  function rng(){seed=(seed*9301+49297)%233280;return seed/233280;}
  var owners=['采购组','质量部','生产部','物流组','NPI团队','计划部'];
  var sources=['风险预警触发','例行巡检发现','专项审计','事件升级','IT监控告警'];
  var items=[];
  var count=4+Math.floor(rng()*4);
  for(var i=0;i<count;i++){
    var steps=[];
    var maxStep=1+Math.floor(rng()*5);
    var overdue=rng()>0.7;
    for(var j=0;j<6;j++){
      var status=j<maxStep-1?'done':j===maxStep-1?'active':'pending';
      steps.push({id:FLOW_STEPS[j].id,name:FLOW_STEPS[j].name,status:status,date:'2026-'+
        String(Math.floor(rng()*4+5)).padStart(2,'0')+'-'+String(Math.floor(rng()*28+1)).padStart(2,'0')});
    }
    var stText=overdue?'超期-处理中':'处理中';
    if(maxStep>5)stText='已完成';
    items.push({
      code:'WO-'+pid.replace(/\D/g,'')+'-'+String(i+1).padStart(2,'0'),
      name:['需求预测偏差处置','供应商交期催办','物料短缺应急采购','产线异常停线处理','品质异常8D跟进',
            'BOM变更影响评估','物流延迟追回'][Math.floor(rng()*7)],
      source:sources[Math.floor(rng()*5)],
      owner:owners[Math.floor(rng()*6)],
      created:'2026-0'+(Math.floor(rng()*4+5))+'—'+String(Math.floor(rng()*28+1)).padStart(2,'0'),
      deadline:'2026-0'+(Math.floor(rng()*4+6))+'—'+String(Math.floor(rng()*28+1)).padStart(2,'0'),
      statusText:stText,
      status:maxStep>5?'closed':'active',
      overdue:overdue,
      steps:steps,
      progress:maxStep,
      desc:'需在'+String(5+Math.floor(rng()*10))+'个工作日内完成处置闭环',
      riskCode:null
    });
  }

  // 合并风险来源的工单
  _riskWorkorders.forEach(function(rw) {
    var exists = items.some(function(w) { return w.code === rw.id; });
    if (!exists) {
      var stepNum = rw.step || 3;
      var steps = [];
      for (var j = 0; j < 6; j++) {
        steps.push({
          id: FLOW_STEPS[j].id,
          name: FLOW_STEPS[j].name,
          status: j < stepNum - 1 ? 'done' : j === stepNum - 1 ? 'active' : 'pending',
          date: '2026-05-' + String(Math.floor(Math.random() * 25 + 1)).padStart(2, '0')
        });
      }
      items.unshift({
        code: rw.id,
        name: rw.title,
        source: '风险预警触发',
        owner: '风险专员',
        created: '2026-05-' + String(Math.floor(Math.random() * 20 + 1)).padStart(2, '0'),
        deadline: '2026-06-' + String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0'),
        statusText: '处理中',
        status: 'active',
        overdue: false,
        steps: steps,
        progress: stepNum,
        desc: '来自风险预警「' + (rw.riskCode || '') + '」，需在5个工作日内完成处置闭环',
        riskCode: rw.riskCode || null
      });
    }
  });

  _woCache[pid]=items;
  return items;
}

/* ═══════════════ State ═══════════════ */
var selectedWO = null;

/* ═══════════════ Entry ═══════════════ */
function initPage_closedloop(){
  var fp=getFilteredProjects();
  var sel=document.getElementById('closedloopProjectSelect');
  if(sel){
    var cur=sel.value;
    sel.innerHTML=fp.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>'}).join('');
    if(cur&&fp.some(function(p){return p.id==cur}))sel.value=cur;
    else if(fp.length)sel.value=fp[0].id;
  }
  // 消费穿透跳转上下文（从风险模块跳转来时自动选中项目）
  consumeDrillDown('closedloopProjectSelect');
  var pid=sel?sel.value:fp.length?fp[0].id:'';
  if(!pid)return;
  var items=getWorkorderData(pid);
  selectedWO=null;
  renderWorkorderList(items);
  renderDetailEmpty();
}

/* ═══════════════ Workorder List ═══════════════ */
function renderWorkorderList(items){
  var el=document.getElementById('clWorkorderList');
  if(!el)return;
  el.innerHTML=items.map(function(wo,i){
    var sc=wo.overdue?'red':wo.status==='closed'?'green':'amber';
    var stPill='<span class="cl-card-status" style="background:var(--'+(sc==='red'?'danger-bg':'success-bg')+');color:var(--'+(sc==='red'?'danger':'success')+')">'+wo.statusText+'</span>';
    return '<div class="cl-card" data-idx="'+i+'" onclick="window._clSelect('+i+')">'+
      '<div class="cl-card-head"><span class="cl-card-code">'+wo.code+'</span>'+stPill+'</div>'+
      '<div class="cl-card-name">'+wo.name+'</div>'+
      '<div class="cl-card-meta"><span>来源: '+wo.source+'</span><span>Owner: '+wo.owner+'</span><span>'+wo.created+'</span></div>'+
      '<div class="cl-card-steps">'+
      wo.steps.map(function(s,j){
        var st=s.status;
        return ((j>0?'<div class="line" style="background:'+(st==='done'?'var(--success)':'')+'"></div>':'')+
          '<div class="cl-card-step"><div class="dot '+(st==='done'?'g':st==='active'?'y':'')+'"></div>'+s.name.substring(0,2)+'</div>');
      }).join('')+
      '</div></div>';
  }).join('');
}

/* ═══════════════ Detail ═══════════════ */
window._clSelect=function(idx){
  var items=getWorkorderData(document.getElementById('closedloopProjectSelect').value);
  selectedWO=idx;
  var wo=items[idx];
  // Highlight
  document.querySelectorAll('.cl-card').forEach(function(c){c.classList.remove('active');});
  var cards=document.getElementById('clWorkorderList').querySelectorAll('.cl-card');
  if(cards[idx])cards[idx].classList.add('active');
  renderDetail(wo);
};

function renderDetailEmpty(){
  var el=document.getElementById('clWorkorderDetail');
  if(el)el.innerHTML='<div class="cl-empty">点击左侧工单查看详情</div>';
}

function renderDetail(wo){
  var el=document.getElementById('clWorkorderDetail');
  if(!el||!wo)return;
  // 风险来源标识
  var riskLink = wo.riskCode ? ' <span style="background:var(--danger-bg);color:var(--danger);padding:2px 6px;border-radius:4px;font-size:10px;cursor:pointer" onclick="switchPage(\'risk\')" title="点击查看关联风险">关联风险 '+wo.riskCode+' <i class="fa-solid fa-arrow-right" style="font-size:9px"></i></span>' : '';
  el.innerHTML=
    '<div class="cl-detail-head"><div><div class="cl-detail-name">'+wo.code+' · '+wo.name+riskLink+'</div>'+
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">来源:'+wo.source+' | Owner:'+wo.owner+' | 创建:'+wo.created+' | 截止:'+wo.deadline+'</div></div>'+
    '<span style="padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;background:'+(wo.overdue?'var(--danger-bg)':wo.status==='closed'?'var(--success-bg)':'var(--warning-bg)')+';color:'+(wo.overdue?'var(--danger)':wo.status==='closed'?'var(--success)':'var(--warning)')+'">'+wo.statusText+'</span></div>'+
    '<div style="font-size:12px;color:var(--text-sec);margin-bottom:14px;padding:10px 14px;background:var(--border-light);border-radius:var(--radius-sm)">'+wo.desc+'</div>'+
    // 6-step flow
    '<div class="rr-sec" style="margin-bottom:10px"><div class="rr-sec-header">六步闭环流程</div><div class="rr-sec-body"><div class="cl-detail-flow">'+
    wo.steps.map(function(s,j){
      var sc=s.status;var cl=(sc==='done'?'g':sc==='active'?'y':'n');
      var lb=(sc==='done'?'✓':sc==='active'?'▶':'-');
      return ((j>0?'<div class="line '+cl+'"></div>':'')+
        '<div class="cl-flow-step"><div class="num '+cl+'">'+lb+'</div><div class="lbl">'+s.name+'</div><div style="font-size:8px;color:var(--text-muted)">'+(s.date||'')+'</div></div>');
    }).join('')+
    '</div></div></div>'+
    // Action items
    '<div class="rr-sec"><div class="rr-sec-header" onclick="this.parentElement.querySelector(\'.rr-sec-body\').classList.toggle(\'collapsed\')">处置行动项</div><div class="rr-sec-body">'+
    ['紧急措施：通知相关责任人，启动应急响应预案','根因分析：组织跨部门复盘会议，输出RCA报告','纠正措施：制定CAPA方案，落实具体责任人和期限','验证确认：效果跟踪验证，确保问题不复发','知识入库：将经验教训录入知识库，更新流程SOP'].slice(0,wo.progress+1)
    .map(function(a,i){var done=i<wo.progress-1;return '<div style="padding:4px 0;font-size:11px">'+(done?'✅':'⬜')+' '+(i+1)+'. '+a+'</div>'}).join('')+
    '</div></div>';
}

window.initPage_closedloop = initPage_closedloop;
})();
registerModule('closedloop', initPage_closedloop);
