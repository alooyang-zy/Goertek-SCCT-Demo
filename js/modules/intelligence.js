// Module: intelligence — 供应链智能分析（嵌入Nikiyolo Streamlit完整应用）
(function(){
function initPage_intelligence(container) {
  container = container || document.getElementById('page-intelligence');
  if (!container) return;

  // 判断是本地还是生产环境
  const host = location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const streamlitUrl = isLocal ? 'http://localhost:8502' : 'http://114.132.63.242:8502';

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--card);border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
      <div>
        <h2 style="margin:0;font-size:1.3em">🧠 供应链智能分析</h2>
        <p style="margin:4px 0 0;color:var(--text-secondary);font-size:0.85em">
          基于Nikiyolo AI引擎 · 需求预测 · 数字孪生 · 中断模拟 · 库存优化 · 风险监控
        </p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;animation:pulse 2s infinite"></span>
        <span style="font-size:0.8em;color:var(--text-muted)">引擎运行中</span>
        <a href="${streamlitUrl}" target="_blank" style="font-size:0.8em;color:var(--primary);text-decoration:none;padding:4px 10px;border:1px solid var(--primary);border-radius:4px">新窗口打开 ↗</a>
      </div>
    </div>
    <div style="position:relative;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:#0f172a">
      <iframe src="${streamlitUrl}"
        style="width:100%;height:calc(100vh - 180px);border:none;display:block"
        allow="fullscreen"
        id="streamlitFrame">
      </iframe>
      <div id="iframeLoading" style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f172a;color:#94a3b8;z-index:10">
        <div style="font-size:2em;margin-bottom:12px">⏳</div>
        <div>正在加载智能分析引擎...</div>
        <div style="font-size:0.8em;margin-top:4px">首次加载约需5-10秒</div>
      </div>
    </div>`;

  // 加载完成后隐藏loading
  const iframe = document.getElementById('streamlitFrame');
  const loading = document.getElementById('iframeLoading');
  iframe.onload = function() {
    setTimeout(() => { if(loading) loading.style.display = 'none'; }, 1000);
  };
  // 超时也隐藏
  setTimeout(() => { if(loading) loading.style.display = 'none'; }, 15000);
}

window.initPage_intelligence = initPage_intelligence;
})();
registerModule('intelligence', initPage_intelligence);
