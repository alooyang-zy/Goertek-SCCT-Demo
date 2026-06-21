"""
Supply Chain Digital Twin module.
Creates and manages a NetworkX directed graph representing the supply chain network.
"""

import networkx as nx
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple


NODE_TYPE_ORDER = ["supplier", "factory", "warehouse", "retailer"]
NODE_COLORS = {
    "supplier": "#2196F3",
    "factory": "#FF9800",
    "warehouse": "#4CAF50",
    "retailer": "#9C27B0",
}


def build_supply_chain_graph(network_df: pd.DataFrame) -> nx.DiGraph:
    """
    Build a directed supply chain graph from network data.
    
    Nodes represent supply chain entities (supplier, factory, warehouse, retailer).
    Edges represent transportation routes with attributes.
    
    Args:
        network_df: Preprocessed network DataFrame
    
    Returns:
        Directed NetworkX graph
    """
    G = nx.DiGraph()

    # Add all unique nodes with their types
    all_nodes = {}
    for _, row in network_df.iterrows():
        src = row["source_node"]
        dst = row["destination_node"]
        ntype = row["node_type"].lower()

        # Determine destination node type based on position in supply chain
        dst_type = _infer_destination_type(dst, ntype)

        if src not in all_nodes:
            all_nodes[src] = ntype
        if dst not in all_nodes:
            all_nodes[dst] = dst_type

    for node, ntype in all_nodes.items():
        G.add_node(node, node_type=ntype, color=NODE_COLORS.get(ntype, "#607D8B"))

    # Add edges with attributes
    for _, row in network_df.iterrows():
        G.add_edge(
            row["source_node"],
            row["destination_node"],
            transport_cost=float(row["transport_cost"]),
            lead_time=int(row["lead_time_days"]),
            capacity=int(row["capacity"]),
        )

    return G


def _infer_destination_type(node_name: str, source_type: str) -> str:
    """Infer node type for destination based on naming conventions."""
    name_lower = node_name.lower()
    if "supplier" in name_lower:
        return "supplier"
    elif "factory" in name_lower or "plant" in name_lower:
        return "factory"
    elif "wh" in name_lower or "warehouse" in name_lower or "dc" in name_lower:
        return "warehouse"
    elif "retailer" in name_lower or "store" in name_lower or "shop" in name_lower:
        return "retailer"
    # Infer from source type (next level)
    type_idx = NODE_TYPE_ORDER.index(source_type) if source_type in NODE_TYPE_ORDER else 0
    next_idx = min(type_idx + 1, len(NODE_TYPE_ORDER) - 1)
    return NODE_TYPE_ORDER[next_idx]


def get_graph_metrics(G: nx.DiGraph) -> Dict:
    """
    Compute key graph metrics for the supply chain network.
    
    Args:
        G: Supply chain directed graph
    
    Returns:
        Dictionary of network metrics
    """
    metrics = {
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
        "avg_transport_cost": 0,
        "avg_lead_time": 0,
        "total_capacity": 0,
        "nodes_by_type": {},
        "critical_paths": [],
    }

    if G.number_of_edges() > 0:
        costs = [G[u][v]["transport_cost"] for u, v in G.edges()]
        lead_times = [G[u][v]["lead_time"] for u, v in G.edges()]
        capacities = [G[u][v]["capacity"] for u, v in G.edges()]
        metrics["avg_transport_cost"] = round(np.mean(costs), 2)
        metrics["avg_lead_time"] = round(np.mean(lead_times), 2)
        metrics["total_capacity"] = int(np.sum(capacities))

    # Count by node type
    for node, data in G.nodes(data=True):
        ntype = data.get("node_type", "unknown")
        metrics["nodes_by_type"][ntype] = metrics["nodes_by_type"].get(ntype, 0) + 1

    # Find critical paths (longest paths from suppliers to retailers)
    suppliers = [n for n, d in G.nodes(data=True) if d.get("node_type") == "supplier"]
    retailers = [n for n, d in G.nodes(data=True) if d.get("node_type") == "retailer"]

    for src in suppliers[:2]:
        for dst in retailers[:2]:
            try:
                path = nx.shortest_path(G, source=src, target=dst)
                total_lead_time = sum(G[path[i]][path[i+1]]["lead_time"] for i in range(len(path)-1))
                metrics["critical_paths"].append({
                    "path": " -> ".join(path),
                    "hops": len(path) - 1,
                    "total_lead_time": total_lead_time,
                })
            except nx.NetworkXNoPath:
                pass

    return metrics


def get_node_positions(G: nx.DiGraph) -> Dict[str, Tuple[float, float]]:
    """
    Compute hierarchical node positions for visualization.
    
    Args:
        G: Supply chain directed graph
    
    Returns:
        Dictionary mapping node names to (x, y) positions
    """
    positions = {}
    
    nodes_by_type = {t: [] for t in NODE_TYPE_ORDER}
    for node, data in G.nodes(data=True):
        ntype = data.get("node_type", "warehouse")
        if ntype in nodes_by_type:
            nodes_by_type[ntype].append(node)
        else:
            nodes_by_type["warehouse"].append(node)

    x_positions = {t: i * 3 for i, t in enumerate(NODE_TYPE_ORDER)}
    
    for ntype, nodes in nodes_by_type.items():
        x = x_positions[ntype]
        n = len(nodes)
        for j, node in enumerate(nodes):
            y = (j - (n - 1) / 2) * 2
            positions[node] = (x, y)

    return positions
