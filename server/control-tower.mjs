/**
 * 供应链控制塔预警引擎
 * 基于 virbahu/control-tower-dashboard，扩展为完整后端服务
 * 五大预警类型 + 综合分析 + 历史趋势
 */

export class ControlTower {
  constructor() {
    this.alerts = [];
    this.metrics = {};
    this.history = []; // 历史预警记录
  }

  /**
   * 监控供应链实体，生成预警
   * @param {Array} data - 供应链实体数据
   * @returns {Array} 预警列表
   */
  monitor(data) {
    this.alerts = [];
    for (const item of data) {
      const checks = [];

      // 1. 库存不足 — 库存天数 < 最低安全天数
      if ((item.inv_days ?? 99) < (item.min_days ?? 7)) {
        checks.push({
          type: "LOW_INVENTORY",
          severity: "critical",
          message: `${item.name} 库存仅剩 ${item.inv_days} 天（安全线: ${item.min_days} 天）`,
          suggestion: "立即启动紧急补货流程，评估替代供应商方案",
          metric: `库存天数: ${item.inv_days}d`,
          value: item.inv_days,
          threshold: item.min_days
        });
      }

      // 2. 准时交付未达标 — OTD% < 目标值
      if ((item.on_time_pct ?? 100) < (item.target_otd ?? 95)) {
        checks.push({
          type: "OTD_MISS",
          severity: "warning",
          message: `${item.name} 准时交付率 ${item.on_time_pct}%（目标: ${item.target_otd}%）`,
          suggestion: "与供应商召开OTD改善会议，建立二级备选产能",
          metric: `OTD: ${item.on_time_pct}%`,
          value: item.on_time_pct,
          threshold: item.target_otd
        });
      }

      // 3. 质量问题 — PPM > 允许上限
      if ((item.quality_ppm ?? 0) > (item.max_ppm ?? 500)) {
        const overRate = Math.round(((item.quality_ppm - item.max_ppm) / item.max_ppm) * 100);
        checks.push({
          type: "QUALITY_ALERT",
          severity: "critical",
          message: `${item.name} 质量 PPM=${item.quality_ppm}，超标 ${overRate}%`,
          suggestion: "触发8D整改流程，暂停该供应商新批次入库",
          metric: `PPM: ${item.quality_ppm}`,
          value: item.quality_ppm,
          threshold: item.max_ppm
        });
      }

      // 4. 交期偏差 — 实际交期 > 计划 × 1.3
      if ((item.lead_time_actual ?? 0) > (item.lead_time_planned ?? 1) * 1.3) {
        const deviation = item.lead_time_actual - item.lead_time_planned;
        checks.push({
          type: "LT_DEVIATION",
          severity: "warning",
          message: `${item.name} 实际交期 ${item.lead_time_actual}d（计划: ${item.lead_time_planned}d，偏差 +${deviation}d）`,
          suggestion: "核查物流瓶颈，评估空运替代方案",
          metric: `交期偏差: +${deviation}d`,
          value: item.lead_time_actual,
          threshold: Math.round(item.lead_time_planned * 1.3)
        });
      }

      // 5. 成本超支 — 实际成本 > 预算 × 1.1
      if ((item.cost_actual ?? 0) > (item.cost_budget ?? 1) * 1.1) {
        const overRate = Math.round(((item.cost_actual - item.cost_budget) / item.cost_budget) * 100);
        checks.push({
          type: "COST_OVERRUN",
          severity: "warning",
          message: `${item.name} 成本超支 ${overRate}%（实际: ¥${(item.cost_actual/10000).toFixed(1)}万 vs 预算: ¥${(item.cost_budget/10000).toFixed(1)}万）`,
          suggestion: "启动成本复盘，审查采购价格和物流费用",
          metric: `超支: ${overRate}%`,
          value: item.cost_actual,
          threshold: Math.round(item.cost_budget * 1.1)
        });
      }

      for (const alert of checks) {
        this.alerts.push({
          id: `ALT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          entity: item.name,
          entity_type: item.type || "供应商",
          project: item.project || "—",
          ...alert,
          timestamp: new Date().toISOString(),
          status: "open"
        });
      }
    }

    // 保存历史
    this.history.push({ time: new Date().toISOString(), alerts: [...this.alerts] });
    if (this.history.length > 100) this.history.shift();

    return this.alerts;
  }

  /**
   * 预警摘要统计
   */
  summary() {
    const critical = this.alerts.filter(a => a.severity === "critical").length;
    const warning = this.alerts.filter(a => a.severity === "warning").length;
    const byType = {};
    const byEntity = {};
    for (const a of this.alerts) {
      byType[a.type] = (byType[a.type] || 0) + 1;
      byEntity[a.entity] = (byEntity[a.entity] || 0) + 1;
    }

    // 风险评分 0-100
    const score = Math.max(0, 100 - (critical * 20 + warning * 10));

    return {
      total_alerts: this.alerts.length,
      critical,
      warning,
      by_type: byType,
      by_entity: byEntity,
      risk_score: score,
      risk_level: score >= 80 ? "🟢 安全" : score >= 50 ? "🟡 关注" : "🔴 危险"
    };
  }

  /**
   * 获取历史趋势
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit).map(h => ({
      time: h.time,
      total: h.alerts.length,
      critical: h.alerts.filter(a => a.severity === "critical").length,
      warning: h.alerts.filter(a => a.severity === "warning").length
    }));
  }

  /**
   * 类型中文名
   */
  static typeName(type) {
    const map = {
      "LOW_INVENTORY": "库存不足",
      "OTD_MISS": "准时交付未达标",
      "QUALITY_ALERT": "质量问题",
      "LT_DEVIATION": "交期偏差",
      "COST_OVERRUN": "成本超支"
    };
    return map[type] || type;
  }
}
