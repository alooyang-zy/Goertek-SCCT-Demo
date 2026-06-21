"""
Demand forecasting pipeline for the AI Supply Chain Control Tower.
Orchestrates model training and forecasting across all products.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple

from nikiyolo.data.data_preprocessor import preprocess_demand_data
from nikiyolo.forecasting.prophet_model import train_and_forecast, compute_forecast_accuracy


def run_forecast_pipeline(
    demand_df: pd.DataFrame,
    forecast_horizon: int = 90,
    products: Optional[List[str]] = None,
) -> Tuple[pd.DataFrame, Dict[str, Dict]]:
    """
    Run the full demand forecast pipeline for all (or selected) products.
    
    Args:
        demand_df: Raw or preprocessed demand DataFrame
        forecast_horizon: Days ahead to forecast
        products: Optional list of product IDs to forecast (None = all)
    
    Returns:
        Tuple of (all_forecasts_df, accuracy_metrics_dict)
    """
    df = preprocess_demand_data(demand_df)
    all_products = products if products else df["product_id"].unique().tolist()
    
    all_forecasts = []
    accuracy_metrics = {}

    for i, product_id in enumerate(all_products):
        try:
            forecast = train_and_forecast(
                df=df,
                product_id=product_id,
                forecast_horizon=forecast_horizon,
            )

            if forecast is not None:
                all_forecasts.append(forecast)
                metrics = compute_forecast_accuracy(df, forecast, product_id)
                accuracy_metrics[product_id] = metrics
        except Exception as e:
            print(f"[Forecast] Failed for {product_id}: {e}")

    if all_forecasts:
        combined = pd.concat(all_forecasts, ignore_index=True)
        return combined, accuracy_metrics
    else:
        return pd.DataFrame(), {}


def get_forecast_summary(forecast_df: pd.DataFrame) -> pd.DataFrame:
    """
    Summarize forecast results by product.
    
    Args:
        forecast_df: Combined forecasts DataFrame
    
    Returns:
        Summary DataFrame with aggregated statistics
    """
    if forecast_df.empty:
        return pd.DataFrame()

    future_only = forecast_df[forecast_df["is_forecast"]]
    
    summary = future_only.groupby("product_id").agg(
        total_forecast_demand=("forecast_demand", "sum"),
        avg_daily_demand=("forecast_demand", "mean"),
        min_daily_demand=("forecast_demand", "min"),
        max_daily_demand=("forecast_demand", "max"),
        forecast_days=("forecast_demand", "count"),
    ).round(2).reset_index()

    return summary
