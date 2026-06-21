"""
Data preprocessing module for the AI Supply Chain Control Tower.
Handles cleaning, type conversion, aggregation, and feature engineering.
"""

import pandas as pd
import numpy as np


def preprocess_demand_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess demand data: convert dates, fill missing values, aggregate.
    
    Args:
        df: Raw demand DataFrame
    
    Returns:
        Preprocessed demand DataFrame
    """
    df = df.copy()
    df.columns = df.columns.str.lower().str.strip()

    # Convert date to datetime
    df["date"] = pd.to_datetime(df["date"])

    # Convert sales to numeric, coerce errors to NaN
    df["sales"] = pd.to_numeric(df["sales"], errors="coerce")

    # Fill missing demand values with median per product
    df["sales"] = df.groupby("product_id")["sales"].transform(
        lambda x: x.fillna(x.median())
    )

    # Clip negative values to zero
    df["sales"] = df["sales"].clip(lower=0)

    # Aggregate by product and date (sum in case of duplicates)
    df = df.groupby(["date", "product_id"], as_index=False)["sales"].sum()

    # Sort by product and date
    df = df.sort_values(["product_id", "date"]).reset_index(drop=True)

    # Add day of week and month features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year

    return df


def preprocess_inventory_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess inventory data: compute derived metrics.
    
    Args:
        df: Raw inventory DataFrame
    
    Returns:
        Preprocessed inventory DataFrame with derived metrics
    """
    df = df.copy()
    df.columns = df.columns.str.lower().str.strip()

    # Convert numeric columns
    numeric_cols = ["current_inventory", "holding_cost", "ordering_cost", "lead_time_days", "service_level_target"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Fill missing values with column medians
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())

    # Clip invalid values
    df["current_inventory"] = df["current_inventory"].clip(lower=0)
    df["holding_cost"] = df["holding_cost"].clip(lower=0.01)
    df["ordering_cost"] = df["ordering_cost"].clip(lower=0.01)
    df["lead_time_days"] = df["lead_time_days"].clip(lower=1)
    df["service_level_target"] = df["service_level_target"].clip(lower=0.5, upper=0.9999)

    return df


def preprocess_network_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess supply chain network data: standardize node types, clean attributes.
    
    Args:
        df: Raw network DataFrame
    
    Returns:
        Preprocessed network DataFrame
    """
    df = df.copy()
    df.columns = df.columns.str.lower().str.strip()

    # Standardize node types to lowercase
    df["node_type"] = df["node_type"].str.lower().str.strip()

    # Convert numeric columns
    numeric_cols = ["transport_cost", "lead_time_days", "capacity"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Fill missing with medians
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())

    # Clip invalid values
    df["transport_cost"] = df["transport_cost"].clip(lower=0)
    df["lead_time_days"] = df["lead_time_days"].clip(lower=1)
    df["capacity"] = df["capacity"].clip(lower=1)

    # Strip whitespace from node names
    df["source_node"] = df["source_node"].str.strip()
    df["destination_node"] = df["destination_node"].str.strip()

    return df
