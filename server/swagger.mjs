/**
 * Swagger/OpenAPI 文档 — 歌尔供应链控制塔
 * 自动生成 API 文档，访问 /docs 查看
 */
export function getOpenAPISpec(port) {
  return {
    openapi: "3.0.3",
    info: {
      title: "歌尔供应链控制塔 API",
      description: "Goertek Supply Chain Control Tower — 面向消费电子制造业的全链路供应链控制塔平台",
      version: "2.0.0",
      contact: { name: "歌尔SCCT团队" },
      license: { name: "MIT" }
    },
    servers: [
      { url: `http://localhost:${port}`, description: "本地开发" },
      { url: "http://114.132.63.242:3000", description: "测试服务器" },
      { url: "https://goertek.scct.cloud", description: "生产环境" }
    ],
    tags: [
      { name: "预警管理", description: "控制塔预警引擎 — 5大类实时监控" },
      { name: "数据管道", description: "Bronze→Silver→Gold 数据加工" },
      { name: "供应商", description: "供应商主数据与绩效" },
      { name: "系统", description: "健康检查与系统状态" }
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["系统"],
          summary: "健康检查",
          responses: {
            "200": { description: "服务正常", content: { "application/json": { example: { success: true, status: "running", version: "2.0" } } } }
          }
        }
      },
      "/api/alerts": {
        get: {
          tags: ["预警管理"],
          summary: "获取预警列表",
          description: "支持按严重程度、类型、实体、项目筛选",
          parameters: [
            { name: "severity", in: "query", schema: { type: "string", enum: ["critical", "warning"] } },
            { name: "type", in: "query", schema: { type: "string", enum: ["LOW_INVENTORY", "OTD_MISS", "QUALITY_ALERT", "LT_DEVIATION", "COST_OVERRUN"] } },
            { name: "entity", in: "query", schema: { type: "string" } },
            { name: "project", in: "query", schema: { type: "string" } }
          ],
          responses: { "200": { description: "预警列表" } }
        }
      },
      "/api/alerts/summary": {
        get: {
          tags: ["预警管理"],
          summary: "预警摘要统计",
          description: "返回总预警数、严重/警告计数、按类型分组、风险评分",
          responses: { "200": { description: "摘要数据" } }
        }
      },
      "/api/alerts/history": {
        get: {
          tags: ["预警管理"],
          summary: "历史趋势",
          description: "最近10次监控快照的趋势数据",
          responses: { "200": { description: "历史趋势数组" } }
        }
      },
      "/api/alerts/{id}/acknowledge": {
        post: {
          tags: ["预警管理"],
          summary: "认领预警",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "认领成功" } }
        }
      },
      "/api/alerts/{id}/resolve": {
        post: {
          tags: ["预警管理"],
          summary: "解决预警",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "已解决" } }
        }
      },
      "/api/data/refresh": {
        post: {
          tags: ["预警管理"],
          summary: "手动刷新监控数据",
          responses: { "200": { description: "刷新完成" } }
        }
      },
      "/api/suppliers": {
        get: {
          tags: ["供应商"],
          summary: "供应商列表",
          description: "歌尔供应链8大供应商主数据",
          responses: { "200": { description: "供应商数组" } }
        }
      },
      "/api/pipeline/status": {
        get: {
          tags: ["数据管道"],
          summary: "管道状态",
          description: "查看 Bronze→Silver→Gold 各层数据量",
          responses: { "200": { description: "管道状态" } }
        }
      },
      "/api/pipeline/gold": {
        get: {
          tags: ["数据管道"],
          summary: "Gold层聚合数据",
          description: "面向业务的最终聚合指标",
          responses: { "200": { description: "聚合数据" } }
        }
      }
    }
  };
}

// Swagger UI HTML (内联，零依赖)
export function swaggerHTML(spec) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>歌尔供应链控制塔 — API文档</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>html{background:#0f172a}body{margin:0}.swagger-ui{background:#0f172a}.swagger-ui .topbar{background:#1e293b;border-bottom:2px solid #3b82f6}.swagger-ui .topbar .download-url-wrapper .select-label{color:#94a3b8}.swagger-ui .info .title{color:#f8fafc}.swagger-ui .info{color:#cbd5e1}.swagger-ui .scheme-container{background:#1e293b}.swagger-ui .opblock-tag{color:#f8fafc}.swagger-ui .opblock .opblock-summary-description{color:#94a3b8}.swagger-ui .model-box{background:#1e293b}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ spec: ${JSON.stringify(spec)}, dom_id: '#swagger-ui', presets: [SwaggerUIBundle.presets.apis], layout: "BaseLayout", defaultModelsExpandDepth: -1 });
  </script>
</body>
</html>`;
}
