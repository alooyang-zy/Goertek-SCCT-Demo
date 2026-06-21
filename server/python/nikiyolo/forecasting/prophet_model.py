"""
Demand forecasting model for the AI Supply Chain Control Tower.
Uses a Fourier-series decomposition approach (trend + weekly + yearly seasonality)
implemented with scikit-learn. Falls back gracefully without any binary dependencies.
"""

import pandas as pd
import numpy as np
from typing import Optional, Dict
import warnings

warnings.filterwarnings("ignore")


def _fourier_features(dates: pd.Series, period: float, n_terms: int) -> np.ndarray:
    """
    Generate Fourier series features for a given period.

    Args:
        dates: Series of datetime values
        period: Seasonality period in days
        n_terms: Number of Fourier terms (sin/cos pairs)

    Returns:
        2D numpy array of shape (n_dates, 2 * n_terms)
    """
    t = (dates - dates.iloc[0]).dt.days.values.astype(float)
    features = []
    for k in range(1, n_terms + 1):
        features.append(np.sin(2 * np.pi * k * t / period))
        features.append(np.cos(2 * np.pi * k * t / period))
    return np.column_stack(features)


def _build_feature_matrix(dates: pd.Series) -> np.ndarray:
    """
    Build the full feature matrix: trend + weekly + yearly Fourier features.

    Args:
        dates: Series of datetime values

    Returns:
        Feature matrix as numpy array
    """
    t = (dates - dates.iloc[0]).dt.days.values.astype(float)
    trend = t.reshape(-1, 1)

    weekly = _fourier_features(dates, period=7.0, n_terms=3)
    yearly = _fourier_features(dates, period=365.25, n_terms=5)

    return np.hstack([trend, weekly, yearly])


def train_and_forecast(
    df: pd.DataFrame,
    product_id: str,
    forecast_horizon: int = 90,
    seasonality_mode: str = "multiplicative",
) -> Optional[pd.DataFrame]:
    """
    Train a decomposition forecasting model and generate future predictions.

    Args:
        df: Preprocessed demand DataFrame with date, product_id, sales columns
        product_id: Product to forecast
        forecast_horizon: Number of days to forecast ahead
        seasonality_mode: Ignored (kept for API compatibility)

    Returns:
        DataFrame with forecast results or None if insufficient data
    """
    from sklearn.linear_model import Ridge
    from sklearn.preprocessing import StandardScaler

    product_df = df[df["product_id"] == product_id][["date", "sales"]].copy()
    product_df["date"] = pd.to_datetime(product_df["date"])
    product_df = product_df.sort_values("date").drop_duplicates(subset="date").reset_index(drop=True)

    if len(product_df) < 30:
        return None

    X_hist = _build_feature_matrix(product_df["date"])
    y_hist = product_df["sales"].values.astype(float)

    scaler_X = StandardScaler()
    X_scaled = scaler_X.fit_transform(X_hist)

    model = Ridge(alpha=1.0)
    model.fit(X_scaled, y_hist)

    # Compute in-sample residuals std for confidence intervals
    y_pred_hist = model.predict(X_scaled)
    residuals_std = float(np.std(y_hist - y_pred_hist))

    # Build future date range
    last_date = product_df["date"].iloc[-1]
    future_dates = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=forecast_horizon,
        freq="D",
    )
    all_dates = pd.concat([
        product_df["date"],
        pd.Series(future_dates, name="date"),
    ], ignore_index=True)

    # Regenerate features anchored to the same origin
    X_all = _build_feature_matrix(all_dates)
    X_all_scaled = scaler_X.transform(X_all)
    y_all_pred = model.predict(X_all_scaled)

    z95 = 1.96
    lower = y_all_pred - z95 * residuals_std
    upper = y_all_pred + z95 * residuals_std

    result = pd.DataFrame({
        "date": all_dates.values,
        "product_id": product_id,
        "forecast_demand": np.clip(y_all_pred, 0, None),
        "lower_bound": np.clip(lower, 0, None),
        "upper_bound": np.clip(upper, 0, None),
        "is_forecast": [False] * len(product_df) + [True] * forecast_horizon,
    })

    return result


def compute_forecast_accuracy(
    historical: pd.DataFrame,
    forecast: pd.DataFrame,
    product_id: str,
) -> Dict[str, float]:
    """
    Compute forecast accuracy metrics using historical vs in-sample predictions.

    Args:
        historical: Historical demand DataFrame
        forecast: Forecast output DataFrame
        product_id: Product ID to evaluate

    Returns:
        Dictionary with MAE, RMSE, MAPE metrics
    """
    hist = historical[historical["product_id"] == product_id][["date", "sales"]].copy()
    hist["date"] = pd.to_datetime(hist["date"])

    fore = forecast[~forecast["is_forecast"]][["date", "forecast_demand"]].copy()
    fore["date"] = pd.to_datetime(fore["date"])

    merged = hist.merge(fore, on="date", how="inner")
    if merged.empty:
        return {"MAE": None, "RMSE": None, "MAPE": None}

    actual = merged["sales"].values
    predicted = merged["forecast_demand"].values

    mae = float(np.mean(np.abs(actual - predicted)))
    rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))

    nonzero_mask = actual != 0
    if nonzero_mask.sum() > 0:
        mape = float(np.mean(np.abs(
            (actual[nonzero_mask] - predicted[nonzero_mask]) / actual[nonzero_mask]
        )) * 100)
    else:
        mape = None

    return {
        "MAE": round(mae, 2),
        "RMSE": round(rmse, 2),
        "MAPE": round(mape, 2) if mape is not None else None,
    }
