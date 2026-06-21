// ===== 项目成本可视 v9.1 =====
// 基于《项目成本可视.html》参考 + 48指标体系
// 浅色主题 · 单项目四维联动 · 六域Tab指标

registerModule('cost', initPage_cost);

// ── 48指标 ──
const COST_IND = [
  {id:'PC-01',domain:'采购成本',name:'BOM物料总成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'PC-02',domain:'采购成本',name:'采购价格达成率',unit:'%',normal:'≥98%',yw:'95~98%',rw:'<95%'},
  {id:'PC-03',domain:'采购成本',name:'紧急采购溢价金额',unit:'元',normal:'≤¥1万',yw:'¥1~10万',rw:'>¥10万'},
  {id:'PC-04',domain:'采购成本',name:'超额备料损耗',unit:'元',normal:'≤¥2万',yw:'¥2~8万',rw:'>¥8万'},
  {id:'PC-05',domain:'采购成本',name:'汇率损益',unit:'%',normal:'±1%',yw:'±3%',rw:'>±5%'},
  {id:'PC-06',domain:'采购成本',name:'关税&进口税费',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'PC-07',domain:'采购成本',name:'采购成本占比',unit:'%',normal:'—',yw:'—',rw:'—'},
  {id:'MF-01',domain:'制造成本',name:'标准制造成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'MF-02',domain:'制造成本',name:'良率损耗成本',unit:'%',normal:'良率≥99%',yw:'97~99%',rw:'<97%'},
  {id:'MF-03',domain:'制造成本',name:'返工&维修成本',unit:'元',normal:'≤¥0.5万',yw:'¥0.5~3万',rw:'>¥3万'},
  {id:'MF-04',domain:'制造成本',name:'产能浪费成本(OEE)',unit:'%',normal:'OEE≥85%',yw:'75~85%',rw:'<75%'},
  {id:'MF-05',domain:'制造成本',name:'模治具摊销成本',unit:'元',normal:'—',yw:'超5~10%',rw:'>10%'},
  {id:'MF-06',domain:'制造成本',name:'超/少产成本',unit:'%',normal:'≤±2%',yw:'±2~5%',rw:'>±5%'},
  {id:'MF-07',domain:'制造成本',name:'制造成本达成率',unit:'%',normal:'≤100%',yw:'100~108%',rw:'>108%'},
  {id:'IV-01',domain:'库存成本',name:'平均库存金额',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'IV-02',domain:'库存成本',name:'库存持有成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'IV-03',domain:'库存成本',name:'库存周转天数DIO',unit:'天',normal:'≤30',yw:'30~45',rw:'>45'},
  {id:'IV-04',domain:'库存成本',name:'呆滞料金额',unit:'元',normal:'≤¥2万',yw:'¥2~10万',rw:'>¥10万'},
  {id:'IV-05',domain:'库存成本',name:'ECN变更报废金额',unit:'元',normal:'≤¥1万',yw:'¥1~5万',rw:'>¥5万'},
  {id:'IV-06',domain:'库存成本',name:'安全库存超储率',unit:'%',normal:'≤10%',yw:'10~30%',rw:'>30%'},
  {id:'IV-07',domain:'库存成本',name:'库存成本占比',unit:'%',normal:'—',yw:'—',rw:'—'},
  {id:'LG-01',domain:'物流成本',name:'入厂物流成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'LG-02',domain:'物流成本',name:'出厂物流成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'LG-03',domain:'物流成本',name:'紧急空运溢价金额',unit:'元',normal:'¥0',yw:'¥1~10万',rw:'>¥10万'},
  {id:'LG-04',domain:'物流成本',name:'空运占比',unit:'%',normal:'≤3%',yw:'3~10%',rw:'>10%'},
  {id:'LG-05',domain:'物流成本',name:'仓储费用',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'LG-06',domain:'物流成本',name:'逆向物流成本',unit:'元',normal:'≤¥0.5万',yw:'¥0.5~3万',rw:'>¥3万'},
  {id:'LG-07',domain:'物流成本',name:'物流成本/营收比',unit:'%',normal:'≤3%',yw:'3~6%',rw:'>6%'},
  {id:'QC-01',domain:'质量成本',name:'预防成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'QC-02',domain:'质量成本',name:'检验成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'QC-03',domain:'质量成本',name:'内部失效成本',unit:'元',normal:'≤¥1万',yw:'¥1~5万',rw:'>¥5万'},
  {id:'QC-04',domain:'质量成本',name:'外部失效成本',unit:'元',normal:'≤¥0.5万',yw:'¥0.5~5万',rw:'>¥5万'},
  {id:'QC-05',domain:'质量成本',name:'DPPM/客诉罚款',unit:'元',normal:'¥0',yw:'单次>¥1万',rw:'单次>¥5万'},
  {id:'QC-06',domain:'质量成本',name:'COQ总额',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'QC-07',domain:'质量成本',name:'COQ占营收比',unit:'%',normal:'≤5%',yw:'5~8%',rw:'>8%'},
  {id:'QC-08',domain:'质量成本',name:'外-内失效成本比',unit:'倍',normal:'<1',yw:'1~3',rw:'>3'},
  {id:'MG-01',domain:'管理成本',name:'SC人力成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'MG-02',domain:'管理成本',name:'系统工具摊销',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'MG-03',domain:'管理成本',name:'供应商管理成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'MG-04',domain:'管理成本',name:'需求预测误差MAPE',unit:'%',normal:'≤10%',yw:'10~20%',rw:'>20%'},
  {id:'MG-05',domain:'管理成本',name:'紧急协调成本',unit:'元',normal:'≤¥0.5万',yw:'¥0.5~2万',rw:'>¥2万'},
  {id:'MG-06',domain:'管理成本',name:'管理成本占比',unit:'%',normal:'≤3%',yw:'3~5%',rw:'>5%'},
  {id:'TS-01',domain:'汇总',name:'供应链总成本',unit:'元',normal:'—',yw:'—',rw:'—'},
  {id:'TS-02',domain:'汇总',name:'成本达成率',unit:'%',normal:'≤100%',yw:'100~110%',rw:'>110%'},
  {id:'TS-03',domain:'汇总',name:'单件供应链成本',unit:'元/件',normal:'≤目标',yw:'超5~10%',rw:'>10%'},
  {id:'TS-04',domain:'汇总',name:'成本超支金额',unit:'元',normal:'≤0',yw:'¥0~50万',rw:'>¥50万'},
  {id:'TS-05',domain:'汇总',name:'各域成本占比结构',unit:'%',normal:'—',yw:'—',rw:'—'},
  {id:'TS-06',domain:'汇总',name:'隐性成本率',unit:'%',normal:'≤2%',yw:'2~5%',rw:'>5%'}
];

const L1_IDS=['TS-02','PC-03','LG-03','MF-02','IV-04','QC-04','IV-03'];
const L2_IDS=['PC-02','IV-05','MF-03','MF-04','QC-08','LG-04','MG-04','MF-05'];
const L3_IDS=['TS-05','TS-06','QC-07'];
const DM_COLORS={采购成本:'#3b82f6',制造成本:'#f97316',库存成本:'#eab308',物流成本:'#22c55e',质量成本:'#ef4444',管理成本:'#a855f7',汇总:'#6b7280'};
const DM_ICONS={采购成本:'fa-box',制造成本:'fa-gears',库存成本:'fa-warehouse',物流成本:'fa-truck-fast',质量成本:'fa-check-double',管理成本:'fa-clipboard-list',汇总:'fa-calculator'};
const DM_EMOJI={采购成本:'🔵',制造成本:'🟠',库存成本:'🟡',物流成本:'🟢',质量成本:'🔴',管理成本:'🟣',汇总:'⚫'};
const CLR={d:'#dc2626',w:'#d97706',s:'#16a34a',dbg:'#fef2f2',wbg:'#fef9c3',sbg:'#f0fdf4'};
const DM_ORDER=['采购成本','制造成本','库存成本','物流成本','质量成本','管理成本','汇总'];

// ── 缓存 ──
var costCache = null;

// ── 数据生成 ──
function buildCostData(proj) {
  const seed=(proj.id||'P001').charCodeAt(4)||0;
  const rnd=(min,max,o)=>{let s=((seed*7+o*13+proj.name.length*3)%100)/100;return Math.round((min+s*(max-min))*100)/100;};
  const isNPI=proj.lifecycle==='NPI',isRamp=proj.lifecycle==='Ramp-up',isEOL=proj.lifecycle==='EOL',isMajor=proj.isMajor;
  const rev=rnd(800,5000,1)*10000;
  const tgt=rev*rnd(0.55,0.70,2);
  const bias=isNPI?rnd(1.05,1.18,3):isRamp?rnd(1.02,1.10,3):isEOL?rnd(0.95,1.05,3):rnd(0.97,1.05,3);
  const act=Math.round(tgt*bias);const shipped=Math.round(rev/85);
  const pcR=rnd(0.48,0.56,4),mfR=rnd(0.18,0.25,5),ivR=rnd(0.07,0.14,6),lgR=rnd(0.04,0.10,7),qcR=rnd(0.03,0.07,8),mgR=1-pcR-mfR-ivR-lgR-qcR;
  const domains={采购成本:act*pcR,制造成本:act*mfR,库存成本:act*ivR,物流成本:act*lgR,质量成本:act*qcR,管理成本:act*mgR};
  const dtgt={采购成本:tgt*pcR,制造成本:tgt*mfR,库存成本:tgt*ivR,物流成本:tgt*lgR,质量成本:tgt*qcR,管理成本:tgt*mgR};
  const v={};
  v['PC-01']=Math.round(domains.采购成本*0.88);v['PC-02']=rnd(isNPI?91:isRamp?94:97,100,10);
  v['PC-03']=isNPI?rnd(30000,180000,11):isRamp?rnd(8000,80000,11):rnd(0,20000,11);
  v['PC-04']=(isNPI||isRamp)?rnd(10000,90000,12):rnd(0,30000,12);v['PC-05']=rnd(-2,4,13);v['PC-06']=Math.round(domains.采购成本*0.03);v['PC-07']=(domains.采购成本/act*100).toFixed(1);
  v['MF-01']=Math.round(domains.制造成本*0.7);v['MF-02']=isNPI?rnd(94.5,98.5,14):isRamp?rnd(97,99.5,14):rnd(98.5,99.8,14);
  v['MF-03']=isNPI?rnd(3000,35000,15):isRamp?rnd(1000,18000,15):rnd(0,8000,15);v['MF-04']=isRamp?rnd(74,87,16):rnd(81,93,16);
  v['MF-05']=Math.round(domains.制造成本*0.08);v['MF-06']=rnd(-4,6,17);v['MF-07']=(domains.制造成本/dtgt.制造成本*100).toFixed(1);
  v['IV-01']=Math.round(domains.库存成本/0.02);v['IV-02']=Math.round(domains.库存成本*0.6);
  v['IV-03']=(isNPI||isRamp)?rnd(25,52,18):isEOL?rnd(32,58,18):rnd(18,34,18);
  v['IV-04']=(isNPI||isRamp)?rnd(12000,140000,19):isEOL?rnd(40000,220000,19):rnd(0,28000,19);
  v['IV-05']=(isNPI||isRamp)?rnd(4000,60000,20):rnd(0,18000,20);v['IV-06']=(isNPI||isRamp)?rnd(4,38,21):rnd(0,14,21);v['IV-07']=(v['IV-02']/act*100).toFixed(1);
  v['LG-01']=Math.round(domains.物流成本*0.45);v['LG-02']=Math.round(domains.物流成本*0.35);
  v['LG-03']=isNPI?rnd(0,140000,22):isRamp?rnd(0,90000,22):rnd(0,25000,22);
  v['LG-04']=isNPI?rnd(2,18,23):isRamp?rnd(1,12,23):rnd(0,6,23);v['LG-05']=Math.round(domains.物流成本*0.2);v['LG-06']=rnd(0,10000,24);v['LG-07']=(domains.物流成本/rev*100).toFixed(1);
  v['QC-01']=Math.round(domains.质量成本*0.12);v['QC-02']=Math.round(domains.质量成本*0.18);
  v['QC-03']=isNPI?rnd(3000,45000,25):rnd(0,16000,25);v['QC-04']=isMajor?rnd(2000,48000,26):rnd(0,9000,26);
  v['QC-05']=isMajor?rnd(0,35000,27):0;v['QC-06']=Math.round(v['QC-01']+v['QC-02']+v['QC-03']+v['QC-04']);
  v['QC-07']=(v['QC-06']/rev*100).toFixed(1);v['QC-08']=v['QC-03']>0?(v['QC-04']/v['QC-03']).toFixed(1):'0.0';
  v['MG-01']=Math.round(domains.管理成本*0.45);v['MG-02']=Math.round(domains.管理成本*0.15);
  v['MG-03']=isNPI?rnd(5000,28000,28):rnd(800,10000,28);v['MG-04']=rnd(5,28,29);v['MG-05']=rnd(0,9000,30);v['MG-06']=(domains.管理成本/act*100).toFixed(1);
  v['TS-01']=Math.round(act);v['TS-02']=(act/tgt*100).toFixed(1);v['TS-03']=Math.round(act/shipped);
  v['TS-04']=Math.round(act-tgt);v['TS-05']=`${pcR.toFixed(0)}:${mfR.toFixed(0)}:${ivR.toFixed(0)}:${lgR.toFixed(0)}:${qcR.toFixed(0)}:${mgR.toFixed(0)}`;
  const hidden=v['PC-03']+v['LG-03']+v['IV-04']+Math.max(0,v['QC-05']);v['TS-06']=act>0?(hidden/act*100).toFixed(1):'0.0';
  return {v,domains,dtgt,act,tgt,rev,shipped,isNPI,isRamp,isEOL,isMajor,pcR,mfR,ivR,lgR,qcR,mgR};
}

function getSt(ind,val){
  const id=ind.id;
  if(id==='TS-02'||id==='MF-07'){const v=parseFloat(val);if(v>110)return'red';if(v>100)return'yellow';return'green';}
  if(id==='PC-03'){if(val>100000)return'red';if(val>10000)return'yellow';return'green';}
  if(id==='LG-03'){if(val>100000)return'red';if(val>10000)return'yellow';return'green';}
  if(id==='MF-02'){if(val<97)return'red';if(val<99)return'yellow';return'green';}
  if(id==='IV-04'){if(val>100000)return'red';if(val>20000)return'yellow';return'green';}
  if(id==='QC-04'){if(val>50000)return'red';if(val>5000)return'yellow';return'green';}
  if(id==='IV-03'){if(val>45)return'red';if(val>30)return'yellow';return'green';}
  if(id==='PC-02'){if(val<95)return'red';if(val<98)return'yellow';return'green';}
  if(id==='IV-05'){if(val>50000)return'red';if(val>10000)return'yellow';return'green';}
  if(id==='MF-03'){if(val>30000)return'red';if(val>5000)return'yellow';return'green';}
  if(id==='MF-04'){if(val<75)return'red';if(val<85)return'yellow';return'green';}
  if(id==='QC-08'){if(parseFloat(val)>3)return'red';if(parseFloat(val)>1)return'yellow';return'green';}
  if(id==='LG-04'){if(val>10)return'red';if(val>3)return'yellow';return'green';}
  if(id==='MG-04'){if(val>20)return'red';if(val>10)return'yellow';return'green';}
  if(id==='TS-06'){if(parseFloat(val)>5)return'red';if(parseFloat(val)>2)return'yellow';return'green';}
  if(id==='QC-07'){if(parseFloat(val)>8)return'red';if(parseFloat(val)>5)return'yellow';return'green';}
  return'green';
}

function fmv(v,u){
  if(typeof v==='number'){
    if(v>1000000)return'¥'+(v/10000).toFixed(0)+'万';
    if(v>10000)return'¥'+(v/10000).toFixed(1)+'万';
    if(u==='%')return v.toFixed(1)+'%';
    if(u==='天')return v.toFixed(0)+'天';
    if(u==='倍')return v.toFixed(1)+'倍';
    if(u==='元/件')return'¥'+v.toFixed(0);
    return'¥'+v.toFixed(0);
  }
  return String(v);
}

// ── 项目变更（不重建下拉框）──
function onCostProjectChange(){
  try{
    const fp=getFilteredProjects();
    if(!fp||!fp.length) return;
    const sel=document.getElementById('costProjectSelect');
    const projId=sel?sel.value:'';
    const proj=fp.find(p=>p.id===projId)||fp[0];
    if(!proj) return;
    if(sel&&!sel.value&&fp.length) sel.value=proj.id;
    // Hero
    const hn=document.getElementById('costHeroName');if(hn)hn.textContent=proj.name;
    const hp=document.getElementById('costHeroPills');
    if(hp)hp.innerHTML=[{l:'BG',v:proj.bg},{l:'BU',v:proj.bu},{l:'客户',v:proj.customer},{l:'产品',v:proj.productLine},{l:'阶段',v:proj.engStage}].map(x=>'<span class="sc-hero-pill"><b>'+x.l+':</b> '+(x.v||'--')+'</span>').join('');
    costCache=buildCostData(proj);
    renderAll(costCache);
  }catch(e){console.error('cost project change error:',e);}
}

// ── 主入口 ──
function initPage_cost(){
  try{
    const fp=getFilteredProjects();if(!fp.length)return;
    const sel=document.getElementById('costProjectSelect');if(!sel)return;
    fillProjectSelect(sel,fp);
    consumeDrillDown('costProjectSelect');
    const proj=fp.find(function(p){return p.id===sel.value;})||fp[0];
    if(!proj)return;
    if(!sel.value&&fp.length)sel.value=proj.id;
    costCache=buildCostData(proj);
    renderAll(costCache);
  }catch(e){console.error('cost init error:',e);}
}

// ── 全量渲染 ──
function renderAll(d){
  renderKpiCards(d);
  renderDomainBars(d);
  renderDonut(d);
  renderHiddenBreakdown(d);
  renderLayer1(d);
  renderLayer2(d);
  renderLayer3(d);
  renderDomainTabs(d);
  drawCostTrend(d);
  resizeCharts();
}

// ── KPI 6卡 ──
function renderKpiCards(d){
  const grid=document.getElementById('costKpiGrid');if(!grid)return;
  const items=[
    {lbl:'供应链总成本',val:d.act/10000,unit:'万',target:d.tgt/10000,sub:'目标 ¥'+(d.tgt/10000).toFixed(0)+'万',color:CLR.d,trend:parseFloat(d.v['TS-02'])>100?'▼':''},
    {lbl:'成本达成率 TS-02',val:parseFloat(d.v['TS-02']),unit:'%',target:100,sub:'目标 ≤100%',color:parseFloat(d.v['TS-02'])>100?CLR.d:CLR.s,badge:parseFloat(d.v['TS-02'])>100?'超支':'达标'},
    {lbl:'隐性成本率 TS-06',val:parseFloat(d.v['TS-06']),unit:'%',target:3,sub:'目标 ≤3%',color:parseFloat(d.v['TS-06'])>5?CLR.d:parseFloat(d.v['TS-06'])>2?CLR.w:CLR.s},
    {lbl:'单件成本 TS-03',val:d.v['TS-03'],unit:'元/件',target:Math.round(d.tgt/d.shipped),sub:'出货'+d.shipped+'件',color:'#8957e5'},
    {lbl:'成本超支 TS-04',val:(d.act-d.tgt)/10000,unit:'万',sub:d.act-d.tgt>0?'超目标':(d.tgt-d.act)>0?'节约':'持平',color:d.act-d.tgt>0?CLR.d:CLR.s},
    {lbl:'本周告警',val:(()=>{let c=0;L1_IDS.forEach(id=>{if(getSt(COST_IND.find(i=>i.id===id),d.v[id])!=='green')c++;});L2_IDS.forEach(id=>{if(getSt(COST_IND.find(i=>i.id===id),d.v[id])!=='green')c++;});return c;})(),unit:'项',sub:'共监控18项',color:(()=>{let c=0;L1_IDS.forEach(id=>{if(getSt(COST_IND.find(i=>i.id===id),d.v[id])!=='green')c++;});return c>6?CLR.d:c>3?CLR.w:CLR.s;})()}
  ];
  grid.innerHTML=items.map(it=>{
    const valPct=it.val>0?100:0;
    return `<div class="kpi-card" style="border-top:3px solid ${it.color};">
      <div style="font-size:11px;color:var(--text-sec);text-transform:uppercase;letter-spacing:.05em;font-weight:600;">${it.lbl}${it.badge?' <span style="font-size:9px;padding:1px 8px;border-radius:12px;background:'+(it.color===CLR.d?'var(--danger-bg)':'var(--success-bg)')+';color:'+it.color+'">'+it.badge+'</span>':''}</div>
      <div style="font-size:28px;font-weight:800;color:${it.color};line-height:1;letter-spacing:-.02em;">${typeof it.val==='number'&&it.val<0?'-':''}${(Math.abs(it.val)).toFixed(it.val===Math.round(it.val)?0:1)}<span style="font-size:13px;font-weight:600;color:var(--text-sec);"> ${it.unit}</span></div>
      <div style="font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between;"><span>${it.sub}</span>${it.trend?`<span style="color:${it.trend==='▼'?CLR.s:CLR.d};font-weight:600;">${it.trend}</span>`:''}</div>
      <div style="height:4px;background:var(--border-light);border-radius:3px;overflow:hidden;position:relative;margin-top:6px;"><div style="width:${valPct}%;height:100%;background:${it.color};border-radius:3px;opacity:0.7;"></div>${it.target?`<div style="position:absolute;top:0;bottom:0;left:${Math.min(100,100*it.target/Math.max(it.val,it.target,1))}%;width:2px;background:var(--text-sec);opacity:0.6;"></div>`:''}</div>
    </div>`;
  }).join('');
}

// ── 六域水平条 ──
function renderDomainBars(d){
  const el=document.getElementById('costDomainBars');if(!el)return;
  const dmNames=['采购成本','制造成本','库存成本','物流成本','质量成本','管理成本'];
  const dmPcts=[d.pcR*100,d.mfR*100,d.ivR*100,d.lgR*100,d.qcR*100,d.mgR*100];
  const dmTgt=[48,22,8,5,7,3];
  el.innerHTML=dmNames.map((dm,i)=>{
    const actAmt=d.domains[dm]/10000;
    const diff=(dmPcts[i]-dmTgt[i]).toFixed(1);
    const diffBadge=parseFloat(diff)>2?'<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:var(--danger-bg);color:var(--danger);">+'+diff+'%</span>':parseFloat(diff)<-2?'<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:var(--success-bg);color:var(--success);">'+diff+'%</span>':'<span style="font-size:9px;color:var(--text-muted);">'+diff+'%</span>';
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;">
      <div style="width:80px;font-size:11px;color:var(--text-sec);white-space:nowrap;flex-shrink:0;">${DM_EMOJI[dm]} ${dm.substring(0,2)}</div>
      <div style="flex:1;height:18px;background:var(--border-light);border-radius:4px;overflow:hidden;position:relative;">
        <div style="width:${Math.min(100,dmPcts[i]*100/60)}%;height:100%;border-radius:4px;background:linear-gradient(90deg,${DM_COLORS[dm]},${DM_COLORS[dm]}aa);display:flex;align-items:center;padding-left:6px;font-size:9px;font-weight:700;color:#fff;">${dmPcts[i].toFixed(1)}%</div>
        <div style="position:absolute;top:0;bottom:0;left:${dmTgt[i]*100/60}%;width:2px;background:var(--text-sec);opacity:0.5;"></div>
      </div>
      <div style="width:60px;text-align:right;font-size:11px;font-weight:700;color:${DM_COLORS[dm]};">¥${actAmt.toFixed(0)}万</div>
      <div style="width:40px;text-align:right;">${diffBadge}</div>
    </div>`;
  }).join('');
  const total=document.getElementById('costTotalSummary');
  if(total){
    const over=d.act-d.tgt;
    total.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--primary-bg);border:1px solid var(--primary-bg);border-radius:8px;margin-top:12px;">
      <div><div style="font-size:12px;font-weight:700;color:var(--text);">供应链总成本</div><div style="font-size:10px;color:var(--text-muted);">目标 ¥${(d.tgt/10000).toFixed(0)}万 | 竖线=目标占比基线</div></div>
      <div style="text-align:right;"><div style="font-size:18px;font-weight:800;color:var(--primary);">¥${(d.act/10000).toFixed(0)}万</div><div style="font-size:10px;color:${over>0?'var(--danger)':'var(--success)'};">${over>0?'超支 ¥'+(over/10000).toFixed(0)+'万':over<0?'节约 ¥'+(-over/10000).toFixed(0)+'万':'达标'}</div></div>
    </div>`;
  }
}

// ── 甜甜圈 ──
function renderDonut(d){
  const ctx=document.getElementById('costDonutChart');if(!ctx)return;
  if(App.charts.costDonut){App.charts.costDonut.destroy();App.charts.costDonut=null;}
  const dmNames=['采购成本','制造成本','库存成本','物流成本','质量成本','管理成本'];
  const actData=dmNames.map(dm=>d.domains[dm]/10000);
  App.charts.costDonut=new Chart(ctx,{type:'doughnut',data:{labels:dmNames,datasets:[{data:actData,backgroundColor:dmNames.map(dm=>DM_COLORS[dm]),borderColor:'#fff',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false}}}});
  const center=document.getElementById('costDonutCenter');if(center)center.innerHTML=`<div style="font-size:15px;font-weight:800;color:${d.act-d.tgt>0?'var(--danger)':'var(--success)'};">¥${(d.act/10000).toFixed(0)}</div><div style="font-size:9px;color:var(--text-muted);">万元</div>`;
  const legend=document.getElementById('costDonutLegend');if(legend)legend.innerHTML=dmNames.map(dm=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;padding:2px 0;"><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${DM_COLORS[dm]};margin-right:5px;"></span>${dm.substring(0,2)}</span><span style="font-weight:700;color:${DM_COLORS[dm]};">${(d.domains[dm]/d.act*100).toFixed(1)}%</span></div>`).join('');
}

// ── 隐性成本拆解 ──
function renderHiddenBreakdown(d){
  const el=document.getElementById('costHiddenBreakdown');if(!el)return;
  const hiddenTotal=d.v['PC-03']+d.v['LG-03']+d.v['IV-04']+Math.max(0,d.v['QC-05']);
  const hdr=document.getElementById('costHiddenTotal');if(hdr)hdr.textContent='合计 ¥'+(hiddenTotal/10000).toFixed(0)+'万 / '+d.v['TS-06']+'%';
  const items=[{lbl:'紧急采购溢价 PC-03',val:d.v['PC-03'],color:CLR.d},{lbl:'空运溢价 LG-03',val:d.v['LG-03'],color:CLR.d},{lbl:'呆滞料损失 IV-04',val:d.v['IV-04'],color:CLR.w},{lbl:'客诉罚款 QC-05',val:Math.max(0,d.v['QC-05']),color:CLR.w}];
  el.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${items.map(it=>`<div style="background:var(--bg);border-radius:6px;padding:10px;border:1px solid var(--border-light);"><div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">${it.lbl}</div><div style="font-size:16px;font-weight:800;color:${it.color};">¥${(it.val/10000).toFixed(1)}万</div><div style="height:4px;background:var(--border-light);border-radius:2px;margin-top:6px;overflow:hidden;"><div style="width:${hiddenTotal>0?Math.min(100,it.val/hiddenTotal*100):0}%;height:100%;background:${it.color};border-radius:2px;"></div></div></div>`).join('')}</div>`;
}

// ── 第一层 ──
function renderLayer1(d){
  const grid=document.getElementById('costLayer1Grid');if(!grid)return;
  let redC=0,yellowC=0;
  let cards=L1_IDS.map(id=>{const ind=COST_IND.find(i=>i.id===id);const val=d.v[id];const st=getSt(ind,val);if(st==='red')redC++;else if(st==='yellow')yellowC++;const color=st==='red'?CLR.d:st==='yellow'?CLR.w:CLR.s;const bg=st==='red'?CLR.dbg:st==='yellow'?CLR.wbg:CLR.sbg;let dv=fmv(val,ind.unit);if(ind.id==='MF-02')dv=val.toFixed(1)+'% 良率';const barW=ind.id==='MF-02'?val:ind.id==='MF-04'?val:ind.id==='PC-02'?val*0.95:ind.id==='IV-03'?Math.max(5,100-val/60*100):100;return{ind,val,st,color,bg,dv,barW};});
  cards.sort((a,b)=>(b.st==='red'?3:0)-(a.st==='red'?3:0)+(b.st==='yellow'?1:0)-(a.st==='yellow'?1:0));
  grid.innerHTML=cards.map(c=>`<div style="background:${c.bg};border-radius:8px;padding:12px;border:1px solid ${c.st!=='green'?c.color+'44':'var(--border-light)'};${c.st!=='green'?'border-left:3px solid '+c.color:''}"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;"><span style="font-size:9px;font-weight:700;color:var(--text-muted);">${c.ind.id} · ${c.ind.domain.substring(0,2)}</span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c.color};${c.st!=='green'?'box-shadow:0 0 5px '+c.color:''};"></span></div><div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px;">${c.ind.name}</div><div style="font-size:20px;font-weight:800;color:${c.color};">${c.dv}</div><div style="font-size:9px;color:var(--text-muted);margin-top:2px;">${c.ind.normal}</div><div style="height:3px;background:var(--border-light);border-radius:2px;margin-top:8px;overflow:hidden;"><div style="width:${c.barW}%;height:100%;background:${c.color};border-radius:2px;"></div></div></div>`).join('')+`<div style="background:${redC>0?CLR.dbg:CLR.sbg};border-radius:8px;padding:12px;border:1px solid ${redC>0?CLR.d+'33':'var(--border-light)'};"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;"><span style="font-size:9px;font-weight:700;color:var(--text-muted);">第一层 · 汇总</span><span style="font-size:9px;padding:1px 8px;border-radius:12px;background:${redC>0?'var(--danger-bg)':'var(--success-bg)'};color:${redC>0?'var(--danger)':'var(--success)'};">${redC}红 ${yellowC}黄 ${7-redC-yellowC}绿</span></div><div style="font-size:11px;font-weight:700;color:var(--text);margin-bottom:6px;">关键结论</div><div style="font-size:10px;color:var(--text-sec);line-height:1.6;">${d.v['PC-03']>10000?'① 紧采溢价¥'+(d.v['PC-03']/10000).toFixed(1)+'万<br>':''}${d.v['LG-03']>10000?'② 空运溢价¥'+(d.v['LG-03']/10000).toFixed(1)+'万<br>':''}${d.v['MF-02']<99?'③ 良率'+d.v['MF-02'].toFixed(1)+'%低于红线<br>':''}${d.v['IV-04']>20000?'④ 呆滞料¥'+(d.v['IV-04']/10000).toFixed(1)+'万<br>':''}${d.v['QC-04']>5000?'⑤ 外部失效¥'+(d.v['QC-04']/10000).toFixed(1)+'万<br>':''}${d.v['IV-03']>30?'⑥ DIO '+(d.v['IV-03']).toFixed(0)+'天偏高':''}</div>${redC>0?'<div style="margin-top:8px;font-size:9px;padding:2px 8px;border-radius:4px;background:var(--danger-bg);color:var(--danger);display:inline-block;">立即行动</div>':''}</div>`;
}

// ── 第二层 ──
function renderLayer2(d){
  const grid=document.getElementById('costLayer2Grid');if(!grid)return;
  let redC=0,yellowC=0;
  grid.innerHTML=L2_IDS.map(id=>{const ind=COST_IND.find(i=>i.id===id);const val=d.v[id];const st=getSt(ind,val);if(st==='red')redC++;else if(st==='yellow')yellowC++;const color=st==='red'?CLR.d:st==='yellow'?CLR.w:CLR.s;const bg=st==='red'?CLR.dbg:st==='yellow'?CLR.wbg:CLR.sbg;let dv=fmv(val,ind.unit);if(ind.id==='MF-04')dv='OEE '+val.toFixed(0)+'%';if(ind.id==='QC-08')dv=val+'倍';if(ind.id==='MG-04')dv='MAPE '+val.toFixed(1)+'%';if(ind.id==='PC-02')dv=val.toFixed(1)+'%';const noteMap={'PC-02':'穿透TS-02：核心器件溢价','IV-05':'穿透IV-04：ECN致报废','MF-03':'穿透MF-02：返工掩盖','MF-04':'穿透TS-02：停线推高制费','QC-08':'穿透QC-04：质控前置不足','LG-04':'穿透LG-03：高频空运被低估','MG-04':'穿透PC-03：预测偏差致紧采','MF-05':'穿透TS-03：爬坡摊销虚高'};return`<div style="background:${bg};border-radius:8px;padding:12px;border:1px solid ${st!=='green'?color+'44':'var(--border-light)'};${st!=='green'?'border-left:3px solid '+color:''}"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;"><span style="font-size:9px;font-weight:700;color:var(--text-muted);">${ind.id} · ${ind.domain.substring(0,2)}</span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};"></span></div><div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:4px;">${ind.name}</div><div style="font-size:18px;font-weight:800;color:${color};">${dv}</div><div style="font-size:9px;color:var(--text-muted);margin-top:2px;">${ind.normal}</div><div style="font-size:8px;color:var(--text-muted);margin-top:3px;">${noteMap[id]||''}</div></div>`;}).join('');
  const badge=document.getElementById('costL2SummaryBadge');if(badge)badge.textContent=redC+'红 '+yellowC+'黄 '+(8-redC-yellowC)+'绿';
  const chain=document.getElementById('costRootChain');
  if(chain){const items=[];if(parseFloat(d.v['TS-02'])>100)items.push({from:'TS-02超支',to:['PC-02议价','MF-04停线'],c:CLR.d});if(d.v['PC-03']>10000)items.push({from:'PC-03紧采',to:['MG-04预测偏差'],c:CLR.d});if(d.v['IV-04']>20000)items.push({from:'IV-04呆滞',to:['IV-05 ECN变更'],c:CLR.d});if(d.v['QC-04']>5000)items.push({from:'QC-04外部失效',to:['QC-08外内比','MF-03返工'],c:CLR.d});chain.innerHTML=items.length?`<div style="font-size:11px;font-weight:700;color:var(--text-sec);margin-bottom:10px;">根因穿透关系</div><div style="display:flex;gap:8px;flex-wrap:wrap;">`+items.map(it=>`<div style="display:flex;align-items:center;gap:5px;padding:6px 12px;background:var(--bg);border:1px solid var(--border-light);border-radius:8px;font-size:10px;"><span style="color:${it.c};font-weight:700;">${it.from}</span><span style="color:var(--text-muted);">←</span>${it.to.map(t=>`<span style="color:var(--text-sec);">${t}</span>`).join('<span style="color:var(--text-muted);">+</span>')}</div>`).join('')+'</div>':'';}
}

// ── 第三层 ──
function renderLayer3(d){
  const el=document.getElementById('costLayer3Content');if(!el)return;
  const dmNames=['采购成本','制造成本','库存成本','物流成本','质量成本','管理成本'];
  const dmPcts=[d.pcR*100,d.mfR*100,d.ivR*100,d.lgR*100,d.qcR*100,d.mgR*100],dmTgt=[48,22,8,5,7,3];
  el.innerHTML=`<div style="background:var(--bg);border:1px solid var(--border-light);border-radius:8px;padding:13px;margin-bottom:10px;border-left:3px solid var(--warning);"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;"><div><div style="font-size:9px;font-weight:700;color:var(--text-muted);">TS-05 · 汇总</div><div style="font-size:12px;font-weight:700;color:var(--text);">各域成本占比结构</div></div><span style="font-size:9px;padding:2px 8px;border-radius:12px;background:${parseFloat(dmPcts[2])>10?'var(--warning-bg)':'var(--success-bg)'};color:${parseFloat(dmPcts[2])>10?'var(--warning)':'var(--success)'};">${parseFloat(dmPcts[2])>10?'库存域膨胀':'正常'}</span></div><div style="height:80px;"><canvas id="costDomainRadar"></canvas></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:8px;font-size:9px;color:var(--text-muted);text-align:center;">${dmNames.map((dm,i)=>`<div><span style="color:${DM_COLORS[dm]};font-weight:700;">${dm.substring(0,2)} ${dmPcts[i].toFixed(1)}%</span><br><span style="font-size:8px;">目标${dmTgt[i]}%</span></div>`).join('')}</div></div><div style="background:var(--bg);border:1px solid var(--border-light);border-radius:8px;padding:13px;margin-bottom:10px;border-left:3px solid ${parseFloat(d.v['TS-06'])>5?'var(--danger)':parseFloat(d.v['TS-06'])>2?'var(--warning)':'var(--success)'};"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;"><div><div style="font-size:9px;font-weight:700;color:var(--text-muted);">TS-06 · 汇总</div><div style="font-size:12px;font-weight:700;color:var(--text);">隐性成本率趋势</div></div><div style="text-align:right;"><div style="font-size:18px;font-weight:800;color:${parseFloat(d.v['TS-06'])>5?'var(--danger)':'var(--warning)'};">${d.v['TS-06']}%</div><div style="font-size:9px;color:var(--text-muted);">目标 ≤3%</div></div></div><div style="height:60px;"><canvas id="costHiddenTrend"></canvas></div></div><div style="background:var(--bg);border:1px solid var(--border-light);border-radius:8px;padding:13px;border-left:3px solid var(--success);"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;"><div><div style="font-size:9px;font-weight:700;color:var(--text-muted);">QC-07 · 质量</div><div style="font-size:12px;font-weight:700;color:var(--text);">COQ占营收比</div></div><div style="text-align:right;"><div style="font-size:18px;font-weight:800;color:var(--success);">${d.v['QC-07']}%</div><div style="font-size:9px;color:var(--text-muted);">目标 ≤5%</div></div></div><div style="height:60px;"><canvas id="costCOQTrend"></canvas></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">${[{l:'预防',v:d.v['QC-01'],c:'var(--primary)'},{l:'检验',v:d.v['QC-02'],c:'#0891b2'},{l:'内失效',v:d.v['QC-03'],c:'var(--warning)'},{l:'外失效',v:d.v['QC-04'],c:'var(--danger)'}].map(q=>`<div style="background:var(--card);border-radius:6px;padding:8px;text-align:center;"><div style="font-size:9px;color:var(--text-muted);">${q.l}</div><div style="font-size:13px;font-weight:700;color:${q.c};">¥${(q.v/10000).toFixed(0)}万</div></div>`).join('')}</div><div style="font-size:9px;color:var(--text-muted);margin-top:6px;">COQ总额¥${(d.v['QC-06']/10000).toFixed(0)}万 | 世界级&lt;2.5%</div></div>`;
  setTimeout(()=>{
    const ctx=document.getElementById('costDomainRadar');if(!ctx)return;if(App.charts.costRadar){App.charts.costRadar.destroy();App.charts.costRadar=null;}
    App.charts.costRadar=new Chart(ctx,{type:'radar',data:{labels:dmNames,datasets:[{label:'实际%',data:dmPcts,borderColor:CLR.d,backgroundColor:'rgba(220,38,38,0.08)',borderWidth:1.5,pointRadius:3},{label:'目标%',data:dmTgt,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.06)',borderWidth:1.5,borderDash:[4,3],pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{backgroundColor:'rgba(241,245,249,.4)',grid:{color:'#e2e8f0'},pointLabels:{font:{size:9}},ticks:{display:false,stepSize:15},suggestedMin:0,suggestedMax:60}}}});
    const ctx3=document.getElementById('costHiddenTrend');if(!ctx3)return;if(App.charts.costHidden){App.charts.costHidden.destroy();App.charts.costHidden=null;}
    App.charts.costHidden=new Chart(ctx3,{type:'line',data:{labels:['W16','W17','W18','W19','W20','W21'],datasets:[{label:'隐性成本率%',data:[Math.max(1,parseFloat(d.v['TS-06'])*0.3),Math.max(1.5,parseFloat(d.v['TS-06'])*0.45),Math.max(2,parseFloat(d.v['TS-06'])*0.6),Math.max(2.5,parseFloat(d.v['TS-06'])*0.75),Math.max(3,parseFloat(d.v['TS-06'])*0.9),parseFloat(d.v['TS-06'])],borderColor:CLR.d,backgroundColor:'rgba(220,38,38,0.08)',borderWidth:2,fill:true,tension:0.35,pointRadius:3},{label:'目标线',data:[3,3,3,3,3,3],borderColor:'#3b82f6',borderWidth:1.5,borderDash:[4,3],pointRadius:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{min:0,ticks:{font:{size:9},callback:v=>v+'%'}}}}});
    const ctx4=document.getElementById('costCOQTrend');if(!ctx4)return;if(App.charts.costCOQ){App.charts.costCOQ.destroy();App.charts.costCOQ=null;}
    App.charts.costCOQ=new Chart(ctx4,{type:'bar',data:{labels:['3月','4月','5月'],datasets:[{label:'预防',data:[d.v['QC-01']*0.8/10000,d.v['QC-01']*0.9/10000,d.v['QC-01']/10000],backgroundColor:'rgba(59,130,246,0.3)',borderColor:'#3b82f6',borderWidth:1},{label:'检验',data:[d.v['QC-02']*0.85/10000,d.v['QC-02']*0.93/10000,d.v['QC-02']/10000],backgroundColor:'rgba(8,145,178,0.25)',borderColor:'#0891b2',borderWidth:1},{label:'内失效',data:[d.v['QC-03']*0.8/10000,d.v['QC-03']*0.9/10000,d.v['QC-03']/10000],backgroundColor:'rgba(217,119,6,0.25)',borderColor:'#d97706',borderWidth:1},{label:'外失效',data:[d.v['QC-04']*0.5/10000,d.v['QC-04']*0.7/10000,d.v['QC-04']/10000],backgroundColor:'rgba(220,38,38,0.25)',borderColor:'#dc2626',borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:9}}},y:{stacked:true,ticks:{font:{size:9},callback:v=>'¥'+v+'万'}}}}});
  },100);
}

// ── 六域Tab指标表 ──
var costActiveDomain='采购成本';
function switchCostDomainTab(domain){
  costActiveDomain=domain;
  if(!costCache) return;
  renderDomainTabs(costCache);
}
function renderDomainTabs(d){
  var tabs=document.getElementById('costDomainTabs');
  var content=document.getElementById('costDomainTabContent');
  if(!tabs||!content) return;
  tabs.innerHTML=DM_ORDER.map(function(dm){
    var ccount=COST_IND.filter(function(i){return i.domain===dm;}).length;
    var reds=COST_IND.filter(function(i){return i.domain===dm && getSt(i,d.v[i.id])==='red';}).length;
    var dot=reds>0?'<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--danger);margin-left:4px;"></span>':'';
    var active=costActiveDomain===dm;
    return '<div onclick="switchCostDomainTab(\''+dm+'\')" style="padding:9px 14px;font-size:11px;font-weight:'+(active?'700':'400')+';color:'+(active?DM_COLORS[dm]:'var(--text-sec)')+';cursor:pointer;border-bottom:2px solid '+(active?DM_COLORS[dm]:'transparent')+';white-space:nowrap;transition:all .2s;display:flex;align-items:center;gap:4px;">'+DM_EMOJI[dm]+dm+'<span style="font-size:10px;color:var(--text-muted);">('+ccount+')</span>'+dot+'</div>';
  }).join('');
  renderCostDomainContent(d);
}
function renderCostDomainContent(d){
  var el=document.getElementById('costDomainTabContent'); if(!el) return;
  var inds=COST_IND.filter(function(i){return i.domain===costActiveDomain;});
  if(!inds.length){el.innerHTML='<div style="padding:20px;color:var(--text-muted);text-align:center;">暂无数据</div>';return;}
  el.innerHTML='<table class="data-table" style="width:100%"><thead><tr><th>编号</th><th>指标名称</th><th>值</th><th>正常阈值</th><th>状态</th></tr></thead><tbody>'+inds.map(function(ind){
    var val=d.v[ind.id]; var st=getSt(ind,val);
    var dv=fmv(val,ind.unit); if(ind.unit==='%')dv+='%'; else if(ind.unit==='天')dv+='天'; else if(ind.unit==='倍')dv+='倍';
    var bg=st==='red'?CLR.dbg:st==='yellow'?CLR.wbg:'';
    return'<tr style="background:'+bg+'"><td style="font-size:10px">'+ind.id+'</td><td style="font-size:11px">'+ind.name+'</td><td style="font-weight:600;color:'+(st==='red'?CLR.d:st==='yellow'?CLR.w:'var(--text)')+';">'+dv+'</td><td style="font-size:10px;color:var(--text-muted);">'+ind.normal+'</td><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+(st==='red'?CLR.d:st==='yellow'?CLR.w:CLR.s)+';margin-right:4px;"></span>'+(st==='red'?'异常':st==='yellow'?'关注':'正常')+'</td></tr>';
  }).join('')+'</tbody></table>';
}

// ── 6周趋势 ──
function drawCostTrend(d){
  setTimeout(()=>{
    const ctx=document.getElementById('costTrendChart');if(!ctx)return;
    if(App.charts.costTrend){App.charts.costTrend.destroy();App.charts.costTrend=null;}
    const tgt=d.tgt/10000,act=d.act/10000;
    const trendData=[act*0.78,act*0.84,act*0.89,act*0.93,act*0.96,act];
    App.charts.costTrend=new Chart(ctx,{type:'line',data:{labels:['W16','W17','W18','W19','W20','W21'],datasets:[{label:'实际总成本(万)',data:trendData,borderColor:CLR.d,backgroundColor:'rgba(220,38,38,0.06)',borderWidth:2,fill:true,tension:0.35,pointRadius:3},{label:'目标(万)',data:[tgt,tgt,tgt,tgt,tgt,tgt],borderColor:'#3b82f6',borderWidth:1.5,borderDash:[4,3],pointRadius:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#e2e8f066'},ticks:{font:{size:9}}},y:{ticks:{font:{size:9},callback:v=>'¥'+v+'万'}}}}});
  },150);
}
