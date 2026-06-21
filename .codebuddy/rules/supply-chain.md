---
description: 歌尔供应链控制塔业务上下文 - 领域知识、指标体系、术语定义
alwaysApply: true
enabled: true
---

# 歌尔供应链控制塔 — 业务规则

## 项目定位
本项目是歌尔股份（消费电子制造业）的供应链控制塔 Demo，面向Meta/Sony/Apple/Samsung等客户的供应链全链路可视化与智能分析。

## 核心概念
- **SCCT**: Supply Chain Control Tower
- **OTD**: On-Time Delivery，准时交付率
- **PPM**: Parts Per Million，百万分之不良率
- **EOQ**: 经济订货量
- **SCOR**: 供应链运作参考模型

## 五大业务领域
1. 需求预测 — 傅里叶分解 + Ridge 回归
2. 数字孪生 — NetworkX 有向图，供应商→工厂→仓库→零售商
3. 中断模拟 — 蒙特卡洛仿真，4种场景
4. 库存优化 — EOQ + 安全库存 Z-score + 再订货点
5. 风险评估 — 概率×影响矩阵 + 综合指数

## 预警引擎五大类
- LOW_INVENTORY (严重) — 库存低于安全线
- OTD_MISS (警告) — 准时交付率不达标
- QUALITY_ALERT (严重) — PPM超标
- LT_DEVIATION (警告) — 交期偏差
- COST_OVERRUN (警告) — 成本超预算

## 数据管道
Bronze(原始摄入) → Silver(清洗验证) → Gold(聚合KPI)

## 国际化
- 所有面向用户的文本必须使用**中文**
- API 接口使用英文命名
- 数据库字段使用 snake_case
