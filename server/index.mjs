/**
 * 歌尔供应链控制塔 — 后端 API 服务
 * 零外部依赖，纯 Node.js 内置模块
 */
import http from "http";
import { readFile } from "fs/promises";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { ControlTower } from "./control-tower.mjs";
import { suppliers, generateHistory } from "./data.mjs";
import { runPipeline, getPipelineStatus } from "./pipeline.mjs";
import { getOpenAPISpec, swaggerHTML } from "./swagger.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = process.env.PORT || 3000;

// MIME types
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// ──────── 控制塔引擎 ────────
const ct = new ControlTower();
ct.monitor(suppliers);

setInterval(() => {
  const dynamic = suppliers.map(s => ({
    ...s,
    inv_days: Math.max(0, s.inv_days + Math.floor(Math.random() * 3) - 1),
    on_time_pct: Math.min(100, Math.max(80, s.on_time_pct + Math.floor(Math.random() * 5) - 2)),
    quality_ppm: Math.max(0, s.quality_ppm + Math.floor(Math.random() * 100) - 50),
    lead_time_actual: Math.max(1, (s.lead_time_actual || 10) + Math.floor(Math.random() * 3) - 1),
    cost_actual: (s.cost_actual || 100000) + Math.floor(Math.random() * 5000) - 2500,
  }));
  ct.monitor(dynamic);
}, 30000);

// ──────── 静态文件服务 ────────
async function serveStatic(pathname, res) {
  let filePath = join(ROOT, pathname === "/" ? "index.html" : pathname);
  try {
    const content = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  } catch {
    // SPA fallback
    try {
      const html = await readFile(join(ROOT, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  }
}

// ──────── API 路由 ────────
function json(res, data) {
  res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise(resolve => {
    let body = "";
    req.on("data", d => body += d);
    req.on("end", () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

const API = {
  "GET /api/health": () => ({ success: true, status: "running", version: "2.0", engine: "Goertek-SCCT" }),
  "GET /api/alerts": (req) => {
    let alerts = ct.alerts;
    const q = req._query || {};
    if (q.severity) alerts = alerts.filter(a => a.severity === q.severity);
    if (q.type) alerts = alerts.filter(a => a.type === q.type);
    return { success: true, data: alerts, total: alerts.length };
  },
  "GET /api/alerts/summary": () => ({ success: true, data: ct.summary() }),
  "GET /api/alerts/history": () => {
    const h = ct.getHistory();
    return { success: true, data: h.length ? h : generateHistory(ct) };
  },
  "GET /api/suppliers": () => ({ success: true, data: suppliers }),
  "POST /api/alerts/acknowledge": async (req) => {
    const body = await parseBody(req);
    const a = ct.alerts.find(x => x.id === body.id);
    if (!a) return { success: false, error: "Not found" };
    a.status = "acknowledged";
    return { success: true, data: a };
  },
  "POST /api/alerts/resolve": async (req) => {
    const body = await parseBody(req);
    const a = ct.alerts.find(x => x.id === body.id);
    if (!a) return { success: false, error: "Not found" };
    a.status = "resolved";
    return { success: true, data: a };
  },
  "POST /api/data/refresh": () => { ct.monitor(suppliers); return { success: true, data: ct.summary() }; },
  // 数据管道
  "GET /api/pipeline/status": () => ({ success: true, data: getPipelineStatus() }),
  "GET /api/pipeline/gold": () => ({ success: true, data: runPipeline(suppliers) }),
};

// ──────── Server ────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  req._query = Object.fromEntries(url.searchParams);

  // API 路由
  const apiKey = `${req.method} ${pathname}`;
  if (API[apiKey]) {
    try {
      const result = await API[apiKey](req, res);
      json(res, result);
    } catch (e) {
      json(res, { success: false, error: e.message });
    }
    return;
  }

  // OpenAPI Spec & Swagger Docs
  if (pathname === "/api/openapi.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(getOpenAPISpec(PORT)));
  }
  if (pathname === "/docs" || pathname === "/api/docs") {
    const spec = getOpenAPISpec(PORT);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(swaggerHTML(spec));
  }

  // 智能分析代理 → Python 服务
  if (pathname.startsWith("/api/intelligence")) {
    try {
      const pyRes = await fetch(`http://127.0.0.1:5000${pathname}?${url.searchParams.toString()}`);
      const data = await pyRes.text();
      res.writeHead(pyRes.status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(data);
    } catch {
      json(res, { success: false, error: "Python智能分析服务未启动 (端口5000)" });
    }
    return;
  }

  // POST /api/alerts/:id/acknowledge
  const ackMatch = pathname.match(/^\/api\/alerts\/([^/]+)\/(acknowledge|resolve)$/);
  if (ackMatch && req.method === "POST") {
    const [, id, action] = ackMatch;
    const a = ct.alerts.find(x => x.id === id);
    if (!a) return json(res, { success: false, error: "Not found" });
    a.status = action === "resolve" ? "resolved" : "acknowledged";
    return json(res, { success: true, data: a });
  }

  // 静态文件
  await serveStatic(pathname, res);
});

server.listen(PORT, () => {
  runPipeline(suppliers);
  console.log(`🚀 歌尔供应链控制塔 v2.0 已启动`);
  console.log(`   前端:    http://localhost:${PORT}/`);
  console.log(`   API文档: http://localhost:${PORT}/docs`);
  console.log(`   健康检查: http://localhost:${PORT}/api/health`);
  console.log(`   管道状态: http://localhost:${PORT}/api/pipeline/status`);
  console.log(`   预警: ${ct.alerts.length}条 | 🔴${ct.summary().critical}严重 | 🟡${ct.summary().warning}警告`);
});
