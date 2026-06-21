// Module: intelligence — 供应链智能分析 (集成 Nikiyolo AI Supply Chain Control Tower)
(function(){
const API = '/api/intelligence';

function initPage_intelligence(container) {
  // app.js 不传 container，自己找
  container = container || document.getElementById('page-intelligence');
  if (!container) return;
  container.innerHTML = `
    <div class="page-header"><h2>🧠 供应链智能分析</h2><p>基于AI的供应链深度分析引擎 — 需求预测 · 数字孪生 · 中断模拟 · 库存优化 · 风险评估</p></div>
    <div class="ct-tabs" id="intelTabs">
      <button class="ct-tab active" data-tab="forecast">📈 需求预测</button>
      <button class="ct-tab" data-tab="twin">🕸️ 数字孪生</button>
      <button class="ct-tab" data-tab="sim">🎲 中断模拟</button>
      <button class="ct-tab" data-tab="inv">📦 库存优化</button>
      <button class="ct-tab" data-tab="risk">🎯 风险评估</button>
    </div>
    <div id="intelContent"><div class="loading">⏳ 加载中...</div></div>`;

  container.querySelectorAll('#intelTabs .ct-tab').forEach(tab => {
    tab.onclick = () => {
      container.querySelectorAll('#intelTabs .ct-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadTab(tab.dataset.tab);
    };
  });

  loadTab('forecast');
}

async function fetchJSON(url, fallback) {
  try { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return await r.json(); }
  catch (e) { console.warn('API failed:', url, e); return fallback; }
}

async function loadTab(tab) {
  const el = document.getElementById('intelContent');
  el.innerHTML = '<div class="loading">⏳ 加载中...</div>';

  switch (tab) {
    case 'forecast': el.innerHTML = await renderForecast(); break;
    case 'twin': el.innerHTML = await renderTwin(); break;
    case 'sim': el.innerHTML = await renderSimulation(); break;
    case 'inv': el.innerHTML = await renderInventory(); break;
    case 'risk': el.innerHTML = await renderRisk(); break;
  }
}

// ─── 1. 需求预测 ───
async function renderForecast() {
  const d = await fetchJSON(`${API}/forecast?horizon=90`, null);
  if (!d) return errMsg('预测服务未启动，请启动 python server/python/api.py');
  const s = d.summary[0] || {};
  return card('📈 需求预测', '基于傅里叶分解模型，90天需求预测及95%置信区间') +
    `<div class="kpi-row">
      ${kpi('预测产品数', d.summary.length+'个', '#6366f1')}
      ${kpi('预测周期', '90天', '#8b5cf6')}
      ${kpi('模型', 'Fourier+Ridge', '#0ea5e9')}
    </div>
    <div class="panel"><h4>按产品汇总</h4>
      <table class="data-table"><tr><th>产品</th><th>预测总需求</th><th>平均日需求</th></tr>
        ${d.summary.slice(0,5).map(r => `<tr><td>${r.product_id||'--'}</td><td>${Math.round(r.total_forecast||0).toLocaleString()}</td><td>${Math.round(r.avg_daily||0)}</td></tr>`).join('')}
      </table></div>
    <div class="panel"><h4>精度指标</h4>
      <table class="data-table"><tr><th>产品</th><th>MAE</th><th>RMSE</th><th>MAPE</th></tr>
        ${Object.entries(d.metrics||{}).map(([k,v]) => `<tr><td>${k}</td><td>${(v.MAE||0).toFixed(1)}</td><td>${(v.RMSE||0).toFixed(1)}</td><td>${(v.MAPE||0).toFixed(1)}%</td></tr>`).join('')}
      </table></div>`;
}

// ─── 2. 数字孪生 ───
async function renderTwin() {
  const d = await fetchJSON(`${API}/digital-twin`, null);
  if (!d) return errMsg('数字孪生服务未启动');
  const m = d.metrics || {};
  return card('🕸️ 供应链数字孪生', '供应商 → 工厂 → 仓库 → 零售商 全链路网络可视化') +
    `<div class="kpi-row">
      ${kpi('节点数', m.total_nodes||0, '#6366f1')}
      ${kpi('边数', m.total_edges||0, '#8b5cf6')}
      ${kpi('关键路径', (m.critical_path_lead_time||0)+'天', '#f59e0b')}
    </div>
    <div class="panel"><h4>网络拓扑</h4>
      <div style="display:flex;flex-wrap:wrap;gap:16px;padding:16px">
        <div style="flex:1;min-width:300px">
          <canvas id="twinCanvas" width="400" height="300"></canvas>
        </div>
        <div style="flex:1;min-width:250px">
          <h5>节点类型分布</h5>
          <table class="data-table"><tr><th>类型</th><th>数量</th></tr>
            ${Object.entries(m.node_types||{}).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
          </table>
          <h5 style="margin-top:12px">网络指标</h5>
          <table class="data-table">
            <tr><td>平均运输成本</td><td>¥${(m.avg_transport_cost||0).toFixed(0)}</td></tr>
            <tr><td>平均提前期</td><td>${(m.avg_lead_time||0).toFixed(1)}天</td></tr>
            <tr><td>总容量</td><td>${(m.total_capacity||0).toLocaleString()}</td></tr>
          </table>
        </div>
      </div></div>`;
}

// ─── 3. 中断模拟 ───
async function renderSimulation() {
  const d = await fetchJSON(`${API}/simulation?iterations=100`, null);
  if (!d) return errMsg('模拟服务未启动');
  const types = [
    {k:'supplier_shutdown',n:'供应商停产',icon:'🏭'},
    {k:'factory_capacity_loss',n:'工厂产能损失',icon:'⚙️'},
    {k:'transport_delay',n:'运输延迟',icon:'🚚'},
    {k:'warehouse_congestion',n:'仓库拥堵',icon:'🏬'}
  ];
  return card('🎲 中断模拟', '蒙特卡洛100次迭代，4种中断场景') +
    `<div class="kpi-row">
      ${kpi('服务水平', ((d.service_level?.mean||0)*100).toFixed(1)+'%', '#ef4444')}
      ${kpi('提前期增加', (d.lead_time_increase?.mean||0).toFixed(1)+'天', '#f59e0b')}
      ${kpi('缺货概率', ((d.stockout_probability?.mean||0)*100).toFixed(1)+'%', '#dc2626')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">
      ${types.map(t => `<button onclick="window._runSim('${t.k}')" class="ct-tab" style="flex:1;min-width:120px">${t.icon} ${t.n}</button>`).join('')}
    </div>
    <div class="panel"><h4 id="simTitle">模拟结果：供应商停产</h4>
      <table class="data-table"><tr><th>指标</th><th>均值</th><th>标准差</th><th>P10</th><th>P90</th></tr>
        <tr><td>服务水平</td><td>${((d.service_level?.mean||0)*100).toFixed(1)}%</td><td>${((d.service_level?.std||0)*100).toFixed(1)}%</td><td>${((d.service_level?.p10||0)*100).toFixed(1)}%</td><td>${((d.service_level?.p90||0)*100).toFixed(1)}%</td></tr>
        <tr><td>提前期增加</td><td>${(d.lead_time_increase?.mean||0).toFixed(1)}天</td><td>${(d.lead_time_increase?.std||0).toFixed(1)}天</td><td>${(d.lead_time_increase?.p10||0).toFixed(1)}天</td><td>${(d.lead_time_increase?.p90||0).toFixed(1)}天</td></tr>
        <tr><td>缺货概率</td><td>${((d.stockout_probability?.mean||0)*100).toFixed(1)}%</td><td>${((d.stockout_probability?.std||0)*100).toFixed(1)}%</td><td>${((d.stockout_probability?.p10||0)*100).toFixed(1)}%</td><td>${((d.stockout_probability?.p90||0)*100).toFixed(1)}%</td></tr>
      </table></div>`;
}

// ─── 4. 库存优化 ───
async function renderInventory() {
  const d = await fetchJSON(`${API}/inventory`, null);
  if (!d) return errMsg('库存优化服务未启动');
  const items = (d.data||[]).slice(0,15);
  const ok = items.filter(i=>i.status==='OK').length;
  const low = items.filter(i=>i.status==='LOW').length;
  const urgent = items.filter(i=>i.status==='REORDER NOW').length;
  return card('📦 库存优化', 'EOQ经济订货量 + 安全库存(Z-score) + 再订货点计算') +
    `<div class="kpi-row">
      ${kpi('SKU总数', items.length+'个', '#6366f1')}
      ${kpi('🟢 正常', ok+'个', '#22c55e')}
      ${kpi('🟡 偏低', low+'个', '#f59e0b')}
      ${kpi('🔴 需补货', urgent+'个', '#ef4444')}
    </div>
    <div class="panel"><h4>库存策略明细</h4>
      <table class="data-table"><tr><th>产品</th><th>仓库</th><th>当前库存</th><th>EOQ</th><th>安全库存</th><th>再订货点</th><th>状态</th></tr>
        ${items.map(i => `<tr>
          <td>${i.product_id||'--'}</td><td>${i.warehouse_id||'--'}</td>
          <td>${Math.round(i.current_inventory||0)}</td>
          <td>${Math.round(i.eoq||0)}</td>
          <td>${Math.round(i.safety_stock||0)}</td>
          <td>${Math.round(i.reorder_point||0)}</td>
          <td style="color:${i.status==='REORDER NOW'?'#ef4444':i.status==='LOW'?'#f59e0b':'#22c55e'}">${i.status==='REORDER NOW'?'🔴立即补货':i.status==='LOW'?'🟡库存偏低':'🟢正常'}</td>
        </tr>`).join('')}
      </table></div>`;
}

// ─── 5. 风险评估 ───
async function renderRisk() {
  const d = await fetchJSON(`${API}/risk`, null);
  if (!d) return errMsg('风险评估服务未启动');
  const o = d.overall || {};
  const alerts = d.alerts || [];
  return card('🎯 风险评估', '概率×影响 风险矩阵 + 排序告警 + 综合风险指数') +
    `<div class="kpi-row">
      ${kpi('综合风险指数', (o.overall_index||0).toFixed(2), o.overall_index>0.5?'#ef4444':o.overall_index>0.25?'#f59e0b':'#22c55e')}
      ${kpi('网络风险', (o.network_risk||0).toFixed(2), '#6366f1')}
      ${kpi('需求风险', (o.demand_risk||0).toFixed(2), '#8b5cf6')}
    </div>
    <div class="panel"><h4>告警列表</h4>
      <table class="data-table"><tr><th>等级</th><th>实体</th><th>得分</th><th>类型</th></tr>
        ${alerts.map(a => `<tr>
          <td style="color:${a.severity==='CRITICAL'?'#ef4444':a.severity==='HIGH'?'#f59e0b':'#eab308'}">${a.severity}</td>
          <td>${a.entity||a.source||'--'}</td>
          <td>${(a.score||0).toFixed(2)}</td>
          <td>${a.type||'--'}</td>
        </tr>`).join('')}
      </table></div>
    <div class="panel"><h4>网络节点风险</h4>
      <table class="data-table"><tr><th>节点</th><th>风险得分</th><th>等级</th></tr>
        ${(d.network_risk||[]).slice(0,10).map(n => `<tr>
          <td>${n.node||'--'}</td><td>${(n.risk_score||0).toFixed(2)}</td>
          <td style="color:${(n.risk_score||0)>0.5?'#ef4444':(n.risk_score||0)>0.25?'#f59e0b':'#22c55e'}">${n.risk_level||'--'}</td>
        </tr>`).join('')}
      </table></div>`;
}

// ─── 工具函数 ───
function card(title, desc) {
  return `<div class="panel" style="margin-bottom:16px"><h3>${title}</h3><p style="color:var(--text-secondary)">${desc}</p></div>`;
}
function kpi(label, value, color) {
  return `<div style="flex:1;min-width:120px;background:var(--panel-bg);border-radius:8px;padding:12px;text-align:center;border-top:3px solid ${color}">
    <div style="font-size:0.8em;color:var(--text-muted)">${label}</div>
    <div style="font-size:1.4em;font-weight:700;color:${color}">${value}</div></div>`;
}
function errMsg(msg) {
  return `<div class="panel" style="text-align:center;padding:40px;color:var(--text-muted)">
    <div style="font-size:2em">⚠️</div><p>${msg}</p>
    <p style="font-size:0.85em">python server/python/api.py</p></div>`;
}

window._runSim = async function(type) {
  const el = document.getElementById('intelContent');
  el.innerHTML = '<div class="loading">⏳ 模拟中...</div>';
  const d = await fetchJSON(`${API}/simulation?disruption_type=${type}&iterations=100`, null);
  const names = {supplier_shutdown:'供应商停产',factory_capacity_loss:'工厂产能损失',transport_delay:'运输延迟',warehouse_congestion:'仓库拥堵'};
  const icons = {supplier_shutdown:'🏭',factory_capacity_loss:'⚙️',transport_delay:'🚚',warehouse_congestion:'🏬'};
  if (!d) { el.innerHTML = errMsg('模拟服务未启动'); return; }
  el.innerHTML = renderSimulation();
  document.getElementById('simTitle').textContent = `模拟结果：${icons[type]||''} ${names[type]||type}`;
};

window.initPage_intelligence = initPage_intelligence;
})();
registerModule('intelligence', initPage_intelligence);
