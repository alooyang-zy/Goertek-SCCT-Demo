/**
 * 歌尔供应链控制塔 — 模拟数据
 * 基于歌尔实际业务场景（Meta/Sony/Apple/Samsung 项目）
 */

export const suppliers = [
  {
    name: "Meta-VR结构件供应商A",
    type: "结构件",
    project: "P-GOER-2026-001",
    inv_days: 3,
    min_days: 7,
    on_time_pct: 92,
    target_otd: 95,
    quality_ppm: 600,
    max_ppm: 500,
    lead_time_actual: 12,
    lead_time_planned: 10,
    cost_actual: 450000,
    cost_budget: 420000,
    region: "华南",
    category: "一级供应商"
  },
  {
    name: "Sony-镜头模组供应商B",
    type: "光学",
    project: "P-GOER-2026-002",
    inv_days: 5,
    min_days: 7,
    on_time_pct: 88,
    target_otd: 95,
    quality_ppm: 300,
    max_ppm: 500,
    lead_time_actual: 28,
    lead_time_planned: 21,
    cost_actual: 680000,
    cost_budget: 600000,
    region: "华东",
    category: "一级供应商"
  },
  {
    name: "Apple-芯片供应商C",
    type: "芯片",
    project: "P-GOER-2026-003",
    inv_days: 14,
    min_days: 10,
    on_time_pct: 97,
    target_otd: 95,
    quality_ppm: 120,
    max_ppm: 500,
    lead_time_actual: 22,
    lead_time_planned: 15,
    cost_actual: 1200000,
    cost_budget: 1000000,
    region: "海外",
    category: "战略供应商"
  },
  {
    name: "Samsung-面板供应商D",
    type: "显示",
    project: "P-GOER-2026-004",
    inv_days: 8,
    min_days: 10,
    on_time_pct: 94,
    target_otd: 95,
    quality_ppm: 850,
    max_ppm: 500,
    lead_time_actual: 25,
    lead_time_planned: 18,
    cost_actual: 520000,
    cost_budget: 500000,
    region: "海外",
    category: "战略供应商"
  },
  {
    name: "歌尔-包装供应商E",
    type: "包材",
    project: "P-GOER-2026-001",
    inv_days: 2,
    min_days: 5,
    on_time_pct: 91,
    target_otd: 95,
    quality_ppm: 200,
    max_ppm: 500,
    lead_time_actual: 7,
    lead_time_planned: 5,
    cost_actual: 85000,
    cost_budget: 80000,
    region: "华北",
    category: "二级供应商"
  },
  {
    name: "Meta-电子料供应商F",
    type: "电子",
    project: "P-GOER-2026-001",
    inv_days: 9,
    min_days: 7,
    on_time_pct: 96,
    target_otd: 95,
    quality_ppm: 80,
    max_ppm: 500,
    cost_actual: 210000,
    cost_budget: 200000,
    region: "华南",
    category: "一级供应商"
  },
  {
    name: "Sony-精密加工供应商G",
    type: "机加",
    project: "P-GOER-2026-002",
    inv_days: 6,
    min_days: 5,
    on_time_pct: 85,
    target_otd: 95,
    quality_ppm: 720,
    max_ppm: 500,
    lead_time_actual: 20,
    lead_time_planned: 14,
    cost_actual: 350000,
    cost_budget: 320000,
    region: "华东",
    category: "一级供应商"
  },
  {
    name: "Apple-连接器供应商H",
    type: "连接器",
    project: "P-GOER-2026-003",
    inv_days: 4,
    min_days: 6,
    on_time_pct: 93,
    target_otd: 95,
    quality_ppm: 450,
    max_ppm: 500,
    lead_time_actual: 18,
    lead_time_planned: 12,
    cost_actual: 150000,
    cost_budget: 130000,
    region: "华南",
    category: "一级供应商"
  }
];

/**
 * 历史趋势模拟 — 最近7天
 */
export function generateHistory(ct) {
  const history = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const count = Math.floor(Math.random() * 5) + 3;
    const criticalCount = Math.floor(Math.random() * 3);
    history.push({
      time: date.toISOString().split("T")[0],
      total: count,
      critical: criticalCount,
      warning: count - criticalCount
    });
  }
  return history;
}
