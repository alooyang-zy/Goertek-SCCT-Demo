"""
Inventory optimization module for the AI Supply Chain Control Tower.
Computes EOQ, safety stock, and reorder points using classical inventory theory.
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, Optional


def calculate_eoq(demand: float, ordering_cost: float, holding_cost: float) -> float:
    """
    Calculate Economic Order Quantity (EOQ).
    
    Formula: EOQ = sqrt((2 * D * S) / H)
    
    Args:
        demand: Annual demand (units)
        ordering_cost: Cost per order ($)
        holding_cost: Annual holding cost per unit ($/unit/year)
    
    Returns:
        EOQ in units
    """
    if holding_cost <= 0 or ordering_cost <= 0 or demand <= 0:
        return 0.0
    return float(np.sqrt((2 * demand * ordering_cost) / holding_cost))


def calculate_safety_stock(
    demand_std: float,
    lead_time: float,
    service_level: float = 0.95,
    lead_time_std: float = 0.0,
) -> float:
    """
    Calculate safety stock considering demand and lead time variability.
    
    Formula: SS = Z * sqrt(lead_time * demand_std^2 + demand^2 * lead_time_std^2)
    Simplified when lead_time_std = 0: SS = Z * demand_std * sqrt(lead_time)
    
    Args:
        demand_std: Standard deviation of daily demand
        lead_time: Average lead time in days
        service_level: Target service level (0 to 1)
        lead_time_std: Standard deviation of lead time (optional)
    
    Returns:
        Safety stock in units
    """
    if demand_std <= 0 or lead_time <= 0:
        return 0.0

    z_score = float(stats.norm.ppf(service_level))
    
    if lead_time_std > 0:
        avg_demand = demand_std  # Approximation when we only have std
        safety_stock = z_score * np.sqrt(
            lead_time * demand_std**2 + (avg_demand**2) * lead_time_std**2
        )
    else:
        safety_stock = z_score * demand_std * np.sqrt(lead_time)

    return max(0.0, float(safety_stock))


def calculate_reorder_point(
    avg_demand: float,
    lead_time: float,
    safety_stock: float,
) -> float:
    """
    Calculate reorder point.
    
    Formula: ROP = avg_demand * lead_time + safety_stock
    
    Args:
        avg_demand: Average daily demand (units/day)
        lead_time: Lead time in days
        safety_stock: Safety stock units
    
    Returns:
        Reorder point in units
    """
    return max(0.0, float(avg_demand * lead_time + safety_stock))


def compute_inventory_policy(
    inventory_df: pd.DataFrame,
    demand_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Compute full inventory policy for all products and warehouses.
    
    Args:
        inventory_df: Preprocessed inventory DataFrame
        demand_df: Preprocessed demand DataFrame
    
    Returns:
        DataFrame with optimized inventory policies
    """
    results = []

    # Compute demand stats per product
    demand_stats = demand_df.groupby("product_id")["sales"].agg(
        avg_daily_demand="mean",
        demand_std="std",
    ).reset_index()
    demand_stats["demand_std"] = demand_stats["demand_std"].fillna(0)

    for _, inv_row in inventory_df.iterrows():
        product_id = inv_row["product_id"]
        warehouse_id = inv_row["warehouse_id"]
        
        # Get demand stats for this product
        prod_stats = demand_stats[demand_stats["product_id"] == product_id]
        
        if prod_stats.empty:
            avg_daily = 50.0
            demand_std = 10.0
        else:
            avg_daily = float(prod_stats["avg_daily_demand"].iloc[0])
            demand_std = float(prod_stats["demand_std"].iloc[0])

        annual_demand = avg_daily * 365
        lead_time = float(inv_row["lead_time_days"])
        holding_cost = float(inv_row["holding_cost"])
        ordering_cost = float(inv_row["ordering_cost"])
        service_level = float(inv_row["service_level_target"])
        current_inventory = float(inv_row["current_inventory"])

        # Compute inventory policy
        eoq = calculate_eoq(annual_demand, ordering_cost, holding_cost)
        safety_stock = calculate_safety_stock(demand_std, lead_time, service_level)
        reorder_point = calculate_reorder_point(avg_daily, lead_time, safety_stock)

        # Compute annual cost metrics
        avg_cycle_stock = eoq / 2
        total_holding_cost = (avg_cycle_stock + safety_stock) * holding_cost
        orders_per_year = annual_demand / eoq if eoq > 0 else 0
        total_ordering_cost = orders_per_year * ordering_cost
        total_annual_cost = total_holding_cost + total_ordering_cost

        # Inventory status
        if current_inventory <= reorder_point:
            status = "REORDER NOW"
        elif current_inventory <= reorder_point * 1.5:
            status = "LOW"
        else:
            status = "OK"

        results.append({
            "product_id": product_id,
            "warehouse_id": warehouse_id,
            "avg_daily_demand": round(avg_daily, 2),
            "demand_std": round(demand_std, 2),
            "lead_time_days": int(lead_time),
            "service_level_target": service_level,
            "eoq": round(eoq, 0),
            "safety_stock": round(safety_stock, 0),
            "reorder_point": round(reorder_point, 0),
            "current_inventory": int(current_inventory),
            "holding_cost": holding_cost,
            "ordering_cost": ordering_cost,
            "total_annual_cost": round(total_annual_cost, 2),
            "status": status,
        })

    return pd.DataFrame(results)


def get_optimization_summary(policy_df: pd.DataFrame) -> Dict:
    """
    Generate summary statistics from optimization results.
    
    Args:
        policy_df: Inventory policy DataFrame
    
    Returns:
        Dictionary of summary statistics
    """
    if policy_df.empty:
        return {}

    return {
        "total_products": policy_df["product_id"].nunique(),
        "total_warehouses": policy_df["warehouse_id"].nunique(),
        "reorder_now_count": (policy_df["status"] == "REORDER NOW").sum(),
        "low_stock_count": (policy_df["status"] == "LOW").sum(),
        "total_annual_cost": round(policy_df["total_annual_cost"].sum(), 2),
        "avg_eoq": round(policy_df["eoq"].mean(), 0),
        "avg_safety_stock": round(policy_df["safety_stock"].mean(), 0),
        "avg_reorder_point": round(policy_df["reorder_point"].mean(), 0),
    }
