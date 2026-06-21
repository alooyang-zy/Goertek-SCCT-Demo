"""
歌尔供应链控制塔 — 智能分析引擎 API
集成 Nikiyolo AI Supply Chain Control Tower 全部5大模块
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import json
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 导入 Nikiyolo 模块
from nikiyolo.data.synthetic_generator import generate_demand_data, generate_inventory_data, generate_network_data
from nikiyolo.data.data_preprocessor import preprocess_demand_data
from nikiyolo.forecasting.forecast_pipeline import run_forecast_pipeline, get_forecast_summary
from nikiyolo.digital_twin.supply_chain_graph import build_supply_chain_graph, get_graph_metrics, get_node_positions
from nikiyolo.simulation.disruption_simulator import simulate_disruption
from nikiyolo.optimization.inventory_optimizer import compute_inventory_policy
from nikiyolo.risk.risk_engine import compute_network_risk, compute_demand_risk, generate_risk_alerts, compute_overall_risk_index

app = FastAPI(title="歌尔智能分析引擎", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# 全局数据缓存
CACHE = {}

def init_data():
    """初始化 Demo 数据"""
    if "demand_df" not in CACHE:
        CACHE["demand_df"] = generate_demand_data(n_products=5, n_days=365)
        CACHE["inventory_df"] = generate_inventory_data(n_products=5, n_warehouses=3)
        CACHE["network_df"] = generate_network_data()
        CACHE["demand_clean"] = preprocess_demand_data(CACHE["demand_df"])
        CACHE["graph"] = build_supply_chain_graph(CACHE["network_df"])
        CACHE["graph_metrics"] = get_graph_metrics(CACHE["graph"])
        CACHE["positions"] = get_node_positions(CACHE["graph"])

init_data()

@app.get("/api/intelligence/health")
def health():
    return {"status": "running", "modules": ["预测", "数字孪生", "中断模拟", "库存优化", "风险评估"]}

# ─── 1. 需求预测 ───
@app.get("/api/intelligence/forecast")
def forecast(horizon: int = 90):
    init_data()
    fc, metrics = run_forecast_pipeline(CACHE["demand_clean"], horizon)
    summary = get_forecast_summary(fc)
    fc_sub = fc[fc["is_forecast"]].copy()
    fc_sub["ds"] = fc_sub["ds"].astype(str)
    fc_hist = fc[~fc["is_forecast"]].tail(90).copy()
    fc_hist["ds"] = fc_hist["ds"].astype(str)
    return {
        "summary": summary.to_dict("records") if isinstance(summary, pd.DataFrame) else [],
        "forecast": json.loads(fc_sub.to_json(orient="records")),
        "history": json.loads(fc_hist.to_json(orient="records")),
        "metrics": {k: {kk: float(vv) if isinstance(vv, (np.floating, np.integer)) else vv for kk, vv in v.items()} for k, v in metrics.items()}
    }

# ─── 2. 供应链数字孪生 ───
@app.get("/api/intelligence/digital-twin")
def digital_twin():
    init_data()
    nodes = []
    for n, d in CACHE["graph"].nodes(data=True):
        nodes.append({"id": n, "type": d.get("node_type", "unknown"), "label": n})
    edges = []
    for u, v, d in CACHE["graph"].edges(data=True):
        edges.append({
            "source": u, "target": v,
            "transport_cost": float(d.get("transport_cost", 0)),
            "lead_time": int(d.get("lead_time", 0)),
            "capacity": int(d.get("capacity", 0))
        })
    return {
        "nodes": nodes,
        "edges": edges,
        "metrics": {k: (float(v) if isinstance(v, (np.floating, np.integer)) else v) for k, v in CACHE["graph_metrics"].items()},
        "positions": CACHE["positions"]
    }

# ─── 3. 中断模拟 ───
@app.get("/api/intelligence/simulation")
def simulation(disruption_type: str = "supplier_shutdown", iterations: int = 100):
    init_data()
    result = simulate_disruption(CACHE["graph"], disruption_type, iterations=iterations)
    clean = {}
    for k, v in result.items():
        if isinstance(v, dict):
            clean[k] = {kk: (float(vv) if isinstance(vv, (np.floating, np.integer)) else vv) for kk, vv in v.items()}
        elif isinstance(v, (np.floating, np.integer)):
            clean[k] = float(v)
        else:
            clean[k] = v
    return clean

# ─── 4. 库存优化 ───
@app.get("/api/intelligence/inventory")
def inventory():
    init_data()
    policy = compute_inventory_policy(CACHE["inventory_df"], CACHE["demand_df"])
    return {"data": json.loads(policy.to_json(orient="records"))}

# ─── 5. 风险评估 ───
@app.get("/api/intelligence/risk")
def risk():
    init_data()
    demand_risk = compute_demand_risk(CACHE["demand_clean"])
    network_risk = compute_network_risk(CACHE["graph"])
    alerts = generate_risk_alerts(network_risk, demand_risk)
    overall = compute_overall_risk_index(network_risk, demand_risk)
    return {
        "demand_risk": json.loads(demand_risk.to_json(orient="records")),
        "network_risk": json.loads(network_risk.to_json(orient="records")),
        "alerts": alerts,
        "overall": {k: (float(v) if isinstance(v, (np.floating, np.integer)) else v) for k, v in overall.items()}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
