"""
Disruption simulation module for the AI Supply Chain Control Tower.
Simulates supply chain disruptions using Monte Carlo methods.
"""

import pandas as pd
import numpy as np
import networkx as nx
from typing import Dict, List, Tuple, Optional
import copy


DISRUPTION_TYPES = {
    "supplier_shutdown": {
        "description": "Complete supplier shutdown",
        "capacity_reduction": 1.0,
        "lead_time_increase": 0,
        "affects": "supplier",
    },
    "factory_capacity_loss": {
        "description": "Factory capacity loss (50%)",
        "capacity_reduction": 0.5,
        "lead_time_increase": 5,
        "affects": "factory",
    },
    "transport_delay": {
        "description": "Transportation delay (+7 days)",
        "capacity_reduction": 0,
        "lead_time_increase": 7,
        "affects": "edge",
    },
    "warehouse_congestion": {
        "description": "Warehouse congestion (30% capacity reduction)",
        "capacity_reduction": 0.3,
        "lead_time_increase": 3,
        "affects": "warehouse",
    },
}


def simulate_disruption(
    G: nx.DiGraph,
    disruption_type: str,
    affected_node: Optional[str] = None,
    iterations: int = 100,
    seed: int = 42,
) -> Dict:
    """
    Run a Monte Carlo disruption simulation.
    
    Args:
        G: Supply chain directed graph
        disruption_type: Type of disruption from DISRUPTION_TYPES
        affected_node: Specific node/edge to disrupt (None = random)
        iterations: Number of Monte Carlo iterations
        seed: Random seed
    
    Returns:
        Dictionary with simulation results and impact metrics
    """
    np.random.seed(seed)
    
    if disruption_type not in DISRUPTION_TYPES:
        raise ValueError(f"Unknown disruption type: {disruption_type}")

    disruption_config = DISRUPTION_TYPES[disruption_type]
    
    service_levels = []
    lead_time_increases = []
    stockout_probs = []
    affected_nodes_list = []

    baseline_metrics = _compute_baseline_metrics(G)

    for iteration in range(iterations):
        G_sim = copy.deepcopy(G)
        
        # Add stochastic variation to disruption magnitude
        severity = np.random.beta(5, 2)  # Skewed toward higher severity
        
        # Select affected node/edge
        affected = _select_affected_entity(G_sim, disruption_config["affects"], affected_node, seed + iteration)
        if affected is None:
            continue

        affected_nodes_list.append(affected)
        
        # Apply disruption
        _apply_disruption(G_sim, affected, disruption_config, severity)
        
        # Propagate effects through the network
        impact = _propagate_disruption(G_sim, affected, baseline_metrics)
        
        service_levels.append(impact["service_level"])
        lead_time_increases.append(impact["lead_time_increase"])
        stockout_probs.append(impact["stockout_probability"])

    if not service_levels:
        return {"error": "No valid simulation iterations"}

    results = {
        "disruption_type": disruption_type,
        "description": disruption_config["description"],
        "iterations": len(service_levels),
        "affected_entity": affected_node or "random",
        "metrics": {
            "service_level": {
                "mean": round(float(np.mean(service_levels)), 4),
                "std": round(float(np.std(service_levels)), 4),
                "p10": round(float(np.percentile(service_levels, 10)), 4),
                "p90": round(float(np.percentile(service_levels, 90)), 4),
            },
            "lead_time_increase_days": {
                "mean": round(float(np.mean(lead_time_increases)), 2),
                "std": round(float(np.std(lead_time_increases)), 2),
                "p90": round(float(np.percentile(lead_time_increases, 90)), 2),
            },
            "stockout_probability": {
                "mean": round(float(np.mean(stockout_probs)), 4),
                "std": round(float(np.std(stockout_probs)), 4),
                "worst_case": round(float(np.percentile(stockout_probs, 90)), 4),
            },
        },
        "raw_data": {
            "service_levels": service_levels,
            "lead_time_increases": lead_time_increases,
            "stockout_probs": stockout_probs,
        },
        "baseline": baseline_metrics,
    }

    return results


def _compute_baseline_metrics(G: nx.DiGraph) -> Dict:
    """Compute baseline network metrics before disruption."""
    if G.number_of_edges() == 0:
        return {"avg_lead_time": 0, "total_capacity": 1, "avg_service_level": 0.95}

    lead_times = [G[u][v]["lead_time"] for u, v in G.edges()]
    capacities = [G[u][v]["capacity"] for u, v in G.edges()]

    return {
        "avg_lead_time": float(np.mean(lead_times)),
        "total_capacity": float(np.sum(capacities)),
        "avg_service_level": 0.95,
    }


def _select_affected_entity(
    G: nx.DiGraph,
    affects: str,
    specified_node: Optional[str],
    seed: int,
) -> Optional[str]:
    """Select the entity to be disrupted."""
    np.random.seed(seed)
    
    if specified_node and specified_node in G.nodes():
        return specified_node

    if affects == "edge":
        edges = list(G.edges())
        if not edges:
            return None
        idx = np.random.randint(0, len(edges))
        return f"{edges[idx][0]}_{edges[idx][1]}"
    else:
        candidates = [
            n for n, d in G.nodes(data=True)
            if d.get("node_type", "") == affects
        ]
        if not candidates:
            candidates = list(G.nodes())
        if not candidates:
            return None
        return candidates[np.random.randint(0, len(candidates))]


def _apply_disruption(
    G: nx.DiGraph,
    affected: str,
    config: Dict,
    severity: float,
) -> None:
    """Apply disruption effects to the graph."""
    capacity_reduction = config["capacity_reduction"] * severity
    lead_time_increase = config["lead_time_increase"] * severity

    if "_" in affected and affected not in G.nodes():
        # Edge disruption
        parts = affected.split("_", 1)
        if len(parts) == 2 and G.has_edge(parts[0], parts[1]):
            G[parts[0]][parts[1]]["lead_time"] += lead_time_increase
            G[parts[0]][parts[1]]["capacity"] *= (1 - capacity_reduction)
    elif affected in G.nodes():
        # Node disruption - affect all outgoing edges
        for u, v in G.out_edges(affected):
            G[u][v]["capacity"] *= (1 - capacity_reduction)
            G[u][v]["lead_time"] += lead_time_increase


def _propagate_disruption(
    G: nx.DiGraph,
    affected: str,
    baseline: Dict,
) -> Dict:
    """Propagate disruption effects and compute impact metrics."""
    if G.number_of_edges() == 0:
        return {"service_level": 0.95, "lead_time_increase": 0, "stockout_probability": 0.05}

    current_lead_times = [G[u][v]["lead_time"] for u, v in G.edges()]
    current_capacities = [G[u][v]["capacity"] for u, v in G.edges()]

    avg_lead_time = float(np.mean(current_lead_times))
    total_capacity = float(np.sum(current_capacities))

    capacity_ratio = total_capacity / max(baseline["total_capacity"], 1)
    lead_time_increase = max(0, avg_lead_time - baseline["avg_lead_time"])

    # Service level decreases with capacity reduction and lead time increase
    service_level_degradation = (1 - capacity_ratio) * 0.3 + (lead_time_increase / 30) * 0.2
    service_level = max(0.3, baseline["avg_service_level"] - service_level_degradation)
    service_level = min(1.0, service_level + np.random.normal(0, 0.02))

    stockout_probability = max(0, 1 - service_level) * (1 + lead_time_increase / 20)
    stockout_probability = min(1.0, stockout_probability)

    return {
        "service_level": float(service_level),
        "lead_time_increase": float(lead_time_increase),
        "stockout_probability": float(stockout_probability),
    }


def run_scenario_comparison(
    G: nx.DiGraph,
    iterations: int = 100,
) -> pd.DataFrame:
    """
    Run all disruption scenarios and compare results.
    
    Args:
        G: Supply chain directed graph
        iterations: Iterations per scenario
    
    Returns:
        DataFrame with comparative scenario results
    """
    rows = []
    for disruption_type in DISRUPTION_TYPES:
        result = simulate_disruption(G, disruption_type, iterations=iterations)
        if "error" in result:
            continue
        rows.append({
            "scenario": disruption_type,
            "description": result["description"],
            "avg_service_level": result["metrics"]["service_level"]["mean"],
            "avg_lead_time_increase": result["metrics"]["lead_time_increase_days"]["mean"],
            "stockout_probability": result["metrics"]["stockout_probability"]["mean"],
            "worst_case_stockout": result["metrics"]["stockout_probability"]["worst_case"],
        })

    return pd.DataFrame(rows)
