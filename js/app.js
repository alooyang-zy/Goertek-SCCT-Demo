const App = { currentPage:'overview', charts:{}, filter:{ bg:'', bu:'', customer:'', product:'' }, drillDown:null };

// ═══════════════════════════════════════════════════
//  DataService — 统一数据服务层（单项目一次生成，全局共享）
// ═══════════════════════════════════════════════════
var DS = {
  _cache: {},

  // 种子随机数生成器
  _rng: function(seed) {
    var s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  },

  // 字符串哈希
  _hash: function(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return h >>> 0;
  },

  // 获取项目的统一供应链KPI数据
  get: function(pid) {
    if (this._cache[pid]) return this._cache[pid];

    var proj = projects.find(function(p) { return p.id === pid; });
    if (!proj) return null;

    var base = this._hash(pid);
    var rng = this._rng(base);
    var isNPI = proj.lifecycleRaw === 'NPI';
    var isRamp = proj.lifecycleRaw === 'Ramp-up';
    var perfMod = isNPI ? 0.82 : isRamp ? 0.91 : 0.96;

    // 核心 KPI
    var otd = Math.round(80 * perfMod + rng() * 18 * perfMod);
    var kitRate = Math.round(78 * perfMod + rng() * 20 * perfMod);
    var invAmount = Math.round((200 + rng() * 800) * proj.volume / 10000);
    var costTotal = Math.round(invAmount * (4 + rng() * 3));
    var costAchieve = Math.round(85 * perfMod + rng() * 14 * perfMod);
    var hiddenCostRate = Math.round((1 - perfMod) * 100 + rng() * 8);
    var unitCost = Math.round(50 + rng() * 200);
    var overBudget = Math.round(rng() * costTotal * 0.08 * (1 - perfMod));

    // SCOR 五维评分（与 overview _ovGenKpi 一致的算法）
    var kpiRng = this._rng(this._hash(proj.name) * 31);
    var dims = [];
    for (var i = 0; i < 5; i++) {
      var b = isNPI ? 72 : 78;
      dims.push(Math.min(100, Math.max(30, Math.round(b + (kpiRng() - 0.35) * 48))));
    }
    var score = Math.round(dims.reduce(function(a, v) { return a + v; }, 0) / 5);
    var health = score >= 80 ? 'g' : score >= 65 ? 'y' : 'r';

    // OTS周期
    var otsTotal = Math.round((30 + rng() * 30) / perfMod);
    var otsTarget = Math.round(otsTotal * (0.7 + rng() * 0.1));

    // 库存指标
    var ito = Math.round((3 + rng() * 5) * perfMod * 10) / 10;
    var fgDos = Math.round(5 + rng() * 25);
    var rmDos = Math.round(7 + rng() * 40);
    var agingPct = Math.round((1 - perfMod) * 100 + rng() * 15);
    var eoPct = Math.round((1 - perfMod) * 80 + rng() * 8);

    var d = {
      pid: pid,
      proj: proj,
      // 进度/交付
      otd: otd,
      kitRate: kitRate,
      score: score,
      health: health,
      dims: dims,
      // OTS周期
      otsTotal: otsTotal,
      otsTarget: otsTarget,
      otsGap: otsTotal - otsTarget,
      // 库存
      invAmount: invAmount,
      ito: ito,
      fgDos: fgDos,
      rmDos: rmDos,
      agingPct: agingPct,
      eoPct: eoPct,
      // 成本
      costTotal: costTotal,
      costAchieve: costAchieve,
      hiddenCostRate: hiddenCostRate,
      unitCost: unitCost,
      overBudget: overBudget,
    };

    this._cache[pid] = d;
    return d;
  },

  // 批量获取
  getAll: function(pids) {
    return pids.map(function(pid) { return DS.get(pid); }).filter(Boolean);
  },

  // 清除缓存
  clear: function() { this._cache = {}; }
};

document.addEventListener('DOMContentLoaded',()=>{
  initNavigation();
  initSidebar();
  initDimensionFilter();
  // 初始页面：通过moduleInits加载
  if(moduleInits.overview)moduleInits.overview();
});

// ========== 导航 ==========
function initNavigation(){
  document.querySelectorAll('.nav-item').forEach(item=>{
    item.addEventListener('click',e=>{e.preventDefault();const page=item.dataset.page;if(page)switchPage(page);});
  });
}
function switchPage(pageId, opts){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const an=document.querySelector(`.nav-item[data-page="${pageId}"]`);if(an)an.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const tp=document.getElementById(`page-${pageId}`);if(tp)tp.classList.add('active');
  App.currentPage=pageId;
  // 穿透跳转上下文
  if(opts && opts.projectId) App.drillDown = { pageId: pageId, projectId: opts.projectId };
  const titles={overview:'控制塔全局总览',progress:'项目进度跟踪',cycle:'项目周期监控',inventory:'项目库存健康',cost:'项目成本可视',material:'物料导入状态',supplier:'供方深度协同',delivery:'客户交期答复',forecast:'需求预测模型',supplydemand:'供需齐套分析',risk:'风险雷达预警',closedloop:'事件闭环管理',settings:'系统配置管理',ai:'智能员工助手',indicatorlist:'场景指标清单'};
  document.getElementById('pageTitle').textContent=titles[pageId]||'';
  document.getElementById('breadcrumbCurrent').textContent=titles[pageId]||'';
  if(moduleInits[pageId]){moduleInits[pageId]();resizeCharts();}
}
function resizeCharts(){requestAnimationFrame(()=>{requestAnimationFrame(()=>{Object.keys(App.charts).forEach(k=>{if(App.charts[k]&&App.charts[k].resize)App.charts[k].resize();});});});}

// ========== 侧栏 ==========
function initSidebar(){document.getElementById('sidebarToggle').addEventListener('click',()=>{document.getElementById('sidebar').classList.toggle('collapsed');});}

// ========== 四维双向联动筛选（BG↔BU↔客户↔产品） ==========
function initDimensionFilter(){
  fillSimple('filterBg',[...new Set(projects.map(p=>p.bg))].sort());
  fillSimple('filterBu',[...new Set(projects.map(p=>p.bu))].sort());
  fillSimple('filterCustomer',[...new Set(projects.map(p=>p.customer))].sort());
  fillSimple('filterProduct',[...new Set(projects.map(p=>p.productLine))].sort());
}
function fillSimple(id,vals){
  const sel=document.getElementById(id);if(!sel)return;
  const labels={filterBg:'BG',filterBu:'BU',filterCustomer:'客户',filterProduct:'产品'};
  sel.innerHTML=`<option value="">全部${labels[id]}</option>`+vals.map(v=>`<option value="${v}">${v}</option>`).join('');
}
function fillSimpleEmpty(id){
  const sel=document.getElementById(id);if(!sel)return;
  const labels={filterBg:'BG',filterBu:'BU',filterCustomer:'客户',filterProduct:'产品'};
  sel.innerHTML=`<option value="">全部${labels[id]}</option>`;
}
function onFilterChange(level){
  const val=document.getElementById('filter'+level.charAt(0).toUpperCase()+level.slice(1)).value;
  App.filter[level]=val;
  // 四维双向联动
  ['bg','bu','customer','product'].forEach(lvl=>{if(lvl!==level)rebuildDropdown(lvl);});
  refreshCurrentPage();
}
function rebuildDropdown(level){
  const sel=document.getElementById('filter'+level.charAt(0).toUpperCase()+level.slice(1));if(!sel)return;
  const curVal=sel.value;
  const skipKeys=[level];
  const saved={};skipKeys.forEach(k=>{saved[k]=App.filter[k];App.filter[k]='';});
  const fp=getFilteredProjects();
  skipKeys.forEach(k=>{App.filter[k]=saved[k];});
  const vals=[...new Set(fp.map(p=>level==='bu'?p.bu:level==='customer'?p.customer:level==='product'?p.productLine:p.bg))].sort();
  fillSimple('filter'+level.charAt(0).toUpperCase()+level.slice(1),vals);
  if(curVal&&vals.includes(curVal))sel.value=curVal;
}
function getFilteredProjects(){
  return projects.filter(p=>{
    if(App.filter.bg&&p.bg!==App.filter.bg)return false;
    if(App.filter.bu&&p.bu!==App.filter.bu)return false;
    if(App.filter.customer&&p.customer!==App.filter.customer)return false;
    if(App.filter.product&&p.productLine!==App.filter.product)return false;
    return true;
  });
}
function resetGlobalFilter(){
  App.filter={bg:'',bu:'',customer:'',product:''};
  fillSimple('filterBg',[...new Set(projects.map(p=>p.bg))].sort());
  fillSimple('filterBu',[...new Set(projects.map(p=>p.bu))].sort());
  fillSimple('filterCustomer',[...new Set(projects.map(p=>p.customer))].sort());
  fillSimple('filterProduct',[...new Set(projects.map(p=>p.productLine))].sort());
  refreshCurrentPage();
}
function refreshCurrentPage(){switchPage(App.currentPage);}
function filterByDimension(data,key='projectId'){
  if(!App.filter.bg&&!App.filter.bu&&!App.filter.customer&&!App.filter.product)return data;
  return data.filter(item=>{
    const pid=typeof item[key]==='string'?item[key]:item.project||item.projectId||'';
    const proj=projects.find(p=>p.id===pid||p.name===pid);
    if(!proj)return true;
    if(App.filter.bg&&proj.bg!==App.filter.bg)return false;
    if(App.filter.bu&&proj.bu!==App.filter.bu)return false;
    if(App.filter.customer&&proj.customer!==App.filter.customer)return false;
    if(App.filter.product&&proj.productLine!==App.filter.product)return false;
    return true;
  });
}

// ========== 工具函数 ==========
function rgba(hex,alpha){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${alpha})`;}
function kpiIcon(cls){const map={'fa-diagram-project':'blue','fa-bullseye':'green','fa-clock':'amber','fa-rotate':'teal','fa-cubes':'purple','fa-triangle-exclamation':'red','fa-flag':'blue','fa-chart-line':'green','fa-user-tie':'amber','fa-user':'purple','fa-list-check':'blue','fa-check-circle':'green','fa-spinner':'amber','fa-box-archive':'amber','fa-microchip':'purple'};return map[cls]||'blue';}
function debounce(fn,delay){var timer=null;return function(){var args=arguments,ctx=this;clearTimeout(timer);timer=setTimeout(function(){fn.apply(ctx,args);},delay);};}

// ========== 穿透跳转 ==========
// 从总览表格跳转到对应模块详情，自动选中项目
// 映射规则：NPI→物料导入(关注物料认证), 健康红→风险预警, 其他→项目进度
function ovDrillTo(pid){
  var proj = projects.find(function(p){ return p.id===pid; });
  if(!proj) return;
  var ds = DS.get(pid);
  var target;
  if(ds && ds.health==='r') target='risk';
  else if(proj.lifecycleRaw==='NPI') target='material';
  else target='progress';
  switchPage(target, {projectId:pid});
}

// 消费 drillDown 上下文：各模块初始化时调用，选中对应项目
function consumeDrillDown(selectId){
  if(!App.drillDown) return false;
  var pid = App.drillDown.projectId;
  App.drillDown = null;
  var sel = document.getElementById(selectId);
  if(sel && pid){
    var opts = sel.options;
    for(var i=0;i<opts.length;i++){
      if(opts[i].value===pid){ sel.value=pid; return true; }
    }
  }
  return false;
}

// ========== 全屏 ==========
function toggleFullscreen(){
  if(!document.fullscreenElement){document.documentElement.requestFullscreen();document.body.classList.add('fullscreen-mode');}else{document.exitFullscreen();document.body.classList.remove('fullscreen-mode');}
}


// ========== 项目选择器工具 ==========
function fillProjectSelect(sel, fp){
  var curVal = sel.value;
  sel.innerHTML = '<option value="">— 选择项目 —</option>' + fp.map(function(p){
    var major = p.isMajor ? ' ★' : '';
    return '<option value="'+p.id+'">'+p.name+' ['+p.bg+'·'+p.customer+']'+major+'</option>';
  }).join('');
  if(curVal && fp.some(function(p){ return p.id===curVal; })) sel.value = curVal;
  else if(fp.length) sel.value = fp[0].id;
}
// ========== Module registry ==========
const moduleInits = {};
function registerModule(name, initFn) { moduleInits[name] = initFn; }
