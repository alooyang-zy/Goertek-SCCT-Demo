# 歌尔供应链控制塔 (Goertek SCCT) — Demo

歌尔股份供应链控制塔（Supply Chain Control Tower）系统演示，提供供应链全局总览、项目进度跟踪、风险预警、库存健康、成本可视、供需齐套分析等14个核心业务模块。

## 功能模块

| 模块 | 说明 |
|------|------|
| 控制塔全局总览 | KPI仪表盘、项目排行榜、风险/工单/AI任务总览 |
| 项目进度跟踪 | 里程碑节点甘特图，异常节点红黄绿预警 |
| 项目周期监控 | 采购/生产/物流周期对比，OTS偏差分析 |
| 项目库存健康 | 库存水位、周转率、呆滞料监控 |
| 项目成本可视 | BOM成本、物流成本、预算执行率 |
| 物料导入状态 | NPI物料承认进度、供应商送样追踪 |
| 供方深度协同 | 供应商绩效、合同履约、风险事件 |
| 客户交期答复 | ATP/CTP交期承诺、订单变更响应 |
| 需求预测模型 | 统计预测 vs AI预测精度对比 |
| 供需齐套分析 | 供需缺口、替代料、瓶颈物料预警 |
| 风险雷达预警 | 多维度风险扫描、影响评估矩阵 |
| 事件闭环管理 | 工单看板、8D整改、验证关闭 |
| 智能员工助手 | 角色AI（GCM/采购/计划/质量）对话 |
| 系统配置管理 | 阈值规则、告警策略、角色权限 |

## 技术栈

- **前端**：HTML5 + CSS3 + 原生 JavaScript (ES Module)
- **图表**：[Chart.js 4.4](https://www.chartjs.org/)
- **图标**：[Font Awesome 6.4](https://fontawesome.com/)
- **部署**：Nginx Alpine (Docker)

## 快速开始

### 本地运行

```bash
# Python
python -m http.server 8080
# 访问 http://localhost:8080

# 或 Node.js
npx serve .
```

### Docker 部署

```bash
# 构建镜像
docker build -t goertek-scct:latest .

# 运行容器
docker run -d --name goertek-scct --restart=always \
  -p 80:80 \
  goertek-scct:latest
```

### 生产部署（HTTPS）

```bash
docker run -d --name goertek-scct --restart=always \
  -p 443:443 \
  -v /path/to/certs:/certs:ro \
  goertek-scct:latest
```

## 项目结构

```
Goertek-SCCT-Demo/
├── index.html           # 主页面入口
├── Dockerfile           # Docker 构建文件
├── nginx.conf           # Nginx 配置（SPA + SSL）
├── entrypoint.sh        # 容器启动脚本
├── styles/
│   └── main.css         # 全局样式（深色/浅色主题）
└── js/
    ├── app.js           # 主应用入口（SPA路由）
    ├── data.js          # 数据层（项目/节点/指标/工单）
    └── modules/
        ├── overview.js      # 全局总览
        ├── progress.js      # 项目进度跟踪
        ├── cycle.js         # 周期监控
        ├── inventory.js     # 库存健康
        ├── cost.js          # 成本可视
        ├── material.js      # 物料导入状态
        ├── supplier.js      # 供方协同
        ├── delivery.js      # 客户交期答复
        ├── forecast.js      # 需求预测
        ├── supplydemand.js  # 供需齐套
        ├── risk.js          # 风险雷达
        ├── closedloop.js    # 事件闭环
        ├── ai.js            # AI助手
        ├── settings.js      # 系统配置
        └── indicatorlist.js # 指标清单
```

## 在线访问

- **主地址**：https://goertek.scct.cloud/
- **备用地址**：http://114.132.63.242:8888/

## 部署信息

| 项目 | 详情 |
|------|------|
| 域名 | goertek.scct.cloud (HTTPS) |
| 服务器 | OpenCloudOS-YEio (114.132.63.242) |
| 实例 ID | lhins-ftf1tsob |
| 地域 | ap-guangzhou |
| 部署方式 | Docker + Nginx Alpine |
| 端口 | 80 (HTTP→HTTPS) / 443 (HTTPS) |

## License

MIT © 2026 Goertek SCCT Team
