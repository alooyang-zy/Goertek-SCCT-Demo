// Module: indicatorlist — 场景指标清单 v10.19 (物料导入状态指标/标签字典·支持Excel导出)
(function(){

// ═══════════════ 数据源 ═══════════════
// 以下数据抽取自 material.js，作为指标字典的静态数据

var INDICATORS = [
  // ── 一、阶段定义 ──
  {cat:'阶段定义',code:'basic',name:'物料基本信息',desc:'物料基础属性：料号/名称/分类/CI/供应商/单源/图纸/认证/成熟度',sub:'7段链路'},
  {cat:'阶段定义',code:'demand',name:'项目原始需求',desc:'需求数量/需求日期/变更次数/变更影响标记',sub:'7段链路'},
  {cat:'阶段定义',code:'trpr',name:'TR/PR流转',desc:'TR创建/转PR状态/滞留天数/ASL覆盖/BPA价格/ECCN分类/PR申请/转PO/滞留',sub:'7段链路'},
  {cat:'阶段定义',code:'po',name:'PO/供应商响应',desc:'PO下单数量/Commit状态/偏差天数/需期变更同步',sub:'7段链路'},
  {cat:'阶段定义',code:'prod',name:'供应商生产准备',desc:'生产授权/材料齐套/生产完成/出货条件/呆滞风险/可发货量',sub:'7段链路'},
  {cat:'阶段定义',code:'asn',name:'ASN/收货/IQC',desc:'ASN创建/超时/8码标签/仓库接收/IQC检验/Hold/释放',sub:'7段链路'},
  {cat:'阶段定义',code:'stock',name:'库存与齐套',desc:'可用库存/齐套缺口/齐套率/库存结余/呆滞天数',sub:'7段链路'},

  // ── 二、风险标签分类 ──
  {cat:'风险标签',code:'procurement',name:'采购链路风险',desc:'含 R01~R04：TR滞留/PR滞留/交期不满足/PO需期未同步',sub:'风险分类'},
  {cat:'风险标签',code:'R01',name:'TR滞留未转PR',desc:'TR创建后超过约定时效未转为PR',sub:'采购链路风险'},
  {cat:'风险标签',code:'R02',name:'PR滞留未转PO',desc:'PR审批通过后未在约定时效内下PO',sub:'采购链路风险'},
  {cat:'风险标签',code:'R03',name:'供应商交期承诺不满足',desc:'供应商确认的交付日期晚于项目需求日期',sub:'采购链路风险'},
  {cat:'风险标签',code:'R04',name:'PO需期变更未同步供应商',desc:'内部需期调整后PO未同步更新给供应商',sub:'采购链路风险'},
  {cat:'风险标签',code:'supplier',name:'供应商执行风险',desc:'含 R05~R08：材料未齐套/生产未授权/ASN未创建',sub:'风险分类'},
  {cat:'风险标签',code:'R05',name:'供应商材料未齐套',desc:'供应商侧关键材料短缺，无法按计划启动生产',sub:'供应商执行风险'},
  {cat:'风险标签',code:'R06',name:'供应商启动生产未授权',desc:'供应商先行开工但内部未完成生产授权审批',sub:'供应商执行风险'},
  {cat:'风险标签',code:'R08',name:'ASN未按承诺创建',desc:'供应商未在承诺发货日前创建ASN单据',sub:'供应商执行风险'},
  {cat:'风险标签',code:'design',name:'设计与变更风险',desc:'含 R09/R10/R17：ECN变更/呆滞风险',sub:'风险分类'},
  {cat:'风险标签',code:'R09',name:'ECN频繁变更',desc:'工程变更通知频繁发生，影响物料版本和供应计划',sub:'设计与变更风险'},
  {cat:'风险标签',code:'R10',name:'变更引发呆滞风险',desc:'ECN切换导致旧版本物料积压/呆滞',sub:'设计与变更风险'},
  {cat:'风险标签',code:'R17',name:'供应商侧变更呆滞风险',desc:'供应商已完成备料/在制，因变更导致呆滞',sub:'设计与变更风险'},
  {cat:'风险标签',code:'quality',name:'质量与认证风险',desc:'含 R11~R14：CI件认证/成熟度/检验依据/FAI',sub:'风险分类'},
  {cat:'风险标签',code:'R11',name:'CI件未认证',desc:'客户指定物料(CI)尚未完成客户认证流程',sub:'质量与认证风险'},
  {cat:'风险标签',code:'R12',name:'物料成熟度NG',desc:'物料成熟度评审未通过，无法进入下一阶段',sub:'质量与认证风险'},
  {cat:'风险标签',code:'R13',name:'IQC检验依据缺失',desc:'来料检验缺少检验标准/规格书/签样',sub:'质量与认证风险'},
  {cat:'风险标签',code:'R14',name:'首批来料无FAI记录',desc:'新供应商/新料号首批来料缺少首件检验报告',sub:'质量与认证风险'},
  {cat:'风险标签',code:'warehouse',name:'仓储与追溯风险',desc:'含 R15/R16：8码标签异常/Hold超期',sub:'风险分类'},
  {cat:'风险标签',code:'R15',name:'8码/标签/ASN异常',desc:'物料标签/8码追溯信息/ASN单据异常',sub:'仓储与追溯风险'},
  {cat:'风险标签',code:'R16',name:'检验Hold超期',desc:'IQC或MRB判定Hold后超期未处置',sub:'仓储与追溯风险'},

  // ── 三、物料链路明细列 ──
  {cat:'链路明细列',code:'料号',name:'料号',desc:'物料唯一编码，例如3010-0001',sub:'物料基本信息'},
  {cat:'链路明细列',code:'物料名称',name:'物料名称',desc:'物料描述名称，例如主芯片/声学驱动IC/蓝牙模块',sub:'物料基本信息'},
  {cat:'链路明细列',code:'分类属性',name:'分类属性',desc:'关键定制/关键标准/非关键',sub:'物料基本信息'},
  {cat:'链路明细列',code:'CI属性',name:'CI属性',desc:'是否为客户指定物料(是/否)',sub:'物料基本信息'},
  {cat:'链路明细列',code:'供应商',name:'供应商',desc:'物料供应商名称',sub:'物料基本信息'},
  {cat:'链路明细列',code:'单源标志',name:'单源标志',desc:'单源/多源供应状态',sub:'物料基本信息'},
  {cat:'链路明细列',code:'图纸版本',name:'图纸版本',desc:'物料图纸当前版本号',sub:'物料基本信息'},
  {cat:'链路明细列',code:'认证状态',name:'认证状态',desc:'物料认证状态：已认定/条件通过/未认定/不适用',sub:'物料基本信息'},
  {cat:'链路明细列',code:'物料成熟度',name:'物料成熟度',desc:'物料导入成熟度：OK/Risk/不适用',sub:'物料基本信息'},
  {cat:'链路明细列',code:'需求数量',name:'需求数量',desc:'项目对该物料的需求量(PCS)',sub:'项目原始需求'},
  {cat:'链路明细列',code:'需求日期',name:'需求日期',desc:'物料需求交付日期',sub:'项目原始需求'},
  {cat:'链路明细列',code:'变更次数',name:'变更次数',desc:'需求变更累计次数',sub:'项目原始需求'},
  {cat:'链路明细列',code:'变更影响标记',name:'变更影响标记',desc:'变更对物料的影响分类(无影响/交期延误/呆滞风险)',sub:'项目原始需求'},
  {cat:'链路明细列',code:'TR创建数量',name:'TR创建数量',desc:'技术需求单(TR)创建数量',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'TR转PR状态',name:'TR转PR状态',desc:'TR是否转为采购申请(PR)：已转PR/未转PR/不适用',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'TR滞留天数',name:'TR滞留天数',desc:'TR创建后未转PR的滞留天数',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'ASL覆盖状态',name:'ASL覆盖状态',desc:'合格供方名录(ASL)是否覆盖该物料',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'BPA价格状态',name:'BPA价格状态',desc:'长期采购协议(BPA)价格是否已覆盖',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'ECCN分类状态',name:'ECCN分类状态',desc:'出口管制分类编号(ECCN)是否已完成分类',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'PR申请数量',name:'PR申请数量',desc:'采购申请单(PR)数量',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'PR转PO状态',name:'PR转PO状态',desc:'PR是否转为采购订单(PO)：已转PO/未转PO/不适用',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'PR滞留天数',name:'PR滞留天数',desc:'PR创建后未转PO的滞留天数',sub:'TR/PR流转'},
  {cat:'链路明细列',code:'PO下单数量',name:'PO下单数量',desc:'已下达的采购订单数量',sub:'PO/供应商响应'},
  {cat:'链路明细列',code:'Commit状态',name:'Commit状态',desc:'供应商交期承诺状态：已确认/需重确认/未确认',sub:'PO/供应商响应'},
  {cat:'链路明细列',code:'Commit偏差天数',name:'Commit偏差天数',desc:'供应商承诺交期与需求交期的偏差天数',sub:'PO/供应商响应'},
  {cat:'链路明细列',code:'PO需期变更未同步标志',name:'PO需期变更未同步标志',desc:'PO需期变更是否同步到供应商(已同步/待同步)',sub:'PO/供应商响应'},
  {cat:'链路明细列',code:'启动生产授权状态',name:'启动生产授权状态',desc:'供应商启动生产是否已获授权(已授权/未授权/不适用)',sub:'供应商生产准备'},
  {cat:'链路明细列',code:'材料齐套状态',name:'材料齐套状态',desc:'供应商侧材料是否齐套(已齐套/未齐套)',sub:'供应商生产准备'},
  {cat:'链路明细列',code:'生产完成数量',name:'生产完成数量',desc:'供应商已完成生产的数量',sub:'供应商生产准备'},
  {cat:'链路明细列',code:'是否满足出货条件',name:'是否满足出货条件',desc:'是否满足出货(满足/不满足)',sub:'供应商生产准备'},
  {cat:'链路明细列',code:'供应商侧呆滞风险数量',name:'供应商侧呆滞风险数量',desc:'供应商侧已产生呆滞的数量',sub:'供应商生产准备'},
  {cat:'链路明细列',code:'可发货数量',name:'可发货数量',desc:'供应商已完工可供发货的数量',sub:'供应商生产准备'},
  {cat:'链路明细列',code:'ASN创建数量',name:'ASN创建数量',desc:'供应商创建的预发货通知(ASN)数量',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'ASN超时天数',name:'ASN超时天数',desc:'ASN创建超过约定时效的天数',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'8码/标签状态',name:'8码/标签状态',desc:'物料8码追溯、标签打印状态(完整/8码未匹配)',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'仓库接收数量',name:'仓库接收数量',desc:'仓库实际接收的物料数量',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'IQC检验结果',name:'IQC检验结果',desc:'来料质量检验结果(合格/Hold)',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'IQC Hold数量',name:'IQC Hold数量',desc:'IQC判定Hold的物料数量',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'IQC Hold超期天数',name:'IQC Hold超期天数',desc:'Hold状态超过标准处置时效的天数',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'IQC释放数量',name:'IQC释放数量',desc:'经IQC判定合格后释放的数量',sub:'ASN/收货/IQC'},
  {cat:'链路明细列',code:'可用库存数量',name:'可用库存数量',desc:'当前项目可用的物料库存数量',sub:'库存与齐套'},
  {cat:'链路明细列',code:'齐套缺口数量',name:'齐套缺口数量',desc:'物料短缺数量(需求-可用)',sub:'库存与齐套'},
  {cat:'链路明细列',code:'齐套率',name:'齐套率',desc:'可用库存/需求数量×100%',sub:'库存与齐套'},
  {cat:'链路明细列',code:'库存结余数量',name:'库存结余数量',desc:'超出需求的库存结余数量',sub:'库存与齐套'},
  {cat:'链路明细列',code:'物料呆滞天数',name:'物料呆滞天数',desc:'库存物料呆滞天数(E&O风险)',sub:'库存与齐套'},
  {cat:'链路明细列',code:'风险标签',name:'风险标签',desc:'物料命中的风险标签列表',sub:'风险标记'},

  // ── 四、汇总指标(6卡片) ──
  {cat:'汇总指标',code:'totalMat',name:'物料总数',desc:'管理NPI阶段料号总数量, 区分关键/非关键',sub:'6汇总卡片'},
  {cat:'汇总指标',code:'certOk',name:'认证料号',desc:'已认证/认定可执行：已认定+条件通过+不适用',sub:'6汇总卡片'},
  {cat:'汇总指标',code:'matureOk',name:'成熟料号',desc:'成熟度可继续推进：OK+不适用',sub:'6汇总卡片'},
  {cat:'汇总指标',code:'gapCount',name:'齐套缺口料号',desc:'库存不足需催货：缺口>0的料号数',sub:'6汇总卡片'},
  {cat:'汇总指标',code:'keyCount',name:'关键料号',desc:'重点跟踪关键物料：关键定制+关键标准',sub:'6汇总卡片'},
  {cat:'汇总指标',code:'riskCount',name:'风险物料',desc:'项目风险物料汇总：已命中风险标签的物料数',sub:'6汇总卡片'},

  // ── 五、风险处理状态 ──
  {cat:'处理动作',code:'open',name:'待处理',desc:'风险已识别但尚未分配处理人',sub:'风险处理状态'},
  {cat:'处理动作',code:'doing',name:'处理中',desc:'已分配责任人，正在执行处理动作',sub:'风险处理状态'},
  {cat:'处理动作',code:'wait',name:'待确认',desc:'处理动作已完成，等待确认关闭证据',sub:'风险处理状态'},
  {cat:'处理动作',code:'closed',name:'已关闭',desc:'风险处理完成并已验证关闭',sub:'风险处理状态'},
];

// ═══════════════ 渲染 ═══════════════
function initPage_indicatorlist(){
  var catOrder = ['阶段定义','汇总指标','风险标签','链路明细列','处理动作'];
  var catNames = {'阶段定义':'物料7段链路','汇总指标':'6项汇总卡片KPI','风险标签':'5大类·17项风险标签','链路明细列':'45列物料明细','处理动作':'4级风险处理状态'};

  // 在渲染前按catOrder排序
  var sorted = [].concat(INDICATORS);
  sorted.sort(function(a,b){
    var ia=catOrder.indexOf(a.cat), ib=catOrder.indexOf(b.cat);
    if(ia!==ib) return ia-ib;
    return a.code.localeCompare(b.code);
  });

  var currentCat = '';
  var rowHtml = '';
  sorted.forEach(function(item){
    if(item.cat!==currentCat){
      currentCat=item.cat;
      rowHtml += '<tr style="background:var(--border-light)"><td colspan="5" style="font-weight:700;font-size:13px;color:var(--primary);padding:10px 14px;border-bottom:2px solid var(--primary-light)">'+
        (currentCat==='阶段定义'?'<i class="fas fa-layer-group"></i>&nbsp;':
         currentCat==='风险标签'?'<i class="fas fa-tags"></i>&nbsp;':
         currentCat==='链路明细列'?'<i class="fas fa-table"></i>&nbsp;':
         currentCat==='汇总指标'?'<i class="fas fa-gauge-high"></i>&nbsp;':
         '<i class="fas fa-gear"></i>&nbsp;')+
        '「'+(catNames[currentCat]||currentCat)+'」</td></tr>';
    }
    rowHtml += '<tr>'+
      '<td style="font-size:11px;color:var(--text-muted)">'+item.cat+'</td>'+
      '<td style="font-weight:600;font-size:11px;color:var(--primary-light)">'+item.code+'</td>'+
      '<td style="font-size:12px">'+item.name+'</td>'+
      '<td style="font-size:11px;color:var(--text-sec);white-space:normal;line-height:1.5">'+item.desc+'</td>'+
      '<td style="font-size:11px;color:var(--text-muted)">'+item.sub+'</td>'+
      '</tr>';
  });

  document.getElementById('ilTHead').innerHTML = '<tr><th style="width:90px;min-width:90px">指标分类</th><th style="width:110px;min-width:110px">编码</th><th style="width:160px;min-width:160px">名称</th><th>说明/描述</th><th style="width:110px;min-width:110px">所属类别</th></tr>';
  document.getElementById('ilTBody').innerHTML = rowHtml;
  document.getElementById('ilTotalCount').textContent = '共 '+INDICATORS.length+' 项指标/标签';
}

// ═══════════════ Excel 导出 ═══════════════
function exportIndicatorExcel(){
  var BOM = '\uFEFF';
  var header = '指标分类,编码,名称,说明/描述,所属类别\n';
  var catOrder = ['阶段定义','汇总指标','风险标签','链路明细列','处理动作'];
  var sorted = [].concat(INDICATORS);
  sorted.sort(function(a,b){
    var ia=catOrder.indexOf(a.cat), ib=catOrder.indexOf(b.cat);
    if(ia!==ib) return ia-ib;
    return a.code.localeCompare(b.code);
  });
  var rows = sorted.map(function(item){
    return [item.cat, item.code, item.name, '"'+item.desc.replace(/"/g,'""')+'"', item.sub].join(',');
  }).join('\n');
  var csv = BOM + header + rows;

  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '场景指标清单_物料导入状态.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.initPage_indicatorlist = initPage_indicatorlist;
window.exportIndicatorExcel = exportIndicatorExcel;
registerModule('indicatorlist', initPage_indicatorlist);

})();
