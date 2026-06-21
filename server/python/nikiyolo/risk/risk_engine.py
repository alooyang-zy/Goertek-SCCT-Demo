"""
Risk engine module for the AI Supply Chain Control Tower.
Computes supply chain risk scores using probability × impact framework.
"""

import pandas as pd
import numpy as np
import networkx as nx
from typing import Dict, List, Tuple, Optional


RISK_DIMENSIONS = {
    "demand_volatility": {
        "weight": 0.25,
        "description": "Risk from unpredictable demand fluctuations",
    },
    "supply_concentration": {
        "weight": 0.25,
        "description": "Risk from dependence on few suppliers",
    },
    "lead_time_risk": {
        "weight": 0.20,
        "description": "Risk from long or variable lead times",
    },
    "capacity_risk": {
        "weight": 0.15,
        "description": "Risk from capacity constraints",
    },
    "network_resilience": {
        "weight": 0.15,
        "description": "Risk from low network redundancy",
    },
}

RISK_THRESHOLDS = {
    "critical": 0.75,
    "high": 0.50,
    "medium": 0.25,
    "low": 0.0,
}


def compute_demand_risk(demand_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute demand volatility risk per product.
    
    Args:
        demand_df: Demand DataFrame with date, product_id, sales
    
    Returns:
        DataFrame with product-level demand risk scores
    """
    if demand_df.empty:
        return pd.DataFrame()

    risk_scores = []
    for product_id, group in demand_df.groupby("product_id"):
        sales = group["sales"].values
        if len(sales) < 2:
            cv = 0.5
        else:
            mean_sales = np.mean(sales)
            cv = np.std(sales) / max(mean_sales, 1)  # Coefficient of variation

        # Normalize CV to risk score (0-1)
        risk_score = min(1.0, cv * 2)
        risk_scores.append({
            "entity": product_id,
            "entity_type": "product",
            "dimension": "demand_volatility",
            "probability": round(risk_score, 4),
            "impact": round(min(1.0, mean_sales / 1000), 4),
            "cv": round(float(cv), 4),
        })

    df = pd.DataFrame(risk_scores)
    df["risk_score"] = df["probability"] * df["impact"]
    return df


def compute_network_risk(G: nx.DiGraph) -> pd.DataFrame:
    """
    Compute node-level network risk scores.
    
    Args:
        G: Supply chain directed graph
    
    Returns:
        DataFrame with node-level risk scores
    """
    if G.number_of_nodes() == 0:
        return pd.DataFrame()

    risk_scores = []

    for node, data in G.nodes(data=True):
        node_type = data.get("node_type", "unknown")

        # In-degree and out-degree centrality
        in_deg = G.in_degree(node)
        out_deg = G.out_degree(node)

        # Supply concentration risk: nodes with few suppliers (in-edges)
        supply_concentration = 1.0 / max(in_deg, 1)
        supply_concentration = min(1.0, supply_concentration)

        # Lead time risk: average lead time on outgoing edges
        out_edges = list(G.out_edges(node, data=True))
        if out_edges:
            avg_lead_time = np.mean([e[2]["lead_time"] for e in out_edges])
            lead_time_risk = min(1.0, avg_lead_time / 30)  # Normalize to 30 days
            capacity_risk = 1 - min(1.0, np.mean([e[2]["capacity"] for e in out_edges]) / 1000)
        else:
            avg_lead_time = 0
            lead_time_risk = 0
            capacity_risk = 0

        # Network resilience: betweenness centrality (higher = more critical)
        try:
            betweenness = nx.betweenness_centrality(G, normalized=True).get(node, 0)
        except Exception:
            betweenness = 0

        # Composite risk score (weighted average)
        composite_risk = (
            supply_concentration * RISK_DIMENSIONS["supply_concentration"]["weight"] +
            lead_time_risk * RISK_DIMENSIONS["lead_time_risk"]["weight"] +
            capacity_risk * RISK_DIMENSIONS["capacity_risk"]["weight"] +
            betweenness * RISK_DIMENSIONS["network_resilience"]["weight"]
        ) / (
            RISK_DIMENSIONS["supply_concentration"]["weight"] +
            RISK_DIMENSIONS["lead_time_risk"]["weight"] +
            RISK_DIMENSIONS["capacity_risk"]["weight"] +
            RISK_DIMENSIONS["network_resilience"]["weight"]
        )

        risk_scores.append({
            "node": node,
            "node_type": node_type,
            "supply_concentration_risk": round(float(supply_concentration), 4),
            "lead_time_risk": round(float(lead_time_risk), 4),
            "capacity_risk": round(float(capacity_risk), 4),
            "network_criticality": round(float(betweenness), 4),
            "composite_risk_score": round(float(composite_risk), 4),
            "risk_level": _classify_risk(composite_risk),
        })

    df = pd.DataFrame(risk_scores)
    df = df.sort_values("composite_risk_score", ascending=False).reset_index(drop=True)
    df["risk_rank"] = df.index + 1
    return df


def _classify_risk(score: float) -> str:
    """Classify risk score into categories."""
    if score >= RISK_THRESHOLDS["critical"]:
        return "CRITICAL"
    elif score >= RISK_THRESHOLDS["high"]:
        return "HIGH"
    elif score >= RISK_THRESHOLDS["medium"]:
        return "MEDIUM"
    else:
        return "LOW"


def generate_risk_alerts(network_risk_df: pd.DataFrame, demand_risk_df: pd.DataFrame) -> List[Dict]:
    """
    Generate prioritized risk alerts based on computed risk scores.
    
    Args:
        network_risk_df: Network risk DataFrame
        demand_risk_df: Demand volatility risk DataFrame
    
    Returns:
        List of alert dictionaries sorted by severity
    """
    alerts = []

    # Network risk alerts
    if not network_risk_df.empty:
        critical = network_risk_df[network_risk_df["risk_level"].isin(["CRITICAL", "HIGH"])]
        for _, row in critical.iterrows():
            alerts.append({
                "severity": "CRITICAL" if row["risk_level"] == "CRITICAL" else "HIGH",
                "entity": row["node"],
                "type": f"{row['node_type'].upper()} NODE",
                "message": (
                    f"Node '{row['node']}' has a risk score of {row['composite_risk_score']:.2%}. "
                    f"Supply concentration: {row['supply_concentration_risk']:.2%}, "
                    f"Lead time risk: {row['lead_time_risk']:.2%}"
                ),
                "score": row["composite_risk_score"],
            })

    # Demand risk alerts
    if not demand_risk_df.empty:
        high_demand_risk = demand_risk_df[demand_risk_df["risk_score"] > 0.3]
        for _, row in high_demand_risk.iterrows():
            alerts.append({
                "severity": "HIGH" if row["risk_score"] > 0.5 else "MEDIUM",
                "entity": row["entity"],
                "type": "DEMAND VOLATILITY",
                "message": (
                    f"Product '{row['entity']}' has high demand volatility "
                    f"(CV={row['cv']:.2f}, Risk score={row['risk_score']:.2%})"
                ),
                "score": row["risk_score"],
            })

    # Sort by severity and score
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    alerts.sort(key=lambda x: (severity_order.get(x["severity"], 4), -x["score"]))

    return alerts


def compute_overall_risk_index(network_risk_df: pd.DataFrame, demand_risk_df: pd.DataFrame) -> Dict:
    """
    Compute an overall supply chain risk index.
    
    Args:
        network_risk_df: Network risk DataFrame
        demand_risk_df: Demand volatility risk DataFrame
    
    Returns:
        Dictionary with overall risk index and breakdown
    """
    network_risk = network_risk_df["composite_risk_score"].mean() if not network_risk_df.empty else 0
    demand_risk = demand_risk_df["risk_score"].mean() if not demand_risk_df.empty else 0

    overall = network_risk * 0.6 + demand_risk * 0.4

    return {
        "overall_risk_index": round(float(overall), 4),
        "network_risk": round(float(network_risk), 4),
        "demand_risk": round(float(demand_risk), 4),
        "risk_level": _classify_risk(overall),
        "critical_nodes": int((network_risk_df["risk_level"] == "CRITICAL").sum()) if not network_risk_df.empty else 0,
        "high_risk_nodes": int((network_risk_df["risk_level"] == "HIGH").sum()) if not network_risk_df.empty else 0,
    }
