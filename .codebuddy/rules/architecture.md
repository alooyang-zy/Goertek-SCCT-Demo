---
description: 歌尔供应链控制塔架构规范 - 技术栈、目录结构、部署方式
alwaysApply: true
enabled: true
---

# 歌尔供应链控制塔 — 架构规范

## 技术栈
- **前端**: HTML5 + CSS3 + 原生 JS (IIFE 模块) + Chart.js 4.4 + Font Awesome 6.4
- **后端**: Node.js 零依赖 HTTP 服务 (server/index.mjs) + Python FastAPI (server/python/api.py)
- **部署**: OpenCloudOS (腾讯云 Lighthouse) + Systemd/crontab 自启
- **版本控制**: GitHub (alooyang-zy/Goertek-SCCT-Demo)

## 目录结构
```
deploy/Goertek-SCCT-Demo/
├── index.html              # 主页面入口
├── styles/main.css         # 全局样式（深色/浅色主题）
├── js/
│   ├── app.js              # SPA路由 + 数据服务
│   └── modules/            # 15个业务模块 (IIFE模式)
│       ├── risk.js         # 风险雷达 + 控制塔预警引擎
│       ├── intelligence.js # 供应链智能分析（Nikiyolo集成）
│       └── ...
├── server/
│   ├── index.mjs           # Node.js 主服务 (端口3000/80)
│   ├── control-tower.mjs   # 5类预警引擎
│   ├── pipeline.mjs        # Bronze→Silver→Gold管道
│   ├── swagger.mjs         # OpenAPI文档
│   ├── data.mjs            # 8个供应商Demo数据
│   └── python/
│       ├── api.py          # FastAPI (端口5000)
│       └── nikiyolo/       # Nikiyolo ML引擎
└── Dockerfile
```

## 前端模块注册方式
每个模块用 IIFE 包装，最后 `registerModule('name', initFn)`：
```js
(function(){ ... })();
registerModule('moduleName', initFunction);
```

## 新页面添加步骤
1. 在 index.html 添加 `<section class="page" id="page-xxx">`
2. 在 index.html 侧边栏添加 `<a class="nav-item" data-page="xxx">`
3. 创建 `js/modules/xxx.js`
4. 在 index.html 底部引用 `<script src="js/modules/xxx.js">`

## 部署流程
1. `git push` 推送到 GitHub
2. Lighthouse deploy_project_preparation 上传
3. 服务器端 `bash /root/start-scct.sh` 重启
4. 公网地址: http://goertek.scct.cloud

## 禁止事项
- 不能修改 `.codebuddy/` 下的集成配置
- 不能使用需要 npm install 的 Node.js 依赖 (保持零依赖)
- Python 后端不允许引入新依赖（仅限已安装的 fastapi/uvicorn/pandas/numpy/scikit-learn/networkx/scipy）
