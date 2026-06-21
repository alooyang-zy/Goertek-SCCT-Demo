/**
 * 歌尔供应链控制塔 — 数据管道
 * Bronze → Silver → Gold 三层架构
 * 参考 virajThekdi/supply-chain 的 Medallion Architecture
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const PIPELINE = { bronze: [], silver: [], gold: {} };

/**
 * 🟤 Bronze 层 — 原始数据摄入
 * 从 CSV / JSON / 内存数据读取，不做转换，保留原始格式
 */
export function bronzeIngest(sources = []) {
  PIPELINE.bronze = [];

  for (const src of sources) {
    const record = {
      id: `BRZ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source: src.name || "unknown",
      raw: { ...src },
      ingested_at: new Date().toISOString(),
      _bronze_timestamp: Date.now()
    };
    PIPELINE.bronze.push(record);
  }

  console.log(`🟤 Bronze: 摄入 ${PIPELINE.bronze.length} 条原始记录`);
  return PIPELINE.bronze;
}

/**
 * ⚪ Silver 层 — 清洗 + 验证 + 标准化
 * 1. 补全缺失字段
 * 2. 类型校验
 * 3. 异常值标记
 * 4. 业务规则校验
 */
export function silverTransform() {
  PIPELINE.silver = [];
  const issues = [];

  for (const record of PIPELINE.bronze) {
    const raw = record.raw.raw || record.raw;
    const validated = {
      bronze_id: record.id,
      name: raw.name || "Unknown",
      type: raw.type || "未分类",
      project: raw.project || "—",
      category: raw.category || "未分级",
      region: raw.region || "未知",

      // 库存
      inv_days: validateNumber(raw.inv_days, 0, 365, 99),
      min_days: validateNumber(raw.min_days, 1, 90, 7),
      inv_status: raw.inv_days < raw.min_days ? "LOW" : "NORMAL",

      // 交付
      on_time_pct: validateNumber(raw.on_time_pct, 0, 100, 100),
      target_otd: validateNumber(raw.target_otd, 80, 100, 95),
      otd_status: raw.on_time_pct < raw.target_otd ? "BELOW_TARGET" : "OK",

      // 质量
      quality_ppm: validateNumber(raw.quality_ppm, 0, 10000, 0),
      max_ppm: validateNumber(raw.max_ppm, 100, 1000, 500),
      quality_status: raw.quality_ppm > raw.max_ppm ? "ALERT" : "PASS",

      // 交期
      lead_time_actual: validateNumber(raw.lead_time_actual, 0, 365, 0),
      lead_time_planned: validateNumber(raw.lead_time_planned, 1, 365, 14),
      lt_deviation_pct: raw.lead_time_planned
        ? Math.round(((raw.lead_time_actual - raw.lead_time_planned) / raw.lead_time_planned) * 100)
        : 0,

      // 成本
      cost_actual: validateNumber(raw.cost_actual, 0, 1e9, 0),
      cost_budget: validateNumber(raw.cost_budget, 1, 1e9, 1),
      cost_overrun_pct: raw.cost_budget
        ? Math.round(((raw.cost_actual - raw.cost_budget) / raw.cost_budget) * 100)
        : 0,

      // 元数据
      validated_at: new Date().toISOString(),
      _silver_timestamp: Date.now()
    };

    // 数据质量检查
    const checks = [];
    if (raw.inv_days === undefined) checks.push("库存天数缺失");
    if (raw.on_time_pct === undefined) checks.push("OTD数据缺失");
    if (raw.quality_ppm === undefined) checks.push("质量PPM缺失");

    if (checks.length > 0) {
      issues.push({ entity: validated.name, issues: checks });
    }

    PIPELINE.silver.push(validated);
  }

  if (issues.length > 0) {
    console.log(`⚠️  Silver: 数据质量问题 — ${JSON.stringify(issues)}`);
  }
  console.log(`⚪ Silver: 清洗验证 ${PIPELINE.silver.length} 条记录`);
  return PIPELINE.silver;
}

/**
 * 🟡 Gold 层 — 聚合指标 + 业务KPI
 * 面向业务用户的最终数据产品
 */
export function goldAggregate() {
  const silver = PIPELINE.silver;
  if (silver.length === 0) {
    PIPELINE.gold = { error: "无数据" };
    return PIPELINE.gold;
  }

  // 实体统计
  const entities = silver.map(s => ({
    name: s.name,
    type: s.type,
    project: s.project,
    region: s.region,
    inv_days: s.inv_days,
    on_time_pct: s.on_time_pct,
    quality_ppm: s.quality_ppm,
    lt_deviation_pct: s.lt_deviation_pct,
    cost_overrun_pct: s.cost_overrun_pct
  }));

  // 整体KPI
  const avgOTD = Math.round(entities.reduce((s, e) => s + e.on_time_pct, 0) / entities.length);
  const avgQuality = Math.round(entities.reduce((s, e) => s + e.quality_ppm, 0) / entities.length);
  const lowInvCount = silver.filter(e => e.inv_status === "LOW").length;
  const otdMissCount = silver.filter(e => e.otd_status === "BELOW_TARGET").length;
  const qualityAlertCount = silver.filter(e => e.quality_status === "ALERT").length;
  const ltDeviationCount = silver.filter(e => e.lt_deviation_pct > 30).length;
  const costOverrunCount = silver.filter(e => e.cost_overrun_pct > 10).length;

  // 按区域聚合
  const byRegion = {};
  const byType = {};
  const byCategory = {};
  for (const e of entities) {
    if (!byRegion[e.region]) byRegion[e.region] = { count: 0, avgOTD: 0, entities: [] };
    byRegion[e.region].count++;
    byRegion[e.region].entities.push(e.name);

    if (!byType[e.type]) byType[e.type] = { count: 0, entities: [] };
    byType[e.type].count++;
    byType[e.type].entities.push(e.name);

    if (!byCategory[e.category]) byCategory[e.category] = { count: 0 };
    byCategory[e.category].count++;
  }

  // 汇总数
  const highRisk = silver.filter(e =>
    e.inv_status === "LOW" || e.quality_status === "ALERT"
  ).length;

  PIPELINE.gold = {
    generated_at: new Date().toISOString(),
    summary: {
      total_entities: entities.length,
      high_risk: highRisk,
      low_inventory: lowInvCount,
      otd_below_target: otdMissCount,
      quality_alert: qualityAlertCount,
      lt_deviation: ltDeviationCount,
      cost_overrun: costOverrunCount,
    },
    kpis: {
      avg_on_time_pct: avgOTD,
      avg_quality_ppm: avgQuality,
      overall_health: highRisk === 0 ? "🟢 健康" : highRisk <= 2 ? "🟡 关注" : "🔴 预警"
    },
    by_region: byRegion,
    by_type: byType,
    by_category: byCategory,
    entities,
    pipeline_meta: {
      bronze_count: PIPELINE.bronze.length,
      silver_count: PIPELINE.silver.length,
      processing_time_ms: Date.now() - (PIPELINE.bronze[0]?._bronze_timestamp || Date.now())
    }
  };

  console.log(`🟡 Gold: 聚合完成 | 实体:${entities.length} | 高危:${highRisk} | OTD:${avgOTD}% | PPM:${avgQuality}`);
  return PIPELINE.gold;
}

/**
 * 一键运行完整管道
 */
export function runPipeline(sources) {
  const start = Date.now();
  bronzeIngest(sources);
  silverTransform();
  goldAggregate();
  console.log(`✅ Pipeline完成: ${Date.now() - start}ms`);
  return PIPELINE.gold;
}

/**
 * 获取管道状态
 */
export function getPipelineStatus() {
  return {
    bronze: { count: PIPELINE.bronze.length, last_run: PIPELINE.bronze[0]?.ingested_at || null },
    silver: { count: PIPELINE.silver.length },
    gold: { generated_at: PIPELINE.gold.generated_at || null }
  };
}

function validateNumber(val, min, max, fallback) {
  const num = Number(val);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}
