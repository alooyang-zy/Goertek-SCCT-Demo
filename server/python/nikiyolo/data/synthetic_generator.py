"""
Synthetic data generator for the AI Supply Chain Control Tower.
Generates realistic supply chain data for demonstration purposes.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta


def generate_demand_data(
    n_products: int = 5,
    n_days: int = 365,
    start_date: str = "2023-01-01",
    seed: int = 42
) -> pd.DataFrame:
    """
    Generate synthetic demand data with trend, seasonality, and noise.
    
    Args:
        n_products: Number of products to generate
        n_days: Number of historical days
        start_date: Start date string
        seed: Random seed for reproducibility
    
    Returns:
        DataFrame with columns: date, product_id, sales
    """
    np.random.seed(seed)
    records = []
    start = datetime.strptime(start_date, "%Y-%m-%d")

    for i in range(n_products):
        product_id = f"PROD-{i+1:03d}"
        base_demand = np.random.randint(80, 300)
        trend = np.random.uniform(-0.05, 0.15)

        for day in range(n_days):
            date = start + timedelta(days=day)
            # Seasonal component (weekly + yearly)
            weekly_seasonality = 1 + 0.15 * np.sin(2 * np.pi * day / 7)
            yearly_seasonality = 1 + 0.25 * np.sin(2 * np.pi * day / 365 - np.pi / 2)
            # Trend
            trend_factor = 1 + trend * (day / n_days)
            # Random noise
            noise = np.random.normal(1, 0.1)
            
            sales = max(0, int(base_demand * trend_factor * weekly_seasonality * yearly_seasonality * noise))
            records.append({"date": date.strftime("%Y-%m-%d"), "product_id": product_id, "sales": sales})

    return pd.DataFrame(records)


def generate_inventory_data(
    n_products: int = 5,
    n_warehouses: int = 3,
    seed: int = 42
) -> pd.DataFrame:
    """
    Generate synthetic inventory data.
    
    Args:
        n_products: Number of products
        n_warehouses: Number of warehouses
        seed: Random seed
    
    Returns:
        DataFrame with inventory configuration
    """
    np.random.seed(seed)
    records = []

    for i in range(n_products):
        product_id = f"PROD-{i+1:03d}"
        for j in range(n_warehouses):
            warehouse_id = f"WH-{j+1:03d}"
            records.append({
                "product_id": product_id,
                "warehouse_id": warehouse_id,
                "current_inventory": np.random.randint(100, 800),
                "holding_cost": round(np.random.uniform(1.0, 5.0), 2),
                "ordering_cost": np.random.randint(50, 200),
                "lead_time_days": np.random.randint(3, 15),
                "service_level_target": round(np.random.uniform(0.90, 0.99), 2),
            })

    return pd.DataFrame(records)


def generate_network_data(seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic supply chain network data.
    
    Args:
        seed: Random seed
    
    Returns:
        DataFrame with network edges
    """
    np.random.seed(seed)
    edges = [
        ("SUPPLIER-001", "FACTORY-001", 500, 5, 1000, "supplier"),
        ("SUPPLIER-002", "FACTORY-001", 600, 7, 800, "supplier"),
        ("SUPPLIER-003", "FACTORY-002", 450, 6, 900, "supplier"),
        ("FACTORY-001", "WH-001", 300, 3, 1200, "factory"),
        ("FACTORY-001", "WH-002", 350, 4, 1200, "factory"),
        ("FACTORY-002", "WH-002", 280, 3, 1000, "factory"),
        ("FACTORY-002", "WH-003", 320, 4, 1000, "factory"),
        ("WH-001", "RETAILER-001", 150, 2, 600, "warehouse"),
        ("WH-001", "RETAILER-002", 200, 3, 600, "warehouse"),
        ("WH-002", "RETAILER-003", 180, 2, 500, "warehouse"),
        ("WH-002", "RETAILER-004", 220, 3, 500, "warehouse"),
        ("WH-003", "RETAILER-005", 170, 2, 450, "warehouse"),
    ]

    noise_factor = np.random.uniform(0.9, 1.1, len(edges))
    records = []
    for idx, (src, dst, cost, lt, cap, ntype) in enumerate(edges):
        records.append({
            "source_node": src,
            "destination_node": dst,
            "transport_cost": int(cost * noise_factor[idx]),
            "lead_time_days": lt,
            "capacity": cap,
            "node_type": ntype,
        })

    return pd.DataFrame(records)
