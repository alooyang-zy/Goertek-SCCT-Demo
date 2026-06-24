// Module: supplydemand — 供需齐套分析 v8.0 (单项目·四维联动·CTB引擎·齐套缺口·催料优先级)
(function(){

// ═══════════════ CTB齐套流水线阶段 ═══════════════
var CTB_STAGES = [
  {id:'demand',name:'需求确认',icon:'fa-clipboard-list',color:'var(--primary)'},
  {id:'supply',name:'供给匹配',icon:'fa-cubes',color:'#8250df'},
  {id:'shortage',name:'缺口识别',icon:'fa-triangle-exclamation',color:'var(--warning)'},
  {id:'action',name:'催料行动',icon:'fa-bolt',color:'var(--danger)'},
  {id:'fulfill',name:'齐套达成',icon:'fa-circle-check',color:'var(--success)'},
];

// ═══════════════ 关键物料池 ═══════════════
var MATERIAL_POOL = [
  {pn:'RK3588S',name:'主控SoC',cat:'IC',supplier:'瑞芯微',lt:42,single:true},
  {pn:'LPDDR5-8G',name:'内存芯片',cat:'IC',supplier:'三星电机',lt:35,single:true},
  {pn:'PM8150A',name:'电源管理IC',cat:'IC',supplier:'高通',lt:28,single:false},
  {pn:'BT-5.3M',name:'蓝牙模组',cat:'模组',supplier:'楼氏电子',lt:14,single:false},
  {pn:'AML9434',name:'Wi-Fi模组',cat:'模组',supplier:'瑞声科技',lt:18,single:true},
  {pn:'CMOS-50M',name:'摄像头传感器',cat:'传感器',supplier:'索尼精密',lt:25,single:true},
  {pn:'LCD-5.5F',name:'显示屏模组',cat:'显示',supplier:'京东方',lt:20,single:false},
  {pn:'MLCC-0402',name:'贴片电容',cat:'被动件',supplier:'村田制作所',lt:30,single:false},
  {pn:'CONN-USB3',name:'USB连接器',cat:'连接器',supplier:'立讯精密',lt:12,single:false},
  {pn:'SPK-20mm',name:'扬声器',cat:'声学',supplier:'歌尔微电子',lt:8,single:false},
  {pn:'PCB-8L',name:'8层HDI板',cat:'PCB',supplier:'瀛通通讯',lt:15,single:false},
  {pn:'BAT-4000',name:'锂电池',cat:'电池',supplier:'欣旺达',lt:10,single:false},
  {pn:'LENS-6P',name:'6P镜头',cat:'光学',supplier:'舜宇光学',lt:18,single:false},
  {pn:'GR518-ANT',name:'陶瓷天线',cat:'射频',supplier:'顺络电子',lt:14,single:false},
  {pn:'SHIELD-C',name:'屏蔽罩',cat:'结构件',supplier:'长盈精密',lt:7,single:false},
  {pn:'THERMAL-P',name:'导热膜',cat:'散热',supplier:'中石科技',lt:5,single:false},
];

// ═══════════════ 工具 ═══════════════
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function rng(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function pct(v){return v>=0?'+'+v+'%':v+'%'}
function dotCls(v,amber,red){return v>=red?'red':v>=amber?'amber':'green'}
function pill(v,amber,red){var c=v>=red?'red':v>=amber?'amber':'green';return '<span class="x-pill '+c+'">'+v+(typeof v==='number'&&v<100?'%':'')+'</span>'}

function populateSelect(selId){
  var fp=getFilteredProjects();
  var sel=document.getElementById(selId);
  if(!sel)return;
  var cur=sel.value;
  sel.innerHTML=fp.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>'}).join('');
  if(cur&&fp.some(function(p){return p.id==cur}))sel.value=cur;
}

function getProject(selId){
  var sel=document.getElementById(selId);
  if(!sel)return null;
  return getFilteredProjects().find(function(p){return p.id==sel.value})||getFilteredProjects()[0];
}

// ═══════════════ 生成CTB数据 ═══════════════
function generateCTBData(proj){
  if(!proj)return null;
  var mCount=rng(8,16);
  var mats=MATERIAL_POOL.slice(0,mCount);
  var totalDemand=rng(5000,20000);
  var shortageCount=rng(2,6);
  var weekLabels=[];for(var i=0;i<12;i++)weekLabels.push('W'+(22+i));
  
  var materials=mats.map(function(m,i){
    var isShort=i<shortageCount;
    var demandQty=rng(500,3000);
    var supplyPct=isShort?rng(30,85):rng(88,100);
    var supplyQty=Math.round(demandQty*supplyPct/100);
    var gap=demandQty-supplyQty;
    var eta=isShort?'W'+(24+rng(1,4)):'—';
    var urgency=isShort?(gap>800?'紧急':'关注'):'正常';
    return {
      pn:m.pn,name:m.name,cat:m.cat,supplier:m.supplier,lt:m.lt,single:m.single,
      demandQty:demandQty,supplyQty:supplyQty,gap:gap,gapPct:Math.round((1-supplyPct/100)*100),
      eta:eta,urgency:urgency,
      status:isShort?'short':'ok',
      atp:isShort?rng(10,70):rng(85,100),
      wip:isShort?rng(0,30):rng(50,90),
      transit:isShort?rng(0,20):rng(40,80),
    };
  });

  return {
    project:proj,
    totalDemand:totalDemand,
    totalSupply:materials.reduce(function(s,m){return s+m.supplyQty},0),
    shortMaterials:materials.filter(function(m){return m.status==='short'}),
    okMaterials:materials.filter(function(m){return m.status==='ok'}),
    overallRate:Math.round(materials.reduce(function(s,m){return s+m.supplyQty},0)/materials.reduce(function(s,m){return s+m.demandQty},0)*100),
    materials:materials,
    weekLabels:weekLabels,
    weeklyDemand:weekLabels.map(function(){return rng(800,2500)}),
    weeklySupply:weekLabels.map(function(_,i){return Math.round(weekLabels[i]?rng(600,2400):0)}),
  };
}

// ═══════════════ 渲染 ═══════════════
function initPage_supplydemand(){
  populateSelect('sdProjectSelect');
  consumeDrillDown('sdProjectSelect');
  var proj=getProject('sdProjectSelect');
  if(!proj)return;
  var d=generateCTBData(proj);

  // Info bar
  var infoBar=document.getElementById('sdInfoItems');
  if(infoBar){
    infoBar.innerHTML='<span style="font-weight:700;color:var(--primary);margin-right:8px">'+proj.name+'</span>'+[
      {l:'BG',v:proj.bg},{l:'BU',v:proj.bu},{l:'客户',v:proj.customer},{l:'产品线',v:proj.productLine},
      {l:'齐套率',v:d.overallRate+'%'},
      {l:'缺料项',v:d.shortMaterials.length+'项'},
    ].map(function(x){return '<span class="sd-info-item">'+x.l+': <b>'+x.v+'</b></span>'}).join('');
  }

  // Cards
  var cards=document.getElementById('sdCards');
  if(cards){
    var cardData=[
      {purpose:'CTB引擎',label:'总需求(pcs)',value:d.totalDemand.toLocaleString(),sub:'BOM展开汇总',accent:'blue'},
      {purpose:'CTB引擎',label:'总供给(pcs)',value:d.totalSupply.toLocaleString(),sub:'可用+在途+WIP',accent:'purple'},
      {purpose:'CTB引擎',label:'齐套率',value:d.overallRate+'%',sub:d.overallRate>=90?'齐套健康':d.overallRate>=70?'存在缺口':'严重缺料',accent:d.overallRate>=90?'green':d.overallRate>=70?'amber':'red'},
      {purpose:'CTB引擎',label:'缺料物料',value:d.shortMaterials.length,sub:'共'+d.materials.length+'项物料',accent:'red'},
      {purpose:'CTB引擎',label:'紧急催料',value:d.shortMaterials.filter(function(m){return m.urgency==='紧急'}).length,sub:'需3日内到货',accent:'amber'},
      {purpose:'CTB引擎',label:'关注催料',value:d.shortMaterials.filter(function(m){return m.urgency==='关注'}).length,sub:'需7日内到货',accent:'blue'},
    ];
    cards.innerHTML=cardData.map(function(c){return '<div class="sd-card c-'+c.accent+'"><div class="sd-card-accent '+c.accent+'"></div><div class="sd-card-purpose">'+c.purpose+'</div><div class="sd-card-label">'+c.label+'</div><div class="sd-card-value">'+c.value+'</div><div class="sd-card-sub">'+c.sub+'</div></div>'}).join('');
  }

  // Pipeline
  var pipeline=document.getElementById('sdPipeline');
  if(pipeline){
    var stages=[
      {name:'需求确认',val:d.totalDemand.toLocaleString(),sub:'BOM展开',pct:100,color:'var(--primary)'},
      {name:'供给匹配',val:d.totalSupply.toLocaleString(),sub:'可用库存+在途',pct:d.overallRate,color:'#8250df'},
      {name:'缺口识别',val:d.shortMaterials.length+'项',sub:'缺口物料',pct:Math.round(d.shortMaterials.length/d.materials.length*100),color:'var(--warning)'},
      {name:'催料行动',val:d.shortMaterials.filter(function(m){return m.urgency==='紧急'}).length+'急',sub:'紧急+关注',pct:Math.round(d.shortMaterials.length/Math.max(1,d.shortMaterials.length)*100),color:'var(--danger)'},
      {name:'齐套达成',val:d.overallRate+'%',sub:d.overallRate>=90?'达标':'未达标',pct:d.overallRate,color:'var(--success)'},
    ];
    pipeline.innerHTML=stages.map(function(s){return '<div class="sd-pipe-stage"><div class="sd-pipe-name">'+s.name+'</div><div class="sd-pipe-val" style="color:'+s.color+'">'+s.val+'</div><div class="sd-pipe-sub">'+s.sub+'</div><div class="sd-stage-bar"><div class="sd-stage-bar-fill" style="width:'+s.pct+'%;background:'+s.color+'"></div></div></div>'}).join('');
  }

  // Shortage panel
  var sp=document.getElementById('sdShortagePanel');
  if(sp){
    sp.innerHTML='<div class="sd-shortage-title">缺料物料清单</div><div class="sd-shortage-grid">'+d.shortMaterials.map(function(m){
      return '<div class="sd-shortage-card"><div class="sd-shortage-card-title"><span class="x-dot red"></span>'+m.pn+' · '+m.name+'</div><div class="sd-shortage-card-body"><b>供应商：</b>'+m.supplier+(m.single?' <span class="x-pill red">单源</span>':'')+'<br><b>需求：</b>'+m.demandQty.toLocaleString()+' pcs <b>供给：</b>'+m.supplyQty.toLocaleString()+' pcs<br><b>缺口：</b><span style="color:var(--danger);font-weight:700">'+m.gap.toLocaleString()+' pcs</span> ('+m.gapPct+'%)<br><b>预计到货：</b>'+m.eta+' <b>紧迫度：</b><span class="x-pill '+(m.urgency==='紧急'?'red':'amber')+'">'+m.urgency+'</span></div></div>';
    }).join('')+'</div>';
  }

  // Action panel
  var ap=document.getElementById('sdActionPanel');
  if(ap){
    var actions=[
      {role:'采购专员',icon:'fa-user-tie',items:d.shortMaterials.slice(0,3).map(function(m){return '催促 '+m.supplier+' 加速 '+m.pn+' 交付，目标'+m.eta}).join('；')},
      {role:'计划员',icon:'fa-calendar-alt',items:'调整排产计划，优先安排齐套率高的订单；缺料订单延后至'+d.shortMaterials[0].eta},
      {role:'SQE',icon:'fa-shield-halved',items:'预检 '+d.shortMaterials.filter(function(m){return m.eta!=='—'}).slice(0,2).map(function(m){return m.pn}).join('、')+' 来料，缩短IQC周期至1天'},
    ];
    ap.innerHTML='<div class="sd-action-title">催料行动看板</div><div class="sd-action-grid">'+actions.map(function(a){
      return '<div class="sd-action-card"><div class="sd-action-card-title"><span><i class="fas '+a.icon+'" style="color:var(--primary)"></i> '+a.role+'</span></div><div class="sd-action-card-body">'+a.items+'</div></div>';
    }).join('')+'</div>';
  }

  // Table
  var tcount=document.getElementById('sdTableCount');
  if(tcount)tcount.textContent='共 '+d.materials.length+' 项物料';
  var thead=document.getElementById('sdTHead');
  if(thead)thead.innerHTML='<tr><th>物料编号</th><th>名称</th><th>类别</th><th>供应商</th><th>LT(天)</th><th>单源</th><th>需求量</th><th>供给量</th><th>缺口</th><th>缺口%</th><th>ATP%</th><th>在制%</th><th>在途%</th><th>预计到货</th><th>紧迫度</th><th>状态</th></tr>';
  var tbody=document.getElementById('sdTBody');
  if(tbody)tbody.innerHTML=d.materials.map(function(m){
    var statusPill=m.status==='short'?'<span class="x-pill red">缺料</span>':'<span class="x-pill green">充足</span>';
    var urgencyPill=m.urgency==='紧急'?'<span class="x-pill red">紧急</span>':m.urgency==='关注'?'<span class="x-pill amber">关注</span>':'<span class="x-pill gray">正常</span>';
    var singlePill=m.single?'<span class="x-pill red">单源</span>':'—';
    var gapStyle=m.gap>0?'style="color:var(--danger);font-weight:700"':'';
    return '<tr><td><b>'+m.pn+'</b></td><td>'+m.name+'</td><td>'+m.cat+'</td><td>'+m.supplier+'</td><td>'+m.lt+'</td><td>'+singlePill+'</td>'
      +'<td>'+m.demandQty.toLocaleString()+'</td><td>'+m.supplyQty.toLocaleString()+'</td>'
      +'<td '+gapStyle+'>'+m.gap.toLocaleString()+'</td><td>'+pill(100-m.gapPct,85,70)+'</td>'
      +'<td>'+pill(m.atp,70,50)+'</td><td>'+pill(m.wip,50,30)+'</td><td>'+pill(m.transit,50,30)+'</td>'
      +'<td>'+m.eta+'</td><td>'+urgencyPill+'</td><td>'+statusPill+'</td></tr>';
  }).join('');
}

window.initPage_supplydemand = initPage_supplydemand;
})();
registerModule('supplydemand', initPage_supplydemand);
