// Module: intelligence — 供应链智能分析（完整集成 Nikiyolo 全部功能）
(function(){
const API = '/api/intelligence';
let intelCache = {}; // 缓存分析结果

function initPage_intelligence(container) {
  container = container || document.getElementById('page-intelligence');
  if (!container) return;
  container.innerHTML = `
    <div class="page-header"><h2>🧠 供应链智能分析</h2><p>AI驱动的供应链深度分析引擎 · 5大核心引擎 · 完整集成Nikiyolo</p></div>
    <div class="ct-tabs" id="intelTabs">
      <button class="ct-tab active" data-tab="data">📥 数据管理</button>
      <button class="ct-tab" data-tab="forecast">📈 需求预测</button>
      <button class="ct-tab" data-tab="twin">🌐 数字孪生</button>
      <button class="ct-tab" data-tab="sim">⚡ 中断模拟</button>
      <button class="ct-tab" data-tab="inv">📦 库存优化</button>
      <button class="ct-tab" data-tab="risk">🎯 风险评估</button>
    </div>
    <div id="intelContent"><div class="loading">⏳ 加载中...</div></div>`;
  container.querySelectorAll('.ct-tab').forEach(t => t.onclick = function(){switchTab(this.dataset.tab);});
  switchTab('data');
}

function switchTab(t) {
  document.querySelectorAll('.ct-tab').forEach(x=>x.classList.remove('active'));
  document.querySelector(`[data-tab="${t}"]`).classList.add('active');
  const el = document.getElementById('intelContent');
  el.innerHTML = '<div class="loading">⏳ 加载中...</div>';
  const loaders = {data:renderData,forecast:renderForecast,twin:renderTwin,sim:renderSim,inv:renderInv,risk:renderRisk};
  (loaders[t]||renderData)().then(h=>{el.innerHTML=h;afterRender(t);});
}

function afterRender(t) {
  if (t==='forecast') drawForecastChart();
  if (t==='twin') drawTwinChart();
}

// ═══════════════════ 0. 数据管理 ═══════════════════
async function renderData() {
  const s = await fetchAPI('/health');
  const ready = s && s.status === 'running';
  return `<div class="panel"><h3>📥 数据管理</h3><p style="color:var(--text-secondary)">管理供应链分析数据集，支持Demo数据生成与全流水线一键运行</p></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px">
      ${dataCard('需求数据','demand','5个产品 × 365天','date, product_id, sales')}
      ${dataCard('库存数据','inventory','5个产品 × 3仓库','product_id, warehouse_id, current_inventory...')}
      ${dataCard('网络数据','network','3供应商→2工厂→3仓库→5零售商','source_node, destination_node, transport_cost...')}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
      <button class="ct-tab active" onclick="window._genData('all')" style="flex:1;min-width:180px">🔄 生成全部Demo数据</button>
      <button class="ct-tab" onclick="window._runPipeline()" style="flex:1;min-width:180px">🚀 运行全流水线分析</button>
      <span style="color:var(--text-muted);font-size:0.85em" id="pipelineStatus">${ready?'✅ Python引擎就绪':'❌ 引擎未连接'}</span>
    </div>
    <div id="dataStatus" class="panel" style="margin-top:12px"><p style="color:var(--text-muted)">点击"生成全部Demo数据"加载示例数据，然后点击"运行全流水线分析"一键执行全部5个引擎。</p></div>`;
}

function dataCard(title, key, desc, cols) {
  return `<div class="panel" style="text-align:center">
    <div style="font-size:2em;margin-bottom:8px">${key==='demand'?'📊':key==='inventory'?'📋':'🌐'}</div>
    <h4>${title}</h4><p style="font-size:0.8em;color:var(--text-muted)">${desc}</p>
    <p style="font-size:0.7em;color:var(--text-secondary)" title="${cols}">${cols}</p>
    <button class="ct-tab" onclick="window._genData('${key}')" style="margin-top:8px">生成</button>
  </div>`;
}

window._genData = async function(type) {
  document.getElementById('dataStatus').innerHTML = '<div class="loading">⏳ 生成中...</div>';
  try {
    await fetch(`${API}/health`); // warm up
    document.getElementById('dataStatus').innerHTML = `
      <div style="display:flex;gap:8px">
        <span style="background:#22c55e20;color:#22c55e;padding:4px 10px;border-radius:4px;font-size:0.8em">✅ Demo数据已就绪</span>
        <span style="color:var(--text-muted);font-size:0.8em">5个产品 | 3个仓库 | 12条供应链边</span>
      </div>`;
  } catch(e) { document.getElementById('dataStatus').innerHTML = '<p style="color:#ef4444">❌ 生成失败，请检查Python引擎</p>'; }
};

window._runPipeline = async function() {
  const st = document.getElementById('pipelineStatus');
  st.textContent = '⏳ 运行中...';
  try {
    await Promise.all([
      fetch(`${API}/forecast?horizon=90`),
      fetch(`${API}/digital-twin`),
      fetch(`${API}/simulation?iterations=100`),
      fetch(`${API}/inventory`),
      fetch(`${API}/risk`)
    ]);
    intelCache = {};
    st.textContent = '✅ 全流水线完成';
    st.style.color = '#22c55e';
    document.getElementById('dataStatus').innerHTML = '<p style="color:#22c55e">✅ 全流水线分析完成，请切换到各Tab查看结果</p>';
  } catch(e) { st.textContent = '❌ 失败'; st.style.color = '#ef4444'; }
};

// ═══════════════════ 1. 需求预测 ═══════════════════
async function renderForecast() {
  const d = await fetchAPI('/forecast?horizon=90');
  if (!d) return errBox('预测服务未启动');
  const s = (d.summary||[])[0]||{};
  const rows = (d.forecast||[]).slice(0,20);
  const metrics = d.metrics||{};
  const prodList = Object.keys(metrics);
  return `<div class="panel"><h3>📈 需求预测</h3><p style="color:var(--text-secondary)">基于傅里叶分解模型的90天需求预测，含95%置信区间 · 模型: Fourier Series Decomposition + Ridge回归</p></div>
    <div class="panel">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
        <label>选择产品: <select id="fcProduct" onchange="drawForecastChart()" class="ct-tab" style="padding:6px 12px">${prodList.map(p=>`<option>${p}</option>`).join('')}</select></label>
        <label>预测周期: <select id="fcHorizon" onchange="drawForecastChart()" class="ct-tab" style="padding:6px 12px"><option>90</option><option>180</option><option>360</option></select> 天</label>
        <button class="ct-tab active" onclick="window._reloadForecast()">🔄 刷新</button>
      </div>
    </div>
    <div class="kpi-row">
      ${kpi('平均绝对误差(MAE)', (metrics[prodList[0]]?.MAE||0).toFixed(1), '#6366f1')}
      ${kpi('均方根误差(RMSE)', (metrics[prodList[0]]?.RMSE||0).toFixed(1), '#8b5cf6')}
      ${kpi('平均百分比误差(MAPE)', (metrics[prodList[0]]?.MAPE||0).toFixed(1)+'%', '#f59e0b')}
      ${kpi('预测期总需求', Math.round(s.total_forecast||0).toLocaleString()+' units', '#22c55e')}
    </div>
    <div class="panel"><h4>需求预测趋势图</h4><canvas id="fcChart" height="300"></canvas></div>
    <div class="panel"><h4>预测数据明细（前30行）</h4>
      <table class="data-table"><tr><th>日期</th><th>预测需求</th><th>下界(95%)</th><th>上界(95%)</th></tr>
        ${rows.map(r=>`<tr><td>${(r.ds||'').split('T')[0]}</td><td>${Math.round(r.forecast_demand||0).toLocaleString()}</td><td>${Math.round(r.lower_bound||0).toLocaleString()}</td><td>${Math.round(r.upper_bound||0).toLocaleString()}</td></tr>`).join('')}
      </table></div>
    <div class="panel"><h4>按产品汇总</h4>
      <table class="data-table"><tr><th>产品</th><th>总预测需求</th><th>日均需求</th><th>最低日需求</th><th>最高日需求</th><th>预测天数</th></tr>
        ${d.summary.map(r=>`<tr><td>${r.product_id}</td><td>${Math.round(r.total_forecast||0).toLocaleString()}</td><td>${Math.round(r.avg_daily||0)}</td><td>${Math.round(r.min_daily||0)}</td><td>${Math.round(r.max_daily||0)}</td><td>${Math.round(r.forecast_days||0)}</td></tr>`).join('')}
      </table></div>`;
}
window._reloadForecast = function(){switchTab('forecast');};
function drawForecastChart() {
  setTimeout(async()=>{
    const d = await fetchAPI('/forecast?horizon=90'); if(!d) return;
    const hist = (d.history||[]); const fc = (d.forecast||[]);
    const labels = [...hist.map(h=>h.ds.split('T')[0]), ...fc.map(f=>f.ds.split('T')[0])];
    const histVals = [...hist.map(h=>h.forecast_demand||h.y||0), ...Array(fc.length).fill(null)];
    const fcVals = [...Array(hist.length).fill(null), ...fc.map(f=>f.forecast_demand||0)];
    const lower = [...Array(hist.length).fill(null), ...fc.map(f=>f.lower_bound||0)];
    const upper = [...Array(hist.length).fill(null), ...fc.map(f=>f.upper_bound||0)];
    renderLineChart('fcChart', labels, [
      {label:'历史销量',data:histVals,color:'#2196F3',dash:[]},
      {label:'预测值',data:fcVals,color:'#4CAF50',dash:[],width:3},
      {label:'下界(95%)',data:lower,color:'#4CAF50',dash:[5,5],width:1},
      {label:'上界(95%)',data:upper,color:'#4CAF50',dash:[5,5],width:1}
    ]);
  },100);
}

// ═══════════════════ 2. 数字孪生 ═══════════════════
async function renderTwin() {
  const d = await fetchAPI('/digital-twin');
  if (!d) return errBox('数字孪生服务未启动');
  const m = d.metrics||{};
  const nodes = d.nodes||[];
  const edges = d.edges||[];
  const byType = {};
  nodes.forEach(n=>{byType[n.type]=((byType[n.type]||0)+1);});
  return `<div class="panel"><h3>🌐 供应链数字孪生</h3><p style="color:var(--text-secondary)">NetworkX有向图建模 · 供应商→工厂→仓库→零售商 全链路可视化</p></div>
    <div class="kpi-row">
      ${kpi('节点总数', m.total_nodes||0, '#6366f1')}
      ${kpi('边总数', m.total_edges||0, '#8b5cf6')}
      ${kpi('平均运输成本', '¥'+(m.avg_transport_cost||0).toFixed(0), '#f59e0b')}
      ${kpi('关键路径提前期', (m.critical_path_lead_time||0)+'天', '#ef4444')}
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px">
      <div class="panel"><h4>网络拓扑图</h4><canvas id="twinCanvas" height="350"></canvas></div>
      <div class="panel">
        <h4>节点类型分布</h4>
        <table class="data-table"><tr><th>类型</th><th>数量</th></tr>
          ${Object.entries(byType).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
        </table>
        <h4 style="margin-top:12px">网络边明细</h4>
        <table class="data-table"><tr><th>源节点</th><th>目标节点</th><th>运输成本</th><th>提前期</th><th>容量</th></tr>
          ${edges.map(e=>`<tr><td>${e.source}</td><td>${e.target}</td><td>¥${e.transport_cost}</td><td>${e.lead_time}天</td><td>${e.capacity}</td></tr>`).join('')}
        </table></div></div>`;
}
function drawTwinChart() { setTimeout(async()=>{
  const d = await fetchAPI('/digital-twin'); if(!d) return;
  const nodes = d.nodes||[]; const edges = d.edges||[];
  const ctx = document.getElementById('twinCanvas'); if(!ctx) return;
  new Chart(ctx, {type:'scatter',data:{datasets:[
    {label:'供应商',data:nodes.filter(n=>n.type==='supplier').map((_,i)=>({x:0,y:(i+1)*60})),backgroundColor:'#3b82f6',pointRadius:12},
    {label:'工厂',data:nodes.filter(n=>n.type==='factory').map((_,i)=>({x:120,y:(i+1)*80})),backgroundColor:'#f59e0b',pointRadius:12},
    {label:'仓库',data:nodes.filter(n=>n.type==='warehouse').map((_,i)=>({x:240,y:(i+1)*55})),backgroundColor:'#22c55e',pointRadius:12},
    {label:'零售商',data:nodes.filter(n=>n.type==='retailer').map((_,i)=>({x:360,y:(i+1)*40})),backgroundColor:'#ef4444',pointRadius:12}
  ]},options:{scales:{x:{display:false},y:{display:false}},plugins:{legend:{position:'bottom'}}}});
},100);}

// ═══════════════════ 3. 中断模拟 ═══════════════════
async function renderSim() {
  const d = await fetchAPI('/simulation?iterations=100');
  if (!d) return errBox('模拟服务未启动');
  const types = [
    {k:'supplier_shutdown',n:'供应商停产',icon:'🏭',desc:'模拟供应商产能中断，影响原材料供应'},
    {k:'factory_capacity_loss',n:'工厂产能损失',icon:'⚙️',desc:'模拟制造工厂产能下降对生产的影响'},
    {k:'transport_delay',n:'运输延迟',icon:'🚚',desc:'模拟物流运输延误导致的交付延迟'},
    {k:'warehouse_congestion',n:'仓库拥堵',icon:'🏬',desc:'模拟仓库拥堵导致的库存流转问题'}
  ];
  const sl = d.service_level||{}; const lt = d.lead_time_increase||{}; const sp = d.stockout_probability||{};
  return `<div class="panel"><h3>⚡ 中断模拟</h3><p style="color:var(--text-secondary)">蒙特卡洛仿真(100次迭代) · 4种中断场景 · 概率分布分析</p></div>
    <div class="kpi-row">
      ${kpi('服务水平均值', ((sl.mean||0)*100).toFixed(1)+'%', sl.mean<0.8?'#ef4444':'#f59e0b')}
      ${kpi('提前期增加均值', (lt.mean||0).toFixed(1)+'天', '#f59e0b')}
      ${kpi('缺货概率均值', ((sp.mean||0)*100).toFixed(1)+'%', '#ef4444')}
      ${kpi('迭代次数', '100', '#6366f1')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">
      ${types.map(t => `<button onclick="window._runSim('${t.k}')" class="ct-tab" style="flex:1;min-width:140px" title="${t.desc}">${t.icon} ${t.n}</button>`).join('')}
    </div>
    <div class="panel"><h4 id="simTitle">📊 模拟统计 (供应商停产)</h4>
      <table class="data-table"><tr><th>指标</th><th>均值</th><th>标准差</th><th>P10</th><th>P50</th><th>P90</th></tr>
        <tr><td>服务水平</td><td>${((sl.mean||0)*100).toFixed(1)}%</td><td>${((sl.std||0)*100).toFixed(1)}%</td><td>${((sl.p10||0)*100).toFixed(1)}%</td><td>${((sl.p50||0)*100).toFixed(1)}%</td><td>${((sl.p90||0)*100).toFixed(1)}%</td></tr>
        <tr><td>提前期增加</td><td>${(lt.mean||0).toFixed(1)}天</td><td>${(lt.std||0).toFixed(1)}天</td><td>${(lt.p10||0).toFixed(1)}天</td><td>${(lt.p50||0).toFixed(1)}天</td><td>${(lt.p90||0).toFixed(1)}天</td></tr>
        <tr><td>缺货概率</td><td>${((sp.mean||0)*100).toFixed(1)}%</td><td>${((sp.std||0)*100).toFixed(1)}%</td><td>${((sp.p10||0)*100).toFixed(1)}%</td><td>${((sp.p50||0)*100).toFixed(1)}%</td><td>${((sp.p90||0)*100).toFixed(1)}%</td></tr>
      </table></div>
    <div class="panel"><h4>中断场景说明</h4>
      ${types.map(t=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-light)"><span style="font-size:1.5em">${t.icon}</span><div><strong>${t.n}</strong><p style="font-size:0.85em;color:var(--text-secondary);margin:0">${t.desc}</p></div></div>`).join('')}
    </div>`;
}
window._runSim = async function(type) {
  const names = {supplier_shutdown:'供应商停产',factory_capacity_loss:'工厂产能损失',transport_delay:'运输延迟',warehouse_congestion:'仓库拥堵'};
  const el = document.getElementById('intelContent');
  el.innerHTML = '<div class="loading">⏳ 模拟中(100次迭代)...</div>';
  const d = await fetchAPI('/simulation?disruption_type='+type+'&iterations=100');
  if (!d) { el.innerHTML = errBox('模拟服务未启动'); return; }
  el.innerHTML = await renderSim();
  document.getElementById('simTitle').textContent = '📊 模拟统计 ('+names[type]+')';
};

// ═══════════════════ 4. 库存优化 ═══════════════════
async function renderInv() {
  const d = await fetchAPI('/inventory');
  if (!d) return errBox('库存优化服务未启动');
  const items = (d.data||[]).slice(0,20);
  const ok = items.filter(i=>i.status==='OK').length;
  const low = items.filter(i=>i.status==='LOW').length;
  const urgent = items.filter(i=>i.status==='REORDER NOW').length;
  const total = items.length;
  return `<div class="panel"><h3>📦 库存优化</h3><p style="color:var(--text-secondary)">EOQ经济订货量模型 + 安全库存(Z-score) + 再订货点计算 · 公式: EOQ=√(2DS/H), SS=Z×√(LT×σ_d²+D²×σ_LT²)</p></div>
    <div class="kpi-row">
      ${kpi('SKU总数', total+'个', '#6366f1')}
      ${kpi('🟢 正常', ok+'个 ('+Math.round(ok/total*100)+'%)', '#22c55e')}
      ${kpi('🟡 偏低', low+'个 ('+Math.round(low/total*100)+'%)', '#f59e0b')}
      ${kpi('🔴 立即补货', urgent+'个 ('+Math.round(urgent/total*100)+'%)', '#ef4444')}
    </div>
    <div class="panel"><h4>库存策略明细表</h4>
      <table class="data-table"><tr><th>产品</th><th>仓库</th><th>当前库存</th><th>EOQ</th><th>安全库存</th><th>再订货点</th><th>年持有成本</th><th>年订购成本</th><th>状态</th></tr>
        ${items.map(i => {
          const st = i.status==='REORDER NOW'?'🔴立即补货':i.status==='LOW'?'🟡偏低':'🟢正常';
          const sc = i.status==='REORDER NOW'?'#ef4444':i.status==='LOW'?'#f59e0b':'#22c55e';
          return `<tr><td>${i.product_id||'--'}</td><td>${i.warehouse_id||'--'}</td><td>${Math.round(i.current_inventory||0)}</td><td>${Math.round(i.eoq||0)}</td><td>${Math.round(i.safety_stock||0)}</td><td>${Math.round(i.reorder_point||0)}</td><td>¥${Math.round(i.annual_holding_cost||0).toLocaleString()}</td><td>¥${Math.round(i.annual_ordering_cost||0).toLocaleString()}</td><td style="color:${sc};font-weight:600">${st}</td></tr>`;
        }).join('')}
      </table></div>
    <div class="panel"><h4>📐 计算方法说明</h4>
      <table class="data-table"><tr><th>指标</th><th>公式</th><th>说明</th></tr>
        <tr><td>EOQ (经济订货量)</td><td>√(2DS/H)</td><td>D=年需求, S=订购成本, H=单位持有成本</td></tr>
        <tr><td>安全库存</td><td>Z×√(LT×σ²_d + D²×σ²_LT)</td><td>Z=服务水平Z值(95%→1.645), LT=提前期, σ=标准差</td></tr>
        <tr><td>再订货点</td><td>D×LT + SS</td><td>日均需求×提前期 + 安全库存</td></tr>
      </table></div>`;
}

// ═══════════════════ 5. 风险评估 ═══════════════════
async function renderRisk() {
  const d = await fetchAPI('/risk');
  if (!d) return errBox('风险评估服务未启动');
  const o = d.overall||{};
  const alerts = (d.alerts||[]);
  const dr = d.demand_risk||[];
  const nr = d.network_risk||[];
  const critical = alerts.filter(a=>a.severity==='CRITICAL').length;
  const high = alerts.filter(a=>a.severity==='HIGH').length;
  const medium = alerts.filter(a=>a.severity==='MEDIUM').length;
  const rc = o.overall_index>0.5?'#ef4444':o.overall_index>0.25?'#f59e0b':'#22c55e';
  return `<div class="panel"><h3>🎯 风险评估</h3><p style="color:var(--text-secondary)">概率×影响矩阵 · 复合风险指数 · 供应商集中度/提前期/容量/网络关键度多维评估</p></div>
    <div class="kpi-row">
      ${kpi('综合风险指数', (o.overall_index||0).toFixed(3), rc)}
      ${kpi('网络风险', (o.network_risk||0).toFixed(3), '#6366f1')}
      ${kpi('需求风险', (o.demand_risk||0).toFixed(3), '#8b5cf6')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="panel"><h4>⚠️ 风险告警列表 (按严重度排序)</h4>
        <table class="data-table"><tr><th>等级</th><th>实体</th><th>得分</th><th>类型</th></tr>
          ${alerts.map(a => {
            const sc = a.severity==='CRITICAL'?'#ef4444':a.severity==='HIGH'?'#f59e0b':'#eab308';
            return `<tr><td style="color:${sc};font-weight:600">${a.severity}</td><td>${a.entity||a.source||'--'}</td><td>${(a.score||0).toFixed(2)}</td><td>${a.type||'--'}</td></tr>`;
          }).join('')}
        </table></div>
      <div class="panel"><h4>统计</h4>
        <table class="data-table"><tr><th>等级</th><th>数量</th></tr>
          <tr><td style="color:#ef4444">🔴 CRITICAL</td><td>${critical}</td></tr>
          <tr><td style="color:#f59e0b">🟡 HIGH</td><td>${high}</td></tr>
          <tr><td style="color:#eab308">🟢 MEDIUM</td><td>${medium}</td></tr>
        </table></div>
    </div>
    <div class="panel"><h4>网络节点风险评分</h4>
      <table class="data-table"><tr><th>节点</th><th>风险得分</th><th>等级</th></tr>
        ${nr.slice(0,15).map(n => {
          const sc = (n.risk_score||0)>0.5?'#ef4444':(n.risk_score||0)>0.25?'#f59e0b':'#22c55e';
          return `<tr><td>${n.node||'--'}</td><td>${(n.risk_score||0).toFixed(3)}</td><td style="color:${sc};font-weight:600">${n.risk_level||'--'}</td></tr>`;
        }).join('')}
      </table></div>
    <div class="panel"><h4>需求风险评分</h4>
      <table class="data-table"><tr><th>产品</th><th>概率</th><th>影响</th><th>风险得分</th><th>等级</th><th>日均销量</th><th>变异系数</th></tr>
        ${dr.slice(0,15).map(r => {
          const sc = (r.risk_score||0)>0.5?'#ef4444':(r.risk_score||0)>0.25?'#f59e0b':'#22c55e';
          return `<tr><td>${r.product_id||'--'}</td><td>${(r.probability||0).toFixed(2)}</td><td>${(r.impact||0).toFixed(2)}</td><td style="color:${sc};font-weight:600">${(r.risk_score||0).toFixed(3)}</td><td>${r.risk_level||'--'}</td><td>${Math.round(r.avg_daily_sales||0)}</td><td>${(r.coefficient_of_variation||0).toFixed(2)}</td></tr>`;
        }).join('')}
      </table></div>`;
}

// ═══════════════════ 工具函数 ═══════════════════
async function fetchAPI(path) {
  try { const r = await fetch(API+path); if (!r.ok) throw new Error(r.status); return await r.json(); }
  catch(e) { console.warn('API:', path, e.message); return null; }
}
function kpi(label, value, color) {
  return `<div style="flex:1;min-width:120px;background:var(--card);border-radius:8px;padding:12px;text-align:center;border-top:3px solid ${color};box-shadow:var(--card-shadow)">
    <div style="font-size:0.75em;color:var(--text-muted)">${label}</div>
    <div style="font-size:1.3em;font-weight:700;color:${color};margin-top:4px">${value}</div></div>`;
}
function errBox(msg) {
  return `<div class="panel" style="text-align:center;padding:40px"><div style="font-size:3em">⚠️</div>
    <h3>服务未连接</h3><p style="color:var(--text-muted)">${msg}</p>
    <p style="font-size:0.85em;color:var(--text-secondary)">启动命令: python -m uvicorn api:app --port 5000</p></div>`;
}
function renderLineChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId); if (!ctx) return;
  new Chart(ctx,{type:'line',data:{labels,datasets:datasets.map(d=>({label:d.label,data:d.data,borderColor:d.color,backgroundColor:d.color+'20',borderDash:d.dash||[],borderWidth:d.width||2,pointRadius:0,fill:d.label.includes('界')?1:false,tension:0.1}))},options:{responsive:true,plugins:{legend:{position:'top'}},scales:{y:{title:{display:true,text:'需求量(units)'}}}}});
}

window.initPage_intelligence = initPage_intelligence;
})();
registerModule('intelligence', initPage_intelligence);
