// Module: material — 物料导入状态 v10.15 (风险标签分布点击联动物料明细)
(function(){

// ═══════════════ 阶段定义 ═══════════════
var STAGES = [
  {id:'basic',name:'物料基本信息',cls:'s6'},
  {id:'demand',name:'项目原始需求',cls:'s6'},
  {id:'trpr',name:'TR/PR流转',cls:''},
  {id:'po',name:'PO/供应商响应',cls:'s2'},
  {id:'prod',name:'供应商生产准备',cls:'s3'},
  {id:'asn',name:'ASN/收货/IQC',cls:'s4'},
  {id:'stock',name:'库存与齐套',cls:'s5'}
];

// ═══════════════ 风险标签 ═══════════════
var RISK_CATEGORIES = [
  {id:'procurement',name:'采购链路风险',color:'c1',catCls:'cat-procurement',tags:[
    {id:'R01',name:'TR滞留未转PR'},{id:'R02',name:'PR滞留未转PO'},{id:'R03',name:'供应商交期承诺不满足'},{id:'R04',name:'PO需期变更未同步供应商'}
  ]},
  {id:'supplier',name:'供应商执行风险',color:'c2',catCls:'cat-supplier',tags:[
    {id:'R05',name:'供应商材料未齐套'},{id:'R06',name:'供应商启动生产未授权'},{id:'R08',name:'ASN未按承诺创建'}
  ]},
  {id:'design',name:'设计与变更风险',color:'c3',catCls:'cat-design',tags:[
    {id:'R09',name:'ECN频繁变更'},{id:'R10',name:'变更引发呆滞风险'},{id:'R17',name:'供应商侧变更呆滞风险'}
  ]},
  {id:'quality',name:'质量与认证风险',color:'c4',catCls:'cat-quality',tags:[
    {id:'R11',name:'CI件未认证'},{id:'R12',name:'物料成熟度NG'},{id:'R13',name:'IQC检验依据缺失'},{id:'R14',name:'首批来料无FAI记录'}
  ]},
  {id:'warehouse',name:'仓储与追溯风险',color:'c5',catCls:'cat-warehouse',tags:[
    {id:'R15',name:'8码/标签/ASN异常'},{id:'R16',name:'检验Hold超期'}
  ]}
];
var ALL_RISK_TAGS = []; RISK_CATEGORIES.forEach(function(c){c.tags.forEach(function(t){ALL_RISK_TAGS.push({id:t.id, name:t.name, catId:c.id, catName:c.name, color:c.color, catCls:c.catCls});});});
var RISK_ACTIONS = {
  R01:{role:'MM/GCM',action:'确认TR有效性并推动PR创建',due:'T+1',evidence:'PR号或TR关闭记录',status:'doing'},
  R02:{role:'采购',action:'确认PR转PO计划与供应商',due:'T+1',evidence:'PO号或下单计划',status:'doing'},
  R03:{role:'SPM',action:'催回Commit并确认分批交付方案',due:'T+1',evidence:'供应商Commit记录',status:'open'},
  R04:{role:'采购/SPM',action:'同步PO需期变更并要求供应商重确认',due:'T+1',evidence:'变更通知与回签记录',status:'wait'},
  R05:{role:'SPM/供应商',action:'确认材料齐套缺口与补料日期',due:'T+2',evidence:'供应商材料齐套反馈',status:'open'},
  R06:{role:'项目/SQE',action:'拉通评审是否允许启动生产',due:'T+1',evidence:'启动生产评审结论',status:'wait'},
  R08:{role:'SPM/物流',action:'推动ASN创建并同步预计到厂时间',due:'T+1',evidence:'ASN号与预计到货日期',status:'doing'},
  R09:{role:'研发/项目',action:'确认ECN影响范围与版本切换计划',due:'T+2',evidence:'ECN影响清单',status:'wait'},
  R10:{role:'项目/MM',action:'评估变更后库存与在途可复用数量',due:'T+3',evidence:'变更影响评估表',status:'open'},
  R11:{role:'项目/质量',action:'确认CI件认证资料与客户要求',due:'T+2',evidence:'认证状态或客户确认',status:'doing'},
  R12:{role:'MQE/SQE',action:'拉通成熟度阻塞项和关闭计划',due:'T+3',evidence:'成熟度评估记录',status:'open'},
  R13:{role:'IQC/研发',action:'补齐检验依据或确认版本差异',due:'T+1',evidence:'检验依据文件/版本确认',status:'doing'},
  R14:{role:'SQE/供应商',action:'补充首批FAI记录并确认质量风险',due:'T+2',evidence:'FAI报告',status:'wait'},
  R15:{role:'仓储/物流',action:'核对8码、标签和ASN资料一致性',due:'T+1',evidence:'标签/ASN修正记录',status:'doing'},
  R16:{role:'IQC/SQE',action:'确认Hold原因并给出放行/拒收结论',due:'T+1',evidence:'IQC处理结论',status:'open'},
  R17:{role:'项目/SPM',action:'确认供应商已备料、在制、待发的可复用数量',due:'T+3',evidence:'供应商侧呆滞确认记录',status:'open'}
};
var RISK_STATUS_LABEL = {open:'待处理',doing:'处理中',wait:'待确认',closed:'已关闭'};

// ═══════════════ 物料表格列定义(按阶段分组) ═══════════════
var DETAIL_COLUMNS = [
  {stage:'basic',key:'料号',label:'料号'},{stage:'basic',key:'物料名称',label:'物料名称'},{stage:'basic',key:'分类属性',label:'分类属性'},
  {stage:'basic',key:'CI属性',label:'CI属性'},{stage:'basic',key:'供应商',label:'供应商'},{stage:'basic',key:'单源标志',label:'单源'},
  {stage:'basic',key:'图纸版本',label:'图纸版本'},{stage:'basic',key:'认证状态',label:'认证状态'},{stage:'basic',key:'物料成熟度',label:'成熟度'},
  {stage:'demand',key:'需求数量',label:'需求数量'},{stage:'demand',key:'需求日期',label:'需求日期'},{stage:'demand',key:'变更次数',label:'变更次数'},{stage:'demand',key:'变更影响标记',label:'变更影响'},
  {stage:'trpr',key:'TR创建数量',label:'TR数量'},{stage:'trpr',key:'TR转PR状态',label:'TR→PR'},{stage:'trpr',key:'TR滞留天数',label:'TR滞留'},
  {stage:'trpr',key:'ASL覆盖状态',label:'ASL'},{stage:'trpr',key:'BPA价格状态',label:'BPA价格'},{stage:'trpr',key:'ECCN分类状态',label:'ECCN'},
  {stage:'trpr',key:'PR申请数量',label:'PR数量'},{stage:'trpr',key:'PR转PO状态',label:'PR→PO'},{stage:'trpr',key:'PR滞留天数',label:'PR滞留'},
  {stage:'po',key:'PO下单数量',label:'PO数量'},{stage:'po',key:'Commit状态',label:'Commit'},{stage:'po',key:'Commit偏差天数',label:'交期偏差'},
  {stage:'po',key:'PO需期变更未同步标志',label:'需期同步'},
  {stage:'prod',key:'启动生产授权状态',label:'生产授权'},{stage:'prod',key:'材料齐套状态',label:'材料齐套'},
  {stage:'prod',key:'生产完成数量',label:'生产完成'},{stage:'prod',key:'是否满足出货条件',label:'出货条件'},
  {stage:'prod',key:'供应商侧呆滞风险数量',label:'供应商侧呆滞'},{stage:'prod',key:'可发货数量',label:'可发货量'},
  {stage:'asn',key:'ASN创建数量',label:'ASN数量'},{stage:'asn',key:'ASN超时天数',label:'ASN超时'},
  {stage:'asn',key:'8码/标签状态',label:'8码/标签'},{stage:'asn',key:'仓库接收数量',label:'接收数量'},
  {stage:'asn',key:'IQC检验结果',label:'IQC结果'},{stage:'asn',key:'IQC Hold数量',label:'Hold数量'},
  {stage:'asn',key:'IQC Hold超期天数',label:'Hold超期'},{stage:'asn',key:'IQC释放数量',label:'IQC释放'},
  {stage:'stock',key:'可用库存数量',label:'可用库存'},{stage:'stock',key:'齐套缺口数量',label:'齐套缺口'},
  {stage:'stock',key:'齐套率',label:'齐套率'},{stage:'stock',key:'库存结余数量',label:'库存结余'},{stage:'stock',key:'物料呆滞天数',label:'呆滞天数'},
  {stage:'_risk',key:'风险标签',label:'风险标签'}
];

// ═══════════════ 工具 ═══════════════
function num(v){var n=parseFloat(String(v||'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:0}
function uniq(arr){var u=['全部'];arr.forEach(function(v){if(v!==''&&v!=null&&u.indexOf(v)===-1)u.push(v);});return u}
function optHtml(arr){return arr.map(function(v){return '<option value="'+v+'">'+v+'</option>';}).join('')}
function statusPill(v){
  var t=String(v||'');
  if(['无','完整','已确认','已转PR','已转PO','已授权','已齐套','合格','100%','0天','0PCS','已同步','不适用'].some(function(k){return t===k;})) return '<span class="npi-pill green">'+t+'</span>';
  if(t.indexOf('缺')>=0||t.indexOf('未')>=0||t.indexOf('Risk')>=0||t.indexOf('NG')>=0||t.indexOf('异常')>=0||t.indexOf('Block')>=0||t.indexOf('Hold')>=0||t.indexOf('滞留')>=0||t.indexOf('超时')>=0||t.indexOf('待同步')>=0) return '<span class="npi-pill red">'+t+'</span>';
  if(t.indexOf('条件')>=0||t.indexOf('待')>=0||t.indexOf('部分')>=0||t.indexOf('需重确认')>=0) return '<span class="npi-pill amber">'+t+'</span>';
  return '<span class="npi-pill blue">'+t+'</span>';
}

// ═══════════════ 物料数据生成 ═══════════════
var _matCache = {};
function findProject(pid){
  var p = projects.find(function(x){return x.id===pid;});
  if(p) return p;
  // 兼容履约跟踪页面的PROJECT_META项目ID（PJ-*格式）
  if(typeof metadata==='function'){ var pm=metadata(pid); if(pm) return {id:pm.id,name:pm.name,bg:pm.bg,bu:pm.bg,productLine:pm.model,customer:pm.customer,engStage:pm.phase,lifecycle:pm.phase,lifecycleRaw:pm.phase}; }
  return null;
}
function getMaterials(pid){
  if(!_matCache[pid]){
    var p = findProject(pid);
    if(!p){ _matCache[pid]=[]; return []; }
    var seed = parseInt(pid.replace(/\D/g,'')||'1');
    var parts = [
      {料号:'3010-0001',物料名称:'主芯片',分类:'关键定制',ci:'否',supplier:'联发科',single:'多源',draw:'V3.0',cert:'已认定',mat:'OK',demand:200,date:'2026-06-10',chg:0},
      {料号:'3010-0002',物料名称:'声学驱动IC',分类:'关键定制',ci:'是',supplier:'ADI',single:'单源',draw:'V2.1',cert:'已认定',mat:'OK',demand:200,date:'2026-06-10',chg:0},
      {料号:'3010-0003',物料名称:'蓝牙模块',分类:'关键标准',ci:'否',supplier:'高通',single:'多源',draw:'V1.0',cert:'已认定',mat:'OK',demand:200,date:'2026-06-05',chg:0},
      {料号:'3010-0004',物料名称:'电源管理IC',分类:'关键标准',ci:'否',supplier:'TI',single:'多源',draw:'A版',cert:'已认定',mat:'OK',demand:200,date:'2026-06-05',chg:0},
      {料号:'3010-0005',物料名称:'MEMS麦克风',分类:'关键定制',ci:'是',supplier:'歌尔微',single:'单源',draw:'V4.0',cert:'未认定',mat:'Risk',demand:150,date:'2026-06-15',chg:2},
      {料号:'3010-0006',物料名称:'Type-C连接器',分类:'非关键',ci:'否',supplier:'立讯',single:'多源',draw:'A版',cert:'已认定',mat:'OK',demand:400,date:'2026-06-01',chg:0},
      {料号:'3010-0007',物料名称:'FPC排线',分类:'非关键',ci:'否',supplier:'鹏鼎',single:'多源',draw:'V1.2',cert:'已认定',mat:'OK',demand:400,date:'2026-06-01',chg:0},
      {料号:'3010-0008',物料名称:'外壳组件',分类:'关键定制',ci:'否',supplier:'蓝思',single:'多源',draw:'V5.0',cert:'条件通过',mat:'OK',demand:200,date:'2026-06-08',chg:1},
      {料号:'3010-0009',物料名称:'电池模组',分类:'关键标准',ci:'否',supplier:'ATL',single:'多源',draw:'A版',cert:'已认定',mat:'OK',demand:200,date:'2026-06-05',chg:0},
      {料号:'3010-0010',物料名称:'硅胶密封圈',分类:'非关键',ci:'否',supplier:'中鼎',single:'多源',draw:'A版',cert:'不适用',mat:'不适用',demand:600,date:'2026-05-28',chg:0},
      {料号:'3010-0011',物料名称:'导热垫片',分类:'非关键',ci:'否',supplier:'莱尔德',single:'多源',draw:'V1.0',cert:'已认定',mat:'OK',demand:400,date:'2026-06-01',chg:0},
      {料号:'3010-0012',物料名称:'螺丝包',分类:'非关键',ci:'否',supplier:'华人螺丝',single:'多源',draw:'A版',cert:'不适用',mat:'不适用',demand:1200,date:'2026-05-25',chg:0}
    ];
    // 根据项目生命周期决定风险分布
    var isEarly = p.lifecycleRaw==='NPI'||p.lifecycleRaw==='Ramp-up';
    var isEOL = p.lifecycleRaw==='EOL';
    var riskPool = isEarly ? ['R01','R02','R03','R05','R06','R11','R12'] : isEOL ? ['R09','R10','R17','R04','R03'] : ['R03','R04','R08','R15'];
    var riskSet = {}; riskPool.slice(0, 1+(seed%4)).forEach(function(r){riskSet[r]=true;});
    var kitRatio = isEarly ? 0.35+seed*0.03 : isEOL ? 0.72 : 0.6+seed*0.04;

    _matCache[pid] = parts.map(function(pt, i){
      var r = Math.max(0.3, kitRatio - (i%4)*0.08 + (i%3)*0.05);
      var demand = pt.demand, avail = Math.round(demand*r), gap = Math.max(0, demand-avail);
      var hitRisks = [];
      if(riskSet['R01']&&i===2&&isEarly) hitRisks.push('R01');
      if(riskSet['R02']&&i===3&&isEarly) hitRisks.push('R02');
      if(riskSet['R03']&&i<3) hitRisks.push('R03');
      if(riskSet['R04']&&i===4) hitRisks.push('R04');
      if(riskSet['R05']&&i===4) hitRisks.push('R05');
      if(riskSet['R06']&&i===4&&pt.ci==='是') hitRisks.push('R06');
      if(riskSet['R08']&&i<3&&avail<demand) hitRisks.push('R08');
      if(riskSet['R09']&&pt.chg>=2) hitRisks.push('R09');
      if(riskSet['R10']&&i===4&&pt.chg>0) hitRisks.push('R10');
      if(riskSet['R17']&&i===4&&pt.chg>0) hitRisks.push('R17');
      if(riskSet['R11']&&pt.ci==='是'&&pt.cert==='未认定') hitRisks.push('R11');
      if(riskSet['R12']&&pt.mat==='Risk') hitRisks.push('R12');
      if(riskSet['R13']&&i===4) hitRisks.push('R13');
      if(riskSet['R14']&&i===4) hitRisks.push('R14');
      if(riskSet['R15']&&i<2&&avail<demand) hitRisks.push('R15');
      if(riskSet['R16']&&i===4&&pt.mat==='Risk') hitRisks.push('R16');
      var trQty = isEarly&&i>5?0:demand, prQty=isEarly&&i>6?0:demand, poQty=isEarly&&i>7?0:demand;
      return {
        料号:pt.料号, 物料名称:pt.物料名称, 分类属性:pt.分类, CI属性:pt.ci, 供应商:pt.supplier, 单源标志:pt.single,
        图纸版本:pt.draw, 认证状态:pt.cert, 物料成熟度:pt.mat,
        需求数量:demand+'PCS', 需求日期:pt.date, 变更次数:pt.chg+'次',
        变更影响标记:hitRisks.indexOf('R17')>=0?'供应商侧呆滞风险':(hitRisks.indexOf('R10')>=0?'内部呆滞风险':(pt.chg>0?'交期延误风险':'无影响')),
        TR创建数量:trQty>0?trQty+'PCS':'0PCS', TR转PR状态:trQty>0?(isEarly&&i>4?'未转PR':'已转PR'):'不适用',
        TR滞留天数:isEarly&&i>4&&trQty>0?Math.floor(Math.random()*5+1)+'天':'-',
        ASL覆盖状态:(isEarly&&i===2)?'未覆盖':'已覆盖',
        BPA价格状态:(pt.ci==='是'&&pt.cert==='未认定')?'待核价':'已覆盖',
        ECCN分类状态:(['主芯片','蓝牙模块','电源管理IC'].indexOf(pt.物料名称)>=0)?'已分类':'不适用',
        PR申请数量:prQty>0?prQty+'PCS':'0PCS', PR转PO状态:prQty>0?(isEarly&&i>5?'未转PO':'已转PO'):'不适用',
        PR滞留天数:isEarly&&i>5&&prQty>0?Math.floor(Math.random()*4+2)+'天':'-',
        PO下单数量:poQty>0?poQty+'PCS':'0PCS',
        Commit状态:poQty>0?(hitRisks.indexOf('R03')>=0?(i===0?'未确认':'需重确认'):'已确认'):'-',
        Commit偏差天数:hitRisks.indexOf('R03')>=0?Math.floor(Math.random()*7+3)+'天':poQty>0?'0天':'-',
        PO需期变更未同步标志:hitRisks.indexOf('R04')>=0?'待同步':'已同步',
        启动生产授权状态:pt.ci==='是'?(hitRisks.indexOf('R06')>=0?'未授权':'已授权'):'不适用',
        材料齐套状态:hitRisks.indexOf('R05')>=0?'未齐套':'已齐套',
        生产完成数量:Math.max(0,Math.round(avail*0.9))+'PCS',
        是否满足出货条件:(avail>0&&!hitRisks.some(function(x){return['R06','R12','R15','R17'].indexOf(x)>=0;})&&['未认定'].indexOf(pt.cert)<0)?'满足':'不满足',
        供应商侧呆滞风险数量:hitRisks.indexOf('R17')>=0?Math.max(20,Math.round(demand*0.18))+'PCS':'0PCS',
        可发货数量:avail+'PCS',
        ASN创建数量:avail>0?avail+'PCS':'0PCS',
        ASN超时天数:hitRisks.indexOf('R08')>=0?Math.floor(Math.random()*3+1)+'天':'0天',
        '8码/标签状态':hitRisks.indexOf('R15')>=0?'8码未匹配':'完整',
        仓库接收数量:Math.min(avail,Math.round(avail*0.9))+'PCS',
        IQC检验结果:hitRisks.indexOf('R16')>=0?'Hold':(i===4&&pt.mat==='Risk'?'Hold':'合格'),
        'IQC Hold数量':(hitRisks.indexOf('R16')>=0||(i===4&&pt.mat==='Risk'))?Math.round(avail*0.3)+'PCS':'0PCS',
        'IQC Hold超期天数':hitRisks.indexOf('R16')>=0?Math.floor(Math.random()*4+2)+'天':'-',
        IQC释放数量:(hitRisks.indexOf('R16')>=0||(i===4&&pt.mat==='Risk'))?Math.round(avail*0.7)+'PCS':Math.round(avail*0.9)+'PCS',
        可用库存数量:avail+'PCS', 齐套缺口数量:gap+'PCS', 齐套率:gap===0?'100%':Math.round(avail/demand*100)+'%',
        库存结余数量:hitRisks.indexOf('R10')>=0?Math.round(gap*0.3)+'PCS':'0PCS',
        物料呆滞天数:hitRisks.indexOf('R10')>=0?Math.floor(Math.random()*10+5)+'天':'-',
        风险标签:hitRisks
      };
    });
  }
  return _matCache[pid];
}

// ═══════════════ 状态 ═══════════════
// 风险标签命中分布中当前点击选中的标签（用于联动物料明细表）
var _activeDistTag = null;

function detailTagCount(tagId, mats){
  return mats.filter(function(m){return (m.风险标签||[]).indexOf(tagId)>=0;}).length;
}
function detailCatCount(catId, mats){
  var cat = RISK_CATEGORIES.find(function(c){return c.id===catId;});
  return cat ? cat.tags.reduce(function(s,t){return s+detailTagCount(t.id,mats);},0) : 0;
}

// ═══════════════ 主渲染 ═══════════════
function renderAll(){
  try {
    var fp = getFilteredProjects();
    // 使用履约跟踪顶部项目选择器
    var sel = document.getElementById('progressProjectSelect');
    var pid = sel&&sel.value ? sel.value : (fp.length?fp[0].id:null);
    if(!pid) return;
    var p = findProject(pid);
    if(!p) return;

    var allMats = getMaterials(pid);
    // 联动过滤：风险标签分布中点击标签后，仅物料明细表受影响
    var mats = _activeDistTag ? allMats.filter(function(m){
      return (m.风险标签||[]).indexOf(_activeDistTag)>=0;
    }) : allMats;

    // ① Project info bar（合并到筛选行）
    var riskCount = allMats.filter(function(m){return (m.风险标签||[]).length>0;}).length;
    var infoEl = document.getElementById('npiInfoInline');
    if(infoEl) infoEl.innerHTML = [
      '<span class="npi-info-item"><b>'+p.name+'</b></span>',
      '<span class="npi-info-item">BG/BU：<b>'+p.bg+'/'+p.bu+'</b></span>',
      '<span class="npi-info-item">客户：<b>'+p.customer+'</b></span>',
      '<span class="npi-info-item">产品线：<b>'+p.productLine+'</b></span>',
      '<span class="npi-info-item">生命周期：<b>'+(p.lifecycleRaw||p.lifecycle)+'</b></span>',
      '<span class="npi-info-item">物料总数：<b>'+allMats.length+'</b></span>',
      '<span class="npi-info-item">风险物料：<b style="color:var(--danger)">'+riskCount+'</b></span>'
    ].join('');

    // ② Summary cards
    var keyCount = allMats.filter(function(m){return String(m.分类属性).indexOf('关键')>=0;}).length;
    var certOk = allMats.filter(function(m){return['已认定','条件通过','不适用'].indexOf(m.认证状态)>=0;}).length;
    var matureOk = allMats.filter(function(m){return['OK','不适用'].indexOf(m.物料成熟度)>=0;}).length;
    var gapCount = allMats.filter(function(m){return num(m.齐套缺口数量)>0;}).length;
    var cards = [
      {p:'管理NPI阶段料号',l:'物料总数',v:allMats.length,s:'关键 '+keyCount+' / 非关键 '+(allMats.length-keyCount),a:'blue'},
      {p:'已认证/认定可执行',l:'认证料号',v:certOk,s:'已认定/条件通过/不适用',a:'green'},
      {p:'成熟度可继续推进',l:'成熟料号',v:matureOk,s:'OK/不适用',a:'green'},
      {p:'库存不足需催货',l:'齐套缺口料号',v:gapCount,s:'缺口>0 的料号',a:'red'},
      {p:'重点跟踪关键物料',l:'关键料号',v:keyCount,s:'关键定制+关键标准',a:'amber'},
      {p:'项目风险物料汇总',l:'风险物料',v:riskCount,s:'已命中风险标签',a:'red'}
    ];
    document.getElementById('npiCards').innerHTML = cards.map(function(c){
      return '<div class="npi-card"><div class="npi-card-accent '+c.a+'"></div><div class="npi-card-purpose">'+c.p+'</div><div class="npi-card-label">'+c.l+'</div><div class="npi-card-value">'+c.v+'</div><div class="npi-card-sub">'+c.s+'</div></div>';
    }).join('');

    // ③ Stage pipeline
    var stageStats = STAGES.map(function(s){
      if(s.id==='basic'){var c=allMats.filter(function(m){return['已认定','不适用'].indexOf(m.认证状态)>=0;}).length, mok=allMats.filter(function(m){return['OK','不适用'].indexOf(m.物料成熟度)>=0;}).length; return{pct:allMats.length?Math.round((c+mok)/(allMats.length*2)*100):0,sub:'认证'+c+'/'+allMats.length+' 成熟'+mok+'/'+allMats.length};}
      if(s.id==='demand'){var n=allMats.filter(function(m){return num(m.变更次数)===0;}).length; return{pct:allMats.length?Math.round(n/allMats.length*100):0,sub:'无变更 '+n+'/'+allMats.length};}
      if(s.id==='trpr'){var tr=allMats.filter(function(m){return m.TR转PR状态==='已转PR'||m.TR转PR状态==='不适用';}).length, pre=allMats.filter(function(m){return m.ASL覆盖状态==='已覆盖'&&m.BPA价格状态==='已覆盖';}).length, pr=allMats.filter(function(m){return m.PR转PO状态==='已转PO'||m.PR转PO状态==='不适用';}).length; return{pct:allMats.length?Math.round((tr+pre+pr)/(allMats.length*3)*100):0,sub:'TR→PR '+tr+' 前置'+pre+' PR→PO '+pr};}
      if(s.id==='po'){var cm=allMats.filter(function(m){return m.Commit状态==='已确认'||m.Commit状态==='-';}).length, nd=allMats.filter(function(m){return num(m.Commit偏差天数)===0;}).length; return{pct:allMats.length?Math.round((cm+nd)/(allMats.length*2)*100):0,sub:'Commit '+cm+' 准时 '+nd};}
      if(s.id==='prod'){var qt=allMats.filter(function(m){return m.材料齐套状态==='已齐套';}).length, au=allMats.filter(function(m){return['已授权','不适用'].indexOf(m.启动生产授权状态)>=0;}).length, sh=allMats.filter(function(m){return m.是否满足出货条件==='满足';}).length; return{pct:allMats.length?Math.round((qt+au+sh)/(allMats.length*3)*100):0,sub:'齐套'+qt+' 授权'+au+' 可出'+sh};}
      if(s.id==='asn'){var rv=allMats.filter(function(m){return num(m.仓库接收数量)>0;}).length, iq=allMats.filter(function(m){return m.IQC检验结果==='合格';}).length, nh=allMats.filter(function(m){return num(m['IQC Hold数量'])===0;}).length; return{pct:allMats.length?Math.round((rv+iq+nh)/(allMats.length*3)*100):0,sub:'接收'+rv+' 合格'+iq+' Hold0 '+nh};}
      if(s.id==='stock'){var fk=allMats.filter(function(m){return num(m.齐套缺口数量)===0;}).length, ns=allMats.filter(function(m){return num(m.库存结余数量)===0;}).length; return{pct:allMats.length?Math.round((fk+ns)/(allMats.length*2)*100):0,sub:'齐套'+fk+' 无呆滞'+ns};}
      return{pct:0,sub:''};
    });
    document.getElementById('npiPipeline').innerHTML = STAGES.map(function(s,i){
      var st=stageStats[i], barC=st.pct>=90?'var(--success)':st.pct>=70?'var(--warning)':'var(--danger)';
      return '<div class="npi-stage"><div class="npi-stage-name">'+s.name+'</div><div class="npi-stage-pct" style="color:'+barC+'">'+st.pct+'%</div><div class="npi-stage-sub">'+st.sub+'</div><div class="npi-stage-bar"><div class="npi-stage-bar-fill" style="width:'+st.pct+'%;background:'+barC+'"></div></div>'+(i<STAGES.length-1?'<span class="npi-stage-arrow">▶</span>':'')+'</div>';
    }).join('');

    // ④ Risk distribution（标签可点击，联动物料明细表）
    document.getElementById('npiRiskDist').innerHTML = RISK_CATEGORIES.map(function(cat){
      var tagCounts = cat.tags.map(function(t){
        var cnt = allMats.filter(function(m){return(m.风险标签||[]).indexOf(t.id)>=0;}).length;
        var isActive = _activeDistTag === t.id;
        return '<div class="npi-risk-tag-row npi-dist-clickable'+(isActive?' active':'')+'" data-tag="'+t.id+'" style="cursor:pointer;border-radius:4px;padding:2px 4px;margin:1px 0;transition:background .2s'+(isActive?';background:var(--primary-bg);border-left:3px solid var(--primary)':'')+'" title="'+(isActive?'点击取消筛选':'点击筛选含此标签的物料')+'"><span class="npi-risk-tag-name">'+t.name+'</span><span class="npi-risk-tag-num '+(cnt>0?cat.color:'zero')+'">'+cnt+'</span></div>';
      });
      return '<div class="npi-risk-cat"><div class="npi-risk-cat-title"><span class="dot '+cat.color+'"></span>'+cat.name+'</div>'+tagCounts.join('')+'</div>';
    }).join('');

    // 分布标签点击事件 — 联动物料明细筛选
    var distEl = document.getElementById('npiRiskDist');
    if(distEl){
      distEl.querySelectorAll('.npi-dist-clickable').forEach(function(row){
        row.addEventListener('click',function(e){
          e.stopPropagation();
          var tid = row.dataset.tag;
          if(_activeDistTag === tid){ _activeDistTag = null; }
          else { _activeDistTag = tid; }
          renderAll();
        });
      });
    }

    // 筛选提示
    var hint = document.getElementById('npiDistFilterHint');
    if(hint){
      if(_activeDistTag){
        var tagInfo = ALL_RISK_TAGS.find(function(t){return t.id===_activeDistTag;});
        hint.style.display='inline'; hint.textContent='已筛选「'+(tagInfo?tagInfo.name:_activeDistTag)+'」· 点击取消';
      } else {
        hint.style.display='none';
      }
    }

    // ⑤ Material detail table
    document.getElementById('npiTableCount').textContent = '共 '+mats.length+' 条物料';
    var stageHeaders = '';
    var currentStage = '';
    DETAIL_COLUMNS.forEach(function(col){
      if(col.stage!==currentStage){
        currentStage=col.stage;
        if(col.stage==='_risk'){stageHeaders+='<th class="npi-th-stage s4" colspan="1">风险标签</th>';}
        else{var si=STAGES.find(function(s){return s.id===col.stage;}),span=DETAIL_COLUMNS.filter(function(c){return c.stage===col.stage;}).length; stageHeaders+='<th class="npi-th-stage '+(si?si.cls:'')+'" colspan="'+span+'">'+(si?si.name:'')+'</th>';}
      }
    });
    var headerHtml = '<tr>'+stageHeaders+'</tr><tr>'+DETAIL_COLUMNS.map(function(col){return '<th>'+col.label+'</th>';}).join('')+'</tr>';
    document.getElementById('npiTHead').innerHTML = headerHtml;

    document.getElementById('npiTBody').innerHTML = mats.map(function(m){
      return '<tr>'+DETAIL_COLUMNS.map(function(col){
        var v=m[col.key]||'';
        if(col.key==='料号') return '<td style="color:var(--primary);font-weight:600">'+v+'</td>';
        if(col.key==='物料名称') return '<td>'+v+'</td>';
        if(col.key==='分类属性'){var cls=v.indexOf('关键定制')>=0?'red':v.indexOf('关键标准')>=0?'amber':'gray'; return '<td><span class="npi-pill '+cls+'">'+v+'</span></td>';}
        if(col.key==='CI属性') return '<td>'+(v==='是'?'<span class="npi-pill purple">CI件</span>':'<span class="npi-pill gray">否</span>')+'</td>';
        if(col.key==='单源标志') return '<td>'+(v==='单源'?'<span class="npi-pill amber">单源</span>':'<span class="npi-pill gray">多源</span>')+'</td>';
        if(['认证状态','物料成熟度','TR转PR状态','PR转PO状态','Commit状态','PO需期变更未同步标志','启动生产授权状态','材料齐套状态','ASL覆盖状态','BPA价格状态','ECCN分类状态','是否满足出货条件','8码/标签状态','IQC检验结果','变更影响标记'].indexOf(col.key)>=0) return '<td>'+statusPill(v)+'</td>';
        if(col.key==='齐套率') return '<td>'+statusPill(v)+'</td>';
        if(col.key==='风险标签'){var ids=m.风险标签||[]; return '<td>'+(ids.length?ids.map(function(rid){var t=ALL_RISK_TAGS.find(function(x){return x.id===rid;});var cls=t?t.catCls.replace('cat-',''):'red';var isActive=_activeDistTag===rid;return '<span class="npi-risk-tag-pill npi-pill '+cls+'"'+(isActive?' style="outline:2px solid var(--primary);outline-offset:1px"':'')+'>'+(t?t.name:rid)+'</span>';}).join(''):'<span class="npi-pill gray">-</span>')+'</td>';}
        if(col.key==='齐套缺口数量'){var n=num(v); return '<td>'+(n>0?'<span style="color:var(--danger);font-weight:600">'+v+'</span>':v)+'</td>';}
        if(['TR滞留天数','PR滞留天数','Commit偏差天数','ASN超时天数','IQC Hold超期天数','物料呆滞天数'].indexOf(col.key)>=0){var n=num(v); return '<td>'+(n>0?'<span style="color:var(--danger);font-weight:600">'+v+'</span>':(v||'-'))+'</td>';}
        if(['IQC Hold数量','库存结余数量'].indexOf(col.key)>=0){var n=num(v); return '<td>'+(n>0?'<span style="color:var(--warning);font-weight:600">'+v+'</span>':(v||'-'))+'</td>';}
        return '<td>'+(v||'-')+'</td>';
      }).join('')+'</tr>';
    }).join('');

  } catch(e){ console.error('material init error:', e); }
}

// ═══════════════ 入口 ═══════════════
window.initPage_material = function(){
  _activeDistTag = null; _matCache = {};
  renderAll();
};
registerModule('material', initPage_material);

})();
