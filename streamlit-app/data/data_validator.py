"""
Data validation module for the AI Supply Chain Control Tower.
Validates schema, types, and logical correctness of uploaded datasets.
"""

import pandas as pd
import numpy as np
from typing import Tuple, List


DEMAND_REQUIRED_COLUMNS = {"date", "product_id", "sales"}
INVENTORY_REQUIRED_COLUMNS = {
    "product_id", "warehouse_id", "current_inventory",
    "holding_cost", "ordering_cost", "lead_time_days", "service_level_target"
}
NETWORK_REQUIRED_COLUMNS = {
    "source_node", "destination_node", "transport_cost",
    "lead_time_days", "capacity", "node_type"
}
VALID_NODE_TYPES = {"supplier", "factory", "warehouse", "retailer"}


def validate_demand_data(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Validate demand dataset for correct schema, types, and logic.
    
    Args:
        df: Input demand DataFrame
    
    Returns:
        Tuple of (is_valid, list_of_messages)
    """
    messages = []
    is_valid = True

    # Column check
    missing_cols = DEMAND_REQUIRED_COLUMNS - set(df.columns.str.lower())
    if missing_cols:
        messages.append(f"Missing columns: {missing_cols}")
        is_valid = False
        return is_valid, messages

    df = df.copy()
    df.columns = df.columns.str.lower()

    # Date parsing
    try:
        pd.to_datetime(df["date"])
    except Exception:
        messages.append("Column 'date' cannot be parsed as datetime.")
        is_valid = False

    # Sales type and values
    if not pd.api.types.is_numeric_dtype(df["sales"]):
        try:
            df["sales"] = pd.to_numeric(df["sales"])
        except ValueError:
            messages.append("Column 'sales' must be numeric.")
            is_valid = False

    if is_valid:
        if (df["sales"] < 0).any():
            messages.append("Column 'sales' contains negative values.")
            is_valid = False

    # Missing values
    null_counts = df[["date", "product_id", "sales"]].isnull().sum()
    for col, cnt in null_counts.items():
        if cnt > 0:
            messages.append(f"Column '{col}' has {cnt} missing values.")
            is_valid = False

    # Product IDs
    if df["product_id"].nunique() == 0:
        messages.append("No products found in dataset.")
        is_valid = False

    if is_valid:
        messages.append(f"Demand data valid: {len(df)} rows, {df['product_id'].nunique()} products.")

    return is_valid, messages


def validate_inventory_data(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Validate inventory dataset.
    
    Args:
        df: Input inventory DataFrame
    
    Returns:
        Tuple of (is_valid, list_of_messages)
    """
    messages = []
    is_valid = True

    missing_cols = INVENTORY_REQUIRED_COLUMNS - set(df.columns.str.lower())
    if missing_cols:
        messages.append(f"Missing columns: {missing_cols}")
        is_valid = False
        return is_valid, messages

    df = df.copy()
    df.columns = df.columns.str.lower()

    numeric_cols = ["current_inventory", "holding_cost", "ordering_cost", "lead_time_days", "service_level_target"]
    for col in numeric_cols:
        if not pd.api.types.is_numeric_dtype(df[col]):
            try:
                df[col] = pd.to_numeric(df[col])
            except ValueError:
                messages.append(f"Column '{col}' must be numeric.")
                is_valid = False

    if is_valid:
        if (df["current_inventory"] < 0).any():
            messages.append("'current_inventory' contains negative values.")
            is_valid = False
        if (df["holding_cost"] <= 0).any():
            messages.append("'holding_cost' must be positive.")
            is_valid = False
        if (df["ordering_cost"] <= 0).any():
            messages.append("'ordering_cost' must be positive.")
            is_valid = False
        if (df["lead_time_days"] <= 0).any():
            messages.append("'lead_time_days' must be positive.")
            is_valid = False
        if ((df["service_level_target"] < 0) | (df["service_level_target"] > 1)).any():
            messages.append("'service_level_target' must be between 0 and 1.")
            is_valid = False

    null_counts = df[list(INVENTORY_REQUIRED_COLUMNS)].isnull().sum()
    for col, cnt in null_counts.items():
        if cnt > 0:
            messages.append(f"Column '{col}' has {cnt} missing values.")
            is_valid = False

    if is_valid:
        messages.append(f"Inventory data valid: {len(df)} rows, {df['product_id'].nunique()} products, {df['warehouse_id'].nunique()} warehouses.")

    return is_valid, messages


def validate_network_data(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Validate supply chain network dataset.
    
    Args:
        df: Input network DataFrame
    
    Returns:
        Tuple of (is_valid, list_of_messages)
    """
    messages = []
    is_valid = True

    missing_cols = NETWORK_REQUIRED_COLUMNS - set(df.columns.str.lower())
    if missing_cols:
        messages.append(f"Missing columns: {missing_cols}")
        is_valid = False
        return is_valid, messages

    df = df.copy()
    df.columns = df.columns.str.lower()

    numeric_cols = ["transport_cost", "lead_time_days", "capacity"]
    for col in numeric_cols:
        if not pd.api.types.is_numeric_dtype(df[col]):
            try:
                df[col] = pd.to_numeric(df[col])
            except ValueError:
                messages.append(f"Column '{col}' must be numeric.")
                is_valid = False

    if is_valid:
        if (df["transport_cost"] < 0).any():
            messages.append("'transport_cost' contains negative values.")
            is_valid = False
        if (df["lead_time_days"] <= 0).any():
            messages.append("'lead_time_days' must be positive.")
            is_valid = False
        if (df["capacity"] <= 0).any():
            messages.append("'capacity' must be positive.")
            is_valid = False

    invalid_types = set(df["node_type"].str.lower().unique()) - VALID_NODE_TYPES
    if invalid_types:
        messages.append(f"Invalid node types: {invalid_types}. Valid types: {VALID_NODE_TYPES}")
        is_valid = False

    null_counts = df[list(NETWORK_REQUIRED_COLUMNS)].isnull().sum()
    for col, cnt in null_counts.items():
        if cnt > 0:
            messages.append(f"Column '{col}' has {cnt} missing values.")
            is_valid = False

    if is_valid:
        n_nodes = len(set(df["source_node"]) | set(df["destination_node"]))
        messages.append(f"Network data valid: {len(df)} edges, {n_nodes} unique nodes.")

    return is_valid, messages
